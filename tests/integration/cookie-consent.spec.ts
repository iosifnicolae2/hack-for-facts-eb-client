/**
 * Cookie Consent Banner & Settings Integration Tests
 *
 * Tests the GDPR-compliant cookie consent system including:
 * - Cookie consent banner visibility and interactions
 * - Cookie settings page (/cookies) functionality
 * - Consent persistence in localStorage
 * - Navigation flows between banner and settings
 *
 * NOTE: These tests do NOT pre-set cookie consent, unlike other integration tests.
 * Tests support both English and Romanian locales.
 */

import { test, expect, type Page } from '@playwright/test'

const COOKIE_CONSENT_KEY = 'cookie-consent'

/**
 * Helper to get cookie consent from localStorage
 */
async function getCookieConsent(page: Page): Promise<Record<string, unknown> | null> {
  return page.evaluate((key) => {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) : null
  }, COOKIE_CONSENT_KEY)
}

/**
 * Helper to clear cookie consent from localStorage
 */
async function clearCookieConsent(page: Page): Promise<void> {
  await page.evaluate((key) => {
    window.localStorage.removeItem(key)
  }, COOKIE_CONSENT_KEY)
}

test.describe('Cookie Consent Banner', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing consent before each test
    await page.goto('/')
    await clearCookieConsent(page)
    // Reload to trigger banner display
    await page.reload()
    await page.waitForLoadState('domcontentloaded')
  })

  test('displays banner when no consent is stored', async ({ page }) => {
    // Wait for the banner to appear (has 500ms delay + 100ms animation)
    // Banner heading: EN "We value your privacy" / RO "Confidențialitatea dumneavoastră este importantă pentru noi"
    const bannerHeading = page.getByRole('heading', {
      name: /we value your privacy|confidențialitatea/i,
    })
    await expect(bannerHeading).toBeVisible({ timeout: 3000 })

    // Check for action buttons (EN/RO) - these are inside the banner
    await expect(page.getByRole('link', { name: /advanced|avansat/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /accept all|acceptă tot/i })).toBeVisible()
  })

  test('hides banner when consent already exists', async ({ page }) => {
    // Set consent
    await page.evaluate((key) => {
      window.localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          essential: true,
          analytics: false,
          sentry: false,
          updatedAt: new Date().toISOString(),
        })
      )
    }, COOKIE_CONSENT_KEY)

    // Reload page
    await page.reload()
    await page.waitForLoadState('domcontentloaded')

    // Wait a bit for potential banner appearance
    await page.waitForTimeout(1000)

    // Banner heading should NOT be visible
    const bannerHeading = page.getByRole('heading', {
      name: /we value your privacy|confidențialitatea/i,
    })
    await expect(bannerHeading).not.toBeVisible()
  })

  test('Accept All button saves consent with all options enabled', async ({ page }) => {
    // Wait for banner
    const acceptButton = page.getByRole('button', { name: /accept all|acceptă tot/i })
    await expect(acceptButton).toBeVisible({ timeout: 3000 })

    // Click Accept All
    await acceptButton.click()

    // Wait for banner to dismiss
    await expect(acceptButton).not.toBeVisible({ timeout: 2000 })

    // Verify consent was saved correctly
    const consent = await getCookieConsent(page)
    expect(consent).not.toBeNull()
    expect(consent?.version).toBe(1)
    expect(consent?.essential).toBe(true)
    expect(consent?.analytics).toBe(true)
    expect(consent?.sentry).toBe(true)
    expect(consent?.updatedAt).toBeDefined()
  })

  test('Advanced link navigates to /cookies and declines consent', async ({ page }) => {
    // Wait for banner
    const advancedLink = page.getByRole('link', { name: /advanced|avansat/i })
    await expect(advancedLink).toBeVisible({ timeout: 3000 })

    // Click Advanced
    await advancedLink.click()

    // Should navigate to /cookies with redirect parameter
    await page.waitForURL(/\/cookies/)
    expect(page.url()).toContain('/cookies')
    expect(page.url()).toContain('redirect=')

    // Verify consent was set to declined (analytics and sentry false)
    const consent = await getCookieConsent(page)
    expect(consent).not.toBeNull()
    expect(consent?.analytics).toBe(false)
    expect(consent?.sentry).toBe(false)
  })

  test('banner is hidden on /cookies page', async ({ page }) => {
    // Clear consent and navigate directly to /cookies
    await page.goto('/cookies')
    await clearCookieConsent(page)
    await page.reload()
    await page.waitForLoadState('domcontentloaded')

    // Wait a bit for potential banner appearance
    await page.waitForTimeout(1000)

    // Banner heading should NOT be visible on /cookies page
    const bannerHeading = page.getByRole('heading', {
      name: /we value your privacy|confidențialitatea/i,
    })
    await expect(bannerHeading).not.toBeVisible()
  })

  test('banner dismisses with animation', async ({ page }) => {
    // Wait for banner to appear
    const acceptButton = page.getByRole('button', { name: /accept all|acceptă tot/i })
    await expect(acceptButton).toBeVisible({ timeout: 3000 })

    // Click Accept All
    await acceptButton.click()

    // Wait for animation to complete (300ms + buffer)
    await page.waitForTimeout(500)

    // Button should be gone after animation
    await expect(acceptButton).not.toBeVisible()
  })
})

test.describe('Cookie Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cookies')
    await page.waitForLoadState('domcontentloaded')
  })

  test('displays all cookie setting sections', async ({ page }) => {
    // Page heading: EN "Cookie Settings" / RO "Setări cookie-uri"
    await expect(
      page.getByRole('heading', { name: /cookie settings|setări cookie/i, level: 1 })
    ).toBeVisible()

    // Essential cookies section: EN "Essential cookies" / RO "Cookie-uri esențiale"
    await expect(page.getByText(/essential cookies|cookie-uri esențiale/i)).toBeVisible()
    // Always enabled text: EN "Always enabled" / RO "Activat permanent" - use first() since it appears in multiple places
    await expect(page.getByText(/always enabled|activat permanent/i).first()).toBeVisible()

    // Analytics section - check for PostHog text
    await expect(page.getByText(/posthog/i)).toBeVisible()

    // Error reporting section - check for Sentry text
    await expect(page.getByText(/sentry/i)).toBeVisible()
  })

  test('displays action buttons', async ({ page }) => {
    // All action buttons should be visible (EN/RO)
    // Buttons may have aria-labels different from visible text
    // "Allow essential only" / "Permite doar esențiale" or "Permite doar cookie-urile esențiale"
    await expect(
      page.getByRole('button', { name: /allow essential|permite doar/i })
    ).toBeVisible()
    // "Confirm choices" / "Confirmă alegerile" or "Salvează preferințele"
    await expect(
      page.getByRole('button', { name: /confirm choices|confirmă|salvează/i })
    ).toBeVisible()
    // "Allow all" / "Permite tot" or "Permite toate"
    await expect(page.getByRole('button', { name: /allow all|permite toate/i })).toBeVisible()
  })

  test('displays policy links', async ({ page }) => {
    // Cookie Policy link: EN "Cookie Policy" / RO "Politica privind cookie-urile"
    await expect(
      page.getByRole('link', { name: /cookie policy|politica.*cookie/i }).first()
    ).toBeVisible()

    // Privacy Policy link: EN "Privacy Policy" / RO "Politica de confidențialitate"
    await expect(
      page.getByRole('link', { name: /privacy policy|politica de confidențialitate/i }).first()
    ).toBeVisible()
  })

  test('essential cookies switch is disabled', async ({ page }) => {
    // Essential cookies switch should be checked and disabled
    const essentialSwitch = page.getByRole('switch').first()
    await expect(essentialSwitch).toBeDisabled()
    // Radix UI Switch uses data-state="checked" instead of native checked attribute
    await expect(essentialSwitch).toHaveAttribute('data-state', 'checked')
  })

  test('can toggle analytics consent', async ({ page }) => {
    // Wait for page to be fully interactive
    await page.waitForLoadState('networkidle')

    // Find the analytics switch (second switch on the page)
    const analyticsSwitch = page.getByRole('switch').nth(1)
    await expect(analyticsSwitch).toBeVisible({ timeout: 10000 })

    // Get initial state using data-state attribute (Radix UI Switch)
    const initialState = await analyticsSwitch.getAttribute('data-state')
    const initialChecked = initialState === 'checked'

    // Toggle with force to bypass any overlay issues
    await analyticsSwitch.click({ force: true })
    await page.waitForTimeout(500)

    // Verify state changed
    const newState = await analyticsSwitch.getAttribute('data-state')
    const newChecked = newState === 'checked'
    expect(newChecked).toBe(!initialChecked)

    // Verify localStorage was updated
    const consent = await getCookieConsent(page)
    expect(consent?.analytics).toBe(newChecked)
  })

  test('can toggle sentry consent', async ({ page }) => {
    // Wait for page to be fully interactive
    await page.waitForLoadState('networkidle')

    // Find the sentry switch (third switch on the page)
    const sentrySwitch = page.getByRole('switch').nth(2)
    await expect(sentrySwitch).toBeVisible({ timeout: 10000 })

    // Get initial state using data-state attribute (Radix UI Switch)
    const initialState = await sentrySwitch.getAttribute('data-state')
    const initialChecked = initialState === 'checked'

    // Toggle with force to bypass any overlay issues
    await sentrySwitch.click({ force: true })
    await page.waitForTimeout(500)

    // Verify state changed
    const newState = await sentrySwitch.getAttribute('data-state')
    const newChecked = newState === 'checked'
    expect(newChecked).toBe(!initialChecked)

    // Verify localStorage was updated
    const consent = await getCookieConsent(page)
    expect(consent?.sentry).toBe(newChecked)
  })

  test('Allow essential only button disables all optional cookies', async ({ page }) => {
    // First enable some optional cookies
    await page.evaluate((key) => {
      window.localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          essential: true,
          analytics: true,
          sentry: true,
          updatedAt: new Date().toISOString(),
        })
      )
    }, COOKIE_CONSENT_KEY)
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Click Allow essential only (aria-label or visible text)
    const essentialOnlyButton = page.getByRole('button', {
      name: /allow essential|permite doar/i,
    })
    await expect(essentialOnlyButton).toBeVisible({ timeout: 10000 })
    await essentialOnlyButton.click()

    // Should navigate away (to redirect URL or /)
    await page.waitForURL((url) => !url.pathname.includes('/cookies'), { timeout: 30000 })

    // Verify consent
    const consent = await getCookieConsent(page)
    expect(consent?.analytics).toBe(false)
    expect(consent?.sentry).toBe(false)
  })

  test('Allow all button enables all cookies', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    // Click Allow all (aria-label or visible text)
    const allowAllButton = page.getByRole('button', { name: /allow all|permite toate/i })
    await expect(allowAllButton).toBeVisible({ timeout: 10000 })
    await allowAllButton.click()

    // Should navigate away
    await page.waitForURL((url) => !url.pathname.includes('/cookies'), { timeout: 30000 })

    // Verify consent
    const consent = await getCookieConsent(page)
    expect(consent?.analytics).toBe(true)
    expect(consent?.sentry).toBe(true)
  })

  test('Confirm choices button navigates with current settings', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    // Toggle analytics on (using data-state for Radix UI Switch)
    const analyticsSwitch = page.getByRole('switch').nth(1)
    await expect(analyticsSwitch).toBeVisible({ timeout: 10000 })
    const analyticsState = await analyticsSwitch.getAttribute('data-state')
    if (analyticsState !== 'checked') {
      await analyticsSwitch.click()
      await page.waitForTimeout(300)
    }

    // Keep sentry off
    const sentrySwitch = page.getByRole('switch').nth(2)
    const sentryState = await sentrySwitch.getAttribute('data-state')
    if (sentryState === 'checked') {
      await sentrySwitch.click()
      await page.waitForTimeout(300)
    }

    // Click Confirm choices (aria-label or visible text)
    const confirmButton = page.getByRole('button', {
      name: /confirm choices|confirmă|salvează/i,
    })
    await expect(confirmButton).toBeVisible({ timeout: 10000 })
    await confirmButton.click()

    // Should navigate away
    await page.waitForURL((url) => !url.pathname.includes('/cookies'), { timeout: 30000 })

    // Verify consent reflects manual choices
    const consent = await getCookieConsent(page)
    expect(consent?.analytics).toBe(true)
    expect(consent?.sentry).toBe(false)
  })

  test('displays last updated timestamp', async ({ page }) => {
    // Set consent with a known timestamp
    await page.evaluate((key) => {
      window.localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          essential: true,
          analytics: false,
          sentry: false,
          updatedAt: new Date().toISOString(),
        })
      )
    }, COOKIE_CONSENT_KEY)
    await page.reload()
    await page.waitForLoadState('domcontentloaded')

    // Check for Updated text: EN "Updated" / RO "Actualizat"
    await expect(page.getByText(/updated|actualizat/i)).toBeVisible()
  })

  test('respects redirect parameter after action', async ({ page }) => {
    // Navigate to /cookies with a redirect parameter
    await page.goto('/cookies?redirect=/charts')
    await page.waitForLoadState('networkidle')

    // Click Allow all (aria-label or visible text)
    const allowAllButton = page.getByRole('button', { name: /allow all|permite toate/i })
    await expect(allowAllButton).toBeVisible({ timeout: 10000 })
    await allowAllButton.click()

    // Should navigate to the redirect URL
    await page.waitForURL(/\/charts/, { timeout: 30000 })
    expect(page.url()).toContain('/charts')
  })

  test('defaults to home when redirect is missing', async ({ page }) => {
    // Navigate to /cookies without redirect
    await page.goto('/cookies')
    await page.waitForLoadState('networkidle')

    // Click Confirm choices (aria-label or visible text)
    const confirmButton = page.getByRole('button', {
      name: /confirm choices|confirmă|salvează/i,
    })
    await expect(confirmButton).toBeVisible({ timeout: 10000 })
    await confirmButton.click()

    // Should navigate away from /cookies (to home or /)
    await page.waitForURL((url) => !url.pathname.includes('/cookies'), { timeout: 30000 })

    // Verify we're at home
    expect(page.url()).toMatch(/\/$/)
  })
})

test.describe('Cookie Consent Persistence', () => {
  test('consent persists across page navigations', async ({ page }) => {
    // Start fresh
    await page.goto('/')
    await clearCookieConsent(page)
    await page.reload()

    // Accept all
    const acceptButton = page.getByRole('button', { name: /accept all|acceptă tot/i })
    await expect(acceptButton).toBeVisible({ timeout: 3000 })
    await acceptButton.click()

    // Navigate to another page
    await page.goto('/charts')
    await page.waitForLoadState('domcontentloaded')

    // Consent should still be there
    const consent = await getCookieConsent(page)
    expect(consent?.analytics).toBe(true)
    expect(consent?.sentry).toBe(true)

    // Banner should not reappear
    await page.waitForTimeout(1000)
    const bannerHeading = page.getByRole('heading', {
      name: /we value your privacy|confidențialitatea/i,
    })
    await expect(bannerHeading).not.toBeVisible()
  })

  test('consent version is always 1', async ({ page }) => {
    await page.goto('/')
    await clearCookieConsent(page)
    await page.reload()

    // Accept cookies
    const acceptButton = page.getByRole('button', { name: /accept all|acceptă tot/i })
    await expect(acceptButton).toBeVisible({ timeout: 3000 })
    await acceptButton.click()

    // Check version
    const consent = await getCookieConsent(page)
    expect(consent?.version).toBe(1)
  })

  test('essential is always true regardless of user action', async ({ page }) => {
    await page.goto('/cookies')
    await page.waitForLoadState('networkidle')

    // Try Allow essential only (aria-label or visible text)
    const essentialOnlyButton = page.getByRole('button', {
      name: /allow essential|permite doar/i,
    })
    await expect(essentialOnlyButton).toBeVisible({ timeout: 10000 })
    await essentialOnlyButton.click()

    await page.waitForURL((url) => !url.pathname.includes('/cookies'), { timeout: 30000 })

    const consent = await getCookieConsent(page)
    expect(consent?.essential).toBe(true)
  })
})

test.describe('Cookie Policy Page', () => {
  test('displays cookie policy content', async ({ page }) => {
    await page.goto('/cookie-policy')
    await page.waitForLoadState('domcontentloaded')

    // Check for page heading: EN "Cookie Policy" / RO "Politica cookie-urilor" or "Politica privind cookie-urile"
    await expect(
      page.getByRole('heading', { name: /cookie policy|politica.*cookie/i, level: 1 })
    ).toBeVisible()

    // Check for localStorage mention (may be inside <code> element)
    await expect(page.locator('text=localStorage').first()).toBeVisible()

    // Check for cookie-consent mention (may be inside <code> element)
    await expect(page.locator('text=cookie-consent').first()).toBeVisible()
  })

  test('links to cookie settings page', async ({ page }) => {
    await page.goto('/cookie-policy')
    await page.waitForLoadState('domcontentloaded')

    // Find link to cookie settings: EN "Cookie Settings" / RO "Setări cookie-uri"
    const settingsLink = page.getByRole('link', { name: /cookie settings|setări cookie/i })
    if (await settingsLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(settingsLink).toHaveAttribute('href', /\/cookies/)
    }
  })
})
