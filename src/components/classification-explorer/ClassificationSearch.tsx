import { Search, X } from 'lucide-react'
import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { ClassificationSearchState } from '@/types/classification-explorer'

type ClassificationSearchProps = {
  readonly searchState: ClassificationSearchState
  readonly resultsCount?: number
}

export function ClassificationSearch({
  searchState,
  resultsCount,
}: ClassificationSearchProps) {
  const { searchTerm, setSearchTerm, clearSearch } = searchState

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t`Search by code or name...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">
              <Trans>Clear search</Trans>
            </span>
          </Button>
        )}
      </div>
      {searchTerm && resultsCount !== undefined && (
        <p className="text-sm text-muted-foreground">
          <Trans>{resultsCount} results found</Trans>
        </p>
      )}
    </div>
  )
}
