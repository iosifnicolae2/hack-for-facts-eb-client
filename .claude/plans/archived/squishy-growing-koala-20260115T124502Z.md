# ChatGPT Agent Prompt: Design Integration of Angajamente Bugetare into Transparenta.eu

## Task Overview

You are a UX/UI design consultant. Your task is to analyze the Transparenta.eu website and design how to integrate **Angajamente Bugetare (Budget Commitments)** alongside the existing **Executii Bugetare (Budget Execution)** data. The goal is to help users understand and compare budget allocations, commitments, and actual payments.

---

## Instructions for ChatGPT Agent

### Step 1: Website Review

Navigate to **https://transparenta.eu** and explore the following views:

1. **Homepage** (`/`) - Understand the entry point and navigation structure
2. **Budget Explorer** (`/budget-explorer`) - Analyze the national budget treemap visualization
3. **Entity Analytics** (`/entity-analytics`) - Review the cross-entity data table view
4. **Entity Detail** (`/entities/{any-cui}`) - Find an entity and explore its detail page (try searching for "Primaria Bucuresti" or any Romanian public institution)
5. **Map View** (`/map`) - Understand the geographic data visualization
6. **Charts** (`/charts`) - Review the custom chart builder

Take screenshots and document your observations about:
- Navigation patterns and information architecture
- Data visualization components (treemaps, charts, tables, maps)
- Filter system (period, classification codes, account types)
- Current terminology and labeling for budget data

---

### Step 2: Context - Current System (Executii Bugetare)

The current platform displays **Budget Execution** data with these characteristics:

| Aspect | Description |
|--------|-------------|
| **Data Type** | Income (`vn`) and Expenses (`ch`) |
| **Key Metrics** | YTD Amount, Monthly Amount |
| **Classifications** | Functional (COFOG3) and Economic codes |
| **Time Granularity** | Monthly, Quarterly, Yearly |
| **Aggregation Levels** | Principal creditor, Secondary creditor, Detailed |
| **Normalization** | Total, Per Capita, % of GDP |

**Current Views for Budget Execution:**
- Treemap breakdowns by functional/economic classification
- Line charts showing trends over time
- Tables with filtering and sorting
- Geographic maps showing spending by region/county

---

### Step 3: New Data - Angajamente Bugetare (Budget Commitments)

The new data source tracks the **budget commitment lifecycle**:

```
Budget Authorization → Commitment → Receipt of Goods/Services → Payment
```

**Key Terminology:**

| Romanian Term | English | Description |
|--------------|---------|-------------|
| **Credite Angajament** | Commitment Credits | Authorized spending limits (can commit up to this amount) |
| **Credite Bugetare** | Budget Credits | Actual budget allocations (can pay up to this amount) |
| **Plati Trezor** | Treasury Payments | Actual payments made through treasury |
| **Receptii Totale** | Total Receipts | Value of goods/services received |
| **Receptii Neplatite** | Unpaid Receipts | Goods received but not yet paid (arrears indicator) |

**Data Structure for Each Line Item:**

| Field Group | Fields |
|-------------|--------|
| **Credits** | Initial commitment credits, Final commitment credits, Available commitment credits, Initial budget credits, Final budget credits, Available budget credits |
| **Execution** | Total receipts, Treasury payments, Non-treasury payments, Unpaid receipts |
| **Monthly Computed** | Monthly treasury payments, Monthly receipts, Monthly commitment changes |

**Key Differences from Budget Execution:**

| Aspect | Budget Execution | Budget Commitments |
|--------|------------------|-------------------|
| **Focus** | What was spent/received | What was committed vs. spent |
| **Key Insight** | Actual financial flows | Budget utilization & arrears |
| **Anomaly Detection** | Unusual spending patterns | Underspending, commitment overruns, arrears |

---

### Step 4: Design Requirements

Create a comprehensive design for integrating Angajamente Bugetare that addresses:

#### A. Information Architecture

1. **Where should Budget Commitments appear?**
   - As a new top-level navigation item?
   - Integrated within existing Budget Explorer?
   - As an additional tab/view within Entity Detail pages?
   - As a new report type in Entity Analytics?

2. **How should users switch between Execution vs. Commitments view?**
   - Toggle switch?
   - Tab navigation?
   - Dropdown selector?
   - Separate pages?

#### B. Key Visualizations Needed

Design visualizations that answer these user questions:

1. **Budget Utilization**: "How much of the budget was actually used?"
   - Compare: Credits Authorized vs. Committed vs. Spent
   - Metric: Utilization Rate (%) = Payments / Budget Credits

2. **Commitment Flow**: "What's the status of commitments?"
   - Pipeline: Authorized → Committed → Received → Paid
   - Identify bottlenecks in the flow

3. **Arrears Detection**: "Are there unpaid obligations?"
   - Metric: Arrears = Receipts - Payments
   - Highlight entities with high arrears

4. **Trend Analysis**: "How are commitments evolving over time?"
   - Monthly commitment vs. payment trends
   - YoY comparison of budget utilization

#### C. Combined Views (Execution + Commitments)

Design views that show BOTH data sources together:

1. **Execution vs. Commitment Comparison**
   - Show how Budget Execution amounts relate to Commitment amounts
   - Identify discrepancies or data quality issues

2. **Budget Lifecycle Dashboard**
   - Single view showing: Budget → Commitment → Receipt → Payment
   - With variance analysis at each stage

3. **Entity Scorecard**
   - Combine execution metrics with commitment metrics
   - Overall "budget health" score

#### D. Filter System Additions

What new filters are needed?

| Filter | Options |
|--------|---------|
| **Data Source** | Budget Execution / Budget Commitments / Both |
| **Funding Source** | A (State budget), B (Own revenues), C (External), etc. |
| **Credit Type** | Commitment credits / Budget credits |
| **Status** | With arrears / Without arrears |

#### E. Anomaly Highlighting

The Angajamente data includes anomaly flags:
- `YTD_ANOMALY`: Values decreased between months (possible correction)
- `MISSING_LINE_ITEM`: Line item disappeared (possible reclassification)

How should these be displayed to users?

---

### Step 5: Deliverables

Provide the following:

1. **Site Map Update**
   - Show where Budget Commitments fits in the navigation
   - Diagram the user flows

2. **Wireframes/Mockups** for:
   - Budget Explorer with Commitments integration
   - Entity Detail page with Commitments tab
   - New "Budget Lifecycle" visualization
   - Arrears dashboard/alert view
   - Combined Execution + Commitments comparison view

3. **Component Specifications**
   - New UI components needed
   - Modifications to existing components
   - Data display patterns (charts, tables, KPIs)

4. **Terminology Recommendations**
   - User-friendly labels for complex concepts
   - Tooltips/explanations for technical terms
   - Romanian and English translations

5. **Priority Recommendations**
   - MVP features vs. future enhancements
   - Quick wins vs. complex implementations
   - User value vs. implementation effort matrix

---

### Step 6: Considerations

Keep in mind:

1. **Target Users**: Public sector officials, journalists, researchers
2. **Localization**: Romanian and English languages
3. **Mobile Responsiveness**: Design should work on all devices
4. **Accessibility**: WCAG compliance
5. **Performance**: Large datasets (millions of line items)
6. **Existing Patterns**: Match the current UI/UX conventions of Transparenta.eu

---

## Expected Output Format

Please structure your response as:

```markdown
# Angajamente Bugetare Integration Design

## 1. Executive Summary
[Brief overview of recommended approach]

## 2. Information Architecture
[Site map, navigation changes, page structure]

## 3. User Flows
[How users will discover and use commitment data]

## 4. Wireframes
[Describe each key screen/component]

## 5. Visualization Design
[Specific charts, KPIs, and data displays]

## 6. Filter System
[New filters and modifications]

## 7. Terminology Guide
[User-facing labels with translations]

## 8. Implementation Roadmap
[Phased approach with priorities]

## 9. Open Questions
[Decisions that need stakeholder input]
```

---

## Reference: Key URLs to Explore

- Homepage: https://transparenta.eu
- Budget Explorer: https://transparenta.eu/budget-explorer
- Entity Analytics: https://transparenta.eu/entity-analytics
- Map: https://transparenta.eu/map
- Charts: https://transparenta.eu/charts
- Sample Entity: https://transparenta.eu/entities/4267117 (Primaria Bucuresti)

---

## Reference: Current Component Patterns

The site uses:
- **Treemaps**: Hierarchical budget breakdowns with drill-down
- **Shadcn UI**: Radix-based component library
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Data visualization library
- **Tables**: TanStack Table with sorting/filtering/export
- **Filters**: URL-based state with collapsible panels
- **Modals/Drawers**: Detail views and configuration panels
