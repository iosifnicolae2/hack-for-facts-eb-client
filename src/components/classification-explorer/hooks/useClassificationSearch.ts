import { useState, useMemo, useCallback } from 'react'
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue'
import type {
  ClassificationType,
  ClassificationSearchState,
  FlatClassification,
} from '@/types/classification-explorer'
import {
  filterClassifications,
  getSearchMatchesWithAncestors,
} from '@/lib/classification-explorer-utils'
import { useClassificationData } from './useClassificationData'

/**
 * Hook for searching classifications with debouncing
 */
export function useClassificationSearch(
  type: ClassificationType,
  delay = 300
): ClassificationSearchState & {
  readonly filteredClassifications: readonly FlatClassification[]
  readonly matchedCodesWithAncestors: Set<string>
} {
  const { flatClassifications } = useClassificationData(type)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebouncedValue(searchTerm, delay)

  // Filter classifications based on search term
  const filteredClassifications = useMemo(
    () => filterClassifications(flatClassifications, debouncedSearchTerm),
    [flatClassifications, debouncedSearchTerm]
  )

  // Get all matched codes including ancestors (for tree expansion)
  const matchedCodesWithAncestors = useMemo(
    () => getSearchMatchesWithAncestors(flatClassifications, debouncedSearchTerm),
    [flatClassifications, debouncedSearchTerm]
  )

  const clearSearch = useCallback(() => {
    setSearchTerm('')
  }, [])

  const isSearching = searchTerm !== debouncedSearchTerm

  return {
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm,
    clearSearch,
    isSearching,
    filteredClassifications,
    matchedCodesWithAncestors,
  }
}
