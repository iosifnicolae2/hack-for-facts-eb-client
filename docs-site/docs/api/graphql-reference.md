---
id: graphql-reference
title: GraphQL – Query Reference
---

Root queries

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

Entity nested fields

- uat: UAT
- children: [Entity!]!
- parents: [Entity!]!
- reports(limit: Int, offset: Int, year: Int, period: String, sort: SortOrder): ReportConnection!
- executionLineItems(filter: AnalyticsFilterInput, limit: Int, offset: Int, sort: SortOrder): ExecutionLineItemConnection!
- totalIncome(year: Int!): Float
- totalExpenses(year: Int!): Float
- budgetBalance(year: Int!): Float
- incomeTrend(startYear: Int!, endYear: Int!): [YearlyAmount!]!
- expenseTrend(startYear: Int!, endYear: Int!): [YearlyAmount!]!
- balanceTrend(startYear: Int!, endYear: Int!): [YearlyAmount!]!

Report nested fields

- entity: Entity!
- main_creditor: Entity!
- executionLineItems(limit: Int, offset: Int, functionalCode: String, economicCode: String, accountCategory: AccountCategory, minAmount: Float, maxAmount: Float): ExecutionLineItemConnection!

ExecutionLineItem nested fields

- report: Report!
- entity: Entity!
- fundingSource: FundingSource!
- budgetSector: BudgetSector!
- functionalClassification: FunctionalClassification!
- economicClassification: EconomicClassification

Classification nested fields

- FunctionalClassification.executionLineItems(limit: Int, offset: Int, reportId: String, accountCategory: AccountCategory): ExecutionLineItemConnection!
- EconomicClassification.executionLineItems(limit: Int, offset: Int, reportId: String, accountCategory: AccountCategory): ExecutionLineItemConnection!

FundingSource/BudgetSector nested fields

- fundingSource.executionLineItems(limit: Int, offset: Int, reportId: String, accountCategory: AccountCategory): ExecutionLineItemConnection!
- budgetSector.executionLineItems(limit: Int, offset: Int, reportId: String, accountCategory: String): ExecutionLineItemConnection!

Notes

- See Filters page for input details; see Queries page for examples.
- All list fields return a `Connection` with `nodes` and `pageInfo`.
 - Sorting is `{ by: String!, order: String! }` and `order` is `ASC` or `DESC`.


