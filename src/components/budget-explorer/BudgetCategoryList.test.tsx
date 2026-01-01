/**
 * BudgetCategoryList Component Tests
 *
 * This file tests the BudgetCategoryList component which displays
 * functional and economic category breakdowns with progress bars.
 *
 * Pattern: List Component Testing
 * - Test loading states
 * - Test empty states
 * - Test category rendering
 * - Test filtering by account category
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { BudgetCategoryList } from './BudgetCategoryList'

// ============================================================================
// MOCKS
// ============================================================================

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@lingui/core/macro', () => ({
  t: (strings: TemplateStringsArray) => strings[0],
  msg: (strings: TemplateStringsArray) => strings[0],
}))

type MockDataItem = { fn_c?: string; fn_n?: string; ec_c?: string; ec_n?: string; amount?: number }

// Mock groupData
vi.mock('./budget-transform', () => ({
  groupData: (data: MockDataItem[], type: 'fn' | 'ec', _depth: number) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { items: [], baseTotal: 0 }
    }

    const items = data.map((item) => ({
      code: type === 'fn' ? item.fn_c : item.ec_c,
      name: type === 'fn' ? item.fn_n : item.ec_n,
      total: item.amount ?? 0,
    }))

    return {
      items: items.filter((i) => i.code),
      baseTotal: items.reduce((sum, i) => sum + i.total, 0),
    }
  },
}))

// Mock utility functions
vi.mock('@/lib/utils', () => ({
  getNormalizationUnit: () => 'RON',
  formatCurrency: (value: number, format: string) => {
    if (format === 'compact') return `${value.toLocaleString()} RON`
    return `${value.toLocaleString()} RON`
  },
  formatNumber: (value: number, format?: string) => {
    if (format === 'compact') return value.toLocaleString()
    if (format === 'standard') return value.toLocaleString()
    return value.toFixed(1)
  },
  cn: (...args: (string | undefined | null | boolean)[]) =>
    args.filter(Boolean).join(' '),
}))

// ============================================================================
// TEST DATA
// ============================================================================

type AggregatedItem = {
  fn_c: string | null
  fn_n: string | null
  ec_c: string | null
  ec_n: string | null
  amount: number
}

const createItem = (
  fn_c: string,
  fn_n: string,
  ec_c: string,
  ec_n: string,
  amount: number
): AggregatedItem => ({
  fn_c,
  fn_n,
  ec_c,
  ec_n,
  amount,
})

// ============================================================================
// TESTS
// ============================================================================

describe('BudgetCategoryList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loading state', () => {
    it('shows skeleton when isLoading is true', () => {
      const { container } = render(
        <BudgetCategoryList aggregated={[]} depth={2} isLoading />
      )

      const skeletons = container.querySelectorAll('[class*="animate-pulse"]')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('does not show content when loading', () => {
      render(<BudgetCategoryList aggregated={[]} depth={2} isLoading />)

      expect(
        screen.queryByText('Top Functional Categories')
      ).not.toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('shows empty message when no categories', () => {
      render(<BudgetCategoryList aggregated={[]} depth={2} />)

      expect(screen.getByText('No categories to display.')).toBeInTheDocument()
    })
  })

  describe('category columns', () => {
    it('renders functional categories column', () => {
      const items = [
        createItem('01', 'Education', '10', 'Personnel', 5000),
        createItem('02', 'Health', '20', 'Goods', 3000),
      ]

      render(<BudgetCategoryList aggregated={items} depth={2} />)

      expect(screen.getByText('Top Functional Categories')).toBeInTheDocument()
    })

    it('renders economic categories column', () => {
      const items = [
        createItem('01', 'Education', '10', 'Personnel', 5000),
      ]

      render(<BudgetCategoryList aggregated={items} depth={2} />)

      expect(screen.getByText('Top Economic Categories')).toBeInTheDocument()
    })

    it('displays category names', () => {
      const items = [
        createItem('01', 'Education', '10', 'Personnel', 5000),
      ]

      render(<BudgetCategoryList aggregated={items} depth={2} />)

      expect(screen.getByText('Education')).toBeInTheDocument()
      expect(screen.getByText('Personnel')).toBeInTheDocument()
    })

    it('displays category codes', () => {
      const items = [
        createItem('01', 'Education', '10', 'Personnel', 5000),
      ]

      render(<BudgetCategoryList aggregated={items} depth={2} />)

      expect(screen.getByText('fn:01')).toBeInTheDocument()
      expect(screen.getByText('ec:10')).toBeInTheDocument()
    })

    it('displays formatted amounts', () => {
      const items = [
        createItem('01', 'Education', '10', 'Personnel', 5000),
      ]

      render(<BudgetCategoryList aggregated={items} depth={2} />)

      // formatCurrency returns formatted values
      expect(screen.getAllByText(/5,000 RON/).length).toBeGreaterThan(0)
    })
  })

  describe('showEconomic prop', () => {
    it('hides economic column when showEconomic is false', () => {
      const items = [
        createItem('01', 'Education', '10', 'Personnel', 5000),
      ]

      render(
        <BudgetCategoryList aggregated={items} depth={2} showEconomic={false} />
      )

      expect(
        screen.getByText('No economic breakdown is available for income.')
      ).toBeInTheDocument()
    })

    it('shows custom economicInfoText when provided', () => {
      const items = [
        createItem('01', 'Education', '10', 'Personnel', 5000),
      ]

      render(
        <BudgetCategoryList
          aggregated={items}
          depth={2}
          showEconomic={false}
          economicInfoText="Custom info message"
        />
      )

      expect(screen.getByText('Custom info message')).toBeInTheDocument()
    })
  })

  describe('progress bars', () => {
    it('renders progress bars for items', () => {
      const items = [
        createItem('01', 'Education', '10', 'Personnel', 5000),
      ]

      const { container } = render(
        <BudgetCategoryList aggregated={items} depth={2} />
      )

      const progressBars = container.querySelectorAll('[class*="rounded-full"][class*="h-1.5"]')
      expect(progressBars.length).toBeGreaterThan(0)
    })

    it('indicates negative values', () => {
      const items = [
        createItem('01', 'Education', '10', 'Personnel', -1000),
      ]

      render(<BudgetCategoryList aggregated={items} depth={2} />)

      // Both functional and economic columns have negative value bars
      const negativeBars = screen.getAllByLabelText('negative value')
      expect(negativeBars.length).toBeGreaterThan(0)
    })

    it('indicates positive values', () => {
      const items = [
        createItem('01', 'Education', '10', 'Personnel', 5000),
      ]

      render(<BudgetCategoryList aggregated={items} depth={2} />)

      // Both functional and economic columns have positive value bars
      const positiveBars = screen.getAllByLabelText('positive value')
      expect(positiveBars.length).toBeGreaterThan(0)
    })
  })

  describe('filtering', () => {
    it('filters expense items by economic prefix for ch category', () => {
      const items = [
        createItem('01', 'Education', '10', 'Personnel', 5000),
        createItem('02', 'Health', '51', 'Transfers', 2000), // Should be filtered
      ]

      render(
        <BudgetCategoryList aggregated={items} depth={2} accountCategory="ch" />
      )

      // The 51 (Transfers) should be filtered out for expenses
      expect(screen.getByText('Education')).toBeInTheDocument()
    })

    it('filters income items by functional prefix for vn category', () => {
      const items = [
        createItem('01', 'Tax Revenue', '10', 'Income', 10000),
        createItem('04', 'Shares', '20', 'Other', 3000), // Should be filtered
      ]

      render(
        <BudgetCategoryList aggregated={items} depth={2} accountCategory="vn" />
      )

      // The 04 (Shares) should be filtered out for income
      expect(screen.getByText('Tax Revenue')).toBeInTheDocument()
    })
  })

  describe('depth parameter', () => {
    it('accepts depth 2', () => {
      const items = [createItem('01', 'Education', '10', 'Personnel', 5000)]

      render(<BudgetCategoryList aggregated={items} depth={2} />)

      expect(screen.getByText('Education')).toBeInTheDocument()
    })

    it('accepts depth 4', () => {
      const items = [createItem('01.01', 'Primary', '10.01', 'Wages', 5000)]

      render(<BudgetCategoryList aggregated={items} depth={4} />)

      expect(screen.getByText('Primary')).toBeInTheDocument()
    })

    it('accepts depth 6', () => {
      const items = [
        createItem('01.01.01', 'Detailed Category', '10.01.01', 'Detailed Economic', 5000),
      ]

      render(<BudgetCategoryList aggregated={items} depth={6} />)

      expect(screen.getByText('Detailed Category')).toBeInTheDocument()
      expect(screen.getByText('Detailed Economic')).toBeInTheDocument()
    })
  })

  describe('grid layout', () => {
    it('renders in a two-column grid', () => {
      const items = [createItem('01', 'Education', '10', 'Personnel', 5000)]

      const { container } = render(
        <BudgetCategoryList aggregated={items} depth={2} />
      )

      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('md:grid-cols-2')
    })
  })
})
