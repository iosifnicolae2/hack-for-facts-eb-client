# Writing Reliable Playwright E2E Tests

This guide documents common causes of flaky tests and provides patterns for writing reliable, maintainable E2E tests.

## Table of Contents

1. [Common Causes of Flaky Tests](#common-causes-of-flaky-tests)
2. [Wait Strategies](#wait-strategies)
3. [Selector Best Practices](#selector-best-practices)
4. [Test Structure Patterns](#test-structure-patterns)
5. [Handling Async Content](#handling-async-content)
6. [CI vs Local Differences](#ci-vs-local-differences)
7. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
8. [Debugging Flaky Tests](#debugging-flaky-tests)

---

## Common Causes of Flaky Tests

### 1. Race Conditions

**Problem**: Test runs before React finishes rendering.

```typescript
// BAD: Checks immediately after navigation
await page.goto('/entity-analytics')
const hasContent = await page.locator('main').isVisible() // May be false!
```

**Solution**: Wait for a specific element that indicates the page is ready.

```typescript
// GOOD: Wait for meaningful content
await page.goto('/entity-analytics')
await expect(
  page.getByRole('heading', { name: /entity.*analytics/i, level: 1 })
).toBeVisible({ timeout: 10000 })
```

### 2. Unreliable `networkidle`

**Problem**: `networkidle` doesn't guarantee React components are rendered.

```typescript
// BAD: networkidle may fire before React hydration completes
await page.waitForLoadState('networkidle')
const text = await page.locator('body').textContent()
expect(text?.length).toBeGreaterThan(100) // May fail!
```

**Solution**: Wait for specific UI elements instead.

```typescript
// GOOD: Wait for actual content
await page.waitForLoadState('domcontentloaded')
await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 })
```

### 3. Timing-Dependent Assertions

**Problem**: Element might not be visible within the timeout.

```typescript
// BAD: Short timeout with catch swallows real failures
const hasButton = await page.getByRole('button').isVisible({ timeout: 1000 }).catch(() => false)
expect(hasButton).toBe(true) // Flaky!
```

**Solution**: Use proper Playwright assertions with adequate timeouts.

```typescript
// GOOD: Use expect with proper timeout
await expect(page.getByRole('button', { name: /submit/i })).toBeVisible({ timeout: 10000 })
```

### 4. Text/Translation Dependencies

**Problem**: Selectors depend on specific translated text that varies by locale or data state.

```typescript
// BAD: Exact text match
await expect(page.getByText('Budget Distribution')).toBeVisible()
```

**Solution**: Use regex patterns that match multiple languages.

```typescript
// GOOD: Multi-language regex
await expect(
  page.getByRole('heading', { name: /budget.*distribution|distribuția.*buget/i })
).toBeVisible()
```

### 5. CSS Class Selectors

**Problem**: CSS classes may be minified/hashed differently in CI builds.

```typescript
// BAD: Class names may differ between builds
await page.locator('.TreemapChart_container__abc123').click()
```

**Solution**: Use accessible roles, test IDs, or semantic selectors.

```typescript
// GOOD: Semantic selector
await page.getByRole('region', { name: /chart/i }).click()

// GOOD: Test ID (if no better option)
await page.getByTestId('treemap-chart').click()
```

---

## Wait Strategies

### Hierarchy of Wait Strategies (Best to Worst)

#### 1. Playwright Auto-Wait (Best)

Playwright automatically waits for elements to be actionable:

```typescript
// Automatically waits for button to be visible and enabled
await page.getByRole('button', { name: /save/i }).click()
```

#### 2. Expect Assertions with Timeout

```typescript
// Waits up to 10s for element to be visible
await expect(page.getByRole('heading')).toBeVisible({ timeout: 10000 })

// Waits for text content
await expect(page.locator('table')).toContainText('Cluj')
```

#### 3. waitForSelector

```typescript
// Wait for element to appear in DOM
await page.waitForSelector('table tbody tr', { timeout: 15000 })
```

#### 4. waitForURL

```typescript
// Wait for navigation to complete
await page.waitForURL(/\/entities\/\d+/)
```

#### 5. waitForLoadState

```typescript
// Use domcontentloaded for initial render
await page.waitForLoadState('domcontentloaded')

// Use networkidle only when truly needed (e.g., waiting for all API calls)
await page.waitForLoadState('networkidle').catch(() => {})
```

#### 6. Fixed Timeout (Last Resort)

```typescript
// Only when absolutely necessary (e.g., animations)
await page.waitForTimeout(500)
```

### Wait Pattern Examples

**Waiting for data to load:**

```typescript
test('displays table data', async ({ page }) => {
  await page.goto('/entity-analytics?view=table')

  // Wait for table to be visible
  const table = page.locator('table')
  await expect(table).toBeVisible({ timeout: 15000 })

  // Wait for rows to appear
  await page.waitForSelector('table tbody tr', { timeout: 15000 })

  // Now safe to check content
  const rowCount = await page.locator('table tbody tr').count()
  expect(rowCount).toBeGreaterThan(0)
})
```

**Waiting for dynamic content:**

```typescript
test('loads entity details', async ({ page }) => {
  await page.goto('/entities/4305857')

  // Wait for the primary content indicator
  await expect(
    page.getByRole('heading', { name: /MUNICIPIUL/i, level: 1 })
  ).toBeVisible({ timeout: 15000 })

  // Secondary content should appear after
  await expect(page.locator('text=/RON|EUR/i').first()).toBeVisible({ timeout: 5000 })
})
```

---

## Selector Best Practices

### Selector Priority (Best to Worst)

#### 1. Accessible Roles (Best)

```typescript
// Buttons
page.getByRole('button', { name: /save|salvează/i })

// Headings
page.getByRole('heading', { name: /title/i, level: 1 })

// Links
page.getByRole('link', { name: /home/i })

// Form elements
page.getByRole('textbox', { name: /email/i })
page.getByRole('combobox')
page.getByRole('radio', { name: /expenses/i })
page.getByRole('checkbox', { name: /agree/i })

// Regions
page.getByRole('region', { name: /filters/i })
```

#### 2. Labels and Placeholders

```typescript
page.getByLabel('Email address')
page.getByPlaceholder(/search|căutare/i)
```

#### 3. Text Content

```typescript
// Prefer first() to avoid strict mode violations
page.getByText(/submit/i).first()

// With regex for multi-language
page.locator('text=/save|salvează/i').first()
```

#### 4. Filtering and Chaining

```typescript
// Filter by text within element
page.getByRole('button').filter({ hasText: /submit/i })

// Chain locators
page.locator('table').getByRole('row').first()

// Within a container
const card = page.locator('[class*="card"]').first()
await card.getByRole('button', { name: /view/i }).click()
```

#### 5. Test IDs (Last Resort)

```typescript
page.getByTestId('submit-btn')
page.locator('[data-testid="chart-container"]')
```

### Multi-Language Selectors

Always support both English and Romanian:

```typescript
// Heading
page.getByRole('heading', { name: /entity.*analytics|analiza.*entităților/i })

// Button
page.getByRole('button', { name: /clear.*filters|șterge.*filtre/i })

// Text
page.locator('text=/expenses|cheltuieli/i')
```

### Avoiding Strict Mode Violations

When a selector matches multiple elements:

```typescript
// BAD: Will fail if multiple matches
await expect(page.getByRole('link', { name: /budget/i })).toBeVisible()

// GOOD: Use first() or be more specific
await expect(page.getByRole('link', { name: /budget/i }).first()).toBeVisible()

// BETTER: Scope to a container
const mainContent = page.locator('main')
await expect(mainContent.getByRole('link', { name: /budget/i })).toBeVisible()
```

---

## Test Structure Patterns

### Basic Test Structure

```typescript
import { test, expect } from '../utils/integration-base'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ mockApi }) => {
    // Set up mocks
    await mockApi.mockGraphQL('OperationName', 'fixture-name')
  })

  test('descriptive test name', async ({ page, mockApi }) => {
    // Skip if not applicable
    if (mockApi.mode === 'live') {
      test.skip()
      return
    }

    // Navigate
    await page.goto('/path')

    // Wait for page to be ready
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 })

    // Perform actions
    await page.getByRole('button', { name: /action/i }).click()

    // Assert results
    await expect(page.getByText(/success/i)).toBeVisible()
  })
})
```

### Testing Page Load

```typescript
test('page loads successfully', async ({ page }) => {
  await page.goto('/entity-analytics')

  // Wait for primary content indicator
  await expect(
    page.getByRole('heading', { name: /entity.*analytics/i, level: 1 })
  ).toBeVisible({ timeout: 10000 })
})
```

### Testing User Interactions

```typescript
test('can toggle between views', async ({ page }) => {
  await page.goto('/entity-analytics?view=table')

  // Verify initial state
  await expect(page.locator('table')).toBeVisible({ timeout: 15000 })

  // Perform interaction
  const lineItemsRadio = page.getByRole('radio', { name: /line.*items|linii.*bugetare/i })
  await lineItemsRadio.click()

  // Verify result
  await expect(lineItemsRadio).toBeChecked()
  expect(page.url()).toContain('view=line-items')
})
```

### Testing Form Submissions

```typescript
test('can search for entity', async ({ page }) => {
  await page.goto('/')

  // Fill form
  const searchInput = page.getByPlaceholder(/search|căutare/i)
  await searchInput.fill('Cluj')

  // Wait for results
  await expect(page.getByText(/Cluj-Napoca/i).first()).toBeVisible({ timeout: 5000 })

  // Click result
  await page.getByText(/MUNICIPIUL CLUJ-NAPOCA/i).first().click()

  // Verify navigation
  await page.waitForURL(/\/entities\/\d+/)
})
```

### Testing Loading States

```typescript
test('handles loading states', async ({ page, mockApi }) => {
  if (mockApi.mode !== 'mock') {
    test.skip()
    return
  }

  // Mock with delay
  await mockApi.mockGraphQL('GetData', 'data', { delay: 1500 })

  await page.goto('/page')

  // Check for loading indicator (optional - may or may not appear)
  const hasLoading = await page.getByRole('progressbar').isVisible({ timeout: 500 }).catch(() => false)

  // Content should eventually load
  await expect(page.getByRole('heading')).toBeVisible({ timeout: 5000 })
})
```

### Testing Error States

```typescript
test('handles API errors gracefully', async ({ page, mockApi }) => {
  if (mockApi.mode !== 'mock') {
    test.skip()
    return
  }

  // Mock error response
  await mockApi.mockGraphQL('GetData', 'data', { status: 500 })

  await page.goto('/page')
  await page.waitForLoadState('networkidle').catch(() => {})

  // Page should not crash - check body has content
  const bodyContent = await page.locator('body').textContent()
  expect(bodyContent?.length).toBeGreaterThan(0)
})
```

---

## Handling Async Content

### Pattern: Wait for Data Indicator

```typescript
test('displays data table', async ({ page }) => {
  await page.goto('/entity-analytics?view=table')

  // Wait for table structure
  await expect(page.locator('table')).toBeVisible({ timeout: 15000 })

  // Wait for data rows
  await page.waitForSelector('table tbody tr', { timeout: 15000 })

  // Now check content
  const rows = page.locator('table tbody tr')
  const count = await rows.count()
  expect(count).toBeGreaterThan(0)
})
```

### Pattern: Conditional Element Check

```typescript
test('displays optional feature', async ({ page }) => {
  await page.goto('/page')

  // Check for element that may or may not exist
  const featureButton = page.getByRole('button', { name: /feature/i })

  if (await featureButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await featureButton.click()
    await expect(page.getByText(/feature enabled/i)).toBeVisible()
  }
  // Test passes either way - feature is optional
})
```

### Pattern: Multiple Valid States

```typescript
test('shows content or empty state', async ({ page }) => {
  await page.goto('/charts')
  await page.waitForLoadState('networkidle').catch(() => {})

  // Either data or empty state is valid
  const hasData = await page.locator('table tbody tr').first().isVisible({ timeout: 5000 }).catch(() => false)
  const hasEmptyState = await page.getByText(/no.*data|nu.*există/i).isVisible({ timeout: 1000 }).catch(() => false)

  expect(hasData || hasEmptyState).toBe(true)
})
```

---

## CI vs Local Differences

### Common Issues

| Issue | Local | CI | Solution |
|-------|-------|-----|----------|
| Timing | Fast | Slow | Increase timeouts |
| CSS Classes | Full names | Minified | Use semantic selectors |
| Fonts | System fonts | Generic | Don't rely on text width |
| Network | Fast | Variable | Use mocks or longer timeouts |
| Resources | Abundant | Limited | Optimize parallel workers |

### CI-Specific Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  workers: process.env.CI ? 1 : undefined,
  retries: process.env.CI ? 2 : 0,
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
})
```

### Environment-Aware Tests

```typescript
test('renders chart', async ({ page }) => {
  await page.goto('/charts')

  // Use longer timeout in CI
  const timeout = process.env.CI ? 20000 : 10000

  await expect(page.locator('[class*="chart"]').first()).toBeVisible({ timeout })
})
```

---

## Anti-Patterns to Avoid

### 1. Silent Failure with catch

```typescript
// BAD: Hides real failures
const hasElement = await page.locator('button').isVisible({ timeout: 1000 }).catch(() => false)
expect(hasElement).toBe(true)

// GOOD: Use proper assertion
await expect(page.locator('button')).toBeVisible({ timeout: 5000 })
```

### 2. Arbitrary Sleep

```typescript
// BAD: Wastes time or still flaky
await page.waitForTimeout(5000)
await page.click('button')

// GOOD: Wait for specific condition
await expect(page.getByRole('button')).toBeEnabled()
await page.getByRole('button').click()
```

### 3. Overly Broad Selectors

```typescript
// BAD: Matches too many elements
await page.locator('div').first().click()

// GOOD: Specific selector
await page.getByRole('button', { name: /submit/i }).click()
```

### 4. Testing Implementation Details

```typescript
// BAD: Tests internal class names
await expect(page.locator('.MuiButton-containedPrimary')).toBeVisible()

// GOOD: Tests user-visible behavior
await expect(page.getByRole('button', { name: /save/i })).toBeVisible()
```

### 5. Ignoring Strict Mode Violations

```typescript
// BAD: Will fail if multiple matches
await page.getByRole('link', { name: /view/i }).click()

// GOOD: Be explicit about which one
await page.getByRole('link', { name: /view/i }).first().click()
// OR scope to container
await page.locator('main').getByRole('link', { name: /view/i }).click()
```

### 6. Hardcoded Wait Times

```typescript
// BAD: Magic numbers
await page.waitForTimeout(3000)

// GOOD: Wait for condition
await page.waitForLoadState('networkidle').catch(() => {})
// OR
await expect(page.getByText('Loaded')).toBeVisible({ timeout: 10000 })
```

---

## Debugging Flaky Tests

### 1. Use Playwright Traces

```bash
# Run with trace on
npx playwright test --trace on

# View trace
npx playwright show-trace test-results/*/trace.zip
```

### 2. Use Video Recording

In `playwright.config.ts`:

```typescript
use: {
  video: 'on-first-retry', // or 'on' for always
}
```

### 3. Run with UI Mode

```bash
npx playwright test --ui
```

### 4. Debug Single Test

```bash
npx playwright test path/to/test.spec.ts:42 --debug
```

### 5. Add Console Logging

```typescript
test('debug test', async ({ page }) => {
  page.on('console', msg => console.log('PAGE:', msg.text()))

  await page.goto('/page')

  // Log current state
  console.log('URL:', page.url())
  console.log('Content:', await page.locator('body').textContent())
})
```

### 6. Capture Screenshots on Failure

```typescript
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== 'passed') {
    await page.screenshot({ path: `screenshots/${testInfo.title}.png`, fullPage: true })
  }
})
```

### 7. Run Multiple Times

```bash
# Run test 10 times to check for flakiness
npx playwright test --repeat-each=10 path/to/test.spec.ts
```

---

## Quick Reference

### Reliable Test Checklist

- [ ] Uses semantic selectors (roles, labels) over CSS classes
- [ ] Supports both EN and RO with regex patterns
- [ ] Has adequate timeouts (10-15s for content, 5s for interactions)
- [ ] Waits for specific content, not just `networkidle`
- [ ] Uses `.first()` when multiple matches are possible
- [ ] Skips gracefully in unsupported modes (`mockApi.mode === 'live'`)
- [ ] Doesn't use arbitrary `waitForTimeout`
- [ ] Tests user-visible behavior, not implementation details

### Timeout Guidelines

| Scenario | Recommended Timeout |
|----------|---------------------|
| Page heading visible | 10000ms |
| Table with data | 15000ms |
| Form submission response | 5000ms |
| Button click feedback | 3000ms |
| API error handling | 10000ms |
| Loading indicator | 1000-2000ms |

### Common Selector Patterns

```typescript
// Page heading
page.getByRole('heading', { name: /title/i, level: 1 })

// Navigation link
page.getByRole('link', { name: /home|acasă/i })

// Submit button
page.getByRole('button', { name: /save|submit|salvează/i })

// Form input
page.getByLabel(/email/i)
page.getByPlaceholder(/search|căutare/i)

// Radio button
page.getByRole('radio', { name: /option/i })

// Dropdown
page.getByRole('combobox')

// Table row
page.locator('table tbody tr').first()

// Card in main content
page.locator('main').locator('[class*="card"]').first()
```
