/**
 * Tutorial: Charts – build, configure, annotate, and share
 * Spec references:
 * - docs/user-stories/README.md → Chart Builder
 * - docs/user-stories/charts-detail.md
 * Goal: Create a chart, add a series, tweak config, and capture key steps.
 */
import { test, expect } from '@playwright/test'
import { captureStep, waitIdle } from './utils/tutorial-helpers'

test.describe('Tutorial – Charts', () => {
  test('Create and configure a chart with a basic series', async ({ page }, testInfo) => {
    // Step 1: Open Charts list and create a new chart
    await page.goto('/charts')
    await waitIdle(page)
    await page.getByRole('link', { name: /Create chart|Create your first chart/ }).first().click()
    await waitIdle(page)
    await captureStep(page, testInfo, 1, 'Create a new chart and open configuration')

    // Step 2: In config dialog, add a new series (guide-level; selectors depend on UI ids)
    // Navigate to Series tab if needed
    const seriesTab = page.getByRole('tab', { name: /Series|Add series/i })
    if (await seriesTab.count()) await seriesTab.click()
    // Choose series type "line-items aggregated yearly"
    const addSeriesBtn = page.getByRole('button', { name: /Add series|New series/i }).first()
    if (await addSeriesBtn.count()) await addSeriesBtn.click()
    const liTypeOpt = page.getByRole('option', { name: /line-items-aggregated-yearly/i }).first()
    if (await liTypeOpt.count()) await liTypeOpt.click()
    await captureStep(page, testInfo, 2, 'Add a line-items aggregated yearly series')

    // Step 3: Configure basic filters (entity and account category)
    const entityPicker = page.getByRole('button', { name: /Entities?\b/i }).first()
    if (await entityPicker.count()) {
      await entityPicker.click()
      // Select a common entity like Bucuresti (fallback to first option)
      const firstOption = page.getByRole('option').first()
      if (await firstOption.count()) await firstOption.click()
    }
    const accountCategoryCh = page.getByRole('radio', { name: /Cheltuieli|Spending/i })
    if (await accountCategoryCh.count()) await accountCategoryCh.click()
    await captureStep(page, testInfo, 3, 'Select entity and account category for the series')

    // Step 4: Save and view the chart overview
    const saveBtn = page.getByRole('button', { name: /Save|Done|Close/i })
    if (await saveBtn.count()) await saveBtn.click()
    await waitIdle(page)
    await captureStep(page, testInfo, 4, 'View chart overview with the new series rendered')

    // Step 5: Open chart config and toggle grid/legend/tooltip
    const configOpen = page.getByRole('button', { name: /Configure|Settings|Options/i })
    if (await configOpen.count()) await configOpen.click()
    const gridToggle = page.getByRole('switch', { name: /Grid/i })
    if (await gridToggle.count()) await gridToggle.click()
    const legendToggle = page.getByRole('switch', { name: /Legend/i })
    if (await legendToggle.count()) await legendToggle.click()
    const tooltipToggle = page.getByRole('switch', { name: /Tooltip/i })
    if (await tooltipToggle.count()) await tooltipToggle.click()
    await captureStep(page, testInfo, 5, 'Toggle grid, legend, and tooltip options')
  })
})


