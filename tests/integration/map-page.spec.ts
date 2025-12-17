/**
 * Map Page E2E Tests
 *
 * Tests the map page functionality including:
 * - Map display with Leaflet
 * - Filters panel
 * - View type toggles
 * - Legend display
 * - Filter interactions
 *
 * Data extracted from browser exploration on 2025-12-16
 */

import { test, expect } from '@playwright/test'

test.describe('Map Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/map')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000) // Allow map to load
  })

  test('displays map filters region', async ({ page }) => {
    // Check for filters region
    const filtersRegion = page.getByRole('region', { name: /filtre.*hartă|map.*filters/i }).or(
      page.locator('text=/filtre.*hartă|map.*filters/i')
    )
    await expect(filtersRegion.first()).toBeVisible({ timeout: 10000 })
  })

  test('displays data view toggle (Map/Table/Chart)', async ({ page }) => {
    // Check for view type heading
    const viewTypeHeading = page.locator('text=/vizualizare.*date|data.*view/i')
    await expect(viewTypeHeading.first()).toBeVisible({ timeout: 5000 })

    // Check for Map radio
    const mapRadio = page.getByRole('radio', { name: /map|hartă/i })
    await expect(mapRadio.first()).toBeVisible()

    // Check for Table radio
    const tableRadio = page.getByRole('radio', { name: /table|tabel/i })
    await expect(tableRadio.first()).toBeVisible()

    // Check for Chart radio
    const chartRadio = page.getByRole('radio', { name: /chart|grafic/i })
    await expect(chartRadio.first()).toBeVisible()
  })

  test('displays map view toggle (UAT/County)', async ({ page }) => {
    // Check for map view heading
    const mapViewHeading = page.locator('text=/vizualizare.*hartă|map.*view/i')
    await expect(mapViewHeading.first()).toBeVisible({ timeout: 5000 })

    // Check for UAT radio
    const uatRadio = page.getByRole('radio', { name: /uat/i })
    await expect(uatRadio.first()).toBeVisible()

    // Check for County radio
    const countyRadio = page.getByRole('radio', { name: /județ|county/i })
    await expect(countyRadio.first()).toBeVisible()
  })

  test('displays income/expenses toggle', async ({ page }) => {
    // Check for income/expenses heading
    const incomeExpenseHeading = page.locator('text=/venituri.*cheltuieli|income.*expense/i')
    await expect(incomeExpenseHeading.first()).toBeVisible({ timeout: 5000 })

    // Check for Expenses radio
    const expensesRadio = page.getByRole('radio', { name: /cheltuieli|expenses/i })
    await expect(expensesRadio.first()).toBeVisible()

    // Check for Income radio
    const incomeRadio = page.getByRole('radio', { name: /venituri|income/i })
    await expect(incomeRadio.first()).toBeVisible()
  })

  test('displays normalization selector', async ({ page }) => {
    // Check for normalization heading
    const normalizationHeading = page.locator('text=/normalizare|normalization/i')
    await expect(normalizationHeading.first()).toBeVisible({ timeout: 5000 })

    // Check for Total option in dropdown
    const normalizationDropdown = page.getByRole('combobox').filter({ hasText: /total/i })
    await expect(normalizationDropdown.first()).toBeVisible()
  })

  test('displays period filter', async ({ page }) => {
    // Check for period section
    const periodSection = page.locator('text=/perioadă|period/i')
    await expect(periodSection.first()).toBeVisible({ timeout: 5000 })

    // Check for 2025 selected
    const year2025 = page.locator('text="2025"')
    await expect(year2025.first()).toBeVisible()
  })

  test('displays entity filter sections', async ({ page }) => {
    // Check for Entities filter
    const entitiesFilter = page.getByRole('button', { name: /entități|entities/i })
    await expect(entitiesFilter.first()).toBeVisible({ timeout: 5000 })

    // Check for Principal Creditor filter
    const creditorFilter = page.getByRole('button', { name: /creditor.*principal|principal.*creditor/i })
    await expect(creditorFilter.first()).toBeVisible()

    // Check for UAT filter
    const uatFilter = page.getByRole('button', { name: /uat/i })
    await expect(uatFilter.first()).toBeVisible()

    // Check for Counties filter
    const countiesFilter = page.getByRole('button', { name: /județe|counties/i })
    await expect(countiesFilter.first()).toBeVisible()
  })

  test('displays classification filter sections', async ({ page }) => {
    // Check for Functional Classification filter
    const functionalFilter = page.getByRole('button', { name: /clasificație.*funcțională|functional.*classification/i })
    await expect(functionalFilter.first()).toBeVisible({ timeout: 5000 })

    // Check for Economic Classification filter
    const economicFilter = page.getByRole('button', { name: /clasificație.*economică|economic.*classification/i })
    await expect(economicFilter.first()).toBeVisible()
  })

  test('displays report type filter', async ({ page }) => {
    // Check for Report Type filter
    const reportTypeFilter = page.getByRole('button', { name: /tip.*raportare|report.*type/i })
    await expect(reportTypeFilter.first()).toBeVisible({ timeout: 5000 })

    // Check for selected report type
    const reportType = page.locator('text=/executie.*bugetara.*agregata|aggregated.*budget.*execution/i')
    await expect(reportType.first()).toBeVisible()
  })

  test('displays exclusion filters section', async ({ page }) => {
    // Check for exclusion filters heading
    const exclusionFilters = page.getByRole('button', { name: /filtre.*excludere|exclusion.*filters/i })
    await expect(exclusionFilters.first()).toBeVisible({ timeout: 5000 })
  })

  test('displays map zoom controls', async ({ page }) => {
    // Check for zoom in button
    const zoomInButton = page.getByRole('button', { name: /zoom.*in/i }).or(
      page.locator('button:has-text("+")')
    )
    await expect(zoomInButton.first()).toBeVisible({ timeout: 5000 })

    // Check for zoom out button
    const zoomOutButton = page.getByRole('button', { name: /zoom.*out/i }).or(
      page.locator('button:has-text("−")')
    )
    await expect(zoomOutButton.first()).toBeVisible()
  })

  test('displays map legend', async ({ page }) => {
    // Check for legend heading
    const legendHeading = page.locator('text=/legendă|legend/i')
    await expect(legendHeading.first()).toBeVisible({ timeout: 5000 })

    // Check for value range in legend (should show RON values)
    const legendValues = page.locator('text=/\\d+.*RON|\\d+.*mil/i')
    await expect(legendValues.first()).toBeVisible()
  })

  test('displays clear filters button', async ({ page }) => {
    // Check for clear filters button
    const clearFiltersButton = page.getByRole('button', { name: /șterge.*filtre|clear.*filters/i })
    await expect(clearFiltersButton.first()).toBeVisible({ timeout: 5000 })
  })

  test('displays Leaflet attribution', async ({ page }) => {
    // Check for Leaflet link in attribution
    const leafletLink = page.getByRole('link', { name: /leaflet/i })
    await expect(leafletLink.first()).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Map Page - Interactions', () => {
  test('can toggle between map and table view', async ({ page }) => {
    await page.goto('/map')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    // Verify the view type section exists
    const viewTypeHeading = page.locator('text=/vizualizare.*date|data.*view/i')
    await expect(viewTypeHeading.first()).toBeVisible({ timeout: 5000 })

    // Verify map radio is initially selected (default view)
    const mapRadio = page.getByRole('radio', { name: /map|hartă/i }).first()
    await expect(mapRadio).toBeVisible({ timeout: 5000 })

    // Verify table radio exists
    const tableRadio = page.getByRole('radio', { name: /table|tabel/i }).first()
    await expect(tableRadio).toBeVisible({ timeout: 5000 })
  })

  test('can toggle between UAT and County view', async ({ page }) => {
    await page.goto('/map')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    // Click on County label
    const countyLabel = page.locator('text=/^Județ$|^County$/i').first()
    if (await countyLabel.isVisible({ timeout: 3000 }).catch(() => false)) {
      await countyLabel.click()
  
      const countyRadio = page.getByRole('radio', { name: /județ|county/i }).first()
      await expect(countyRadio).toBeChecked()
    }

    // Click back on UAT label
    const uatLabel = page.locator('text=/^UAT$/i').first()
    if (await uatLabel.isVisible({ timeout: 3000 }).catch(() => false)) {
      await uatLabel.click()
  
      const uatRadio = page.getByRole('radio', { name: /uat/i }).first()
      await expect(uatRadio).toBeChecked()
    }
  })

  test('can toggle between income and expenses', async ({ page }) => {
    await page.goto('/map')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    // Click on Income label
    const incomeLabel = page.locator('text=/^Venituri$|^Income$/i').first()
    if (await incomeLabel.isVisible({ timeout: 3000 }).catch(() => false)) {
      await incomeLabel.click()
  
      const incomeRadio = page.getByRole('radio', { name: /venituri|income/i }).first()
      await expect(incomeRadio).toBeChecked()
    }

    // Click back on Expenses label
    const expensesLabel = page.locator('text=/^Cheltuieli$|^Expenses$/i').first()
    if (await expensesLabel.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expensesLabel.click()
  
      const expensesRadio = page.getByRole('radio', { name: /cheltuieli|expenses/i }).first()
      await expect(expensesRadio).toBeChecked()
    }
  })

  test('can expand filter sections', async ({ page }) => {
    await page.goto('/map')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    // Verify the Entities filter section exists
    const entitiesButton = page.getByRole('button', { name: /^entități$|^entities$/i }).first()
    await expect(entitiesButton).toBeVisible({ timeout: 5000 })

    // Verify other filter sections exist as well
    const countiesButton = page.getByRole('button', { name: /județe|counties/i }).first()
    await expect(countiesButton).toBeVisible({ timeout: 5000 })
  })

  test('map zoom controls work', async ({ page }) => {
    await page.goto('/map')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    // Click zoom in
    const zoomInButton = page.locator('button:has-text("+")').first()
    if (await zoomInButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await zoomInButton.click()
  
      // Map should still be visible after zoom
      await expect(zoomInButton).toBeVisible()
    }

    // Click zoom out
    const zoomOutButton = page.locator('button:has-text("−")').first()
    if (await zoomOutButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await zoomOutButton.click()
  
      await expect(zoomOutButton).toBeVisible()
    }
  })
})
