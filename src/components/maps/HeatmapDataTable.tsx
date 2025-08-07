import React, { useMemo } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    SortingState,
    getSortedRowModel,
    getPaginationRowModel,
    PaginationState,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ChevronUp,
    ChevronDown,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import { HeatmapJudetDataPoint, HeatmapUATDataPoint } from "@/schemas/heatmap";
import { formatCurrency, formatNumberRO } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

interface HeatmapDataTableProps {
    data: (HeatmapUATDataPoint | HeatmapJudetDataPoint)[];
    isLoading: boolean;
    sorting: SortingState;
    setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
    pagination: PaginationState;
    setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
    mapViewType: "UAT" | "Judet";
}

export function HeatmapDataTable({
    data,
    isLoading,
    sorting,
    setSorting,
    pagination,
    setPagination,
    mapViewType,
}: HeatmapDataTableProps) {
    const isUatView = mapViewType === 'UAT';

    const columns = useMemo<ColumnDef<HeatmapUATDataPoint | HeatmapJudetDataPoint>[]>(
        () => [
            {
                accessorKey: "name",
                header: ({ column }) => (
                    <div
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Nume
                        {column.getIsSorted() === "asc" ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : column.getIsSorted() === "desc" ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                        )}
                    </div>
                ),
                cell: ({ row }) => {
                    const original = row.original;
                    const name = 'uat_name' in original ? original.uat_name : original.county_name;
                    const code = 'uat_code' in original ? original.uat_code : undefined;

                    if (code) {
                        return <Link to="/entities/$cui" params={{ cui: code }} className="truncate" title={name}>{name}</Link>;
                    }
                    return <div className="truncate" title={name}>{name}</div>;
                },
            },
            {
                accessorKey: "county_name",
                header: ({ column }) => (
                    <div
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Județ
                        {column.getIsSorted() === "asc" ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : column.getIsSorted() === "desc" ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                        )}
                    </div>
                ),
                cell: ({ row }) => {
                    const original = row.original;
                    return 'county_name' in original ? original.county_name : '-';
                },
                id: 'county_name',
            },
            {
                accessorKey: "population",
                header: ({ column }) => (
                    <div
                        className="flex items-center gap-1 cursor-pointer text-right w-full justify-end"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Populație
                        {column.getIsSorted() === "asc" ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : column.getIsSorted() === "desc" ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                        )}
                    </div>
                ),
                cell: ({ row }) => {
                    const original = row.original;
                    const population = 'population' in original ? original.population : ('county_population' in original ? original.county_population : null);
                    return <div className="text-right">{population ? formatNumberRO(population) : "-"}</div>;
                },
            },
            {
                accessorKey: "total_amount",
                header: ({ column }) => (
                    <div
                        className="flex items-center gap-1 cursor-pointer text-right w-full justify-end"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Suma Totală
                        {column.getIsSorted() === "asc" ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : column.getIsSorted() === "desc" ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                        )}
                    </div>
                ),
                cell: ({ row }) => <div className="text-right">{formatCurrency(row.getValue("total_amount"))}</div>,
            },
            {
                accessorKey: "per_capita_amount",
                header: ({ column }) => (
                    <div
                        className="flex items-center gap-1 cursor-pointer text-right w-full justify-end"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Suma/Cap de locuitor
                        {column.getIsSorted() === "asc" ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : column.getIsSorted() === "desc" ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                        )}
                    </div>
                ),
                cell: ({ row }) => <div className="text-right">{formatCurrency(row.getValue("per_capita_amount"))}</div>,
            },
        ],
        [isUatView]
    );

    const table = useReactTable({
        data: data || [],
        columns,
        state: {
            sorting,
            pagination,
            columnVisibility: {
                county_name: isUatView,
            }
        },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: false,
        manualSorting: false,
    });

    if (isLoading) {
        return (
            <div className="rounded-md border space-y-2 p-4 bg-card animate-pulse">
                <div className="h-8 bg-muted rounded" />
                {Array.from({ length: pagination.pageSize }).map((_, i) => (
                    <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="rounded-md border bg-card overflow-auto scrollbar-thin scrollbar-thumb-muted/40 scrollbar-track-transparent flex-grow">
                <Table className="min-w-[700px] md:min-w-full text-sm md:text-base relative">
                    <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="font-bold px-2 py-3 md:px-4 md:py-3 whitespace-nowrap text-xs md:text-sm bg-card/95 cursor-pointer"
                                        onClick={header.column.getToggleSortingHandler()}
                                        style={{ textAlign: header.column.id === 'name' ? 'left' : 'right' }}
                                    >
                                        <div className={`flex items-center gap-1 ${header.column.id === 'name' ? '' : 'justify-end'}`}>
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                        </div>
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
                                            className="px-2 py-2 md:px-4 md:py-3 max-w-[140px] md:max-w-[220px] truncate align-middle text-xs md:text-sm"
                                            title={String(cell.getValue())}
                                            style={{ textAlign: cell.column.id === 'name' ? 'left' : 'right' }}
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
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between mt-auto gap-4 p-2 md:p-4 border-t bg-card">
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 md:space-x-4 w-full md:w-auto text-xs md:text-sm">
                    <span className="text-muted-foreground">
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() > 0 ? table.getPageCount() : 1}
                    </span>
                    <div className="flex items-center space-x-1 md:space-x-2">
                        <span className="text-muted-foreground">| Show</span>
                        <Select
                            value={table.getState().pagination.pageSize.toString()}
                            onValueChange={(value) => table.setPageSize(parseInt(value))}
                        >
                            <SelectTrigger className="h-7 md:h-8 w-[60px] md:w-[70px] text-xs md:text-sm" aria-label="Select page size">
                                <SelectValue placeholder={table.getState().pagination.pageSize.toString()} />
                            </SelectTrigger>
                            <SelectContent>
                                {[10, 15, 20, 30, 50, 100].map((size) => (
                                    <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span className="text-muted-foreground">of {table.getFilteredRowModel().rows.length} entries</span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center space-x-1 md:space-x-2 w-full md:w-auto justify-center md:justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 md:h-8 md:w-8 p-0"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                        aria-label="Go to first page"
                    >
                        <ChevronsLeft className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 md:h-8 md:w-8 p-0"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        aria-label="Previous page"
                    >
                        <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 md:h-8 md:w-8 p-0"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        aria-label="Next page"
                    >
                        <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 md:h-8 md:w-8 p-0"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage() || table.getPageCount() === 0}
                        aria-label="Go to last page"
                    >
                        <ChevronsRight className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}