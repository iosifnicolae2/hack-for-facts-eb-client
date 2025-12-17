# Entity Analytics E2E Tests

**Route:** `/entity-analytics`
**Test File:** `tests/flows/entity-analytics.spec.ts`
**Fixtures:** `tests/fixtures/entity-analytics-flow/`

---

## Test Scenarios

### 1. View Table

- [ ] **1.1 Analytics table loads**
  - Navigate to `/entity-analytics`
  - Verify table is visible
  - Verify table has columns (entity, budget, etc.)
  - Verify table has rows with entity data

- [ ] **1.2 Table shows entity data**
  - Navigate to entity analytics
  - Verify entity names are displayed
  - Verify budget amounts are shown
  - Verify data is formatted correctly

- [ ] **1.3 Table loading state**
  - Mock with delay
  - Navigate to page
  - Verify loading indicator
  - Verify table appears after loading
  - **Options:** `{ delay: 1500 }`

- [ ] **1.4 Click entity row navigates**
  - Click on entity name/row
  - Verify navigates to entity details page
  - Verify correct entity is shown

### 2. Sort Table

- [ ] **2.1 Sort by entity name**
  - Navigate to entity analytics
  - Click entity name column header
  - Verify rows reorder alphabetically
  - Click again for reverse order

- [ ] **2.2 Sort by budget amount**
  - Click budget/amount column header
  - Verify rows reorder by amount
  - Verify largest/smallest first (depending on sort)

- [ ] **2.3 Sort indicator visible**
  - Click column to sort
  - Verify sort indicator (arrow) shows on column
  - Verify indicator changes direction on re-click

- [ ] **2.4 Sort persists in URL**
  - Sort by column
  - Verify URL contains sort parameter
  - Refresh page
  - Verify sort is preserved

### 3. Paginate

- [ ] **3.1 Pagination controls visible**
  - Navigate to entity analytics
  - Verify pagination controls exist
  - Verify showing page X of Y

- [ ] **3.2 Navigate to next page**
  - Click next page button
  - Verify different entities shown
  - Verify page indicator updates

- [ ] **3.3 Navigate to previous page**
  - Go to page 2
  - Click previous page
  - Verify returns to page 1

- [ ] **3.4 Jump to specific page**
  - If page selector exists
  - Select page 5
  - Verify jumps to page 5

- [ ] **3.5 Change page size**
  - If page size selector exists
  - Change from 10 to 25
  - Verify more rows shown

- [ ] **3.6 Pagination in URL**
  - Navigate to page 2
  - Verify URL contains page parameter
  - Refresh page
  - Verify still on page 2

### 4. Switch to Chart View

- [ ] **4.1 Switch to chart view**
  - Navigate to entity analytics (default: table)
  - Find view toggle (table/chart)
  - Click chart view
  - Verify chart visualization appears

- [ ] **4.2 Chart displays data**
  - Switch to chart view
  - Verify chart has data points/bars
  - Verify axes are labeled

- [ ] **4.3 Chart tooltips work**
  - Switch to chart view
  - Hover over data point
  - Verify tooltip shows entity details

- [ ] **4.4 Switch back to table**
  - From chart view
  - Click table view
  - Verify table is shown again

- [ ] **4.5 View preference in URL**
  - Switch to chart view
  - Verify URL reflects view type
  - Refresh page
  - Verify chart view preserved

### 5. Apply Filters

- [ ] **5.1 Filter by period/year**
  - Navigate to entity analytics
  - Find period filter
  - Select 2024
  - Verify table updates with 2024 data

- [ ] **5.2 Filter by category**
  - Find category filter
  - Select specific budget category
  - Verify entities filtered to that category

- [ ] **5.3 Filter by region/county**
  - Find county/region filter
  - Select "Cluj"
  - Verify only Cluj entities shown

- [ ] **5.4 Multiple filters combined**
  - Apply period filter (2024)
  - Apply region filter (Cluj)
  - Verify both filters applied
  - Verify results match both criteria

- [ ] **5.5 Clear filters**
  - Apply multiple filters
  - Find clear/reset button
  - Click clear
  - Verify all data shown again

- [ ] **5.6 Filters persist in URL**
  - Apply filters
  - Verify URL contains filter params
  - Refresh page
  - Verify filters still applied

### 6. Error Handling

- [ ] **6.1 Handle API error**
  - Mock analytics data with 500 error
  - Navigate to page
  - Verify error message displayed
  - **Options:** `{ status: 500 }`

- [ ] **6.2 Handle empty results**
  - Apply filter with no matching entities
  - Verify empty state message
  - Verify clear filters option available

---

## Fixtures Needed

| Fixture | GraphQL Operation | Description |
|---------|-------------------|-------------|
| `analytics-data.json` | TBD | Entity analytics list |
| `analytics-page-2.json` | TBD | Second page of results |
| `analytics-filtered.json` | TBD | Filtered results |
| `analytics-empty.json` | TBD | Empty results |
| `error-500.json` | - | Server error |

---

## Notes

- Table may use TanStack Table for features
- Chart may be bar chart or line chart
- Filters may be in sidebar or toolbar
- Sorting may be client-side or server-side
- May support export to CSV/Excel
