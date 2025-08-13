import type { Page, TestInfo } from '@playwright/test'

/**
 * Capture a full-page screenshot for a numbered tutorial step and attach it to the test report.
 * The file is saved under the test's output directory as `<step>-<slug>.png`.
 */
export async function captureStep(page: Page, testInfo: TestInfo, stepNumber: number, title: string): Promise<void> {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80)
  const filename = `${String(stepNumber).padStart(2, '0')}-${slug}.png`
  const path = testInfo.outputPath(filename)
  await page.screenshot({ path, fullPage: true })
  await testInfo.attach(filename, { path, contentType: 'image/png' })
}

/**
 * Convenience helper to wait for network to become idle after route transitions.
 */
export async function waitIdle(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle')
}


