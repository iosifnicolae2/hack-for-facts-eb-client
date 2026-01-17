/**
 * Data Table for Angajamente Bugetare Line Items
 *
 * Displays detailed commitment data with sorting and anomaly highlighting
 */

import { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
  type PaginationState,
  type ColumnDef,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrency, formatNumber } from '@/lib/utils'
import type { AngajamenteLineItem } from '@/schemas/angajamente'
import { AlertTriangle, Info } from 'lucide-react'
import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
  data: AngajamenteLineItem[] | null | undefined
  isLoading?: boolean
  currency?: 'RON' | 'EUR' | 'USD'
  /** When true, renders without Card wrapper (for embedding in other components) */
  embedded?: boolean
}

function formatValue(value: number | null | undefined, currency: 'RON' | 'EUR' | 'USD') {
  if (value === null || value === undefined) return '-'
  return formatCurrency(value, 'compact', currency)
}

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) return '-'
  return `${formatNumber(value, 'standard')}%`
}

function AnomalyBadge({ anomaly }: { anomaly?: 'YTD_ANOMALY' | 'MISSING_LINE_ITEM' }) {
  if (!anomaly) return null

  const config = {
    YTD_ANOMALY: {
      label: t`YTD Anomaly`,
      tooltip: t`Values decreased between months - possible correction or reclassification`,
      variant: 'destructive' as const,
    },
    MISSING_LINE_ITEM: {
      label: t`Missing`,
      tooltip: t`Line item disappeared - possible reclassification`,
      variant: 'secondary' as const,
    },
  }

  const { label, tooltip, variant } = config[anomaly]

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={variant} className="gap-1 text-xs">
            <AlertTriangle className="w-3 h-3" />
            {label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

export function AngajamenteTable({ data, isLoading, currency = 'RON', embedded = false }: Props) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'platiTrezor', desc: true },
  ])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const columns = useMemo<ColumnDef<AngajamenteLineItem>[]>(
    () => [
      {
        accessorKey: 'functionalCode',
        header: t`Classification`,
        cell: ({ row }) => {
          const fn = row.original.functionalCode
          const fnName = row.original.functionalName
          const ec = row.original.economicCode
          const ecName = row.original.economicName
          const anomaly = row.original.anomaly

          return (
            <div className="min-w-[200px]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                  {fn}
                </span>
                {anomaly && <AnomalyBadge anomaly={anomaly} />}
              </div>
              <div className="text-sm font-medium truncate max-w-[250px]" title={fnName}>
                {fnName || fn}
              </div>
              {ec && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  <span className="font-mono">{ec}</span>
                  {ecName && ` · ${ecName}`}
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'crediteButetare',
        header: t`Budget Credits`,
        cell: ({ getValue }) => (
          <div className="text-right font-mono">
            {formatValue(getValue<number>(), currency)}
          </div>
        ),
      },
      {
        accessorKey: 'crediteAngajament',
        header: t`Commitments`,
        cell: ({ getValue }) => (
          <div className="text-right font-mono">
            {formatValue(getValue<number>(), currency)}
          </div>
        ),
      },
      {
        accessorKey: 'receptiiTotale',
        header: t`Receipts`,
        cell: ({ getValue }) => (
          <div className="text-right font-mono">
            {formatValue(getValue<number>(), currency)}
          </div>
        ),
      },
      {
        accessorKey: 'platiTrezor',
        header: t`Payments`,
        cell: ({ getValue }) => (
          <div className="text-right font-mono font-medium">
            {formatValue(getValue<number>(), currency)}
          </div>
        ),
      },
      {
        accessorKey: 'receptiiNeplatite',
        header: t`Arrears`,
        cell: ({ row }) => {
          const value = row.original.receptiiNeplatite
          const hasArrears = value > 0
          return (
            <div
              className={cn(
                'text-right font-mono',
                hasArrears && 'text-red-600 dark:text-red-400 font-medium'
              )}
            >
              {formatValue(value, currency)}
            </div>
          )
        },
      },
      {
        id: 'utilization',
        header: t`Utilization`,
        accessorFn: (row) =>
          row.crediteButetare > 0
            ? (row.platiTrezor / row.crediteButetare) * 100
            : 0,
        cell: ({ getValue }) => {
          const pct = getValue<number>()
          return (
            <div className="text-right">
              <span
                className={cn(
                  'font-mono text-sm',
                  pct >= 90
                    ? 'text-green-600 dark:text-green-400'
                    : pct >= 70
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-red-600 dark:text-red-400'
                )}
              >
                {formatPercent(pct)}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: 'fundingSource',
        header: t`Source`,
        cell: ({ row }) => {
          const src = row.original.fundingSource
          const desc = row.original.fundingSourceDescription
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded cursor-help">
                    {src || '-'}
                  </span>
                </TooltipTrigger>
                {desc && (
                  <TooltipContent>
                    <p>{desc}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )
        },
      },
    ],
    [currency]
  )

  const table = useReactTable({
    data: data ?? [],
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  if (isLoading) {
    const content = <TableSkeleton />
    if (embedded) return content
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            <Skeleton className="h-5 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    const content = (
      <div className="text-center text-muted-foreground py-8">
        <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <Trans>No commitment data available</Trans>
      </div>
    )
    if (embedded) return content
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trans>Line Items</Trans>
          </CardTitle>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    )
  }

  const tableContent = (
    <>
      <div className="rounded-md border overflow-auto max-w-full relative">
        <Table className="min-w-[900px] text-sm">
          <TableHeader className="sticky top-0 z-10 bg-card border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isFirstColumn = header.column.id === 'functionalCode'
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'whitespace-nowrap',
                        isFirstColumn
                          ? 'text-left sticky left-0 z-20 bg-card border-r'
                          : 'text-right'
                      )}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            'flex items-center gap-1',
                            header.column.getCanSort() && 'cursor-pointer select-none',
                            !isFirstColumn && 'justify-end'
                          )}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {
                            { asc: '▲', desc: '▼' }[
                              header.column.getIsSorted() as string
                            ]
                          }
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row, rowIndex) => (
              <TableRow
                key={row.id}
                className={cn(row.original.anomaly && 'bg-red-50/50 dark:bg-red-950/20')}
              >
                {row.getVisibleCells().map((cell) => {
                  const isFirstColumn = cell.column.id === 'functionalCode'
                  return (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'whitespace-nowrap align-middle',
                        rowIndex % 2 === 0 && !row.original.anomaly
                          ? 'bg-background'
                          : !row.original.anomaly
                            ? 'bg-muted/50'
                            : '',
                        isFirstColumn &&
                          'text-left sticky left-0 z-10 border-r bg-inherit'
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={pagination.pageIndex + 1}
            pageSize={pagination.pageSize}
            totalCount={data.length}
            onPageChange={(page) =>
              setPagination((prev) => ({ ...prev, pageIndex: page - 1 }))
            }
          />
        </div>
      )}
    </>
  )

  if (embedded) return tableContent

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Trans>Line Items</Trans>
          <Badge variant="secondary" className="font-normal">
            {data.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>{tableContent}</CardContent>
    </Card>
  )
}
