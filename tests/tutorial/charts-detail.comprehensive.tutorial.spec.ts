/**
 * Comprehensive Tutorial: Chart Detail – build, configure, annotate, and share
 * Spec references:
 * - docs/user-stories/charts-detail.md
 * - docs/user-stories/README.md → Chart Builder
 */
import { test, expect } from '@playwright/test'
import { captureStep, waitIdle } from './utils/tutorial-helpers'

test.describe('Tutorial – Chart Detail (comprehensive)', () => {
  test('Create chart, add series, configure options, and annotate', async ({ page }, testInfo) => {
    let step = 0
    const next = async (title: string) => captureStep(page, testInfo, ++step, title)

    // Step 1: Create a new chart (navigates to /charts/$chartId?view=config)
    await page.goto('/charts/new')
    await waitIdle(page)
    await next('New chart – configuration dialog open')

    // Step 2: Add a line-items aggregated yearly series
    const addSeriesBtn = page.getByRole('button', { name: /Add series|Add Series|New series/i }).first()
    if (await addSeriesBtn.count()) await addSeriesBtn.click()
    const liType = page.getByRole('option', { name: /line-items-aggregated-yearly/i }).first()
    if (await liType.count()) await liType.click()
    await next('Add series – choose line-items aggregated yearly')

    // Step 3: Select an entity and account category
    const entitiesBtn = page.getByRole('button', { name: /Entities?\b/i }).first()
    if (await entitiesBtn.count()) {
      await entitiesBtn.click()
      const firstOption = page.getByRole('option').first()
      if (await firstOption.count()) await firstOption.click()
    }
    const spendingRadio = page.getByRole('radio', { name: /Cheltuieli|Spending/i })
    if (await spendingRadio.count()) await spendingRadio.click()
    await next('Configure series – pick an entity and Spending')

    // Step 4: Save and view chart overview
    const saveBtn = page.getByRole('button', { name: /Save|Done|Close/i }).first()
    if (await saveBtn.count()) await saveBtn.click()
    await waitIdle(page)
    await next('Chart overview renders with the configured series')

    // Step 5: Open Chart Config and toggle options
    const configBtn = page.getByRole('button', { name: /Configure|Settings|Options/i }).first()
    if (await configBtn.count()) await configBtn.click()
    const grid = page.getByRole('switch', { name: /Grid/i })
    if (await grid.count()) await grid.click()
    const legend = page.getByRole('switch', { name: /Legend/i })
    if (await legend.count()) await legend.click()
    const tooltip = page.getByRole('switch', { name: /Tooltip/i })
    if (await tooltip.count()) await tooltip.click()
    await next('Chart options – toggled grid, legend, tooltip')

    // Step 6: Open Series Config to demonstrate calculation series (selection only)
    const seriesConfigBtn = page.getByRole('button', { name: /Series config|Edit series|Series/i }).first()
    if (await seriesConfigBtn.count()) seriesConfigBtn.click().catch(() => {})
    await next('Series config – ready to add calculation/static/custom series')

    // Step 7: Open Annotation Config (if available)
    const annotationBtn = page.getByRole('button', { name: /Annotation|Annotations/i }).first()
    if (await annotationBtn.count()) annotationBtn.click().catch(() => {})
    await next('Annotation config – ready to add/edit annotations')

    // Done
  })
})


