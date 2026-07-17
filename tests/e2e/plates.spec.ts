import { expect, test, type Page } from '@playwright/test'

function collectPageErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  return errors
}

const PLATE_IDS = ['plate-01', 'plate-02', 'plate-03', 'plate-04', 'plate-05'] as const

async function selectPlate(page: Page, id: (typeof PLATE_IDS)[number]) {
  await page.locator(`#tab-${id}`).click()
  await expect(page.locator(`#tab-${id}`)).toHaveAttribute('aria-selected', 'true')
}

async function pxSize(page: Page, selector: string): Promise<number> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel)
    if (!el) return 0
    return parseFloat(getComputedStyle(el).fontSize)
  }, selector)
}

async function bodyOverflowX(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
}

test.describe('plate stage', () => {
  test('renders hero and all five plates without console errors', async ({ page }) => {
    const errors = collectPageErrors(page)
    await page.goto('/')

    await expect(
      page.getByRole('heading', { name: /A working\s+drawing set/ }),
    ).toBeVisible()

    for (const id of PLATE_IDS) {
      await selectPlate(page, id)
    }

    expect(errors, `page errors: ${errors.join(', ')}`).toEqual([])
  })

  test('failure toggle changes plate state', async ({ page }) => {
    await page.goto('/')
    await selectPlate(page, 'plate-02')
    await page.getByLabel(/simulate a failure/i).selectOption('host')
    await expect(page.locator('[data-plate="plate-02"]').first()).toHaveAttribute(
      'data-failure',
      'host',
    )
    await expect(page.locator('.plate-failure-lesson')).toContainText(/lives outside this host/i)
  })

  test('keyboard arrow keys walk the plate tabs', async ({ page }) => {
    await page.goto('/')
    await page.locator('#tab-plate-01').focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.locator('#tab-plate-02')).toHaveAttribute('aria-selected', 'true')
    await page.keyboard.press('End')
    await expect(page.locator('#tab-plate-05')).toHaveAttribute('aria-selected', 'true')
    await page.keyboard.press('Home')
    await expect(page.locator('#tab-plate-01')).toHaveAttribute('aria-selected', 'true')
  })

  test('the builder produces a stable shareable URL', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/')

    await page.getByRole('radio', { name: /Mixed VMs/ }).check()
    await page.getByRole('radio', { name: /No\. Recovery/ }).check()

    await expect(page.getByRole('heading', { name: 'Proxmox VE + small Linux guests' })).toBeVisible()
    await expect(page).toHaveURL(/workload=mixed/)
    await expect(page).toHaveURL(/data=valuable/)

    await page.getByRole('button', { name: 'Copy this blueprint' }).click()
    await expect(page.getByRole('button', { name: 'Link copied' })).toBeVisible()
  })

  test('the page is usable under reduced motion', async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await selectPlate(page, 'plate-04')
    if (testInfo.project.name === 'desktop-1600') {
      await expect(page.getByTestId('plate-canvas-plate-04')).toHaveClass(/is-static/)
    } else {
      await expect(page.getByTestId('plate-reader-plate-04')).toBeVisible()
    }
    expect(await bodyOverflowX(page)).toBeLessThanOrEqual(1)
  })

  test('dark theme swaps the plate palette', async ({ page }) => {
    await page.goto('/')
    const useDark = page.getByRole('button', { name: /Use dark theme/i })
    await useDark.click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expect(page.locator('[data-plate]').first()).toHaveAttribute('data-theme', 'dark')
  })
})

test.describe('mobile plate reader', () => {
  test('reader is the primary information surface at 380px', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-380', 'runs on the 380px project only')
    await page.goto('/')
    await selectPlate(page, 'plate-02')
    const reader = page.getByTestId('plate-reader-plate-02')
    const svgCanvas = page.getByTestId('plate-canvas-plate-02')
    await expect(reader).toBeVisible()
    await expect(svgCanvas).toBeHidden()
    // The reader carries the plate teaching point.
    await expect(reader.getByText(/One box, one service, one owner/i)).toBeVisible()
  })

  test('every default label reads at 14px or larger', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-380', 'runs on the 380px project only')
    await page.goto('/')
    await selectPlate(page, 'plate-02')
    const selectors = [
      '[data-testid="plate-reader-plate-02"] .plate-reader-title',
      '[data-testid="plate-reader-plate-02"] .plate-reader-teaching',
      '[data-testid="plate-reader-plate-02"] .plate-reader-label',
      '[data-testid="plate-reader-plate-02"] .plate-reader-text',
      '[data-testid="plate-reader-plate-02"] .plate-reader-index',
      '[data-testid="plate-inspect-plate-02"]',
      '#plate-failure-select',
      'label[for="plate-failure-select"]',
    ]
    for (const selector of selectors) {
      const size = await pxSize(page, selector)
      expect(size, `${selector} font-size should be >= 14px`).toBeGreaterThanOrEqual(14)
    }
  })

  test('body never scrolls horizontally in the default view', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-380', 'runs on the 380px project only')
    await page.goto('/')
    for (const id of PLATE_IDS) {
      await selectPlate(page, id)
      expect(
        await bodyOverflowX(page),
        `body overflows horizontally on ${id}`,
      ).toBeLessThanOrEqual(1)
    }
  })

  test('inspect opens the full drawing without body horizontal overflow', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-380', 'runs on the 380px project only')
    await page.goto('/')
    await selectPlate(page, 'plate-03')
    await page.getByTestId('plate-inspect-plate-03').click()
    const dialog = page.locator('dialog.plate-viewer')
    await expect(dialog).toBeVisible()
    // The dialog itself contains the crisp drawing at its natural size.
    await expect(dialog.locator('[data-plate="plate-03"]')).toBeVisible()
    expect(
      await bodyOverflowX(page),
      'body must not gain a horizontal scrollbar while the dialog is open',
    ).toBeLessThanOrEqual(1)
    // Close via the Close button and confirm no overflow returns.
    await dialog.getByRole('button', { name: /Close/i }).click()
    await expect(dialog).toBeHidden()
    expect(await bodyOverflowX(page)).toBeLessThanOrEqual(1)
  })
})

test.describe('desktop primary drawing', () => {
  test('the SVG is the primary information surface at 1600px', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-1600', 'runs on the 1600px project only')
    await page.goto('/')
    await selectPlate(page, 'plate-02')
    const svgCanvas = page.getByTestId('plate-canvas-plate-02')
    const reader = page.getByTestId('plate-reader-plate-02')
    await expect(svgCanvas).toBeVisible()
    await expect(reader).toBeHidden()
    // The inspect button lives inside the reader and stays hidden on desktop.
    await expect(page.getByTestId('plate-inspect-plate-02')).toBeHidden()
  })
})
