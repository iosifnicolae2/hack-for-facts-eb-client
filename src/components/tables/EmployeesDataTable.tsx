import React from 'react'
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, SortingState, ColumnDef, getPaginationRowModel, PaginationState } from '@tanstack/react-table'
import { EnrichedEmployeeData } from '@/schemas/employeeData'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import { Link } from '@tanstack/react-router'
import { formatCurrency, formatNumber, getSignClass } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'


type EmployeesDataTableProps = {
  data: readonly (EnrichedEmployeeData & {
    __entityCui?: string | undefined
    __uatCode?: string | undefined
    __uatNameAccurate?: string | undefined
    __countyName?: string | undefined
    __spendingTotal2024?: number | undefined
    __spendingPerCapita2024?: number | undefined
  })[] | null
  sorting: SortingState
  setSorting: (updater: SortingState | ((old: SortingState) => SortingState)) => void
  pagination: PaginationState
  setPagination: (updater: PaginationState | ((old: PaginationState) => PaginationState)) => void
}

export function EmployeesDataTable({ data, sorting, setSorting, pagination, setPagination }: EmployeesDataTableProps) {
  const withTooltip = (content: React.ReactNode, text: string) => (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help">{content}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
  const columns = React.useMemo<ColumnDef<EmployeesDataTableProps['data'] extends readonly (infer R)[] | null ? R : never>[]>(() => [
    {
      accessorKey: 'uatName',
      header: 'UAT',
      cell: (info) => {
        const name = String((info.row.original as any).__uatNameAccurate ?? info.getValue() ?? '')
        const cui = (info.row.original as any).__entityCui
        if (cui) {
          return (
            <Link to="/entities/$cui" params={{ cui: String(cui) }} search={{ view: 'employees' }} className="underline-offset-2 hover:underline">
              {name}
            </Link>
          )
        }
        return <span>{name}</span>
      },
    },
    {
      accessorKey: 'employeesPer1000Capita', header: 'Angajați / 1.000 loc.', cell: info => withTooltip(getNumberValue(info.getValue<number>()), 'Personal raportat la 1.000 locuitori. Mai mic = mai eficient.')
    },
    {
      accessorKey: 'occupiedPosts', header: 'Posturi ocupate', cell: info => withTooltip(getNumberValue(info.getValue<number>()), 'Total angajați actuali.')
    },
    {
      accessorKey: 'totalPostsActual', header: 'Total posturi', cell: info => withTooltip(getNumberValue(info.getValue<number>()), 'Posturile din organigramă (ocupate + vacante).')
    },
    {
      accessorKey: '__spendingTotal2024', header: 'Cheltuieli totale 2024', cell: info => withTooltip(info.getValue<number>() ? formatCurrency(info.getValue<number>()!, 'compact') : 'N/A', 'Total cheltuieli în anul 2024.')
    },
    {
      accessorKey: '__spendingPerCapita2024', header: 'Cheltuieli per capita 2024', cell: info => withTooltip(info.getValue<number>() ? formatCurrency(info.getValue<number>()!, 'compact') : 'N/A', 'Cheltuieli pe locuitor în 2024.')
    },
    {
      accessorKey: 'totalPostsReduction45', header: 'Total -15%', cell: info => withTooltip(getNumberValue(info.getValue<number>()), 'Total posturi după o reducere simulată de 15%.')
    },
    {
      accessorKey: 'diff45VsOccupied', header: 'Dif. -15% vs ocupate', cell: info => {
        const val = info.getValue<number>() ?? 0
        return withTooltip(<span className={getSignClass(val)}>{val.toLocaleString('ro-RO')}</span>, 'Negativ = deficit; Pozitiv = excedent față de limita simulată.')
      }
    },
    {
      accessorKey: 'totalPostsReduction40', header: 'Total -10%', cell: info => withTooltip(getNumberValue(info.getValue<number>()), 'Total posturi după o reducere simulată de 10%.')
    },
    {
      accessorKey: 'diff40VsOccupied', header: 'Dif. -10% vs ocupate', cell: info => {
        const val = info.getValue<number>() ?? 0
        return withTooltip(<span className={getSignClass(val)}>{val.toLocaleString('ro-RO')}</span>, 'Negativ = deficit; Pozitiv = excedent față de limita simulată.')
      }
    },
    {
      accessorKey: 'maxPostsFromOUG63', header: 'Maxim legal (OUG 63)', cell: info => withTooltip((info.getValue<number>() ?? 0).toLocaleString('ro-RO'), 'Limită superioară în funcție de populație.')
    },
    {
      accessorKey: 'uatPopulation', header: 'Populație', cell: info => withTooltip((info.getValue<number>() ?? 0).toLocaleString('ro-RO'), 'Populația estimată a UAT-ului.')
    },
    {
      accessorKey: 'popRegistryPosts', header: 'Evidența populației', cell: info => withTooltip((info.getValue<number>() ?? 0).toLocaleString('ro-RO'), 'Posturi stabilite prin legislație.')
    },
    {
      accessorKey: 'localPolicePosts', header: 'Poliția locală', cell: info => withTooltip((info.getValue<number>() ?? 0).toLocaleString('ro-RO'), 'Norma actuală.')
    },
    {
      accessorKey: 'onePolicePer1200Pop', header: 'Poliție (1/1200)', cell: info => withTooltip((info.getValue<number>() ?? 0).toLocaleString('ro-RO'), 'Simulare alternativă.')
    },
    {
      accessorKey: 'euProjectsImplementationPosts', header: 'Proiecte UE (impl.)', cell: info => withTooltip((info.getValue<number>() ?? 0).toLocaleString('ro-RO'), 'Posturi pentru implementare.')
    },
    {
      accessorKey: 'euProjectsPostImplementationPosts', header: 'Proiecte UE (post-impl.)', cell: info => withTooltip((info.getValue<number>() ?? 0).toLocaleString('ro-RO'), 'Posturi post-implementare.')
    },
    {
      accessorKey: 'schoolBusDriversPosts', header: 'Șoferi microbuze', cell: info => withTooltip((info.getValue<number>() ?? 0).toLocaleString('ro-RO'), 'Posturi pentru transport școlar.')
    },
  ], [])

  const table = useReactTable({
    data: (data ?? []) as any[],
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="rounded-md border bg-card overflow-auto max-w-full relative">
      <Table className="min-w-[900px] md:min-w-full text-sm">
        <TableHeader className="sticky top-0 z-10 bg-card border-b">
          {table.getHeaderGroups().map(hg => (
            <TableRow key={hg.id}>
              {hg.headers.map(header => {
                const isTextCol = header.column.id === 'uatName'
                return (
                  <TableHead key={header.id} className={`whitespace-nowrap ${isTextCol ? 'text-left sticky left-0 z-20 bg-card border-r' : 'text-right'}`}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={`${header.column.getCanSort() ? 'cursor-pointer select-none' : ''} ${isTextCol ? '' : 'justify-end'} flex items-center gap-1`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{ asc: '▲', desc: '▼' }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row, rowIdx) => {
            const getRowBg = () => {
              if (row.getIsSelected()) return 'bg-muted'
              if (rowIdx % 2 === 0) return 'bg-background'
              return 'bg-muted'
            }
            const rowBg = getRowBg()
            return (
              <TableRow key={row.id} className={`transition-colors hover:bg-primary/5`}>
                {row.getVisibleCells().map(cell => {
                  const isTextCol = cell.column.id === 'uatName'
                  return (
                    <TableCell key={cell.id} className={`whitespace-nowrap align-middle ${rowBg} ${isTextCol ? `text-left sticky left-0 z-10 border-r` : 'text-right'}`} title={String(cell.getValue() ?? '')}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  )
                })}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <div className="p-2 md:p-3 border-t bg-card">
        <Pagination
          currentPage={table.getState().pagination.pageIndex + 1}
          pageSize={table.getState().pagination.pageSize}
          totalCount={table.getPrePaginationRowModel().rows.length}
          onPageChange={(p) => table.setPageIndex(Math.max(0, p - 1))}
          onPageSizeChange={(s) => table.setPageSize(s)}
        />
      </div>
    </div>
  )
}


function getNumberValue(value: number | undefined | null) {
  if (!value) {
    return 'N/A'
  }
  return formatNumber(value, 'compact')
}