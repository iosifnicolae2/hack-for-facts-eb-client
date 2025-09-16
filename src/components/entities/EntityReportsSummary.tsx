import { useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { Trans } from '@lingui/react/macro';
import { Calendar, Download, FileText, Landmark } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useReportsConnection } from '@/lib/hooks/useEntityDetails';
import { toReportTypeValue, type ReportPeriodInput, type GqlReportType } from '@/schemas/reporting';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type Props = {
  readonly cui: string;
  readonly trendPeriod: ReportPeriodInput;
  readonly reportType: GqlReportType;
  readonly limit?: number;
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
  if (/^\d{4}$/.test(anchor)) return `${anchor}-01-01`;
  if (/^\d{4}-(0[1-9]|1[0-2])$/.test(anchor)) {
    const [y, m] = anchor.split('-');
    return isStart ? `${y}-${m}-01` : `${y}-${m}-${daysInMonth(Number(m), Number(y))}`;
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

export function EntityReportsSummary({ cui, trendPeriod, reportType, limit = 12 }: Props) {
  const { start, end } = useMemo(() => toDateRange(trendPeriod), [trendPeriod]);
  const { data, isLoading } = useReportsConnection({
    filter: { entity_cui: cui, report_type: reportType, report_date_start: start, report_date_end: end },
    limit,
    offset: 0,
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <Trans>Financial Reports</Trans>
        </CardTitle>
        <div className="mt-4 text-sm text-muted-foreground"><Trans>Loading reports…</Trans></div>
      </Card>
    );
  }

  const nodes = data?.nodes ?? [];
  if (nodes.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <Trans>Financial Reports</Trans>
          </CardTitle>
          <Button asChild variant="secondary" size="sm">
            <Link to="/entities/$cui" params={{ cui }} search={{ view: 'reports', report_type: reportType }}>
              <Trans>View all reports</Trans>
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="border-t">
          {nodes.map((report) => (
            <div key={report.report_id} className="grid grid-cols-12 gap-4 items-center py-3 border-b last:border-b-0">
              <div className="col-span-3 lg:col-span-2 flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="font-semibold">{report.reporting_year}</p>
                  <p className="text-sm text-muted-foreground whitespace-nowrap">{formatDate(report.report_date)}</p>
                </div>
              </div>
              <div className="col-span-9 lg:col-span-4">
                <Badge variant="outline" className="truncate leading-tight text-xs">{toReportTypeValue(report.report_type as GqlReportType)}</Badge>
              </div>
              <div className="col-span-12 lg:col-span-4 flex items-center gap-2 truncate">
                <Landmark className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <Link to="/entities/$cui" params={{ cui: report.main_creditor.cui }} className="text-sm font-medium underline-offset-2 hover:underline truncate" title={report.main_creditor.name}>
                  {report.main_creditor.name}
                </Link>
              </div>
              <div className="col-span-12 lg:col-span-2 flex justify-start lg:justify-end gap-0">
                <TooltipProvider>
                  {report.download_links.map((link, i) => {
                    const fileType = link.split('.').pop()?.toUpperCase() ?? 'File';
                    return (
                      <Tooltip key={link}>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={link} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                              <span className="text-xs whitespace-nowrap">{fileType}</span>
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


