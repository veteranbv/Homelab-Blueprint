import { expect, test } from '@playwright/test'

const PLATES = [
  ['plate-01', '01-question-sheet'],
  ['plate-02', '02-one-useful-host'],
  ['plate-03', '03-trust-boundaries'],
  ['plate-04', '04-recovery-chain'],
  ['plate-05', '05-bounded-automation'],
] as const

for (const [id, slug] of PLATES) {
  test(`visually verifies ${id}`, async ({ page }, testInfo) => {
    await page.goto(`/plates/${slug}/`)
    if (testInfo.project.name === 'mobile-380') {
      const reader = page.getByTestId(`plate-reader-${id}`)
      await expect(reader).toBeVisible()
      await expect(reader).toHaveScreenshot(`${id}-reader.png`, {
        animations: 'disabled',
        maxDiffPixelRatio: 0.01,
      })
    } else {
      const svg = page.locator(`[data-plate="${id}"]`).first()
      await expect(svg).toBeVisible()
      await expect(svg).toHaveScreenshot(`${id}.png`, {
        animations: 'disabled',
        maxDiffPixelRatio: 0.01,
      })
    }
  })
}

for (const [name, route, selector] of [
  ['landing', '/', '#main-content'],
  ['chapter', '/chapters/10-ai-agentic/', '.chapter-article'],
  ['builder', '/builder/', '.builder-console'],
] as const) {
  test(`visually verifies ${name}`, async ({ page }) => {
    await page.goto(route)
    await expect(page.locator(selector)).toHaveScreenshot(`${name}.png`, {
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
    })
  })
}
