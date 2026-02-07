import { t } from '@lingui/core/macro';

import type { InsObservation } from '@/schemas/ins';
import { formatNumber } from '@/lib/utils';
import type { DerivedIndicator, DerivedIndicatorGroup, DerivedIndicatorId } from './ins-stats-view.types';
import { parseObservationValue } from './ins-stats-view.formatters';

function extractIndicatorNumericMap(
  values: Array<{ datasetCode: string; observation?: InsObservation | null }>
): Map<string, number> {
  const result = new Map<string, number>();

  for (const row of values) {
    const code = row.datasetCode;
    const value = parseObservationValue(row.observation?.value);
    if (value != null) {
      result.set(code, value);
    }
  }

  return result;
}

function extractIndicatorUnitMap(
  values: Array<{ datasetCode: string; observation?: InsObservation | null }>
): Map<string, string> {
  const result = new Map<string, string>();

  for (const row of values) {
    const unit = row.observation ? getObservationSourceUnitForDerived(row.observation) : null;
    if (!unit) continue;
    result.set(row.datasetCode, unit);
  }

  return result;
}

export function getObservationSourceUnitForDerived(observation: InsObservation): string | null {
  const candidates = [observation.unit?.symbol, observation.unit?.name_ro, observation.unit?.code];

  for (const rawCandidate of candidates) {
    if (!rawCandidate) continue;
    const candidate = String(rawCandidate).trim();
    if (!candidate) continue;
    if (/^\d+$/.test(candidate)) continue;
    return candidate;
  }

  return null;
}

function formatDerivedMetric(value: number, mode: 'rate' | 'value'): string {
  if (!Number.isFinite(value)) return '—';
  if (mode === 'rate') {
    return new Intl.NumberFormat('ro-RO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
  return formatNumber(value, 'compact');
}

export const DERIVED_INDICATOR_GROUP_META: Record<
  DerivedIndicatorGroup,
  { label: string; description: string }
> = {
  demography: {
    label: t`Demography`,
    description: t`Birth, mortality, and migration balance.`,
  },
  economy_housing: {
    label: t`Economy & housing`,
    description: t`Labor market and housing pressure indicators.`,
  },
  utilities: {
    label: t`Utilities`,
    description: t`Water, gas, and network service proxies.`,
  },
};

export const DERIVED_INDICATOR_GROUP_ORDER: DerivedIndicatorGroup[] = [
  'demography',
  'economy_housing',
  'utilities',
];

export function getDerivedIndicatorGroup(id: DerivedIndicatorId): DerivedIndicatorGroup {
  switch (id) {
    case 'birth-rate':
    case 'death-rate':
    case 'natural-increase':
    case 'natural-increase-rate':
    case 'net-migration':
    case 'net-migration-rate':
      return 'demography';
    case 'employees-rate':
    case 'dwellings-rate':
    case 'living-area':
      return 'economy_housing';
    case 'water':
    case 'gas':
    case 'sewer-rate':
    case 'gas-network-rate':
      return 'utilities';
    default:
      return 'demography';
  }
}

export function computeDerivedIndicators(
  indicatorValues: Array<{ datasetCode: string; observation?: InsObservation | null }>
) {
  const map = extractIndicatorNumericMap(indicatorValues);
  const unitMap = extractIndicatorUnitMap(indicatorValues);
  const population = map.get('POP107D');
  if (population == null || population <= 0) {
    return [] as DerivedIndicator[];
  }

  const safeDivide = (numerator: number | undefined, denominator: number): number | null => {
    if (numerator == null || denominator <= 0) return null;
    return numerator / denominator;
  };

  const births = map.get('POP201D');
  const deaths = map.get('POP206D');
  const emigrants = map.get('POP309E');
  const immigrants = map.get('POP310E');
  const employees = map.get('FOM104D');
  const dwellings = map.get('LOC101B');
  const livingArea = map.get('LOC103B');
  const water = map.get('GOS107A');
  const gas = map.get('GOS118A');
  const sewerKm = map.get('GOS110A');
  const gasNetworkKm = map.get('GOS116A');

  const rows: DerivedIndicator[] = [];

  const getBaseUnit = (datasetCode: string, fallbackBaseUnit: string) =>
    unitMap.get(datasetCode) ?? fallbackBaseUnit;

  const makePerThousandUnit = (datasetCode: string, fallbackBaseUnit: string) => {
    const baseUnit = getBaseUnit(datasetCode, fallbackBaseUnit);
    return `${baseUnit} / ${t`1,000 inhabitants`}`;
  };

  const makePerCapitaUnit = (datasetCode: string, fallbackBaseUnit: string) => {
    const baseUnit = getBaseUnit(datasetCode, fallbackBaseUnit);
    return `${baseUnit} / ${t`inhabitant`}`;
  };

  const pushRate = (
    id: DerivedIndicator['id'],
    label: string,
    value: number | null,
    sourceDatasetCode: string | null,
    unitLabel: string = t`per 1,000 inhabitants`
  ) => {
    if (value == null) return;
    rows.push({ id, label, value: formatDerivedMetric(value, 'rate'), sourceDatasetCode, unitLabel });
  };

  const pushValue = (
    id: DerivedIndicator['id'],
    label: string,
    value: number | null,
    sourceDatasetCode: string | null,
    unitLabel: string = t`per capita`
  ) => {
    if (value == null) return;
    rows.push({ id, label, value: formatDerivedMetric(value, 'value'), sourceDatasetCode, unitLabel });
  };

  pushRate(
    'birth-rate',
    t`Birth rate`,
    safeDivide(births, population) != null ? (births! / population) * 1000 : null,
    'POP201D',
    makePerThousandUnit('POP201D', 'pers.')
  );
  pushRate(
    'death-rate',
    t`Death rate`,
    safeDivide(deaths, population) != null ? (deaths! / population) * 1000 : null,
    'POP206D',
    makePerThousandUnit('POP206D', 'pers.')
  );
  pushRate(
    'natural-increase-rate',
    t`Natural increase`,
    births != null && deaths != null ? ((births - deaths) / population) * 1000 : null,
    'POP201D',
    makePerThousandUnit('POP201D', 'pers.')
  );
  pushRate(
    'net-migration-rate',
    t`Net migration`,
    immigrants != null && emigrants != null ? ((immigrants - emigrants) / population) * 1000 : null,
    'POP310E',
    makePerThousandUnit('POP310E', 'pers.')
  );
  pushRate(
    'employees-rate',
    t`Employees`,
    employees != null ? (employees / population) * 1000 : null,
    'FOM104D',
    makePerThousandUnit('FOM104D', 'pers.')
  );
  pushRate(
    'dwellings-rate',
    t`Dwellings`,
    dwellings != null ? (dwellings / population) * 1000 : null,
    'LOC101B',
    makePerThousandUnit('LOC101B', 'nr.')
  );
  pushValue(
    'living-area',
    t`Living area`,
    livingArea != null ? livingArea / population : null,
    'LOC103B',
    makePerCapitaUnit('LOC103B', 'm²')
  );
  pushValue('water', t`Water`, water != null ? water / population : null, 'GOS107A', makePerCapitaUnit('GOS107A', 'm³'));
  pushValue('gas', t`Gas`, gas != null ? gas / population : null, 'GOS118A', makePerCapitaUnit('GOS118A', 'm³'));
  pushRate(
    'sewer-rate',
    t`Sewer network`,
    sewerKm != null ? (sewerKm / population) * 1000 : null,
    'GOS110A',
    makePerThousandUnit('GOS110A', 'km')
  );
  pushRate(
    'gas-network-rate',
    t`Gas network`,
    gasNetworkKm != null ? (gasNetworkKm / population) * 1000 : null,
    'GOS116A',
    makePerThousandUnit('GOS116A', 'km')
  );

  return rows;
}
