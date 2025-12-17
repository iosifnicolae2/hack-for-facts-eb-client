/**
 * Map Page Integration Tests
 *
 * Tests the map page functionality including:
 * - Map display with Leaflet
 * - Filters panel
 * - View type toggles
 * - Legend display
 */

import { test, expect } from '@playwright/test'

test.describe('Map Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/map')
    // Wait for filters region to be visible (indicates page loaded)
    await expect(
      page.getByRole('region', { name: /filtre.*hartă/i })
    ).toBeVisible({ timeout: 15000 })
  })

  test('displays map filters region with title', async ({ page }) => {
    // Check for filters region
    await expect(
      page.getByRole('region', { name: /filtre.*hartă/i })
    ).toBeVisible()

    // Check for clear filters button
    await expect(
      page.getByRole('button', { name: /șterge.*filtre/i })
    ).toBeVisible()
  })

  test('displays data view toggle (Map/Table/Chart)', async ({ page }) => {
    // Check for view type heading
    await expect(
      page.getByRole('heading', { name: /vizualizare.*date/i, level: 4 })
    ).toBeVisible({ timeout: 5000 })

    // Check for radio buttons
    await expect(page.getByRole('radio', { name: /hartă/i })).toBeVisible()
    await expect(page.getByRole('radio', { name: /tabel/i })).toBeVisible()
    await expect(page.getByRole('radio', { name: /grafic/i })).toBeVisible()

    // Map should be selected by default
    await expect(page.getByRole('radio', { name: /hartă/i })).toBeChecked()
  })

  test('displays map view toggle (UAT/County)', async ({ page }) => {
    // Check for map view heading
    await expect(
      page.getByRole('heading', { name: /vizualizare.*hartă/i, level: 4 })
    ).toBeVisible({ timeout: 5000 })

    // Check for radio buttons
    await expect(page.getByRole('radio', { name: /uat/i })).toBeVisible()
    await expect(page.getByRole('radio', { name: /județ/i })).toBeVisible()

    // UAT should be selected by default
    await expect(page.getByRole('radio', { name: /uat/i })).toBeChecked()
  })

  test('displays income/expenses toggle', async ({ page }) => {
    // Check for income/expenses heading
    await expect(
      page.getByRole('heading', { name: /venituri.*cheltuieli/i, level: 4 })
    ).toBeVisible({ timeout: 5000 })

    // Check for radio buttons
    await expect(page.getByRole('radio', { name: /cheltuieli/i })).toBeVisible()
    await expect(page.getByRole('radio', { name: /venituri/i })).toBeVisible()

    // Expenses should be selected by default
    await expect(page.getByRole('radio', { name: /cheltuieli/i })).toBeChecked()
  })

  test('displays normalization selector', async ({ page }) => {
    // Check for normalization heading
    await expect(
      page.getByRole('heading', { name: /normalizare/i, level: 4 })
    ).toBeVisible({ timeout: 5000 })

    // Check for combobox
    await expect(page.getByRole('combobox')).toBeVisible()
  })

  test('displays period filter with year selected', async ({ page }) => {
    // Check for period button
    const periodButton = page.getByRole('button', { name: /perioadă/i })
    await expect(periodButton).toBeVisible({ timeout: 5000 })

    // Check for year tag within filters region (exclude footer)
    const filtersRegion = page.getByRole('region', { name: /filtre.*hartă/i })
    await expect(filtersRegion.getByText('2025')).toBeVisible()
  })

  test('displays entity filter sections', async ({ page }) => {
    // Check for Entities filter
    await expect(
      page.getByRole('button', { name: /^entități$/i })
    ).toBeVisible({ timeout: 5000 })

    // Check for Creditor filter (exact match to avoid "Exclude Creditor Principal")
    await expect(
      page.getByRole('button', { name: 'Creditor Principal', exact: true })
    ).toBeVisible()

    // Check for UAT filter (exact match to avoid "Exclude UAT-uri")
    await expect(
      page.getByRole('button', { name: 'UAT-uri', exact: true })
    ).toBeVisible()

    // Check for Counties filter (exact match to avoid "Exclude Județe")
    await expect(
      page.getByRole('button', { name: 'Județe', exact: true })
    ).toBeVisible()
  })

  test('displays classification filter sections', async ({ page }) => {
    // Check for Functional Classification filter
    await expect(
      page.getByRole('button', { name: /clasificație.*funcțională/i }).first()
    ).toBeVisible({ timeout: 5000 })

    // Check for Economic Classification filter
    await expect(
      page.getByRole('button', { name: /clasificație.*economică/i }).first()
    ).toBeVisible()
  })

  test('displays report type filter', async ({ page }) => {
    // Check for Report Type filter button
    await expect(
      page.getByRole('button', { name: /tip.*raportare/i })
    ).toBeVisible({ timeout: 5000 })

    // Check for selected report type
    await expect(
      page.getByText(/executie.*bugetara.*agregata/i)
    ).toBeVisible()
  })

  test('displays exclusion filters section', async ({ page }) => {
    // Check for exclusion filters button
    await expect(
      page.getByRole('button', { name: /filtre.*excludere/i })
    ).toBeVisible({ timeout: 5000 })
  })

  test('displays map zoom controls', async ({ page }) => {
    // Check for zoom in button
    await expect(
      page.getByRole('button', { name: /zoom.*in/i })
    ).toBeVisible({ timeout: 5000 })

    // Check for zoom out button
    await expect(
      page.getByRole('button', { name: /zoom.*out/i })
    ).toBeVisible()
  })

  test('displays map legend', async ({ page }) => {
    // Check for legend heading
    await expect(
      page.getByRole('heading', { name: /legendă/i, level: 4 })
    ).toBeVisible({ timeout: 5000 })

    // Check for value range in legend (RON values)
    await expect(
      page.getByText(/mil\.\s*RON/i).first()
    ).toBeVisible()
  })

  test('displays Leaflet attribution', async ({ page }) => {
    // Check for Leaflet link in attribution
    await expect(
      page.getByRole('link', { name: /leaflet/i })
    ).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Map Page - Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/map')
    await expect(
      page.getByRole('region', { name: /filtre.*hartă/i })
    ).toBeVisible({ timeout: 15000 })
  })

  test('can switch between map views (UAT/County)', async ({ page }) => {
    // Verify UAT is selected by default
    const uatRadio = page.getByRole('radio', { name: /uat/i })
    await expect(uatRadio).toBeChecked()

    // Click County within the map view group (radio is sr-only)
    const mapViewGroup = page.getByRole('group', { name: /vizualizare.*hartă/i })
    await mapViewGroup.getByText('Județ').click()

    // Verify County is now selected
    const countyRadio = page.getByRole('radio', { name: /județ/i })
    await expect(countyRadio).toBeChecked()
  })

  test('can switch between income and expenses', async ({ page }) => {
    // Verify Expenses is selected by default
    const expensesRadio = page.getByRole('radio', { name: /cheltuieli/i })
    await expect(expensesRadio).toBeChecked()

    // Click Income within the income/expenses group (radio is sr-only)
    const incomeGroup = page.getByRole('group', { name: /venituri.*cheltuieli/i })
    await incomeGroup.getByText('Venituri').click()

    // Verify Income is now selected
    const incomeRadio = page.getByRole('radio', { name: /venituri/i })
    await expect(incomeRadio).toBeChecked()
  })

  test('can use zoom controls', async ({ page }) => {
    // Click zoom in
    const zoomInButton = page.getByRole('button', { name: /zoom.*in/i })
    await expect(zoomInButton).toBeVisible({ timeout: 5000 })
    await zoomInButton.click()

    // Verify button still visible after click
    await expect(zoomInButton).toBeVisible()

    // Click zoom out
    const zoomOutButton = page.getByRole('button', { name: /zoom.*out/i })
    await zoomOutButton.click()
    await expect(zoomOutButton).toBeVisible()
  })

  test('filter sections are expandable', async ({ page }) => {
    // Verify filter section buttons exist
    const entitiesButton = page.getByRole('button', { name: /^entități$/i })
    await expect(entitiesButton).toBeVisible({ timeout: 5000 })

    await expect(
      page.getByRole('button', { name: 'Județe', exact: true })
    ).toBeVisible()

    // Click to expand entities section
    await entitiesButton.click()

    // Verify accordion expanded (check for expanded state)
    await expect(entitiesButton).toHaveAttribute('data-state', 'open')
  })
})
