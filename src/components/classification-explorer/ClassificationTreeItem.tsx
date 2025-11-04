import { memo } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TextHighlight } from './TextHighlight'
import type { ClassificationNode } from '@/types/classification-explorer'

type ClassificationTreeItemProps = {
  readonly node: ClassificationNode
  readonly isSelected: boolean
  readonly isExpanded: boolean
  readonly isHighlighted: boolean
  readonly level: number
  readonly searchTerm?: string
  readonly onSelect: (code: string) => void
  readonly onToggleExpand: (code: string) => void
}

export const ClassificationTreeItem = memo(function ClassificationTreeItem({
  node,
  isSelected,
  isExpanded,
  level,
  searchTerm = '',
  onSelect,
  onToggleExpand,
}: ClassificationTreeItemProps) {
  const hasChildren = node.children.length > 0

  return (
    <div
      className={cn(
        'group flex items-center transition-colors border-b last:border-b-0 hover:bg-muted/50',
      )}
    >
      {/* Expand/Collapse button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          if (hasChildren) {
            onToggleExpand(node.code)
          }
        }}
        className={cn(
          "flex h-full items-center justify-center shrink-0 px-2 py-3 transition-colors",
          hasChildren ? "hover:bg-accent/10 cursor-pointer" : "cursor-default"
        )}
        style={{ marginLeft: `${level * 1.5}rem` }}
        disabled={!hasChildren}
      >
        {hasChildren ? (
          <ChevronRight
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform',
              isExpanded && 'rotate-90'
            )}
          />
        ) : (
          <div className="h-4 w-4" />
        )}
      </button>

      {/* Node content - clickable area */}
      <button
        type="button"
        onClick={() => onSelect(node.code)}
        className="flex min-w-0 flex-1 items-center gap-4 px-4 py-3 text-left cursor-pointer"
      >
        {/* Code */}
        <div className="shrink-0">
          <span className={cn(
            "font-mono text-sm font-bold",
            isSelected ? 'text-foreground' : 'text-muted-foreground'
          )}>
            <TextHighlight text={node.code} search={searchTerm} />
          </span>
        </div>

        {/* Name */}
        <div className="min-w-0 flex-1">
          <p className={cn(
            "text-sm leading-snug break-words",
            isSelected ? 'font-medium text-foreground' : 'font-medium'
          )}>
            <TextHighlight text={node.name} search={searchTerm} />
          </p>
        </div>

        {/* Navigation arrow */}
        <div className="shrink-0">
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </div>
      </button>
    </div>
  )
})
