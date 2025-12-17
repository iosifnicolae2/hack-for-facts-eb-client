# Landing Page E2E Tests

**Route:** `/`
**Test File:** `tests/flows/landing-page.spec.ts`
**Fixtures:** `tests/fixtures/landing-page-flow/`

---

## Test Scenarios

### 1. Entity Search

- [ ] **1.1 Search by entity name**
  - Navigate to `/`
  - Find search input
  - Type "Cluj" in search
  - Verify search results appear
  - Verify results contain matching entities
  - **GraphQL:** `EntitySearch`

- [ ] **1.2 Search with no results**
  - Navigate to `/`
  - Type "xyznonexistent123" in search
  - Verify empty state message appears
  - **Fixture:** `entity-search-empty.json`

- [ ] **1.3 Click search result navigates to entity**
  - Navigate to `/`
  - Search for entity
  - Click on first result
  - Verify URL changes to `/entities/{cui}`
  - Verify entity details page loads

- [ ] **1.4 Search loading state**
  - Mock search with delay
  - Type in search
  - Verify loading indicator appears
  - Verify results appear after loading
  - **Options:** `{ delay: 1000 }`

- [ ] **1.5 Search error handling**
  - Mock search with 500 error
  - Type in search
  - Verify error message appears
  - **Options:** `{ status: 500 }`

### 2. Quick Navigation

- [ ] **2.1 Navigate to Budget Explorer**
  - Navigate to `/`
  - Find and click Budget Explorer card/link
  - Verify URL is `/budget-explorer`

- [ ] **2.2 Navigate to Entity Analytics**
  - Navigate to `/`
  - Find and click Entity Analytics card/link
  - Verify URL is `/entity-analytics`

- [ ] **2.3 Navigate to Map**
  - Navigate to `/`
  - Find and click Map card/link
  - Verify URL is `/map`

- [ ] **2.4 Navigate to Charts**
  - Navigate to `/`
  - Find and click Charts card/link
  - Verify URL is `/charts`

### 3. Page Load

- [ ] **3.1 Landing page loads successfully**
  - Navigate to `/`
  - Verify main heading is visible
  - Verify navigation is visible
  - Verify search is accessible

- [ ] **3.2 Landing page accessibility**
  - Navigate to `/`
  - Verify keyboard navigation works
  - Verify focus states are visible

---

## Fixtures Needed

| Fixture | GraphQL Operation | Description |
|---------|-------------------|-------------|
| `entity-search.json` | `EntitySearch` | Search results with entities |
| `entity-search-empty.json` | `EntitySearch` | Empty search results |
| `error-500.json` | - | Server error response |

---

## Notes

- Search may use autocomplete/combobox pattern
- Results may appear in dropdown or separate section
- Navigation cards may be buttons or links
