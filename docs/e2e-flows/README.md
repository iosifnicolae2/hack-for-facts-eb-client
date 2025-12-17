# E2E Test Flow Work Items

This directory contains detailed test scenarios for each page/flow. Each file is a work item for generating E2E tests using Playwright MCP browser tools.

## How to Use

1. Pick a flow file to work on
2. Start the dev server: `yarn dev`
3. Use MCP browser tools to explore the page
4. Generate test file and fixtures based on scenarios
5. Check off completed scenarios

## Flow Files

| # | Flow | Route | Status |
|---|------|-------|--------|
| 01 | [Landing Page](./01-landing-page.md) | `/` | To Do |
| 02 | [Entity Details](./02-entity-details.md) | `/entities/$cui` | To Do |
| 03 | [Budget Explorer](./03-budget-explorer.md) | `/budget-explorer` | To Do |
| 04 | [Entity Analytics](./04-entity-analytics.md) | `/entity-analytics` | To Do |
| 05 | [Map View](./05-map-view.md) | `/map` | To Do |
| 06 | [Charts List](./06-charts-list.md) | `/charts` | To Do |
| 07 | [Chart Builder](./07-chart-builder.md) | `/charts/new`, `/charts/$id` | To Do |

## Scenario Count

| Flow | Scenarios |
|------|-----------|
| Landing Page | 13 |
| Entity Details | 27 |
| Budget Explorer | 22 |
| Entity Analytics | 26 |
| Map View | 24 |
| Charts List | 25 |
| Chart Builder | 32 |
| **Total** | **169** |

## Priority Order

1. **Entity Details** - Core functionality, most used page
2. **Landing Page** - Entry point, search functionality
3. **Budget Explorer** - Key visualization feature
4. **Entity Analytics** - Comparison feature
5. **Charts List & Builder** - User features
6. **Map View** - Geographic visualization

## Workflow for Each Flow

```text
1. browser_navigate(url="http://localhost:5173/[route]")
2. browser_snapshot()  # Understand page structure
3. browser_network_requests()  # Find GraphQL operations
4. Perform scenario steps with browser_click/browser_type
5. Generate test file: tests/flows/[flow-name].spec.ts
6. Generate fixtures: tests/fixtures/[flow-name]-flow/
7. Check off scenario in flow file
```

## Output Per Flow

- `tests/flows/[flow-name].spec.ts`
- `tests/fixtures/[flow-name]-flow/*.json`
