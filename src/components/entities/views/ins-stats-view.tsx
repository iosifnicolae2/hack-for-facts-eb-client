import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import {
  AlertTriangle,
  ArrowDownUp,
  Baby,
  Briefcase,
  Check,
  ChevronDown,
  Droplets,
  Flame,
  HeartPulse,
  House,
  Info,
  Network,
  ExternalLink,
  PanelRightClose,
  PanelRightOpen,
  Ruler,
  Search,
  TrendingDown,
  Waves,
} from 'lucide-react';
import {
  Brush,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ReactMarkdown from 'react-markdown';

import type { EntityDetailsData } from '@/lib/api/entities';
import type { ReportPeriodInput } from '@/schemas/reporting';
import type {
  InsDataset,
  InsEntitySelectorInput,
  InsObservation,
  InsObservationFilterInput,
  InsPeriodicity,
  InsTerritoryLevel,
} from '@/schemas/ins';
import { formatNumber, formatValueWithUnit, getUserLocale } from '@/lib/utils';
import {
  INS_DERIVED_INDICATOR_BASE_CODES,
  INS_PRIORITIZED_DATASET_CODES_BY_LEVEL,
  INS_ROOT_CONTEXTS,
  INS_TOP_METRICS_BY_LEVEL,
  type InsMetricLevel,
} from '@/lib/ins/ins-metric-registry';
import {
  useInsContexts,
  useInsDatasetCatalog,
  useInsDatasetDimensions,
  useInsDatasetHistory,
  useInsObservationsSnapshotByDatasets,
} from '@/lib/hooks/use-ins-dashboard';
import {
  buildDefaultSeriesSelection,
  buildSeriesGroups,
  buildStableSeries,
  buildUnitOptions,
  filterObservationsBySeriesSelection,
  getObservationClassificationSelectionMap,
  getDefaultUnitSelection,
  mergeSeriesSelection,
  mergeUnitSelection,
  type InsSeriesGroup,
} from '@/lib/ins/series-selection';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const PERIODICITY_LABELS: Record<InsPeriodicity, string> = {
  ANNUAL: t`Annual`,
  QUARTERLY: t`Quarterly`,
  MONTHLY: t`Monthly`,
};

const VALUE_STATUS_LABELS: Record<string, string> = {
  ':': t`Missing`,
  c: t`Confidential`,
  x: t`Confidential`,
};

type TemporalSplit = 'all' | 'year' | 'quarter' | 'month';
type ExplorerMode = 'panel' | 'full';
type InsUrlState = {
  datasetCode: string | null;
  search: string;
  rootCode: string;
  temporalSplit: TemporalSplit;
  explorerMode: ExplorerMode;
  seriesSelection: Record<string, string[]>;
  unitKey: string | null;
};

const TEMPORAL_SPLIT_PERIODICITY_MAP: Record<TemporalSplit, InsPeriodicity[] | undefined> = {
  all: undefined,
  year: ['ANNUAL'],
  quarter: ['QUARTERLY'],
  month: ['MONTHLY'],
};
const TEMPORAL_SPLIT_OPTIONS: Array<{ value: Exclude<TemporalSplit, 'all'>; label: string }> = [
  { value: 'year', label: t`Year` },
  { value: 'quarter', label: t`Quarter` },
  { value: 'month', label: t`Month` },
];
const INS_URL_KEYS = {
  dataset: 'insDataset',
  search: 'insSearch',
  root: 'insRoot',
  temporal: 'insTemporal',
  explorer: 'insExplorer',
  series: 'insSeries',
  unit: 'insUnit',
} as const;

function getLocalizedText(ro: string | null | undefined, en: string | null | undefined, locale: 'ro' | 'en'): string {
  if (locale === 'en') {
    return en || ro || '';
  }
  return ro || en || '';
}

function formatDatasetPeriodicity(periodicities: InsPeriodicity[] | null | undefined): string {
  return (periodicities ?? [])
    .map((periodicity) => PERIODICITY_LABELS[periodicity] ?? periodicity)
    .join(', ');
}

function formatPeriodLabel(period: InsObservation['time_period']) {
  if (!period) return t`Unknown`;
  if (period.periodicity === 'MONTHLY' && period.month) {
    const month = String(period.month).padStart(2, '0');
    return `${period.year}-${month}`;
  }
  if (period.periodicity === 'QUARTERLY' && period.quarter) {
    return `T${period.quarter} ${period.year}`;
  }
  return `${period.year}`;
}

function parseObservationValue(rawValue: string | null | undefined): number | null {
  if (rawValue == null) return null;
  const normalized = rawValue.replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function getObservationUnit(observation: InsObservation): string | null {
  return observation.unit?.symbol || observation.unit?.code || null;
}

function getObservationStatusLabel(status: string | null | undefined): string | null {
  if (!status) return null;
  return VALUE_STATUS_LABELS[status] ?? t`Unavailable`;
}

function isPercentUnit(observation: InsObservation): boolean {
  const unitCandidates = [
    observation.unit?.symbol,
    observation.unit?.code,
    observation.unit?.name_ro,
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  return unitCandidates.some((value) => value.includes('%') || value.includes('procent'));
}

function getCardNumericValue(observation: InsObservation): { value: string; statusLabel?: string } {
  const statusLabel = getObservationStatusLabel(observation.value_status);
  if (statusLabel) return { value: '—', statusLabel };

  const numericValue = parseObservationValue(observation.value);
  if (numericValue == null) return { value: t`N/A` };

  const numberValue = formatNumber(numericValue, 'compact');
  if (isPercentUnit(observation)) {
    return { value: `${numberValue}%` };
  }

  return { value: numberValue };
}

function normalizeLabel(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

function getClassificationLabel(observation: InsObservation): string {
  const labels = observation.classifications
    ?.map((item) => item.name_ro || item.code)
    .filter(Boolean) as string[] | undefined;

  if (!labels || labels.length === 0) return t`Total`;
  return labels.join(' • ');
}

function buildSeriesSelectionFromObservation(observation: InsObservation | null | undefined): Record<string, string[]> {
  if (!observation) return {};

  const classificationMap = getObservationClassificationSelectionMap(observation);
  const selection: Record<string, string[]> = {};

  for (const [typeCode, selectionKey] of Object.entries(classificationMap)) {
    if (!typeCode || !selectionKey) continue;
    selection[typeCode] = [selectionKey];
  }

  return selection;
}

function buildObservationSeriesTupleSignature(observation: InsObservation): string {
  const classificationMap = getObservationClassificationSelectionMap(observation);
  const classificationPart = Object.entries(classificationMap)
    .sort(([leftTypeCode], [rightTypeCode]) => leftTypeCode.localeCompare(rightTypeCode, 'ro'))
    .map(([typeCode, selectionKey]) => `${typeCode}:${selectionKey}`)
    .join('|');
  const unitPart = observation.unit?.code?.trim() || observation.unit?.symbol?.trim() || observation.unit?.name_ro?.trim() || '__none__';
  return `${unitPart}||${classificationPart}`;
}

function formatObservationValue(observation: InsObservation): { value: string; statusLabel?: string } {
  const statusLabel = getObservationStatusLabel(observation.value_status);
  if (statusLabel) return { value: '—', statusLabel };

  const numericValue = parseObservationValue(observation.value);
  if (numericValue == null) return { value: t`N/A` };

  const unit = getObservationUnit(observation);
  if (!unit) return { value: formatNumber(numericValue, 'compact') };

  return { value: formatValueWithUnit(numericValue, unit, 'compact') };
}

function normalizeSearchValue(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

function getSearchScore(params: {
  normalizedQuery: string;
  normalizedName: string;
  normalizedContext: string;
  normalizedCode: string;
  normalizedSupplemental: string;
}): number {
  const { normalizedQuery, normalizedName, normalizedContext, normalizedCode, normalizedSupplemental } = params;
  if (normalizedQuery === '') return 100;

  const combinedText = `${normalizedName} ${normalizedContext} ${normalizedSupplemental} ${normalizedCode}`.trim();
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

  const scoreByField = (field: string, base: number): number => {
    if (!field) return -1;

    if (field === normalizedQuery) return base + 120;
    if (field.startsWith(normalizedQuery)) return base + 90 - Math.min(50, field.length - normalizedQuery.length);

    const fieldWords = field.split(/\s+/).filter(Boolean);
    if (fieldWords.some((word) => word.startsWith(normalizedQuery))) {
      return base + 70;
    }

    if (tokens.length > 0 && tokens.every((token) => field.includes(token))) {
      return base + 55 + Math.min(tokens.length, 6) * 5;
    }

    const directIndex = field.indexOf(normalizedQuery);
    if (directIndex >= 0) {
      return base + 40 - Math.min(40, directIndex);
    }

    return -1;
  };

  const nameScore = scoreByField(normalizedName, 1400);
  if (nameScore >= 0) return nameScore;

  const contextScore = scoreByField(normalizedContext, 1000);
  if (contextScore >= 0) return contextScore;

  const supplementalScore = scoreByField(normalizedSupplemental, 850);
  if (supplementalScore >= 0) return supplementalScore;

  const codeScore = scoreByField(normalizedCode, 700);
  if (codeScore >= 0) return codeScore;

  if (normalizedQuery.length > 2) {
    return -1;
  }

  let queryIndex = 0;
  for (const character of combinedText) {
    if (character === normalizedQuery[queryIndex]) {
      queryIndex += 1;
      if (queryIndex === normalizedQuery.length) return 250;
    }
  }

  return -1;
}

type DatasetExplorerSection = {
  code: string;
  label: string;
  datasets: InsDataset[];
};

type PreparedDatasetSearchEntry = {
  dataset: InsDataset;
  datasetName: string;
  normalizedName: string;
  normalizedContext: string;
  normalizedCode: string;
  normalizedSupplemental: string;
};

type DatasetExplorerGroup = {
  code: string;
  shortLabel: string;
  label: string;
  totalCount: number;
  sections: DatasetExplorerSection[];
  unsectionedDatasets: InsDataset[];
};

function getContextPathSegments(path: string | null | undefined): string[] {
  if (!path) return [];
  return path
    .split('.')
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function areStringArraysEqual(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

function toPlainTextLabel(value: string): string {
  const decoded = decodeHtmlEntities(value);
  return decoded
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeRootLabel(value: string): string {
  return value.replace(/^[A-H]\.\s*/i, '').trim();
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function isSafeExternalHref(href: string | undefined): boolean {
  if (!href) return false;
  return href.startsWith('http://') || href.startsWith('https://');
}

function htmlToMarkdown(value: string): string {
  const withLinks = value.replace(
    /<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (_match, href: string, label: string) => {
      const safeHref = href.trim();
      const safeLabel = toPlainTextLabel(label);
      if (!isSafeExternalHref(safeHref)) return safeLabel;
      return `[${safeLabel}](${safeHref})`;
    }
  );

  return withLinks
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function normalizeMarkdownText(value: string | null | undefined): string | null {
  if (!value) return null;
  const text = decodeHtmlEntities(htmlToMarkdown(value));
  return text.trim() === '' ? null : text;
}

function normalizeMetadataKey(value: string): string {
  return normalizeLabel(value).replace(/[^a-z0-9]/g, '');
}

function metadataValueToText(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === 'string') return normalizeMarkdownText(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    const parts = value
      .map((entry) => metadataValueToText(entry))
      .filter(Boolean) as string[];
    if (parts.length === 0) return null;
    return parts.join(', ');
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const priorityKeys = ['ro', 'text', 'description', 'value', 'name'];
    for (const key of priorityKeys) {
      if (record[key] != null) {
        const text = metadataValueToText(record[key]);
        if (text) return text;
      }
    }
  }
  return null;
}

function findMetadataText(metadata: Record<string, unknown> | null | undefined, keys: string[]): string | null {
  if (!metadata) return null;
  const targetKeys = new Set(keys.map((key) => normalizeMetadataKey(key)));

  for (const [rawKey, rawValue] of Object.entries(metadata)) {
    if (!targetKeys.has(normalizeMetadataKey(rawKey))) continue;
    const text = metadataValueToText(rawValue);
    if (text) return text;
  }

  return null;
}

function extractIndicatorNumericMap(values: Array<{ datasetCode: string; observation?: InsObservation | null }>): Map<string, number> {
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

function extractIndicatorUnitMap(values: Array<{ datasetCode: string; observation?: InsObservation | null }>): Map<string, string> {
  const result = new Map<string, string>();

  for (const row of values) {
    const unit = row.observation ? getObservationSourceUnitForDerived(row.observation) : null;
    if (!unit) continue;
    result.set(row.datasetCode, unit);
  }

  return result;
}

function getObservationSourceUnitForDerived(observation: InsObservation): string | null {
  const candidates = [
    observation.unit?.symbol,
    observation.unit?.name_ro,
    observation.unit?.code,
  ];

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

type DerivedIndicator = {
  id:
    | 'birth-rate'
    | 'death-rate'
    | 'natural-increase'
    | 'natural-increase-rate'
    | 'net-migration'
    | 'net-migration-rate'
    | 'employees-rate'
    | 'dwellings-rate'
    | 'living-area'
    | 'water'
    | 'gas'
    | 'sewer-rate'
    | 'gas-network-rate';
  label: string;
  value: string;
  unitLabel: string;
  sourceDatasetCode: string | null;
};

type DerivedIndicatorGroup = 'demography' | 'economy_housing' | 'utilities';

const DERIVED_INDICATOR_GROUP_META: Record<DerivedIndicatorGroup, { label: string; description: string }> = {
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

const DERIVED_INDICATOR_GROUP_ORDER: DerivedIndicatorGroup[] = [
  'demography',
  'economy_housing',
  'utilities',
];

function getDerivedIndicatorGroup(id: DerivedIndicator['id']): DerivedIndicatorGroup {
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

function computeDerivedIndicators(indicatorValues: Array<{ datasetCode: string; observation?: InsObservation | null }>) {
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

  const getBaseUnit = (datasetCode: string, fallbackBaseUnit: string) => unitMap.get(datasetCode) ?? fallbackBaseUnit;

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

function DerivedIndicatorIcon({ id }: { id: DerivedIndicator['id'] }) {
  const iconClassName = 'h-4 w-4 text-slate-700';

  switch (id) {
    case 'birth-rate':
      return <Baby className={iconClassName} />;
    case 'death-rate':
      return <HeartPulse className={iconClassName} />;
    case 'natural-increase':
    case 'natural-increase-rate':
      return <TrendingDown className={iconClassName} />;
    case 'net-migration':
    case 'net-migration-rate':
      return <ArrowDownUp className={iconClassName} />;
    case 'employees-rate':
      return <Briefcase className={iconClassName} />;
    case 'dwellings-rate':
      return <House className={iconClassName} />;
    case 'living-area':
      return <Ruler className={iconClassName} />;
    case 'water':
      return <Droplets className={iconClassName} />;
    case 'gas':
      return <Flame className={iconClassName} />;
    case 'sewer-rate':
      return <Waves className={iconClassName} />;
    case 'gas-network-rate':
      return <Network className={iconClassName} />;
    default:
      return <Info className={iconClassName} />;
  }
}

function buildHistoryFilter(params: {
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

function getReportPeriodAnchor(reportPeriod: ReportPeriodInput): string | null {
  const intervalAnchor = reportPeriod.selection.interval?.start;
  if (intervalAnchor) return intervalAnchor;

  const firstDate = reportPeriod.selection.dates?.[0];
  if (firstDate) return firstDate;

  return null;
}

function buildIndicatorPeriodFilter(params: {
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

function buildIndicatorFallbackFilter(params: {
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

function pickDefaultIndicatorObservation(observations: InsObservation[]): InsObservation | null {
  if (observations.length === 0) return null;

  const seriesGroups = buildSeriesGroups(observations, []);
  const defaultSeriesSelection = buildDefaultSeriesSelection(seriesGroups);
  const unitOptions = buildUnitOptions(observations);
  const defaultUnitSelection = getDefaultUnitSelection(unitOptions);

  const strictMatches = filterObservationsBySeriesSelection(
    observations,
    defaultSeriesSelection,
    defaultUnitSelection
  );
  if (strictMatches.length > 0) {
    return buildStableSeries(strictMatches)[0] ?? strictMatches[0] ?? null;
  }

  const selectionOnlyMatches = filterObservationsBySeriesSelection(observations, defaultSeriesSelection, null);
  if (selectionOnlyMatches.length > 0) {
    return buildStableSeries(selectionOnlyMatches)[0] ?? selectionOnlyMatches[0] ?? null;
  }

  if (defaultUnitSelection) {
    const unitOnlyMatches = filterObservationsBySeriesSelection(observations, {}, defaultUnitSelection);
    if (unitOnlyMatches.length > 0) {
      return buildStableSeries(unitOnlyMatches)[0] ?? unitOnlyMatches[0] ?? null;
    }
  }

  return buildStableSeries(observations)[0] ?? observations[0] ?? null;
}

const DETAIL_SCROLL_OFFSET_MOBILE_PX = 112;
const DETAIL_SCROLL_OFFSET_DESKTOP_PX = 168;
const SERIES_SELECTOR_SEARCH_THRESHOLD = 10;
const INS_TEMPO_BASE_URL = 'http://statistici.insse.ro/tempoins/index.jsp';
const INS_TERMS_URL = 'http://insse.ro/cms/ro';

function mapTemporalSplitToPeriodicity(temporalSplit: TemporalSplit): InsPeriodicity[] | undefined {
  return TEMPORAL_SPLIT_PERIODICITY_MAP[temporalSplit];
}

function mapPeriodicityToTemporalSplit(periodicity: InsPeriodicity): Exclude<TemporalSplit, 'all'> | null {
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

function parseSeriesSelection(value: string): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  for (const segment of value.split(';')) {
    const [rawTypeCode, ...rawValueParts] = segment.split(':');
    const typeCode = rawTypeCode?.trim();
    const rawValues = rawValueParts.join(':').trim();
    if (!typeCode || !/^[A-Za-z0-9_.-]+$/.test(typeCode)) continue;
    if (!rawValues) continue;

    const values = Array.from(
      new Set(
        rawValues
          .split(',')
          .map((entry) => entry.trim())
          .filter(Boolean)
      )
    );

    if (values.length === 0) continue;
    result[typeCode] = values;
  }

  return result;
}

function serializeSeriesSelection(selection: Record<string, string[]>): string {
  return Object.entries(selection)
    .map(([typeCode, rawValues]) => {
      const cleanTypeCode = typeCode.trim();
      const cleanValues = Array.from(
        new Set(
          rawValues
            .map((value) => value.trim())
            .filter(Boolean)
        )
      );

      if (!cleanTypeCode || cleanValues.length === 0) return null;
      return `${cleanTypeCode}:${cleanValues.join(',')}`;
    })
    .filter((entry): entry is string => entry !== null)
    .sort((left, right) => left.localeCompare(right, 'ro'))
    .join(';');
}

function extractRawSeriesCode(selectionCode: string): string {
  if (selectionCode.startsWith('fallback:')) {
    const payload = selectionCode.slice('fallback:'.length);
    const [rawCode] = payload.split('|');
    return rawCode?.trim() || selectionCode;
  }

  if (selectionCode.startsWith('id:')) {
    return selectionCode;
  }

  return selectionCode;
}

function normalizeSeriesSelectionForUrl(
  selection: Record<string, string[]>
): Record<string, string[]> {
  const normalizedSelection: Record<string, string[]> = {};

  for (const [typeCode, selectedCodes] of Object.entries(selection)) {
    const cleanedTypeCode = typeCode.trim();
    if (!cleanedTypeCode) continue;

    const cleanedCodes = Array.from(
      new Set(
        selectedCodes
          .map((selectedCode) => extractRawSeriesCode(selectedCode))
          .map((selectedCode) => selectedCode.trim())
          .filter(Boolean)
      )
    );

    if (cleanedCodes.length === 0) continue;
    normalizedSelection[cleanedTypeCode] = cleanedCodes;
  }

  return normalizedSelection;
}

function parseInsUrlState(searchParams: URLSearchParams): InsUrlState {
  const datasetCodeRaw = searchParams.get(INS_URL_KEYS.dataset)?.trim().toUpperCase() ?? '';
  const datasetCode = /^[A-Z0-9_]+$/.test(datasetCodeRaw) ? datasetCodeRaw : null;

  const search = (searchParams.get(INS_URL_KEYS.search) ?? '').trim();
  const rootCodeRaw = searchParams.get(INS_URL_KEYS.root)?.trim() ?? '';
  const rootCode = INS_ROOT_CONTEXTS.some((root) => root.code === rootCodeRaw) ? rootCodeRaw : '';

  const temporalSplitRaw = searchParams.get(INS_URL_KEYS.temporal)?.trim() ?? '';
  const temporalSplit: TemporalSplit =
    temporalSplitRaw === 'year' || temporalSplitRaw === 'quarter' || temporalSplitRaw === 'month'
      ? temporalSplitRaw
      : 'all';

  const explorerRaw = searchParams.get(INS_URL_KEYS.explorer)?.trim() ?? '';
  const explorerMode: ExplorerMode = explorerRaw === 'full' ? 'full' : 'panel';
  const seriesRaw = searchParams.get(INS_URL_KEYS.series)?.trim() ?? '';
  const seriesSelection = parseSeriesSelection(seriesRaw);
  const unitRaw = searchParams.get(INS_URL_KEYS.unit)?.trim() ?? '';
  const unitKey = unitRaw === '' ? null : unitRaw;

  return {
    datasetCode,
    search,
    rootCode,
    temporalSplit,
    explorerMode,
    seriesSelection,
    unitKey,
  };
}

function writeInsUrlState(params: {
  datasetCode: string | null;
  search: string;
  rootCode: string;
  temporalSplit: TemporalSplit;
  explorerMode: ExplorerMode;
  seriesSelection: Record<string, string[]>;
  unitKey: string | null;
}) {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  const searchParams = url.searchParams;

  if (params.datasetCode && params.datasetCode.trim() !== '') {
    searchParams.set(INS_URL_KEYS.dataset, params.datasetCode);
  } else {
    searchParams.delete(INS_URL_KEYS.dataset);
  }

  if (params.search.trim() !== '') {
    searchParams.set(INS_URL_KEYS.search, params.search.trim());
  } else {
    searchParams.delete(INS_URL_KEYS.search);
  }

  if (params.rootCode.trim() !== '') {
    searchParams.set(INS_URL_KEYS.root, params.rootCode);
  } else {
    searchParams.delete(INS_URL_KEYS.root);
  }

  if (params.temporalSplit !== 'all') {
    searchParams.set(INS_URL_KEYS.temporal, params.temporalSplit);
  } else {
    searchParams.delete(INS_URL_KEYS.temporal);
  }

  if (params.explorerMode !== 'panel') {
    searchParams.set(INS_URL_KEYS.explorer, params.explorerMode);
  } else {
    searchParams.delete(INS_URL_KEYS.explorer);
  }

  const serializedSeriesSelection = serializeSeriesSelection(params.seriesSelection);
  if (serializedSeriesSelection !== '') {
    searchParams.set(INS_URL_KEYS.series, serializedSeriesSelection);
  } else {
    searchParams.delete(INS_URL_KEYS.series);
  }

  if (params.unitKey && params.unitKey.trim() !== '') {
    searchParams.set(INS_URL_KEYS.unit, params.unitKey.trim());
  } else {
    searchParams.delete(INS_URL_KEYS.unit);
  }

  const nextSearch = searchParams.toString();
  const nextUrl = `${url.pathname}${nextSearch ? `?${nextSearch}` : ''}${url.hash}`;
  window.history.replaceState(window.history.state, '', nextUrl);
}

function buildInsTempoDatasetUrl(datasetCode: string, locale: 'ro' | 'en'): string {
  const params = new URLSearchParams({
    ind: datasetCode,
    lang: locale === 'en' ? 'en' : 'ro',
    page: 'tempo3',
  });
  return `${INS_TEMPO_BASE_URL}?${params.toString()}`;
}

function MarkdownDescription({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-2 text-sm leading-6 tracking-[0.005em] text-slate-700 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5 text-sm leading-6 tracking-[0.005em] text-slate-700">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5 text-sm leading-6 tracking-[0.005em] text-slate-700">{children}</ol>,
        li: ({ children }) => <li>{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
        a: ({ href, children }) => {
          if (!isSafeExternalHref(href)) {
            return <span>{children}</span>;
          }
          return (
            <a href={href} target="_blank" rel="noreferrer" className="font-medium text-blue-700 underline underline-offset-2">
              {children}
            </a>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function ExpandableMarkdownField({
  label,
  content,
  collapsible = true,
}: {
  label: ReactNode;
  content: string;
  collapsible?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const plainTextLength = useMemo(() => toPlainTextLabel(content).length, [content]);
  const canExpand = collapsible && (plainTextLength > 360 || content.split('\n').length > 5);

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</div>
      <div className={`mt-1 ${canExpand && !expanded ? 'relative max-h-36 overflow-hidden' : ''}`}>
        <MarkdownDescription content={content} />
        {canExpand && !expanded && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent" />
        )}
      </div>
      {canExpand && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setExpanded((current) => !current)}
          className="mt-1 h-7 px-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          {expanded ? t`Show less` : t`Show more`}
        </Button>
      )}
    </div>
  );
}

export function InsStatsView({
  entity,
  reportPeriod,
}: {
  entity: EntityDetailsData | null | undefined;
  reportPeriod: ReportPeriodInput;
}) {
  const initialUrlState = useMemo<InsUrlState>(() => {
    if (typeof window === 'undefined') {
      return {
        datasetCode: null,
        search: '',
        rootCode: '',
        temporalSplit: 'all',
        explorerMode: 'panel',
        seriesSelection: {},
        unitKey: null,
      };
    }

    return parseInsUrlState(new URLSearchParams(window.location.search));
  }, []);

  const [searchTerm, setSearchTerm] = useState(initialUrlState.search);
  const [selectedRootContextCode, setSelectedRootContextCode] = useState<string>(initialUrlState.rootCode);
  const [selectedDatasetCode, setSelectedDatasetCode] = useState<string | null>(initialUrlState.datasetCode);
  const [temporalSplit, setTemporalSplit] = useState<TemporalSplit>(initialUrlState.temporalSplit);
  const [openRootGroups, setOpenRootGroups] = useState<string[]>([]);
  const [pendingExplorerFocusCode, setPendingExplorerFocusCode] = useState<string | null>(null);
  const [showAllRows, setShowAllRows] = useState(false);
  const [isDatasetMetaExpanded, setIsDatasetMetaExpanded] = useState(false);
  const [isExplorerFullWidth, setIsExplorerFullWidth] = useState(initialUrlState.explorerMode === 'full');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialUrlState.search);
  const [selectedSeriesClassifications, setSelectedSeriesClassifications] = useState<Record<string, string[]>>(
    initialUrlState.seriesSelection
  );
  const [selectedUnitKey, setSelectedUnitKey] = useState<string | null>(initialUrlState.unitKey);
  const [seriesSelectorSearchByTypeCode, setSeriesSelectorSearchByTypeCode] = useState<Record<string, string>>({});
  const lastSerializedInsUrlStateRef = useRef<string>('');
  const hasProcessedInitialDatasetSelectionRef = useRef(false);
  const hasAppliedInitialSeriesUrlStateRef = useRef(false);
  const initialSeriesUrlStateRef = useRef({
    datasetCode: initialUrlState.datasetCode,
    seriesSelection: initialUrlState.seriesSelection,
    unitKey: initialUrlState.unitKey,
  });
  const detailCardRef = useRef<HTMLDivElement | null>(null);
  const rootGroupRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const datasetItemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const locale = getUserLocale() === 'en' ? 'en' : 'ro';
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const normalizedDeferredSearchTerm = useMemo(
    () => normalizeSearchValue(deferredSearchTerm),
    [deferredSearchTerm]
  );

  const entityType = entity?.entity_type ?? '';
  const isCounty = entityType === 'admin_county_council';
  const metricLevel: InsMetricLevel = isCounty ? 'county' : 'uat';

  const sirutaCode = entity?.uat?.siruta_code != null ? String(entity.uat.siruta_code) : '';
  const countyCode = entity?.uat?.county_code?.trim().toUpperCase() ?? '';

  const entitySelector = useMemo<InsEntitySelectorInput | null>(() => {
    if (isCounty) {
      if (countyCode === '') return null;
      return {
        territoryCode: countyCode,
        territoryLevel: 'NUTS3',
      };
    }

    if (sirutaCode === '') return null;
    return { sirutaCode };
  }, [countyCode, isCounty, sirutaCode]);

  const hasEntitySelector = entitySelector !== null;
  const selectedHistoryFilter = useMemo(
    () => {
      const base = buildHistoryFilter({ isCounty, countyCode, sirutaCode });
      const periodicities = mapTemporalSplitToPeriodicity(temporalSplit);
      return {
        ...base,
        periodicity: periodicities?.[0],
      };
    },
    [countyCode, isCounty, sirutaCode, temporalSplit]
  );

  const topMetrics = INS_TOP_METRICS_BY_LEVEL[metricLevel];
  const topMetricCodes = useMemo(() => topMetrics.map((metric) => metric.code), [topMetrics]);
  const derivedIndicatorCodes = useMemo(() => Array.from(INS_DERIVED_INDICATOR_BASE_CODES), []);
  const prioritizedCodes = INS_PRIORITIZED_DATASET_CODES_BY_LEVEL[metricLevel];

  const contextsQuery = useInsContexts({
    limit: 500,
    enabled: hasEntitySelector,
  });

  const datasetCatalogQuery = useInsDatasetCatalog({
    filter: isCounty
      ? {
          hasCountyData: true,
        }
      : {
          hasUatData: true,
        },
    limit: 500,
    enabled: hasEntitySelector,
  });

  const indicatorPeriodFilter = useMemo(
    () =>
      buildIndicatorPeriodFilter({
        reportPeriod,
        isCounty,
        countyCode,
        sirutaCode,
      }),
    [countyCode, isCounty, reportPeriod, sirutaCode]
  );

  const indicatorFallbackFilter = useMemo(
    () =>
      buildIndicatorFallbackFilter({
        reportPeriod,
        isCounty,
        countyCode,
        sirutaCode,
      }),
    [countyCode, isCounty, reportPeriod, sirutaCode]
  );

  const topMetricSnapshotQuery = useInsObservationsSnapshotByDatasets({
    datasetCodes: topMetricCodes,
    filter: indicatorPeriodFilter,
    enabled: hasEntitySelector,
    limit: 200,
  });

  const topMetricFallbackSnapshotQuery = useInsObservationsSnapshotByDatasets({
    datasetCodes: topMetricCodes,
    filter: indicatorFallbackFilter,
    enabled: hasEntitySelector,
    limit: 200,
  });

  const derivedIndicatorsSnapshotQuery = useInsObservationsSnapshotByDatasets({
    datasetCodes: derivedIndicatorCodes,
    filter: indicatorPeriodFilter,
    enabled: hasEntitySelector,
    limit: 200,
  });

  const derivedIndicatorsFallbackSnapshotQuery = useInsObservationsSnapshotByDatasets({
    datasetCodes: derivedIndicatorCodes,
    filter: indicatorFallbackFilter,
    enabled: hasEntitySelector,
    limit: 200,
  });

  const datasetHistoryQuery = useInsDatasetHistory({
    datasetCode: selectedDatasetCode ?? '',
    filter: selectedHistoryFilter,
    enabled: hasEntitySelector && selectedDatasetCode !== null,
    pageSize: 500,
    maxPages: 30,
  });

  const datasetDimensionsQuery = useInsDatasetDimensions({
    datasetCode: selectedDatasetCode ?? '',
    enabled: hasEntitySelector && selectedDatasetCode !== null,
  });

  useEffect(() => {
    if (!hasProcessedInitialDatasetSelectionRef.current) {
      hasProcessedInitialDatasetSelectionRef.current = true;
      return;
    }

    setShowAllRows(false);
    setIsDatasetMetaExpanded(false);
    setSelectedSeriesClassifications({});
    setSelectedUnitKey(null);
    setSeriesSelectorSearchByTypeCode({});
  }, [selectedDatasetCode]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 200);
    return () => window.clearTimeout(timerId);
  }, [searchTerm]);

  const contextNodes = contextsQuery.data?.nodes ?? [];
  const contextByCode = useMemo(() => {
    return new Map(contextNodes.map((context) => [context.code, context]));
  }, [contextNodes]);

  const rootContexts = useMemo(() => {
    const rootNodes = contextNodes.filter((context) => context.level === 0);
    if (rootNodes.length === 0) {
      return INS_ROOT_CONTEXTS.map((root) => ({
        ...root,
        displayLabel: root.label,
      }));
    }

    const rootByCode = new Map(rootNodes.map((node) => [node.code, node]));
    return INS_ROOT_CONTEXTS.map((root) => {
      const node = rootByCode.get(root.code);
      const rawLabel = getLocalizedText(node?.name_ro, node?.name_en, locale) || root.label;
      return {
        ...root,
        displayLabel: toPlainTextLabel(rawLabel),
      };
    });
  }, [contextNodes, locale]);

  const catalogDatasets = datasetCatalogQuery.data?.nodes ?? [];
  const prioritizedIndex = useMemo(() => {
    return new Map(prioritizedCodes.map((code, index) => [code, index]));
  }, [prioritizedCodes]);
  const preparedDatasetSearchEntries = useMemo<PreparedDatasetSearchEntry[]>(() => {
    return catalogDatasets.map((dataset) => {
      const fallbackPath = dataset.context_code ? contextByCode.get(dataset.context_code)?.path : undefined;
      const contextPathCodes = getContextPathSegments(dataset.context_path || fallbackPath).slice(1);
      const contextLabels = contextPathCodes
        .map((code) => {
          const contextNode = contextByCode.get(code);
          return getLocalizedText(contextNode?.name_ro, contextNode?.name_en, locale);
        })
        .filter(Boolean)
        .join(' ');
      const datasetName = getLocalizedText(dataset.name_ro, dataset.name_en, locale) || dataset.code;
      const contextName = getLocalizedText(dataset.context_name_ro, dataset.context_name_en, locale);

      return {
        dataset,
        datasetName,
        normalizedName: normalizeSearchValue(datasetName),
        normalizedContext: normalizeSearchValue(contextName),
        normalizedCode: normalizeSearchValue(dataset.code),
        normalizedSupplemental: normalizeSearchValue(contextLabels),
      };
    });
  }, [catalogDatasets, contextByCode, locale]);

  const filteredDatasets = useMemo(() => {
    const hasActiveSearch = normalizedDeferredSearchTerm !== '';

    return preparedDatasetSearchEntries
      .map((entry) => {
        const searchScore = getSearchScore({
          normalizedQuery: normalizedDeferredSearchTerm,
          normalizedCode: entry.normalizedCode,
          normalizedName: entry.normalizedName,
          normalizedContext: entry.normalizedContext,
          normalizedSupplemental: entry.normalizedSupplemental,
        });
        return {
          dataset: entry.dataset,
          datasetName: entry.datasetName,
          searchScore,
        };
      })
      .filter((entry) => entry.searchScore >= 0)
      .sort((left, right) => {
        if (left.searchScore !== right.searchScore) {
          return right.searchScore - left.searchScore;
        }

        const leftPin = prioritizedIndex.get(left.dataset.code);
        const rightPin = prioritizedIndex.get(right.dataset.code);
        if (!hasActiveSearch) {
          if (leftPin != null && rightPin != null && leftPin !== rightPin) {
            return leftPin - rightPin;
          }
          if (leftPin != null && rightPin == null) return -1;
          if (leftPin == null && rightPin != null) return 1;
        }

        return left.datasetName.localeCompare(right.datasetName, 'ro');
      })
      .map((entry) => entry.dataset);
  }, [normalizedDeferredSearchTerm, preparedDatasetSearchEntries, prioritizedIndex]);

  const groupedDatasets = useMemo<DatasetExplorerGroup[]>(() => {
    const rootOrder = new Map(rootContexts.map((root, index) => [root.code, index]));
    const rootMetaByCode = new Map(rootContexts.map((root) => [root.code, root]));

    type MutableGroup = {
      code: string;
      shortLabel: string;
      label: string;
      sectionMap: Map<string, DatasetExplorerSection>;
      unsectionedDatasets: InsDataset[];
    };

    const groups = new Map<string, MutableGroup>();

    const ensureGroup = (rootCode: string): MutableGroup => {
      const existing = groups.get(rootCode);
      if (existing) return existing;

      const contextNode = contextByCode.get(rootCode);
      const rootMeta = rootMetaByCode.get(rootCode);
      const rawGroupLabel = getLocalizedText(contextNode?.name_ro, contextNode?.name_en, locale) || rootMeta?.label || t`Other`;
      const next: MutableGroup = {
        code: rootCode,
        shortLabel: rootMeta?.shortLabel ?? rootCode.toUpperCase(),
        label: toPlainTextLabel(rawGroupLabel),
        sectionMap: new Map(),
        unsectionedDatasets: [],
      };
      groups.set(rootCode, next);
      return next;
    };

    for (const dataset of filteredDatasets) {
      const fallbackPath = dataset.context_code ? contextByCode.get(dataset.context_code)?.path : undefined;
      const pathSegments = getContextPathSegments(dataset.context_path || fallbackPath);
      const rootCode = pathSegments[1] || selectedRootContextCode || 'other';
      const sectionCode = pathSegments[2] || '';

      const group = ensureGroup(rootCode);
      if (sectionCode === '') {
        group.unsectionedDatasets.push(dataset);
        continue;
      }

      const sectionNode = contextByCode.get(sectionCode);
      const existingSection = group.sectionMap.get(sectionCode);
      if (existingSection) {
        existingSection.datasets.push(dataset);
        continue;
      }

      group.sectionMap.set(sectionCode, {
        code: sectionCode,
        label: toPlainTextLabel(
          getLocalizedText(sectionNode?.name_ro, sectionNode?.name_en, locale) ||
            getLocalizedText(dataset.context_name_ro, dataset.context_name_en, locale) ||
            t`Other`
        ),
        datasets: [dataset],
      });
    }

    return Array.from(groups.values())
      .map((group) => ({
        code: group.code,
        shortLabel: group.shortLabel,
        label: group.label,
        totalCount:
          group.unsectionedDatasets.length +
          Array.from(group.sectionMap.values()).reduce((total, section) => total + section.datasets.length, 0),
        sections: Array.from(group.sectionMap.values()).sort((left, right) => {
          const codeComparison = left.code.localeCompare(right.code, 'ro', { numeric: true });
          if (codeComparison !== 0) return codeComparison;
          return left.label.localeCompare(right.label, 'ro');
        }),
        unsectionedDatasets: group.unsectionedDatasets,
      }))
      .sort((left, right) => {
        const leftOrder = rootOrder.get(left.code) ?? Number.MAX_SAFE_INTEGER;
        const rightOrder = rootOrder.get(right.code) ?? Number.MAX_SAFE_INTEGER;
        if (leftOrder !== rightOrder) return leftOrder - rightOrder;
        return left.label.localeCompare(right.label, 'ro');
      });
  }, [contextByCode, filteredDatasets, locale, rootContexts, selectedRootContextCode]);

  const firstDatasetCodeByContext = useMemo(() => {
    const map = new Map<string, string>();
    for (const dataset of filteredDatasets) {
      if (!dataset.context_code) continue;
      if (!map.has(dataset.context_code)) {
        map.set(dataset.context_code, dataset.code);
      }
    }
    return map;
  }, [filteredDatasets]);

  const hasSearchTerm = normalizedDeferredSearchTerm !== '';
  const groupedRootCodes = useMemo(() => groupedDatasets.map((group) => group.code), [groupedDatasets]);

  useEffect(() => {
    if (groupedRootCodes.length === 0) {
      setOpenRootGroups((current) => (current.length === 0 ? current : []));
      return;
    }

    setOpenRootGroups((current) => {
      let next: string[];
      if (hasSearchTerm) {
        next = groupedRootCodes;
      } else if (selectedRootContextCode !== '') {
        next = groupedRootCodes.includes(selectedRootContextCode) ? [selectedRootContextCode] : [groupedRootCodes[0]];
      } else {
        const preserved = current.filter((code) => groupedRootCodes.includes(code));
        next = preserved.length > 0 ? preserved : [groupedRootCodes[0]];
      }

      return areStringArraysEqual(current, next) ? current : next;
    });
  }, [groupedRootCodes, hasSearchTerm, selectedRootContextCode]);

  const catalogDatasetByCode = useMemo(() => {
    return new Map(catalogDatasets.map((dataset) => [dataset.code, dataset]));
  }, [catalogDatasets]);

  const selectedReportPeriodLabel = useMemo(() => {
    const anchor = getReportPeriodAnchor(reportPeriod);
    if (!anchor) return t`Unknown`;
    if (reportPeriod.type === 'QUARTER') {
      const match = anchor.match(/^(\d{4})-Q([1-4])$/);
      if (match) return `T${match[2]} ${match[1]}`;
    }
    if (reportPeriod.type === 'MONTH') {
      const match = anchor.match(/^(\d{4})-(0[1-9]|1[0-2])$/);
      if (match) return `${match[1]}-${match[2]}`;
    }
    return anchor;
  }, [reportPeriod]);

  const topMetricRowsByCode = useMemo(() => {
    const result = new Map<
      string,
      {
        dataset: InsDataset | null;
        observation: InsObservation | null;
        periodLabel: string;
        selectedPeriodLabel: string;
        source: 'selected' | 'fallback' | 'none';
        hasData: boolean;
      }
    >();

    const selectedObservationsByDataset = topMetricSnapshotQuery.data?.observationsByDataset;
    const fallbackObservationsByDataset = topMetricFallbackSnapshotQuery.data?.observationsByDataset;
    for (const code of topMetricCodes) {
      const selectedObservations = selectedObservationsByDataset?.get(code) ?? [];
      const fallbackObservations = fallbackObservationsByDataset?.get(code) ?? [];
      const selectedObservation = pickDefaultIndicatorObservation(selectedObservations);
      const fallbackObservation = pickDefaultIndicatorObservation(fallbackObservations);
      const representative = selectedObservation ?? fallbackObservation;
      const source: 'selected' | 'fallback' | 'none' = selectedObservation
        ? 'selected'
        : fallbackObservation
          ? 'fallback'
          : 'none';
      const periodLabel = representative ? formatPeriodLabel(representative.time_period) : t`Unknown`;
      result.set(code, {
        dataset: catalogDatasetByCode.get(code) ?? null,
        observation: representative,
        periodLabel,
        selectedPeriodLabel: selectedReportPeriodLabel,
        source,
        hasData: representative !== null,
      });
    }

    return result;
  }, [
    catalogDatasetByCode,
    selectedReportPeriodLabel,
    topMetricCodes,
    topMetricFallbackSnapshotQuery.data?.observationsByDataset,
    topMetricSnapshotQuery.data?.observationsByDataset,
  ]);

  const defaultDatasetCode = useMemo(() => {
    for (const code of topMetricCodes) {
      const row = topMetricRowsByCode.get(code);
      if (row?.hasData) return code;
    }

    for (const code of topMetricCodes) {
      if (topMetricRowsByCode.has(code)) return code;
      if (catalogDatasets.some((dataset) => dataset.code === code)) return code;
    }

    if (catalogDatasets.length > 0) return catalogDatasets[0].code;
    if (filteredDatasets.length > 0) return filteredDatasets[0].code;
    return null;
  }, [catalogDatasets, filteredDatasets, topMetricCodes, topMetricRowsByCode]);

  useEffect(() => {
    if (selectedDatasetCode !== null) return;
    if (!defaultDatasetCode) return;
    setSelectedDatasetCode(defaultDatasetCode);
  }, [defaultDatasetCode, selectedDatasetCode]);

  const summaryCards = useMemo(() => {
    return topMetrics.map((metric) => {
      const row = topMetricRowsByCode.get(metric.code);
      return {
        code: metric.code,
        label: metric.label,
        row,
      };
    });
  }, [topMetricRowsByCode, topMetrics]);

  const selectedDatasetFromCurrentSources = useMemo(() => {
    if (selectedDatasetCode === null) return null;

    const fromCatalog = catalogDatasets.find((dataset) => dataset.code === selectedDatasetCode);
    if (fromCatalog) return fromCatalog;

    return null;
  }, [catalogDatasets, selectedDatasetCode]);

  const selectedDatasetLookupQuery = useInsDatasetCatalog({
    filter: selectedDatasetCode ? { codes: [selectedDatasetCode] } : undefined,
    limit: 1,
    enabled: hasEntitySelector && selectedDatasetCode !== null && selectedDatasetFromCurrentSources === null,
  });

  const selectedDataset = useMemo(() => {
    if (selectedDatasetFromCurrentSources) return selectedDatasetFromCurrentSources;
    return selectedDatasetLookupQuery.data?.nodes?.[0] ?? null;
  }, [selectedDatasetFromCurrentSources, selectedDatasetLookupQuery.data?.nodes]);

  const selectedDatasetSourceUrl = useMemo(() => {
    if (!selectedDataset?.code) return null;
    return buildInsTempoDatasetUrl(selectedDataset.code, locale);
  }, [locale, selectedDataset]);

  const availableTemporalOptions = useMemo(() => {
    if (!selectedDataset) return [] as Array<{ value: Exclude<TemporalSplit, 'all'>; label: string }>;

    const availableSplits = new Set<Exclude<TemporalSplit, 'all'>>();
    for (const periodicity of selectedDataset.periodicity ?? []) {
      const split = mapPeriodicityToTemporalSplit(periodicity);
      if (split) availableSplits.add(split);
    }

    return TEMPORAL_SPLIT_OPTIONS.filter((option) => availableSplits.has(option.value));
  }, [selectedDataset]);

  useEffect(() => {
    if (!selectedDataset) return;
    if (availableTemporalOptions.length === 0) return;

    const isCurrentTemporalAvailable =
      temporalSplit !== 'all' && availableTemporalOptions.some((option) => option.value === temporalSplit);
    if (isCurrentTemporalAvailable) return;

    setTemporalSplit(availableTemporalOptions[0].value);
  }, [availableTemporalOptions, selectedDataset, temporalSplit]);

  useEffect(() => {
    if (selectedDatasetCode === null) return;
    if (selectedDatasetFromCurrentSources) return;
    if (selectedDatasetLookupQuery.isLoading) return;
    if (!selectedDatasetLookupQuery.data) return;
    if ((selectedDatasetLookupQuery.data.nodes ?? []).length === 0) {
      setSelectedDatasetCode(null);
    }
  }, [
    selectedDatasetCode,
    selectedDatasetFromCurrentSources,
    selectedDatasetLookupQuery.data,
    selectedDatasetLookupQuery.isLoading,
  ]);

  const selectedDatasetDetails = useMemo(() => {
    if (!selectedDataset) return null;

    const metadata =
      selectedDataset.metadata && typeof selectedDataset.metadata === 'object'
        ? (selectedDataset.metadata as Record<string, unknown>)
        : undefined;

    const definitionFromMetadata = findMetadataText(metadata, [
      'description',
      'descriere',
      'definition',
      'definitie',
      'definition_ro',
      'description_ro',
    ]);

    const methodology = findMetadataText(metadata, [
      'methodology',
      'methodology_ro',
      'metodologie',
      'metodologia',
      'method',
      'metoda',
    ]);

    const source = findMetadataText(metadata, ['source', 'sursa', 'provider', 'institutie', 'institution']);
    const notes = findMetadataText(metadata, ['notes', 'note', 'observatii', 'comments']);
    const selectedContext = contextByCode.get(selectedDataset.context_code ?? '');
    const localizedContextMarkdown = locale === 'en'
      ? selectedContext?.name_en_markdown || selectedContext?.name_ro_markdown
      : selectedContext?.name_ro_markdown || selectedContext?.name_en_markdown;
    const localizedContextLabel =
      getLocalizedText(selectedContext?.name_ro, selectedContext?.name_en, locale) ||
      getLocalizedText(selectedDataset.context_name_ro, selectedDataset.context_name_en, locale);

    const contextLabel = normalizeMarkdownText(
      localizedContextMarkdown || localizedContextLabel
    );

    const fallbackPath = selectedDataset.context_code ? contextByCode.get(selectedDataset.context_code)?.path : undefined;
    const contextCodes = getContextPathSegments(selectedDataset.context_path || fallbackPath).slice(1);
    const primaryRootCode = contextCodes[0] ?? '';
    const hierarchy: Array<{
      code: string;
      label: string;
      kind: 'home' | 'context' | 'dataset';
      rootCode: string;
    }> = [];
    const pushHierarchyItem = (params: {
      code: string;
      rawLabel: string | null | undefined;
      kind: 'home' | 'context' | 'dataset';
      rootCode: string;
    }) => {
      if (!params.rawLabel) return;
      const cleanLabel = toPlainTextLabel(params.rawLabel);
      if (cleanLabel === '') return;
      const previous = hierarchy[hierarchy.length - 1];
      if (previous && previous.code === params.code) return;
      hierarchy.push({
        code: params.code,
        label: cleanLabel,
        kind: params.kind,
        rootCode: params.rootCode,
      });
    };

    pushHierarchyItem({
      code: 'ins-tempo',
      rawLabel: t`INS Tempo`,
      kind: 'home',
      rootCode: '',
    });

    for (const code of contextCodes) {
      const contextNode = contextByCode.get(code);
      const nodePath = getContextPathSegments(contextNode?.path).slice(1);
      const nodeRootCode = nodePath[0] ?? primaryRootCode;
      pushHierarchyItem({
        code,
        rawLabel:
          (locale === 'en'
            ? contextNode?.name_en_markdown || contextNode?.name_ro_markdown
            : contextNode?.name_ro_markdown || contextNode?.name_en_markdown) ||
          getLocalizedText(contextNode?.name_ro, contextNode?.name_en, locale) ||
          code,
        kind: 'context',
        rootCode: nodeRootCode,
      });
    }

    if (selectedDataset.context_code && !contextCodes.includes(selectedDataset.context_code)) {
      const contextNode = contextByCode.get(selectedDataset.context_code);
      const contextPath = getContextPathSegments(contextNode?.path || selectedDataset.context_path).slice(1);
      pushHierarchyItem({
        code: selectedDataset.context_code,
        rawLabel: getLocalizedText(selectedDataset.context_name_ro, selectedDataset.context_name_en, locale),
        kind: 'context',
        rootCode: contextPath[0] ?? primaryRootCode,
      });
    }

    pushHierarchyItem({
      code: selectedDataset.code,
      rawLabel: selectedDataset.code,
      kind: 'dataset',
      rootCode: primaryRootCode,
    });

    const definition = normalizeMarkdownText(
      locale === 'en'
        ? selectedDataset.definition_en ?? selectedDataset.definition_ro ?? definitionFromMetadata
        : selectedDataset.definition_ro ?? selectedDataset.definition_en ?? definitionFromMetadata
    );
    const rootContextLabel =
      primaryRootCode !== ''
        ? rootContexts.find((root) => root.code === primaryRootCode)?.displayLabel ||
          getLocalizedText(contextByCode.get(primaryRootCode)?.name_ro, contextByCode.get(primaryRootCode)?.name_en, locale) ||
          null
        : null;
    const rootContextBreadcrumbLabel = rootContextLabel ? normalizeRootLabel(toPlainTextLabel(rootContextLabel)) : null;

    return {
      code: selectedDataset.code,
      title: getLocalizedText(selectedDataset.name_ro, selectedDataset.name_en, locale) || selectedDataset.code,
      hierarchy,
      rootContextCode: primaryRootCode,
      rootContextBreadcrumbLabel,
      contextLabel,
      periodicityLabel: formatDatasetPeriodicity(selectedDataset.periodicity),
      yearRange:
        selectedDataset.year_range && selectedDataset.year_range.length > 0
          ? `${Math.min(...selectedDataset.year_range)} - ${Math.max(...selectedDataset.year_range)}`
          : null,
      dimensionCount:
        selectedDataset.dimension_count != null && Number.isFinite(selectedDataset.dimension_count)
          ? String(selectedDataset.dimension_count)
          : null,
      definition,
      methodology: normalizeMarkdownText(methodology),
      source: normalizeMarkdownText(source),
      notes: normalizeMarkdownText(notes),
    };
  }, [contextByCode, locale, rootContexts, selectedDataset, selectedDatasetCode]);

  const selectedDatasetBreadcrumbItems = useMemo(() => {
    if (!selectedDatasetDetails) return [];
    return selectedDatasetDetails.hierarchy.filter((item) => item.kind !== 'dataset');
  }, [selectedDatasetDetails]);

  const hasDatasetMetadataPanel = selectedDatasetDetails !== null;
  const selectedTemporalPeriodicity = mapTemporalSplitToPeriodicity(temporalSplit)?.[0];
  const hasTemporalSelector = availableTemporalOptions.length > 1;
  const isTemporalSplitIncompatible =
    selectedDataset != null &&
    selectedTemporalPeriodicity != null &&
    !selectedDataset.periodicity.includes(selectedTemporalPeriodicity);

  const historyObservations = datasetHistoryQuery.data?.observations ?? [];
  const datasetDimensionMetadata = datasetDimensionsQuery.data?.dimensions ?? [];

  const seriesGroups = useMemo<InsSeriesGroup[]>(() => {
    return buildSeriesGroups(historyObservations, datasetDimensionMetadata);
  }, [datasetDimensionMetadata, historyObservations]);

  const effectiveSeriesSelection = useMemo(() => {
    return mergeSeriesSelection(seriesGroups, selectedSeriesClassifications);
  }, [selectedSeriesClassifications, seriesGroups]);

  const urlSeriesSelection = useMemo(() => {
    const normalizedSelection: Record<string, string[]> = {};

    for (const [typeCode, selectedCodes] of Object.entries(selectedSeriesClassifications)) {
      const group = seriesGroups.find((entry) => entry.typeCode === typeCode);
      const optionByCode = new Map((group?.options ?? []).map((option) => [option.code, option]));
      const values = Array.from(
        new Set(
          selectedCodes
            .map((selectedCode) => {
              const matchedOption = optionByCode.get(selectedCode);
              if (matchedOption) return matchedOption.rawCode;
              return extractRawSeriesCode(selectedCode);
            })
            .map((value) => value.trim())
            .filter(Boolean)
        )
      );

      if (values.length > 0) {
        normalizedSelection[typeCode] = values;
      }
    }

    return normalizeSeriesSelectionForUrl(normalizedSelection);
  }, [selectedSeriesClassifications, seriesGroups]);

  useEffect(() => {
    const serialized = JSON.stringify({
      datasetCode: selectedDatasetCode,
      search: debouncedSearchTerm.trim(),
      rootCode: selectedRootContextCode,
      temporalSplit,
      explorerMode: isExplorerFullWidth ? 'full' : 'panel',
      seriesSelection: serializeSeriesSelection(urlSeriesSelection),
      unitKey: selectedUnitKey,
    });

    if (lastSerializedInsUrlStateRef.current === serialized) return;
    lastSerializedInsUrlStateRef.current = serialized;

    writeInsUrlState({
      datasetCode: selectedDatasetCode,
      search: debouncedSearchTerm,
      rootCode: selectedRootContextCode,
      temporalSplit,
      explorerMode: isExplorerFullWidth ? 'full' : 'panel',
      seriesSelection: urlSeriesSelection,
      unitKey: selectedUnitKey,
    });
  }, [
    debouncedSearchTerm,
    isExplorerFullWidth,
    selectedDatasetCode,
    selectedRootContextCode,
    selectedUnitKey,
    temporalSplit,
    urlSeriesSelection,
  ]);

  const historyUnitOptions = useMemo(() => buildUnitOptions(historyObservations), [historyObservations]);

  useEffect(() => {
    if (hasAppliedInitialSeriesUrlStateRef.current) return;

    const initialSeriesState = initialSeriesUrlStateRef.current;
    const hasInitialSeries = Object.keys(initialSeriesState.seriesSelection).length > 0;
    const hasInitialUnit = Boolean(initialSeriesState.unitKey);

    if (!hasInitialSeries && !hasInitialUnit) {
      hasAppliedInitialSeriesUrlStateRef.current = true;
      return;
    }

    const expectedDatasetCode = initialSeriesState.datasetCode;
    if (expectedDatasetCode && expectedDatasetCode !== selectedDatasetCode) {
      return;
    }

    if (seriesGroups.length === 0 && historyUnitOptions.length === 0) {
      return;
    }

    if (hasInitialSeries) {
      setSelectedSeriesClassifications(initialSeriesState.seriesSelection);
    }
    if (hasInitialUnit) {
      setSelectedUnitKey(initialSeriesState.unitKey);
    }

    hasAppliedInitialSeriesUrlStateRef.current = true;
  }, [historyUnitOptions.length, selectedDatasetCode, seriesGroups.length]);

  const effectiveUnitSelection = useMemo(() => {
    return mergeUnitSelection(historyUnitOptions, selectedUnitKey);
  }, [historyUnitOptions, selectedUnitKey]);

  const filteredHistoryObservations = useMemo(() => {
    return filterObservationsBySeriesSelection(
      historyObservations,
      effectiveSeriesSelection,
      effectiveUnitSelection
    );
  }, [effectiveSeriesSelection, effectiveUnitSelection, historyObservations]);

  const hasMultiValueSeriesSelection = useMemo(() => {
    return Object.values(effectiveSeriesSelection).some((selectedCodes) => selectedCodes.length > 1);
  }, [effectiveSeriesSelection]);

  const historySeries = useMemo(() => {
    if (!hasMultiValueSeriesSelection) {
      return buildStableSeries(filteredHistoryObservations);
    }

    const observationsByPeriod = new Map<string, InsObservation[]>();
    for (const observation of filteredHistoryObservations) {
      const periodKey = observation.time_period?.iso_period;
      if (!periodKey) continue;
      const existing = observationsByPeriod.get(periodKey);
      if (existing) {
        existing.push(observation);
      } else {
        observationsByPeriod.set(periodKey, [observation]);
      }
    }

    const aggregated = Array.from(observationsByPeriod.values()).map((periodRows) => {
      const rowsByTuple = new Map<string, InsObservation[]>();
      for (const row of periodRows) {
        const tupleSignature = buildObservationSeriesTupleSignature(row);
        const existing = rowsByTuple.get(tupleSignature);
        if (existing) {
          existing.push(row);
        } else {
          rowsByTuple.set(tupleSignature, [row]);
        }
      }

      const canonicalRows = Array.from(rowsByTuple.values())
        .map((rows) => buildStableSeries(rows)[0] ?? rows[0])
        .filter((row): row is InsObservation => Boolean(row));

      const representative = buildStableSeries(canonicalRows)[0] ?? canonicalRows[0] ?? periodRows[0];
      const numericValues = canonicalRows
        .map((row) => parseObservationValue(row.value))
        .filter((value): value is number => value != null);
      const aggregatedValue =
        numericValues.length > 0 ? String(numericValues.reduce((total, value) => total + value, 0)) : representative.value;

      return {
        ...representative,
        value: aggregatedValue,
        classifications: [],
      } as InsObservation;
    });

    return buildStableSeries(aggregated);
  }, [filteredHistoryObservations, hasMultiValueSeriesSelection]);

  const historyChartData = useMemo(() => {
    return [...historySeries]
      .reverse()
      .map((observation) => ({
        period: formatPeriodLabel(observation.time_period),
        numericValue: parseObservationValue(observation.value),
        rawValue: observation.value,
        statusLabel: getObservationStatusLabel(observation.value_status),
      }));
  }, [historySeries]);

  const historyRows = showAllRows ? historySeries : historySeries.slice(0, 12);
  const selectableSeriesGroups = useMemo(
    () => seriesGroups.filter((group) => group.options.length > 1),
    [seriesGroups]
  );
  const hasSeriesSelectors = selectableSeriesGroups.length > 0 || historyUnitOptions.length > 1;

  const activeSeriesCriteriaParts = useMemo(() => {
    const parts: string[] = [];

    for (const group of seriesGroups) {
      const selectedCodes = effectiveSeriesSelection[group.typeCode] ?? [];
      if (selectedCodes.length === 0) continue;
      const selectedLabels = selectedCodes
        .map((code) => group.options.find((entry) => entry.code === code)?.label)
        .filter(Boolean) as string[];
      if (selectedLabels.length === 0) continue;
      parts.push(`${group.typeLabel}: ${selectedLabels.join(', ')}`);
    }

    if (historyUnitOptions.length > 1 && effectiveUnitSelection) {
      const selectedUnit = historyUnitOptions.find((option) => option.key === effectiveUnitSelection);
      if (selectedUnit) {
        parts.push(`${t`Unit`}: ${selectedUnit.label}`);
      }
    }

    return parts;
  }, [effectiveSeriesSelection, effectiveUnitSelection, historyUnitOptions, seriesGroups]);

  const handleResetSeriesSelection = useCallback(() => {
    setSelectedSeriesClassifications(buildDefaultSeriesSelection(seriesGroups));
    setSelectedUnitKey(getDefaultUnitSelection(historyUnitOptions));
  }, [historyUnitOptions, seriesGroups]);

  const derivedIndicatorInputs = useMemo(() => {
    const selectedObservationsByDataset = derivedIndicatorsSnapshotQuery.data?.observationsByDataset;
    const fallbackObservationsByDataset = derivedIndicatorsFallbackSnapshotQuery.data?.observationsByDataset;
    return derivedIndicatorCodes.map((datasetCode) => {
      const selectedObservations = selectedObservationsByDataset?.get(datasetCode) ?? [];
      const fallbackObservations = fallbackObservationsByDataset?.get(datasetCode) ?? [];
      const selectedObservation = pickDefaultIndicatorObservation(selectedObservations);
      const fallbackObservation = pickDefaultIndicatorObservation(fallbackObservations);
      const observation = selectedObservation ?? fallbackObservation;
      return {
        datasetCode,
        observation,
        source: selectedObservation ? 'selected' as const : fallbackObservation ? 'fallback' as const : 'none' as const,
        periodLabel: observation ? formatPeriodLabel(observation.time_period) : null,
      };
    });
  }, [
    derivedIndicatorCodes,
    derivedIndicatorsFallbackSnapshotQuery.data?.observationsByDataset,
    derivedIndicatorsSnapshotQuery.data?.observationsByDataset,
  ]);

  const derivedIndicators = useMemo(() => {
    return computeDerivedIndicators(derivedIndicatorInputs);
  }, [derivedIndicatorInputs]);

  const derivedIndicatorStatus = useMemo(() => {
    const periods = Array.from(
      new Set(
        derivedIndicatorInputs
          .map((row) => row.periodLabel)
          .filter((value): value is string => Boolean(value))
      )
    );
    const hasFallback = derivedIndicatorInputs.some((row) => row.source === 'fallback');

    return {
      selectedPeriodLabel: selectedReportPeriodLabel,
      dataPeriodLabel:
        periods.length === 0 ? t`Unknown` : periods.length === 1 ? periods[0] : t`Mixed`,
      hasFallback,
    };
  }, [derivedIndicatorInputs, selectedReportPeriodLabel]);

  const groupedDerivedIndicators = useMemo(() => {
    const groups: Record<DerivedIndicatorGroup, DerivedIndicator[]> = {
      demography: [],
      economy_housing: [],
      utilities: [],
    };

    for (const indicator of derivedIndicators) {
      groups[getDerivedIndicatorGroup(indicator.id)].push(indicator);
    }

    return groups;
  }, [derivedIndicators]);

  const scrollToDetailCard = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.requestAnimationFrame(() => {
      const detailElement = detailCardRef.current;
      if (!detailElement) return;

      const topOffset =
        window.innerWidth >= 1024 ? DETAIL_SCROLL_OFFSET_DESKTOP_PX : DETAIL_SCROLL_OFFSET_MOBILE_PX;
      const targetTop = Math.max(
        0,
        detailElement.getBoundingClientRect().top + window.scrollY - topOffset
      );

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth',
      });
    });
  }, []);

  const handleSelectDataset = useCallback(
    (
      datasetCode: string,
      options?: {
        scrollToDetail?: boolean;
      }
    ) => {
      setSelectedDatasetCode(datasetCode);

      if (options?.scrollToDetail ?? true) {
        scrollToDetailCard();
      }
    },
    [scrollToDetailCard]
  );

  const handleSelectDerivedIndicator = useCallback(
    (sourceDatasetCode: string | null) => {
      if (!sourceDatasetCode) return;
      setSearchTerm('');
      setSelectedRootContextCode('');
      handleSelectDataset(sourceDatasetCode, { scrollToDetail: true });
    },
    [handleSelectDataset]
  );

  const resolveCompatibleSelectionForUnit = useCallback(
    (unitKey: string | null, baseSelection: Record<string, string[]>) => {
      const normalizedSelection = mergeSeriesSelection(seriesGroups, baseSelection);
      const unitScopedObservations = unitKey
        ? filterObservationsBySeriesSelection(historyObservations, {}, unitKey)
        : historyObservations;

      if (unitScopedObservations.length === 0) {
        return normalizedSelection;
      }

      const strictMatches = filterObservationsBySeriesSelection(unitScopedObservations, normalizedSelection, null);
      if (strictMatches.length > 0) {
        return normalizedSelection;
      }

      const unitScopedGroups = buildSeriesGroups(unitScopedObservations, datasetDimensionMetadata);
      if (unitScopedGroups.length > 0) {
        const mergedUnitScopedSelection = mergeSeriesSelection(unitScopedGroups, normalizedSelection);
        const prunedSelection: Record<string, string[]> = {};

        for (const group of unitScopedGroups) {
          const selectedCodes = mergedUnitScopedSelection[group.typeCode] ?? [];
          if (selectedCodes.length > 0) {
            prunedSelection[group.typeCode] = selectedCodes;
          }
        }

        if (Object.keys(prunedSelection).length > 0) {
          const prunedMatches = filterObservationsBySeriesSelection(unitScopedObservations, prunedSelection, null);
          if (prunedMatches.length > 0) {
            return prunedSelection;
          }
        }
      }

      const fallbackObservation = buildStableSeries(unitScopedObservations)[0] ?? unitScopedObservations[0];
      const tupleSelection = buildSeriesSelectionFromObservation(fallbackObservation);
      if (Object.keys(tupleSelection).length > 0) {
        const tupleMatches = filterObservationsBySeriesSelection(unitScopedObservations, tupleSelection, null);
        if (tupleMatches.length > 0) {
          return tupleSelection;
        }
      }

      return normalizedSelection;
    },
    [datasetDimensionMetadata, historyObservations, seriesGroups]
  );

  const handleSeriesGroupSelectionChange = useCallback(
    (typeCode: string, selectedCode: string, multiSelect: boolean) => {
      setSelectedSeriesClassifications((current) => {
        const normalized = mergeSeriesSelection(seriesGroups, current);
        const existingCodes = normalized[typeCode] ?? [];
        const group = seriesGroups.find((entry) => entry.typeCode === typeCode);
        const optionByCode = new Map((group?.options ?? []).map((option) => [option.code, option]));
        const isTotalLikeCode = (code: string) => optionByCode.get(code)?.isTotalLike ?? false;
        const defaultCode = group?.options.find((option) => option.isTotalLike)?.code ?? group?.options[0]?.code ?? selectedCode;

        const nextCodes = !multiSelect
          ? [selectedCode]
          : (() => {
              if (isTotalLikeCode(selectedCode)) {
                return [selectedCode];
              }

              const withoutTotalLike = existingCodes.filter((code) => !isTotalLikeCode(code));

              if (withoutTotalLike.includes(selectedCode)) {
                const toggledCodes = withoutTotalLike.filter((code) => code !== selectedCode);
                if (toggledCodes.length > 0) {
                  return toggledCodes;
                }

                return selectedCode === defaultCode ? [selectedCode] : [defaultCode];
              }

              return [...withoutTotalLike, selectedCode];
            })();

        const candidateSelection = {
          ...normalized,
          [typeCode]: nextCodes.length > 0 ? nextCodes : [selectedCode],
        };

        const strictMatches = filterObservationsBySeriesSelection(
          historyObservations,
          candidateSelection,
          effectiveUnitSelection
        );
        if (strictMatches.length > 0) {
          return candidateSelection;
        }

        const anyUnitMatches = filterObservationsBySeriesSelection(historyObservations, candidateSelection, null);
        if (anyUnitMatches.length > 0) {
          const nextUnitSelection = mergeUnitSelection(buildUnitOptions(anyUnitMatches), effectiveUnitSelection);
          if (nextUnitSelection !== effectiveUnitSelection) {
            setSelectedUnitKey(nextUnitSelection);
          }
          return resolveCompatibleSelectionForUnit(nextUnitSelection, candidateSelection);
        }

        return resolveCompatibleSelectionForUnit(effectiveUnitSelection, candidateSelection);
      });
    },
    [effectiveUnitSelection, historyObservations, resolveCompatibleSelectionForUnit, seriesGroups]
  );

  const handleUnitSelectionChange = useCallback(
    (unitKey: string) => {
      setSelectedUnitKey(unitKey);
      setSelectedSeriesClassifications((current) =>
        resolveCompatibleSelectionForUnit(unitKey, current)
      );
    },
    [resolveCompatibleSelectionForUnit]
  );

  const handleHierarchyNavigate = useCallback(
    (item: { code: string; kind: 'home' | 'context' | 'dataset'; rootCode: string }) => {
      setSearchTerm('');

      if (item.kind === 'home') {
        setSelectedRootContextCode('');
        setOpenRootGroups(groupedRootCodes);
        setPendingExplorerFocusCode(null);
        return;
      }

      if (item.rootCode !== '') {
        setSelectedRootContextCode(item.rootCode);
        setOpenRootGroups([item.rootCode]);
      }

      if (item.kind === 'dataset') {
        setSelectedDatasetCode(item.code);
      }

      setPendingExplorerFocusCode(item.code);
    },
    [groupedRootCodes]
  );

  useEffect(() => {
    if (!pendingExplorerFocusCode) return;

    const directTarget =
      datasetItemRefs.current[pendingExplorerFocusCode] ??
      sectionRefs.current[pendingExplorerFocusCode] ??
      rootGroupRefs.current[pendingExplorerFocusCode];
    const fallbackDatasetCode = firstDatasetCodeByContext.get(pendingExplorerFocusCode);
    const fallbackTarget = fallbackDatasetCode ? datasetItemRefs.current[fallbackDatasetCode] : null;
    const target = directTarget ?? fallbackTarget;

    if (!target || typeof target.scrollIntoView !== 'function') return;

    if (typeof window === 'undefined') {
      target.scrollIntoView();
      setPendingExplorerFocusCode(null);
      return;
    }

    window.requestAnimationFrame(() => {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    });
    setPendingExplorerFocusCode(null);
  }, [firstDatasetCodeByContext, groupedDatasets, openRootGroups, pendingExplorerFocusCode]);

  const renderDatasetListItem = useCallback(
    (dataset: InsDataset, options?: { fullWidth?: boolean }) => {
      const isFullWidth = options?.fullWidth ?? false;
      const periodicityLabel = formatDatasetPeriodicity(dataset.periodicity);
      const isSelected = selectedDatasetCode === dataset.code;
      const datasetLabel = getLocalizedText(dataset.name_ro, dataset.name_en, locale) || dataset.code;

      return (
        <button
          type="button"
          key={dataset.code}
          data-testid={`dataset-item-${dataset.code}`}
          ref={(element) => {
            datasetItemRefs.current[dataset.code] = element;
          }}
          className={`group w-full text-left transition-all ${
            isSelected ? 'bg-slate-100' : 'bg-white hover:bg-slate-50'
          }`}
          onClick={() =>
            handleSelectDataset(dataset.code, {
              scrollToDetail: true,
            })
          }
        >
          <div className={`flex items-start justify-between gap-2 ${isFullWidth ? 'px-3 py-3' : 'px-2.5 py-2.5'}`}>
            <div className="min-w-0">
              <div
                className={
                  isFullWidth
                    ? 'line-clamp-1 text-[14px] font-semibold leading-6 tracking-[0.002em] text-slate-900'
                    : 'line-clamp-2 text-[13px] font-semibold leading-[1.35] tracking-[0.002em] text-slate-900'
                }
              >
                {datasetLabel}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                    isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {dataset.code}
                </span>
                {periodicityLabel && (
                  <span className="text-[11px] font-medium text-slate-500">{periodicityLabel}</span>
                )}
              </div>
            </div>
          </div>
        </button>
      );
    },
    [handleSelectDataset, locale, selectedDatasetCode]
  );

  if (!entity || (!entity.is_uat && !isCounty)) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle><Trans>INS indicators are only available for UATs.</Trans></AlertTitle>
        <AlertDescription>
          <Trans>Select a local entity to view INS Tempo data.</Trans>
        </AlertDescription>
      </Alert>
    );
  }

  if (isCounty && countyCode === '') {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle><Trans>No county code associated.</Trans></AlertTitle>
        <AlertDescription>
          <Trans>Cannot load INS indicators without the county code.</Trans>
        </AlertDescription>
      </Alert>
    );
  }

  if (!isCounty && sirutaCode === '') {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle><Trans>No SIRUTA code associated.</Trans></AlertTitle>
        <AlertDescription>
          <Trans>Cannot load INS indicators without the locality SIRUTA code.</Trans>
        </AlertDescription>
      </Alert>
    );
  }

  const loadError =
    topMetricSnapshotQuery.error ||
    topMetricFallbackSnapshotQuery.error ||
    derivedIndicatorsSnapshotQuery.error ||
    derivedIndicatorsFallbackSnapshotQuery.error ||
    datasetCatalogQuery.error ||
    contextsQuery.error;
  if (loadError instanceof Error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle><Trans>Could not load INS data</Trans></AlertTitle>
        <AlertDescription>{loadError.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-[1450px] space-y-5">
      {topMetricSnapshotQuery.isLoading || topMetricFallbackSnapshotQuery.isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="space-y-3 p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-20" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((summary) => {
            const observation = summary.row?.observation;
            const formattedValue = observation ? getCardNumericValue(observation) : { value: t`N/A` };
            const period = summary.row?.periodLabel || t`Unknown`;
            const selectedPeriodTag = summary.row?.selectedPeriodLabel || selectedReportPeriodLabel;
            const isPeriodFallback =
              summary.row?.source === 'fallback' || (period !== t`Unknown` && period !== selectedPeriodTag);
            const periodLabelText = isPeriodFallback ? `${period} (${t`last available`})` : period;
            const datasetName =
              getLocalizedText(summary.row?.dataset?.name_ro, summary.row?.dataset?.name_en, locale) || summary.code;
            const isSelected = selectedDatasetCode === summary.code;

            return (
              <button
                key={summary.code}
                type="button"
                onClick={() =>
                  handleSelectDataset(summary.code, {
                    scrollToDetail: true,
                  })
                }
                className="text-left"
              >
                <Card className={`h-full border-slate-200/80 ${isSelected ? 'border-slate-900 ring-1 ring-slate-900/10' : ''}`}>
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{summary.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pb-4">
                    <div className="text-[2.2rem] leading-none font-bold tracking-tight text-slate-800 flex items-center gap-2">
                      <span>{formattedValue.value}</span>
                      {formattedValue.statusLabel && (
                        <Badge variant="outline" className="text-[10px]">
                          {formattedValue.statusLabel}
                        </Badge>
                      )}
                    </div>
                    <div className="line-clamp-2 text-[13px] leading-snug text-slate-600">{datasetName}</div>
                    <div className="text-[12px] font-medium text-slate-500">
                      <Trans>Period:</Trans> {periodLabelText}
                    </div>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>
      )}

      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader className="pb-2">
          {(() => {
            const isPeriodFallback =
              derivedIndicatorStatus.hasFallback ||
              (derivedIndicatorStatus.dataPeriodLabel !== t`Unknown` &&
                derivedIndicatorStatus.dataPeriodLabel !== derivedIndicatorStatus.selectedPeriodLabel);
            const periodLabelText = isPeriodFallback
              ? `${derivedIndicatorStatus.dataPeriodLabel} (${t`last available`})`
              : derivedIndicatorStatus.dataPeriodLabel;

            return (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-xl font-bold tracking-tight text-slate-900"><Trans>Derived indicators</Trans></CardTitle>
            <div className="text-[12px] font-medium text-slate-500">
              <Trans>Period:</Trans> {periodLabelText}
            </div>
          </div>
            );
          })()}
        </CardHeader>
        <CardContent>
          {derivedIndicatorsSnapshotQuery.isLoading || derivedIndicatorsFallbackSnapshotQuery.isLoading ? (
            <div className="grid gap-3 md:grid-cols-3">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-8 w-full" />
              ))}
            </div>
          ) : derivedIndicatorsSnapshotQuery.error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle><Trans>Could not load derived indicators</Trans></AlertTitle>
              <AlertDescription>
                {derivedIndicatorsSnapshotQuery.error instanceof Error
                  ? derivedIndicatorsSnapshotQuery.error.message
                  : t`Unexpected error while loading derived indicators.`}
              </AlertDescription>
            </Alert>
          ) : derivedIndicators.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              <Trans>Not enough latest values to compute derived indicators.</Trans>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-3">
              {DERIVED_INDICATOR_GROUP_ORDER.map((groupId) => {
                const groupRows = groupedDerivedIndicators[groupId];
                if (groupRows.length === 0) return null;

                return (
                  <div key={groupId} className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="mb-2">
                      <h4 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        {DERIVED_INDICATOR_GROUP_META[groupId].label}
                      </h4>
                      <p className="text-[12px] text-slate-500">
                        {DERIVED_INDICATOR_GROUP_META[groupId].description}
                      </p>
                    </div>

                    <div className="space-y-1">
                      {groupRows.map((row) => (
                        <button
                          key={row.id}
                          type="button"
                          onClick={() => handleSelectDerivedIndicator(row.sourceDatasetCode)}
                          className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left transition-colors hover:bg-slate-50"
                        >
                          <div className="min-w-0 flex items-center gap-2">
                            <div className="rounded-md border border-slate-200 bg-white p-1">
                              <DerivedIndicatorIcon id={row.id} />
                            </div>
                            <span className="truncate text-[13px] font-medium text-slate-600">{row.label}</span>
                          </div>
                          <div className="ml-3 min-w-[96px] shrink-0 text-right">
                            <div className="text-[1.25rem] font-bold leading-none tracking-tight tabular-nums text-slate-800">
                              {row.value}
                            </div>
                            <div className="mt-0.5 text-[10px] font-medium leading-none text-slate-500">
                              {row.unitLabel}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div
        data-testid="ins-explorer-layout"
        className={`grid gap-4 ${isExplorerFullWidth ? 'grid-cols-1' : 'xl:grid-cols-[420px_minmax(0,1fr)]'}`}
      >
        <Card className="flex h-[760px] flex-col border-slate-200/80 shadow-sm">
          <CardHeader className="space-y-3 px-4 pb-3 pt-4">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-[1.05rem] font-semibold tracking-[-0.01em] text-slate-900"><Trans>Dataset explorer</Trans></CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsExplorerFullWidth((current) => !current)}
                className="h-8 w-8 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                aria-label={
                  isExplorerFullWidth ? t`Collapse explorer to side panel` : t`Expand explorer to full width`
                }
                title={isExplorerFullWidth ? t`Collapse explorer to side panel` : t`Expand explorer to full width`}
              >
                {isExplorerFullWidth ? <PanelRightOpen className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />}
              </Button>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t`Search dataset code or name`}
                className="h-10 w-full rounded-lg border-slate-300 bg-white pl-9 text-sm shadow-sm"
              />
            </div>

          </CardHeader>
          <CardContent className="flex-1 min-h-0 px-4 pb-4 pt-0">
            {datasetCatalogQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
              </div>
            ) : groupedDatasets.length === 0 ? (
              <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                <Trans>No datasets match your current filters.</Trans>
              </div>
            ) : (
              <ScrollArea className="h-full pr-2">
                <Accordion
                  type="multiple"
                  value={openRootGroups}
                  onValueChange={setOpenRootGroups}
                  className="w-full"
                >
                    {groupedDatasets.map((group) => (
                    <AccordionItem
                      key={group.code}
                      value={group.code}
                      className={
                        isExplorerFullWidth
                          ? 'rounded-none border-0 bg-transparent px-0'
                          : 'rounded-none border-x-0 border-t-0 border-b border-slate-200 bg-white px-1'
                      }
                      ref={(element) => {
                        rootGroupRefs.current[group.code] = element;
                      }}
                    >
                      <AccordionTrigger
                        className={`items-start text-[13px] font-semibold tracking-[-0.005em] text-slate-800 hover:no-underline [&>svg]:-mt-0.5 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:self-start ${
                          isExplorerFullWidth ? 'border-b border-slate-200 px-2 py-3' : 'px-1 py-2.5'
                        }`}
                      >
                        <div className="flex w-full items-start justify-between gap-3 pr-2">
                          <div className="min-w-0 text-left">
                            <div className="line-clamp-1 font-semibold tracking-[-0.005em] text-slate-900">{group.label}</div>
                          </div>
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold tracking-[0.01em] text-slate-600">
                            {group.totalCount}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className={`pb-3 pt-1 ${isExplorerFullWidth ? 'space-y-4 px-2 pt-2' : 'space-y-3 px-0.5'}`}>
                        {group.sections.map((section) => (
                          <div
                            key={`${group.code}-${section.code}`}
                            className={`space-y-2 ${isExplorerFullWidth ? 'px-1' : 'px-0.5'}`}
                            ref={(element) => {
                              sectionRefs.current[section.code] = element;
                            }}
                          >
                            <div className="flex items-center justify-between gap-3 px-0.5">
                              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-600">
                                {section.label}
                              </span>
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                {section.datasets.length}
                              </span>
                            </div>
                            <div className="divide-y divide-slate-100 overflow-hidden rounded-md bg-white">
                              {section.datasets.map((dataset) => renderDatasetListItem(dataset, { fullWidth: isExplorerFullWidth }))}
                            </div>
                          </div>
                        ))}

                        {group.unsectionedDatasets.length > 0 && (
                          <div className={`space-y-2 ${isExplorerFullWidth ? 'px-1' : 'px-0.5'}`}>
                            <div className="flex items-center justify-between gap-3 px-0.5">
                              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-600">
                                <Trans>Other datasets</Trans>
                              </span>
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                {group.unsectionedDatasets.length}
                              </span>
                            </div>
                            <div className="divide-y divide-slate-100 overflow-hidden rounded-md bg-white">
                              {group.unsectionedDatasets.map((dataset) => renderDatasetListItem(dataset, { fullWidth: isExplorerFullWidth }))}
                            </div>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <div ref={detailCardRef}>
          <Card>
            <CardHeader className="space-y-3 pb-4">
              {selectedDatasetDetails && selectedDatasetBreadcrumbItems.length > 0 && (
                <nav className="text-[12px] font-medium leading-5 tracking-[0.01em] text-slate-500">
                  <div className="flex flex-wrap items-center gap-y-1">
                    {selectedDatasetBreadcrumbItems.map((item, index) => {
                      const isCurrent = index === selectedDatasetBreadcrumbItems.length - 1;
                      const displayLabel =
                        item.kind === 'context' && item.code === selectedDatasetDetails?.rootContextCode
                          ? selectedDatasetDetails?.rootContextBreadcrumbLabel || item.label
                          : item.label;

                      return (
                        <div key={`${item.code}-${index}`} className="flex items-center">
                          {index > 0 && <span className="mx-1.5 text-slate-400">/</span>}
                          {isCurrent ? (
                            <span
                              title={displayLabel}
                              className="max-w-[320px] truncate font-semibold tracking-[0.005em] text-slate-900"
                            >
                              {displayLabel}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleHierarchyNavigate(item)}
                              title={displayLabel}
                              className="max-w-[320px] truncate font-medium tracking-[0.005em] text-slate-500 underline-offset-2 transition-colors hover:text-slate-800 hover:underline"
                            >
                              {displayLabel}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </nav>
              )}

              {selectedDataset ? (
                <div className="space-y-1">
                  <div className="text-3xl font-bold tracking-tight text-slate-900">
                    {selectedDatasetDetails?.title || getLocalizedText(selectedDataset.name_ro, selectedDataset.name_en, locale) || selectedDataset.code}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-xl font-semibold tracking-[-0.01em] text-slate-700">{selectedDataset.code}</span>
                    {hasDatasetMetadataPanel && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsDatasetMetaExpanded((current) => !current)}
                        className="h-7 px-2 text-[12px] font-medium tracking-[0.01em] text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      >
                        {isDatasetMetaExpanded ? t`Show less` : t`Show more`}
                      </Button>
                    )}
                  </div>
                </div>
              ) : selectedDatasetCode !== null ? (
                <div className="space-y-1">
                  <div className="text-3xl font-bold tracking-tight text-slate-900">{selectedDatasetCode}</div>
                  <div className="text-sm text-muted-foreground">
                    <Trans>Dataset metadata is loading or unavailable, but historical data can still be viewed below.</Trans>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  <Trans>Select a metric card or dataset from the list to load full history.</Trans>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedDatasetDetails && isDatasetMetaExpanded && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500"><Trans>Code</Trans></div>
                      <div className="mt-0.5 text-[1.05rem] font-semibold tracking-[-0.005em] text-slate-900">{selectedDatasetDetails.code}</div>
                    </div>
                    {selectedDatasetDetails.periodicityLabel && (
                      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500"><Trans>Periodicity</Trans></div>
                        <div className="mt-0.5 text-[1.05rem] font-semibold tracking-[-0.005em] text-slate-900">{selectedDatasetDetails.periodicityLabel}</div>
                      </div>
                    )}
                    {selectedDatasetDetails.yearRange && (
                      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500"><Trans>Coverage</Trans></div>
                        <div className="mt-0.5 text-[1.05rem] font-semibold tracking-[-0.005em] text-slate-900">{selectedDatasetDetails.yearRange}</div>
                      </div>
                    )}
                    {selectedDatasetDetails.dimensionCount && (
                      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500"><Trans>Dimensions</Trans></div>
                        <div className="mt-0.5 text-[1.05rem] font-semibold tracking-[-0.005em] text-slate-900">{selectedDatasetDetails.dimensionCount}</div>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 space-y-3">
                    {selectedDatasetDetails.contextLabel && (
                      <ExpandableMarkdownField label={<Trans>Context</Trans>} content={selectedDatasetDetails.contextLabel} />
                    )}

                    {selectedDatasetDetails.definition && (
                      <ExpandableMarkdownField
                        label={<Trans>Description</Trans>}
                        content={selectedDatasetDetails.definition}
                        collapsible={false}
                      />
                    )}

                    {selectedDatasetDetails.methodology && (
                      <ExpandableMarkdownField label={<Trans>Methodology</Trans>} content={selectedDatasetDetails.methodology} />
                    )}

                    {selectedDatasetDetails.source && (
                      <ExpandableMarkdownField label={<Trans>Source</Trans>} content={selectedDatasetDetails.source} />
                    )}

                    {selectedDatasetDetails.notes && (
                      <ExpandableMarkdownField label={<Trans>Notes</Trans>} content={selectedDatasetDetails.notes} />
                    )}
                  </div>
                </div>
              )}

              {selectedDatasetCode === null ? (
                <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
                  <Trans>No dataset selected yet.</Trans>
                </div>
              ) : datasetHistoryQuery.isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : datasetHistoryQuery.error instanceof Error ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle><Trans>Could not load historical data</Trans></AlertTitle>
                  <AlertDescription>{datasetHistoryQuery.error.message}</AlertDescription>
                </Alert>
              ) : historySeries.length === 0 ? (
                <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
                  <p><Trans>No observations available for the selected dataset and entity.</Trans></p>
                  {isTemporalSplitIncompatible && availableTemporalOptions.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs">
                        <Trans>This dataset is not available for the selected temporal split.</Trans>
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-[11px]"
                        onClick={() => setTemporalSplit(availableTemporalOptions[0].value)}
                      >
                        <Trans>Reset to available period</Trans>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {hasTemporalSelector && (
                    <div className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-slate-500">
                        <Trans>Period</Trans>
                      </span>
                      {availableTemporalOptions.map((option) => (
                        <Button
                          key={`detail-${option.value}`}
                          variant={temporalSplit === option.value ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setTemporalSplit(option.value)}
                          className={`h-7 rounded-full px-3 text-[11px] font-medium tracking-[0.01em] ${
                            temporalSplit === option.value
                              ? 'bg-slate-900 text-white hover:bg-slate-800'
                              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  )}

                  {hasSeriesSelectors && (
                    <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50/70 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-[12px] font-semibold uppercase tracking-[0.06em] text-slate-600">
                          <Trans>Series selector</Trans>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleResetSeriesSelection}
                          className="h-7 px-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
                        >
                          <Trans>Reset to default</Trans>
                        </Button>
                      </div>

                      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                        {selectableSeriesGroups.map((group) => {
                          const selectedCodes = effectiveSeriesSelection[group.typeCode] ?? [];
                          const selectedOptions = group.options.filter((option) => selectedCodes.includes(option.code));
                          const selectorSearchTerm = seriesSelectorSearchByTypeCode[group.typeCode] ?? '';
                          const shouldShowSelectorSearch = group.options.length > SERIES_SELECTOR_SEARCH_THRESHOLD;
                          const normalizedSelectorSearchTerm = normalizeSearchValue(selectorSearchTerm);
                          const filteredOptions =
                            !shouldShowSelectorSearch || normalizedSelectorSearchTerm === ''
                              ? group.options
                              : group.options.filter((option) =>
                                  normalizeSearchValue(`${option.label} ${option.rawCode}`).includes(
                                    normalizedSelectorSearchTerm
                                  )
                                );
                          const triggerLabel =
                            selectedOptions.length === 0
                              ? t`Select series`
                              : selectedOptions.length === 1
                                ? selectedOptions[0].label
                                : `${selectedOptions.length} ${t`selected`}`;
                          return (
                            <div key={group.typeCode} className="space-y-1">
                              <label
                                className="text-[11px] font-semibold uppercase tracking-[0.05em] text-slate-500"
                              >
                                {group.typeLabel}
                              </label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="h-9 w-full justify-between border-slate-300 bg-white px-2 text-[13px] font-medium text-slate-700 hover:bg-slate-100"
                                  >
                                    <span className="truncate text-left">{triggerLabel}</span>
                                    <ChevronDown className="h-4 w-4 text-slate-500" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="w-[min(420px,92vw)] border-slate-200 p-2">
                                  <div className="mb-1.5 text-[11px] text-slate-500">
                                    <Trans>Hold Ctrl/Cmd or Shift while clicking to multi-select.</Trans>
                                  </div>

                                  {shouldShowSelectorSearch && (
                                    <div className="relative mb-2">
                                      <Search className="pointer-events-none absolute left-2 top-2 h-3.5 w-3.5 text-slate-400" />
                                      <Input
                                        value={selectorSearchTerm}
                                        onChange={(event) =>
                                          setSeriesSelectorSearchByTypeCode((current) => ({
                                            ...current,
                                            [group.typeCode]: event.target.value,
                                          }))
                                        }
                                        placeholder={t`Search series options`}
                                        className="h-8 rounded-md border-slate-300 bg-white pl-7 text-[12px]"
                                      />
                                    </div>
                                  )}

                                  <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                                    {shouldShowSelectorSearch ? (
                                      <>
                                        {selectedOptions.length > 0 && (
                                          <div className="space-y-1">
                                            <div className="px-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                                              <Trans>Selected</Trans>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                              {selectedOptions.map((option) => (
                                                <button
                                                  type="button"
                                                  key={`${group.typeCode}-${option.code}-selected`}
                                                  onClick={() =>
                                                    handleSeriesGroupSelectionChange(
                                                      group.typeCode,
                                                      option.code,
                                                      true
                                                    )
                                                  }
                                                  className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2 py-1 text-[11px] font-medium text-white transition-colors hover:bg-slate-800"
                                                >
                                                  <Check className="h-3 w-3" />
                                                  <span className="max-w-[180px] truncate">{option.label}</span>
                                                </button>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        <div className="space-y-1">
                                          <div className="px-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                                            <Trans>Options</Trans>
                                          </div>
                                          {filteredOptions.map((option) => {
                                            const isSelected = selectedCodes.includes(option.code);
                                            return (
                                            <button
                                              type="button"
                                              key={`${group.typeCode}-${option.code}`}
                                              onClick={(event) =>
                                                handleSeriesGroupSelectionChange(
                                                  group.typeCode,
                                                  option.code,
                                                  event.shiftKey || event.ctrlKey || event.metaKey
                                                )
                                              }
                                              className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left transition-colors ${
                                                isSelected
                                                  ? 'bg-slate-900 text-white'
                                                  : 'text-slate-700 hover:bg-slate-100'
                                              }`}
                                            >
                                              <span className="text-[12px] font-medium leading-5">{option.label}</span>
                                              {isSelected && <Check className="ml-2 h-4 w-4 shrink-0" />}
                                            </button>
                                            );
                                          })}
                                          {filteredOptions.length === 0 && (
                                            <div className="rounded-md border border-dashed border-slate-200 px-2 py-2 text-[12px] text-slate-500">
                                              <Trans>No options match your search.</Trans>
                                            </div>
                                          )}
                                        </div>
                                      </>
                                    ) : (
                                      group.options.map((option) => {
                                        const isSelected = selectedCodes.includes(option.code);

                                        return (
                                          <button
                                            type="button"
                                            key={`${group.typeCode}-${option.code}`}
                                            onClick={(event) =>
                                              handleSeriesGroupSelectionChange(
                                                group.typeCode,
                                                option.code,
                                                event.shiftKey || event.ctrlKey || event.metaKey
                                              )
                                            }
                                            className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left transition-colors ${
                                              isSelected
                                                ? 'bg-slate-900 text-white'
                                                : 'text-slate-700 hover:bg-slate-100'
                                            }`}
                                          >
                                            <span className="text-[12px] font-medium leading-5">{option.label}</span>
                                            {isSelected && <Check className="ml-2 h-4 w-4 shrink-0" />}
                                          </button>
                                        );
                                      })
                                    )}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          );
                        })}

                        {historyUnitOptions.length > 1 && (
                          <div className="space-y-1">
                            <label
                              htmlFor="series-selector-unit"
                              className="text-[11px] font-semibold uppercase tracking-[0.05em] text-slate-500"
                            >
                              <Trans>Unit</Trans>
                            </label>
                            <select
                              id="series-selector-unit"
                              value={effectiveUnitSelection ?? ''}
                              onChange={(event) => handleUnitSelectionChange(event.target.value)}
                              className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-[13px] font-medium text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
                            >
                              {historyUnitOptions.map((option) => (
                                <option key={option.key} value={option.key}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeSeriesCriteriaParts.length > 0 && (
                    <div className="text-[12px] leading-5 text-slate-600">
                      <span className="font-semibold text-slate-700"><Trans>Active series criteria:</Trans></span>{' '}
                      {activeSeriesCriteriaParts.join(' • ')}
                    </div>
                  )}

                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historyChartData} margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" minTickGap={24} />
                        <YAxis />
                        <Tooltip
                          formatter={(value, _name, item) => {
                            if (item.payload?.statusLabel) {
                              return [item.payload.statusLabel, t`Status`];
                            }
                            if (typeof value !== 'number') {
                              return ['—', t`Value`];
                            }
                            return [formatNumber(value, 'standard'), t`Value`];
                          }}
                        />
                        <Line type="monotone" dataKey="numericValue" stroke="#0f172a" strokeWidth={2} dot={false} />
                        <Brush dataKey="period" height={20} stroke="#475569" travellerWidth={8} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  {selectedDatasetSourceUrl && (
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-[12px] leading-5 text-slate-600">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <a
                          href={selectedDatasetSourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 font-semibold text-slate-800 underline-offset-2 hover:text-slate-950 hover:underline"
                        >
                          <Trans>Open source matrix in INS Tempo</Trans>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <span className="text-slate-400">•</span>
                        <span>
                          <Trans>
                            Data is sourced from INS Tempo. Reuse and redistribution are subject to INS terms and license.
                          </Trans>{' '}
                          <a
                            href={INS_TERMS_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900"
                          >
                            <Trans>INS terms</Trans>
                          </a>
                        </span>
                      </div>
                    </div>
                  )}

                  {datasetHistoryQuery.data?.partial && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle><Trans>Partial history</Trans></AlertTitle>
                      <AlertDescription>
                        <Trans>
                          Full historical observations exceeded the page cap for this view. Showing the retrieved subset.
                        </Trans>
                      </AlertDescription>
                    </Alert>
                  )}

                  <Table className="text-sm">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-32 text-[12px] font-semibold tracking-[0.02em] text-slate-500"><Trans>Period</Trans></TableHead>
                        <TableHead className="text-[12px] font-semibold tracking-[0.02em] text-slate-500"><Trans>Value</Trans></TableHead>
                        <TableHead className="text-right text-[12px] font-semibold tracking-[0.02em] text-slate-500"><Trans>Details</Trans></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyRows.map((row) => {
                        const { value, statusLabel } = formatObservationValue(row);
                        return (
                          <TableRow key={`${row.dataset_code}-${row.time_period.iso_period}-${row.value}`}>
                            <TableCell className="font-medium tracking-[0.005em]">{formatPeriodLabel(row.time_period)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className={statusLabel ? 'text-muted-foreground' : 'font-medium tracking-[0.005em]'}>{value}</span>
                                {statusLabel && (
                                  <Badge variant="outline" className="text-[10px]">
                                    {statusLabel}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {hasMultiValueSeriesSelection ? t`Multiple selected values` : getClassificationLabel(row)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  {historySeries.length > 12 && (
                    <Button variant="outline" size="sm" onClick={() => setShowAllRows((previous) => !previous)}>
                      {showAllRows ? t`Show less` : t`Show all periods`}
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
