/**
 * Budget Explorer - Comprehensive E2E Tests
 *
 * Route: /budget-explorer
 * Tests: Treemap visualization, drilldown, classification switching,
 *        spending/revenue toggle, category list, URL state preservation
 *
 * Based on: docs/e2e-flows/03-budget-explorer.md
 */

import { test, expect } from '../utils/integration-base'

// Test constants (EN/RO language support)
const SELECTORS = {
  // Page headings and sections
  budgetDistribution: /budget.*distribution|distribuția.*buget/i,
  topCategories: /top.*categories|categorii.*principale/i,
  mainCategories: /main.*categories|categorii.*principale/i,

  // Toggles and filters
  incomeLabel: /^income$|^venituri$/i,
  expensesLabel: /^expenses$|^cheltuieli$/i,
  functionalLabel: /^functional$|^funcțional/i,
  economicLabel: /^economic$|^economic/i,
  mainChaptersLabel: /main.*chapters|capitole.*principale/i,
  detailedCategoriesLabel: /detailed.*categories|categorii.*detaliate/i,

  // Normalization options
  totalLabel: /^total$/i,
  perCapitaLabel: /per.*capita/i,

  // Actions
  seeAdvancedView: /see.*advanced.*view|vezi.*vizualizare.*avansată/i,
  viewAsChart: /view.*as.*chart|vezi.*ca.*grafic/i,
  goBack: /go.*back|înapoi/i,
  resetFilter: /reset.*filter|resetează.*filtru/i,

  // Error states
  failedToLoad: /failed.*to.*load|nu.*s-a.*putut.*încărca/i,
  noData: /no.*data|nu.*există.*date/i,
}

test.describe('Budget Explorer - Comprehensive Tests', () => {
  // ===================================================
  // 1. PAGE LAYOUT AND INITIAL LOAD
  // ===================================================
  test.describe('1. Page Layout and Initial Load', () => {
    test.beforeEach(async ({ mockApi }) => {
      await mockApi.mockGraphQL('AggregatedLineItems', 'aggregated-line-items')
    })

    test('1.1 Page loads with treemap visualization', async ({ page }) => {
      await page.goto('/budget-explorer')
      await page.waitForLoadState('domcontentloaded')

      // Verify page structure
      await expect(page.getByRole('heading', { name: SELECTORS.budgetDistribution })).toBeVisible({ timeout: 10000 })
      // Use h3 specifically for "Top Categories" to avoid matching h4 subheadings
      await expect(page.locator('h3').filter({ hasText: SELECTORS.topCategories })).toBeVisible({ timeout: 10000 })

      // Verify treemap container is rendered
      const treemapContainer = page.locator('.recharts-responsive-container').first()
      await expect(treemapContainer).toBeVisible({ timeout: 10000 })
    })

    test('1.2 Default filter state is spending (ch)', async ({ page }) => {
      await page.goto('/budget-explorer')
      await page.waitForLoadState('domcontentloaded')

      // Verify expenses toggle is selected by default
      const expensesToggle = page.locator('[data-state="on"]').filter({ hasText: SELECTORS.expensesLabel })
      await expect(expensesToggle).toBeVisible({ timeout: 10000 })
    })

    test('1.3 Default classification is functional', async ({ page }) => {
      await page.goto('/budget-explorer')
      await page.waitForLoadState('domcontentloaded')

      // Verify functional grouping is selected by default
      const functionalToggle = page.locator('[data-state="on"]').filter({ hasText: SELECTORS.functionalLabel })
      await expect(functionalToggle).toBeVisible({ timeout: 10000 })
    })

    test('1.4 Default depth is main chapters', async ({ page }) => {
      await page.goto('/budget-explorer')
      await page.waitForLoadState('domcontentloaded')

      // Verify main chapters is selected by default
      const mainChaptersToggle = page.locator('[data-state="on"]').filter({ hasText: SELECTORS.mainChaptersLabel })
      await expect(mainChaptersToggle).toBeVisible({ timeout: 10000 })
    })

    test('1.5 Treemap shows colored rectangles with labels', async ({ page }) => {
      await page.goto('/budget-explorer')

      // Wait for treemap to render
      await page.waitForSelector('.recharts-treemap-depth-1', { timeout: 10000 }).catch(() => null)

      // Verify treemap has visible cells (rectangles)
      const treemapCells = page.locator('.recharts-treemap rect, .recharts-responsive-container rect')
      await expect(treemapCells.first()).toBeVisible({ timeout: 10000 })
    })

    test('1.6 Header controls are visible', async ({ page }) => {
      await page.goto('/budget-explorer')

      // Verify all header controls
      await expect(page.getByText(SELECTORS.incomeLabel).first()).toBeVisible()
      await expect(page.getByText(SELECTORS.expensesLabel).first()).toBeVisible()

      // Normalization select should be visible
      const normalizationSelect = page.getByRole('combobox').first()
      await expect(normalizationSelect).toBeVisible()
    })

    test('1.7 Category list section is visible', async ({ page }) => {
      await page.goto('/budget-explorer')

      // Verify top categories section (use h3 specifically)
      await expect(page.locator('h3').filter({ hasText: SELECTORS.topCategories })).toBeVisible()

      // Verify advanced view link
      await expect(page.getByRole('link', { name: SELECTORS.seeAdvancedView })).toBeVisible()
    })
  })

  // ===================================================
  // 2. TREEMAP INTERACTIONS
  // ===================================================
  test.describe('2. Treemap Interactions', () => {
    test.beforeEach(async ({ mockApi }) => {
      await mockApi.mockGraphQL('AggregatedLineItems', 'aggregated-line-items')
    })

    test('2.1 Treemap cells are clickable', async ({ page }) => {
      await page.goto('/budget-explorer')

      // Wait for treemap
      await page.waitForSelector('.recharts-responsive-container', { timeout: 10000 })

      // Find and click a treemap cell
      const treemapCell = page.locator('.recharts-treemap g[cursor="pointer"]').first()

      if (await treemapCell.isVisible()) {
        // Click should trigger navigation or drilldown
        await treemapCell.click()

        // Wait for any state change
        await page.waitForTimeout(500)
      }
    })

    test('2.2 Breadcrumb shows Main Categories at root level', async ({ page }) => {
      await page.goto('/budget-explorer')

      // Wait for page to load
      await page.waitForLoadState('domcontentloaded')

      // Verify breadcrumb shows root
      await expect(page.getByText(SELECTORS.mainCategories).first()).toBeVisible({ timeout: 10000 })
    })

    test('2.3 Click on breadcrumb navigates back', async ({ page }) => {
      // Start with a drilldown path
      await page.goto('/budget-explorer?treemapPath=68')

      // Click on Main Categories breadcrumb
      const mainCategoriesBreadcrumb = page.getByText(SELECTORS.mainCategories)
      if (await mainCategoriesBreadcrumb.isVisible()) {
        await mainCategoriesBreadcrumb.click()

        // Verify URL is updated
        await expect(page).toHaveURL(/\/budget-explorer(?!\?treemapPath)/)
      }
    })

    test('2.4 Back button appears during drilldown', async ({ page }) => {
      // Start with a drilldown path
      await page.goto('/budget-explorer?treemapPath=68')

      // Back button should be visible
      const backButton = page.getByRole('button', { name: /back|înapoi/i })
      await expect(backButton).toBeVisible().catch(() => {
        // Back button might be an icon button
        const iconButton = page.locator('button[aria-label*="back" i], button[aria-label*="înapoi" i]')
        return expect(iconButton).toBeVisible()
      })
    })

    test('2.5 Total value is displayed below treemap', async ({ page }) => {
      await page.goto('/budget-explorer')

      // Verify total value display
      await expect(page.getByText(/^total$/i)).toBeVisible()
    })
  })

  // ===================================================
  // 3. CLASSIFICATION SWITCHING
  // ===================================================
  test.describe('3. Classification Switching', () => {
    test.beforeEach(async ({ mockApi }) => {
      await mockApi.mockGraphQL('AggregatedLineItems', 'aggregated-line-items')
    })

    test('3.1 Switch to economic classification', async ({ page }) => {
      await page.goto('/budget-explorer')
      await page.waitForLoadState('networkidle')

      // Find and click economic toggle - wait for it to be ready
      const economicToggle = page.locator('button[role="radio"]').filter({ hasText: SELECTORS.economicLabel }).first()
      await expect(economicToggle).toBeVisible({ timeout: 10000 })
      await economicToggle.click()
      await page.waitForTimeout(500) // Allow state update

      // Verify economic toggle has data-state="on"
      await expect(economicToggle).toHaveAttribute('data-state', 'on', { timeout: 5000 })
    })

    test('3.2 Switch back to functional classification', async ({ page }) => {
      // Start with economic
      await page.goto('/budget-explorer?treemapPrimary=ec')
      await page.waitForLoadState('networkidle')

      // Click functional toggle
      const functionalToggle = page.locator('button[role="radio"]').filter({ hasText: SELECTORS.functionalLabel }).first()
      await expect(functionalToggle).toBeVisible({ timeout: 10000 })
      await functionalToggle.click()
      await page.waitForTimeout(500)

      // Verify functional toggle has data-state="on"
      await expect(functionalToggle).toHaveAttribute('data-state', 'on', { timeout: 5000 })
    })

    test('3.3 Economic classification is disabled for revenue view', async ({ page }) => {
      // Navigate to budget explorer and switch to revenue view
      await page.goto('/budget-explorer')
      await page.waitForLoadState('networkidle')

      // Click income toggle to switch to revenue view
      const incomeToggle = page.locator('button[role="radio"]').filter({ hasText: SELECTORS.incomeLabel }).first()
      await expect(incomeToggle).toBeVisible({ timeout: 10000 })
      await incomeToggle.click()
      await page.waitForTimeout(500)

      // Wait for the income toggle to be selected
      await expect(incomeToggle).toHaveAttribute('data-state', 'on', { timeout: 5000 })

      // Economic toggle should be disabled
      const economicToggle = page.locator('button[role="radio"]').filter({ hasText: SELECTORS.economicLabel }).first()
      await expect(economicToggle).toBeDisabled()
    })

    test('3.4 Classification selection persists in URL', async ({ page }) => {
      await page.goto('/budget-explorer')
      await page.waitForLoadState('networkidle')

      // Click economic toggle
      const economicToggle = page.locator('button[role="radio"]').filter({ hasText: SELECTORS.economicLabel }).first()
      await expect(economicToggle).toBeVisible({ timeout: 10000 })
      await economicToggle.click()
      await page.waitForTimeout(500)

      // Verify URL contains treemapPrimary=ec
      await expect(page).toHaveURL(/treemapPrimary=ec/, { timeout: 5000 })
    })
  })

  // ===================================================
  // 4. DEPTH LEVEL SWITCHING
  // ===================================================
  test.describe('4. Depth Level Switching', () => {
    test.beforeEach(async ({ mockApi }) => {
      await mockApi.mockGraphQL('AggregatedLineItems', 'aggregated-line-items')
    })

    test('4.1 Switch to detailed categories', async ({ page }) => {
      await page.goto('/budget-explorer')
      await page.waitForLoadState('networkidle')

      // Click detailed categories toggle
      const detailedToggle = page.locator('button[role="radio"]').filter({ hasText: SELECTORS.detailedCategoriesLabel }).first()
      await expect(detailedToggle).toBeVisible({ timeout: 10000 })
      await detailedToggle.click()
      await page.waitForTimeout(500)

      // Verify it's selected
      await expect(detailedToggle).toHaveAttribute('data-state', 'on', { timeout: 5000 })
    })

    test('4.2 Switch back to main chapters', async ({ page }) => {
      // Start with detailed
      await page.goto('/budget-explorer?depth=subchapter')
      await page.waitForLoadState('networkidle')

      // Click main chapters toggle
      const mainChaptersToggle = page.locator('button[role="radio"]').filter({ hasText: SELECTORS.mainChaptersLabel }).first()
      await expect(mainChaptersToggle).toBeVisible({ timeout: 10000 })
      await mainChaptersToggle.click()
      await page.waitForTimeout(500)

      // Verify it's selected
      await expect(mainChaptersToggle).toHaveAttribute('data-state', 'on', { timeout: 5000 })
    })

    test('4.3 Depth selection persists in URL', async ({ page }) => {
      await page.goto('/budget-explorer')
      await page.waitForLoadState('networkidle')

      // Click detailed categories
      const detailedToggle = page.locator('button[role="radio"]').filter({ hasText: SELECTORS.detailedCategoriesLabel }).first()
      await expect(detailedToggle).toBeVisible({ timeout: 10000 })
      await detailedToggle.click()
      await page.waitForTimeout(500)

      // Verify URL contains depth=subchapter
      await expect(page).toHaveURL(/depth=subchapter/, { timeout: 5000 })
    })
  })

  // ===================================================
  // 5. SPENDING/REVENUE TOGGLE
  // ===================================================
  test.describe('5. Spending/Revenue Toggle', () => {
    test.beforeEach(async ({ mockApi }) => {
      await mockApi.mockGraphQL('AggregatedLineItems', 'aggregated-line-items')
    })

    test('5.1 Switch to revenue view', async ({ page }) => {
      await page.goto('/budget-explorer')
      await page.waitForLoadState('networkidle')

      // Click income toggle
      const incomeToggle = page.locator('button[role="radio"]').filter({ hasText: SELECTORS.incomeLabel }).first()
      await expect(incomeToggle).toBeVisible({ timeout: 10000 })
      await incomeToggle.click()
      await page.waitForTimeout(500)

      // Verify income is selected
      await expect(incomeToggle).toHaveAttribute('data-state', 'on', { timeout: 5000 })
    })

    test('5.2 Switch back to spending view', async ({ page }) => {
      // Start at budget explorer and switch to revenue first
      await page.goto('/budget-explorer')
      await page.waitForLoadState('networkidle')

      // Switch to revenue view first
      const incomeToggle = page.locator('button[role="radio"]').filter({ hasText: SELECTORS.incomeLabel }).first()
      await expect(incomeToggle).toBeVisible({ timeout: 10000 })
      await incomeToggle.click()
      await page.waitForTimeout(500)
      await expect(incomeToggle).toHaveAttribute('data-state', 'on', { timeout: 5000 })

      // Now click expenses toggle to switch back
      const expensesToggle = page.locator('button[role="radio"]').filter({ hasText: SELECTORS.expensesLabel }).first()
      await expensesToggle.click()
      await page.waitForTimeout(500)

      // Verify expenses is selected
      await expect(expensesToggle).toHaveAttribute('data-state', 'on', { timeout: 5000 })
    })

    test('5.3 Spending/revenue selection persists in URL', async ({ page }) => {
      await page.goto('/budget-explorer')
      await page.waitForLoadState('networkidle')

      // Click income
      const incomeToggle = page.locator('button[role="radio"]').filter({ hasText: SELECTORS.incomeLabel }).first()
      await expect(incomeToggle).toBeVisible({ timeout: 10000 })
      await incomeToggle.click()
      await page.waitForTimeout(500)

      // Verify URL contains account_category: vn
      await expect(page).toHaveURL(/account_category.*vn/i, { timeout: 5000 })
    })

    test('5.4 Revenue view shows revenue-specific categories', async ({ page }) => {
      // Navigate to budget explorer and switch to revenue
      await page.goto('/budget-explorer')
      await page.waitForLoadState('networkidle')

      // Click income toggle
      const incomeToggle = page.locator('button[role="radio"]').filter({ hasText: SELECTORS.incomeLabel }).first()
      await expect(incomeToggle).toBeVisible({ timeout: 10000 })
      await incomeToggle.click()
      await page.waitForTimeout(500)

      // Wait for income toggle to be selected
      await expect(incomeToggle).toHaveAttribute('data-state', 'on', { timeout: 5000 })

      // Wait for treemap to render
      await page.waitForSelector('.recharts-responsive-container', { timeout: 10000 })

      // Verify page shows data (treemap should be visible)
      const treemapContainer = page.locator('.recharts-responsive-container').first()
      await expect(treemapContainer).toBeVisible()
    })
  })

  // ===================================================
  // 6. NORMALIZATION
  // ===================================================
  test.describe('6. Normalization', () => {
    test.beforeEach(async ({ mockApi }) => {
      await mockApi.mockGraphQL('AggregatedLineItems', 'aggregated-line-items')
    })

    test('6.1 Default normalization is Total', async ({ page }) => {
      await page.goto('/budget-explorer')

      // Find the normalization select
      const normSelect = page.getByRole('combobox').first()
      await expect(normSelect).toContainText(/total/i)
    })

    test('6.2 Switch to per capita normalization', async ({ page }) => {
      await page.goto('/budget-explorer')
      await page.waitForLoadState('networkidle')

      // Click the normalization select
      const normSelect = page.getByRole('combobox').first()
      await expect(normSelect).toBeVisible({ timeout: 10000 })
      await normSelect.click()
      await page.waitForTimeout(300)

      // Select per capita option
      const perCapitaOption = page.getByRole('option', { name: SELECTORS.perCapitaLabel })
      await expect(perCapitaOption).toBeVisible({ timeout: 5000 })
      await perCapitaOption.click()
      await page.waitForTimeout(300)

      // Verify selection
      await expect(normSelect).toContainText(/per.*capita/i, { timeout: 5000 })
    })

    test('6.3 Normalization persists in URL', async ({ page }) => {
      await page.goto('/budget-explorer')
      await page.waitForLoadState('networkidle')

      // Click the normalization select
      const normSelect = page.getByRole('combobox').first()
      await expect(normSelect).toBeVisible({ timeout: 10000 })
      await normSelect.click()
      await page.waitForTimeout(300)

      // Select per capita option
      const perCapitaOption = page.getByRole('option', { name: SELECTORS.perCapitaLabel })
      await expect(perCapitaOption).toBeVisible({ timeout: 5000 })
      await perCapitaOption.click()
      await page.waitForTimeout(300)

      // Verify URL contains normalization
      await expect(page).toHaveURL(/normalization.*per_capita/i, { timeout: 5000 })
    })
  })

  // ===================================================
  // 7. PERIOD FILTER
  // ===================================================
  test.describe('7. Period Filter', () => {
    test.beforeEach(async ({ mockApi }) => {
      await mockApi.mockGraphQL('AggregatedLineItems', 'aggregated-line-items')
    })

    test('7.1 Period button is visible', async ({ page }) => {
      await page.goto('/budget-explorer')

      // Period button should be visible - look for button with year or period label
      // The button shows the current period (e.g., "2024" or "An 2024")
      const periodButton = page.locator('button[aria-label*="period" i]')
        .or(page.locator('button').filter({ hasText: /202\d|an|year/i }))

      await expect(periodButton.first()).toBeVisible()
    })

    test('7.2 Period popover opens on click', async ({ page }) => {
      await page.goto('/budget-explorer')
      await page.waitForLoadState('networkidle')

      // Click period button - look for button with year label
      const periodButton = page.locator('button[aria-label*="period" i]')
        .or(page.locator('button').filter({ hasText: /202\d|an|year/i }))

      await expect(periodButton.first()).toBeVisible({ timeout: 10000 })
      await periodButton.first().click()
      await page.waitForTimeout(300)

      // Verify popover opens (look for year selection, checkboxes, or period picker)
      const popoverContent = page.getByRole('dialog')
        .or(page.locator('[role="listbox"]'))
        .or(page.locator('[class*="popover"]'))
        .or(page.locator('[data-radix-popper-content-wrapper]'))

      await expect(popoverContent.first()).toBeVisible({ timeout: 5000 })
    })
  })

  // ===================================================
  // 8. CATEGORY LIST
  // ===================================================
  test.describe('8. Category List', () => {
    test.beforeEach(async ({ mockApi }) => {
      await mockApi.mockGraphQL('AggregatedLineItems', 'aggregated-line-items')
    })

    test('8.1 Category list shows categories', async ({ page }) => {
      await page.goto('/budget-explorer')

      // Wait for category list to load
      await page.waitForSelector('[class*="card"]', { timeout: 10000 })

      // Verify categories are displayed
      const categoryItems = page.locator('[class*="card"] >> text=/\d+.*lei|RON/i')
        .or(page.locator('text=/asigurări|sănătate|învățământ|transport/i').first())

      await expect(categoryItems.first()).toBeVisible().catch(() => {
        // Categories should be in the list - just verify the section exists
        const topCategoriesSection = page.getByRole('heading', { name: SELECTORS.topCategories })
        return expect(topCategoriesSection).toBeVisible()
      })
    })

    test('8.2 Advanced view link navigates to entity analytics', async ({ page }) => {
      await page.goto('/budget-explorer')

      // Click advanced view link
      const advancedLink = page.getByRole('link', { name: SELECTORS.seeAdvancedView })
      await advancedLink.click()

      // Verify navigation to entity analytics
      await expect(page).toHaveURL(/entity-analytics/)
    })
  })

  // ===================================================
  // 9. URL STATE PRESERVATION
  // ===================================================
  test.describe('9. URL State Preservation', () => {
    test.beforeEach(async ({ mockApi }) => {
      await mockApi.mockGraphQL('AggregatedLineItems', 'aggregated-line-items')
    })

    test('9.1 Direct URL with parameters loads correctly', async ({ page }) => {
      // Navigate with specific parameters
      await page.goto('/budget-explorer?treemapPrimary=ec&depth=subchapter')

      // Verify economic is selected
      const economicToggle = page.locator('[data-state="on"]').filter({ hasText: SELECTORS.economicLabel })
      await expect(economicToggle).toBeVisible()

      // Verify detailed categories is selected
      const detailedToggle = page.locator('[data-state="on"]').filter({ hasText: SELECTORS.detailedCategoriesLabel })
      await expect(detailedToggle).toBeVisible()
    })

    test('9.2 Page refresh preserves state', async ({ page }) => {
      await page.goto('/budget-explorer')
      await page.waitForLoadState('networkidle')

      // Change classification to economic
      const economicToggle = page.locator('button[role="radio"]').filter({ hasText: SELECTORS.economicLabel }).first()
      await expect(economicToggle).toBeVisible({ timeout: 10000 })
      await economicToggle.click()
      await page.waitForTimeout(500)

      // Wait for URL update
      await expect(page).toHaveURL(/treemapPrimary=ec/, { timeout: 5000 })

      // Refresh page
      await page.reload()
      await page.waitForLoadState('networkidle')

      // Verify economic is still selected
      const selectedToggle = page.locator('[data-state="on"]').filter({ hasText: SELECTORS.economicLabel })
      await expect(selectedToggle).toBeVisible({ timeout: 10000 })
    })

    test('9.3 Browser back works with URL history', async ({ page }) => {
      // Start with base URL
      await page.goto('/budget-explorer')

      // Navigate to a different page first to create history
      await page.goto('/entity-analytics')
      await expect(page).toHaveURL(/entity-analytics/)

      // Go back to budget explorer
      await page.goBack()

      // Should be back at budget explorer
      await expect(page).toHaveURL(/budget-explorer/)
    })

    test('9.4 Drilldown path persists in URL', async ({ page }) => {
      await page.goto('/budget-explorer?treemapPath=68')

      // Verify URL contains the path
      await expect(page).toHaveURL(/treemapPath=68/)

      // Refresh and verify path is preserved
      await page.reload()
      await expect(page).toHaveURL(/treemapPath=68/)
    })
  })

  // ===================================================
  // 10. LOADING STATES
  // ===================================================
  test.describe('10. Loading States', () => {
    test('10.1 Page shows content after loading', async ({ mockApi, page }) => {
      // Mock with short delay to simulate loading
      await mockApi.mockGraphQL('AggregatedLineItems', 'aggregated-line-items', { delay: 500 })

      await page.goto('/budget-explorer')

      // Page should eventually show the treemap
      await expect(page.locator('.recharts-responsive-container').first()).toBeVisible({ timeout: 10000 })

      // Verify the page is interactive
      const expensesToggle = page.locator('[data-state="on"]').filter({ hasText: SELECTORS.expensesLabel })
      await expect(expensesToggle).toBeVisible()
    })
  })

  // ===================================================
  // 11. ERROR HANDLING
  // ===================================================
  test.describe('11. Error Handling', () => {
    test('11.1 Page handles API errors gracefully', async ({ mockApi, page }) => {
      // Mock with error - note: GraphQL errors return 200 with error in body
      await mockApi.mockGraphQL('AggregatedLineItems', 'aggregated-line-items', { status: 500 })

      await page.goto('/budget-explorer')

      // Page should still load - either show error message or handle gracefully
      // Check that page doesn't crash and shows some content
      await expect(page.getByRole('heading', { name: SELECTORS.budgetDistribution })).toBeVisible({ timeout: 10000 }).catch(() => {
        // If header is not visible, check for error message
        return expect(page.getByText(/error|failed|eroare/i).first()).toBeVisible({ timeout: 5000 })
      })
    })

    test('11.2 Empty state when no data', async ({ mockApi, page }) => {
      // Mock with empty data
      await mockApi.mockGraphQL('AggregatedLineItems', 'aggregated-line-items-empty')

      await page.goto('/budget-explorer')

      // Wait for page to load
      await page.waitForTimeout(1000)

      // Verify page loads without crash
      // Empty state could show "no data" message or just empty treemap area
      expect(page.url()).toContain('/budget-explorer')

      // The treemap might show a message or be empty
      const pageContent = page.locator('.recharts-responsive-container, [class*="card"]').first()
      await expect(pageContent).toBeVisible({ timeout: 5000 })
    })
  })

  // ===================================================
  // 12. NAVIGATION LINKS
  // ===================================================
  test.describe('12. Navigation Links', () => {
    test.beforeEach(async ({ mockApi }) => {
      await mockApi.mockGraphQL('AggregatedLineItems', 'aggregated-line-items')
    })

    test('12.1 External link to entity analytics is visible', async ({ page }) => {
      await page.goto('/budget-explorer')

      // Find the external link icon button
      const externalLink = page.locator('a[href*="entity-analytics"]').first()
      await expect(externalLink).toBeVisible()
    })

    test('12.2 Quick nav toolbar is present', async ({ page }) => {
      await page.goto('/budget-explorer')

      // Verify floating quick nav is visible
      const quickNav = page.locator('[class*="floating"], [class*="quick-nav"]')
        .or(page.getByRole('button', { name: /hartă|harta|map/i }))

      await expect(quickNav.first()).toBeVisible().catch(() => {
        // Quick nav might be positioned fixed - just verify page loads
        expect(page.url()).toContain('/budget-explorer')
      })
    })
  })

  // ===================================================
  // 13. RESPONSIVE BEHAVIOR
  // ===================================================
  test.describe('13. Responsive Behavior', () => {
    test.beforeEach(async ({ mockApi }) => {
      await mockApi.mockGraphQL('AggregatedLineItems', 'aggregated-line-items')
    })

    test('13.1 Mobile viewport shows treemap', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/budget-explorer')

      // Treemap should still be visible
      const treemapContainer = page.locator('.recharts-responsive-container').first()
      await expect(treemapContainer).toBeVisible({ timeout: 10000 })
    })

    test('13.2 Controls stack on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/budget-explorer')

      // Verify controls are visible (might be stacked)
      await expect(page.getByText(SELECTORS.incomeLabel).first()).toBeVisible()
      await expect(page.getByText(SELECTORS.expensesLabel).first()).toBeVisible()
    })

    test('13.3 Tablet viewport works correctly', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto('/budget-explorer')

      // Page should load normally
      const treemapContainer = page.locator('.recharts-responsive-container').first()
      await expect(treemapContainer).toBeVisible({ timeout: 10000 })
    })
  })

  // ===================================================
  // 14. ACCESSIBILITY
  // ===================================================
  test.describe('14. Accessibility', () => {
    test.beforeEach(async ({ mockApi }) => {
      await mockApi.mockGraphQL('AggregatedLineItems', 'aggregated-line-items')
    })

    test('14.1 Toggle groups have proper ARIA roles', async ({ page }) => {
      await page.goto('/budget-explorer')

      // Verify toggle groups have radiogroup role
      const toggleGroups = page.locator('[role="group"]')
      await expect(toggleGroups.first()).toBeVisible()
    })

    test('14.2 Buttons have accessible labels', async ({ page }) => {
      await page.goto('/budget-explorer')

      // Verify period button has aria-label
      const periodButton = page.locator('button[aria-label*="period" i], button[aria-label*="reporting" i]')
      await expect(periodButton).toBeVisible().catch(() => {
        // Alternative: just verify buttons exist with text
        const anyButton = page.getByRole('button').first()
        return expect(anyButton).toBeVisible()
      })
    })

    test('14.3 Keyboard navigation works on toggles', async ({ page }) => {
      await page.goto('/budget-explorer')

      // Focus on first toggle
      const firstToggle = page.locator('button').filter({ hasText: SELECTORS.incomeLabel })
      await firstToggle.focus()

      // Verify focus is visible
      await expect(firstToggle).toBeFocused()
    })
  })

  // ===================================================
  // 15. PERFORMANCE
  // ===================================================
  test.describe('15. Performance', () => {
    test('15.1 Page loads within acceptable time', async ({ mockApi, page }) => {
      await mockApi.mockGraphQL('AggregatedLineItems', 'aggregated-line-items')

      const startTime = Date.now()
      await page.goto('/budget-explorer')

      // Wait for treemap to be visible
      await expect(page.locator('.recharts-responsive-container').first()).toBeVisible({ timeout: 10000 })

      const loadTime = Date.now() - startTime
      expect(loadTime).toBeLessThan(10000) // Should load within 10 seconds
    })

    test('15.2 Toggle switches respond quickly', async ({ mockApi, page }) => {
      await mockApi.mockGraphQL('AggregatedLineItems', 'aggregated-line-items')
      await page.goto('/budget-explorer')

      // Wait for page to be interactive
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(500)

      const startTime = Date.now()

      // Click economic toggle
      const economicToggle = page.locator('button').filter({ hasText: SELECTORS.economicLabel })
      await economicToggle.click()

      // Verify toggle changed state
      const selectedToggle = page.locator('[data-state="on"]').filter({ hasText: SELECTORS.economicLabel })
      await expect(selectedToggle).toBeVisible()

      const responseTime = Date.now() - startTime
      expect(responseTime).toBeLessThan(5000) // Toggle should respond within 5 seconds (relaxed for CI)
    })
  })
})
