import { ScrollArea } from '@/components/ui/scroll-area'
import { ClassificationTreeItem } from './ClassificationTreeItem'
import type { ClassificationNode, TreeExpansionState } from '@/types/classification-explorer'

type ClassificationTreeProps = {
  readonly nodes: readonly ClassificationNode[]
  readonly selectedCode: string | undefined
  readonly expansionState: TreeExpansionState
  readonly highlightedCodes: Set<string>
  readonly onSelect: (code: string) => void
}

function TreeNodeRenderer({
  node,
  selectedCode,
  expansionState,
  highlightedCodes,
  onSelect,
  level = 0,
}: {
  readonly node: ClassificationNode
  readonly selectedCode: string | undefined
  readonly expansionState: TreeExpansionState
  readonly highlightedCodes: Set<string>
  readonly onSelect: (code: string) => void
  readonly level?: number
}) {
  const isSelected = node.code === selectedCode
  const isExpanded = expansionState.expandedNodes.has(node.code)
  const isHighlighted = highlightedCodes.has(node.code)
  const hasChildren = node.children.length > 0

  return (
    <div>
      <ClassificationTreeItem
        node={node}
        isSelected={isSelected}
        isExpanded={isExpanded}
        isHighlighted={isHighlighted}
        level={level}
        onSelect={onSelect}
        onToggleExpand={expansionState.toggleNode}
      />

      {/* Render children if expanded */}
      {hasChildren && isExpanded && (
        <div className="space-y-1">
          {node.children.map((child) => (
            <TreeNodeRenderer
              key={child.code}
              node={child}
              selectedCode={selectedCode}
              expansionState={expansionState}
              highlightedCodes={highlightedCodes}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function ClassificationTree({
  nodes,
  selectedCode,
  expansionState,
  highlightedCodes,
  onSelect,
}: ClassificationTreeProps) {
  if (nodes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-muted-foreground">
        No classifications found
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-4">
        {nodes.map((node) => (
          <TreeNodeRenderer
            key={node.code}
            node={node}
            selectedCode={selectedCode}
            expansionState={expansionState}
            highlightedCodes={highlightedCodes}
            onSelect={onSelect}
            level={0}
          />
        ))}
      </div>
    </ScrollArea>
  )
}
