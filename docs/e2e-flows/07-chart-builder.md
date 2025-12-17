# Chart Builder E2E Tests

**Routes:** `/charts/new`, `/charts/$chartId`
**Test File:** `tests/flows/chart-builder-comprehensive.spec.ts`
**Fixtures:** (Uses localStorage for chart storage, no GraphQL mocks needed for basic operations)

---

## Test Scenarios

### 1. Create New Chart

- [x] **1.1 Chart builder loads**
  - Navigate to `/charts/new`
  - Verify redirects to `/charts/{uuid}?view=config`
  - Verify chart builder interface visible

- [x] **1.2 Config dialog opens automatically**
  - Navigate to chart builder
  - Verify config dialog is visible

- [x] **1.3 Chart info card is visible**
  - Verify Chart Information section present

- [x] **1.4 Enter chart name**
  - Find chart name input
  - Enter "My Test Chart"
  - Verify name is set

- [x] **1.5 Global settings visible**
  - Verify global settings card is present

- [x] **1.6 Data series card visible**
  - Verify Add Series button is available

- [x] **1.7 Add series button visible**
  - Verify can click Add Series

### 2. Chart Configuration

- [x] **2.1 Chart type selector available**
  - Verify chart type dropdown/select is visible

- [x] **2.2 Can change chart type**
  - Select different chart type
  - Verify selection updates

- [x] **2.3 Toggle switches available**
  - Verify toggle switches for options (legend, grid, labels)

- [x] **2.4 Can toggle options**
  - Toggle show legend
  - Verify state changes

- [x] **2.5 Year range slider available**
  - Verify year range slider is visible

- [x] **2.6 Color picker available**
  - Verify color picker component is present

- [x] **2.7 Description textarea available**
  - Verify can enter chart description

### 3. Add Series

- [x] **3.1 Add first series**
  - Click add series button
  - Verify series is added

- [x] **3.2 Add multiple series**
  - Add first series
  - Add second series
  - Verify page remains stable

### 4. View Chart

- [x] **4.1 View chart button navigates to overview**
  - Click "View Chart" button
  - Verify config dialog closes

- [x] **4.2 Chart overview shows display area**
  - Navigate to overview
  - Verify chart display area is visible

- [x] **4.3 Configure button reopens config**
  - Close config dialog
  - Click configure button
  - Verify config reopens

### 5. Delete Chart

- [x] **5.1 Delete chart button visible**
  - Scroll to bottom
  - Verify delete button is present

- [x] **5.2 Delete requires confirmation**
  - Click delete button
  - Verify confirmation dropdown appears

- [x] **5.3 Cancel delete keeps chart**
  - Open delete confirmation
  - Cancel/close
  - Verify still on chart page

### 6. Breadcrumb Navigation

- [x] **6.1 Breadcrumb visible in config**
  - Verify breadcrumb navigation is shown

- [x] **6.2 Can navigate via breadcrumb**
  - Click Chart breadcrumb
  - Verify navigates to overview

### 7. URL State

- [x] **7.1 Config view has view=config**
  - Verify URL contains view=config parameter

- [x] **7.2 Direct navigation works**
  - Navigate to /charts/{id}?view=config
  - Verify config dialog opens

- [x] **7.3 Overview URL state**
  - Close config dialog
  - Verify URL updates (no view=config)

### 8. Quick Nav Toolbar

- [x] **8.1 Quick nav visible**
  - Navigate to chart overview
  - Verify floating quick nav is present

### 9. View Controls

- [x] **9.1 View button closes config**
  - Click View Chart button
  - Verify config dialog closes

### 10. Responsive Behavior

- [x] **10.1 Mobile viewport works**
  - Set mobile viewport
  - Verify config dialog loads

- [x] **10.2 Controls usable on mobile**
  - Set mobile viewport
  - Verify form inputs are visible

- [x] **10.3 Tablet viewport works**
  - Set tablet viewport
  - Verify page loads correctly

### 11. Chart List Integration

- [x] **11.1 Navigate from list to new chart**
  - Go to /charts
  - Click create chart
  - Verify navigates to new chart

### 12. Accessibility

- [x] **12.1 Dialog has ARIA attributes**
  - Verify dialog role is present

- [x] **12.2 Form inputs have labels**
  - Verify inputs have associated labels

- [x] **12.3 Buttons have accessible names**
  - Verify buttons have text or aria-label

### 13. Performance

- [x] **13.1 Page loads within acceptable time**
  - Navigate to /charts/new
  - Verify loads within 10 seconds

- [x] **13.2 Dialog responds quickly**
  - Close and reopen dialog
  - Verify responds within 3 seconds

### 14. Chart Title Editing

- [x] **14.1 Title updates as user types**
  - Type in title input
  - Verify value updates

- [x] **14.2 Title persists after close/reopen**
  - Enter title
  - Close and reopen config
  - Verify title is preserved

---

## Notes

- Chart builder uses localStorage for persistence via useChartStore
- No GraphQL mocks needed for basic CRUD operations
- Chart types: line, bar, area, pie (composition)
- Series can be added dynamically
- 40 comprehensive tests covering all scenarios
