# Entity Details E2E Tests

**Route:** `/entities/$cui`
**Test File:** `tests/flows/entity-details.spec.ts`
**Fixtures:** `tests/fixtures/entity-details-flow/`

---

## Test Scenarios

### 1. View Overview

- [ ] **1.1 Entity details load correctly**
  - Navigate to `/entities/4305857`
  - Verify entity name heading is visible
  - Verify CUI is displayed
  - Verify financial summary section exists
  - **GraphQL:** `GetEntityDetails`, `EntityNames`

- [ ] **1.2 Financial summary displays data**
  - Navigate to entity page
  - Verify spending amount is visible
  - Verify revenue amount is visible
  - Verify amounts are formatted correctly

- [ ] **1.3 Entity page loading state**
  - Mock with delay
  - Navigate to entity page
  - Verify loading indicator appears
  - Verify content appears after loading
  - **Options:** `{ delay: 1500 }`

### 2. Switch Tabs

- [ ] **2.1 Switch to Overview tab**
  - Navigate to entity page
  - Click Overview tab
  - Verify overview content is visible

- [ ] **2.2 Switch to Map tab**
  - Navigate to entity page
  - Click Map tab
  - Verify map component is visible

- [ ] **2.3 Switch to Expenses tab**
  - Navigate to entity page
  - Click Expenses/Cheltuieli tab
  - Verify expense trends content is visible
  - **GraphQL:** `GetEntityLineItems`

- [ ] **2.4 Switch to Income tab**
  - Navigate to entity page
  - Click Income/Venituri tab
  - Verify income trends content is visible

- [ ] **2.5 Tab state persists in URL**
  - Navigate to entity page
  - Switch to Expenses tab
  - Verify URL contains tab parameter
  - Refresh page
  - Verify Expenses tab is still active

### 3. Change Period

- [ ] **3.1 Select different year**
  - Navigate to entity page
  - Find period/year selector
  - Select 2024
  - Verify data updates
  - Verify URL contains year parameter
  - **GraphQL:** `GetEntityDetails` (with new variables)

- [ ] **3.2 Select different month (if available)**
  - Navigate to entity page
  - Find month selector
  - Select specific month
  - Verify data updates for that month

- [ ] **3.3 Period filter affects all views**
  - Set period filter
  - Switch between tabs
  - Verify all tabs show data for selected period

### 4. Change Currency

- [ ] **4.1 Switch to EUR**
  - Navigate to entity page
  - Find currency selector
  - Select EUR
  - Verify amounts display in EUR
  - Verify EUR symbol is shown

- [ ] **4.2 Switch to USD**
  - Navigate to entity page
  - Select USD
  - Verify amounts display in USD

- [ ] **4.3 Switch back to RON**
  - Switch to EUR
  - Switch back to RON
  - Verify amounts display in RON

- [ ] **4.4 Currency preference persists**
  - Select EUR
  - Navigate away and back
  - Verify EUR is still selected

### 5. Toggle Normalization

- [ ] **5.1 Switch to per capita**
  - Navigate to entity page
  - Find normalization selector
  - Select "Per capita"
  - Verify values change
  - Verify label shows per capita

- [ ] **5.2 Switch to percent of GDP**
  - Select "% GDP"
  - Verify values change to percentages

- [ ] **5.3 Switch back to total**
  - Select "Total"
  - Verify original values are shown

### 6. View Reports

- [ ] **6.1 Reports list is visible**
  - Navigate to entity page
  - Find reports section
  - Verify reports list is displayed
  - **GraphQL:** `GetReports`

- [ ] **6.2 Reports show metadata**
  - Verify report date is shown
  - Verify report type is shown
  - Verify download options are visible

### 7. Download Report

- [ ] **7.1 Download PDF report**
  - Navigate to entity page
  - Find PDF download button
  - Click download
  - Verify download initiates (or modal appears)

- [ ] **7.2 Download Excel report**
  - Find Excel download button
  - Click download
  - Verify download initiates

### 8. Error Handling

- [ ] **8.1 Handle API error gracefully**
  - Mock GetEntityDetails with 500
  - Navigate to entity page
  - Verify error message is displayed
  - Verify page doesn't crash
  - **Options:** `{ status: 500 }`

- [ ] **8.2 Handle partial data**
  - Mock with incomplete data
  - Verify page handles missing fields gracefully

### 9. Not Found

- [ ] **9.1 Handle non-existent entity**
  - Navigate to `/entities/9999999999`
  - Verify 404 or "not found" message
  - **Fixture:** `entity-not-found.json`

- [ ] **9.2 Handle invalid CUI format**
  - Navigate to `/entities/invalid`
  - Verify appropriate error handling

---

## Fixtures Needed

| Fixture | GraphQL Operation | Description |
|---------|-------------------|-------------|
| `entity-details.json` | `GetEntityDetails` | Full entity data |
| `entity-names.json` | `EntityNames` | Entity name lookup |
| `entity-line-items.json` | `GetEntityLineItems` | Budget line items |
| `get-reports.json` | `GetReports` | Financial reports list |
| `entity-not-found.json` | `GetEntityDetails` | Empty/null response |
| `error-500.json` | - | Server error |

---

## Notes

- CUI 4305857 = MUNICIPIUL CLUJ-NAPOCA (good test entity)
- Tab names may be in Romanian (Cheltuieli, Venituri)
- Currency/normalization may be in toolbar or dropdown
- Reports section may be in separate tab or panel
