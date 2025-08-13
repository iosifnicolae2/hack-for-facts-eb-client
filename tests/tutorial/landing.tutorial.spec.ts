/**
 * Tutorial: Getting started on the Homepage (Landing)
 * Spec references:
 * - docs/user-stories/README.md → Homepage and Step-by-step Tutorial, section 1
 * - docs/user-stories/landing-page.md
 * Goal: Show how to search for an entity and navigate to core sections.
 */
import { test, expect } from '@playwright/test'
import { captureStep, waitIdle } from './utils/tutorial-helpers'

test.describe('Tutorial – Landing', () => {
  test('Homepage tour and quick navigation', async ({ page }, testInfo) => {
    // Step 1: Open homepage
    await page.goto('/')
    await waitIdle(page)
    await expect(page.getByRole('heading', { name: 'Transparenta.eu' })).toBeVisible()
    await captureStep(page, testInfo, 1, 'Open homepage and verify hero content')

    // Step 2: Use entity search input
    const search = page.getByPlaceholder('Enter entity name or CUI...')
    await search.click()
    await search.type('Sibiu')
    await captureStep(page, testInfo, 2, 'Type in entity search to reveal suggestions')

    // Step 3: Keyboard select and go to entity
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await waitIdle(page)
    await captureStep(page, testInfo, 3, 'Navigate to selected entity via keyboard selection')

    // Step 4: Go back and open Map via card
    await page.goto('/')
    await page.getByRole('link', { name: 'Map Explore data through a map.' }).click()
    await waitIdle(page)
    await captureStep(page, testInfo, 4, 'Open Map from homepage card')

    // Step 5: Return to homepage and open Entity Analytics via card
    await page.goto('/')
    await page.getByRole('link', { name: 'Entities Explore entities by aggregated values.' }).click()
    await waitIdle(page)
    await captureStep(page, testInfo, 5, 'Open Entity Analytics from homepage card')
  })
})


