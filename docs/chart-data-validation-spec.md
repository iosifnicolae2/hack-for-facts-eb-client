# Chart Data Validation and Auto-Adjustment Strategy

## Goals
- Keep charts rendering whenever possible by auto-fixing minor data issues.
- Transparently communicate all auto-fixes (warnings) and any hard failures (errors) to the user.
- Centralize validation and sanitization with strong typing; avoid `any`.
- **Unified processing**: Combine data parsing and validation in single functions to avoid multiple passes and inconsistencies.

## Validation Types
- **invalid_x_value** (warning): Non-finite x value in time series, auto-removed
  - Enhanced messages specify expected format (e.g., "expected numeric year, got string 'abc'")
- **invalid_y_value** (warning): Non-finite y value in time series, auto-removed  
  - Enhanced messages indicate expected type vs actual (e.g., "expected finite number, got null")
- **missing_data** (warning): No data in range or entirely empty series
  - Improved messages list specific missing years and explain impact on chart trends
- **empty_series** (warning): Series has no points
  - Enhanced messages suggest checking data source or adjusting filters
- **invalid_aggregated_value** (warning/error): Non-finite aggregated value; set to 0 when quick-fix is enabled
  - Enhanced messages explain impact on chart totals and show actual vs expected types
- **auto_adjusted_value** (warning): A value was auto-adjusted during conversion/calculation (e.g., base=0 in relative values, divide-by-zero in calculations)
  - Enhanced messages explain why adjustment was needed and potential impact

## Core APIs
- **validateAnalyticsSeries**(seriesMap): ValidationResult
  - Uses `Number.isFinite()` consistently for validation
  - Enhanced error messages with context about expected vs actual types
- **sanitizeAnalyticsSeries**(seriesMap, validation): Map
  - Removes invalid points using same `Number.isFinite()` logic as validator
- **validateAggregatedData**([{ id, value }], options): ValidationResult
  - Strongly typed numeric value validation
  - When treatMissingAsZero !== false, non-finite values yield warnings and are auto-corrected to 0
  - Enhanced messages explain impact on chart totals
- **sanitizeAggregatedData**(data): data
  - Sets non-finite values to 0
- **validateSeriesCompleteness**(seriesMap, { start, end }): ValidationResult
  - Optimized to avoid redundant array creation and filtering
  - Enhanced messages list specific missing years and explain chart impact
- **combineValidationResults**(...results): ValidationResult
  - Merges multiple validations into one

## Calculation Pipeline
- calculateAllSeriesData(series, dataSeriesMap): { dataSeriesMap, warnings }
  - evaluateCalculation and performOperation now return points + warnings
  - Division by zero or undefined values are auto-removed per year and emit auto_adjusted_value warnings

## Unified Data Processing
- **convertToTimeSeriesData**(map, chart): ChartDataResult<TimeSeriesDataPoint[]>
  - **Unified approach**: Combines data processing and validation in single pass
  - Returns structured result with data, unitMap, and complete ValidationResult
  - Validates input data structure and processed output
  - Enhanced relative mode error handling with better context
- **convertToAggregatedData**(map, chart): ChartDataResult<DataPointPayload[]>
  - **Unified approach**: Combines data processing and validation in single pass
  - Returns structured result with data, unitMap, and complete ValidationResult
  - Validates enabled series availability and final aggregated values
  - Relative mode guards base=0/invalid with enhanced messaging

## View Integration
- **ChartView** (Simplified)
  - Uses unified processing functions that return ChartDataResult<T>
  - Single `processedData` memo instead of separate data and validation memos
  - Combines validations from:
    - Processing validation (from convertTo* functions)
    - Base data validation (from useChartData)
    - Series completeness validation
  - Renders ChartDataError with enhanced feedback and accessibility
- **useChartData** (Enhanced)
  - Removed console.warn from production code
  - Proper logging via debug logger
  - Consistent validation logic throughout pipeline

## UI: ChartDataError (Enhanced)
- **Visual feedback**: Copy button shows checkmark/error state with timeout
- **Accessibility**: ARIA labels, role="alert", semantic HTML structure
- **Performance**: Memoized expensive computations and grouped issue rendering
- **Reusable components**: Extracted IssuesSection to eliminate duplication
- **Color constants**: Centralized color schemes for consistency
- Shows total issue count with contextual badges (errors vs warnings)
- Lists errors first, then warnings with actionable messages
- Enhanced clipboard report generation with better formatting

## Typing & No any
- validateAggregatedData and sanitizeAggregatedData require numeric value types
- ChartView strictly types aggregated map transforms
- No use of `any` in new/updated code paths

## Behavior Summary
- Warnings: chart still renders; values sanitized or points removed; user informed
- Errors: unrecoverable invalid data; surfaced to user; chart still avoids crashing

## Implementation Status ✅
- ✅ **Unified processing functions** with integrated validation
- ✅ **Enhanced error messages** with contextual information
- ✅ **Consistent validation logic** using Number.isFinite() throughout
- ✅ **Optimized performance** with single-pass processing
- ✅ **Improved ChartDataError UI** with accessibility and visual feedback
- ✅ **Type safety improvements** and removal of console.warn
- ✅ **Simplified ChartView** with cleaner validation combining

## Future Enhancements
- Add optional tooltips in charts to flag series/years adjusted in-place
- Extend validation to detect and warn about suspicious data patterns
- Add data quality metrics and trends over time
