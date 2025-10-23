import { useMultiSelectInfinite } from '@/components/filters/base-filter/hooks/useMultiSelectInfinite';
import { graphqlRequest } from '@/lib/api/graphql';
import { useState } from 'react';
import { SearchInput } from '@/components/filters/base-filter/SearchInput';
import { BaseListProps, PageData, OptionItem } from '@/components/filters/base-filter/interfaces';
import { ErrorDisplay } from '@/components/filters/base-filter/ErrorDisplay';
import { ListContainer } from '@/components/filters/base-filter/ListContainer';
import { ListOption } from '@/components/filters/base-filter/ListOption';
import { cn, getUserLocale } from '@/lib/utils';
import { VirtualItem } from '@tanstack/react-virtual';
import { Dataset } from '@/lib/api/datasets';
import { t } from '@lingui/core/macro';

interface DatasetListProps extends Omit<BaseListProps, 'toggleSelect'> {
    addDatasets: (datasets: Dataset[]) => void;
    toggleSelect: (dataset: Dataset) => void;
}

export function DatasetList({
    selectedOptions,
    toggleSelect,
    pageSize = 100,
    className,
    addDatasets,
}: DatasetListProps) {
    const [searchFilter, setSearchFilter] = useState("");
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
            const locale = getUserLocale();
            const query = `
              query Datasets($search: String!, $limit: Int!, $offset: Int!, $lang: String) {
                datasets(filter: { search: $search }, limit: $limit, offset: $offset, lang: $lang) {
                    nodes {
                        id
                        name
                        description
                        sourceName
                        sourceUrl
                        xAxis { name type unit }
                        yAxis { name type unit }
                    }
                  pageInfo { totalCount hasNextPage }
                }
              }
            `;
            const limit = pageSize;
            const variables = { search: searchFilter, limit, offset: pageParam, lang: locale === 'en' ? 'en' : undefined };
            const response = await graphqlRequest<{
                datasets: { nodes: Dataset[]; pageInfo: { totalCount: number; hasNextPage: boolean; hasPreviousPage: boolean } };
            }>(query, variables);
            addDatasets(response.datasets.nodes);
            return {
                nodes: response.datasets.nodes,
                pageInfo: response.datasets.pageInfo,
                nextOffset: pageParam + response.datasets.nodes.length,
            };
        }
    });

    const showNoResults = !isLoading && !isError && items.length === 0 && searchFilter.length > 0;
    const isEmpty = !isLoading && !isError && items.length === 0 && !searchFilter;
    return (
        <div className={cn("w-full flex flex-col space-y-3", className)}>
            <SearchInput
                onChange={setSearchFilter}
                placeholder={t`Search datasets (ex: PIB)`}
                initialValue={searchFilter}
            />

            {isError && error && (
                <ErrorDisplay
                    error={error as Error}
                    refetch={refetch}
                    title={t`Could Not Load Datasets`}
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
                                        toggleSelect(option)
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