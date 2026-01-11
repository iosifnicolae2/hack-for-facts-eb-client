/**
 * Integration Test Helpers
 *
 * Provides reliable waiting strategies for flaky-free integration tests.
 * Key principles:
 * 1. Never use waitForTimeout - it's inherently flaky
 * 2. Always wait for specific state changes (URL, attributes, text)
 * 3. Wait for hydration before interacting with elements
 * 4. Use Playwright's auto-retry assertions
 */

import type { Page, Locator } from '@playwright/test'
import { expect } from '@playwright/test'

/**
 * Wait for the page to be fully hydrated and interactive.
 * This ensures React has mounted and hydrated all components.
 */
export async function waitForHydration(page: Page): Promise<void> {
  // Wait for network to settle (API calls complete)
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
    // networkidle might timeout in some cases, continue anyway
  })

  // Wait for any loading skeletons to disappear
  const skeleton = page.locator('.animate-pulse, [class*="skeleton"]').first()
  await skeleton.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
    // Skeleton might not exist, continue
  })
}

/**
 * Click a toggle and wait for its state to change.
 * Uses URL as source of truth when urlPattern is provided.
 */
export async function clickToggleAndWait(
  page: Page,
  toggle: Locator,
  options: {
    /** Expected URL pattern after click (regex) */
    expectedUrl?: RegExp
    /** Expected data-state value after click */
    expectedState?: 'on' | 'off'
    /** Timeout for waiting */
    timeout?: number
  } = {}
): Promise<void> {
  const { expectedUrl, expectedState = 'on', timeout = 10000 } = options

  // Ensure toggle is visible and enabled before clicking
  await expect(toggle).toBeVisible({ timeout })
  await expect(toggle).toBeEnabled({ timeout })

  // Get current state to detect change
  const currentState = await toggle.getAttribute('data-state')

  // Perform the click
  await toggle.click()

  // Wait for URL change if pattern provided (URL is source of truth)
  if (expectedUrl) {
    await expect(page).toHaveURL(expectedUrl, { timeout })
  }

  // Wait for toggle state to update
  // Only check if we expect a state change
  if (currentState !== expectedState) {
    await expect(toggle).toHaveAttribute('data-state', expectedState, { timeout })
  }
}

/**
 * Click a toggle that updates URL parameters and verify the change.
 * More reliable than checking element state directly.
 */
export async function clickToggleWithUrlVerification(
  page: Page,
  toggle: Locator,
  urlPattern: RegExp,
  timeout = 10000
): Promise<void> {
  // Wait for toggle to be interactable
  await expect(toggle).toBeVisible({ timeout })
  await expect(toggle).toBeEnabled({ timeout })

  // Click and wait for URL
  await toggle.click()
  await expect(page).toHaveURL(urlPattern, { timeout })

  // After URL updates, the component should re-render with correct state
  // Give React a moment to reconcile state from URL
  await expect(toggle).toHaveAttribute('data-state', 'on', { timeout })
}

/**
 * Select an option from a combobox/select and verify the selection.
 */
export async function selectOptionAndWait(
  page: Page,
  combobox: Locator,
  optionLocator: Locator,
  expectedText: RegExp,
  timeout = 10000
): Promise<void> {
  // Open the combobox
  await expect(combobox).toBeVisible({ timeout })
  await combobox.click()

  // Wait for dropdown to open and option to be visible
  await expect(optionLocator).toBeVisible({ timeout })

  // Click the option
  await optionLocator.click()

  // Verify selection - combobox should now contain the expected text
  await expect(combobox).toContainText(expectedText, { timeout })
}

/**
 * Wait for a specific URL parameter to be present.
 * Useful for verifying state persistence.
 */
export async function waitForUrlParam(
  page: Page,
  paramPattern: RegExp,
  timeout = 10000
): Promise<void> {
  await expect(page).toHaveURL(paramPattern, { timeout })
}

/**
 * Verify a toggle group has the expected item selected.
 */
export async function verifyToggleGroupState(
  page: Page,
  groupSelector: string,
  expectedOnText: RegExp,
  timeout = 10000
): Promise<void> {
  const selectedToggle = page.locator(`${groupSelector} [data-state="on"]`)
  await expect(selectedToggle.filter({ hasText: expectedOnText })).toBeVisible({ timeout })
}

/**
 * Wait for page content to be interactive (not in loading state).
 */
export async function waitForPageReady(page: Page): Promise<void> {
  // Wait for basic load
  await page.waitForLoadState('domcontentloaded')

  // Wait for main content to be present
  await page.waitForSelector('.recharts-responsive-container, [class*="card"]', {
    timeout: 15000,
    state: 'visible',
  }).catch(() => {
    // Content might not have recharts, continue
  })

  // Wait for hydration
  await waitForHydration(page)
}

/**
 * Safely click an element, ensuring it's ready for interaction.
 */
export async function safeClick(
  locator: Locator,
  timeout = 10000
): Promise<void> {
  await expect(locator).toBeVisible({ timeout })
  await expect(locator).toBeEnabled({ timeout })
  await locator.click()
}
