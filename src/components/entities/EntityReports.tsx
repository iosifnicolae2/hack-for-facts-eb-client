import { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { Link } from '@tanstack/react-router';
import { Filter, ArrowLeft, X } from 'lucide-react';
import { useEntityReports } from '@/lib/hooks/useEntityDetails';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { GqlReportType, toReportTypeValue } from '@/schemas/reporting';
import { ResponsivePopover } from '@/components/ui/ResponsivePopover';
import { Pagination } from '@/components/ui/pagination';
import { EntityReportCard } from './EntityReportCard';
import { Separator } from '@/components/ui/separator';

type EntityReportsProps = {
  readonly cui: string;
  readonly initialType?: GqlReportType;
};

export default function EntityReports({ cui, initialType }: EntityReportsProps) {
  const [year, setYear] = useState<number | undefined>(undefined);
  const [type, setType] = useState<GqlReportType | undefined>(initialType);
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

  const offset = (page - 1) * pageSize;

  const { data, isLoading } = useEntityReports({
    cui,
    limit: pageSize,
    offset,
    year,
    type,
    sort: { by: 'report_date', order: sortOrder },
    // period is optional; we use date range via global filter route for advanced mode
    enabled: !!cui,
  });

  const rows = data?.nodes ?? [];
  const total = data?.pageInfo?.totalCount ?? rows.length;
  const filteredRows = rows;

  const hasActiveFilters = type !== undefined || year !== undefined;
  const activeFilterCount = [type, year].filter(Boolean).length;

  const clearFilters = () => {
    setType(undefined);
    setYear(undefined);
    setPage(1);
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-4 pb-6">
        {/* Top Row: Title and Back Link */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-baseline gap-2">
                <CardTitle className="text-2xl font-bold">
                  <Trans>Financial Reports</Trans>
                </CardTitle>
                {!isLoading && (
                  <span className="text-sm font-medium text-muted-foreground">
                    {total}
                  </span>
                )}
              </div>
              <CardDescription className="mt-1 text-sm">
                <Trans>Browse and download all financial reports submitted by this entity</Trans>
              </CardDescription>
            </div>
          </div>
          <Button asChild variant="ghost" size="sm" className="group shrink-0 gap-2">
            <Link to="/entities/$cui" params={{ cui }} search={{ view: 'overview' }}>
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              <span className="hidden sm:inline"><Trans>Back to Overview</Trans></span>
            </Link>
          </Button>
        </div>

        <Separator className="bg-border/50" />

        {/* Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {type && (
              <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5 shadow-sm">
                <span className="font-medium">{toReportTypeValue(type)}</span>
                <button
                  onClick={() => {
                    setType(undefined);
                    setPage(1);
                  }}
                  className="rounded-sm text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Remove filter"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {year && (
              <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5 shadow-sm">
                <span className="font-medium">{year}</span>
                <button
                  onClick={() => {
                    setYear(undefined);
                    setPage(1);
                  }}
                  className="rounded-sm text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Remove filter"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-xs">{sortOrder === 'DESC' ? <Trans>Newest first</Trans> : <Trans>Oldest first</Trans>}</span>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
                <Trans>Clear all</Trans>
              </Button>
            )}
          </div>
          <ResponsivePopover
            open={filterPopoverOpen}
            onOpenChange={setFilterPopoverOpen}
            trigger={
              <Button variant="outline" size="sm" className="group relative gap-2 shadow-sm">
                <Filter className="h-4 w-4" />
                <span><Trans>Filters</Trans></span>
                {activeFilterCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            }
            content={
              <div className="flex flex-col gap-4 w-full sm:w-[280px]">
                <div className="space-y-1.5">
                  <h4 className="text-sm font-semibold leading-none"><Trans>Filter Reports</Trans></h4>
                  <p className="text-xs text-muted-foreground">
                    <Trans>Refine your search using the options below</Trans>
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      <Trans>Report Type</Trans>
                    </label>
                    <Select value={type ?? ''} onValueChange={(v) => setType(v === 'ALL' || !v ? undefined : (v as GqlReportType))}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder={<Trans>All types</Trans>} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL"><Trans>All types</Trans></SelectItem>
                        <SelectItem value="PRINCIPAL_AGGREGATED"><Trans>Principal Aggregated</Trans></SelectItem>
                        <SelectItem value="SECONDARY_AGGREGATED"><Trans>Secondary Aggregated</Trans></SelectItem>
                        <SelectItem value="DETAILED"><Trans>Detailed</Trans></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      <Trans>Year</Trans>
                    </label>
                    <Select value={String(year ?? '')} onValueChange={(v) => setYear(v === 'ALL' || !v ? undefined : Number(v))}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder={<Trans>All years</Trans>} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL"><Trans>All years</Trans></SelectItem>
                        {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map(y => (
                          <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      <Trans>Sort Order</Trans>
                    </label>
                    <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as 'ASC' | 'DESC')}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DESC"><Trans>Newest first</Trans></SelectItem>
                        <SelectItem value="ASC"><Trans>Oldest first</Trans></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2">
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        clearFilters();
                        setFilterPopoverOpen(false);
                      }}
                      className="flex-1 gap-1.5 text-xs"
                    >
                      <X className="h-3.5 w-3.5" />
                      <Trans>Clear</Trans>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="flex-1 gap-1.5 text-xs"
                    onClick={() => {
                      setPage(1);
                      setFilterPopoverOpen(false);
                    }}
                  >
                    <Filter className="h-3.5 w-3.5" />
                    <Trans>Apply Filters</Trans>
                  </Button>
                </div>
              </div>
            }
            className="p-4"
            align="end"
            mobileSide="bottom"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading && (
          <div className="flex flex-col gap-4 p-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-border/60 bg-card">
                <div className="flex flex-col gap-4 border-b border-border/40 bg-muted/30 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-muted" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-muted rounded" />
                      <div className="h-3 w-24 bg-muted rounded" />
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="h-8 w-20 bg-muted rounded-full" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 lg:grid-cols-3">
                  <div className="flex gap-3">
                    <div className="h-9 w-9 bg-muted rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-20 bg-muted rounded" />
                      <div className="h-4 w-full bg-muted rounded" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-9 w-9 bg-muted rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-20 bg-muted rounded" />
                      <div className="h-4 w-24 bg-muted rounded" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-9 w-9 bg-muted rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-20 bg-muted rounded" />
                      <div className="h-4 w-32 bg-muted rounded" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {!isLoading && filteredRows.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            <Trans>No reports found</Trans>
          </div>
        )}
        {!isLoading && filteredRows.length > 0 && (
          <div className="flex flex-col gap-4 p-4">
            {filteredRows.map((report) => (
              <EntityReportCard key={report.report_id} report={report} />
            ))}
          </div>
        )}
        <div className="p-3 sm:p-4 border-t">
          <Pagination
            currentPage={page}
            pageSize={pageSize}
            totalCount={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            isLoading={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
}