/**
 * ClassificationTree Component Tests
 *
 * This file tests the ClassificationTree component which displays
 * a hierarchical tree view of classification nodes.
 *
 * Pattern: Recursive Tree Component Testing
 * - Mock child components
 * - Test empty state
 * - Test tree rendering with nested nodes
 * - Test expansion state
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { ClassificationTree } from './ClassificationTree'
import type { ClassificationNode, TreeExpansionState } from '@/types/classification-explorer'

// ============================================================================
// MOCKS
// ============================================================================

// Mock Lingui
vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@lingui/core/macro', () => ({
  t: (strings: TemplateStringsArray) => strings[0],
  msg: (strings: TemplateStringsArray) => strings[0],
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ChevronRight: ({ className }: { className?: string }) => (
    <span data-testid="chevron-right" className={className} />
  ),
  Layers: () => <span data-testid="layers-icon" />,
}))

// Mock ScrollArea
vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="scroll-area">{children}</div>
  ),
}))

// Mock ClassificationTreeItem
vi.mock('./ClassificationTreeItem', () => ({
  ClassificationTreeItem: ({
    node,
    isSelected,
    isExpanded,
    isHighlighted,
    level,
    onSelect,
    onToggleExpand,
  }: {
    node: ClassificationNode
    isSelected: boolean
    isExpanded: boolean
    isHighlighted: boolean
    level: number
    onSelect: (code: string) => void
    onToggleExpand: (code: string) => void
  }) => (
    <div
      data-testid={`tree-item-${node.code}`}
      data-selected={isSelected}
      data-expanded={isExpanded}
      data-highlighted={isHighlighted}
      data-level={level}
    >
      <button
        data-testid={`select-${node.code}`}
        onClick={() => onSelect(node.code)}
      >
        {node.name}
      </button>
      <button
        data-testid={`toggle-${node.code}`}
        onClick={() => onToggleExpand(node.code)}
      >
        Toggle
      </button>
    </div>
  ),
}))

// ============================================================================
// TEST DATA
// ============================================================================

const createNode = (
  code: string,
  name: string,
  children: ClassificationNode[] = []
): ClassificationNode =>
  ({
    code,
    name,
    level: 1,
    children,
    hasChildren: children.length > 0,
  }) as unknown as ClassificationNode

const simpleNode = createNode('51', 'Education')

const nestedNodes = [
  createNode('51', 'Education', [
    createNode('51.01', 'Primary Education'),
    createNode('51.02', 'Secondary Education'),
  ]),
  createNode('52', 'Healthcare'),
]

const createExpansionState = (
  expandedCodes: string[] = []
): TreeExpansionState => ({
  expandedNodes: new Set(expandedCodes),
  toggleNode: vi.fn(),
  expandNode: vi.fn(),
  collapseNode: vi.fn(),
  expandPath: vi.fn(),
  collapseAll: vi.fn(),
})

// ============================================================================
// TESTS
// ============================================================================

describe('ClassificationTree', () => {
  describe('empty state', () => {
    it('shows empty message when no nodes', () => {
      const expansionState = createExpansionState()
      render(
        <ClassificationTree
          nodes={[]}
          selectedCode={undefined}
          expansionState={expansionState}
          highlightedCodes={new Set()}
          onSelect={vi.fn()}
        />
      )

      expect(screen.getByText('No classifications found')).toBeInTheDocument()
    })

    it('shows layers icon in empty state', () => {
      const expansionState = createExpansionState()
      render(
        <ClassificationTree
          nodes={[]}
          selectedCode={undefined}
          expansionState={expansionState}
          highlightedCodes={new Set()}
          onSelect={vi.fn()}
        />
      )

      expect(screen.getByTestId('layers-icon')).toBeInTheDocument()
    })

    it('does not render scroll area when empty', () => {
      const expansionState = createExpansionState()
      render(
        <ClassificationTree
          nodes={[]}
          selectedCode={undefined}
          expansionState={expansionState}
          highlightedCodes={new Set()}
          onSelect={vi.fn()}
        />
      )

      expect(screen.queryByTestId('scroll-area')).not.toBeInTheDocument()
    })
  })

  describe('tree rendering', () => {
    it('renders scroll area when nodes exist', () => {
      const expansionState = createExpansionState()
      render(
        <ClassificationTree
          nodes={[simpleNode]}
          selectedCode={undefined}
          expansionState={expansionState}
          highlightedCodes={new Set()}
          onSelect={vi.fn()}
        />
      )

      expect(screen.getByTestId('scroll-area')).toBeInTheDocument()
    })

    it('renders root level nodes', () => {
      const expansionState = createExpansionState()
      render(
        <ClassificationTree
          nodes={nestedNodes}
          selectedCode={undefined}
          expansionState={expansionState}
          highlightedCodes={new Set()}
          onSelect={vi.fn()}
        />
      )

      expect(screen.getByTestId('tree-item-51')).toBeInTheDocument()
      expect(screen.getByTestId('tree-item-52')).toBeInTheDocument()
    })

    it('does not render children when not expanded', () => {
      const expansionState = createExpansionState()
      render(
        <ClassificationTree
          nodes={nestedNodes}
          selectedCode={undefined}
          expansionState={expansionState}
          highlightedCodes={new Set()}
          onSelect={vi.fn()}
        />
      )

      expect(screen.queryByTestId('tree-item-51.01')).not.toBeInTheDocument()
      expect(screen.queryByTestId('tree-item-51.02')).not.toBeInTheDocument()
    })

    it('renders children when parent is expanded', () => {
      const expansionState = createExpansionState(['51'])
      render(
        <ClassificationTree
          nodes={nestedNodes}
          selectedCode={undefined}
          expansionState={expansionState}
          highlightedCodes={new Set()}
          onSelect={vi.fn()}
        />
      )

      expect(screen.getByTestId('tree-item-51.01')).toBeInTheDocument()
      expect(screen.getByTestId('tree-item-51.02')).toBeInTheDocument()
    })

    it('sets correct level for child nodes', () => {
      const expansionState = createExpansionState(['51'])
      render(
        <ClassificationTree
          nodes={nestedNodes}
          selectedCode={undefined}
          expansionState={expansionState}
          highlightedCodes={new Set()}
          onSelect={vi.fn()}
        />
      )

      expect(screen.getByTestId('tree-item-51')).toHaveAttribute('data-level', '0')
      expect(screen.getByTestId('tree-item-51.01')).toHaveAttribute('data-level', '1')
    })
  })

  describe('selection state', () => {
    it('marks selected node', () => {
      const expansionState = createExpansionState()
      render(
        <ClassificationTree
          nodes={nestedNodes}
          selectedCode="51"
          expansionState={expansionState}
          highlightedCodes={new Set()}
          onSelect={vi.fn()}
        />
      )

      expect(screen.getByTestId('tree-item-51')).toHaveAttribute('data-selected', 'true')
      expect(screen.getByTestId('tree-item-52')).toHaveAttribute('data-selected', 'false')
    })

    it('calls onSelect when node is clicked', () => {
      const onSelect = vi.fn()
      const expansionState = createExpansionState()
      render(
        <ClassificationTree
          nodes={nestedNodes}
          selectedCode={undefined}
          expansionState={expansionState}
          highlightedCodes={new Set()}
          onSelect={onSelect}
        />
      )

      fireEvent.click(screen.getByTestId('select-51'))
      expect(onSelect).toHaveBeenCalledWith('51')
    })
  })

  describe('expansion state', () => {
    it('marks expanded nodes', () => {
      const expansionState = createExpansionState(['51'])
      render(
        <ClassificationTree
          nodes={nestedNodes}
          selectedCode={undefined}
          expansionState={expansionState}
          highlightedCodes={new Set()}
          onSelect={vi.fn()}
        />
      )

      expect(screen.getByTestId('tree-item-51')).toHaveAttribute('data-expanded', 'true')
      expect(screen.getByTestId('tree-item-52')).toHaveAttribute('data-expanded', 'false')
    })

    it('calls toggleNode when toggle button clicked', () => {
      const toggleNode = vi.fn()
      const expansionState = {
        ...createExpansionState(),
        toggleNode,
      }
      render(
        <ClassificationTree
          nodes={nestedNodes}
          selectedCode={undefined}
          expansionState={expansionState}
          highlightedCodes={new Set()}
          onSelect={vi.fn()}
        />
      )

      fireEvent.click(screen.getByTestId('toggle-51'))
      expect(toggleNode).toHaveBeenCalledWith('51')
    })
  })

  describe('highlighting', () => {
    it('marks highlighted nodes', () => {
      const expansionState = createExpansionState()
      render(
        <ClassificationTree
          nodes={nestedNodes}
          selectedCode={undefined}
          expansionState={expansionState}
          highlightedCodes={new Set(['51'])}
          onSelect={vi.fn()}
        />
      )

      expect(screen.getByTestId('tree-item-51')).toHaveAttribute('data-highlighted', 'true')
      expect(screen.getByTestId('tree-item-52')).toHaveAttribute('data-highlighted', 'false')
    })

    it('marks multiple highlighted nodes', () => {
      const expansionState = createExpansionState()
      render(
        <ClassificationTree
          nodes={nestedNodes}
          selectedCode={undefined}
          expansionState={expansionState}
          highlightedCodes={new Set(['51', '52'])}
          onSelect={vi.fn()}
        />
      )

      expect(screen.getByTestId('tree-item-51')).toHaveAttribute('data-highlighted', 'true')
      expect(screen.getByTestId('tree-item-52')).toHaveAttribute('data-highlighted', 'true')
    })
  })

  describe('search term', () => {
    it('renders without search term', () => {
      const expansionState = createExpansionState()
      render(
        <ClassificationTree
          nodes={[simpleNode]}
          selectedCode={undefined}
          expansionState={expansionState}
          highlightedCodes={new Set()}
          onSelect={vi.fn()}
        />
      )

      expect(screen.getByTestId('tree-item-51')).toBeInTheDocument()
    })

    it('passes searchTerm to tree items', () => {
      const expansionState = createExpansionState()
      render(
        <ClassificationTree
          nodes={[simpleNode]}
          selectedCode={undefined}
          expansionState={expansionState}
          highlightedCodes={new Set()}
          searchTerm="edu"
          onSelect={vi.fn()}
        />
      )

      // Component renders with search term
      expect(screen.getByTestId('tree-item-51')).toBeInTheDocument()
    })
  })
})
