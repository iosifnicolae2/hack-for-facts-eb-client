import { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { Link } from '@tanstack/react-router';
import { Download, FileText, Landmark, Filter, Calendar } from 'lucide-react';
import { useEntityReports } from '@/lib/hooks/useEntityDetails';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GqlReportType, toReportTypeValue } from '@/schemas/reporting';
import { ResponsivePopover } from '@/components/ui/ResponsivePopover';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';

type EntityReportsProps = {
  readonly cui: string;
  readonly initialType?: GqlReportType;
};

function formatDate(dateString: string) {
  const n = Number(dateString);
  const date = Number.isFinite(n) ? new Date(n) : new Date(dateString);
  return date.toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function EntityReports({ cui, initialType }: EntityReportsProps) {
  const [year, setYear] = useState<number | undefined>(undefined);
  const [type, setType] = useState<GqlReportType | undefined>(initialType);
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const activeFilterBadges = (
    <div className="flex flex-wrap gap-2">
      {type ? <Badge variant="secondary" className="text-xs">{toReportTypeValue(type)}</Badge> : null}
      {year ? <Badge variant="secondary" className="text-xs">{year}</Badge> : null}
      <Badge variant="outline" className="text-xs">{sortOrder === 'DESC' ? 'Newest first' : 'Oldest first'}</Badge>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2"><FileText className="h-6 w-6" /><Trans>Financial Reports</Trans></CardTitle>
          <Link to="/entities/$cui" params={{ cui }} search={{ view: 'overview' }} className="text-sm underline-offset-2 hover:underline"><Trans>Back to Overview</Trans></Link>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            {activeFilterBadges}
          </div>
          <ResponsivePopover
            trigger={<Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto"><Filter className="h-4 w-4" /> <span className="hidden sm:inline">Filters</span></Button>}
            content={
              <div className="flex flex-col gap-3 w-full sm:w-[260px]">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Report type</div>
                  <Select value={type ?? ''} onValueChange={(v) => setType(v === 'ALL' || !v ? undefined : (v as GqlReportType))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All types</SelectItem>
                      <SelectItem value="PRINCIPAL_AGGREGATED">Principal Aggregated</SelectItem>
                      <SelectItem value="SECONDARY_AGGREGATED">Secondary Aggregated</SelectItem>
                      <SelectItem value="DETAILED">Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Year</div>
                  <Select value={String(year ?? '')} onValueChange={(v) => setYear(v === 'ALL' || !v ? undefined : Number(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All years</SelectItem>
                      {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map(y => (
                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Sort</div>
                  <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as 'ASC' | 'DESC')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DESC">Newest first</SelectItem>
                      <SelectItem value="ASC">Oldest first</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="pt-1">
                  <Button size="sm" className="w-full" onClick={() => setPage(1)}>Apply</Button>
                </div>
              </div>
            }
            className="p-3"
            align="end"
            mobileSide="bottom"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[140px] sm:w-[180px]"><Trans>Date</Trans></TableHead>
                <TableHead className="min-w-[120px] hidden sm:table-cell"><Trans>Type</Trans></TableHead>
                <TableHead className="min-w-[180px] hidden md:table-cell"><Trans>Main Creditor</Trans></TableHead>
                <TableHead className="text-right min-w-[140px]"><Trans>Downloads</Trans></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell><div className="h-4 bg-muted rounded w-3/4" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><div className="h-4 bg-muted rounded w-full" /></TableCell>
                  <TableCell className="hidden md:table-cell"><div className="h-4 bg-muted rounded w-2/3" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-1/2 ml-auto" /></TableCell>
                </TableRow>
              ))}
              {!isLoading && filteredRows.map((r, i) => (
                <TableRow key={r.report_id} className={i % 2 === 0 ? 'bg-muted/50' : ''}>
                  <TableCell className="whitespace-nowrap font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="truncate">{formatDate(r.report_date)}</div>
                        <div className="text-xs text-muted-foreground">{r.reporting_year}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline" className="text-xs">{toReportTypeValue(r.report_type as GqlReportType)}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <Landmark className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <Link to="/entities/$cui" params={{ cui: r.main_creditor.cui }} className="underline-offset-2 hover:underline truncate" title={r.main_creditor.name}>{r.main_creditor.name}</Link>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {r.download_links.map((link) => (
                        <Button key={link} size="sm" variant="ghost" asChild className="h-8 px-2">
                          <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-xs">{link.split('.').pop()?.toUpperCase()}</span>
                            <span className="sr-only">Download {link.split('.').pop()?.toUpperCase()}</span>
                          </a>
                        </Button>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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