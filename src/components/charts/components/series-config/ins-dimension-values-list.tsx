import { useState } from 'react';
import { t } from '@lingui/core/macro';
import type { VirtualItem } from '@tanstack/react-virtual';

import { useMultiSelectInfinite } from '@/components/filters/base-filter/hooks/useMultiSelectInfinite';
import { ErrorDisplay } from '@/components/filters/base-filter/ErrorDisplay';
import type { BaseListProps, OptionItem, PageData } from '@/components/filters/base-filter/interfaces';
import { ListContainer } from '@/components/filters/base-filter/ListContainer';
import { ListOption } from '@/components/filters/base-filter/ListOption';
import { SearchInput } from '@/components/filters/base-filter/SearchInput';
import { getInsDimensionValuesPage } from '@/lib/api/ins';
import { cn, getUserLocale } from '@/lib/utils';
import {
  mapInsDimensionValueToOption,
  type InsDimensionOptionKind,
} from './ins-series-editor.utils';

interface InsDimensionValuesListProps extends BaseListProps {
  datasetCode: string;
  dimensionIndex: number;
  optionKind: InsDimensionOptionKind;
  classificationTypeCode?: string;
}

function dedupeOptions(options: OptionItem[]): OptionItem[] {
  const seen = new Set<string>();
  const deduped: OptionItem[] = [];

  for (const option of options) {
    const id = String(option.id);
    if (seen.has(id)) continue;
    seen.add(id);
    deduped.push(option);
  }

  return deduped;
}

function getPlaceholder(optionKind: InsDimensionOptionKind): string {
  if (optionKind === 'classification') return t`Search classification values`;
  if (optionKind === 'unit') return t`Search units`;
  if (optionKind === 'territory') return t`Search territories`;
  return t`Search localities`;
}

function getErrorTitle(optionKind: InsDimensionOptionKind): string {
  if (optionKind === 'classification') return t`Could not load classifications`;
  if (optionKind === 'unit') return t`Could not load units`;
  if (optionKind === 'territory') return t`Could not load territories`;
  return t`Could not load localities`;
}

function getAriaLabel(optionKind: InsDimensionOptionKind): string {
  if (optionKind === 'classification') return t`Classification options`;
  if (optionKind === 'unit') return t`Unit options`;
  if (optionKind === 'territory') return t`Territory options`;
  return t`Locality options`;
}

export function InsDimensionValuesList({
  selectedOptions,
  toggleSelect,
  pageSize = 100,
  className,
  datasetCode,
  dimensionIndex,
  optionKind,
  classificationTypeCode,
}: InsDimensionValuesListProps) {
  const [searchFilter, setSearchFilter] = useState('');
  const locale = getUserLocale() === 'en' ? 'en' : 'ro';
  const searchVisibilityThreshold = 15;
  const placeholder = getPlaceholder(optionKind);

  const {
    items,
    totalCount,
    parentRef,
    rowVirtualizer,
    isLoading,
    isError,
    error,
    refetch,
    isFetchingNextPage,
  } = useMultiSelectInfinite<OptionItem>({
    itemSize: 48,
    queryKey: [
      'ins-dimension-values',
      datasetCode,
      String(dimensionIndex),
      optionKind,
      classificationTypeCode ?? '',
      locale,
      searchFilter,
    ],
    queryFn: async ({ pageParam = 0 }): Promise<PageData<OptionItem>> => {
      const response = await getInsDimensionValuesPage({
        datasetCode,
        dimensionIndex,
        search: searchFilter.trim() || undefined,
        limit: pageSize,
        offset: pageParam,
      });

      const mappedOptions = dedupeOptions(
        response.nodes
          .map((value) =>
            mapInsDimensionValueToOption(value, optionKind, classificationTypeCode, locale)
          )
          .filter((value): value is OptionItem => value !== null)
      );

      return {
        nodes: mappedOptions,
        pageInfo: response.pageInfo,
        nextOffset: pageParam + response.nodes.length,
      };
    },
  });

  const showSearchInput = searchFilter.length > 0 || totalCount > searchVisibilityThreshold;
  const showNoResults = !isLoading && !isError && items.length === 0 && searchFilter.length > 0;
  const isEmpty = !isLoading && !isError && items.length === 0 && searchFilter.length === 0;

  return (
    <div className={cn('w-full flex flex-col space-y-3', className)}>
      {showSearchInput && (
        <SearchInput
          onChange={setSearchFilter}
          placeholder={placeholder}
          initialValue={searchFilter}
        />
      )}

      {isError && error && (
        <ErrorDisplay
          error={error as Error}
          refetch={refetch}
          title={getErrorTitle(optionKind)}
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
          className="min-h-[10rem]"
          ariaLabel={getAriaLabel(optionKind)}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow: VirtualItem) => {
            const option = items[virtualRow.index];
            if (!option) return null;

            const optionId = String(option.id);
            const isSelected = selectedOptions.some(
              (item: OptionItem) => String(item.id) === optionId
            );

            return (
              <ListOption
                key={optionId}
                uniqueIdPart={optionId}
                onClick={() => toggleSelect(option)}
                label={option.label}
                selected={isSelected}
                optionHeight={virtualRow.size}
                optionStart={virtualRow.start}
              />
            );
          })}
        </ListContainer>
      )}
    </div>
  );
}
