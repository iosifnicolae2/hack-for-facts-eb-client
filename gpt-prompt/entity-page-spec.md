# **Specification: Entity Detail Page**

## 1. **Overview**

The Entity Detail Page provides a comprehensive 360-degree view of a single public entity. It serves as a central hub for analyzing an entity's financial health, spending patterns, and relationships with other entities. The page is designed to be interactive, allowing users to explore data across different years and perspectives.

**Route:** `/entities/$cui`
**URL Parameter:** `cui` (The unique identifier for the entity)

## 2. **Page State Management**

The page's state is managed primarily through URL search parameters, allowing for shareable and bookmarkable views. State is validated using `zod` schemas.

- `view`: The selected data view for the page. (Type: `string`, Default: `'overview'`)
- `year`: The selected reporting year for most components. (Type: `number`, Default: Current Year)
- `trend`: The mode for the financial trends chart. (Type: `'absolute' | 'percent'`, Default: `'absolute'`)
- `expenseSearch`: Search term for filtering expense line items. (Type: `string`)
- `incomeSearch`: Search term for filtering income line items. (Type: `string`)
- `analyticsChartType`: The chart type for the line item analytics. (Type: `'bar' | 'pie'`, Default: `'bar'`)
- `analyticsDataType`: The data type shown in the analytics chart. (Type: `'income' | 'expense'`, Default: `'expense'`)

## 3. **Core Components**

The page is composed of several modular React components, each responsible for a specific piece of information.

### 3.1. **`EntityHeader`**

- **Purpose:** Displays the primary identification details of the entity.
- **Data Shown:**
  - Entity Name (Clickable to reset the page view)
  - Entity Type (e.g., "Instituție Publică")
  - CUI (Cod Unic de Înregistrare)
  - Address
  - UAT (Unitate Administrativ-Teritorială)
  - Related Entities: Lists parent entities (Finanțatori) and child entities (Entități finanțate).
- **Interactive Elements:**
  - **Year Selector:** A dropdown allowing the user to select the reporting year, which updates the entire page.
  - Links to navigate to the pages of related entities.

### 3.2. **`EntityFinancialSummary`**

- **Purpose:** Provides a high-level, at-a-glance overview of the entity's financial position for the selected year.
- **Data Shown:**
  - **Cheltuieli totale (Total Expenses):** The sum of all expenses.
  - **Venituri totale (Total Income):** The sum of all income.
  - **Balanța bugetară (Budget Balance):** The difference between income and expenses.
- **Layout:** Presented as a series of summary cards.

### 3.3. **`EntityFinancialTrends`**

- **Purpose:** Visualizes the entity's financial performance over a multi-year period (2016-2024).
- **Data Shown:** An area chart displaying trends for:
  - Income
  - Expenses
  - Balance
- **Interactive Elements:**
  - **Year Selection:** Clicking a specific year on the chart updates the page to reflect that year's data.
  - A reference line indicates the currently selected year.

### 3.4. **`EntityLineItems`**

- **Purpose:** Presents a detailed, browsable breakdown of all financial transactions (line items) for the selected year.
- **Layout:** A two-column layout, one for "Expenses" and one for "Incomes".
- **Data Shown:** Each section contains a hierarchical accordion:
  - **Level 1:** Chapter (e.g., "Învățământ")
  - **Level 2:** Functional Classification (e.g., "Învățământ secundar")
  - **Level 3:** Economic Classification (e.g., "Bunuri și servicii")
- **Interactive Elements:**
  - **Search:** A dedicated search bar for both incomes and expenses to filter line items by name.
  - The search state is reflected in the URL (`expenseSearch`, `incomeSearch`).

### 3.5. **`LineItemsAnalytics`**

- **Purpose:** Offers a graphical representation of the entity's spending or income structure by category.
- **Data Shown:** A chart that aggregates line items by their main functional classification chapter (e.g., "Asistență Socială", "Ordine Publică").
- **Interactive Elements:**
  - **Data Type Toggle:** Switch between viewing `Income` or `Expense` data.
  - **Chart Type Toggle:** Switch between a `Bar Chart` and a `Pie Chart`.
  - **Year Selector:** A dropdown to analyze data for a specific year, independent of the main page year selector.

### 3.6. **`EntityReports`**

- **Purpose:** Provides access to official financial reports submitted by the entity.
- **Layout:** An accordion component containing a list of reports.
- **Data Shown (for each report):**
  - Reporting Year & Date
  - Report Type
  - Main Creditor (with a link to their entity page)
- **Interactive Elements:**
  - Download links for each report, typically in PDF or Excel format.

### 3.7. **`FloatingEntitySearch`**

- **Purpose:** Allows the user to quickly search for and navigate to another entity without returning to a main search page.
- **Layout:** A floating action button (FAB) with a search icon.
- **Interactive Elements:**
  - Clicking the button opens a modal dialog containing the `EntitySearchInput`.
  - Can be opened with the `mod+k` keyboard shortcut.

### 3.8. **`EntityViewSwitcher`**

- **Purpose:** Provides a set of badge-style buttons that allow the user to switch between different data views for the entity.
- **Layout:** A horizontal row of horizontally scrollable badge-like buttons, placed below the `EntityHeader`.
- **Interactive Elements:**
  - Each button represents a view (e.g., "Overview", "Reports").
  - Clicking a button updates the `view` URL search parameter.
  - The active view's button is visually highlighted.
- **Logic:**
  - A new hook, `useEntityViews(entity: EntityDetailsData)`, will be created to determine the available views.
  - This hook will always return a default set of views:
    - `Overview`: The default view.
    - `Reports`: Available if the entity has reports.
  - It will also include conditional views based on entity data:
    - `Income/Expense Trends`: Available if there is trend data.
    - `Map Data`: Available for UAT or "Județ" entity types.

## 4. **Data Flow & Logic**

1.  The `cui` and `view` are extracted from the URL.
2.  The `useEntityDetails` hook fetches all necessary data for the page.
3.  The `useEntityViews` hook determines the available views based on the fetched entity data.
4.  The main page component uses the `view` parameter to conditionally render the appropriate components:
    - **`overview` (Default):** Renders `EntityFinancialSummary`, `EntityFinancialTrends`, `EntityLineItems`, and `LineItemsAnalytics`.
    - **`reports`:** Renders only the `EntityReports` component.
    - **`trends`:** Renders a new dedicated trends component.
    - **`map`:** Renders a new dedicated map component.
5.  URL search parameters (`year`, `trend`, etc.) are used to manage the state of the individual components within each view.
6.  Loading and error states are handled with dedicated full-page views.
