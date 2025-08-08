//
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatNumberRO } from '@/lib/utils'
import type { EntityAnalyticsDataPoint } from '@/schemas/entity-analytics'
import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react'
import { Link } from '@tanstack/react-router'

interface Props {
  data: readonly EntityAnalyticsDataPoint[]
  isLoading?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSortChange: (by: string, order: 'asc' | 'desc') => void
  normalization?: 'total' | 'per_capita'
}

export function EntityAnalyticsTable({ data, isLoading, sortBy, sortOrder, onSortChange }: Props) {
  const columns: ColumnDef<EntityAnalyticsDataPoint>[] = [
      {
        id: 'entity_name',
        header: ({ column }) => (
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => toggle(column.id)}>
            Entity
            {renderSortIcon(column.id)}
          </div>
        ),
        cell: ({ row }) => (
          <Link to="/entities/$cui" params={{ cui: row.original.entity_cui }} className="truncate" title={row.original.entity_name}>
            {row.original.entity_name}
          </Link>
        ),
      },
      {
        id: 'county_name',
        header: ({ column }) => (
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => toggle(column.id)}>
            County
            {renderSortIcon(column.id)}
          </div>
        ),
        cell: ({ row }) => row.original.county_name ?? '-',
      },
      {
        id: 'population',
        header: ({ column }) => (
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => toggle(column.id)}>
            Population
            {renderSortIcon(column.id)}
          </div>
        ),
        cell: ({ row }) => (row.original.population != null ? formatNumberRO(row.original.population) : '-'),
      },
      {
        id: 'per_capita_amount',
        header: ({ column }) => (
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => toggle(column.id)}>
            Per Capita
            {renderSortIcon(column.id)}
          </div>
        ),
        cell: ({ row }) => (
          row.original.population != null ? (
            <span title={formatCurrency(row.original.per_capita_amount, 'standard')}>
              {formatCurrency(row.original.per_capita_amount, 'compact')}
            </span>
          ) : '-'
        ),
      },
      {
        id: 'total_amount',
        header: ({ column }) => (
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => toggle(column.id)}>
            Total Amount
            {renderSortIcon(column.id)}
          </div>
        ),
        cell: ({ row }) => (
          <span title={formatCurrency(row.original.total_amount, 'standard')}>
            {formatCurrency(row.original.total_amount, 'compact')}
          </span>
        ),
      },
  ]

  const toggle = (id: string) => {
    if (sortBy !== id) {
      onSortChange(id, 'asc')
      return
    }
    onSortChange(id, sortOrder === 'asc' ? 'desc' : 'asc')
  }

  const renderSortIcon = (id: string) => {
    if (sortBy !== id) return <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

  const table = useReactTable({
    data: data as EntityAnalyticsDataPoint[],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (isLoading) {
    return (
      <div className="rounded-md border space-y-2 p-4 bg-card animate-pulse">
        <div className="h-8 bg-muted rounded" />
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="whitespace-nowrap">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}


