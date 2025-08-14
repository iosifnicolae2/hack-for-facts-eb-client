---
title: GraphQL — Referință interogări
---

## Interogări rădăcină (selecție)

- entity(cui: ID!): Entity
- entities(filter: EntityFilter, limit: Int, offset: Int): EntityConnection!
- uat(id: ID!): UAT
- uats(filter: UATFilter, limit: Int, offset: Int): UATConnection!
- report(report_id: ID!): Report
- reports(filter: ReportFilter, limit: Int, offset: Int): ReportConnection!
- functionalClassification(code: ID!): FunctionalClassification
- functionalClassifications(filter: FunctionalClassificationFilterInput, limit: Int, offset: Int): FunctionalClassificationConnection!
- economicClassification(code: ID!): EconomicClassification
- economicClassifications(filter: EconomicClassificationFilterInput, limit: Int, offset: Int): EconomicClassificationConnection!
- fundingSource(id: ID!): FundingSource
- fundingSources(filter: FundingSourceFilterInput, limit: Int, offset: Int): FundingSourceConnection!
- budgetSector(id: ID!): BudgetSector
- budgetSectors(filter: BudgetSectorFilterInput, limit: Int, offset: Int): BudgetSectorConnection!
- executionLineItem(id: ID!): ExecutionLineItem
- executionLineItems(filter: AnalyticsFilterInput, sort: SortOrder, limit: Int, offset: Int): ExecutionLineItemConnection!
- heatmapUATData(filter: AnalyticsFilterInput!): [HeatmapUATDataPoint!]!
- heatmapJudetData(filter: AnalyticsFilterInput!): [HeatmapJudetDataPoint!]!
- executionAnalytics(inputs: [AnalyticsInput!]!): [AnalyticsResult!]!
- entityAnalytics(filter: AnalyticsFilterInput!, sort: SortOrder, limit: Int = 50, offset: Int = 0): EntityAnalyticsConnection!
- datasets(filter: DatasetFilter, limit: Int = 100, offset: Int = 0): DatasetConnection!
- staticChartAnalytics(datasetIds: [ID!]!): [StaticAnalyticsDataPoint!]!
- aggregatedLineItems(filter: AnalyticsFilterInput!, limit: Int = 50, offset: Int = 0): AggregatedLineItemConnection!

## Câmpuri imbricate (selecție)

Vezi tipurile `Entity`, `Report`, `ExecutionLineItem`, `FunctionalClassification`, `EconomicClassification`, `FundingSource`, `BudgetSector` pentru câmpurile imbricate uzuale (executare, rapoarte, trenduri etc.).

## Note

- Consultați pagina Filtre pentru detalii privind input‑urile; pagina Interogări pentru exemple.
- Toate listele returnează o `Connection` cu `nodes` și `pageInfo`.
- Sortarea este `{ by: String!, order: String! }`, cu `order` în `ASC` sau `DESC`.


