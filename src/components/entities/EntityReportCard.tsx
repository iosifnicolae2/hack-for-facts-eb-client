import { Link } from '@tanstack/react-router';
import { Trans } from '@lingui/react/macro';
import { CalendarCheck, Download, FileText, Landmark, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toReportTypeValue, type GqlReportType } from '@/schemas/reporting';
import { getUserLocale } from '@/lib/utils';

type EntityReportCardProps = {
  readonly report: {
    readonly report_id: string;
    readonly report_date: string;
    readonly report_type: string;
    readonly download_links: readonly string[];
    readonly main_creditor: {
      readonly cui: string;
      readonly name: string;
    };
    readonly budgetSector?: {
      readonly sector_id: string;
      readonly sector_description: string;
    } | null;
  };
};

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

export function EntityReportCard({ report }: EntityReportCardProps) {
  const locale = getUserLocale();

  return (
    <div
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

        {report.budgetSector && (
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
        )}
      </div>
    </div>
  );
}
