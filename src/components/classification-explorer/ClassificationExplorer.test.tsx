/**
 * ClassificationExplorer Component Tests
 *
 * This file tests the ClassificationExplorer component which provides
 * an interface for exploring budget classifications (functional and economic).
 *
 * Pattern: Complex Feature Component Testing
 * - Mock router (TanStack Router)
 * - Mock data hooks
 * - Test loading and not found states
 * - Test view modes (grid, tree, detail)
 * - Test navigation and search
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { ClassificationExplorer } from './ClassificationExplorer'
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

// Mock framer-motion
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

// Mock TanStack Router
const mockNavigate = vi.fn()
const mockSearchParams = { q: '', view: 'grid' as const }

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  useSearch: () => mockSearchParams,
}))

// Mock classification data hooks
const mockTreeData: ClassificationNode[] = [
  {
    code: '01',
    name: 'General Services',
    description: 'General public services',
    level: 'chapter',
    children: [
      {
        code: '01.01',
        name: 'Executive Services',
        description: 'Executive and legislative organs',
        level: 'chapter',
        parent: '01',
        children: [],
        hasChildren: false,
      },
    ],
    hasChildren: true,
  },
  {
    code: '02',
    name: 'Defense',
    description: 'Defense services',
    level: 'chapter',
    children: [],
    hasChildren: false,
  },
]

const mockFlatClassifications = [
  { code: '01', name: 'General Services', description: 'General public services' },
  { code: '01.01', name: 'Executive Services', description: 'Executive and legislative organs' },
  { code: '02', name: 'Defense', description: 'Defense services' },
]

const mockIsLoading = vi.fn(() => false)
const mockHierarchy = vi.fn<() => { code: string; name: string } | null>(() => null)

vi.mock('./hooks/useClassificationData', () => ({
  useClassificationData: () => ({
    treeData: mockTreeData,
    flatClassifications: mockFlatClassifications,
    isLoading: mockIsLoading(),
  }),
}))

vi.mock('./hooks/useClassificationHierarchy', () => ({
  useClassificationHierarchy: () => mockHierarchy(),
}))

vi.mock('./hooks/useClassificationSearch', () => ({
  useClassificationSearch: () => ({
    searchTerm: '',
    setSearchTerm: vi.fn(),
    debouncedSearchTerm: '',
    matchedCodesWithAncestors: new Set<string>(),
  }),
}))

vi.mock('./hooks/useClassificationTree', () => ({
  useClassificationTree: () => ({
    expandedCodes: new Set<string>(),
    toggleExpanded: vi.fn(),
    expandAll: vi.fn(),
    collapseAll: vi.fn(),
    setExpandedCodes: vi.fn(),
  }),
  useSearchExpansion: () => {},
}))

// Mock child components
vi.mock('./ClassificationSearch', () => ({
  ClassificationSearch: () => (
    <div data-testid="classification-search">Search</div>
  ),
}))

vi.mock('./ClassificationGrid', () => ({
  ClassificationGrid: ({ items, onSelect }: any) => (
    <div data-testid="classification-grid">
      {items.map((item: ClassificationNode) => (
        <button key={item.code} data-testid={`grid-item-${item.code}`} onClick={() => onSelect(item.code)}>
          {item.name}
        </button>
      ))}
    </div>
  ),
}))

vi.mock('./ClassificationTree', () => ({
  ClassificationTree: ({ nodes, onSelect }: any) => (
    <div data-testid="classification-tree">
      {nodes.map((node: ClassificationNode) => (
        <button key={node.code} data-testid={`tree-item-${node.code}`} onClick={() => onSelect(node.code)}>
          {node.name}
        </button>
      ))}
    </div>
  ),
}))

vi.mock('./ClassificationDetail', () => ({
  ClassificationDetail: ({ hierarchy }: { type?: string; hierarchy?: { code: string } }) => (
    <div data-testid="classification-detail">
      Detail for {hierarchy?.code}
    </div>
  ),
}))

vi.mock('./ClassificationSkeleton', () => ({
  ClassificationDetailSkeleton: () => <div data-testid="detail-skeleton">Loading detail...</div>,
  ClassificationPageSkeleton: () => <div data-testid="page-skeleton">Loading page...</div>,
}))

// ============================================================================
// TESTS
// ============================================================================

describe('ClassificationExplorer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsLoading.mockReturnValue(false)
    mockHierarchy.mockReturnValue(null)
  })

  describe('rendering', () => {
    it('renders the main title', () => {
      render(<ClassificationExplorer type="functional" />)

      expect(screen.getByText('Classifications')).toBeInTheDocument()
    })

    it('renders description text', () => {
      render(<ClassificationExplorer type="functional" />)

      expect(screen.getByText(/explore budget classifications/i)).toBeInTheDocument()
    })

    it('renders search component', () => {
      render(<ClassificationExplorer type="functional" />)

      expect(screen.getByTestId('classification-search')).toBeInTheDocument()
    })
  })

  describe('classification type toggle', () => {
    it('renders functional toggle button', () => {
      render(<ClassificationExplorer type="functional" />)

      expect(screen.getByRole('radio', { name: /functional/i })).toBeInTheDocument()
    })

    it('renders economic toggle button', () => {
      render(<ClassificationExplorer type="functional" />)

      expect(screen.getByRole('radio', { name: /economic/i })).toBeInTheDocument()
    })

    it('navigates when type is changed', () => {
      render(<ClassificationExplorer type="functional" />)

      const economicButton = screen.getByRole('radio', { name: /economic/i })
      fireEvent.click(economicButton)

      expect(mockNavigate).toHaveBeenCalled()
    })
  })

  describe('view mode toggle', () => {
    it('renders grid view toggle', () => {
      render(<ClassificationExplorer type="functional" />)

      expect(screen.getByRole('radio', { name: /grid view/i })).toBeInTheDocument()
    })

    it('renders tree view toggle', () => {
      render(<ClassificationExplorer type="functional" />)

      expect(screen.getByRole('radio', { name: /tree view/i })).toBeInTheDocument()
    })

    it('shows grid view by default', () => {
      render(<ClassificationExplorer type="functional" />)

      expect(screen.getByTestId('classification-grid')).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('shows page skeleton when loading without selected code', () => {
      mockIsLoading.mockReturnValue(true)

      render(<ClassificationExplorer type="functional" />)

      expect(screen.getByTestId('page-skeleton')).toBeInTheDocument()
    })

    it('shows detail skeleton when loading with selected code', () => {
      mockIsLoading.mockReturnValue(true)

      render(<ClassificationExplorer type="functional" selectedCode="01" />)

      expect(screen.getByTestId('detail-skeleton')).toBeInTheDocument()
    })
  })

  describe('not found state', () => {
    it('shows not found message for invalid code', () => {
      mockHierarchy.mockReturnValue(null)

      render(<ClassificationExplorer type="functional" selectedCode="invalid-code" />)

      expect(screen.getByText('Classification Not Found')).toBeInTheDocument()
    })

    it('shows the invalid code in not found message', () => {
      mockHierarchy.mockReturnValue(null)

      render(<ClassificationExplorer type="functional" selectedCode="invalid-code" />)

      expect(screen.getByText(/invalid-code/)).toBeInTheDocument()
    })

    it('shows back button in not found state', () => {
      mockHierarchy.mockReturnValue(null)

      render(<ClassificationExplorer type="functional" selectedCode="invalid-code" />)

      expect(screen.getByText('Go to Main List')).toBeInTheDocument()
    })

    it('navigates back when back button is clicked', () => {
      mockHierarchy.mockReturnValue(null)

      render(<ClassificationExplorer type="functional" selectedCode="invalid-code" />)

      const backButton = screen.getByText('Go to Main List')
      fireEvent.click(backButton)

      expect(mockNavigate).toHaveBeenCalled()
    })
  })

  describe('detail view', () => {
    it('shows detail view when hierarchy is available', () => {
      mockHierarchy.mockReturnValue({
        code: '01',
        name: 'General Services',
      })

      render(<ClassificationExplorer type="functional" selectedCode="01" />)

      expect(screen.getByTestId('classification-detail')).toBeInTheDocument()
    })

    it('hides header controls in detail view', () => {
      mockHierarchy.mockReturnValue({
        code: '01',
        name: 'General Services',
      })

      render(<ClassificationExplorer type="functional" selectedCode="01" />)

      // Title and toggle should not be visible in detail view
      expect(screen.queryByText('Classifications')).not.toBeInTheDocument()
    })
  })

  describe('grid view', () => {
    it('displays classification items in grid', () => {
      render(<ClassificationExplorer type="functional" />)

      expect(screen.getByTestId('grid-item-01')).toBeInTheDocument()
      expect(screen.getByTestId('grid-item-02')).toBeInTheDocument()
    })

    it('navigates when grid item is clicked', () => {
      render(<ClassificationExplorer type="functional" />)

      const gridItem = screen.getByTestId('grid-item-01')
      fireEvent.click(gridItem)

      expect(mockNavigate).toHaveBeenCalled()
    })
  })

  describe('tree view', () => {
    beforeEach(() => {
      // Set view mode to tree
      Object.assign(mockSearchParams, { view: 'tree' })
    })

    afterEach(() => {
      // Reset to grid
      Object.assign(mockSearchParams, { view: 'grid' })
    })

    it('shows tree view when view mode is tree', () => {
      render(<ClassificationExplorer type="functional" />)

      expect(screen.getByTestId('classification-tree')).toBeInTheDocument()
    })

    it('displays classification items in tree', () => {
      render(<ClassificationExplorer type="functional" />)

      expect(screen.getByTestId('tree-item-01')).toBeInTheDocument()
      expect(screen.getByTestId('tree-item-02')).toBeInTheDocument()
    })

    it('navigates when tree item is clicked', () => {
      render(<ClassificationExplorer type="functional" />)

      const treeItem = screen.getByTestId('tree-item-01')
      fireEvent.click(treeItem)

      expect(mockNavigate).toHaveBeenCalled()
    })
  })

  describe('type prop', () => {
    it('accepts functional type', () => {
      render(<ClassificationExplorer type="functional" />)

      expect(screen.getByTestId('classification-grid')).toBeInTheDocument()
    })

    it('accepts economic type', () => {
      render(<ClassificationExplorer type="economic" />)

      expect(screen.getByTestId('classification-grid')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<ClassificationExplorer type="functional" />)

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent('Classifications')
    })

    it('toggle groups have proper ARIA labels', () => {
      render(<ClassificationExplorer type="functional" />)

      expect(screen.getByRole('radio', { name: /functional/i })).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: /economic/i })).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: /grid view/i })).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: /tree view/i })).toBeInTheDocument()
    })
  })
})
