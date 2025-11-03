import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ChevronRight, Layers } from 'lucide-react'
import { Trans } from '@lingui/react/macro'
import type { ClassificationNode } from '@/types/classification-explorer'
import { TextHighlight } from './TextHighlight'

type ClassificationGridProps = {
  readonly items: readonly ClassificationNode[]
  readonly onSelect: (code: string) => void
  readonly searchTerm?: string
}

export function ClassificationGrid({
  items,
  onSelect,
  searchTerm = '',
}: ClassificationGridProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 6,
  })

  if (items.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-dashed">
        <div className="text-center space-y-2">
          <Layers className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">
            <Trans>No classifications found</Trans>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex items-center rounded-lg border bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{items.length}</span>
          <span className="text-muted-foreground">
            <Trans>classifications</Trans>
          </span>
        </div>
      </div>

      {/* Virtualized list */}
      <div
        ref={parentRef}
        className="h-[calc(100vh-280px)] md:h-[calc(100vh-300px)] overflow-auto rounded-lg border bg-card"
        style={{ contain: 'strict' }}
      >
        <div
          className="divide-y"
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = items[virtualItem.index]!

            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <button
                  onClick={() => onSelect(item.code)}
                  className="group w-full text-left transition-colors cursor-pointer hover:bg-muted bg-transparent"
                >
                  <div className="flex items-center gap-4 px-4 py-3">
                    <div className="shrink-0">
                      <span className="font-mono text-sm font-bold text-muted-foreground">
                        <TextHighlight text={item.code} search={searchTerm} />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug break-words">
                        {item.name ? (
                          <TextHighlight text={item.name} search={searchTerm} />
                        ) : (
                          <span className="italic text-muted-foreground/60"><Trans>Missing title</Trans></span>
                        )}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
