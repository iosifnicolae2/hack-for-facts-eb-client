// ── Entity Details (basic info + financials + trends) ──

export const ENTITY_DETAILS_QUERY = `
  query GetEntityDetails(
    $cui: ID!
    $reportPeriod: ReportPeriodInput!
    $trendPeriod: ReportPeriodInput!
    $reportType: ReportType
    $normalization: Normalization
    $currency: Currency
    $inflation_adjusted: Boolean
  ) {
    entity(cui: $cui) {
      cui
      name
      address
      default_report_type
      entity_type
      is_uat
      uat {
        name
        county_code
        county_name
        siruta_code
        population
        county_entity { cui name }
      }
      parents { cui name }
      totalIncome(period: $reportPeriod, reportType: $reportType, normalization: $normalization, currency: $currency, inflation_adjusted: $inflation_adjusted)
      totalExpenses(period: $reportPeriod, reportType: $reportType, normalization: $normalization, currency: $currency, inflation_adjusted: $inflation_adjusted)
      budgetBalance(period: $reportPeriod, reportType: $reportType, normalization: $normalization, currency: $currency, inflation_adjusted: $inflation_adjusted)
      incomeTrend(period: $trendPeriod, reportType: $reportType, normalization: $normalization, currency: $currency, inflation_adjusted: $inflation_adjusted) {
        seriesId
        xAxis { name type unit }
        yAxis { name type unit }
        data { x y }
      }
      expenseTrend: expensesTrend(period: $trendPeriod, reportType: $reportType, normalization: $normalization, currency: $currency, inflation_adjusted: $inflation_adjusted) {
        seriesId
        xAxis { name type unit }
        yAxis { name type unit }
        data { x y }
      }
      balanceTrend(period: $trendPeriod, reportType: $reportType, normalization: $normalization, currency: $currency, inflation_adjusted: $inflation_adjusted) {
        seriesId
        xAxis { name type unit }
        yAxis { name type unit }
        data { x y }
      }
    }
  }
`

// ── Entity Basic (no financials — fallback if financials fail) ──

export const ENTITY_BASIC_QUERY = `
  query GetEntityBasic($cui: ID!) {
    entity(cui: $cui) {
      cui
      name
      address
      default_report_type
      entity_type
      is_uat
      uat {
        name
        county_code
        county_name
        siruta_code
        population
        county_entity { cui name }
      }
      parents { cui name }
    }
  }
`

// ── Entity Relationships ──

export const ENTITY_RELATIONSHIPS_QUERY = `
  query GetEntityRelationships($cui: ID!) {
    entity(cui: $cui) {
      children { cui name }
      parents { cui name }
    }
  }
`

// ── Entity Line Items ──

export const ENTITY_LINE_ITEMS_QUERY = `
  query GetEntityLineItems(
    $cui: ID!
    $reportPeriod: ReportPeriodInput!
    $reportType: ReportType
    $normalization: Normalization
    $currency: Currency
    $inflation_adjusted: Boolean
  ) {
    entity(cui: $cui) {
      executionLineItemsCh: executionLineItems(
        filter: { account_category: ch, report_period: $reportPeriod, report_type: $reportType, normalization: $normalization, currency: $currency, inflation_adjusted: $inflation_adjusted }
        sort: { by: "amount", order: "DESC" }
        limit: 15000
      ) {
        nodes {
          line_item_id
          account_category
          funding_source_id
          expense_type
          anomaly
          functionalClassification { functional_name functional_code }
          economicClassification { economic_name economic_code }
          ytd_amount
          quarterly_amount
          monthly_amount
        }
      }
      executionLineItemsVn: executionLineItems(
        filter: { account_category: vn, report_period: $reportPeriod, report_type: $reportType, normalization: $normalization, currency: $currency, inflation_adjusted: $inflation_adjusted }
        sort: { by: "amount", order: "DESC" }
        limit: 15000
      ) {
        nodes {
          line_item_id
          account_category
          funding_source_id
          expense_type
          anomaly
          functionalClassification { functional_name functional_code }
          economicClassification { economic_name economic_code }
          ytd_amount
          quarterly_amount
          monthly_amount
        }
      }
    }
    fundingSources {
      nodes {
        source_id
        source_description
      }
    }
  }
`

// ── Entity Reports ──

export const ENTITY_REPORTS_QUERY = `
  query GetEntityReports(
    $cui: ID!
    $limit: Int
    $offset: Int
    $type: ReportType
    $sort: SortOrder
  ) {
    entity(cui: $cui) {
      reports(limit: $limit, offset: $offset, type: $type, sort: $sort) {
        nodes {
          report_id
          reporting_year
          report_type
          report_date
          download_links
          main_creditor { cui name }
          budgetSector { sector_id sector_description }
        }
        pageInfo {
          totalCount
          hasNextPage
          hasPreviousPage
        }
      }
    }
  }
`

// ── Standalone Reports ──

export const REPORTS_QUERY = `
  query GetReports($filter: ReportFilter, $limit: Int, $offset: Int) {
    reports(filter: $filter, limit: $limit, offset: $offset) {
      nodes {
        report_id
        reporting_year
        report_type
        report_date
        download_links
        main_creditor { cui name }
        budgetSector { sector_id sector_description }
      }
      pageInfo {
        totalCount
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

// ── Commitments Summary ──

export const COMMITMENTS_SUMMARY_QUERY = `
  query CommitmentsSummary($filter: CommitmentsFilterInput!, $limit: Int, $offset: Int) {
    commitmentsSummary(filter: $filter, limit: $limit, offset: $offset) {
      nodes {
        __typename
        ... on CommitmentsMonthlySummary {
          year
          month
          entity_cui
          entity_name
          report_type
          credite_angajament
          plati_trezor
          plati_non_trezor
          receptii_totale
          receptii_neplatite_change
          total_plati
        }
        ... on CommitmentsQuarterlySummary {
          year
          quarter
          entity_cui
          entity_name
          report_type
          credite_angajament
          limita_credit_angajament
          credite_bugetare
          credite_angajament_initiale
          credite_bugetare_initiale
          credite_angajament_definitive
          credite_bugetare_definitive
          credite_angajament_disponibile
          credite_bugetare_disponibile
          receptii_totale
          plati_trezor
          plati_non_trezor
          receptii_neplatite
          total_plati
          execution_rate
          commitment_rate
        }
        ... on CommitmentsAnnualSummary {
          year
          entity_cui
          entity_name
          report_type
          credite_angajament
          limita_credit_angajament
          credite_bugetare
          credite_angajament_initiale
          credite_bugetare_initiale
          credite_angajament_definitive
          credite_bugetare_definitive
          credite_angajament_disponibile
          credite_bugetare_disponibile
          receptii_totale
          plati_trezor
          plati_non_trezor
          receptii_neplatite
          total_plati
          execution_rate
          commitment_rate
        }
      }
      pageInfo {
        totalCount
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

// ── Commitments Aggregated ──

export const COMMITMENTS_AGGREGATED_QUERY = `
  query CommitmentsAggregated($input: CommitmentsAggregatedInput!) {
    commitmentsAggregated(input: $input) {
      nodes {
        functional_code
        functional_name
        economic_code
        economic_name
        amount
        count
      }
      pageInfo {
        totalCount
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

// ── Commitments Analytics ──

export const COMMITMENTS_ANALYTICS_QUERY = `
  query CommitmentsAnalytics($inputs: [CommitmentsAnalyticsInput!]!) {
    commitmentsAnalytics(inputs: $inputs) {
      seriesId
      metric
      xAxis { name type unit }
      yAxis { name type unit }
      data { x y growth_percent }
    }
  }
`

// ── Commitment vs Execution ──

export const COMMITMENT_VS_EXECUTION_QUERY = `
  query CommitmentVsExecution($input: CommitmentExecutionComparisonInput!) {
    commitmentVsExecution(input: $input) {
      frequency
      data {
        period
        commitment_value
        execution_value
        difference
        difference_percent
        commitment_growth_percent
        execution_growth_percent
        difference_growth_percent
      }
      total_commitment
      total_execution
      total_difference
      overall_difference_percent
      matched_count
      unmatched_commitment_count
      unmatched_execution_count
    }
  }
`

// ── Execution Analytics ──

export const EXECUTION_ANALYTICS_QUERY = `
  query GetExecutionLineItemsAnalytics($inputs: [AnalyticsInput!]!) {
    executionAnalytics(inputs: $inputs) {
      seriesId
      xAxis { name type unit }
      yAxis { name type unit }
      data { x y }
    }
  }
`

// ── Heatmap UAT Data ──

export const HEATMAP_UAT_DATA_QUERY = `
  query GetHeatmapUATData($filter: AnalyticsFilterInput!) {
    heatmapUATData(filter: $filter) {
      uat_id
      uat_name
      uat_code
      siruta_code
      county_code
      county_name
      population
      amount
      total_amount
      per_capita_amount
    }
  }
`

// ── Entity Search ──

export const ENTITY_SEARCH_QUERY = `
  query EntitySearch($filter: EntityFilter, $limit: Int, $offset: Int) {
    entities(filter: $filter, limit: $limit, offset: $offset) {
      nodes {
        cui
        name
        entity_type
        is_uat
        address
        uat {
          name
          county_code
          county_name
          siruta_code
          population
        }
      }
      pageInfo {
        totalCount
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

// ── INS Contexts ──

export const INS_CONTEXTS_QUERY = `
  query InsContexts($filter: InsContextFilterInput, $limit: Int, $offset: Int) {
    insContexts(filter: $filter, limit: $limit, offset: $offset) {
      nodes {
        id
        code
        name_ro
        name_en
        level
        parent_id
        parent_code
        path
        matrix_count
      }
      pageInfo { totalCount hasNextPage hasPreviousPage }
    }
  }
`

// ── INS Datasets ──

export const INS_DATASETS_QUERY = `
  query InsDatasets($filter: InsDatasetFilterInput, $limit: Int, $offset: Int) {
    insDatasets(filter: $filter, limit: $limit, offset: $offset) {
      nodes {
        id
        code
        name_ro
        name_en
        definition_ro
        definition_en
        periodicity
        year_range
        dimension_count
        has_uat_data
        has_county_data
        has_siruta
        sync_status
        last_sync_at
        context_code
        context_name_ro
        context_name_en
        context_path
      }
      pageInfo { totalCount hasNextPage hasPreviousPage }
    }
  }
`

// ── INS Observations ──

export const INS_OBSERVATIONS_QUERY = `
  query InsDatasetHistory($datasetCode: String!, $filter: InsObservationFilterInput, $limit: Int, $offset: Int) {
    insObservations(datasetCode: $datasetCode, filter: $filter, limit: $limit, offset: $offset) {
      nodes {
        dataset_code
        value
        value_status
        time_period { iso_period year quarter month periodicity }
        territory { code siruta_code level name_ro }
        unit { code symbol name_ro }
        classifications { id type_code type_name_ro type_name_en code name_ro name_en sort_order }
      }
      pageInfo { totalCount hasNextPage hasPreviousPage }
    }
  }
`

// ── INS Dataset Dimensions ──

export const INS_DATASET_DIMENSIONS_QUERY = `
  query InsDatasetDimensions($datasetCode: String!) {
    insDatasets(filter: { codes: [$datasetCode] }, limit: 1, offset: 0) {
      nodes {
        code
        dimensions {
          index
          type
          label_ro
          label_en
          classification_type { code name_ro name_en }
        }
      }
    }
  }
`
