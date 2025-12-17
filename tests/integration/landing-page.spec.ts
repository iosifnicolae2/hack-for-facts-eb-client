/**
 * Landing Page Integration Tests
 *
 * Tests the landing page functionality including:
 * - Main heading and search
 * - Navigation cards
 * - Quick entity links
 * - Global controls (currency, language, price type)
 * - Footer links
 */

import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for main heading to ensure page is loaded
    await expect(
      page.getByRole('heading', { name: 'Transparenta.eu', level: 1 })
    ).toBeVisible({ timeout: 10000 })
  })

  test('displays main heading and entity search', async ({ page }) => {
    // Check main heading
    await expect(
      page.getByRole('heading', { name: 'Transparenta.eu', level: 1 })
    ).toBeVisible()

    // Check entity search combobox is present
    await expect(
      page.getByRole('combobox', { name: /entit|cui/i })
    ).toBeVisible({ timeout: 5000 })
  })

  test('displays navigation cards with correct links', async ({ page }) => {
    // Map card
    const mapCard = page.getByRole('link', { name: /hartă|map/i }).filter({
      has: page.locator('img[alt*="Map preview"]'),
    })
    await expect(mapCard).toBeVisible({ timeout: 5000 })
    await expect(mapCard).toHaveAttribute('href', '/map')

    // Budget Explorer card
    const budgetCard = page.getByRole('link', { name: /explorator bugetar|budget explorer/i }).filter({
      has: page.locator('img[alt*="Budget explorer preview"]'),
    })
    await expect(budgetCard).toBeVisible({ timeout: 5000 })
    await expect(budgetCard).toHaveAttribute('href', '/budget-explorer')

    // Entity Analytics card
    const entitiesCard = page.getByRole('link', { name: /entități|entities/i }).filter({
      has: page.locator('img[alt*="Entity analytics preview"]'),
    })
    await expect(entitiesCard).toBeVisible({ timeout: 5000 })
    await expect(entitiesCard).toHaveAttribute('href', '/entity-analytics')

    // Charts card
    const chartsCard = page.getByRole('link', { name: /grafice|charts/i }).filter({
      has: page.locator('img[alt*="Charts preview"]'),
    })
    await expect(chartsCard).toBeVisible({ timeout: 5000 })
    await expect(chartsCard).toHaveAttribute('href', '/charts')
  })

  test('displays quick entity links', async ({ page }) => {
    // Check for specific pre-populated entity links
    await expect(
      page.getByRole('link', { name: /Mun\. Sibiu.*\[4270740\]/i })
    ).toBeVisible({ timeout: 5000 })

    await expect(
      page.getByRole('link', { name: /Mun\. București.*\[4267117\]/i })
    ).toBeVisible({ timeout: 5000 })

    await expect(
      page.getByRole('link', { name: /Mun\. Cluj-Napoca.*\[4305857\]/i })
    ).toBeVisible({ timeout: 5000 })
  })

  test('displays global controls (currency, language, price type)', async ({ page }) => {
    // Currency selector - find container with "Monedă" label
    const currencySection = page.locator('div').filter({ hasText: /^Monedă/ }).first()
    await expect(currencySection).toBeVisible({ timeout: 5000 })
    // Verify it has currency buttons
    await expect(currencySection.getByRole('button', { name: '🇪🇺' })).toBeVisible()
    await expect(currencySection.getByRole('button', { name: '🇺🇸' })).toBeVisible()

    // Price type selector - find container with "Prețuri" label
    const priceSection = page.locator('div').filter({ hasText: /^Prețuri/ }).first()
    await expect(priceSection).toBeVisible({ timeout: 5000 })
    // Verify it has N and R buttons
    await expect(priceSection.getByRole('button', { name: 'N' })).toBeVisible()
    await expect(priceSection.getByRole('button', { name: 'R' })).toBeVisible()

    // Language selector - find container with "Limbă" label
    const languageSection = page.locator('div').filter({ hasText: /^Limbă/ }).first()
    await expect(languageSection).toBeVisible({ timeout: 5000 })
    // Verify it has language buttons
    await expect(languageSection.getByRole('button', { name: '🇬🇧' })).toBeVisible()
  })

  test('entity search combobox is functional', async ({ page }) => {
    const searchInput = page.getByRole('combobox', { name: /entit|cui/i })
    await expect(searchInput).toBeVisible({ timeout: 5000 })

    // Fill search
    await searchInput.fill('Cluj')

    // Wait for search results to appear (debounced)
    await expect(
      page.getByText(/Cluj-Napoca/i).first()
    ).toBeVisible({ timeout: 5000 })
  })

  test('clicking entity link navigates to entity page', async ({ page }) => {
    // Click on Cluj-Napoca link
    const entityLink = page.getByRole('link', { name: /Mun\. Cluj-Napoca.*\[4305857\]/i })
    await expect(entityLink).toBeVisible({ timeout: 5000 })
    await entityLink.click()

    // Verify navigation
    await page.waitForURL(/\/entities\/4305857/)
    expect(page.url()).toContain('/entities/4305857')
  })

  test('footer contains expected links', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    // Check footer links
    await expect(
      page.getByRole('link', { name: 'GitHub' })
    ).toBeVisible({ timeout: 5000 })

    await expect(
      page.getByRole('link', { name: 'LinkedIn' })
    ).toBeVisible({ timeout: 5000 })

    await expect(
      page.getByRole('link', { name: /confidențialitate|privacy/i })
    ).toBeVisible({ timeout: 5000 })

    await expect(
      page.getByRole('link', { name: /termeni|terms/i })
    ).toBeVisible({ timeout: 5000 })
  })

  test('header logo links to home', async ({ page }) => {
    const logo = page.getByRole('link', { name: /Transparenta\.eu/i }).first()
    await expect(logo).toHaveAttribute('href', '/')
  })
})
