# Charts List E2E Tests

**Route:** `/charts`
**Test File:** `tests/flows/charts-list.spec.ts`
**Fixtures:** `tests/fixtures/charts-list-flow/`

---

## Test Scenarios

### 1. View Charts List

- [ ] **1.1 Charts list loads**
  - Navigate to `/charts`
  - Verify charts list/grid is visible
  - Verify chart cards are displayed
  - Verify chart thumbnails/previews shown

- [ ] **1.2 Chart cards show info**
  - Navigate to charts page
  - Verify chart name is visible
  - Verify creation date shown
  - Verify category tags shown (if any)

- [ ] **1.3 Charts list loading state**
  - Mock with delay
  - Navigate to page
  - Verify loading indicator
  - Verify charts appear after loading
  - **Options:** `{ delay: 1500 }`

- [ ] **1.4 Empty state when no charts**
  - Mock with empty list
  - Navigate to charts page
  - Verify "no charts" message
  - Verify "create chart" CTA visible
  - **Fixture:** `charts-empty.json`

- [ ] **1.5 Click chart navigates to detail**
  - Click on a chart card
  - Verify navigates to `/charts/{chartId}`
  - Verify chart detail page loads

### 2. Search Charts

- [ ] **2.1 Search by chart name**
  - Navigate to charts page
  - Find search input
  - Type chart name
  - Verify results filter to matching charts

- [ ] **2.2 Search with no results**
  - Type "nonexistent123"
  - Verify "no matching charts" message

- [ ] **2.3 Search clears on empty input**
  - Search for something
  - Clear search input
  - Verify all charts shown again

- [ ] **2.4 Search is case-insensitive**
  - Type search in lowercase
  - Verify matches charts with uppercase names

### 3. Filter by Category

- [ ] **3.1 Filter by hashtag category**
  - Navigate to charts page
  - Find category filter or hashtag list
  - Click on a category tag (e.g., #education)
  - Verify only charts with that tag shown

- [ ] **3.2 Multiple category filter**
  - Select first category
  - Select second category
  - Verify charts matching any selected category shown

- [ ] **3.3 Clear category filter**
  - Apply category filter
  - Find clear/all button
  - Click to clear
  - Verify all charts shown

- [ ] **3.4 Category filter + search combined**
  - Apply category filter
  - Type in search
  - Verify both filters applied

### 4. Sort Charts

- [ ] **4.1 Sort by newest**
  - Navigate to charts page
  - Find sort selector
  - Select "Newest" option
  - Verify charts ordered by date (newest first)

- [ ] **4.2 Sort by oldest**
  - Select "Oldest" option
  - Verify charts ordered by date (oldest first)

- [ ] **4.3 Sort alphabetically (A-Z)**
  - Select "A-Z" or "Name" option
  - Verify charts ordered alphabetically

- [ ] **4.4 Sort by favorites**
  - Select "Favorites" option
  - Verify favorited charts shown first

- [ ] **4.5 Sort persists in URL**
  - Select sort option
  - Verify URL contains sort parameter
  - Refresh page
  - Verify sort preserved

### 5. Toggle Favorite

- [ ] **5.1 Mark chart as favorite**
  - Find favorite button/icon on chart card
  - Click to favorite
  - Verify icon changes to filled/active state
  - Verify chart marked as favorite

- [ ] **5.2 Unmark chart as favorite**
  - Click favorite button on favorited chart
  - Verify icon changes to unfilled/inactive
  - Verify chart unmarked

- [ ] **5.3 Favorite persists**
  - Mark chart as favorite
  - Refresh page
  - Verify chart still marked as favorite

- [ ] **5.4 Favorite count/indicator**
  - If favorites count shown
  - Mark chart as favorite
  - Verify count increases

### 6. Create New Chart

- [ ] **6.1 Navigate to create chart**
  - Find "New Chart" or "Create" button
  - Click button
  - Verify navigates to `/charts/new`

### 7. Delete Chart

- [ ] **7.1 Delete chart from list**
  - Find delete button on chart card
  - Click delete
  - Verify confirmation dialog appears

- [ ] **7.2 Confirm delete**
  - Click delete
  - Confirm in dialog
  - Verify chart removed from list

- [ ] **7.3 Cancel delete**
  - Click delete
  - Cancel in dialog
  - Verify chart still in list

### 8. Error Handling

- [ ] **8.1 Handle API error**
  - Mock charts list with 500 error
  - Navigate to page
  - Verify error message displayed
  - **Options:** `{ status: 500 }`

- [ ] **8.2 Handle favorite error**
  - Mock favorite action with error
  - Click favorite
  - Verify error toast/message
  - Verify state reverts

---

## Fixtures Needed

| Fixture | GraphQL Operation | Description |
|---------|-------------------|-------------|
| `charts-list.json` | TBD | List of saved charts |
| `charts-empty.json` | TBD | Empty charts list |
| `charts-favorited.json` | TBD | After marking favorite |
| `charts-deleted.json` | TBD | After deleting chart |
| `error-500.json` | - | Server error |

---

## Notes

- Charts may be stored in local storage or backend
- Categories/tags are hashtag-based (#education, #health)
- May support backup/restore functionality
- Grid vs list view toggle possible
- May show chart type icon (line, bar, pie)
