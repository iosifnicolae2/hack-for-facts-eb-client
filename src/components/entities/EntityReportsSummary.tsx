import { useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { Trans } from '@lingui/react/macro';
import { Calendar, Download, FileText, Landmark } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useReportsConnection } from '@/lib/hooks/useEntityDetails';
import { toReportTypeValue, type ReportPeriodInput, type GqlReportType } from '@/schemas/reporting';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '../ui/badge';

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

function formatDate(dateString: string) {
  const n = Number(dateString);
  const date = Number.isFinite(n) ? new Date(n) : new Date(dateString);
  return date.toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function EntityReportsSummary({ cui, reportPeriod, reportType, limit = 12, mainCreditorCui }: Props) {
  const { start, end } = useMemo(() => toDateRange(reportPeriod), [reportPeriod]);
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
                className="rounded-xl border bg-muted/40 p-4 sm:p-5"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-background p-2 text-muted-foreground shadow-sm">
                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-semibold leading-tight sm:text-lg">{report.reporting_year}</p>
                        <p className="text-sm text-muted-foreground leading-tight">{formatDate(report.report_date)}</p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-semibold tracking-wide text-foreground shadow-sm hover:bg-transparent"
                    >
                      {toReportTypeValue(report.report_type as GqlReportType)}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="flex items-start gap-2 text-sm">
                      <Landmark className="mt-0.5 h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
                      <div className="flex flex-col">
                        <span className="text-xs uppercase text-muted-foreground">
                          <Trans>Reporting entity</Trans>
                        </span>
                        <Link
                          to="/entities/$cui"
                          params={{ cui: report.main_creditor.cui }}
                          className="text-sm font-medium underline-offset-2 hover:underline leading-tight"
                          title={report.main_creditor.name}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {report.main_creditor.name}
                        </Link>
                      </div>
                    </div>
                    <div className="sm:text-right">
                      <span className="text-xs font-medium uppercase text-muted-foreground">
                        <Trans>Download</Trans>
                      </span>
                      <div className="mt-2 flex flex-wrap gap-2 sm:justify-end">
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
                                    className="flex items-center gap-1 rounded-full px-3 py-1 text-xs"
                                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                  >
                                    <a href={link} target="_blank" rel="noopener noreferrer">
                                      <Download className="h-3 w-3" />
                                      {fileType}
                                      <span className="sr-only">Download {fileType}</span>
                                    </a>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Download {fileType}</TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </TooltipProvider>
                      </div>
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
