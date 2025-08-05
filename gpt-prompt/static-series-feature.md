### Feature Specifications: Static Chart Series

#### 1. High-Level Overview

The "Static Series" feature allows users to add data to a chart from a predefined, server-side dataset (e.g., GDP, inflation rate). This is distinct from the existing "Line Items Aggregated Yearly" series, which builds data dynamically based on user-defined filters.

The user experience is as follows:
1.  The user adds a new series to the chart.
2.  They select the type "Static Series".
3.  A search interface appears, allowing them to find and select a dataset from a paginated, searchable list.
4.  Upon selection, the chart fetches the data for that dataset and displays it as a new series. The series label is automatically populated with the dataset's name.

#### 2. Frontend Implementation Details

The implementation is spread across the schema, API layer, data hooks, and UI components.

##### **`src/schemas/charts.ts` - Data Structure Definition**

A new series type has been defined to represent a static series.

*   **`StaticSeriesConfigurationSchema`**: A Zod schema that defines the configuration for a static series.
    *   It extends the `BaseSeriesConfigurationSchema`, inheriting fields like `id`, `label`, `unit`, and `config`.
    *   `type`: A literal string set to `'static-series'`.
    *   `datasetId`: A string that uniquely identifies the dataset to be fetched from the server.

*   **`SeriesSchema`**: The main discriminated union for all series types has been updated to include `StaticSeriesConfigurationSchema`.

```typescript
// src/schemas/charts.ts

export const StaticSeriesConfigurationSchema = BaseSeriesConfigurationSchema.extend({
  type: z.literal('static-series'),
  datasetId: z.string().describe('The id of the dataset to use for the static series. The data is fetched from the server.'),
}).passthrough();

export const SeriesSchema = z.discriminatedUnion('type', [
  SeriesConfigurationSchema,
  SeriesGroupConfigurationSchema,
  CustomSeriesConfigurationSchema,
  CustomSeriesValueConfigurationSchema,
  StaticSeriesConfigurationSchema, // <-- New addition
]);

export type StaticSeriesConfiguration = z.infer<typeof StaticSeriesConfigurationSchema>;
```

##### **`src/lib/api/charts.ts` - API Request Logic**

A new function has been added to handle fetching data for static series.

*   **`getStaticChartAnalytics(datasetIds: string[])`**: An async function that takes an array of unique `datasetId`s.
*   It makes a GraphQL query to the `staticChartAnalytics` endpoint.
*   **`StaticAnalyticsDataPoint`**: A new interface defining the shape of the response data for each dataset, including `datasetId`, `unit`, and `yearlyTrend`.

```typescript
// src/lib/api/charts.ts

export interface StaticAnalyticsDataPoint {
  datasetId: string;
  unit: string;
  yearlyTrend: YearlyTrendPoint[];
}

export async function getStaticChartAnalytics(datasetIds: string[]): Promise<StaticAnalyticsDataPoint[]> {
  const query = `
    query GetStaticChartAnalytics($datasetIds: [String!]!) {
      staticChartAnalytics(datasetIds: $datasetIds) {
        datasetId
        unit
        yearlyTrend {
          year
          totalAmount
        }
      }
    }
  `;
  // ... graphqlRequest logic
}
```

##### **`src/components/charts/hooks/useChartData.ts` - Data Fetching and Merging**

The main data hook has been updated to handle the new series type.

*   It now identifies all series of type `'static-series'`.
*   It creates a unique list of `datasetId`s from these series to avoid redundant API calls.
*   A **new `useQuery` hook** is used to call `getStaticChartAnalytics` with the unique `datasetId`s.
*   **Data Merging**: The fetched static data is merged into the main `dataSeriesMap`. The logic maps the data from a single `datasetId` back to each `series.id` that uses it. This is crucial for allowing multiple series on the same chart to share the same underlying dataset.
*   The hook's final output (`isLoadingData`, `dataError`) combines the states of both the dynamic and static data queries.

##### **`src/components/charts/components/views/SeriesConfigView.tsx` - Main Configuration UI**

This view has been updated to integrate the new series type.

1.  A new `<SelectItem>` with the value `'static-series'` and label "Static Series" has been added to the series type dropdown.
2.  A conditional rendering block was added to show the `StaticSeriesEditor` component when `series.type === 'static-series'`.

##### **`src/components/charts/components/series-config/StaticSeriesEditor.tsx` - Static Series Configurator**

This is the primary UI for configuring a static series.

*   It contains the logic for handling the selection of a dataset.
*   It uses the `DatasetList` component to render the search and selection interface.
*   When a dataset is selected, it calls the `updateSeries` function from `useChartStore` to update the current series' `datasetId` and `label`.

##### **`src/components/charts/components/series-config/DatasetList.tsx` - Dataset Search/Selection UI**

This new component provides a reusable, advanced search list for datasets.

*   It is modeled after the existing `EntityList.tsx`.
*   It uses the `useMultiSelectInfinite` hook to manage paginated, infinite-scrolling data from the backend.
*   It includes a `SearchInput` that triggers a filtered GraphQL query.
*   It is designed to work with a `datasets` GraphQL query that supports searching and pagination.

#### 3. Backend API Contract (GraphQL)

The frontend implementation relies on the following GraphQL schema being available on the server:

```graphql
type Dataset {
  id: ID!
  name: String!
  description: String
  sourceName: String
  sourceUrl: String
}

type DatasetConnection {
  nodes: [Dataset!]!
  pageInfo: PageInfo!
}

input DatasetFilter {
  search: String
}

type StaticAnalyticsDataPoint {
  datasetId: ID!
  unit: String
  yearlyTrend: [YearlyTrendPoint!]!
}

extend type Query {
  datasets(filter: DatasetFilter, limit: Int, offset: Int): DatasetConnection!
  staticChartAnalytics(datasetIds: [ID!]!): [StaticAnalyticsDataPoint!]!
}
```
