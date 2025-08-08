import { createLazyFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DataDisplay } from "@/components/dataDiscovery/DataDisplay";
import { DataDiscoveryLayout } from "@/components/dataDiscovery/DataDiscoveryLayout";
import { useEffect, useMemo } from "react";
import { getBudgetLineItems } from "@/lib/api/dataDiscovery";
import { useFilterSearch } from "@/lib/hooks/useLineItemsFilter";
import type { SortOrder as APISortOrder } from "@/schemas/dataDiscovery";
import type { SortOrder as UISortOrder } from "@/schemas/interfaces";
import { Button } from "@/components/ui/button";
import type { FilterItem } from "@/components/ui/active-filters-bar";

export const Route = createLazyFileRoute("/data-discovery/")({
  component: DataDiscoveryPage,
});

function DataDiscoveryPage() {
  const {
    filter,
    filterHash,
    sort,
    setSort,
    page,
    pageSize,
    setPage,
    setPageSize,
    resetFilters,
    // Selected option state for active filters UI
    selectedYearOptions,
    selectedEntityOptions,
    selectedUatOptions,
    selectedEconomicClassificationOptions,
    selectedFunctionalClassificationOptions,
    minAmount,
    maxAmount,
    selectedAccountTypeOptions,
    selectedEntityTypeOptions,
    // Actions to update filters
    setSelectedYearOptions,
    setSelectedEntityOptions,
    setSelectedUatOptions,
    setSelectedEconomicClassificationOptions,
    setSelectedFunctionalClassificationOptions,
    setSelectedAccountTypeOptions,
  } = useFilterSearch();


  const {
    data: budgetItemsData,
    isLoading: isLoadingItems,
    error: itemsError,
  } = useQuery({
    queryKey: [
      "budgetLineItems",
      filterHash,
      sort,
      page,
      pageSize,
    ],
    queryFn: () =>
      getBudgetLineItems({
        filters: filter,
        sort: (sort as UISortOrder)?.by ? ({ by: (sort as UISortOrder).by!, order: (sort as UISortOrder).order ?? 'asc' } as APISortOrder) : undefined,
        page,
        pageSize,
      }),
  });

  // Reset page to 1 if the total number of pages is less than the current page
  useEffect(() => {
    if (budgetItemsData && budgetItemsData.totalPages < page) {
      setPage(1);
    }
  }, [budgetItemsData, page, setPage]);

  const isLoading = isLoadingItems;
  const hasError = !!itemsError;

  const paginatedBudgetItems = useMemo(() => {
    if (!budgetItemsData) {
      return {
        data: [],
        totalCount: 0,
        hasNextPage: false,
        hasPreviousPage: false,
        currentPage: page,
        pageSize: pageSize,
        totalPages: 0,
      };
    }
    const totalCount = budgetItemsData.totalCount || 0;
    return {
      data: budgetItemsData.data || [],
      totalCount: totalCount,
      hasNextPage: budgetItemsData.hasNextPage || false,
      hasPreviousPage: budgetItemsData.hasPreviousPage || false,
      currentPage: page,
      pageSize: pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  }, [budgetItemsData, page, pageSize]);

  const errorMessage = (() => {
    if (itemsError instanceof Error) return itemsError.message;
    if (hasError) return "An error occurred while loading data.";
    return "";
  })();

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  const handleSortColumn = (columnId: string) => {
    const sortBy = mapColumnIdToSortBy(columnId);
    const current = sort as UISortOrder;
    if (current.by !== sortBy) {
      setSort({ by: sortBy, order: 'asc' } as UISortOrder);
    } else if (current.order === 'asc') {
      setSort({ by: sortBy, order: 'desc' } as UISortOrder);
    } else {
      setSort({ by: 'amount', order: 'asc' } as UISortOrder);
    }
  };

  // Export disabled for Data Discovery due to large data volumes

  const activeFilters: FilterItem[] = useMemo(() => {
    const items: FilterItem[] = [];
    selectedYearOptions.forEach((y) => items.push({ key: 'years', id: String(y.id), label: 'Year', value: String(y.label) }))
    selectedEntityOptions.forEach((e) => items.push({ key: 'entities', id: String(e.id), label: 'Entity', value: e.label }))
    selectedUatOptions.forEach((u) => items.push({ key: 'uats', id: String(u.id), label: 'UAT', value: u.label }))
    selectedEconomicClassificationOptions.forEach((ec) => items.push({ key: 'economicClassifications', id: String(ec.id), label: 'Economic', value: ec.label }))
    selectedFunctionalClassificationOptions.forEach((fc) => items.push({ key: 'functionalClassifications', id: String(fc.id), label: 'Functional', value: fc.label }))
    selectedAccountTypeOptions.forEach((a) => items.push({ key: 'accountTypes', id: String(a.id), label: 'Account', value: a.label }))
    selectedEntityTypeOptions.forEach((t) => items.push({ key: 'entityTypes', id: String(t.id), label: 'Entity Type', value: t.label }))
    if (minAmount) items.push({ key: 'minAmount', label: 'Min', value: String(minAmount) })
    if (maxAmount) items.push({ key: 'maxAmount', label: 'Max', value: String(maxAmount) })
    return items
  }, [selectedYearOptions, selectedEntityOptions, selectedUatOptions, selectedEconomicClassificationOptions, selectedFunctionalClassificationOptions, selectedAccountTypeOptions, selectedEntityTypeOptions, minAmount, maxAmount])

  const handleRemoveFilter = (key: string, id?: string) => {
    switch (key) {
      case 'years':
        setSelectedYearOptions((prev) => prev.filter((o) => String(o.id) !== String(id)))
        break
      case 'entities':
        setSelectedEntityOptions((prev) => prev.filter((o) => String(o.id) !== String(id)))
        break
      case 'uats':
        setSelectedUatOptions((prev) => prev.filter((o) => String(o.id) !== String(id)))
        break
      case 'economicClassifications':
        setSelectedEconomicClassificationOptions((prev) => prev.filter((o) => String(o.id) !== String(id)))
        break
      case 'functionalClassifications':
        setSelectedFunctionalClassificationOptions((prev) => prev.filter((o) => String(o.id) !== String(id)))
        break
      case 'accountTypes':
        setSelectedAccountTypeOptions((prev) => prev.filter((o) => String(o.id) !== String(id)))
        break
      case 'entityTypes':
        // Not exposed via setter; skipping here intentionally
        break
      case 'minAmount':
        // handled via useFilterSearch setMinAmount if needed; out-of-scope for tag removal here
        break
      case 'maxAmount':
        // handled via useFilterSearch setMaxAmount if needed
        break
      default:
        break
    }
    setPage(1)
  }

  const handleQuickFilter = (qf: { kind: string; id: string | number; label: string }) => {
    if (qf.kind === 'entity') {
      setSelectedEntityOptions((prev) => (prev.some((o) => String(o.id) === String(qf.id)) ? prev : [...prev, { id: String(qf.id), label: qf.label }]))
    } else if (qf.kind === 'year') {
      setSelectedYearOptions((prev) => (prev.some((o) => Number(o.id) === Number(qf.id)) ? prev : [...prev, { id: Number(qf.id), label: qf.label }]))
    } else if (qf.kind === 'functional') {
      setSelectedFunctionalClassificationOptions((prev) => (prev.some((o) => String(o.id) === String(qf.id)) ? prev : [...prev, { id: String(qf.id), label: qf.label }]))
    } else if (qf.kind === 'economic') {
      setSelectedEconomicClassificationOptions((prev) => (prev.some((o) => String(o.id) === String(qf.id)) ? prev : [...prev, { id: String(qf.id), label: qf.label }]))
    } else if (qf.kind === 'account') {
      setSelectedAccountTypeOptions((prev) => (prev.some((o) => String(o.id) === String(qf.id)) ? prev : [...prev, { id: String(qf.id), label: qf.label }]))
    }
    setPage(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="container mx-auto py-4 px-2 md:px-6 space-y-6 max-w-full">
      <div className="px-1 md:px-0">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">Data Discovery</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Explore, analyze, and visualize public spending data.
        </p>
      </div>

      <DataDiscoveryLayout>
        <div className="flex items-center justify-end gap-2 mb-2">
          <Button variant="ghost" size="sm" onClick={() => resetFilters()}>Clear filters</Button>
        </div>
        {hasError ? (
          <div className="p-6 flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="font-medium text-red-500">Error loading data</h3>
              <p className="text-muted-foreground mt-2">{errorMessage}</p>
              <p className="text-muted-foreground mt-1">
                Please try again later or contact support.
              </p>
            </div>
          </div>
        ) : (
          <DataDisplay
            budgetItems={paginatedBudgetItems}
            isLoading={isLoading}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            sort={sort}
            onSortColumn={handleSortColumn}
            onQuickFilter={handleQuickFilter}
            activeFilters={activeFilters}
            onRemoveFilter={handleRemoveFilter}
            onClearFilters={() => resetFilters()}
          />
        )}
      </DataDiscoveryLayout>
    </div>
  );
}

const mapColumnIdToSortBy = (columnId: string): UISortOrder['by'] => {
  switch (columnId) {
    case "entity_name":
      return "entity_cui";
    case "year":
      return "year";
    case "amount":
      return "amount";
    case "account_category":
      return "account_category";
    case "functional_name":
      return "functional_code";
    case "economic_name":
      return "economic_code";
    default:
      return 'amount';
  }
};
