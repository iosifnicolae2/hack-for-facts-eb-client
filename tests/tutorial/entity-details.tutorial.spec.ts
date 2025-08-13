/**
 * Tutorial: Entity Details deep-dive
 * Spec references:
 * - docs/user-stories/README.md → Entity Details
 * - docs/user-stories/entity-details.md
 * Goal: Demonstrate overview KPIs, trend modes, line items, analytics, and reports.
 */
import { test, expect } from '@playwright/test'
import { captureStep, waitIdle } from './utils/tutorial-helpers'

test.describe('Tutorial – Entity Details', () => {
  test('Overview, trends, line items, analytics, reports', async ({ page }, testInfo) => {
    // Step 1: Navigate to a known entity (Sibiu)
    await page.goto('/entities/4270740?view=overview')
    await waitIdle(page)
    await expect(page.getByRole('heading', { name: /MUNICIPIUL SIBIU/i })).toBeVisible()
    await captureStep(page, testInfo, 1, 'Entity header and KPIs – totals for year')

    // Step 2: Switch reporting year
    // Year selector might be a trigger button with current year text; click the select trigger by role=button and text
    const yearSelector = page.locator('button:has-text("Reporting year"), button:has-text("2024"), button:has-text("2023")').first()
    await yearSelector.click()
    // Select first available option different from current
    const option2023 = page.getByRole('option', { name: '2023' })
    if (await option2023.count()) {
      await option2023.click()
    }
    await waitIdle(page)
    await captureStep(page, testInfo, 2, 'Change reporting year and refresh overview')

    // Step 3: Toggle trends mode (Absolute → YoY%)
    const trendsMode = page.getByRole('combobox').filter({ hasText: /Valori Absolute|Diferență % YoY/ }).first()
    await trendsMode.click()
    const yoy = page.getByRole('option', { name: /Diferență % YoY/ })
    if (await yoy.count()) {
      await yoy.click()
    }
    await captureStep(page, testInfo, 3, 'Switch trends mode to YoY%')

    // Step 4: Click a year in the chart (if accessible via axis labels)
    // Fallback: re-select 2024 to demonstrate sync
    await yearSelector.first().click()
    const option2024 = page.getByRole('option', { name: '2024' })
    if (await option2024.count()) {
      await option2024.click()
    }
    await waitIdle(page)
    await captureStep(page, testInfo, 4, 'Sync page by selecting a specific year')

    // Step 5: Explore Expense line items (top accordion section)
    await page.getByRole('heading', { name: /Expenses/ }).scrollIntoViewIfNeeded()
    await captureStep(page, testInfo, 5, 'Expense composition – functional groups')

    // Step 6: Switch to Income analytics chart and toggle chart type
    await page.getByRole('radio', { name: 'Income' }).click()
    await waitIdle(page)
    await page.getByRole('radio', { name: 'Pie chart' }).click()
    await captureStep(page, testInfo, 6, 'Entity analytics – income composition and chart type toggle')

    // Step 7: Open Reports accordion
    const reportsAccordion = page.getByRole('button', { name: /Rapoarte Financiare/ })
    await reportsAccordion.click()
    await captureStep(page, testInfo, 7, 'Open reports and show downloadable files (Excel/PDF/XML)')
  })
})


