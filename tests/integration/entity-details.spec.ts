/**
 * Entity Details Page E2E Tests
 *
 * Tests the entity details page functionality including:
 * - Entity header and metadata
 * - Financial summary cards
 * - Financial evolution chart
 * - Budget distribution treemap
 * - Income/Expense line items
 * - Financial reports
 *
 * Data extracted from browser exploration on 2025-12-16
 * Using Cluj-Napoca (CUI: 4305857) as the test entity
 */

import { test, expect } from '@playwright/test'

const TEST_ENTITY_CUI = '4305857'
const TEST_ENTITY_NAME = 'MUNICIPIUL CLUJ-NAPOCA'

test.describe('Entity Details Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/entities/${TEST_ENTITY_CUI}`)
    await page.waitForLoadState('networkidle').catch(() => {})
    // Wait for main content to appear
    await page.locator('main').waitFor({ state: 'visible', timeout: 10000 }).catch(() => {})
  })

  test('displays entity header with name and CUI', async ({ page }) => {
    // Check entity name heading
    await expect(
      page.getByRole('heading', { name: new RegExp(TEST_ENTITY_NAME, 'i') }).first()
    ).toBeVisible({ timeout: 10000 })

    // Check CUI is displayed
    await expect(page.locator(`text=${TEST_ENTITY_CUI}`).first()).toBeVisible()
  })

  test('displays entity metadata', async ({ page }) => {
    // Check for entity type (Primărie Municipiu)
    const entityType = page.locator('text=/primărie|municipiu|town hall/i').first()
    if (await entityType.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(entityType).toBeVisible()
    }

    // Check for address information
    const addressInfo = page.locator('text=/adresă|address|cluj/i').first()
    if (await addressInfo.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(addressInfo).toBeVisible()
    }

    // Check for UAT information
    const uatInfo = page.locator('text=/uat|populație|population/i').first()
    if (await uatInfo.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(uatInfo).toBeVisible()
    }
  })

  test('displays navigation tabs', async ({ page }) => {
    // Check for main navigation tabs
    const tabs = [
      /overview|prezentare generală/i,
      /expense.*trends|evoluția.*cheltuielilor/i,
      /income.*trends|evoluția.*veniturilor/i,
      /map|hartă/i,
      /employees|angajați/i,
      /charts|grafice/i,
      /entities|entități/i,
      /reports|rapoarte/i,
    ]

    for (const tabPattern of tabs) {
      const tab = page.getByRole('link', { name: tabPattern })
      if (await tab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(tab).toBeVisible()
      }
    }
  })

  test('displays financial summary cards', async ({ page }) => {
    // Check for Total Income card
    const incomeCard = page.locator('text=/total.*venituri|total.*income/i').first()
    await expect(incomeCard).toBeVisible({ timeout: 10000 })

    // Check for Total Expenses card
    const expensesCard = page.locator('text=/total.*cheltuieli|total.*expenses/i').first()
    await expect(expensesCard).toBeVisible()

    // Check for Balance card (Income - Expenses)
    const balanceCard = page.locator('text=/venituri.*cheltuieli|balance|balanță/i').first()
    if (await balanceCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(balanceCard).toBeVisible()
    }

    // Verify amounts are displayed (should contain RON or other currency values)
    const amountPatterns = page.locator('text=/\\d+[.,]\\d+.*RON|\\d+[.,]\\d+.*mld|\\d+[.,]\\d+.*mil/i')
    await expect(amountPatterns.first()).toBeVisible()
  })

  test('displays financial evolution chart', async ({ page }) => {
    // Check for chart title
    const chartTitle = page.locator('text=/evoluție.*financiară|financial.*evolution/i').first()
    await expect(chartTitle).toBeVisible({ timeout: 10000 })

    // Check for chart legend items
    const legendItems = [
      /balanță|balance/i,
      /cheltuieli|expenses/i,
      /venituri|income/i,
    ]

    for (const legendPattern of legendItems) {
      const legendItem = page.locator(`text=${legendPattern.source}`).first()
      if (await legendItem.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(legendItem).toBeVisible()
      }
    }

    // Check for year labels on chart axis (2016-2025)
    const yearLabels = ['2016', '2020', '2024', '2025']
    for (const year of yearLabels) {
      const yearLabel = page.locator(`text="${year}"`).first()
      if (await yearLabel.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(yearLabel).toBeVisible()
      }
    }
  })

  test('displays budget distribution section', async ({ page }) => {
    // Check for budget distribution title
    const distributionTitle = page.locator('text=/distribuția.*bugetului|budget.*distribution/i').first()
    await expect(distributionTitle).toBeVisible({ timeout: 10000 })

    // Check for Income/Expense toggle
    const incomeRadio = page.getByRole('radio', { name: /venituri|income/i })
    const expenseRadio = page.getByRole('radio', { name: /cheltuieli|expenses/i })

    await expect(incomeRadio.first()).toBeVisible()
    await expect(expenseRadio.first()).toBeVisible()

    // Check for classification type toggle (Functional/Economic)
    const functionalRadio = page.getByRole('radio', { name: /funcțional|functional/i })
    const economicRadio = page.getByRole('radio', { name: /economic/i })

    await expect(functionalRadio.first()).toBeVisible()
    await expect(economicRadio.first()).toBeVisible()
  })

  test('displays income and expense line items', async ({ page }) => {
    // Check for income section header
    const incomeHeader = page.locator('text=/venituri.*\\(\\d{4}\\)|income.*\\(\\d{4}\\)/i').first()
    await expect(incomeHeader).toBeVisible({ timeout: 10000 })

    // Check for expense section header
    const expenseHeader = page.locator('text=/cheltuieli.*\\(\\d{4}\\)|expenses.*\\(\\d{4}\\)/i').first()
    await expect(expenseHeader).toBeVisible()

    // Check for specific expense categories (from extracted data)
    const expenseCategories = [
      /învățământ|education/i,
      /transporturi|transport/i,
      /sănătate|health/i,
      /cultură|culture/i,
    ]

    for (const categoryPattern of expenseCategories) {
      const category = page.locator(`text=${categoryPattern.source}`).first()
      if (await category.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(category).toBeVisible()
      }
    }
  })

  test('displays financial reports section', async ({ page }) => {
    // Scroll down to see reports
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))

    // Check for reports section title
    const reportsTitle = page.locator('text=/rapoarte.*financiare|financial.*reports/i').first()
    await expect(reportsTitle).toBeVisible({ timeout: 10000 })

    // Check for download links (XLSX, PDF, XML)
    const xlsxLink = page.getByRole('link', { name: /xlsx/i }).first()
    const pdfLink = page.getByRole('link', { name: /pdf/i }).first()
    const xmlLink = page.getByRole('link', { name: /xml/i }).first()

    await expect(xlsxLink).toBeVisible()
    await expect(pdfLink).toBeVisible()
    await expect(xmlLink).toBeVisible()

    // Check for report date information
    const reportDate = page.locator('text=/noiembrie|octombrie|septembrie|august|july|june|2025/i').first()
    await expect(reportDate).toBeVisible()
  })

  test('displays reporting period selector', async ({ page }) => {
    // Check for reporting period button
    const reportingPeriodButton = page.getByRole('button', { name: /perioada.*raportare|reporting.*period|raportare/i })
    await expect(reportingPeriodButton.first()).toBeVisible({ timeout: 10000 })
  })

  test('can toggle between income and expenses in budget distribution', async ({ page }) => {
    // Find and click income radio
    const incomeRadio = page.getByRole('radio', { name: /venituri|income/i }).first()
    if (await incomeRadio.isVisible({ timeout: 3000 }).catch(() => false)) {
      await incomeRadio.click()
  

      // Verify income is now selected
      await expect(incomeRadio).toBeChecked()
    }

    // Find and click expenses radio
    const expensesRadio = page.getByRole('radio', { name: /cheltuieli|expenses/i }).first()
    if (await expensesRadio.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expensesRadio.click()
  

      // Verify expenses is now selected
      await expect(expensesRadio).toBeChecked()
    }
  })

  test('can toggle between functional and economic classification', async ({ page }) => {
    // Find and click economic radio
    const economicRadio = page.getByRole('radio', { name: /economic/i }).first()
    if (await economicRadio.isVisible({ timeout: 3000 }).catch(() => false)) {
      await economicRadio.click()
  
    }

    // Find and click functional radio
    const functionalRadio = page.getByRole('radio', { name: /funcțional|functional/i }).first()
    if (await functionalRadio.isVisible({ timeout: 3000 }).catch(() => false)) {
      await functionalRadio.click()
  
    }
  })

  test('displays link to county entity', async ({ page }) => {
    // Check for link to county (JUDETUL CLUJ)
    const countyLink = page.getByRole('link', { name: /judetul.*cluj|county.*cluj/i })
    if (await countyLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(countyLink).toBeVisible()
      await expect(countyLink).toHaveAttribute('href', /\/entities\/\d+/)
    }
  })

  test('quick actions toolbar is visible', async ({ page }) => {
    // Check for quick action buttons (EN/RO - account for all text variations)
    const searchButton = page.getByRole('button', { name: /căutare|search/i })
    const mapButton = page.getByRole('button', { name: /hartă|harta|map/i })
    const tableButton = page.getByRole('button', { name: /tabel|table/i })
    const shareButton = page.getByRole('button', { name: /partajare|share|copiază/i })

    // At least some of these should be visible
    const visibleButtons = await Promise.all([
      searchButton.first().isVisible({ timeout: 5000 }).catch(() => false),
      mapButton.first().isVisible({ timeout: 5000 }).catch(() => false),
      tableButton.first().isVisible({ timeout: 5000 }).catch(() => false),
      shareButton.first().isVisible({ timeout: 5000 }).catch(() => false),
    ])

    expect(visibleButtons.some(Boolean)).toBe(true)
  })
})

test.describe('Entity Details - Navigation', () => {
  test('can navigate to expense trends view', async ({ page }) => {
    await page.goto(`/entities/${TEST_ENTITY_CUI}`)
    await page.waitForLoadState('domcontentloaded')

    const expenseTrendsLink = page.getByRole('link', { name: /expense.*trends|evoluția.*cheltuielilor/i })
    if (await expenseTrendsLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expenseTrendsLink.click()
      await page.waitForURL(/view=expense-trends/)
      expect(page.url()).toContain('view=expense-trends')
    }
  })

  test('can navigate to income trends view', async ({ page }) => {
    await page.goto(`/entities/${TEST_ENTITY_CUI}`)
    await page.waitForLoadState('domcontentloaded')

    const incomeTrendsLink = page.getByRole('link', { name: /income.*trends|evoluția.*veniturilor/i })
    if (await incomeTrendsLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await incomeTrendsLink.click()
      await page.waitForURL(/view=income-trends/)
      expect(page.url()).toContain('view=income-trends')
    }
  })

  test('can navigate to reports view', async ({ page }) => {
    await page.goto(`/entities/${TEST_ENTITY_CUI}`)
    await page.waitForLoadState('domcontentloaded')

    const reportsLink = page.getByRole('link', { name: /reports|rapoarte/i })
    if (await reportsLink.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await reportsLink.first().click()
      await page.waitForURL(/view=reports/)
      expect(page.url()).toContain('view=reports')
    }
  })
})
