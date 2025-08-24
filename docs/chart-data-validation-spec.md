# Chart Data Validation and Auto-Adjustment Strategy

## Goals
- Keep charts rendering whenever possible by auto-fixing minor data issues.
- Transparently communicate all auto-fixes (warnings) and any hard failures (errors) to the user.
- Centralize validation and sanitization with strong typing; avoid `any`.

## Validation Types
- invalid_x_value (warning): Non-numeric x in time series, auto-removed
- invalid_y_value (warning): Non-numeric y in time series, auto-removed
- missing_data (warning): No data in range or entirely empty series
- empty_series (warning): Series has no points
- invalid_aggregated_value (warning/error): Non-finite aggregated value; set to 0 when quick-fix is enabled
- auto_adjusted_value (warning): A value was auto-adjusted during conversion/calculation (e.g., base=0 in relative values, divide-by-zero in calculations)

## Core APIs
- validateAnalyticsSeries(seriesMap): ValidationResult
  - Downgrades non-numeric points to warnings; sanitation will remove them
- sanitizeAnalyticsSeries(seriesMap, validation): Map
  - Removes invalid points
- validateAggregatedData([{ id, value }], options): ValidationResult
  - Strongly typed numeric value
  - When treatMissingAsZero !== false, non-finite values yield warnings and are autocorrected to 0
- sanitizeAggregatedData(data): data
  - Sets non-finite values to 0
- validateSeriesCompleteness(seriesMap, { start, end }): ValidationResult
  - Warns on missing years per series in selected range
- combineValidationResults(...results): ValidationResult
  - Merges multiple validations into one

## Calculation Pipeline
- calculateAllSeriesData(series, dataSeriesMap): { dataSeriesMap, warnings }
  - evaluateCalculation and performOperation now return points + warnings
  - Division by zero or undefined values are auto-removed per year and emit auto_adjusted_value warnings

## Aggregated Conversion
- convertToAggregatedData(map, chart): { data, unitMap, warnings }
  - Relative mode guards base=0/invalid
  - Emits auto_adjusted_value warnings when auto-setting values to 0

## View Integration
- ChartView
  - Computes data via convertToTimeSeriesData or convertToAggregatedData
  - Sanitizes aggregated data with sanitizeAggregatedData for rendering
  - Combines validations:
    - validateAnalyticsSeries
    - validateAggregatedData (treatMissingAsZero: true)
    - validateSeriesCompleteness
    - aggregated conversion warnings
    - calculation warnings (merged in useChartData)
  - Renders ChartDataError under the chart header and above filter panel

## UI: ChartDataError
- Shows a badge with total issue count (warnings + errors)
- Lists errors first, then warnings
- Warnings communicate auto-fixes applied (e.g., set to 0, removed point)

## Typing & No any
- validateAggregatedData and sanitizeAggregatedData require numeric value types
- ChartView strictly types aggregated map transforms
- No use of `any` in new/updated code paths

## Behavior Summary
- Warnings: chart still renders; values sanitized or points removed; user informed
- Errors: unrecoverable invalid data; surfaced to user; chart still avoids crashing

## Future Enhancements
- Extend ChartDataError to group warnings by type and include structured context summaries
- Add optional tooltips in charts to flag series/years adjusted in-place
