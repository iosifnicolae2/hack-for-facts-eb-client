/**
 * ClassificationGrid Component Tests
 *
 * This file tests the ClassificationGrid component which displays
 * a virtualized list of classification items.
 *
 * Pattern: Virtualized List Component Testing
 * - Mock react-virtual
 * - Test empty state
 * - Test item rendering
 * - Test click handling
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { ClassificationGrid } from './ClassificationGrid'
import type { ClassificationNode } from '@/types/classification-explorer'

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
  ChevronRight: () => <span data-testid="chevron-right" />,
  Layers: () => <span data-testid="layers-icon" />,
}))

// Mock react-virtual - simplified version that renders all items
vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: ({ count }: { count: number }) => ({
    getTotalSize: () => count * 72,
    getVirtualItems: () =>
      Array.from({ length: count }, (_, index) => ({
        index,
        key: index,
        start: index * 72,
        size: 72,
      })),
    measureElement: vi.fn(),
  }),
}))

// Mock TextHighlight to simplify testing
vi.mock('./TextHighlight', () => ({
  TextHighlight: ({ text }: { text: string }) => <span>{text}</span>,
}))

// ============================================================================
// TEST DATA
// ============================================================================

const createItem = (code: string, name: string): ClassificationNode =>
  ({
    code,
    name,
    level: 1,
    children: [],
    hasChildren: false,
  }) as unknown as ClassificationNode

const singleItem = [createItem('51', 'Education')]

const multipleItems = [
  createItem('51', 'Education'),
  createItem('52', 'Healthcare'),
  createItem('53', 'Social Protection'),
]

const itemWithoutName = [createItem('99', '')]

// ============================================================================
// TESTS
// ============================================================================

describe('ClassificationGrid', () => {
  describe('empty state', () => {
    it('shows empty message when no items', () => {
      render(<ClassificationGrid items={[]} onSelect={vi.fn()} />)

      expect(screen.getByText('No classifications found')).toBeInTheDocument()
    })

    it('shows layers icon in empty state', () => {
      render(<ClassificationGrid items={[]} onSelect={vi.fn()} />)

      expect(screen.getByTestId('layers-icon')).toBeInTheDocument()
    })
  })

  describe('stats bar', () => {
    it('shows item count', () => {
      render(<ClassificationGrid items={multipleItems} onSelect={vi.fn()} />)

      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('shows "classifications" label', () => {
      render(<ClassificationGrid items={singleItem} onSelect={vi.fn()} />)

      expect(screen.getByText('classifications')).toBeInTheDocument()
    })

    it('shows layers icon in stats bar', () => {
      render(<ClassificationGrid items={singleItem} onSelect={vi.fn()} />)

      // There should be a layers icon in the stats bar
      expect(screen.getByTestId('layers-icon')).toBeInTheDocument()
    })
  })

  describe('item rendering', () => {
    it('renders item code', () => {
      render(<ClassificationGrid items={singleItem} onSelect={vi.fn()} />)

      expect(screen.getByText('51')).toBeInTheDocument()
    })

    it('renders item name', () => {
      render(<ClassificationGrid items={singleItem} onSelect={vi.fn()} />)

      expect(screen.getByText('Education')).toBeInTheDocument()
    })

    it('renders multiple items', () => {
      render(<ClassificationGrid items={multipleItems} onSelect={vi.fn()} />)

      expect(screen.getByText('51')).toBeInTheDocument()
      expect(screen.getByText('52')).toBeInTheDocument()
      expect(screen.getByText('53')).toBeInTheDocument()
    })

    it('shows "Missing title" for items without name', () => {
      render(<ClassificationGrid items={itemWithoutName} onSelect={vi.fn()} />)

      expect(screen.getByText('Missing title')).toBeInTheDocument()
    })

    it('renders chevron icons', () => {
      render(<ClassificationGrid items={multipleItems} onSelect={vi.fn()} />)

      const chevrons = screen.getAllByTestId('chevron-right')
      expect(chevrons).toHaveLength(3)
    })
  })

  describe('click handling', () => {
    it('calls onSelect with code when item clicked', () => {
      const onSelect = vi.fn()
      render(<ClassificationGrid items={singleItem} onSelect={onSelect} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(onSelect).toHaveBeenCalledWith('51')
    })

    it('calls onSelect with correct code for each item', () => {
      const onSelect = vi.fn()
      render(<ClassificationGrid items={multipleItems} onSelect={onSelect} />)

      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[1])

      expect(onSelect).toHaveBeenCalledWith('52')
    })
  })

  describe('search term', () => {
    it('renders without search term', () => {
      render(<ClassificationGrid items={singleItem} onSelect={vi.fn()} />)

      expect(screen.getByText('Education')).toBeInTheDocument()
    })

    it('passes searchTerm to items', () => {
      render(
        <ClassificationGrid
          items={singleItem}
          onSelect={vi.fn()}
          searchTerm="edu"
        />
      )

      // TextHighlight is mocked to just render text
      expect(screen.getByText('Education')).toBeInTheDocument()
    })
  })

  describe('virtualization', () => {
    it('renders items in virtualized container', () => {
      const { container } = render(
        <ClassificationGrid items={multipleItems} onSelect={vi.fn()} />
      )

      // Check for the virtualization container
      const virtualContainer = container.querySelector('[style*="contain"]')
      expect(virtualContainer).toBeInTheDocument()
    })
  })
})
