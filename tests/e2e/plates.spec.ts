import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const PLATES = [
  ['plate-01', '01-question-sheet'],
  ['plate-02', '02-one-useful-host'],
  ['plate-03', '03-trust-boundaries'],
  ['plate-04', '04-recovery-chain'],
  ['plate-05', '05-bounded-automation'],
] as const

function collectPageErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  return errors
}

async function bodyOverflowX(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
}

test('landing renders the unified guide without console errors', async ({ page }) => {
  const errors = collectPageErrors(page)
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'A working manual for a useful homelab.' })).toBeVisible()
  await expect(page.getByRole('link', { name: './guide' })).toHaveClass(/is-active/)
  expect(errors).toEqual([])
})

test('unknown routes return a useful 404', async ({ page }) => {
  const response = await page.goto('/route-that-does-not-exist/')
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: 'That page is not in the blueprint.' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'return to the guide' })).toBeVisible()
})

test('every chapter is static, canonical, and linked to its neighbors', async ({ page }) => {
  await page.goto('/chapters/04-networking/')
  await expect(page.getByRole('heading', { name: 'Design networking and access' })).toBeVisible()
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://homelab.codes/guide/chapters/04-networking/',
  )
  await expect(page.getByRole('link', { name: 'Protect storage and prove recovery', exact: true })).toBeVisible()
  await expect(page.getByRole('img', { name: /top-down plan of three rooms/i })).toBeVisible()
})

test('builder produces a permalink and copies a Markdown plan', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/builder/')
  await page.getByRole('radio', { name: /Mixed VMs/ }).check()
  await page.getByRole('radio', { name: /No\. Recovery/ }).check()
  await expect(page.getByRole('heading', { name: 'Proxmox VE + small Linux guests' })).toBeVisible()
  await expect(page).toHaveURL(/workload=mixed/)
  await expect(page).toHaveURL(/data=valuable/)
  await page.getByRole('button', { name: 'Copy as Markdown' }).click()
  await expect(page.getByRole('button', { name: 'Copied as Markdown' })).toBeVisible()
})

test.describe('interactive plates', () => {
  test('all five direct routes hydrate the matching plate', async ({ page }) => {
    for (const [id, slug] of PLATES) {
      await page.goto(`/plates/${slug}/`)
      await expect(page.locator(`#tab-${id}`)).toHaveAttribute('aria-selected', 'true')
      await expect(page.locator(`[data-plate="${id}"]`).first()).toHaveAttribute('data-theme', 'dark')
    }
  })

  test('failure selection changes plate state', async ({ page }) => {
    await page.goto('/plates/02-one-useful-host/')
    await page.getByLabel(/simulate a failure/i).selectOption('host')
    await expect(
      page.getByTestId('plate-canvas-plate-02').locator('[data-plate="plate-02"]'),
    ).toHaveAttribute('data-failure', 'host')
    await expect(page.locator('.plate-failure-lesson')).toContainText(/lives outside this host/i)
  })

  test('keyboard arrow keys walk tabs and update the shareable URL', async ({ page }) => {
    await page.goto('/plates/01-question-sheet/')
    await page.locator('#tab-plate-01').focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.locator('#tab-plate-02')).toHaveAttribute('aria-selected', 'true')
    await expect(page).toHaveURL(/02-one-useful-host/)
    await page.keyboard.press('End')
    await expect(page.locator('#tab-plate-05')).toHaveAttribute('aria-selected', 'true')
  })

  test('reduced motion keeps the selected plate usable', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/plates/04-recovery-chain/')
    await expect(page.locator('.fade-in').first()).toHaveCSS('animation-name', 'none')
    await expect(page.locator('.fade-in').first()).toHaveCSS('opacity', '1')
    expect(await bodyOverflowX(page)).toBeLessThanOrEqual(1)
  })
})

test('mobile reader replaces the unreadably small SVG', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-380', 'mobile project only')
  await page.goto('/plates/02-one-useful-host/')
  await expect(page.getByTestId('plate-reader-plate-02')).toBeVisible()
  await expect(page.getByTestId('plate-canvas-plate-02')).toBeHidden()
  expect(await bodyOverflowX(page)).toBeLessThanOrEqual(1)
})

test('representative pages have no serious accessibility findings', async ({ page }) => {
  for (const route of ['/', '/chapters/05-storage-backup/', '/builder/']) {
    await page.goto(route)
    const results = await new AxeBuilder({ page }).analyze()
    const serious = results.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical',
    )
    expect(serious, `${route}: ${serious.map((item) => item.id).join(', ')}`).toEqual([])
  }
})
