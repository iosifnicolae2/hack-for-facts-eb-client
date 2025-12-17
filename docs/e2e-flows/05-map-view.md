# Map View E2E Tests

**Route:** `/map`
**Test File:** `tests/flows/map-view.spec.ts`
**Fixtures:** `tests/fixtures/map-view-flow/`

---

## Test Scenarios

### 1. View County Heatmap

- [ ] **1.1 Map loads on page open**
  - Navigate to `/map`
  - Verify map component is visible
  - Verify Romania map shape is rendered
  - Verify counties are colored (heatmap)

- [ ] **1.2 Map shows budget data colors**
  - Navigate to map view
  - Verify counties have different colors
  - Verify color legend is visible
  - Verify colors represent budget values

- [ ] **1.3 Map loading state**
  - Mock with delay
  - Navigate to page
  - Verify loading indicator
  - Verify map appears after loading
  - **Options:** `{ delay: 1500 }`

- [ ] **1.4 Map tooltips on hover**
  - Hover over a county
  - Verify tooltip appears
  - Verify tooltip shows county name
  - Verify tooltip shows budget value

### 2. Switch to UAT View

- [ ] **2.1 Switch to UAT level**
  - Navigate to map view (default: county)
  - Find level toggle (County/UAT)
  - Select "UAT" view
  - Verify map shows detailed UAT boundaries

- [ ] **2.2 UAT map shows more detail**
  - Switch to UAT view
  - Verify more regions visible
  - Verify UAT names in tooltips

- [ ] **2.3 Switch back to county**
  - From UAT view
  - Select county level
  - Verify returns to county view

- [ ] **2.4 Level persists in URL**
  - Switch to UAT view
  - Verify URL contains level parameter
  - Refresh page
  - Verify UAT view preserved

### 3. Click Region

- [ ] **3.1 Click county shows details**
  - Navigate to map view
  - Click on a county (e.g., Cluj)
  - Verify county details panel appears
  - Verify county name and data shown

- [ ] **3.2 Click UAT shows details**
  - Switch to UAT view
  - Click on a UAT
  - Verify UAT details panel appears

- [ ] **3.3 Details panel shows budget info**
  - Click on region
  - Verify spending amount shown
  - Verify revenue amount shown
  - Verify comparison/ranking if available

- [ ] **3.4 Navigate to entity from map**
  - Click on region
  - Find "View details" or entity link
  - Click link
  - Verify navigates to entity page

- [ ] **3.5 Close details panel**
  - Open details panel by clicking region
  - Find close button or click elsewhere
  - Verify panel closes

### 4. Change Metric

- [ ] **4.1 Switch to spending metric**
  - Navigate to map view
  - Find metric selector
  - Select "Spending" / "Cheltuieli"
  - Verify heatmap colors update

- [ ] **4.2 Switch to revenue metric**
  - Select "Revenue" / "Venituri"
  - Verify heatmap colors update
  - Verify legend updates

- [ ] **4.3 Per capita metric**
  - Select "Per capita" option
  - Verify colors reflect per capita values
  - Verify legend shows per capita range

- [ ] **4.4 Metric affects tooltips**
  - Change metric
  - Hover over county
  - Verify tooltip shows selected metric value

- [ ] **4.5 Metric in URL**
  - Select revenue metric
  - Verify URL contains metric parameter
  - Refresh page
  - Verify revenue metric still selected

### 5. Apply Filters

- [ ] **5.1 Filter by period**
  - Find period filter
  - Select 2024
  - Verify map colors update for 2024 data

- [ ] **5.2 Filter by category**
  - Find category filter
  - Select budget category
  - Verify heatmap shows filtered data

- [ ] **5.3 Filters affect details**
  - Apply filter
  - Click on region
  - Verify details show filtered data

### 6. Map Interactions

- [ ] **6.1 Zoom in/out**
  - Find zoom controls (or use scroll)
  - Zoom in
  - Verify map zooms and shows more detail
  - Zoom out
  - Verify map shows full view

- [ ] **6.2 Pan map**
  - Drag map to pan
  - Verify map moves

- [ ] **6.3 Reset view**
  - Zoom and pan
  - Find reset button
  - Click reset
  - Verify returns to default view

### 7. Error Handling

- [ ] **7.1 Handle API error**
  - Mock map data with 500 error
  - Navigate to page
  - Verify error message displayed
  - **Options:** `{ status: 500 }`

- [ ] **7.2 Handle missing region data**
  - Mock with some regions missing
  - Verify map handles gracefully
  - Verify missing regions shown differently

---

## Fixtures Needed

| Fixture | GraphQL Operation | Description |
|---------|-------------------|-------------|
| `county-data.json` | TBD | County-level budget data |
| `uat-data.json` | TBD | UAT-level budget data |
| `region-details.json` | TBD | Single region details |
| `map-empty.json` | TBD | Empty/no data response |
| `error-500.json` | - | Server error |

---

## Notes

- Map uses Leaflet/React-Leaflet
- Romania has 41 counties + Bucharest
- UAT = Unitate Administrativ-Teritoriala (municipalities)
- Heatmap colors: typically red-green or sequential palette
- May support geolocation for "find my area"
- Legend should match color scale
