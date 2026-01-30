# Important: Provide a direct, complete answer.

<!--
@web-flow begin
kind: prompt
id: prompt-20260130130720720
timestamp: "2026-01-30T13:07:20.720Z"
schema: web-flow/research/v1
version: 1
-->
Important: Provide a direct, complete answer. Do not ask clarifying questions.

Please conduct deep research on: **UI/UX best practices for presenting public budget commitment (angajamente bugetare) data on a government transparency platform**

## Context

We are building **transparenta.eu**, a Romanian government transparency platform that analyzes public budget data. Our target users are **public sector analysts** and **independent journalists** who need to find anomalies in public spending.

The platform tracks how public money flows through a **4-stage pipeline** mandated by Romanian public accounting:

```
Budget Credits → Commitments → Receipts → Payments
(Allocation)     (Contracts)   (Delivered)  (Paid out)
```

Each stage represents a progressively smaller amount — the "funnel" from authorized spending to actual treasury disbursements. The gaps between stages reveal critical insights:
- **Budget vs Commitments gap**: under-utilization or poor planning
- **Commitments vs Receipts gap**: delivery delays or contract issues
- **Receipts vs Payments gap**: **arrears** (the most serious red flag — goods delivered but not paid for)

### What We Already Have
1. **3 KPI summary cards**: Total Budget, Legal Commitments, Payments Made
2. **A Sankey-style flow visualization**: Budget → Commitments → Payments with "available" and "to pay" split-off arms
3. **A horizontal bar chart**: by functional classification showing budget/committed/paid per category
4. **An educational info panel**: explaining what commitments are for non-expert users
5. **A hierarchical drill-down table**: functional/economic grouping with budget, commitments, % committed, payments, unpaid
6. **A line-item detail table**: individual records with anomaly detection (YTD anomalies, missing line items)

### Data We Have But Don't Yet Surface in the UI
- **Receipts (Receptii)**: value of goods/services delivered — the missing 3rd pipeline stage
- **Unpaid Receipts (Receptii Neplatite)**: absolute arrears balance — critical for transparency
- **Monthly change in unpaid receipts**: trend showing if arrears are growing or shrinking
- **Initial vs Definitive budget credits**: shows mid-year budget rectifications
- **Commitment rate**: (commitments / budget) × 100
- **Execution rate**: (payments / budget) × 100
- **Commitment vs Execution comparison**: cross-referencing two reporting systems
- **Time-series analytics**: quarterly trends for any metric over multiple years
- **Anomaly flags**: YTD value decreases (accounting corrections) and missing line items
- **Funding sources and budget sectors**: additional classification dimensions
- **Per capita normalization, inflation adjustment, EUR/USD conversion**

## Research Questions

### 1. Multi-Stage Financial Pipeline Visualization
How do the best government transparency tools visualize commitment-to-payment pipelines? Research:
- **USASpending.gov** — How does the US federal spending tracker show obligation-to-outlay flows?
- **OpenBudgets.eu** — European budget visualization approaches
- **UK Spend Network / OSCAR** — UK government spending transparency
- **World Bank BOOST** — How developing country budget data is visualized
- **IMF GFS / PEFA** — International standards for public finance visualization
- What chart types work best for showing a 4-stage funnel with percentage drop-offs?

### 2. Arrears Visualization & Early Warning
What are effective UI patterns to highlight growing arrears (unpaid receipts) as an early warning system?
- Sparklines showing monthly arrears trends
- Traffic-light / RAG status indicators
- Threshold-based alerts (e.g., arrears > 10% of receipts)
- Heatmaps showing which budget categories have the worst arrears
- How do financial dashboards (Bloomberg Terminal, FactSet) show receivables aging?

### 3. Budget Rectification Visualization
How to show initial vs. final budget allocations meaningfully?
- Waterfall charts showing additions/reductions
- Before/after comparison bars
- Variance analysis patterns
- How to communicate "the budget changed mid-year" to non-expert users

### 4. Rate Gauges & KPI Dashboards
Best practices for showing execution rate and commitment rate:
- Gauge/dial components with contextual benchmarks
- Progress bars with color zones (healthy: 85-100%, warning: 70-84%, danger: <70%)
- Bullet charts (Stephen Few's pattern)
- How to show rates alongside absolute values without confusion

### 5. Time-Series for Budget Data
Best chart types for quarterly/annual budget trends:
- Area charts vs. line charts vs. bar charts for cumulative vs. periodic data
- Showing multiple metrics (commitments, payments, arrears) on the same timeline
- Year-over-year comparison patterns (small multiples, overlaid lines)
- How to handle the quarterly vs. monthly data availability mismatch

### 6. Anomaly Highlighting in Tables
How to make data quality issues visible without overwhelming users:
- Inline warning icons with tooltips
- Row-level highlighting patterns
- Separate "data quality" panel vs. inline markers
- How Bloomberg, Reuters, or financial auditing tools flag data anomalies

### 7. Progressive Disclosure for Complex Financial Data
How to layer information for different expertise levels:
- Summary → Detail → Raw data pattern
- Tooltip-based context vs. expandable panels
- "Learn more" patterns for domain-specific terms
- How USASpending.gov, OpenSpending, or Follow The Money handle progressive disclosure

### 8. Comparison Tools
Patterns for entity-vs-entity, year-over-year, and sector comparison:
- Side-by-side dashboard layouts
- Small multiples
- Parallel coordinates for multi-dimensional comparison
- Scatterplots (e.g., commitment rate vs. execution rate by entity)
- Ranking tables with sparklines

### 9. Data Export & Storytelling for Journalists
Tools that help journalists extract insights:
- Automated narrative generation ("This entity's arrears grew 45% this quarter")
- Chart annotation and download features
- Shareable URLs with filter state preserved
- Embeddable widgets for news articles
- CSV/Excel export with meaningful column headers

### 10. Accessibility
How to make financial visualizations accessible:
- Color-blind safe palettes for budget/committed/paid/arrears
- Screen reader support for charts (ARIA labels, data tables as fallback)
- Keyboard navigation for interactive visualizations
- High-contrast mode considerations

## Constraints
- Tech stack: React 19, TypeScript, Tailwind CSS v4, Recharts, D3, shadcn/ui
- Target audience: Romanian journalists and public sector analysts (not financial experts)
- Data is natively quarterly; monthly available for subset of metrics
- Must support Romanian (primary) and English languages
- Performance: some queries take 10-45 seconds (need loading states, progressive loading)

## Output Format
Please provide:
1. **Concrete UI component recommendations** — What to build, with wireframe-level descriptions
2. **Interaction patterns** — How users navigate between overview and detail
3. **Data visualization choices** — Specific chart types with rationale
4. **Priority ranking** — Which improvements would have the highest impact for journalist users
5. **Reference implementations** — Links to live examples or open-source libraries
6. **Accessibility checklist** — Specific WCAG 2.1 AA requirements for financial dashboards
<!-- @web-flow end id=prompt-20260130130720720 -->

<!--
@web-flow begin
kind: response
status: completed
provider: chatgpt
url: "https://chatgpt.com/c/697cada1-8628-8384-b3b7-c68d7791d0a8"
id: response-20260130151956225-chatgpt
prompt_id: prompt-20260130130720720
timestamp: "2026-01-30T15:19:56.225Z"
schema: web-flow/research/v1
version: 1
-->
## 1. Concrete UI component recommendations

### A. “4‑Stage Pipeline” overview module (replace/extend your current 3‑stage Sankey)

**Goal:** make the *commitment → receipt → payment* gaps legible at a glance, and turn “arrears” into a first‑class signal.

**Recommended component set (one cohesive module):**

**A1) Pipeline header: stage cards + conversion chips**

* 4 (or 5) compact cards in a row:

  1. **Budget credits** (toggle: *Definitive* vs *Initial*; default Definitive)
  2. **Commitments (Angajamente)**
  3. **Receipts (Receptii)**
  4. **Payments (Plăți)**
  5. optional: **Unpaid receipts (Receptii neplătite)** as a red-emphasis “stock” card
* Between cards, show “conversion chips” with both **% and absolute**:

  * **Commitment rate** = Commitments / Budget
  * **Receipt coverage** = Receipts / Commitments
  * **Payment coverage** = Payments / Receipts
* Each chip has a hover tooltip explaining the interpretation (and that some values are **YTD cumulative vs stock**).

**Wireframe sketch**

```
[ Budget (Definitive ▾) ] → [ Commitments ] → [ Receipts ] → [ Payments ]   [ Unpaid Receipts ]
      12.3B RON               11.1B RON         10.4B RON       9.8B RON         0.6B RON
      Δ vs initial +0.9B      90% of budget     94% of comm.    94% of receipts   5.8% of receipts
```

**A2) Flow visualization: “Sankey-with-residuals” (your existing pattern, extended to 4 stages)**

* Keep the mental model you already have: main stream + split-off arms.
* Extend it as:

  * Budget → Commitments → Receipts → Payments
  * Split-offs:

    * **Uncommitted budget** = Budget − Commitments
    * **Undelivered commitments** = Commitments − Receipts
    * **Unpaid receipts (arrears proxy)** = Receipts − Payments (or your `receptii_neplatite` if available)
* Rationale: Sankey is explicitly suited for showing flows/relationships and where quantities “go.” ([analysisfunction.civilservice.gov.uk][1])

**A3) “Gap explainer” mini-panel (right side)**

* When hovering/clicking a segment, show:

  * **What this gap means**
  * **Common causes**
  * **What to check next** (links into your drill-down table with filters pre-applied)

---

### B. “Arrears Early Warning” module (journalist-first)

**Goal:** unpaid receipts are the most story‑worthy red flag; treat them like a risk monitor.

**B1) Arrears KPI card with sparkline + status**

* Large number: **Unpaid Receipts (RON/EUR)** (stock)
* Secondary:

  * **Arrears ratio**: unpaid / receipts (or unpaid / payments, but receipts is usually clearer)
  * **Δ MoM** (from `receptii_neplatite_change`) and **Δ QoQ**
* Sparkline (last 12 months if available; else last 8 quarters)
* Status (RAG) driven by:

  * absolute level (size)
  * ratio
  * trend slope (growing vs shrinking)
* Important context: IMF defines arrears as amounts **unpaid and past due**; your “unpaid receipts” is a *proxy* unless you also track due dates. Make that explicit in UI text. ([IMF][2])

**B2) “Arrears heatmap by classification”**

* Heatmap grid: rows = functional prefixes, columns = quarters (or months if available), cell color = arrears ratio or arrears growth.
* Clicking a cell filters:

  * your hierarchical drill-down table
  * your line-item anomaly table
* Add a toggle: **ratio** vs **absolute** to avoid misleading comparisons for tiny categories.

**B3) “Top arrears contributors” ranked table**

* Top N categories / entities:

  * Unpaid receipts
  * Arrears ratio
  * Trend sparkline (tiny)
  * “Last change” indicator
* This becomes a journalist’s “lead list.”

**Why this matters in public finance terms:** arrears are often considered a form of *non-transparent financing* and a symptom of weak commitment/cash controls. ([Natural Resource Governance Institute][3])

---

### C. “Budget Rectification / Revisions” module (Initial vs Definitive)

**Goal:** show *what changed* in-year without forcing users to understand Romanian budget mechanics.

**C1) “Budget changed” banner + delta**

* If definitive ≠ initial by more than a threshold (e.g., 2–5%):

  * show a subtle banner: “Buget rectificat: +X RON (+Y%)”
  * link “See changes”

**C2) “Bridge / Waterfall” chart**

* If you have only initial + definitive totals:

  * use a **2-bar comparison + delta annotation** (simple and honest)
* If you can extract revision events (ideal):

  * show a **waterfall**: Initial → (+) increases → (−) cuts → Definitive
* Rationale: waterfall/bridge charts are a standard pattern for explaining how a total changed between two states. ([Microsoft][4])

---

### D. “Rates & Benchmarks” module (replace gauge/dial with bullet graphs)

**Goal:** show commitment/execution rates *with context* and without dashboard “speedometers”.

**D1) Bullet chart for commitment rate**

* Primary bar = commitment rate
* Reference line = 100% (legal ceiling) or “peer median”
* Background bands = qualitative ranges (danger/warn/ok)
* Include absolute pair under chart:

  * “11.1B / 12.3B RON”
* Bullet graphs were explicitly designed as a compact replacement for gauges and to carry richer context. ([perceptualedge.com][5])

**D2) Bullet chart for execution rate**
Same pattern, plus optional reference line:

* prior-year execution rate (this entity)
* sector median

---

### E. “Time-series Explorer” (quarterly-native, monthly-aware)

**Goal:** journalists/analysts need trend + seasonality + reversals.

**E1) Metric selector + normalization strip**

* Metric dropdown: Budget, Commitments, Receipts, Payments, Unpaid Receipts, Rates, Deltas
* Normalization toggle: total / per capita / %GDP; currency; inflation adjusted
* Explicit labels: “flow (YTD)” vs “stock (end of period)”

**E2) Chart area**

* Default: **line chart** for trends
* Optional: small multiples for top categories (e.g., top 6 functional prefixes)
* Provide “compare years” toggle:

  * overlay lines by year (only if not too cluttered)
  * otherwise small multiples by year
* Chart-type guidance generally favors clear basics (line/bar/scatter) for most UX contexts. ([Nielsen Norman Group][6])

**E3) Quarterly vs monthly mismatch handling**

* If monthly only exists for select metrics:

  * show a **granularity toggle** but disable unsupported combos (with tooltip “monthly not available for this metric”)
  * visually differentiate monthly series (e.g., dashed stroke or lighter weight)
  * keep **one time axis** to avoid misleading dual-scale charts unless absolutely necessary

---

### F. “Commitment vs Execution reconciliation” module (two systems, one story)

**Goal:** differences between reporting systems are themselves anomalies.

**F1) Difference-over-time chart**

* Two lines: “Angajamente system” vs “Executie system”
* Below: **difference bars** (positive/negative) + percent
* Include “unmatched periods” counts as a small KPI row
* Copyable explanation: “Mismatch can indicate reporting lag, classification mismatch, or data quality.”

This mirrors how data quality is treated as an explicit dimension in transparency contexts (e.g., oversight reports about completeness/consistency in spending reporting). ([Government Accountability Office][7])

---

### G. “Data Quality & Anomalies” surface (without overwhelming)

**G1) Data-quality summary strip (above tables)**

* “Flags in this view: 23 YTD decreases, 14 missing line items”
* Toggle: “Highlight anomalies” (default ON for journalists)
* Filter pill: “Show only anomalies”

**G2) Inline row markers**

* One small icon column:

  * warning triangle (YTD decrease)
  * dashed circle (missing item)
* Tooltip explains:

  * what it means
  * why it can happen (corrections/resubmissions)
* Keep row color subtle; use icons + a right-border accent to avoid “Christmas tree tables”.

---

### H. “Journalist toolkit” (export, share, annotate)

**H1) Shareable URLs with full filter state**

* “Copy link” button (includes filters, metric, period, normalization, language)
* “Permalink to this table row” for anomalies

**H2) Download menu**

* CSV/Excel for tables (with human-friendly headers)
* PNG/SVG export for charts
* “Download this view’s metadata” (definitions, sources, query params) for reproducibility

A strong reference is the World Bank’s PPI Visualization Dashboard pattern: it includes explicit “Copy URL to share” and “Download as CSV.” ([ppi.worldbank.org][8])
OpenBudgets also targets journalists and supports embedding via “microsites,” which is directly aligned with your “share stateful views” goal. ([openbudgets.eu][9])

---

## 2. Interaction patterns

### A. Navigation model: “Overview → Explain → Investigate → Extract”

1. **Overview (default)**
   Pipeline + top risks + top categories
2. **Explain (optional)**
   Short contextual panel (“What is an angajament / receptie / arrears?”) with examples
3. **Investigate (drill-down)**
   Hierarchical table + time-series explorer + anomaly table
4. **Extract (journalist actions)**
   Export, permalink, embed, narrative snippet

This is progressive disclosure: show the few most important options first, then reveal complexity on demand. ([Nielsen Norman Group][10])

### B. Cross-filtering rules (keep it predictable)

* Clicking a functional category bar filters:

  * pipeline (recomputed for that slice)
  * time-series (focus series)
  * tables (prefilter)
* Provide a persistent “Active filters” row with removable chips.
* Always show “Reset” and “Back to national totals”.

### C. Drill-down patterns (avoid getting lost)

* Breadcrumbs:

  * “Funcțional: 51 → 51.01 → 51.01.03”
* “Pin selection” to compare siblings:

  * pin two categories and keep them visible as small multiples

### D. Long-query UX (10–45s)

* Replace spinners with **step-based progress** when possible:

  * “Running query… (1/3) fetching summary”
  * “(2/3) fetching aggregates”
  * “(3/3) fetching line items”
* Show partial UI as soon as summary is ready:

  * KPI cards render first
  * charts render next
  * tables last
* Provide:

  * “Cancel” (abort fetch)
  * “Try narrower filters” suggestions
* NN/g defines dashboards as “single-page, at-a-glance views users act on quickly” — so perceived latency matters; progressive rendering preserves the dashboard promise. ([Nielsen Norman Group][11])

### E. Table interaction best practices (your core investigative surface)

NN/g identifies four major table user tasks: **find**, **compare**, **view/edit**, **take actions**. Your design should explicitly support the first two. ([Nielsen Norman Group][12])
Practical patterns:

* sticky header + sticky first column (classification name)
* column grouping (Budget | Commitments | Receipts | Payments | Arrears)
* sortable numeric columns, with “sort by absolute” and “sort by ratio”
* “Compare selected rows” mode (adds a small comparison tray)

---

## 3. Data visualization choices with rationale (mapped to your research questions)

### 1) 4-stage pipeline (funnel) options

**Best default:** **Sankey-with-residuals** (interactive)

* Pros: shows both the **main flow** and **where leakage accumulates** (uncommitted, undelivered, unpaid). Sankey is suited to flow relationships. ([analysisfunction.civilservice.gov.uk][1])
* Cons: can become visually heavy at many categories; keep this at high aggregation.

**Secondary representations (for accessibility + precision):**

* **Stage “bridge bars”**: one horizontal stacked bar per stage, showing progressed vs remaining
* **Waterfall variant**: show Budget minus “losses” to reach Payments (useful for presentations, less for exploration) ([Microsoft][4])

### 2) Arrears visualization & early warning

* **KPI + sparkline**: fastest signal
* **Trend line + threshold bands**: shows directionality
* **Heatmap**: best for “where is it worst?”
* **(If dates exist) Aging buckets stacked bar**: mirrors classic payables/receivables aging logic
  Standards grounding:
* IMF explicitly defines arrears as unpaid and past due; make your UI careful about whether you show *arrears* vs *unpaid balance proxy*. ([IMF][2])
* PEFA frames arrears as a transparency/discipline problem (“non-transparent financing”). ([Natural Resource Governance Institute][3])

### 3) Budget rectification (initial vs definitive)

* **2-bar + delta** if only two points (simple, avoids implied detail)
* **Waterfall** if you have revision events (best explanatory) ([Microsoft][4])

### 4) Rates (commitment/execution)

* Prefer **bullet charts** over gauges:

  * more information density
  * better comparison and target context
  * explicitly designed to replace gauges ([perceptualedge.com][5])

### 5) Time-series for budget data

* **Line charts** for trends; **bars** for period deltas; **area** only when stacked totals are the message.
* For multiple metrics:

  * avoid overlaying 3–4 lines of different semantics (flow vs stock). Use small multiples or toggles.
* For YoY:

  * small multiples per year or overlay with strong labeling and limited series count.
    NN/g guidance for chart selection in UX contexts strongly favors the basics (bar/line/scatter) unless there’s a clear reason otherwise. ([Nielsen Norman Group][6])

### 6) Anomaly highlighting in tables

* Inline icons + tooltips; optional “anomaly-only” filter
* Separate “data quality” drawer for definitions and counts (so you don’t pollute the main table)

### 7) Progressive disclosure

* “Explain” layer is optional and collapsible
* Advanced toggles (“exclude transfers”, “inflation-adjusted”, “% GDP”) live in an “Advanced” drawer
* This matches classic progressive disclosure: keep the first view simple, disclose power on demand. ([Nielsen Norman Group][10])

### 8) Comparison tools

High leverage for anomaly hunting:

* **Scatter plot:** x = commitment rate, y = execution rate, size = budget, color = arrears ratio

  * Outliers (high commitments, low execution; or high arrears) pop instantly.
* **Small multiples pipelines** for selected entities (2–4), same scale.

### 9) Export & storytelling

* “Copy finding” templates with computed deltas:

  * “Unpaid receipts grew by X RON (+Y%) since last quarter”
* Shareable links + CSV download (World Bank dashboard pattern) ([ppi.worldbank.org][8])
* Embeddable widgets (OpenBudgets microsites pattern) ([openbudgets.eu][9])

---

## 4. Priority ranking (impact for journalists)

### P0 — Highest impact (build next)

1. **Add Receipts + Unpaid Receipts into the core pipeline** (4-stage Sankey + stage cards)
2. **Arrears Early Warning module** (KPI + trend + top contributors + heatmap)
3. **Shareable URLs + CSV export at every investigative surface** (table + chart)

### P1 — High impact

4. **Bullet-chart rate panel** (commitment/execution with benchmarks)
5. **Commitment vs Execution reconciliation view** (difference bars + unmatched periods)
6. **Anomaly UX upgrades** (summary strip + inline markers + anomaly-only filter)

### P2 — Medium impact (but compounding value)

7. **Time-series Explorer** (multi-year, normalization, quarterly-first)
8. **Budget rectification bridge** (initial vs definitive, with drill to revisions if possible)
9. **Comparison workspace** (scatter + side-by-side pipelines)

---

## 5. Reference implementations and libraries

### Government / institutional patterns

* **US federal concepts: obligations → outlays** (maps closely to commitments → payments) are defined in budget terms by CBO and Treasury. ([Congressional Budget Office][13])
* **USAspending “spending explorer” drill-down** (program activity breakdown etc.) is documented in CRS reporting (useful for your drill patterns). ([Congress.gov][14])
* **World Bank BOOST portal**: emphasis on interactive tables/charts for granular fiscal data across countries. ([World Bank][15])
* **OpenBudgets.eu**: explicitly oriented to publishing/visualizing budgets and embedding (“microsites”), including a journalist use case. ([openbudgets.eu][9])
* **World Bank PPI dashboard**: explicit UI affordances for “copy URL” + “download CSV”. ([ppi.worldbank.org][8])

### Chart patterns (best-practice references)

* **Bullet graphs (Stephen Few)**: design spec and rationale (“replace meters and gauges”). ([perceptualedge.com][5])
* **Sankey graphs**: recommended chart type for flow relationships in government analysis guidance. ([analysisfunction.civilservice.gov.uk][1])

### Libraries you can use in your stack

* **Recharts**: lines/bars/scatter/small sparklines; can implement bullet charts via `BarChart + ReferenceLine + ReferenceArea`.
* **D3**: Sankey (d3-sankey) + heatmap grid + labeling collision handling.
* **Table virtualization**: react-virtual / TanStack Virtual (if not already) for large line-item tables.

---

## 6. Accessibility checklist (WCAG 2.1 AA) for financial dashboards

### A. Non-text alternatives for charts

* Provide **text summary (“museum label”)** directly adjacent to each chart: what it shows + key takeaway. ([accessibility.blog.gov.uk][16])
* Provide **data table fallback** (“View as table”) for every chart (screen-reader and power-user friendly). ([TPGi — a Vispero company][17])
* Ensure chart container has programmatic name/description (e.g., `<figure>` + `<figcaption>`, or ARIA labeling).

### B. Color and contrast

* Do not rely on color alone for status (use icons, labels, patterns) — critical for arrears RAG and heatmaps.
* Maintain AA contrast for text (1.4.3) and **non-text contrast** for UI components/graphical objects (1.4.11).
* Provide a high-contrast mode option; ensure the pipeline still works (pattern/shape, not just hue).

(UK government chart guidance includes an accessibility checklist approach that’s directly applicable. ([analysisfunction.civilservice.gov.uk][18]))

### C. Keyboard and focus

* All chart interactions must be reachable by keyboard:

  * focusable legend items, series toggles
  * “next/previous data point” navigation (or a table fallback)
* Focus visible (2.4.7) with high-contrast focus ring.
* No hover-only content: tooltips must appear on focus as well (1.4.13).

### D. Tables (your most important accessibility surface)

* Use proper `<th>` headers, `scope`, and logical structure so screen readers can associate cells with headers. ([MDN Web Docs][19])
* Support the core table tasks (find/compare) with:

  * clear sorting state
  * filter summaries
  * sticky headers/columns where appropriate (also helps sighted users). ([Nielsen Norman Group][12])

### E. Language and numbers (RO/EN)

* Set correct `lang` on the page and on language-switching regions (3.1.1).
* Format numbers per locale (RO decimal comma, grouping) and keep unit labels explicit (RON/EUR, “mil.”).

### F. Status messages & long loading

* Announce loading/completion via ARIA live regions (4.1.3 Status Messages).
* Provide deterministic progress when possible (step-based), not endless spinners, especially with 10–45s operations.

---

If you want this turned into a concrete page-by-page IA + component inventory (React/shadcn/Recharts/D3) with prop-level specs (inputs/outputs/states/loading/error/empty), say which primary page you want to redesign first (entity page vs national overview vs category drill-down).

[1]: https://analysisfunction.civilservice.gov.uk/policy-store/data-visualisation-charts/ "https://analysisfunction.civilservice.gov.uk/policy-store/data-visualisation-charts/"
[2]: https://www.imf.org/external/pubs/ft/gfs/manual/2014/gfsfinal.pdf "https://www.imf.org/external/pubs/ft/gfs/manual/2014/gfsfinal.pdf"
[3]: https://resourcegovernance.org/sites/default/files/PEFA%20Framework.pdf "https://resourcegovernance.org/sites/default/files/PEFA%20Framework.pdf"
[4]: https://www.microsoft.com/en-us/microsoft-365/blog/2015/08/04/introducing-the-waterfall-chart-a-deep-dive-to-a-more-streamlined-chart/ "https://www.microsoft.com/en-us/microsoft-365/blog/2015/08/04/introducing-the-waterfall-chart-a-deep-dive-to-a-more-streamlined-chart/"
[5]: https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf "https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf"
[6]: https://www.nngroup.com/articles/choosing-chart-types/?utm_source=chatgpt.com "Choosing Chart Types: Consider Context"
[7]: https://www.gao.gov/products/gao-24-106214 "https://www.gao.gov/products/gao-24-106214"
[8]: https://ppi.worldbank.org/en/visualization?utm_source=chatgpt.com "PPI Visualization Dashboard - The World Bank & PPIAF"
[9]: https://openbudgets.eu/ "https://openbudgets.eu/"
[10]: https://www.nngroup.com/articles/progressive-disclosure/ "https://www.nngroup.com/articles/progressive-disclosure/"
[11]: https://www.nngroup.com/articles/dashboards-preattentive/?utm_source=chatgpt.com "Dashboards: Making Charts and Graphs Easier to ..."
[12]: https://www.nngroup.com/articles/data-tables/?utm_source=chatgpt.com "Data Tables: Four Major User Tasks"
[13]: https://www.cbo.gov/publication/57660 "https://www.cbo.gov/publication/57660"
[14]: https://www.congress.gov/crs-product/R47333 "https://www.congress.gov/crs-product/R47333"
[15]: https://www.worldbank.org/en/programs/boost-portal "https://www.worldbank.org/en/programs/boost-portal"
[16]: https://accessibility.blog.gov.uk/2023/04/13/text-descriptions-for-data-visualisations/ "https://accessibility.blog.gov.uk/2023/04/13/text-descriptions-for-data-visualisations/"
[17]: https://www.tpgi.com/making-data-visualizations-accessible/ "https://www.tpgi.com/making-data-visualizations-accessible/"
[18]: https://analysisfunction.civilservice.gov.uk/policy-store/charts-a-checklist/ "https://analysisfunction.civilservice.gov.uk/policy-store/charts-a-checklist/"
[19]: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Table_accessibility "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Table_accessibility"

<!-- @web-flow end id=response-20260130151956225-chatgpt -->
