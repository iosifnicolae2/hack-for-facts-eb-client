Entity Analytics Page - UX/UI Brief

Goals
- Provide a fast way to compare entities by aggregated values (total and per capita)
- Offer the same filter mental model as the Map page to reduce learning cost
- Two views: Table (default) and Charts

Key UX Decisions
- Filters on top in a compact card: account category, normalization, year, functional/economic filters, amount range
- Results area switches between table and charts, preserving filters and URL state
- Table columns: entity, county, population, total amount, per-capita
- Charts:
  - Top 15 entities by total amount (bar)
  - Per-capita vs population (scatter)
  - Ready to extend with county distribution or normalization toggles

Performance
- React Query with stable query keys; server pagination params
- Keep charts using the same dataset as table to avoid extra network requests

Navigation
- Add sidebar link "Entity Analytics"


