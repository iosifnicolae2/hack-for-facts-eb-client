import { memo } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Layers } from 'lucide-react'
import { Trans } from '@lingui/react/macro'
import { ClassificationTreeItem } from './ClassificationTreeItem'
import type { ClassificationNode, TreeExpansionState } from '@/types/classification-explorer'

type ClassificationTreeProps = {
  readonly nodes: readonly ClassificationNode[]
  readonly selectedCode: string | undefined
  readonly expansionState: TreeExpansionState
  readonly highlightedCodes: Set<string>
  readonly searchTerm?: string
  readonly onSelect: (code: string) => void
}

const TreeNodeRenderer = memo(function TreeNodeRenderer({
  node,
  selectedCode,
  expansionState,
  highlightedCodes,
  searchTerm,
  onSelect,
  level = 0,
}: {
  readonly node: ClassificationNode
  readonly selectedCode: string | undefined
  readonly expansionState: TreeExpansionState
  readonly highlightedCodes: Set<string>
  readonly searchTerm?: string
  readonly onSelect: (code: string) => void
  readonly level?: number
}) {
  const isSelected = node.code === selectedCode
  const isExpanded = expansionState.expandedNodes.has(node.code)
  const isHighlighted = highlightedCodes.has(node.code)
  const hasChildren = node.children.length > 0

  return (
    <>
      <ClassificationTreeItem
        node={node}
        isSelected={isSelected}
        isExpanded={isExpanded}
        isHighlighted={isHighlighted}
        level={level}
        searchTerm={searchTerm}
        onSelect={onSelect}
        onToggleExpand={expansionState.toggleNode}
      />

      {/* Render children if expanded */}
      {hasChildren && isExpanded && (
        <>
          {node.children.map((child) => (
            <TreeNodeRenderer
              key={child.code}
              node={child}
              selectedCode={selectedCode}
              expansionState={expansionState}
              highlightedCodes={highlightedCodes}
              searchTerm={searchTerm}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </>
      )}
    </>
  )
})

export function ClassificationTree({
  nodes,
  selectedCode,
  expansionState,
  highlightedCodes,
  searchTerm,
  onSelect,
}: ClassificationTreeProps) {
  if (nodes.length === 0) {
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
    <ScrollArea className="h-[calc(100vh-280px)] md:h-[calc(100vh-300px)]">
      <div className="divide-y">
        {nodes.map((node) => (
          <TreeNodeRenderer
            key={node.code}
            node={node}
            selectedCode={selectedCode}
            expansionState={expansionState}
            highlightedCodes={highlightedCodes}
            searchTerm={searchTerm}
            onSelect={onSelect}
            level={0}
          />
        ))}
      </div>
    </ScrollArea>
  )
}
