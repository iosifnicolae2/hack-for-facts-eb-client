import { useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ClassificationSearch } from './ClassificationSearch'
import { ClassificationGrid } from './ClassificationGrid'
import { ClassificationDetail } from './ClassificationDetail'
import { useClassificationData } from './hooks/useClassificationData'
import { useClassificationHierarchy } from './hooks/useClassificationHierarchy'
import { useClassificationSearch } from './hooks/useClassificationSearch'
import type { ClassificationNode, ClassificationType } from '@/types/classification-explorer'

type ClassificationExplorerProps = {
  readonly type: ClassificationType
  readonly selectedCode?: string
}

export function ClassificationExplorer({
  type,
  selectedCode,
}: ClassificationExplorerProps) {
  const navigate = useNavigate()

  // Load classification data
  const { treeData, flatClassifications } = useClassificationData(type)

  // Get hierarchy for selected code
  const hierarchy = useClassificationHierarchy(type, selectedCode)

  // Search state
  const searchState = useClassificationSearch(type)
  const { matchedCodesWithAncestors, debouncedSearchTerm } = searchState

  // Handle type toggle
  const handleTypeChange = (newType: ClassificationType) => {
    if (newType === type) return
    const route = newType === 'functional'
      ? '/classifications/functional'
      : '/classifications/economic'
    navigate({
      to: route as any,
    })
  }

  // Handle classification selection
  const handleSelect = (code: string) => {
    if (type === 'functional') {
      navigate({
        to: '/classifications/functional/$code',
        params: { code },
      } as any)
    } else {
      navigate({
        to: '/classifications/economic/$code',
        params: { code },
      } as any)
    }
  }

  // Handle back to list
  const handleBack = () => {
    const route = type === 'functional'
      ? '/classifications/functional'
      : '/classifications/economic'
    navigate({
      to: route as any,
    })
  }

  // Get items to display
  const displayItems = useMemo(() => {
    // If there's a search, show all matching items
    if (debouncedSearchTerm) {
      const matchedItems: ClassificationNode[] = []

      // Get all matched codes
      flatClassifications.forEach(classification => {
        if (matchedCodesWithAncestors.has(classification.code)) {
          const item: ClassificationNode = {
            code: classification.code,
            name: classification.name,
            description: classification.description,
            level: treeData
              .concat(...treeData.flatMap(n => n.children))
              .concat(...treeData.flatMap(n => n.children).flatMap(n => n.children))
              .find(n => n.code === classification.code)?.level || 'chapter',
            parent: treeData
              .concat(...treeData.flatMap(n => n.children))
              .concat(...treeData.flatMap(n => n.children).flatMap(n => n.children))
              .find(n => n.code === classification.code)?.parent,
            children: [],
            hasChildren: false,
          }
          matchedItems.push(item)
        }
      })

      return matchedItems
    }

    // No search and no selection: show only chapter-level items
    if (!selectedCode) {
      return treeData
    }

    // If selected, detail view is shown (no grid)
    return []
  }, [debouncedSearchTerm, selectedCode, treeData, flatClassifications, matchedCodesWithAncestors])

  // Show detail view if we have a selected code
  const showDetailView = selectedCode && hierarchy

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        {/* Header with controls - only show in list view */}
        {!showDetailView && (
          <div className="mb-8 space-y-6">
            {/* Title and toggle */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">
                  <Trans>Classifications</Trans>
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                  <Trans>
                    Explore budget classifications to understand how public spending is organized and categorized
                  </Trans>
                </p>
              </div>
              <ToggleGroup
                type="single"
                value={type}
                onValueChange={(value) => {
                  if (value) handleTypeChange(value as ClassificationType)
                }}
                className="shrink-0"
              >
                <ToggleGroupItem value="functional" aria-label={t`Functional`} className="px-6">
                  <Trans>Functional</Trans>
                </ToggleGroupItem>
                <ToggleGroupItem value="economic" aria-label={t`Economic`} className="px-6">
                  <Trans>Economic</Trans>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Search */}
            <ClassificationSearch
              searchState={searchState}
              resultsCount={displayItems.length}
            />
          </div>
        )}

        {/* Content - either grid or detail */}
        <AnimatePresence mode="wait">
          {showDetailView ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <ClassificationDetail
                type={type}
                hierarchy={hierarchy}
                onBack={handleBack}
              />
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ClassificationGrid
                items={displayItems}
                onSelect={handleSelect}
                searchTerm={debouncedSearchTerm}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
