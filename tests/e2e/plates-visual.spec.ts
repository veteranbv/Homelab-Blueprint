import { expect, test } from '@playwright/test'

const PLATE_IDS = ['plate-01', 'plate-02', 'plate-03', 'plate-04', 'plate-05'] as const
const THEMES = ['light', 'dark'] as const

async function setTheme(page: import('@playwright/test').Page, target: 'light' | 'dark') {
  const current = await page.locator('html').getAttribute('data-theme')
  if (current === target) return
  await page.getByRole('button', { name: /Use (light|dark) theme/i }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', target)
}

for (const theme of THEMES) {
  for (const id of PLATE_IDS) {
    test(`captures ${id} in ${theme}`, async ({ page }, testInfo) => {
      await page.goto('/')
      await setTheme(page, theme)
      await page.locator(`#tab-${id}`).click()
      if (testInfo.project.name === 'mobile-380') {
        const reader = page.getByTestId(`plate-reader-${id}`)
        await expect(reader).toBeVisible()
        const buffer = await reader.screenshot({ animations: 'disabled' })
        await testInfo.attach(`${id}-${theme}-reader`, { body: buffer, contentType: 'image/png' })
      } else {
        const svg = page.locator(`[data-plate="${id}"]`)
        await expect(svg).toBeVisible()
        await expect(svg).toHaveAttribute('data-theme', theme)
        const buffer = await svg.screenshot({ animations: 'disabled' })
        await testInfo.attach(`${id}-${theme}`, { body: buffer, contentType: 'image/png' })
      }
    })
  }
}
