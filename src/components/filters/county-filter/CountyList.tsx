import { useState } from 'react'
import { BaseListProps, PageData } from '../base-filter/interfaces'
import { ListContainer } from '../base-filter/ListContainer'
import { ListOption } from '../base-filter/ListOption'
import { cn } from '@/lib/utils'
import { SearchInput } from '../base-filter/SearchInput'
import { useMultiSelectInfinite } from '../base-filter/hooks/useMultiSelectInfinite'
import { graphqlRequest } from '@/lib/api/graphql'
import { ErrorDisplay } from '../base-filter/ErrorDisplay'

type CountyOption = {
  county_code: string
  county_name: string
}

export function CountyList({ selectedOptions, toggleSelect, pageSize = 100, className }: BaseListProps) {
  const [searchFilter, setSearchFilter] = useState('')

  const {
    items,
    parentRef,
    rowVirtualizer,
    isLoading,
    isError,
    error,
    refetch,
    isFetchingNextPage,
  } = useMultiSelectInfinite<CountyOption>({
    itemSize: 48,
    queryKey: ['counties', searchFilter],
    queryFn: async ({ pageParam = 0 }): Promise<PageData<CountyOption>> => {
      const query = `
        query Counties($search: String!, $limit: Int!, $offset: Int!) {
          uats(filter: { search: $search, is_county: true }, limit: $limit, offset: $offset) {
            nodes {
              county_code
              county_name
            }
            pageInfo { totalCount hasNextPage }
          }
        }
      `
      const limit = pageSize
      const variables = { search: searchFilter, limit, offset: pageParam }
      const response = await graphqlRequest<{
        uats: { nodes: CountyOption[]; pageInfo: { totalCount: number; hasNextPage: boolean; hasPreviousPage: boolean } }
      }>(query, variables)
      return {
        nodes: response.uats.nodes,
        pageInfo: response.uats.pageInfo,
        nextOffset: pageParam + response.uats.nodes.length,
      }
    },
  })

  const showNoResults = !isLoading && !isError && items.length === 0 && searchFilter.length > 0
  const isEmpty = !isLoading && !isError && items.length === 0 && !searchFilter

  return (
    <div className={cn('w-full flex flex-col space-y-3', className)}>
      <SearchInput onChange={setSearchFilter} placeholder="Search counties..." initialValue={searchFilter} />

      {isError && error && <ErrorDisplay error={error as Error} refetch={refetch} title="Could Not Load Counties" />}

      {!isError && (
        <ListContainer
          ref={parentRef}
          height={rowVirtualizer.getTotalSize()}
          isFetchingNextPage={isFetchingNextPage}
          isLoading={isLoading}
          isSearchResultsEmpty={showNoResults}
          isEmpty={isEmpty}
          className="min-h-[10rem]"
        >
          {rowVirtualizer.getVirtualItems().length > 0
            ? rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const option = items[virtualRow.index]
                if (!option) return null
                const isSelected = selectedOptions.some((item) => item.id === option.county_code)
                const label = `${option.county_name} (${option.county_code})`
                return (
                  <ListOption
                    key={option.county_code}
                    uniqueIdPart={option.county_code}
                    onClick={() => toggleSelect({ id: option.county_code, label })}
                    label={label}
                    selected={isSelected}
                    optionHeight={virtualRow.size}
                    optionStart={virtualRow.start}
                  />
                )
              })
            : null}
        </ListContainer>
      )}
    </div>
  )
}


