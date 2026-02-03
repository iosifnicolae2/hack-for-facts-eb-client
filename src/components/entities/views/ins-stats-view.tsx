import { useMemo, useState } from 'react';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { AlertTriangle, Info } from 'lucide-react';

import type { EntityDetailsData } from '@/lib/api/entities';
import type { InsObservation, InsUatDatasetGroup, InsPeriodicity } from '@/schemas/ins';
import { formatNumber, formatValueWithUnit } from '@/lib/utils';
import {
  buildInsDashboardSections,
  buildInsCountyDashboardSections,
  collectInsDatasetCodes,
  INS_SUMMARY_METRICS,
  INS_COUNTY_SUMMARY_METRICS,
} from '@/lib/ins/ins-dashboard-config';
import { useInsCountyDashboard, useInsUatDashboard } from '@/lib/hooks/use-ins-dashboard';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

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

function getClassificationLabel(observation: InsObservation): string {
  const labels = observation.classifications
    ?.map((item) => item.name_ro || item.code)
    .filter(Boolean) as string[] | undefined;

  if (!labels || labels.length === 0) return t`Total`;
  return labels.join(' • ');
}

function getObservationScore(observation: InsObservation): number {
  const classificationCount = observation.classifications?.length ?? 0;
  const statusPenalty = observation.value_status ? -50 : 0;
  const labels = getClassificationLabel(observation).toLowerCase();

  let score = 0;
  score -= classificationCount * 10;
  if (labels.includes('total')) score += 25;
  if (labels.includes('ambele')) score += 5;
  if (labels.includes('total general')) score += 10;

  return score + statusPenalty;
}

function pickRepresentativeObservation(observations: InsObservation[]): InsObservation | undefined {
  if (observations.length === 0) return undefined;
  const sorted = [...observations].sort((a, b) => getObservationScore(b) - getObservationScore(a));
  return sorted[0];
}

function pickLatestObservation(observations: InsObservation[]): InsObservation | undefined {
  if (observations.length === 0) return undefined;
  const byPeriod = new Map<string, InsObservation[]>();

  for (const observation of observations) {
    const periodKey = observation.time_period?.iso_period;
    if (!periodKey) continue;
    const existing = byPeriod.get(periodKey);
    if (existing) {
      existing.push(observation);
    } else {
      byPeriod.set(periodKey, [observation]);
    }
  }

  const periods = Array.from(byPeriod.values())
    .map((group) => pickRepresentativeObservation(group))
    .filter(Boolean) as InsObservation[];

  const sorted = periods.sort((a, b) => {
    const aKey = a.time_period.year * 10000 + (a.time_period.quarter ?? 0) * 100 + (a.time_period.month ?? 0);
    const bKey = b.time_period.year * 10000 + (b.time_period.quarter ?? 0) * 100 + (b.time_period.month ?? 0);
    return bKey - aKey;
  });

  return sorted[0];
}

function buildObservationSeries(observations: InsObservation[]): InsObservation[] {
  const byPeriod = new Map<string, InsObservation[]>();

  for (const observation of observations) {
    const periodKey = observation.time_period?.iso_period;
    if (!periodKey) continue;
    const existing = byPeriod.get(periodKey);
    if (existing) {
      existing.push(observation);
    } else {
      byPeriod.set(periodKey, [observation]);
    }
  }

  const series = Array.from(byPeriod.values())
    .map((group) => pickRepresentativeObservation(group))
    .filter(Boolean) as InsObservation[];

  return series.sort((a, b) => {
    const aKey = a.time_period.year * 10000 + (a.time_period.quarter ?? 0) * 100 + (a.time_period.month ?? 0);
    const bKey = b.time_period.year * 10000 + (b.time_period.quarter ?? 0) * 100 + (b.time_period.month ?? 0);
    return bKey - aKey;
  });
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

function InsObservationTable({ observations }: { observations: InsObservation[] }) {
  const [showAll, setShowAll] = useState(false);
  const series = useMemo(() => buildObservationSeries(observations), [observations]);
  const visibleRows = showAll ? series : series.slice(0, 8);

  if (series.length === 0) {
    return (
      <div className="py-4 text-sm text-muted-foreground">
        <Trans>No observations available for this indicator.</Trans>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Table className="text-sm">
        <TableHeader>
          <TableRow>
            <TableHead className="w-32"><Trans>Period</Trans></TableHead>
            <TableHead><Trans>Value</Trans></TableHead>
            <TableHead className="text-right"><Trans>Details</Trans></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleRows.map((row) => {
            const { value, statusLabel } = formatObservationValue(row);
            return (
              <TableRow key={`${row.dataset_code}-${row.time_period.iso_period}-${row.value}`}
                className="text-xs sm:text-sm">
                <TableCell className="font-medium">{formatPeriodLabel(row.time_period)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={statusLabel ? 'text-muted-foreground' : 'font-semibold'}>{value}</span>
                    {statusLabel && (
                      <Badge variant="outline" className="text-[10px]">
                        {statusLabel}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {getClassificationLabel(row)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {series.length > 8 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAll((prev) => !prev)}
        >
          {showAll ? t`Show less` : t`Show all periods`}
        </Button>
      )}
    </div>
  );
}

export function InsStatsView({ entity }: { entity: EntityDetailsData | null | undefined }) {
  const entityType = entity?.entity_type ?? '';
  const isCounty = entityType === 'admin_county_council';
  const isCommune = entityType.includes('commune');
  const isTown = entityType.includes('town');
  const isMunicipality = entityType.includes('municipality');
  const isSector = entityType.includes('sector');

  const includeAgriculture = isCounty || isCommune || isTown;
  const includeCulture = isCounty || isMunicipality || isTown || isSector;

  const sections = useMemo(() => {
    if (isCounty) return buildInsCountyDashboardSections();
    return buildInsDashboardSections({ includeAgriculture, includeCulture });
  }, [isCounty, includeAgriculture, includeCulture]);

  const datasetCodes = useMemo(() => collectInsDatasetCodes(sections), [sections]);

  const sirutaCode = entity?.uat?.siruta_code != null ? String(entity.uat.siruta_code) : '';
  const countyCode = entity?.uat?.county_code ?? '';

  const uatDashboard = useInsUatDashboard({
    sirutaCode,
    enabled: !isCounty && !!sirutaCode,
  });

  const countyDashboard = useInsCountyDashboard({
    countyCode,
    datasetCodes,
    enabled: isCounty && countyCode.trim().length > 0,
  });

  const dashboardData = isCounty ? countyDashboard.data : uatDashboard.data;
  const isLoading = isCounty ? countyDashboard.isLoading : uatDashboard.isLoading;
  const error = isCounty ? countyDashboard.error : uatDashboard.error;

  const filteredGroups = useMemo(() => {
    if (!dashboardData) return [] as InsUatDatasetGroup[];
    const codeSet = new Set(datasetCodes);
    return dashboardData.groups.filter((group) => codeSet.has(group.dataset.code));
  }, [dashboardData, datasetCodes]);

  const datasetGroupMap = useMemo(() => {
    return new Map(filteredGroups.map((group) => [group.dataset.code, group]));
  }, [filteredGroups]);

  const sectionsWithData = useMemo(() => {
    return sections.map((section) => {
      const groups = section.datasetCodes
        .map((code) => datasetGroupMap.get(code))
        .filter(Boolean) as InsUatDatasetGroup[];
      const missingCount = section.datasetCodes.length - groups.length;
      return { ...section, groups, missingCount };
    });
  }, [sections, datasetGroupMap]);

  const summaryCards = useMemo(() => {
    const metrics = isCounty ? INS_COUNTY_SUMMARY_METRICS : INS_SUMMARY_METRICS;
    return metrics.map((metric) => {
      const group = datasetGroupMap.get(metric.code);
      if (!group) return null;
      const latestObservation = pickLatestObservation(group.observations);
      return {
        code: metric.code,
        label: metric.label,
        datasetName: group.dataset.name_ro || group.dataset.name_en || metric.code,
        observation: latestObservation,
      };
    }).filter((card) => card !== null);
  }, [datasetGroupMap, isCounty]);

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

  if (isCounty && countyCode.trim().length === 0) {
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

  if (!isCounty && !sirutaCode) {
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

  if (error instanceof Error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle><Trans>Could not load INS data</Trans></AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200/60 bg-gradient-to-br from-white via-white to-slate-50">
        <CardHeader className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">INS Tempo</Badge>
            <Badge variant="outline">
              {isCounty ? t`County level` : t`Locality level`}
            </Badge>
          </div>
          <CardTitle className="text-2xl"><Trans>Local statistics for citizens</Trans></CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            {isCounty ? (
              <Trans>
                Indicators come from INS Tempo and show community evolution over time. Values are
                the most recent available for this county.
              </Trans>
            ) : (
              <Trans>
                Indicators come from INS Tempo and show community evolution over time. Values are
                the most recent available for this locality.
              </Trans>
            )}
          </p>
          {entity?.uat?.county_name && (
            <p>
              <Trans>County:</Trans> <span className="font-medium text-foreground">{entity.uat.county_name}</span>
            </p>
          )}
        </CardContent>
      </Card>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="space-y-3 p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-20" />
            </Card>
          ))}
        </div>
      )}

      {!isLoading && summaryCards.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((metric) => {
            const observation = metric.observation;
            const valueLabel = observation ? formatObservationValue(observation) : { value: t`N/A` };
            const periodLabel = observation ? formatPeriodLabel(observation.time_period) : t`Unknown`;

            return (
              <Card key={metric.code}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-2xl font-semibold text-foreground flex items-center gap-2">
                    <span>{valueLabel.value}</span>
                    {valueLabel.statusLabel && (
                      <Badge variant="outline" className="text-[10px]">
                        {valueLabel.statusLabel}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {metric.datasetName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <Trans>Last period:</Trans> {periodLabel}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {dashboardData?.partial && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle><Trans>Partial data</Trans></AlertTitle>
          <AlertDescription>
            <Trans>
              Some datasets have more observations than the current limit. We display the most
              recent available periods.
            </Trans>
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && sectionsWithData.map((section) => (
        <Card key={section.id}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg">{section.label}</CardTitle>
            {section.description && (
              <p className="text-sm text-muted-foreground">{section.description}</p>
            )}
            {section.missingCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {isCounty ? (
                  <Trans>Some indicators have no data available for this county.</Trans>
                ) : (
                  <Trans>Some indicators have no data available for this locality.</Trans>
                )}
              </p>
            )}
          </CardHeader>
          <CardContent>
            {section.groups.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                <Trans>No INS data for this section.</Trans>
              </div>
            ) : (
              <Accordion type="multiple" className="w-full">
                {section.groups.map((group) => {
                  const latestObservation = pickLatestObservation(group.observations);
                  const datasetName = group.dataset.name_ro || group.dataset.name_en || group.dataset.code;
                  const periodicityLabel = group.dataset.periodicity
                    ?.map((periodicity) => PERIODICITY_LABELS[periodicity] ?? periodicity)
                    .join(', ');
                  const valueLabel = latestObservation
                    ? formatObservationValue(latestObservation)
                    : { value: t`N/A` };
                  const periodLabel = latestObservation
                    ? formatPeriodLabel(latestObservation.time_period)
                    : t`Unknown`;

                  return (
                    <AccordionItem key={group.dataset.code} value={group.dataset.code}>
                      <AccordionTrigger className="py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
                          <div>
                            <div className="font-semibold text-foreground">{datasetName}</div>
                            <div className="text-xs text-muted-foreground">
                              {group.dataset.code}
                              {periodicityLabel ? ` • ${periodicityLabel}` : ''}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-lg font-semibold text-foreground">{valueLabel.value}</span>
                              {valueLabel.statusLabel && (
                                <Badge variant="outline" className="text-[10px]">
                                  {valueLabel.statusLabel}
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">{periodLabel}</div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4">
                        <InsObservationTable observations={group.observations} />
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
