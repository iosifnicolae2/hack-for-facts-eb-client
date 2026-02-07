import type { DataValidationError } from '@/lib/chart-data-validation';
import { getAllInsObservations } from '@/lib/api/ins';
import type { InsObservation, InsObservationFilterInput, InsPeriodicity } from '@/schemas/ins';
import type { AnalyticsSeries, InsSeriesConfiguration } from '@/schemas/charts';
import { getUserLocale } from '@/lib/utils';

export interface InsSeriesMapperInput {
  series: InsSeriesConfiguration;
}

export interface InsSeriesMappingResult {
  series: AnalyticsSeries | null;
  warnings: DataValidationError[];
}

export interface InsSeriesRuntimeMapper {
  mapSeries(input: InsSeriesMapperInput): Promise<InsSeriesMappingResult>;
}

type ObservationWithValue = {
  observation: InsObservation;
  value: number;
  periodKey: number;
  periodLabel: string;
  unitLabel: string;
};

const PERIODICITY_PRIORITY: InsPeriodicity[] = ['ANNUAL', 'QUARTERLY', 'MONTHLY'];

function getPeriodKey(observation: InsObservation): number {
  const period = observation.time_period;
  return period.year * 10000 + (period.quarter ?? 0) * 100 + (period.month ?? 0);
}

function parseObservationValue(value: string | null | undefined): number | null {
  if (value == null) return null;
  const parsed = Number(String(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

function getObservationUnitLabel(observation: InsObservation): string {
  const locale = getUserLocale() === 'en' ? 'en' : 'ro';
  const localizedUnitName = locale === 'en'
    ? observation.unit?.name_en || observation.unit?.name_ro || ''
    : observation.unit?.name_ro || observation.unit?.name_en || '';
  return observation.unit?.symbol || observation.unit?.code || localizedUnitName;
}

function buildObservationFilter(series: InsSeriesConfiguration): InsObservationFilterInput {
  const filter: InsObservationFilterInput = {
    hasValue: series.hasValue ?? true,
  };

  if (series.territoryCodes?.length) {
    filter.territoryCodes = series.territoryCodes;
  }
  if (series.sirutaCodes?.length) {
    filter.sirutaCodes = series.sirutaCodes;
  }
  if (series.unitCodes?.length) {
    filter.unitCodes = series.unitCodes;
  }
  if (series.periodicity) {
    filter.periodicity = series.periodicity;
  }
  if (series.periodRange?.start && series.periodRange?.end) {
    filter.periodRange = {
      start: series.periodRange.start,
      end: series.periodRange.end,
    };
  }

  if (series.classificationSelections && Object.keys(series.classificationSelections).length > 0) {
    filter.classificationTypeCodes = Object.keys(series.classificationSelections);
    const allValues = Object.values(series.classificationSelections)
      .flatMap((codes) => codes)
      .filter((code) => code?.trim().length > 0);

    if (allValues.length > 0) {
      filter.classificationValueCodes = Array.from(new Set(allValues));
    }
  }

  return filter;
}

function selectDefaultPeriodicity(observations: InsObservation[]): InsPeriodicity | null {
  const seen = new Set<InsPeriodicity>();
  observations.forEach((observation) => {
    seen.add(observation.time_period.periodicity);
  });

  if (seen.size === 0) return null;

  for (const periodicity of PERIODICITY_PRIORITY) {
    if (seen.has(periodicity)) return periodicity;
  }

  return observations[0]?.time_period.periodicity ?? null;
}

function normalizePeriodicityForChart(periodicity: InsPeriodicity): 'year' | 'quarter' | 'month' {
  if (periodicity === 'MONTHLY') return 'month';
  if (periodicity === 'QUARTERLY') return 'quarter';
  return 'year';
}

function observationMatchesClassificationSelection(
  observation: InsObservation,
  selection: Record<string, string[]>
): boolean {
  if (!selection || Object.keys(selection).length === 0) {
    return true;
  }

  const classifications = observation.classifications ?? [];
  for (const [typeCode, selectedCodes] of Object.entries(selection)) {
    if (selectedCodes.length === 0) continue;

    const hasMatch = classifications.some((classification) => {
      if (!classification?.type_code || !classification?.code) return false;
      return classification.type_code === typeCode && selectedCodes.includes(classification.code);
    });

    if (!hasMatch) {
      return false;
    }
  }

  return true;
}

function reduceValues(values: number[], aggregation: InsSeriesConfiguration['aggregation']): number | null {
  if (values.length === 0) return null;

  if (aggregation === 'first') {
    return values[0] ?? null;
  }
  if (aggregation === 'average') {
    return values.reduce((acc, value) => acc + value, 0) / values.length;
  }

  return values.reduce((acc, value) => acc + value, 0);
}

export async function mapInsSeriesToAnalyticsSeries(series: InsSeriesConfiguration): Promise<InsSeriesMappingResult> {
  const warnings: DataValidationError[] = [];

  if (!series.datasetCode) {
    warnings.push({
      type: 'missing_data',
      seriesId: series.id,
      message: 'INS series datasetCode is missing. No data fetched.',
    });
    return { series: null, warnings };
  }

  const filter = buildObservationFilter(series);
  const observations = await getAllInsObservations({
    datasetCode: series.datasetCode,
    filter,
    pageSize: 1000,
    maxPages: 30,
  });

  const classSelection = series.classificationSelections ?? {};
  const classFiltered = observations.filter((observation) =>
    observationMatchesClassificationSelection(observation, classSelection)
  );

  if (classFiltered.length === 0) {
    warnings.push({
      type: 'empty_series',
      seriesId: series.id,
      message: `No INS observations found for dataset ${series.datasetCode} with current filters.`,
    });

    return {
      series: {
        seriesId: series.id,
        xAxis: { name: 'Period', type: 'STRING', unit: 'year' },
        yAxis: { name: 'Value', type: 'FLOAT', unit: series.unit || '' },
        data: [],
      },
      warnings,
    };
  }

  const observedPeriodicities = Array.from(
    new Set(classFiltered.map((observation) => observation.time_period.periodicity))
  );

  let effectivePeriodicity = series.periodicity ?? selectDefaultPeriodicity(classFiltered);
  if (!effectivePeriodicity) {
    warnings.push({
      type: 'missing_data',
      seriesId: series.id,
      message: `Cannot determine periodicity for INS dataset ${series.datasetCode}.`,
    });
    return { series: null, warnings };
  }

  if (!series.periodicity && observedPeriodicities.length > 1) {
    warnings.push({
      type: 'auto_adjusted_value',
      seriesId: series.id,
      message: `Multiple periodicities found (${observedPeriodicities.join(', ')}). Auto-selected ${effectivePeriodicity}.`,
      value: observedPeriodicities,
    });
  }

  const periodicityFiltered = classFiltered.filter(
    (observation) => observation.time_period.periodicity === effectivePeriodicity
  );

  const normalizedObservations: ObservationWithValue[] = [];

  for (const observation of periodicityFiltered) {
    const parsed = parseObservationValue(observation.value);
    if (parsed == null) {
      if (series.hasValue !== false) {
        warnings.push({
          type: 'invalid_y_value',
          seriesId: series.id,
          message: `Skipping non-numeric INS observation value at ${observation.time_period.iso_period}.`,
          value: observation.value,
        });
      }
      continue;
    }

    normalizedObservations.push({
      observation,
      value: parsed,
      periodKey: getPeriodKey(observation),
      periodLabel: observation.time_period.iso_period,
      unitLabel: getObservationUnitLabel(observation),
    });
  }

  if (normalizedObservations.length === 0) {
    warnings.push({
      type: 'empty_series',
      seriesId: series.id,
      message: `No numeric INS values available for dataset ${series.datasetCode}.`,
    });

    return {
      series: {
        seriesId: series.id,
        xAxis: { name: 'Period', type: 'STRING', unit: normalizePeriodicityForChart(effectivePeriodicity) },
        yAxis: { name: 'Value', type: 'FLOAT', unit: series.unit || '' },
        data: [],
      },
      warnings,
    };
  }

  const unitSet = new Set(normalizedObservations.map((entry) => entry.unitLabel || '').filter((entry) => entry.length > 0));

  if (unitSet.size > 1) {
    warnings.push({
      type: 'invalid_y_value',
      seriesId: series.id,
      message: `INS series has mixed units (${Array.from(unitSet).join(', ')}). Please filter to a single unit.`,
      value: Array.from(unitSet),
    });

    return {
      series: {
        seriesId: series.id,
        xAxis: { name: 'Period', type: 'STRING', unit: normalizePeriodicityForChart(effectivePeriodicity) },
        yAxis: { name: 'Value', type: 'FLOAT', unit: series.unit || '' },
        data: [],
      },
      warnings,
    };
  }

  const grouped = new Map<string, { periodKey: number; values: number[] }>();

  normalizedObservations
    .sort((left, right) => left.periodKey - right.periodKey)
    .forEach((entry) => {
      const existing = grouped.get(entry.periodLabel);
      if (existing) {
        existing.values.push(entry.value);
      } else {
        grouped.set(entry.periodLabel, {
          periodKey: entry.periodKey,
          values: [entry.value],
        });
      }
    });

  const data = Array.from(grouped.entries())
    .map(([periodLabel, payload]) => {
      const value = reduceValues(payload.values, series.aggregation ?? 'sum');
      if (value == null || !Number.isFinite(value)) return null;
      return {
        x: periodLabel,
        y: value,
        periodKey: payload.periodKey,
      };
    })
    .filter((point): point is { x: string; y: number; periodKey: number } => point !== null)
    .sort((left, right) => left.periodKey - right.periodKey)
    .map(({ x, y }) => ({ x, y }));

  const inferredUnit = Array.from(unitSet)[0] ?? '';

  return {
    series: {
      seriesId: series.id,
      xAxis: {
        name: 'Period',
        type: 'STRING',
        unit: normalizePeriodicityForChart(effectivePeriodicity),
      },
      yAxis: {
        name: 'Value',
        type: 'FLOAT',
        unit: series.unit || inferredUnit,
      },
      data,
    },
    warnings,
  };
}

export const insSeriesRuntimeMapper: InsSeriesRuntimeMapper = {
  mapSeries: async ({ series }) => mapInsSeriesToAnalyticsSeries(series),
};

export function buildInsSeriesObservationFilter(series: InsSeriesConfiguration): InsObservationFilterInput {
  return buildObservationFilter(series);
}
