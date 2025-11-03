import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { ClassificationNode } from '@/types/classification-explorer'

type ClassificationTreeItemProps = {
  readonly node: ClassificationNode
  readonly isSelected: boolean
  readonly isExpanded: boolean
  readonly isHighlighted: boolean
  readonly level: number
  readonly onSelect: (code: string) => void
  readonly onToggleExpand: (code: string) => void
}

export function ClassificationTreeItem({
  node,
  isSelected,
  isExpanded,
  isHighlighted,
  level,
  onSelect,
  onToggleExpand,
}: ClassificationTreeItemProps) {
  const hasChildren = node.children.length > 0

  return (
    <div
      className={cn(
        'group flex items-center gap-2 rounded-lg border border-transparent px-3 py-2 transition-colors',
        isSelected && 'border-primary bg-primary/5',
        isHighlighted && !isSelected && 'bg-accent/50',
        !isSelected && !isHighlighted && 'hover:bg-accent/30'
      )}
      style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
    >
      {/* Expand/Collapse button */}
      {hasChildren ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleExpand(node.code)
          }}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-accent"
        >
          <ChevronRight
            className={cn(
              'h-4 w-4 transition-transform',
              isExpanded && 'rotate-90'
            )}
          />
        </button>
      ) : (
        <div className="h-5 w-5 shrink-0" />
      )}

      {/* Node content */}
      <button
        type="button"
        onClick={() => onSelect(node.code)}
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
      >
        <Badge
          variant={isSelected ? 'default' : 'secondary'}
          className="shrink-0 font-mono text-xs"
        >
          {node.code}
        </Badge>
        <span
          className={cn(
            'min-w-0 flex-1 truncate text-sm',
            isSelected ? 'font-medium text-foreground' : 'text-muted-foreground'
          )}
          title={node.name}
        >
          {node.name}
        </span>
      </button>
    </div>
  )
}
