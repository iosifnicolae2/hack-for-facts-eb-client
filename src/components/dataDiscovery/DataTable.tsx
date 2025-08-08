import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  VisibilityState,
  OnChangeFn,
  ColumnPinningState,
  ColumnSizingState,
  useReactTable,
} from "@tanstack/react-table";
import { BudgetLineItem } from "@/schemas/dataDiscovery";
import { formatCurrency } from "@/lib/utils";
import { useMemo } from "react";
import { ChevronUp, ChevronDown, ArrowUpDown, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { getMergedColumnOrder, moveColumnOrder } from "@/lib/table-utils";
import { SortOrder } from "@/schemas/interfaces";
import { Link } from "@tanstack/react-router";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
interface DataTableProps {
  data: BudgetLineItem[];
  isLoading: boolean;
  sort: SortOrder;
  onSortColumn: (columnId: string) => void;
  density?: "comfortable" | "compact";
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  onQuickFilter?: (filter: QuickFilter) => void;
  columnPinning?: ColumnPinningState;
  onColumnPinningChange?: OnChangeFn<ColumnPinningState>;
  columnSizing?: ColumnSizingState;
  onColumnSizingChange?: OnChangeFn<ColumnSizingState>;
  columnOrder?: string[];
  onColumnOrderChange?: OnChangeFn<string[]>;
  currencyFormat?: 'standard' | 'compact' | 'both';
  rowNumberStart?: number;
}

export type QuickFilter =
  | { kind: "entity"; id: string; label: string }
  | { kind: "year"; id: number; label: string }
  | { kind: "functional"; id: string; label: string }
  | { kind: "economic"; id: string; label: string }
  | { kind: "account"; id: "vn" | "ch"; label: string };

export function DataTable({ data, isLoading, sort, onSortColumn, density = "comfortable", columnVisibility, onColumnVisibilityChange, onQuickFilter, columnPinning, onColumnPinningChange, columnSizing, onColumnSizingChange, columnOrder, onColumnOrderChange, currencyFormat = 'both', rowNumberStart = 0 }: DataTableProps) {
  const processedData = useMemo(
    () =>
      data.map((item) => ({
        ...item,
        // Ensure these fields exist for the table
        functional_name:
          item.functional_name ||
          item.functionalClassification?.functional_name ||
          "-",
        economic_name:
          item.economic_name ||
          item.economicClassification?.economic_name ||
          "-",
      })),
    [data]
  );

  // Define columns with sortable headers
  const columns = useMemo<ColumnDef<BudgetLineItem>[]>(
    () => [
      {
        id: 'row_number',
        header: () => <span className="text-xs text-muted-foreground">#</span>,
        cell: ({ row }) => (
          <span className="block text-left w-full text-xs text-muted-foreground pl-2" aria-label={`Row ${rowNumberStart + row.index + 1}`}>
            {rowNumberStart + row.index + 1}
          </span>
        ),
        size: 40,
        minSize: 32,
        maxSize: 56,
        enableResizing: false,
        enableHiding: false,
      },
      {
        accessorKey: "entity_name",
        header: () => (
          <div
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => onSortColumn("entity_name")}
          >
            Entity
            {sort.by === "entity_cui" ? (
              sort.order === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
            ) : (
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        ),
        cell: ({ row }) => {
          const entityName = row.original.entity_name;
          const entityCui = row.original.entity_cui;
          return (
            <Link to={`/entities/$cui`} params={{ cui: entityCui }} className="hover:underline">{entityName}</Link>
          );
        },
      },
      {
        accessorKey: "year",
        header: () => (
          <div
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => onSortColumn("year")}
          >
            Year
            {sort.by === "year" ? (
              sort.order === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
            ) : (
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        ),
      },
      {
        accessorKey: "account_category",
        header: () => (
          <div
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => onSortColumn("account_category")}
          >
            Account Category
            {sort.by === "account_category" ? (
              sort.order === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
            ) : (
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        ),
        cell: ({ row }) => {
          const accountCategory = row.getValue("account_category");
          const accountLabel =
            accountCategory === "ch"
              ? "Cheltuieli"
              : accountCategory === "vn"
                ? "Venituri"
                : "Altele";
          return (
            <div
              className="max-w-[200px] truncate"
              title={String(accountLabel)}
            >
              {accountLabel}
            </div>
          );
        },
      },
      {
        accessorKey: "functional_name",
        header: () => (
          <div
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => onSortColumn("functional_name")}
          >
            Functional Category
            {sort.by === "functional_code" ? (
              sort.order === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
            ) : (
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        ),
        cell: ({ row }) => (
          <div
            className="max-w-[200px] truncate"
            title={String(row.getValue("functional_name"))}
          >
            <span className="font-mono text-xs text-muted-foreground mr-1">
              {row.original.functional_code}
            </span>
            {row.getValue("functional_name")}
          </div>
        ),
      },
      {
        accessorKey: "economic_name",
        header: () => (
          <div
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => onSortColumn("economic_name")}
          >
            Economic Category
            {sort.by === "economic_code" ? (
              sort.order === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
            ) : (
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        ),
        cell: ({ row }) => (
          <div
            className="max-w-[200px] truncate"
            title={String(row.getValue("economic_name"))}
          >
            <span className="font-mono text-xs text-muted-foreground mr-1">
              {row.original.economic_code}
            </span>
            {row.getValue("economic_name")}
          </div>
        ),
      },
      {
        accessorKey: "amount",
        header: () => (
          <div
            className="flex items-center gap-1 cursor-pointer justify-end w-full text-right"
            onClick={() => onSortColumn("amount")}
          >
            Amount
            {sort.by === "amount" ? (
              sort.order === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
            ) : (
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        ),
        cell: ({ row }) => {
          const amount = row.getValue("amount") as number;
          if (amount === undefined) {
            return <span className="text-muted-foreground">N/A</span>;
          }
          if (currencyFormat === 'both') {
            return (
              <div className="flex flex-col items-end">
                <span className="block text-xs text-foreground" title={formatCurrency(amount, 'standard')}>{formatCurrency(amount, 'standard')}</span>
                <span className="block text-xs text-muted-foreground">{formatCurrency(amount, 'compact')}</span>
              </div>
            );
          }
        const value = formatCurrency(amount, currencyFormat)
          return <span className="block text-right text-xs text-foreground" title={formatCurrency(amount, 'standard')}>{value}</span>
        },
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const it = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Row actions">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Quick filter</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => onQuickFilter?.({ kind: "entity", id: it.entity_cui, label: it.entity_name })}>By entity</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onQuickFilter?.({ kind: "year", id: it.year, label: String(it.year) })}>By year</DropdownMenuItem>
                {it.functional_code ? (
                  <DropdownMenuItem onSelect={() => onQuickFilter?.({ kind: "functional", id: it.functional_code!, label: it.functional_name || it.functional_code! })}>By functional</DropdownMenuItem>
                ) : null}
                {it.economic_code ? (
                  <DropdownMenuItem onSelect={() => onQuickFilter?.({ kind: "economic", id: it.economic_code!, label: it.economic_name || it.economic_code! })}>By economic</DropdownMenuItem>
                ) : null}
                <DropdownMenuItem onSelect={() => onQuickFilter?.({ kind: "account", id: it.account_category as "vn" | "ch", label: it.account_category === "vn" ? "Venituri" : it.account_category === "ch" ? "Cheltuieli" : it.account_category })}>By account</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigator.clipboard.writeText(JSON.stringify(it))}>Copy row JSON</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableHiding: false,
      },
    ],
    [sort.by, sort.order, onSortColumn, onQuickFilter, currencyFormat, rowNumberStart]
  );

  const enforcedColumnOrder = useMemo(() => {
    const rest = (columnOrder ?? []).filter((id) => id !== 'row_number')
    return ['row_number', ...rest]
  }, [columnOrder])

  const handleOrderChange: OnChangeFn<string[]> = (updater) => {
    const next = typeof updater === 'function' ? (updater as (old: string[]) => string[])(enforcedColumnOrder) : updater
    const rest = (next ?? []).filter((id) => id !== 'row_number')
    onColumnOrderChange?.(['row_number', ...rest])
  }

  const moveColumn = (id: string, direction: 'left' | 'right') => {
    const merged = getMergedColumnOrder(table, ['row_number'])
    const updated = moveColumnOrder(merged, id, direction, ['row_number'])
    table.setColumnOrder(updated)
  }

  const table = useReactTable({
    data: processedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Removed getPaginationRowModel to show all data
    state: {
      columnVisibility: columnVisibility,
      columnPinning,
      columnSizing,
      columnOrder: enforcedColumnOrder,
    },
    onColumnVisibilityChange,
    onColumnPinningChange,
    onColumnSizingChange,
    onColumnOrderChange: handleOrderChange,
    defaultColumn: {
      size: 180,
      minSize: 100,
      maxSize: 600,
    },
    columnResizeMode: 'onChange',
  });

  if (isLoading) {
    return (
      <div className="rounded-md border space-y-2 p-4 bg-card">
        <div className="h-8 bg-muted rounded animate-pulse" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card overflow-x-auto scrollbar-thin scrollbar-thumb-muted/40 scrollbar-track-transparent">
      <Table className="min-w-[700px] md:min-w-full text-sm md:text-base table-fixed">
        <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={`relative font-bold ${density === 'compact' ? 'px-2 py-1.5 md:px-3 md:py-2' : 'px-2 py-3 md:px-4 md:py-3'} whitespace-nowrap text-xs md:text-sm bg-card/95`}
                  aria-sort={
                    sort.by && header.column.id === sort.by
                      ? sort.order === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                  style={{ width: `${(header.column as unknown as { getSize?: () => number }).getSize?.() ?? 180}px` }}
                >
                  {header.isPlaceholder ? null : (
                    header.column.id === 'row_number' ? (
                      <div className="flex items-center justify-start select-none pl-1 gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 select-none">
                        <div className="min-w-0 flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                aria-label={`${header.column.id} menu`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-44" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuLabel>Column</DropdownMenuLabel>
                              {(() => {
                                const merged = getMergedColumnOrder(table, ['row_number'])
                                const movable = merged.filter((id) => id !== 'row_number')
                                const idx = movable.indexOf(header.column.id)
                                const disableLeft = idx <= 0 || idx === -1
                                const disableRight = idx === -1 || idx >= movable.length - 1
                                return (
                                  <>
                                    <DropdownMenuItem disabled={disableLeft} onSelect={() => !disableLeft && moveColumn(header.column.id, 'left')}>
                                      <ChevronLeft className="w-3 h-3 mr-1" /> Move left
                                    </DropdownMenuItem>
                                    <DropdownMenuItem disabled={disableRight} onSelect={() => !disableRight && moveColumn(header.column.id, 'right')}>
                                      <ChevronRight className="w-3 h-3 mr-1" /> Move right
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onSelect={() => header.column.toggleVisibility(false)}>Hide</DropdownMenuItem>
                                  </>
                                )
                              })()}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    )
                  )}
                  {/* Resizer */}
                  {header.column.id === 'row_number' ? null : header.column.getCanResize?.() ? (
                    <div
                      onMouseDown={header.getResizeHandler?.()}
                      onTouchStart={header.getResizeHandler?.()}
                      className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none ${header.column.getIsResizing?.() ? 'bg-primary/50' : 'hover:bg-primary/30'}`}
                      aria-hidden
                    />
                  ) : null}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, rowIdx) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={`transition-colors ${rowIdx % 2 === 0 ? "bg-background" : "bg-muted/30"} hover:bg-primary/5`}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={`${density === 'compact' ? 'px-2 py-1.5 md:px-3 md:py-2' : 'px-2 py-2 md:px-4 md:py-3'} overflow-hidden whitespace-nowrap text-ellipsis align-middle text-xs md:text-sm`}
                    title={String(cell.getValue())}
                    style={{ width: `${(cell.column as unknown as { getSize?: () => number }).getSize?.()}px` }}
                  >
                    <span className="block truncate" tabIndex={0} aria-label={String(cell.getValue())}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </span>
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
