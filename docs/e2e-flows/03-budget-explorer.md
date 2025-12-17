# Budget Explorer E2E Tests

**Route:** `/budget-explorer`
**Test File:** `tests/flows/budget-explorer-comprehensive.spec.ts`
**Fixtures:** `tests/fixtures/budget-explorer-comprehensive-flow/`

---

## Test Scenarios

### 1. View Treemap

- [x] **1.1 Treemap loads on page open**
  - Navigate to `/budget-explorer`
  - Verify treemap visualization is visible
  - Verify treemap has colored rectangles
  - Verify category labels are visible

- [x] **1.2 Treemap shows budget data**
  - Navigate to budget explorer
  - Verify treemap cells have values
  - Verify tooltips show details on hover

- [x] **1.3 Treemap loading state**
  - Mock with delay
  - Navigate to page
  - Verify loading indicator
  - Verify treemap appears after loading
  - **Options:** `{ delay: 1500 }`

### 2. Treemap Drilldown

- [x] **2.1 Click category to drill down**
  - Navigate to budget explorer
  - Click on a treemap cell/category
  - Verify treemap updates to show subcategories
  - Verify breadcrumb or back button appears

- [x] **2.2 Navigate back after drilldown**
  - Drill down into category
  - Click back/breadcrumb
  - Verify returns to parent view

- [x] **2.3 Deep drilldown (multiple levels)**
  - Click to drill down level 1
  - Click to drill down level 2
  - Verify correct hierarchy is shown
  - Navigate back through levels

- [x] **2.4 Drilldown state in URL**
  - Drill down into category
  - Verify URL reflects drilldown state
  - Refresh page
  - Verify drilldown state is preserved

### 3. Switch Classification

- [x] **3.1 Switch to economic classification**
  - Navigate to budget explorer (default: functional)
  - Find classification toggle/selector
  - Select "Economic" classification
  - Verify treemap updates with economic categories

- [x] **3.2 Switch to functional classification**
  - Start with economic classification
  - Select "Functional" classification
  - Verify treemap updates with functional categories

- [x] **3.3 Classification persists after drilldown**
  - Select economic classification
  - Drill down into category
  - Verify still showing economic categories

### 4. Switch Spending/Revenue

- [x] **4.1 Switch to revenue view**
  - Navigate to budget explorer (default: spending)
  - Find spending/revenue toggle
  - Select "Revenue" / "Venituri"
  - Verify treemap shows revenue categories

- [x] **4.2 Switch to spending view**
  - Start with revenue view
  - Select "Spending" / "Cheltuieli"
  - Verify treemap shows spending categories

- [x] **4.3 View toggle persists**
  - Select revenue view
  - Drill down
  - Verify still showing revenue data

### 5. View Line Items

- [x] **5.1 Switch to line items view**
  - Navigate to budget explorer
  - Find view toggle (treemap/table/line items)
  - Select "Line Items" view
  - Verify table/list of line items appears

- [x] **5.2 Line items show details**
  - Switch to line items view
  - Verify columns: category, amount, etc.
  - Verify data is displayed correctly

- [x] **5.3 Line items pagination**
  - Switch to line items view
  - If many items, verify pagination exists
  - Navigate to next page
  - Verify different items shown

- [x] **5.4 Line items sorting**
  - Switch to line items view
  - Click column header to sort
  - Verify order changes

### 6. Filter by Period

- [x] **6.1 Filter by year**
  - Navigate to budget explorer
  - Find period/year filter
  - Select 2024
  - Verify treemap updates with 2024 data

- [x] **6.2 Filter by quarter**
  - Find quarter filter (if available)
  - Select Q1
  - Verify data filters to Q1

- [x] **6.3 Period filter affects all views**
  - Set period to 2023
  - Switch between treemap and line items
  - Verify both show 2023 data

- [x] **6.4 Period in URL**
  - Select specific period
  - Verify URL contains period parameter
  - Refresh page
  - Verify period selection preserved

### 7. Error Handling

- [x] **7.1 Handle API error**
  - Mock budget data with 500 error
  - Navigate to page
  - Verify error message displayed
  - **Options:** `{ status: 500 }`

- [x] **7.2 Handle empty data**
  - Mock with empty budget data
  - Verify appropriate empty state message

---

## Fixtures Needed

| Fixture | GraphQL Operation | Description |
|---------|-------------------|-------------|
| `aggregated-line-items.json` | AggregatedLineItems | Main budget treemap data |
| `aggregated-line-items-revenue.json` | AggregatedLineItems | Revenue view data |
| `aggregated-line-items-empty.json` | AggregatedLineItems | Empty budget response |

---

## Notes

- Treemap uses Recharts for visualization
- Classifications: functional (by activity) vs economic (by type)
- Spending = Cheltuieli, Revenue = Venituri in Romanian
- Drilldown hierarchy: chapters > subchapters > paragraphs
- 47 comprehensive tests covering all scenarios
