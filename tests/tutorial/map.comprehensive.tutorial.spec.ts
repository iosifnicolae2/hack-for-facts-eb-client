/**
 * Comprehensive Tutorial: Map – full spatial exploration tour
 * Spec references:
 * - docs/user-stories/map.md
 * - docs/user-stories/README.md → Map
 */
import { test, expect } from '@playwright/test'
import { captureStep, waitIdle } from './utils/tutorial-helpers'

test.describe('Tutorial – Map (comprehensive)', () => {
  test('UAT/Județ, Venituri/Cheltuieli, Total/Per Capita, map controls, and deep-link', async ({ page }, testInfo) => {
    let step = 0
    const next = async (title: string) => captureStep(page, testInfo, ++step, title)

    // Step 1: Open Map
    await page.goto('/map')
    await waitIdle(page)
    await expect(page.getByRole('radio', { name: 'UAT' })).toBeVisible()
    await next('Map – filters and main view visible')

    // Step 2: Switch to Județ
    await page.locator("label[for^='map-view-']", { hasText: 'Județ' }).click()
    await waitIdle(page)
    await next('Map – switched to County aggregation (Județ)')

    // Step 3: Switch to Venituri and Per Capita
    await page.locator("label[for^='map-ac-']", { hasText: 'Venituri' }).click()
    await page.locator("label[for$='per_capita']").click()
    await next('Map – Revenues and Per Capita normalization')

    // Step 4: Year verification (ensure 2024 tag)
    const tag2024 = page.locator("span[title='2024']").first()
    await expect(tag2024).toBeVisible()
    await next('Map – Year 2024 selected')

    // Step 5: Map controls (zoom in/out, scroll toggle visible)
    await expect(page.getByRole('button', { name: /Zoom in/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Zoom out/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Toggle scroll zoom/i })).toBeVisible()
    await next('Map – control buttons visible (zoom/toggle)')

    // Step 6: Switch to Table, click first entity (if any)
    await page.locator("label[for='view-type-table']").click()
    await waitIdle(page)
    const firstEntity = page.locator('table a').first()
    if (await firstEntity.count()) {
      await firstEntity.click()
      await waitIdle(page)
      await next('Map – clicked through to entity page from table view')
    } else {
      await next('Map – table view loaded (no entity link found)')
    }
  })
})


