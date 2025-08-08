import { DataTable } from "./DataTable";
import { PaginatedResult, BudgetLineItem } from "@/schemas/dataDiscovery";
import { SortOrder } from "@/schemas/interfaces";
import { Pagination } from "@/components/ui/pagination";
import { ActiveFiltersBar, type FilterItem } from "@/components/ui/active-filters-bar";
import type { QuickFilter } from "./DataTable";
import { useMemo } from "react";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { useTablePreferences } from "@/hooks/useTablePreferences";

interface DataDisplayProps {
  budgetItems: PaginatedResult<BudgetLineItem>;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  sort: SortOrder;
  onSortColumn: (columnId: string) => void;
  activeFilters?: FilterItem[];
  onRemoveFilter?: (key: string, id?: string) => void;
  onClearFilters?: () => void;
  onQuickFilter?: (qf: QuickFilter) => void;
}

export function DataDisplay({
  budgetItems,
  isLoading,
  onPageChange,
  onPageSizeChange,
  sort,
  onSortColumn,
  activeFilters = [],
  onRemoveFilter,
  onClearFilters,
  onQuickFilter,
}: DataDisplayProps) {
  const { density, setDensity, columnVisibility, setColumnVisibility, columnPinning, setColumnPinning, columnSizing, setColumnSizing, columnOrder, setColumnOrder, currencyFormat, setCurrencyFormat } = useTablePreferences('data-discovery', {
    columnVisibility: {
      entity_name: true,
      year: true,
      account_category: true,
      functional_name: true,
      economic_name: true,
      amount: true,
    }
  });
  const totalCount = useMemo(() => budgetItems.totalCount || 0, [budgetItems.totalCount]);
  const rowNumberStart = useMemo(() => Math.max(0, (budgetItems.currentPage - 1) * budgetItems.pageSize), [budgetItems.currentPage, budgetItems.pageSize]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <ActiveFiltersBar
          filters={activeFilters}
          onRemoveFilter={(key, id) => onRemoveFilter?.(key, id)}
          onClearFilters={() => onClearFilters?.()}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Density</DropdownMenuLabel>
            <DropdownMenuCheckboxItem checked={density === 'comfortable'} onCheckedChange={() => setDensity('comfortable')}>Comfortable</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={density === 'compact'} onCheckedChange={() => setDensity('compact')}>Compact</DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Currency</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => setCurrencyFormat('standard')}>
              Standard
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setCurrencyFormat('compact')}>
              Compact
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setCurrencyFormat('both')}>
              Both
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Columns</DropdownMenuLabel>
            {/* Hardcode toggles for now to avoid coupling to table instance */}
            <DropdownMenuCheckboxItem
              checked={columnVisibility.entity_name !== false}
              onCheckedChange={(v) => setColumnVisibility((prev: Record<string, boolean>) => ({ ...prev, entity_name: Boolean(v) }))}
            >
              Entity
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.year !== false}
              onCheckedChange={(v) => setColumnVisibility((prev: Record<string, boolean>) => ({ ...prev, year: Boolean(v) }))}
            >
              Year
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.account_category !== false}
              onCheckedChange={(v) => setColumnVisibility((prev: Record<string, boolean>) => ({ ...prev, account_category: Boolean(v) }))}
            >
              Account Category
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.functional_name !== false}
              onCheckedChange={(v) => setColumnVisibility((prev: Record<string, boolean>) => ({ ...prev, functional_name: Boolean(v) }))}
            >
              Functional Category
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.economic_name !== false}
              onCheckedChange={(v) => setColumnVisibility((prev: Record<string, boolean>) => ({ ...prev, economic_name: Boolean(v) }))}
            >
              Economic Category
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.amount !== false}
              onCheckedChange={(v) => setColumnVisibility((prev: Record<string, boolean>) => ({ ...prev, amount: Boolean(v) }))}
            >
              Amount
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <DataTable
        data={budgetItems.data}
        isLoading={isLoading}
        sort={sort}
        onSortColumn={onSortColumn}
        density={density}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        onQuickFilter={onQuickFilter}
        columnPinning={columnPinning}
        onColumnPinningChange={setColumnPinning}
        columnSizing={columnSizing}
        onColumnSizingChange={setColumnSizing}
        columnOrder={columnOrder}
        onColumnOrderChange={setColumnOrder}
        currencyFormat={currencyFormat}
        rowNumberStart={rowNumberStart}
      />
      {!isLoading && budgetItems.totalCount > 0 && (
        <Pagination
          currentPage={budgetItems.currentPage}
          pageSize={budgetItems.pageSize}
          totalCount={totalCount}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
