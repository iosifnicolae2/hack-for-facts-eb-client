/**
 * Comprehensive Tutorial: Entity Analytics – full feature tour
 * Spec references:
 * - docs/user-stories/entity-analytics.md
 * - docs/user-stories/README.md → Entity Analytics
 *
 * Covers:
 * - Filters: account category, normalization, year, functional/economic prefixes, entities/geo cohort, etc.
 * - Table view: sorting, pagination, preferences, CSV button presence
 * - Line Items view: composition drill-down
 *
 * Notes:
 * - Each step captures a screenshot for documentation.
 * - Uses label/attribute selectors for Radix controls to avoid interception.
 */
import { test, expect } from '@playwright/test'
import { captureStep, waitIdle } from './utils/tutorial-helpers'

test.describe('Tutorial – Entity Analytics (comprehensive)', () => {
  test('Full feature tour with ranking and drill-down', async ({ page }, testInfo) => {
    let step = 0
    const next = async (title: string) => captureStep(page, testInfo, ++step, title)

    // Step 1: Open Entity Analytics (Table view default)
    await page.goto('/entity-analytics')
    await waitIdle(page)
    await expect(page.getByRole('heading', { name: 'Entity Analytics' })).toBeVisible()
    await next('Entity Analytics – default table view')

    // Step 2: Switch normalization to Per Capita
    await page.locator("label[for$='per_capita']").first().click()
    await waitIdle(page)
    await next('Normalization – Per Capita selected')

    // Step 3: Select Revenues or Expenses (toggle)
    await page.locator("label[for^='map-ac-']", { hasText: 'Cheltuieli' }).click()
    await waitIdle(page)
    await next('Account category – Cheltuieli')

    // Step 4: Pick Year 2024 (ensure the tag shows)
    const yearHeader = page.getByRole('heading', { name: /Year 1|Anul 1/i })
    if (await yearHeader.count()) await yearHeader.click()
    // Prefer the selected-chip area that shows 'Selected (1)' then the tag '2024'
    const selectedTag = page.locator("span[title='2024']").first()
    await expect(selectedTag).toBeVisible()
    await next('Year filter – ensure 2024 is selected')

    // Step 5: Sort by Total Amount descending via column menu
    const totalMenu = page.getByRole('button', { name: 'total_amount menu' })
    if (await totalMenu.count()) await totalMenu.click()
    const sortDesc = page.getByRole('menuitem', { name: /Sort Desc|Sort desc|Sort descending/i })
    if (await sortDesc.count()) await sortDesc.click()
    await next('Sort by Total Amount descending')

    // Step 6: Capture Export CSV presence (avoid clicking download in CI)
    const exportBtn = page.getByRole('button', { name: /Export CSV/i })
    if (await exportBtn.count()) await next('Export CSV button visible')

    // Step 7: Pagination – change rows per page to 50
    const rowsCombo = page.getByRole('combobox', { name: /Select rows per page/i })
    if (await rowsCombo.count()) {
      await rowsCombo.click()
      const opt50 = page.getByRole('option', { name: /^50$/ })
      if (await opt50.count()) await opt50.click()
    }
    await next('Pagination – switch to 50 rows per page')

    // Step 8: Switch to Line Items view (URL-driven for reliability)
    await page.goto('/entity-analytics?view=line-items')
    await waitIdle(page)
    await next('Line Items view – composition per entity')

    // Step 9: Optional – pick a functional prefix filter (open dropdown and capture)
    const functionalH = page.getByRole('heading', { name: /Functional Prefixes|Prefix Clasificare Functionala/i })
    if (await functionalH.count()) await functionalH.click()
    await next('Functional prefix filter – open list (illustrative)')
  })
})


