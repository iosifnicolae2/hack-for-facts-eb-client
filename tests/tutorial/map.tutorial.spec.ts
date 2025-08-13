/**
 * Tutorial: Map – spatial exploration
 * Spec references:
 * - docs/user-stories/README.md → Map
 * - docs/user-stories/map.md
 * Goal: Show UAT/County views, normalization, and click-through to entity page.
 */
import { test, expect } from '@playwright/test'
import { captureStep, waitIdle } from './utils/tutorial-helpers'

test.describe('Tutorial – Map', () => {
  test('UAT/County, normalization, click-through', async ({ page }, testInfo) => {
    // Step 1: Open Map page
    await page.goto('/map')
    await waitIdle(page)
    await expect(page.getByRole('radio', { name: 'UAT' })).toBeVisible()
    await captureStep(page, testInfo, 1, 'Open map and verify controls')

    // Step 2: Switch to County view
    // Click associated label instead of hidden input (Radix UI radios hide the button)
    await page.locator("label[for^='map-view-']", { hasText: 'Județ' }).click()
    await waitIdle(page)
    await captureStep(page, testInfo, 2, 'Switch to County view')

    // Step 3: Toggle Revenues
    await page.locator("label[for^='map-ac-']", { hasText: 'Venituri' }).click()
    await waitIdle(page)
    await captureStep(page, testInfo, 3, 'Switch to Revenues')

    // Step 4: Normalize Per Capita
    await page.locator("label[for$='per_capita']").click()
    await captureStep(page, testInfo, 4, 'Normalize per capita to compare fairly')

    // Step 5: Click-through to an entity from the map table view
    await page.locator("label[for='view-type-table']").click()
    await waitIdle(page)
    // click the first entity link in table if present
    const firstEntity = page.locator('table a').first()
    if (await firstEntity.count()) {
      await firstEntity.click()
      await waitIdle(page)
      await captureStep(page, testInfo, 5, 'Navigate to entity from map data table')
    } else {
      await captureStep(page, testInfo, 5, 'Table view visible (no entity link found)')
    }
  })
})


