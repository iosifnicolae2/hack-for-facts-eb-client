import { AnalyticsSeries } from '@/schemas/charts';
import { createLogger } from './logger';

const logger = createLogger('chart-data-validation');

export interface DataValidationError {
  type: 'invalid_x_value' | 'invalid_y_value' | 'missing_data' | 'empty_series' | 'invalid_aggregated_value' | 'auto_adjusted_value';
  seriesId: string;
  message: string;
  pointIndex?: number;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: DataValidationError[];
  warnings: DataValidationError[];
}

/**
 * Validates AnalyticsSeries data for chart rendering
 */
export function validateAnalyticsSeries(seriesMap: Map<string, AnalyticsSeries>): ValidationResult {
  const errors: DataValidationError[] = [];
  const warnings: DataValidationError[] = [];

  for (const [seriesId, series] of seriesMap.entries()) {
    // Check if series has data
    if (!series.data || series.data.length === 0) {
      warnings.push({
        type: 'empty_series',
        seriesId,
        message: `Series '${seriesId}' has no data points`,
      });
      continue;
    }

    // Validate each data point
    series.data.forEach((point, index) => {
      // Validate x value (should be convertible to number for time series)
      const xValue = Number(point.x);
      if (isNaN(xValue)) {
        warnings.push({
          type: 'invalid_x_value',
          seriesId,
          message: `Invalid x-axis value '${point.x}' at index ${index} (auto-removed)`,
          pointIndex: index,
          value: point.x,
        });
      }

      // Validate y value (should be a valid number)
      if (typeof point.y !== 'number' || isNaN(point.y)) {
        warnings.push({
          type: 'invalid_y_value',
          seriesId,
          message: `Invalid y-axis value '${point.y}' at index ${index} (auto-removed)`,
          pointIndex: index,
          value: point.y,
        });
      }
    });
  }

  const isValid = errors.length === 0;

  // Log validation results
  if (errors.length > 0) {
    logger.error('Chart data validation failed', { errors, warnings });
  } else if (warnings.length > 0) {
    logger.warn('Chart data validation completed with warnings', { warnings });
  }

  return { isValid, errors, warnings };
}

/**
 * Sanitizes AnalyticsSeries data by filtering out invalid points
 * Only use this after validation and user acknowledgment
 */
export function sanitizeAnalyticsSeries(
  seriesMap: Map<string, AnalyticsSeries>,
  validationResult: ValidationResult
): Map<string, AnalyticsSeries> {
  if (validationResult.isValid) {
    return seriesMap;
  }

  const sanitizedMap = new Map<string, AnalyticsSeries>();

  for (const [seriesId, series] of seriesMap.entries()) {
    const validPoints = series.data.filter((point, index) => {
      const xValid = !isNaN(Number(point.x));
      const yValid = typeof point.y === 'number' && !isNaN(point.y);
      
      if (!xValid || !yValid) {
        logger.warn(`Filtering out invalid data point at index ${index} in series ${seriesId}`, {
          point,
          xValid,
          yValid,
        });
        return false;
      }
      
      return true;
    });

    sanitizedMap.set(seriesId, {
      ...series,
      data: validPoints,
    });
  }

  return sanitizedMap;
}

/**
 * Creates a user-friendly error message from validation results
 */
export function formatValidationErrors(validationResult: ValidationResult): string {
  if (validationResult.isValid) {
    return '';
  }

  const errorGroups = validationResult.errors.reduce((groups, error) => {
    if (!groups[error.seriesId]) {
      groups[error.seriesId] = [];
    }
    groups[error.seriesId].push(error);
    return groups;
  }, {} as Record<string, DataValidationError[]>);

  const messages = Object.entries(errorGroups).map(([seriesId, errors]) => {
    const seriesName = seriesId;
    const errorTypes = [...new Set(errors.map(e => e.type))];
    
    return `Series "${seriesName}": ${errorTypes.join(', ')} (${errors.length} issue${errors.length > 1 ? 's' : ''})`;
  });

  return `Chart data validation failed:\n${messages.join('\n')}`;
}

/**
 * Validates aggregated series data used by aggregated charts (e.g., bar-aggr)
 * Ensures values are finite numbers and that data exists
 */
export function validateAggregatedData(
  aggregatedData: Array<{ id: string; value: number }>,
  options?: { treatMissingAsZero?: boolean }
): ValidationResult {
  const errors: DataValidationError[] = [];
  const warnings: DataValidationError[] = [];

  if (!aggregatedData || aggregatedData.length === 0) {
    warnings.push({
      type: 'missing_data',
      seriesId: 'aggregated',
      message: 'No aggregated data points to display',
    });
    return { isValid: errors.length === 0, errors, warnings };
  }

  aggregatedData.forEach((point, index) => {
    const numeric = point.value;
    if (!Number.isFinite(numeric)) {
      // If we can quick fix by setting to zero, classify as a warning
      if (options?.treatMissingAsZero !== false) {
        warnings.push({
          type: 'invalid_aggregated_value',
          seriesId: point.id,
          message: `Invalid aggregated value at index ${index} (auto-set to 0)`,
          pointIndex: index,
          value: point.value,
        });
      } else {
        errors.push({
          type: 'invalid_aggregated_value',
          seriesId: point.id,
          message: `Invalid aggregated value at index ${index}`,
          pointIndex: index,
          value: point.value,
        });
      }
    }
  });

  const isValid = errors.length === 0;
  if (!isValid) {
    logger.error('Aggregated data validation failed', { errors, warnings });
  }

  return { isValid, errors, warnings };
}

/**
 * Combines multiple validation results into a single result
 */
export function combineValidationResults(
  ...results: Array<ValidationResult | null | undefined>
): ValidationResult {
  const combined: ValidationResult = { isValid: true, errors: [], warnings: [] };
  for (const res of results) {
    if (!res) continue;
    combined.errors = combined.errors.concat(res.errors);
    combined.warnings = combined.warnings.concat(res.warnings);
    if (!res.isValid) combined.isValid = false;
  }
  return combined;
}

/**
 * Warn when series are missing data for years in the selected chart range
 */
export function validateSeriesCompleteness(
  seriesMap: Map<string, AnalyticsSeries>,
  range: { start: number; end: number }
): ValidationResult {
  const warnings: DataValidationError[] = [];
  const errors: DataValidationError[] = [];
  const years: number[] = [];
  for (let y = range.start; y <= range.end; y++) years.push(y);

  for (const [seriesId, series] of seriesMap.entries()) {
    const presentYears = new Set(series.data.map((p) => Number(p.x)).filter((n) => Number.isFinite(n)));
    const missing = years.filter((y) => !presentYears.has(y));
    if (missing.length === years.length) {
      // Entire range missing
      warnings.push({
        type: 'missing_data',
        seriesId,
        message: `No data in selected range (${range.start}-${range.end})`,
      });
    } else if (missing.length > 0) {
      warnings.push({
        type: 'missing_data',
        seriesId,
        message: `Missing ${missing.length} year${missing.length > 1 ? 's' : ''} in selected range`,
      });
    }
  }

  return { isValid: true, errors, warnings };
}