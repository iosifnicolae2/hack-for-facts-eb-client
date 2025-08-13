/**
 * Comprehensive Tutorial: Charts List – organize and manage your chart library
 * Spec references:
 * - docs/user-stories/charts-list.md
 * - docs/user-stories/README.md → Chart Builder overview
 */
import { test, expect } from '@playwright/test'
import { captureStep, waitIdle } from './utils/tutorial-helpers'

test.describe('Tutorial – Charts List (comprehensive)', () => {
  test('Search, sort, favorites, categories, backup/restore entry points', async ({ page }, testInfo) => {
    let step = 0
    const next = async (title: string) => captureStep(page, testInfo, ++step, title)

    // Step 1: Open list
    await page.goto('/charts')
    await waitIdle(page)
    await expect(page.getByRole('heading', { name: /^Charts$/ })).toBeVisible()
    await next('Charts list – header and controls visible')

    // Step 2: Use search with sample text
    const search = page.getByRole('textbox', { name: /Search charts/i })
    await search.fill('education #budget')
    await next('Typed search with hashtag category filter')

    // Step 3: Change sort
    const sort = page.getByRole('combobox')
    await sort.click()
    const opt = page.getByRole('option', { name: 'Newest' })
    if (await opt.count()) await opt.click()
    await next('Sort by Newest')

    // Step 4: Backup/Restore presence
    const backup = page.getByRole('button', { name: /Backup/i })
    const restore = page.getByRole('button', { name: /Restore/i })
    if (await backup.count() && await restore.count()) {
      await next('Backup and Restore actions visible')
    }

    // Step 5: Create chart CTA
    await page.getByRole('link', { name: /Create chart|Create your first chart/ }).first().scrollIntoViewIfNeeded()
    await next('Create chart CTA present')
  })
})


