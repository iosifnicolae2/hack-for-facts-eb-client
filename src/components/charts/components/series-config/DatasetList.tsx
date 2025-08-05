import { useMultiSelectInfinite } from '@/components/filters/base-filter/hooks/useMultiSelectInfinite';
import { graphqlRequest } from '@/lib/api/graphql';
import { useEffect, useState } from 'react';
import { SearchInput } from '@/components/filters/base-filter/SearchInput';
import { BaseListProps, PageData, OptionItem } from '@/components/filters/base-filter/interfaces';
import { ErrorDisplay } from '@/components/filters/base-filter/ErrorDisplay';
import { ListContainer } from '@/components/filters/base-filter/ListContainer';
import { ListOption } from '@/components/filters/base-filter/ListOption';
import { cn } from '@/lib/utils';
import { VirtualItem } from '@tanstack/react-virtual';
import { useDatasetStore } from '@/hooks/filters/useDatasetStore';
import { Dataset } from '@/lib/api/datasets';

export function DatasetList({
    selectedOptions,
    toggleSelect,
    pageSize = 100,
    className,
}: BaseListProps) {
    const [searchFilter, setSearchFilter] = useState("");
    const { add: addDatasets } = useDatasetStore([]);
    const {
        items,
        parentRef, // This ref needs to be passed to the scrollable element in FilterContainer
        rowVirtualizer,
        isLoading,
        isError,
        error,
        refetch,
        isFetchingNextPage,
    } = useMultiSelectInfinite<Dataset>({
        itemSize: 48,
        queryKey: ['datasets', searchFilter],
        queryFn: async ({ pageParam = 0 }): Promise<PageData<Dataset>> => {
            const query = `
              query Datasets($search: String!, $limit: Int!, $offset: Int!) {
                datasets(filter: { search: $search }, limit: $limit, offset: $offset) {
                    nodes { 
                        id
                        name
                        description
                        sourceName
                        sourceUrl
                    }
                  pageInfo { totalCount hasNextPage }
                }
              }
            `;
            const limit = pageSize;
            const variables = { search: searchFilter, limit, offset: pageParam };
            const response = await graphqlRequest<{
                datasets: { nodes: Dataset[]; pageInfo: { totalCount: number; hasNextPage: boolean; hasPreviousPage: boolean } };
            }>(query, variables);
            return {
                nodes: response.datasets.nodes,
                pageInfo: response.datasets.pageInfo,
                nextOffset: pageParam + response.datasets.nodes.length,
            };
        }
    });

    useEffect(() => {
        if (items.length > 0) {
            addDatasets(items);
        }
    }, [items, addDatasets]);

    const showNoResults = !isLoading && !isError && items.length === 0 && searchFilter.length > 0;
    const isEmpty = !isLoading && !isError && items.length === 0 && !searchFilter;
    return (
        <div className={cn("w-full flex flex-col space-y-3", className)}>
            <SearchInput
                onChange={setSearchFilter}
                placeholder="Cauta seturi de date (ex: PIB)"
                initialValue={searchFilter}
            />

            {isError && error && (
                <ErrorDisplay
                    error={error as Error}
                    refetch={refetch}
                    title="Could Not Load Datasets"
                />
            )}

            {!isError && (
                <ListContainer
                    ref={parentRef}
                    height={rowVirtualizer.getTotalSize()}
                    isFetchingNextPage={isFetchingNextPage}
                    isLoading={isLoading}
                    isSearchResultsEmpty={showNoResults}
                    isEmpty={isEmpty}
                    className="min-h-[10rem]" // Ensure a minimum height
                >
                    {rowVirtualizer.getVirtualItems().length > 0 ? (
                        rowVirtualizer.getVirtualItems().map((virtualRow: VirtualItem) => {
                            const option = items[virtualRow.index];
                            // It's good practice to ensure option exists, though virtualizer count should match items.length
                            if (!option) return null;
                            const isSelected = selectedOptions.some((item: OptionItem) => item.id === option.id);
                            return (
                                <ListOption
                                    key={option.id}
                                    uniqueIdPart={option.id}
                                    onClick={() => {
                                        toggleSelect({ id: option.id, label: option.name })
                                    }}
                                    label={option.name}
                                    selected={isSelected}
                                    optionHeight={virtualRow.size}
                                    optionStart={virtualRow.start}
                                />
                            );
                        })
                    ) : null}
                </ListContainer>
            )}
        </div>
    );
}