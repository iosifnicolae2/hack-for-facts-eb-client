import { useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { Trans } from '@lingui/react/macro';
import { CalendarCheck, Download, FileText, Landmark, Wallet } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useReportsConnection } from '@/lib/hooks/useEntityDetails';
import { toReportTypeValue, type ReportPeriodInput, type GqlReportType } from '@/schemas/reporting';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getUserLocale } from '@/lib/utils';

type Props = {
  readonly cui: string;
  readonly reportPeriod: ReportPeriodInput;
  readonly reportType: GqlReportType;
  readonly limit?: number;
  readonly mainCreditorCui?: string;
};

function toDateRange(period: ReportPeriodInput): { start: string; end: string } {
  const selection = period.selection;
  if ('interval' in selection && selection.interval) {
    const { start, end } = selection.interval;
    const startDate = anchorToDate(start, true);
    const endDate = anchorToDate(end, false);
    return { start: startDate, end: endDate };
  }
  const first = selection.dates?.[0];
  const last = selection.dates?.[selection.dates.length - 1];
  return { start: anchorToDate(first ?? ''), end: anchorToDate(last ?? '') };
}

function anchorToDate(anchor: string, isStart = true): string {
  // Accepts 'YYYY', 'YYYY-MM', 'YYYY-Qx'
  if (!anchor) return '';
  if (/^\d{4}$/.test(anchor)) {
    if (isStart) {
      return `${anchor}-01-01`;
    } else {
      return `${anchor}-12-31`;
    }
  }
  if (/^\d{4}-(0[1-9]|1[0-2])$/.test(anchor)) {
    const [y, m] = anchor.split('-');
    const lastMonthDay = daysInMonth(Number(m), Number(y));
    return isStart ? `${y}-${m}-01` : `${y}-${m}-${lastMonthDay}`;
  }
  if (/^\d{4}-Q[1-4]$/.test(anchor)) {
    const y = Number(anchor.slice(0, 4));
    const q = anchor.slice(5) as 'Q1' | 'Q2' | 'Q3' | 'Q4';
    const startMonth = q === 'Q1' ? '01' : q === 'Q2' ? '04' : q === 'Q3' ? '07' : '10';
    const endMonth = q === 'Q1' ? '03' : q === 'Q2' ? '06' : q === 'Q3' ? '09' : '12';
    return isStart ? `${y}-${startMonth}-01` : `${y}-${endMonth}-${daysInMonth(Number(endMonth), y)}`;
  }
  return anchor;
}

function daysInMonth(month: number | string, year: number): string {
  const m = typeof month === 'string' ? Number(month) : month;
  return String(new Date(year, m, 0).getDate()).padStart(2, '0');
}

function formatDate(dateString: string, locale?: string) {
  const n = Number(dateString);
  const date = Number.isFinite(n) ? new Date(n) : new Date(dateString);
  return date.toLocaleDateString(locale || 'ro-RO', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatMonthYear(dateString: string, locale?: string) {
  const n = Number(dateString);
  const date = Number.isFinite(n) ? new Date(n) : new Date(dateString);
  if (isNaN(date.getTime())) {
    return dateString;
  }
  const month = date.toLocaleDateString(locale || 'ro-RO', { month: 'long' });
  const year = date.getFullYear();
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
  return `${capitalizedMonth} ${year}`;
}

export function EntityReportsSummary({ cui, reportPeriod, reportType, limit = 12, mainCreditorCui }: Props) {
  const { start, end } = useMemo(() => toDateRange(reportPeriod), [reportPeriod]);
  const locale = getUserLocale();
  const { data, isLoading } = useReportsConnection({
    filter: { entity_cui: cui, report_type: reportType, report_date_start: start, report_date_end: end, main_creditor_cui: mainCreditorCui },
    limit,
    offset: 0,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <Trans>Financial Reports</Trans>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-sm text-muted-foreground"><Trans>Loading reports…</Trans></div>
        </CardContent>
      </Card>
    );
  }

  const nodes = data?.nodes ?? [];
  if (nodes.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <Trans>Financial Reports</Trans>
          </CardTitle>
          <Button asChild variant="secondary" size="sm" className="w-full sm:w-auto">
            <Link to="/entities/$cui" params={{ cui }} search={{ view: 'reports', report_type: reportType }}>
              <Trans>View all reports</Trans>
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-4">
          {nodes.map((report) => {
            return (
              <div
                key={report.report_id}
                className="group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-200 hover:border-border hover:shadow-md"
              >
                {/* Header: Date and Downloads */}
                <div className="flex flex-col gap-4 border-b border-border/40 bg-muted/30 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <CalendarCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-base font-semibold leading-tight">{formatMonthYear(report.report_date, locale)}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(report.report_date, locale)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:mb-0 sm:sr-only">
                      <Trans>Download</Trans>
                    </p>
                    <div className="flex flex-wrap gap-1.5 sm:justify-end">
                      <TooltipProvider>
                        {report.download_links.map((link) => {
                          const fileType = link.split('.').pop()?.toUpperCase() ?? 'File';
                          return (
                            <Tooltip key={link}>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                  className="h-8 w-20 gap-1.5 rounded-full border-border/60 px-3 text-xs font-medium transition-colors hover:border-border hover:bg-secondary sm:w-auto"
                                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                >
                                  <a href={link} target="_blank" rel="noopener noreferrer">
                                    <Download className="h-3.5 w-3.5" />
                                    {fileType}
                                    <span className="sr-only">Download {fileType}</span>
                                  </a>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="rounded-lg">Download {fileType}</TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </TooltipProvider>
                    </div>
                  </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 lg:grid-cols-3">
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Landmark className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <Trans>Reporting entity</Trans>
                      </p>
                      <Link
                        to="/entities/$cui"
                        params={{ cui: report.main_creditor.cui }}
                        className="text-sm font-semibold leading-snug text-foreground transition-colors hover:text-primary hover:underline"
                        title={report.main_creditor.name}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {report.main_creditor.name}
                      </Link>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <Trans>Report Type</Trans>
                      </p>
                      <p className="text-sm font-semibold leading-snug text-foreground">
                        {toReportTypeValue(report.report_type as GqlReportType)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Wallet className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <Trans>Budget Sector</Trans>
                      </p>
                      <p className="text-sm font-semibold leading-snug text-foreground">
                        {report.budgetSector.sector_description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
