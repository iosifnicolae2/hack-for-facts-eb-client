import { t } from '@lingui/core/macro';

import type { ReportPeriodInput } from '@/schemas/reporting';
import type { InsObservationFilterInput, InsPeriodicity, InsTerritoryLevel } from '@/schemas/ins';
import type { TemporalSplit } from './ins-stats-view.types';

const TEMPORAL_SPLIT_PERIODICITY_MAP: Record<TemporalSplit, InsPeriodicity[] | undefined> = {
  all: undefined,
  year: ['ANNUAL'],
  quarter: ['QUARTERLY'],
  month: ['MONTHLY'],
};

export const TEMPORAL_SPLIT_OPTIONS: Array<{
  value: Exclude<TemporalSplit, 'all'>;
  label: string;
}> = [
  { value: 'year', label: t`Year` },
  { value: 'quarter', label: t`Quarter` },
  { value: 'month', label: t`Month` },
];

export function buildHistoryFilter(params: {
  isCounty: boolean;
  countyCode: string;
  sirutaCode: string;
}): {
  territoryCodes?: string[];
  territoryLevels?: InsTerritoryLevel[];
  sirutaCodes?: string[];
} {
  if (params.isCounty) {
    return {
      territoryCodes: [params.countyCode],
      territoryLevels: ['NUTS3'],
    };
  }

  return {
    sirutaCodes: [params.sirutaCode],
    territoryLevels: ['LAU'],
  };
}

export function getReportPeriodAnchor(reportPeriod: ReportPeriodInput): string | null {
  const intervalAnchor = reportPeriod.selection.interval?.start;
  if (intervalAnchor) return intervalAnchor;

  const firstDate = reportPeriod.selection.dates?.[0];
  if (firstDate) return firstDate;

  return null;
}

export function buildIndicatorPeriodFilter(params: {
  reportPeriod: ReportPeriodInput;
  isCounty: boolean;
  countyCode: string;
  sirutaCode: string;
}): InsObservationFilterInput {
  const filter: InsObservationFilterInput = buildHistoryFilter({
    isCounty: params.isCounty,
    countyCode: params.countyCode,
    sirutaCode: params.sirutaCode,
  });
  const anchor = getReportPeriodAnchor(params.reportPeriod);
  if (!anchor) {
    return filter;
  }

  if (params.reportPeriod.type === 'YEAR') {
    const year = Number(anchor);
    if (Number.isFinite(year)) {
      filter.periodicity = 'ANNUAL';
      filter.years = [year];
      filter.period = anchor;
    }
    return filter;
  }

  if (params.reportPeriod.type === 'QUARTER') {
    const match = anchor.match(/^(\d{4})-Q([1-4])$/);
    if (match) {
      filter.periodicity = 'QUARTERLY';
      filter.years = [Number(match[1])];
      filter.quarters = [Number(match[2])];
      filter.period = anchor;
    }
    return filter;
  }

  const match = anchor.match(/^(\d{4})-(0[1-9]|1[0-2])$/);
  if (match) {
    filter.periodicity = 'MONTHLY';
    filter.years = [Number(match[1])];
    filter.months = [Number(match[2])];
    filter.period = anchor;
  }

  return filter;
}

export function buildIndicatorFallbackFilter(params: {
  reportPeriod: ReportPeriodInput;
  isCounty: boolean;
  countyCode: string;
  sirutaCode: string;
}): InsObservationFilterInput {
  const filter: InsObservationFilterInput = buildHistoryFilter({
    isCounty: params.isCounty,
    countyCode: params.countyCode,
    sirutaCode: params.sirutaCode,
  });

  if (params.reportPeriod.type === 'YEAR') {
    filter.periodicity = 'ANNUAL';
  } else if (params.reportPeriod.type === 'QUARTER') {
    filter.periodicity = 'QUARTERLY';
  } else {
    filter.periodicity = 'MONTHLY';
  }

  return filter;
}

export function mapTemporalSplitToPeriodicity(temporalSplit: TemporalSplit): InsPeriodicity[] | undefined {
  return TEMPORAL_SPLIT_PERIODICITY_MAP[temporalSplit];
}

export function mapPeriodicityToTemporalSplit(
  periodicity: InsPeriodicity
): Exclude<TemporalSplit, 'all'> | null {
  switch (periodicity) {
    case 'ANNUAL':
      return 'year';
    case 'QUARTERLY':
      return 'quarter';
    case 'MONTHLY':
      return 'month';
    default:
      return null;
  }
}
