import { memo, useMemo, useState, type CSSProperties, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import ArrowDownUp from 'lucide-react/dist/esm/icons/arrow-down-up';
import Baby from 'lucide-react/dist/esm/icons/baby';
import Briefcase from 'lucide-react/dist/esm/icons/briefcase';
import Check from 'lucide-react/dist/esm/icons/check';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import Droplets from 'lucide-react/dist/esm/icons/droplets';
import ExternalLink from 'lucide-react/dist/esm/icons/external-link';
import Flame from 'lucide-react/dist/esm/icons/flame';
import HeartPulse from 'lucide-react/dist/esm/icons/heart-pulse';
import House from 'lucide-react/dist/esm/icons/house';
import Info from 'lucide-react/dist/esm/icons/info';
import Network from 'lucide-react/dist/esm/icons/network';
import PanelRightClose from 'lucide-react/dist/esm/icons/panel-right-close';
import PanelRightOpen from 'lucide-react/dist/esm/icons/panel-right-open';
import Ruler from 'lucide-react/dist/esm/icons/ruler';
import Search from 'lucide-react/dist/esm/icons/search';
import TrendingDown from 'lucide-react/dist/esm/icons/trending-down';
import Waves from 'lucide-react/dist/esm/icons/waves';
import {
  Area,
  Brush,
  CartesianGrid,
  ComposedChart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import { Link } from '@tanstack/react-router';

import type { InsDataset, InsObservation } from '@/schemas/ins';
import type { InsSeriesGroup, InsUnitOption } from '@/lib/ins/series-selection';
import type { ChartUrlState } from '@/components/charts/page-schema';
import { formatNumber, formatValueWithUnit } from '@/lib/utils';
import {
  formatDatasetPeriodicity,
  formatObservationValue,
  formatPeriodLabel,
  getCardNumericValue,
  getClassificationLabel,
  getLocalizedText,
  isSafeExternalHref,
  normalizeSearchValue,
  toPlainTextLabel,
} from './ins-stats-view.formatters';
import {
  buildDerivedIndicatorRuntimeContext,
  DERIVED_INDICATOR_GROUP_META,
  DERIVED_INDICATOR_GROUP_ORDER,
  getDerivedIndicatorExplanation,
} from './ins-stats-view.derived';
import type {
  DatasetExplorerGroup,
  DerivedIndicator,
  DerivedIndicatorRuntimeContext,
  TemporalSplit,
} from './ins-stats-view.types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ResponsivePopover } from '@/components/ui/ResponsivePopover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SafeResponsiveContainer } from '@/components/charts/safe-responsive-container';

const CHART_GRID_COLOR = 'hsl(var(--border) / 0.4)';
const CHART_AXIS_COLOR = 'hsl(var(--muted-foreground) / 0.7)';
const CHART_LINE_COLOR = '#0ea5e9';
const CHART_LINE_HIGHLIGHT_COLOR = '#22d3ee';
const CHART_DOT_STROKE_COLOR = '#0284c7';
const CHART_BRUSH_FILL = 'hsl(199 89% 48% / 0.12)';
const CHART_AREA_GRADIENT_ID = 'ins-history-area-gradient';
const CHART_AREA_TOP_COLOR = '#a5f3fc';
const CHART_AREA_UPPER_COLOR = '#67e8f9';
const CHART_AREA_MID_COLOR = '#22d3ee';
const CHART_AREA_LOWER_COLOR = '#0ea5e9';
const CHART_AREA_BOTTOM_COLOR = '#3b82f6';
const CHART_TOOLTIP_STYLE: CSSProperties = {
  backgroundColor: 'hsl(var(--popover) / 0.96)',
  border: '1px solid hsl(199 89% 48% / 0.22)',
  borderRadius: '0.5rem',
  color: 'hsl(var(--popover-foreground))',
  boxShadow: '0 14px 34px hsl(205 84% 18% / 0.12)',
};

function MarkdownDescriptionBase({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => (
          <p className="mb-2 text-sm leading-6 tracking-[0.005em] text-slate-700 dark:text-slate-300 last:mb-0">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="mb-2 list-disc space-y-1 pl-5 text-sm leading-6 tracking-[0.005em] text-slate-700 dark:text-slate-300">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-2 list-decimal space-y-1 pl-5 text-sm leading-6 tracking-[0.005em] text-slate-700 dark:text-slate-300">{children}</ol>
        ),
        li: ({ children }) => <li>{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-slate-900 dark:text-slate-100">{children}</strong>,
        a: ({ href, children }) => {
          if (!isSafeExternalHref(href)) {
            return <span>{children}</span>;
          }
          return (
            <a href={href} target="_blank" rel="noreferrer" className="font-medium text-blue-700 dark:text-blue-300 underline underline-offset-2">
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

export const MarkdownDescription = memo(MarkdownDescriptionBase);

function ExpandableMarkdownFieldBase({
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
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">{label}</div>
      <div className={`mt-1 ${canExpand && !expanded ? 'relative max-h-36 overflow-hidden' : ''}`}>
        <MarkdownDescription content={content} />
        {canExpand && !expanded && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white dark:from-slate-900 to-transparent" />
        )}
      </div>
      {canExpand && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setExpanded((current) => !current)}
          className="mt-1 h-7 px-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
        >
          {expanded ? t`Show less` : t`Show more`}
        </Button>
      )}
    </div>
  );
}

export const ExpandableMarkdownField = memo(ExpandableMarkdownFieldBase);

function DerivedIndicatorIcon({ id }: { id: DerivedIndicator['id'] }) {
  const iconClassName = 'h-4 w-4 text-slate-700 dark:text-slate-300';
  const iconProps = { className: iconClassName, 'aria-hidden': true as const };

  switch (id) {
    case 'birth-rate':
      return <Baby {...iconProps} />;
    case 'death-rate':
      return <HeartPulse {...iconProps} />;
    case 'natural-increase':
    case 'natural-increase-rate':
      return <TrendingDown {...iconProps} />;
    case 'net-migration':
    case 'net-migration-rate':
      return <ArrowDownUp {...iconProps} />;
    case 'employees-rate':
      return <Briefcase {...iconProps} />;
    case 'dwellings-rate':
      return <House {...iconProps} />;
    case 'living-area':
      return <Ruler {...iconProps} />;
    case 'water':
      return <Droplets {...iconProps} />;
    case 'gas':
      return <Flame {...iconProps} />;
    case 'sewer-rate':
      return <Waves {...iconProps} />;
    case 'gas-network-rate':
      return <Network {...iconProps} />;
    default:
      return <Info {...iconProps} />;
  }
}

type SummaryMetricRow = {
  dataset: InsDataset | null;
  observation: InsObservation | null;
  periodLabel: string;
  selectedPeriodLabel: string;
  source: 'selected' | 'fallback' | 'none';
  hasData: boolean;
};

type SummaryMetricCard = {
  code: string;
  label: string;
  row: SummaryMetricRow | undefined;
};

function SummaryMetricsSectionBase(props: {
  isLoading: boolean;
  summaryCards: SummaryMetricCard[];
  selectedReportPeriodLabel: string;
  selectedDatasetCode: string | null;
  locale: 'ro' | 'en';
  onSelectDataset: (datasetCode: string) => void;
}) {
  const { isLoading, summaryCards, selectedReportPeriodLabel, selectedDatasetCode, locale, onSelectDataset } = props;

  if (isLoading) {
    return (
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="space-y-3 p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-20" />
          </Card>
        ))}
      </div>
    );
  }

  return (
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
            onClick={() => onSelectDataset(summary.code)}
            className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
          >
            <Card className={`h-full border-slate-200/80 dark:border-slate-700/80 ${isSelected ? 'border-slate-900 ring-1 ring-slate-900/10' : ''}`}>
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {summary.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pb-4">
                <div className="flex items-center gap-2 text-[2.2rem] font-bold leading-none tracking-tight text-slate-800 dark:text-slate-200">
                  <span>{formattedValue.value}</span>
                  {formattedValue.statusLabel && (
                    <Badge variant="outline" className="text-[10px]">
                      {formattedValue.statusLabel}
                    </Badge>
                  )}
                </div>
                <div className="line-clamp-2 text-[13px] leading-snug text-slate-600 dark:text-slate-300">{datasetName}</div>
                <div className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
                  <Trans>Period:</Trans> {periodLabelText}
                </div>
              </CardContent>
            </Card>
          </button>
        );
      })}
    </div>
  );
}

export const SummaryMetricsSection = memo(SummaryMetricsSectionBase);

function DerivedIndicatorsSectionBase(props: {
  isLoading: boolean;
  error: unknown;
  derivedIndicators: DerivedIndicator[];
  groupedDerivedIndicators: Record<'demography' | 'economy_housing' | 'utilities', DerivedIndicator[]>;
  derivedIndicatorStatus: {
    selectedPeriodLabel: string;
    dataPeriodLabel: string;
    hasFallback: boolean;
  };
  onSelectDerivedIndicator: (datasetCode: string | null) => void;
  onSelectDataset: (datasetCode: string) => void;
}) {
  const {
    isLoading,
    error,
    derivedIndicators,
    groupedDerivedIndicators,
    derivedIndicatorStatus,
    onSelectDerivedIndicator,
    onSelectDataset,
  } = props;

  const isPeriodFallback =
    derivedIndicatorStatus.hasFallback ||
    (derivedIndicatorStatus.dataPeriodLabel !== t`Unknown` &&
      derivedIndicatorStatus.dataPeriodLabel !== derivedIndicatorStatus.selectedPeriodLabel);
  const periodLabelText = isPeriodFallback
    ? `${derivedIndicatorStatus.dataPeriodLabel} (${t`last available`})`
    : derivedIndicatorStatus.dataPeriodLabel;
  const [openDerivedIndicatorInfoId, setOpenDerivedIndicatorInfoId] = useState<DerivedIndicator['id'] | null>(null);
  const runtimeContextByIndicatorId = useMemo(() => {
    const contextById = new Map<DerivedIndicator['id'], DerivedIndicatorRuntimeContext>();
    for (const row of derivedIndicators) {
      contextById.set(
        row.id,
        buildDerivedIndicatorRuntimeContext({
          selectedPeriodLabel: derivedIndicatorStatus.selectedPeriodLabel,
          dataPeriodLabel: derivedIndicatorStatus.dataPeriodLabel,
          sourceDatasetCode: row.sourceDatasetCode,
          hasFallback: derivedIndicatorStatus.hasFallback,
        })
      );
    }
    return contextById;
  }, [
    derivedIndicatorStatus.dataPeriodLabel,
    derivedIndicatorStatus.hasFallback,
    derivedIndicatorStatus.selectedPeriodLabel,
    derivedIndicators,
  ]);

  return (
    <Card className="border-slate-200/80 dark:border-slate-700/80 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            <Trans>Derived indicators</Trans>
          </CardTitle>
          <div className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
            <Trans>Period:</Trans> {periodLabelText}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-full" />
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            <AlertTitle><Trans>Could not load derived indicators</Trans></AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : t`Unexpected error while loading derived indicators.`}
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
                <div key={groupId} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
                  <div className="mb-2">
                    <h4 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {DERIVED_INDICATOR_GROUP_META[groupId].label}
                    </h4>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400">
                      {DERIVED_INDICATOR_GROUP_META[groupId].description}
                    </p>
                  </div>

                  <div className="space-y-1">
                    {groupRows.map((row) => {
                      const explanation = getDerivedIndicatorExplanation(row.id);
                      const runtimeContext =
                        runtimeContextByIndicatorId.get(row.id) ??
                        buildDerivedIndicatorRuntimeContext({
                          selectedPeriodLabel: derivedIndicatorStatus.selectedPeriodLabel,
                          dataPeriodLabel: derivedIndicatorStatus.dataPeriodLabel,
                          sourceDatasetCode: row.sourceDatasetCode,
                          hasFallback: derivedIndicatorStatus.hasFallback,
                        });
                      const detailsButtonLabel = t`Show details for ${row.label}`;

                      return (
                        <div
                          key={row.id}
                          className="group flex items-center gap-2 rounded-lg border border-transparent bg-transparent px-1.5 py-1 transition-colors hover:border-slate-200 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/60 focus-within:border-slate-300 dark:focus-within:border-slate-500 focus-within:bg-slate-50 dark:focus-within:bg-slate-800"
                        >
                          <button
                            type="button"
                            data-testid={`derived-indicator-select-${row.id}`}
                            onClick={() => {
                              setOpenDerivedIndicatorInfoId(null);
                              onSelectDerivedIndicator(row.sourceDatasetCode);
                            }}
                            className="flex min-w-0 flex-1 items-center justify-between rounded-md px-1 py-1 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
                          >
                            <div className="min-w-0 flex items-center gap-2">
                              <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1">
                                <DerivedIndicatorIcon id={row.id} />
                              </div>
                              <span className="truncate text-[13px] font-medium text-slate-600 dark:text-slate-300">{row.label}</span>
                            </div>
                            <div className="ml-3 min-w-[96px] shrink-0 pr-1 text-right">
                              <div className="text-[1.25rem] font-bold leading-none tracking-tight tabular-nums text-slate-800 dark:text-slate-200">
                                {row.value}
                              </div>
                              <div className="mt-0.5 text-[10px] font-medium leading-none text-slate-500 dark:text-slate-400">
                                {row.unitLabel}
                              </div>
                            </div>
                          </button>
                          <ResponsivePopover
                            align="end"
                            mobileSide="bottom"
                            className="sm:w-[min(560px,92vw)] border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0 shadow-2xl"
                            open={openDerivedIndicatorInfoId === row.id}
                            onOpenChange={(isOpen) => setOpenDerivedIndicatorInfoId(isOpen ? row.id : null)}
                            trigger={
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                data-testid={`derived-indicator-info-${row.id}`}
                                aria-label={detailsButtonLabel}
                                title={detailsButtonLabel}
                                className="h-8 w-8 shrink-0 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
                              >
                                <Info className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            }
                            content={
                              <>
                                <div className="border-b border-slate-200 bg-slate-50/80 py-4 pl-5 pr-14 dark:border-slate-700 dark:bg-slate-800/80 sm:px-5">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                      <h3 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100 leading-tight">{row.label}</h3>
                                      <p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">{row.unitLabel}</p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                      <div className="text-[1.5rem] font-bold leading-none tabular-nums text-slate-900 dark:text-slate-100">
                                        {row.value}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="p-5 space-y-4">
                                  <div className="space-y-2">
                                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                                      <Trans>Why this matters</Trans>
                                    </h4>
                                    <p className="text-[14px] leading-relaxed text-slate-700 dark:text-slate-300">{explanation.whyItMatters}</p>
                                  </div>

                                  <div className="space-y-2">
                                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                                      <Trans>How calculated</Trans>
                                    </h4>
                                    <code className="block px-3 py-2.5 rounded-md bg-slate-50 dark:bg-slate-800 text-[13px] font-mono text-slate-700 dark:text-slate-300">
                                      {explanation.formula}
                                    </code>
                                  </div>

                                  <div className="space-y-2">
                                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                                      <Trans>Inputs used</Trans>
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                      {explanation.inputs.map((inputLabel) => {
                                        const datasetCodeMatch = inputLabel.match(/\(([A-Z0-9]+)\)$/);
                                        const datasetCode = datasetCodeMatch ? datasetCodeMatch[1] : null;

                                        if (!datasetCode) {
                                          return (
                                            <span
                                              key={inputLabel}
                                              className="inline-flex items-center px-2.5 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[13px] text-slate-700 dark:text-slate-300"
                                            >
                                              {inputLabel}
                                            </span>
                                          );
                                        }

                                        return (
                                          <button
                                            key={inputLabel}
                                            type="button"
                                            onClick={() => {
                                              setOpenDerivedIndicatorInfoId(null);
                                              onSelectDataset(datasetCode);
                                            }}
                                            className="inline-flex items-center px-2.5 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[13px] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer"
                                            title={t`View ${datasetCode}`}
                                          >
                                            {inputLabel}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                                      <Trans>Current period and source</Trans>
                                    </h4>
                                    <dl className="space-y-2 text-[14px]">
                                      <div className="flex items-center justify-between">
                                        <dt className="text-slate-600 dark:text-slate-400"><Trans>Selected period:</Trans></dt>
                                        <dd className="tabular-nums text-slate-900 dark:text-slate-100 font-medium">{runtimeContext.selectedPeriodLabel}</dd>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <dt className="text-slate-600 dark:text-slate-400"><Trans>Data period shown:</Trans></dt>
                                        <dd className="tabular-nums text-slate-900 dark:text-slate-100 font-medium">{runtimeContext.dataPeriodLabel}</dd>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <dt className="text-slate-600 dark:text-slate-400"><Trans>Source dataset:</Trans></dt>
                                        <dd className="font-semibold text-slate-900 dark:text-slate-100">
                                          {runtimeContext.sourceDatasetCode ?? t`Unavailable`}
                                        </dd>
                                      </div>
                                    </dl>
                                    {runtimeContext.hasFallback && (
                                      <div className="mt-3 rounded-lg border border-amber-200/80 dark:border-amber-700/40 bg-amber-50/60 dark:bg-amber-900/20 px-3 py-2.5">
                                        <p className="text-[13px] leading-relaxed text-amber-800 dark:text-amber-200">
                                          <span className="font-semibold"><Trans>Fallback:</Trans></span>{' '}
                                          <Trans>
                                            Some indicators use the latest available period because the selected period had
                                            missing values.
                                          </Trans>
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                                      <Trans>Interpretation notes</Trans>
                                    </h4>
                                    <p className="text-[14px] leading-relaxed text-slate-700 dark:text-slate-300">{explanation.notes}</p>
                                  </div>
                                </div>
                              </>
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const DerivedIndicatorsSection = memo(DerivedIndicatorsSectionBase);

function DatasetExplorerSectionBase(props: {
  isExplorerFullWidth: boolean;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onToggleExplorerWidth: () => void;
  isLoading: boolean;
  groupedDatasets: DatasetExplorerGroup[];
  openRootGroups: string[];
  onOpenRootGroupsChange: (value: string[]) => void;
  selectedDatasetCode: string | null;
  locale: 'ro' | 'en';
  onSelectDataset: (datasetCode: string) => void;
  rootGroupRefs: Record<string, HTMLDivElement | null>;
  sectionRefs: Record<string, HTMLDivElement | null>;
  datasetItemRefs: Record<string, HTMLButtonElement | null>;
}) {
  const {
    isExplorerFullWidth,
    searchTerm,
    onSearchTermChange,
    onToggleExplorerWidth,
    isLoading,
    groupedDatasets,
    openRootGroups,
    onOpenRootGroupsChange,
    selectedDatasetCode,
    locale,
    onSelectDataset,
    rootGroupRefs,
    sectionRefs,
    datasetItemRefs,
  } = props;

  const renderDatasetListItem = (dataset: InsDataset, options?: { fullWidth?: boolean }) => {
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
          datasetItemRefs[dataset.code] = element;
        }}
        className={`group w-full rounded-md text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 ${
          isSelected ? 'bg-slate-100 dark:bg-slate-700' : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-700/60'
        }`}
        onClick={() => onSelectDataset(dataset.code)}
      >
        <div className={`flex items-start justify-between gap-2 ${isFullWidth ? 'px-3 py-3' : 'px-2.5 py-2.5'}`}>
          <div className="min-w-0">
            <div
              className={
                isFullWidth
                  ? 'line-clamp-1 text-[14px] font-semibold leading-6 tracking-[0.002em] text-slate-900 dark:text-slate-100'
                  : 'line-clamp-2 text-[13px] font-semibold leading-[1.35] tracking-[0.002em] text-slate-900 dark:text-slate-100'
              }
            >
              {datasetLabel}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                  isSelected ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {dataset.code}
              </span>
              {periodicityLabel && (
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{periodicityLabel}</span>
              )}
            </div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <Card className="flex h-[760px] flex-col border-slate-200/80 dark:border-slate-700/80 shadow-sm">
      <CardHeader className="space-y-3 px-4 pb-3 pt-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-[1.05rem] font-semibold tracking-[-0.01em] text-slate-900 dark:text-slate-100">
            <Trans>Dataset explorer</Trans>
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggleExplorerWidth}
            className="h-8 w-8 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
            aria-label={isExplorerFullWidth ? t`Collapse explorer to side panel` : t`Expand explorer to full width`}
            title={isExplorerFullWidth ? t`Collapse explorer to side panel` : t`Expand explorer to full width`}
          >
            {isExplorerFullWidth ? <PanelRightOpen className="h-4 w-4" aria-hidden="true" /> : <PanelRightClose className="h-4 w-4" aria-hidden="true" />}
          </Button>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            type="search"
            name="ins-dataset-search"
            aria-label={t`Search dataset code or name`}
            autoComplete="off"
            placeholder={t`Search dataset code or name`}
            className="h-10 w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 pl-9 text-sm shadow-sm"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 px-4 pb-4 pt-0">
        {isLoading ? (
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
              onValueChange={onOpenRootGroupsChange}
              className="w-full"
            >
              {groupedDatasets.map((group) => (
                <AccordionItem
                  key={group.code}
                  value={group.code}
                  className={
                    isExplorerFullWidth
                      ? 'rounded-none border-0 bg-transparent px-0'
                      : 'rounded-none border-x-0 border-t-0 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-1'
                  }
                  ref={(element) => {
                    rootGroupRefs[group.code] = element;
                  }}
                >
                  <AccordionTrigger
                    className={`items-start text-[13px] font-semibold tracking-[-0.005em] text-slate-800 dark:text-slate-200 hover:no-underline [&>svg]:-mt-0.5 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:self-start ${
                      isExplorerFullWidth ? 'border-b border-slate-200 dark:border-slate-700 px-2 py-3' : 'px-1 py-2.5'
                    }`}
                  >
                    <div className="flex w-full items-start justify-between gap-3 pr-2">
                      <div className="min-w-0 text-left">
                        <div className="line-clamp-1 font-semibold tracking-[-0.005em] text-slate-900 dark:text-slate-100">{group.label}</div>
                      </div>
                      <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 text-[11px] font-semibold tracking-[0.01em] text-slate-600 dark:text-slate-300">
                        {group.totalCount}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent
                    className={`pb-3 pt-1 ${isExplorerFullWidth ? 'space-y-4 px-2 pt-2' : 'space-y-3 px-0.5'}`}
                  >
                    {group.sections.map((section) => (
                      <div
                        key={`${group.code}-${section.code}`}
                        className={`space-y-2 ${isExplorerFullWidth ? 'px-1' : 'px-0.5'}`}
                        ref={(element) => {
                          sectionRefs[section.code] = element;
                        }}
                      >
                        <div className="flex items-center justify-between gap-3 px-0.5">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-600 dark:text-slate-300">
                            {section.label}
                          </span>
                          <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                            {section.datasets.length}
                          </span>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-700 overflow-hidden rounded-md bg-white dark:bg-slate-900">
                          {section.datasets.map((dataset) =>
                            renderDatasetListItem(dataset, { fullWidth: isExplorerFullWidth })
                          )}
                        </div>
                      </div>
                    ))}

                    {group.unsectionedDatasets.length > 0 && (
                      <div className={`space-y-2 ${isExplorerFullWidth ? 'px-1' : 'px-0.5'}`}>
                        <div className="flex items-center justify-between gap-3 px-0.5">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-600 dark:text-slate-300">
                            <Trans>Other datasets</Trans>
                          </span>
                          <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                            {group.unsectionedDatasets.length}
                          </span>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-700 overflow-hidden rounded-md bg-white dark:bg-slate-900">
                          {group.unsectionedDatasets.map((dataset) =>
                            renderDatasetListItem(dataset, { fullWidth: isExplorerFullWidth })
                          )}
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
  );
}

export const DatasetExplorerSection = memo(DatasetExplorerSectionBase);

type DatasetDetailsCardModel = {
  code: string;
  title: string;
  hierarchy: Array<{
    code: string;
    label: string;
    kind: 'home' | 'context' | 'dataset';
    rootCode: string;
  }>;
  rootContextCode: string;
  rootContextBreadcrumbLabel: string | null;
  contextLabel: string | null;
  periodicityLabel: string;
  yearRange: string | null;
  dimensionCount: string | null;
  definition: string | null;
  methodology: string | null;
  source: string | null;
  notes: string | null;
};

type ChartShortcutLink = {
  to: '/charts/$chartId';
  params: {
    chartId: string;
  };
  search: ChartUrlState;
};

type HistoryChartPoint = {
  period: string;
  numericValue: number | null;
  rawValue: string | null | undefined;
  statusLabel: string | null;
};

function DatasetDetailSectionBase(props: {
  selectedDatasetDetails: DatasetDetailsCardModel | null;
  selectedDatasetBreadcrumbItems: Array<{
    code: string;
    label: string;
    kind: 'home' | 'context' | 'dataset';
    rootCode: string;
  }>;
  selectedDataset: InsDataset | null;
  selectedDatasetCode: string | null;
  locale: 'ro' | 'en';
  hasDatasetMetadataPanel: boolean;
  isDatasetMetaExpanded: boolean;
  setIsDatasetMetaExpanded: Dispatch<SetStateAction<boolean>>;
  handleHierarchyNavigate: (item: { code: string; kind: 'home' | 'context' | 'dataset'; rootCode: string }) => void;
  datasetHistoryQuery: {
    isLoading: boolean;
    error: unknown;
    data: {
      partial?: boolean;
    } | undefined;
  };
  historySeries: InsObservation[];
  historyRows: InsObservation[];
  showAllRows: boolean;
  setShowAllRows: Dispatch<SetStateAction<boolean>>;
  isTemporalSplitIncompatible: boolean;
  availableTemporalOptions: Array<{ value: Exclude<TemporalSplit, 'all'>; label: string }>;
  temporalSplit: TemporalSplit;
  setTemporalSplit: Dispatch<SetStateAction<TemporalSplit>>;
  hasTemporalSelector: boolean;
  hasSeriesSelectors: boolean;
  handleResetSeriesSelection: () => void;
  selectableSeriesGroups: InsSeriesGroup[];
  effectiveSeriesSelection: Record<string, string[]>;
  seriesSelectorSearchByTypeCode: Record<string, string>;
  setSeriesSelectorSearchByTypeCode: Dispatch<SetStateAction<Record<string, string>>>;
  handleSeriesGroupSelectionChange: (typeCode: string, selectedCode: string, multiSelect: boolean) => void;
  historyUnitOptions: InsUnitOption[];
  effectiveUnitSelection: string | null;
  chartUnitLabel: string | null;
  handleUnitSelectionChange: (unitKey: string) => void;
  activeSeriesCriteriaParts: string[];
  historyChartData: HistoryChartPoint[];
  selectedDatasetSourceUrl: string | null;
  insTermsUrl: string;
  hasMultiValueSeriesSelection: boolean;
  chartShortcutLink: ChartShortcutLink | null;
}) {
  const {
    selectedDatasetDetails,
    selectedDatasetBreadcrumbItems,
    selectedDataset,
    selectedDatasetCode,
    locale,
    hasDatasetMetadataPanel,
    isDatasetMetaExpanded,
    setIsDatasetMetaExpanded,
    handleHierarchyNavigate,
    datasetHistoryQuery,
    historySeries,
    historyRows,
    showAllRows,
    setShowAllRows,
    isTemporalSplitIncompatible,
    availableTemporalOptions,
    temporalSplit,
    setTemporalSplit,
    hasTemporalSelector,
    hasSeriesSelectors,
    handleResetSeriesSelection,
    selectableSeriesGroups,
    effectiveSeriesSelection,
    seriesSelectorSearchByTypeCode,
    setSeriesSelectorSearchByTypeCode,
    handleSeriesGroupSelectionChange,
    historyUnitOptions,
    effectiveUnitSelection,
    chartUnitLabel,
    handleUnitSelectionChange,
    activeSeriesCriteriaParts,
    historyChartData,
    selectedDatasetSourceUrl,
    insTermsUrl,
    hasMultiValueSeriesSelection,
    chartShortcutLink,
  } = props;

  const renderHistoryTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: readonly unknown[];
    label?: string | number;
  }) => {
    if (!active || !payload || payload.length === 0) {
      return null;
    }

    const pointPayload = payload
      .map((item) => (typeof item === 'object' && item !== null ? (item as { payload?: HistoryChartPoint }).payload : null))
      .find((item) => Boolean(item));
    if (!pointPayload) {
      return null;
    }

    const periodLabel =
      typeof label === 'string' && label.trim() !== ''
        ? label
        : pointPayload.period || '—';
    const numericValue = pointPayload.numericValue;
    const hasNumericValue = typeof numericValue === 'number';
    const showFullValueLine = hasNumericValue && numericValue > 1000;

    let compactValueWithUnit = '—';
    let fullValueWithUnit = '—';

    if (hasNumericValue) {
      compactValueWithUnit = chartUnitLabel
        ? formatValueWithUnit(numericValue, chartUnitLabel, 'compact')
        : formatNumber(numericValue, 'compact');
      fullValueWithUnit = chartUnitLabel
        ? formatValueWithUnit(numericValue, chartUnitLabel, 'standard')
        : formatNumber(numericValue, 'standard');
    }

    return (
      <div style={CHART_TOOLTIP_STYLE} className="min-w-[220px] px-3 py-2.5">
        <div className="mb-2 text-[13px] font-semibold text-slate-900 dark:text-slate-100">{periodLabel}</div>
        <div className="space-y-1.5 text-[12px] leading-5">
          <div className="flex items-start justify-between gap-4">
            <span className="text-slate-500 dark:text-slate-400">{t`Value`}</span>
            <div className="text-right">
              <div className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">{compactValueWithUnit}</div>
              {showFullValueLine && (
                <div className="mt-0.5 text-[11px] tabular-nums text-slate-500 dark:text-slate-400">{fullValueWithUnit}</div>
              )}
            </div>
          </div>
          {pointPayload.statusLabel && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500 dark:text-slate-400">{t`Status`}</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{pointPayload.statusLabel}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="space-y-3 pb-4">
        {selectedDatasetDetails && selectedDatasetBreadcrumbItems.length > 0 && (
          <nav className="text-[12px] font-medium leading-5 tracking-[0.01em] text-slate-500 dark:text-slate-400">
            <div className="flex flex-wrap items-center gap-y-1">
              {selectedDatasetBreadcrumbItems.map((item, index) => {
                const isCurrent = index === selectedDatasetBreadcrumbItems.length - 1;
                const displayLabel =
                  item.kind === 'context' && item.code === selectedDatasetDetails?.rootContextCode
                    ? selectedDatasetDetails?.rootContextBreadcrumbLabel || item.label
                    : item.label;

                return (
                  <div key={`${item.code}-${index}`} className="flex items-center">
                    {index > 0 && <span className="mx-1.5 text-slate-400 dark:text-slate-500">/</span>}
                    {isCurrent ? (
                      <span
                        title={displayLabel}
                        className="max-w-[320px] truncate font-semibold tracking-[0.005em] text-slate-900 dark:text-slate-100"
                      >
                        {displayLabel}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleHierarchyNavigate(item)}
                        title={displayLabel}
                        className="max-w-[320px] truncate rounded-sm font-medium tracking-[0.005em] text-slate-500 dark:text-slate-400 underline-offset-2 transition-colors hover:text-slate-800 dark:hover:text-slate-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
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
            <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {selectedDatasetDetails?.title ||
                getLocalizedText(selectedDataset.name_ro, selectedDataset.name_en, locale) ||
                selectedDataset.code}
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {chartShortcutLink ? (
                <Link
                  to={chartShortcutLink.to}
                  params={chartShortcutLink.params}
                  search={chartShortcutLink.search}
                  preload="intent"
                  data-testid="ins-open-chart-shortcut"
                  title={t`Open in chart editor`}
                  aria-label={`${selectedDataset.code} - ${t`Open in chart editor`}`}
                  className="inline-flex items-center gap-1 rounded-sm px-1 py-0.5 text-xl font-semibold tracking-[-0.01em] text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                >
                  <span>{selectedDataset.code}</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              ) : (
                <span className="text-xl font-semibold tracking-[-0.01em] text-slate-700 dark:text-slate-300">{selectedDataset.code}</span>
              )}
              {hasDatasetMetadataPanel && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDatasetMetaExpanded((current) => !current)}
                  className="h-7 px-2 text-[12px] font-medium tracking-[0.01em] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  {isDatasetMetaExpanded ? t`Show less` : t`Show more`}
                </Button>
              )}
            </div>
          </div>
        ) : selectedDatasetCode !== null ? (
          <div className="space-y-1">
            <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{selectedDatasetCode}</div>
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
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 p-4">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                  <Trans>Code</Trans>
                </div>
                <div className="mt-0.5 text-[1.05rem] font-semibold tracking-[-0.005em] text-slate-900 dark:text-slate-100">
                  {selectedDatasetDetails.code}
                </div>
              </div>
              {selectedDatasetDetails.periodicityLabel && (
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                    <Trans>Periodicity</Trans>
                  </div>
                  <div className="mt-0.5 text-[1.05rem] font-semibold tracking-[-0.005em] text-slate-900 dark:text-slate-100">
                    {selectedDatasetDetails.periodicityLabel}
                  </div>
                </div>
              )}
              {selectedDatasetDetails.yearRange && (
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                    <Trans>Coverage</Trans>
                  </div>
                  <div className="mt-0.5 text-[1.05rem] font-semibold tracking-[-0.005em] text-slate-900 dark:text-slate-100">
                    {selectedDatasetDetails.yearRange}
                  </div>
                </div>
              )}
              {selectedDatasetDetails.dimensionCount && (
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                    <Trans>Dimensions</Trans>
                  </div>
                  <div className="mt-0.5 text-[1.05rem] font-semibold tracking-[-0.005em] text-slate-900 dark:text-slate-100">
                    {selectedDatasetDetails.dimensionCount}
                  </div>
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
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
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
              <div className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 px-3 py-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-slate-500 dark:text-slate-400">
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
                        ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800'
                        : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            )}

            {hasSeriesSelectors && (
              <div className="space-y-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[12px] font-semibold uppercase tracking-[0.06em] text-slate-600 dark:text-slate-300">
                    <Trans>Series selector</Trans>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetSeriesSelection}
                    className="h-7 px-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    <Trans>Reset to default</Trans>
                  </Button>
                </div>

                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {selectableSeriesGroups.map((group) => {
                    const selectedCodes = effectiveSeriesSelection[group.typeCode] ?? [];
                    const selectedCodeSet = new Set(selectedCodes);
                    const selectedOptions = group.options.filter((option) => selectedCodeSet.has(option.code));
                    const selectorSearchTerm = seriesSelectorSearchByTypeCode[group.typeCode] ?? '';
                    const shouldShowSelectorSearch = group.options.length > 10;
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
                        <label className="text-[11px] font-semibold uppercase tracking-[0.05em] text-slate-500 dark:text-slate-400">
                          {group.typeLabel}
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className="h-9 w-full justify-between border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 text-[13px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                              <span className="truncate text-left">{triggerLabel}</span>
                              <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-[min(420px,92vw)] border-slate-200 dark:border-slate-700 p-2">
                            <div className="mb-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                              <Trans>Hold Ctrl/Cmd or Shift while clicking to multi-select.</Trans>
                            </div>

                            {shouldShowSelectorSearch && (
                              <div className="relative mb-2">
                                <Search className="pointer-events-none absolute left-2 top-2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                                <Input
                                  value={selectorSearchTerm}
                                  onChange={(event) =>
                                    setSeriesSelectorSearchByTypeCode((current) => ({
                                      ...current,
                                      [group.typeCode]: event.target.value,
                                    }))
                                  }
                                  type="search"
                                  name={`series-search-${group.typeCode}`}
                                  aria-label={t`Search options in ${group.typeLabel}`}
                                  autoComplete="off"
                                  placeholder={t`Search series options`}
                                  className="h-8 rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 pl-7 text-[12px]"
                                />
                              </div>
                            )}

                            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                              {shouldShowSelectorSearch ? (
                                <>
                                  {selectedOptions.length > 0 && (
                                    <div className="space-y-1">
                                      <div className="px-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500 dark:text-slate-400">
                                        <Trans>Selected</Trans>
                                      </div>
                                      <div className="flex flex-wrap gap-1">
                                        {selectedOptions.map((option) => (
                                          <button
                                            type="button"
                                            key={`${group.typeCode}-${option.code}-selected`}
                                            onClick={() =>
                                              handleSeriesGroupSelectionChange(group.typeCode, option.code, true)
                                            }
                                            className="inline-flex items-center gap-1 rounded-full bg-slate-900 dark:bg-slate-100 px-2 py-1 text-[11px] font-medium text-white dark:text-slate-900 transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
                                          >
                                            <Check className="h-3 w-3" aria-hidden="true" />
                                            <span className="max-w-[180px] truncate">{option.label}</span>
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  <div className="space-y-1">
                                    <div className="px-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500 dark:text-slate-400">
                                      <Trans>Options</Trans>
                                    </div>
                                    {filteredOptions.map((option) => {
                                      const isSelected = selectedCodeSet.has(option.code);
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
                                          className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 ${
                                            isSelected
                                              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                          }`}
                                        >
                                          <span className="text-[12px] font-medium leading-5">{option.label}</span>
                                          {isSelected && <Check className="ml-2 h-4 w-4 shrink-0" aria-hidden="true" />}
                                        </button>
                                      );
                                    })}
                                    {filteredOptions.length === 0 && (
                                      <div className="rounded-md border border-dashed border-slate-200 dark:border-slate-700 px-2 py-2 text-[12px] text-slate-500 dark:text-slate-400">
                                        <Trans>No options match your search.</Trans>
                                      </div>
                                    )}
                                  </div>
                                </>
                              ) : (
                                group.options.map((option) => {
                                  const isSelected = selectedCodeSet.has(option.code);

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
                                      className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 ${
                                        isSelected
                                          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                      }`}
                                    >
                                      <span className="text-[12px] font-medium leading-5">{option.label}</span>
                                      {isSelected && <Check className="ml-2 h-4 w-4 shrink-0" aria-hidden="true" />}
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
                        className="text-[11px] font-semibold uppercase tracking-[0.05em] text-slate-500 dark:text-slate-400"
                      >
                        <Trans>Unit</Trans>
                      </label>
                      <select
                        id="series-selector-unit"
                        value={effectiveUnitSelection ?? ''}
                        onChange={(event) => handleUnitSelectionChange(event.target.value)}
                        className="h-9 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 text-[13px] font-medium text-slate-700 dark:text-slate-300 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
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
              <div className="text-[12px] leading-5 text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-slate-700 dark:text-slate-300"><Trans>Active series criteria:</Trans></span>{' '}
                {activeSeriesCriteriaParts.join(' • ')}
              </div>
            )}

            <div className="h-72 w-full">
              <SafeResponsiveContainer width="100%" height="100%">
                <ComposedChart data={historyChartData} margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id={CHART_AREA_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_AREA_TOP_COLOR} stopOpacity={0.55} />
                      <stop offset="15%" stopColor={CHART_AREA_UPPER_COLOR} stopOpacity={0.42} />
                      <stop offset="45%" stopColor={CHART_AREA_MID_COLOR} stopOpacity={0.22} />
                      <stop offset="75%" stopColor={CHART_AREA_LOWER_COLOR} stopOpacity={0.1} />
                      <stop offset="100%" stopColor={CHART_AREA_BOTTOM_COLOR} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={CHART_GRID_COLOR} strokeDasharray="4 5" vertical={false} />
                  <XAxis
                    dataKey="period"
                    minTickGap={24}
                    stroke={CHART_AXIS_COLOR}
                    tick={{ fill: CHART_AXIS_COLOR, fontSize: 12 }}
                    axisLine={{ stroke: CHART_GRID_COLOR }}
                    tickLine={{ stroke: CHART_GRID_COLOR }}
                  />
                  <YAxis
                    stroke={CHART_AXIS_COLOR}
                    tick={{ fill: CHART_AXIS_COLOR, fontSize: 12 }}
                    axisLine={{ stroke: CHART_GRID_COLOR }}
                    tickLine={{ stroke: CHART_GRID_COLOR }}
                  />
                  <Tooltip
                    cursor={{ stroke: CHART_LINE_HIGHLIGHT_COLOR, strokeWidth: 1, strokeDasharray: '3 3' }}
                    content={renderHistoryTooltip}
                  />
                  <Area
                    type="monotone"
                    dataKey="numericValue"
                    stroke="none"
                    fill={`url(#${CHART_AREA_GRADIENT_ID})`}
                  />
                  <Line
                    type="monotone"
                    dataKey="numericValue"
                    stroke={CHART_LINE_COLOR}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    dot={false}
                    activeDot={{
                      r: 4,
                      fill: CHART_LINE_HIGHLIGHT_COLOR,
                      stroke: CHART_DOT_STROKE_COLOR,
                      strokeWidth: 2,
                    }}
                  />
                  <Brush dataKey="period" height={20} stroke={CHART_AXIS_COLOR} fill={CHART_BRUSH_FILL} travellerWidth={9} />
                </ComposedChart>
              </SafeResponsiveContainer>
            </div>
            {selectedDatasetSourceUrl && (
              <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-[12px] leading-5 text-slate-600 dark:text-slate-300">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <a
                    href={selectedDatasetSourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 underline-offset-2 hover:text-slate-950 dark:hover:text-slate-100 hover:underline"
                  >
                    <Trans>Open source matrix in INS Tempo</Trans>
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                  <span className="text-slate-400 dark:text-slate-500">•</span>
                  <span>
                    <Trans>
                      Data is sourced from INS Tempo. Reuse and redistribution are subject to INS terms and license.
                    </Trans>{' '}
                    <a
                      href={insTermsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-slate-700 dark:text-slate-300 underline underline-offset-2 hover:text-slate-900 dark:hover:text-slate-100"
                    >
                      <Trans>INS terms</Trans>
                    </a>
                  </span>
                </div>
              </div>
            )}

            {datasetHistoryQuery.data?.partial && (
              <Alert>
                <Info className="h-4 w-4" aria-hidden="true" />
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
                  <TableHead className="w-32 text-[12px] font-semibold tracking-[0.02em] text-slate-500 dark:text-slate-400">
                    <Trans>Period</Trans>
                  </TableHead>
                  <TableHead className="text-[12px] font-semibold tracking-[0.02em] text-slate-500 dark:text-slate-400">
                    <Trans>Value</Trans>
                  </TableHead>
                  <TableHead className="text-right text-[12px] font-semibold tracking-[0.02em] text-slate-500 dark:text-slate-400">
                    <Trans>Details</Trans>
                  </TableHead>
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
                          <span className={statusLabel ? 'text-muted-foreground' : 'font-medium tracking-[0.005em]'}>
                            {value}
                          </span>
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
  );
}

export const DatasetDetailSection = memo(DatasetDetailSectionBase);
