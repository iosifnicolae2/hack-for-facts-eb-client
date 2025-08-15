/**
 * Comprehensive Tutorial: Entity Details – full feature tour
 * Spec references:
 * - docs/user-stories/entity-details.md
 * - docs/user-stories/README.md → Entity Details
 *
 * Covers:
 * - Header controls (year selector, view switcher, UAT/County chips, Wikipedia link)
 * - Expenses/Incomes accordions (expand basics)
 * - Reports (open accordion, show links)
 * - Expense Trends, Income Trends views
 * - Map view (if applicable)
 *
 * Notes:
 * - Each step captures a screenshot for documentation.
 * - Selectors are defensive to avoid flakiness; some actions are optional if control not present on a given entity.
 */
import { test, expect } from '@playwright/test'
import { captureStep, waitIdle } from './utils/tutorial-helpers'

test.describe('Tutorial – Entity Details (comprehensive)', () => {
  test('Full feature tour across views and key controls', async ({ page }, testInfo) => {
    let step = 0
    const next = async (title: string) => captureStep(page, testInfo, ++step, title)

    // Step 1: Open entity page (Sibiu – known rich data)
    await page.goto('/entities/4270740?view=overview')
    await waitIdle(page)
    await expect(page.getByRole('heading', { name: /MUNICIPIUL SIBIU/i })).toBeVisible()
    await next('Entity header and overview loaded')

    // Step 2: Header controls – Wikipedia and parent county
    const wiki = page.getByRole('link', { name: /Open on Wikipedia/i })
    if (await wiki.count()) {
      await expect(wiki).toHaveAttribute('href', /google\.com\/search/i)
    }
    const countyLink = page.getByRole('link').filter({ hasText: /JUDETUL|JUDEȚUL/i }).first()
    if (await countyLink.count()) {
      await expect(countyLink).toBeVisible()
    }
    await next('Header links (Wikipedia, parent county)')

    // Step 3: Change Reporting Year (dropdown)
    const yearTrigger = page.locator('button:has-text("Reporting year"), button:has-text("2024"), button:has-text("2023")').first()
    if (await yearTrigger.count()) {
      await yearTrigger.click()
      const option = page.getByRole('option', { name: '2023' })
      if (await option.count()) await option.click()
      await waitIdle(page)
    }
    await next('Changed reporting year via header selector')

    // Step 5: Composition analytics toggles (Income/Expenses, Bar/Pie)
    const incomeRadio = page.getByRole('radio', { name: 'Income' })
    if (await incomeRadio.count()) await incomeRadio.click()
    const pieRadio = page.getByRole('radio', { name: 'Pie chart' })
    if (await pieRadio.count()) await pieRadio.click()
    await next('Composition analytics toggled to Income + Pie')

    // Step 6: Expenses accordion – expand first category (if present)
    const expensesHeading = page.getByRole('heading', { name: /Expenses \(\d{4}\)/ })
    if (await expensesHeading.count()) {
      // Find first H3 heading under expenses block and click its button if exists
      const firstExpenseGroup = page.locator('h3:near(:text("Expenses"), 300)').first()
      if (await firstExpenseGroup.count()) await firstExpenseGroup.click({ trial: true }).catch(() => {})
    }
    await next('Inspect expenses composition (first groups)')

    // Step 7: Incomes accordion – ensure visible
    const incomesHeading = page.getByRole('heading', { name: /Incomes \(\d{4}\)/ })
    if (await incomesHeading.count()) {
      await incomesHeading.scrollIntoViewIfNeeded()
    }
    await next('Inspect incomes composition (first groups)')

    // Step 8: Open Reports – show download links
    const reportsAccordion = page.getByRole('button', { name: /Rapoarte Financiare/i })
    if (await reportsAccordion.count()) await reportsAccordion.click()
    await next('Open Reports accordion with Excel/PDF/XML links')

    // Step 9: Switch to Expense Trends view
    const expLink = page.getByRole('link', { name: /Expense Trends/i })
    if (await expLink.count()) {
      await expLink.click()
    } else {
      await page.goto('/entities/4270740?view=expense-trends')
    }
    await waitIdle(page)
    await next('Expense Trends – top categories over time')

    // Step 10: Switch to Income Trends view
    const incLink = page.getByRole('link', { name: /Income Trends/i })
    if (await incLink.count()) {
      await incLink.click()
    } else {
      await page.goto('/entities/4270740?view=income-trends')
    }
    await waitIdle(page)
    await next('Income Trends – top categories over time')

    // Step 11: Map view (if available for UAT/county entity)
    const mapLink = page.getByRole('link', { name: /^Map$/ })
    if (await mapLink.count()) {
      await mapLink.click()
      await waitIdle(page)
      await next('Map view – geographic context')
    }

    // Step 12: Return to Overview and finalize
    const overviewLink = page.getByRole('link', { name: /Overview/i })
    if (await overviewLink.count()) {
      await overviewLink.click()
      await waitIdle(page)
    } else {
      await page.goto('/entities/4270740?view=overview')
      await waitIdle(page)
    }
    await next('Back to Overview – ready to share or continue analysis')
  })
})


