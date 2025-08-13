/**
 * Tutorial: Entity Analytics – ranking and drill-down
 * Spec references:
 * - docs/user-stories/README.md → Entity Analytics
 * - docs/user-stories/entity-analytics.md
 * Goal: Filter, sort, export, and switch to line items.
 */
import { test, expect } from '@playwright/test'
import { captureStep, waitIdle } from './utils/tutorial-helpers'

test.describe('Tutorial – Entity Analytics', () => {
  test('Filter, sort, export, switch to line items', async ({ page }, testInfo) => {
    // Step 1: Open Entity Analytics page
    await page.goto('/entity-analytics')
    await waitIdle(page)
    await expect(page.getByRole('heading', { name: 'Entity Analytics' })).toBeVisible()
    await captureStep(page, testInfo, 1, 'Open Entity Analytics with default filters')

    // Step 2: Switch normalization to Per Capita
    await page.locator("label[for$='per_capita']").first().click()
    await waitIdle(page)
    await captureStep(page, testInfo, 2, 'Switch normalization to Per Capita')

    // Step 3: Sort by Total Amount descending via column menu
    await page.getByRole('button', { name: 'total_amount menu' }).click()
    const sortDesc = page.getByRole('menuitem', { name: /Sort Desc|Sort desc|Sort descending/i })
    if (await sortDesc.count()) await sortDesc.click()
    await captureStep(page, testInfo, 3, 'Sort by Total Amount descending')

    // Step 4: Export CSV
    const exportBtn = page.getByRole('button', { name: /Export CSV/i })
    if (await exportBtn.count()) {
      await captureStep(page, testInfo, 4, 'Export CSV button visible (download optional in CI)')
    }

    // Step 5: Switch to Line Items view (via URL to ensure reproducible state)
    await page.goto('/entity-analytics?view=line-items')
    await waitIdle(page)
    await captureStep(page, testInfo, 5, 'Switch to Line Items view and load composition')
  })
})


