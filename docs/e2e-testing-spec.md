# Testing Specification

## Overview

| Type | Directory | Description |
|------|-----------|-------------|
| **Integration** | `tests/integration/` | Fast tests with mocked API (JSON fixtures) |
| **E2E** | `tests/e2e/` | Real browser tests against live or snapshotted API |

---

## Integration Tests

Integration tests use **JSON fixtures** to mock API responses. They test UI behavior without network dependencies.

### Commands

```bash
yarn test:integration       # Run integration tests
yarn test:integration:ui    # Interactive UI mode
yarn test:integration:debug # Debug mode
```

### Structure

```
tests/
├── integration/
│   ├── entity-page.spec.ts
│   ├── budget-explorer.spec.ts
│   └── ...
└── fixtures/
    ├── entity-exploration-flow/
    │   ├── entity-details.json
    │   └── entity-search.json
    └── shared/
        └── app-config.json
```

### Example

```typescript
import { test, expect } from '../utils/integration-base'

test.describe('Entity Page', () => {
  test.beforeEach(async ({ mockApi }) => {
    await mockApi.mockGraphQL('GetEntityDetails', 'entity-details')
  })

  test('displays entity name', async ({ page, mockApi }) => {
    if (mockApi.mode === 'live') {
      test.skip()
      return
    }

    await page.goto('/entities/4305857')
    await expect(page.getByRole('heading', { name: /MUNICIPIUL/i })).toBeVisible()
  })
})
```

---

## E2E Tests

E2E tests run against the real application with three modes:

| Mode | Command | Description |
|------|---------|-------------|
| **Live** | `yarn test:e2e` | Real API calls (validates full integration) |
| **Snapshot** | `yarn test:e2e:snapshot` | Replay from saved API responses (fast, reliable) |
| **Update** | `yarn test:e2e:snapshot:update` | Record live API to snapshot files |

### Best Practice: Use Historical Data

Since historical budget data (e.g., year 2023) won't change, tests are more stable when targeting past periods:

```typescript
const TEST_YEAR = '2023' // Historical data won't change

test('loads entity data', async ({ page }) => {
  await page.goto(`/entities/4305857?year=${TEST_YEAR}`)
  // ...
})
```

### Commands

```bash
# Live API (validates real integration)
yarn test:e2e

# Replay from snapshots (fast CI)
yarn test:e2e:snapshot

# Update snapshots from live API
yarn test:e2e:snapshot:update

# Interactive UI mode
yarn test:e2e:ui
```

### Structure

```
tests/
├── e2e/
│   ├── entity-page.spec.ts
│   └── ...
└── snapshots/           # Auto-generated API response snapshots
    ├── entity-page/
    │   ├── getentitydetails.json
    │   └── getentitylineitems.json
    └── ...
```

### Example

```typescript
import { test, expect } from '../utils/e2e-base'

const TEST_YEAR = '2023'
const TEST_ENTITY_CUI = '4305857'

test.describe('Entity Page', () => {
  test('loads entity with financial data', async ({ page }) => {
    await page.goto(`/entities/${TEST_ENTITY_CUI}?year=${TEST_YEAR}`)

    await expect(
      page.getByRole('heading', { name: /MUNICIPIUL CLUJ-NAPOCA/i }).first()
    ).toBeVisible({ timeout: 15000 })

    await expect(
      page.locator('text=/RON|mld|mil/i').first()
    ).toBeVisible()
  })
})
```

---

## Workflow

### Daily Development

```bash
# Fast integration tests (mocked)
yarn test:integration

# E2E with snapshots (fast, no API dependency)
yarn test:e2e:snapshot
```

### Before Release

```bash
# Full E2E against live API
yarn test:e2e
```

### When API Changes

```bash
# 1. Update snapshots
yarn test:e2e:snapshot:update

# 2. Review changes
git diff tests/snapshots/

# 3. Commit
git add tests/snapshots/
git commit -m "Update E2E snapshots for API changes"
```

---

## CI Pipeline

### PR Builds (Fast)

```yaml
- run: yarn test:integration
- run: yarn test:e2e:snapshot
```

### Nightly Builds (Full)

```yaml
- run: yarn test:integration
- run: yarn test:e2e  # Live API
```

---

## Selectors Best Practices

```typescript
// Best: Accessible roles
page.getByRole('button', { name: /save/i })
page.getByRole('heading', { level: 1 })

// Good: Labels and placeholders
page.getByLabel('Email')
page.getByPlaceholder('Search...')

// Acceptable: Text content
page.getByText('Submit')

// Last resort: Test IDs
page.getByTestId('submit-btn')
```

---

## Troubleshooting

### "Snapshot not found"

```
[e2e:replay] Snapshot not found: tests/snapshots/entity-page/getentitydetails.json
```

**Solution**: Run `yarn test:e2e:snapshot:update` to create snapshots.

### Tests flaky with live API

**Solution**: Use historical data that won't change:

```typescript
const TEST_YEAR = '2023' // Not current year
await page.goto(`/entities/123?year=${TEST_YEAR}`)
```

### Tests pass locally but fail in CI

1. Ensure dev server is running
2. Check if snapshots are committed
3. Verify API is accessible from CI environment
