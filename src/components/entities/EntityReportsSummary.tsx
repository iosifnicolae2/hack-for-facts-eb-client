import { useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { Trans } from '@lingui/react/macro';
import { ArrowRight, FileText } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useReportsConnection } from '@/lib/hooks/useEntityDetails';
import { type ReportPeriodInput, type GqlReportType } from '@/schemas/reporting';
import { EntityReportCard } from './EntityReportCard';

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
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-4">
          {nodes.map((report) => (
            <EntityReportCard key={report.report_id} report={report} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
