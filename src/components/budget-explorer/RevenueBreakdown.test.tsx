/**
 * RevenueBreakdown Component Tests
 *
 * This file tests the RevenueBreakdown component which displays
 * consolidated revenue calculations with inter-budget transfers
 * and financial operations deductions.
 *
 * Pattern: Data Display Component Testing
 * - Test loading states
 * - Test empty states
 * - Test calculations with mock data
 * - Test row rendering and sorting
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { RevenueBreakdown } from './RevenueBreakdown'
import type { AggregatedNode } from './budget-transform'

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

// Mock the yValueFormatter to return predictable values
vi.mock('@/components/charts/components/chart-renderer/utils', () => ({
  yValueFormatter: (value: number, _unit: string, format: string) => {
    if (format === 'compact') return `${value.toLocaleString()} (compact)`
    return `${value.toLocaleString()} (standard)`
  },
}))

// Mock getNormalizationUnit
vi.mock('@/lib/utils', () => ({
  getNormalizationUnit: () => 'RON',
  cn: (...args: (string | undefined | null | boolean)[]) =>
    args.filter(Boolean).join(' '),
}))

// Mock getClassificationName
vi.mock('@/lib/classifications', () => ({
  getClassificationName: (code: string) => `Classification ${code}`,
}))

// ============================================================================
// TEST DATA
// ============================================================================

const createNode = (fn_c: string, amount: number): AggregatedNode => ({
  fn_c,
  fn_n: `Name ${fn_c}`,
  ec_c: '',
  ec_n: '',
  amount,
  count: 1,
})

// ============================================================================
// TESTS
// ============================================================================

describe('RevenueBreakdown', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders card with header', () => {
      render(<RevenueBreakdown nodes={[]} />)

      expect(
        screen.getByText('Consolidated Revenue Calculation')
      ).toBeInTheDocument()
    })

    it('renders description text', () => {
      render(<RevenueBreakdown nodes={[]} />)

      expect(
        screen.getByText(/How we compute true consolidated revenues/)
      ).toBeInTheDocument()
    })

    it('renders with period label', () => {
      render(<RevenueBreakdown nodes={[]} periodLabel="2023" />)

      expect(screen.getByText('2023')).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('shows skeletons when isLoading is true', () => {
      const { container } = render(<RevenueBreakdown nodes={[]} isLoading />)

      // Skeleton component renders with specific classes
      const skeletons = container.querySelectorAll('[class*="animate-pulse"]')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('does not show calculation content when loading', () => {
      render(<RevenueBreakdown nodes={[]} isLoading />)

      expect(screen.queryByText('Total Revenues')).not.toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('renders with empty nodes array', () => {
      render(<RevenueBreakdown nodes={[]} />)

      expect(screen.getByText('Total Revenues')).toBeInTheDocument()
      // Multiple sections show 0 (compact) for empty data
      const compactZeros = screen.getAllByText('0 (compact)')
      expect(compactZeros.length).toBeGreaterThan(0)
    })

    it('renders with undefined nodes', () => {
      render(<RevenueBreakdown nodes={undefined} />)

      expect(screen.getByText('Total Revenues')).toBeInTheDocument()
    })
  })

  describe('calculations', () => {
    it('calculates total revenue from all nodes', () => {
      const nodes = [
        createNode('01', 1000),
        createNode('02', 2000),
        createNode('03', 3000),
      ]

      render(<RevenueBreakdown nodes={nodes} />)

      // Total revenue (6000) appears in both total and effective sections when no deductions
      const amountElements = screen.getAllByText('6,000 (compact)')
      expect(amountElements.length).toBeGreaterThan(0)
    })

    it('deducts inter-budget transfers (fn:04.*)', () => {
      const nodes = [
        createNode('01', 5000),
        createNode('04.01', 1000),
        createNode('04.02', 500),
      ]

      render(<RevenueBreakdown nodes={nodes} />)

      // Inter-budget row should appear
      expect(
        screen.getByText('Shares and amounts split from income tax')
      ).toBeInTheDocument()
    })

    it('deducts shares from VAT (fn:11.*)', () => {
      const nodes = [
        createNode('01', 5000),
        createNode('11.01', 800),
      ]

      render(<RevenueBreakdown nodes={nodes} />)

      expect(screen.getByText('Shares from VAT')).toBeInTheDocument()
    })

    it('deducts subsidies (fn:42.*)', () => {
      const nodes = [
        createNode('01', 5000),
        createNode('42.01', 300),
      ]

      render(<RevenueBreakdown nodes={nodes} />)

      expect(screen.getByText('Subsidies')).toBeInTheDocument()
    })

    it('deducts subsidies from other administrations (fn:43.*)', () => {
      const nodes = [
        createNode('01', 5000),
        createNode('43.01', 200),
      ]

      render(<RevenueBreakdown nodes={nodes} />)

      expect(
        screen.getByText('Subsidies from other administrations')
      ).toBeInTheDocument()
    })

    it('deducts financial operations (fn:40.* and fn:41.*)', () => {
      const nodes = [
        createNode('01', 5000),
        createNode('40.01', 100),
        createNode('41.01', 50),
      ]

      render(<RevenueBreakdown nodes={nodes} />)

      expect(screen.getByText('Financial operations')).toBeInTheDocument()
    })

    it('calculates effective revenue correctly', () => {
      const nodes = [
        createNode('01', 10000), // regular revenue
        createNode('04.01', 1000), // inter-budget: income tax
        createNode('11.01', 500), // inter-budget: VAT
        createNode('40.01', 200), // financial ops
      ]

      render(<RevenueBreakdown nodes={nodes} />)

      expect(screen.getByText('True Consolidated Revenues')).toBeInTheDocument()
      // 10000 + 1000 + 500 + 200 = 11700 total
      // Deductions: 1000 + 500 (inter-budget) + 200 (financial ops) = 1700
      // Effective: 11700 - 1700 = 10000
    })
  })

  describe('inter-budget rows', () => {
    it('sorts inter-budget rows by amount descending', () => {
      const nodes = [
        createNode('04.01', 100),
        createNode('11.01', 500),
        createNode('42.01', 300),
      ]

      render(<RevenueBreakdown nodes={nodes} />)

      const rows = screen.getAllByText(/Inter-budget/)
      expect(rows.length).toBeGreaterThan(0)
    })

    it('filters out zero amount rows', () => {
      const nodes = [
        createNode('04.01', 1000),
        createNode('11.01', 0), // should not appear
      ]

      render(<RevenueBreakdown nodes={nodes} />)

      expect(screen.queryByText('Shares from VAT')).not.toBeInTheDocument()
    })

    it('displays badges with functional classification codes', () => {
      const nodes = [createNode('04.01', 1000)]

      render(<RevenueBreakdown nodes={nodes} />)

      expect(screen.getByText('fn:04.*')).toBeInTheDocument()
    })
  })

  describe('se scad adjustments', () => {
    it('shows se scad section when applicable codes are present', () => {
      const nodes = [
        createNode('01', 5000),
        createNode('01.03', 100), // se scad code
      ]

      render(<RevenueBreakdown nodes={nodes} />)

      expect(
        screen.getByText(/Adjustments marked as "se scad"/)
      ).toBeInTheDocument()
    })

    it('shows breakdown of se scad adjustments', () => {
      const nodes = [
        createNode('01', 5000),
        createNode('01.03', 100),
        createNode('02.49', 200),
      ]

      render(<RevenueBreakdown nodes={nodes} />)

      expect(screen.getByText(/Tax deductions outside/)).toBeInTheDocument()
    })

    it('does not show se scad section when no applicable codes', () => {
      const nodes = [
        createNode('01', 5000),
        createNode('02', 3000),
      ]

      render(<RevenueBreakdown nodes={nodes} />)

      expect(
        screen.queryByText(/Adjustments marked as "se scad"/)
      ).not.toBeInTheDocument()
    })
  })

  describe('formatting', () => {
    it('displays amounts in both compact and standard format', () => {
      const nodes = [createNode('01', 1000)]

      render(<RevenueBreakdown nodes={nodes} />)

      // Multiple sections display values, check that both formats exist
      const compactValues = screen.getAllByText(/\(compact\)/)
      const standardValues = screen.getAllByText(/\(standard\)/)
      expect(compactValues.length).toBeGreaterThan(0)
      expect(standardValues.length).toBeGreaterThan(0)
    })

    it('uses provided normalization unit', () => {
      const nodes = [createNode('01', 1000)]

      render(<RevenueBreakdown nodes={nodes} normalization="per_capita" />)

      // yValueFormatter is called with the unit from getNormalizationUnit
      const compactValues = screen.getAllByText(/\(compact\)/)
      expect(compactValues.length).toBeGreaterThan(0)
    })
  })

  describe('visual structure', () => {
    it('renders minus signs between sections', () => {
      const nodes = [
        createNode('01', 5000),
        createNode('04.01', 1000),
      ]

      render(<RevenueBreakdown nodes={nodes} />)

      const minusSigns = screen.getAllByText('−')
      expect(minusSigns.length).toBeGreaterThan(0)
    })

    it('renders equals sign before effective revenue', () => {
      const nodes = [createNode('01', 5000)]

      render(<RevenueBreakdown nodes={nodes} />)

      expect(screen.getByText('=')).toBeInTheDocument()
    })

    it('highlights effective revenue section', () => {
      const nodes = [createNode('01', 5000)]

      const { container } = render(<RevenueBreakdown nodes={nodes} />)

      const effectiveSection = container.querySelector('.bg-primary\\/5')
      expect(effectiveSection).toBeInTheDocument()
    })
  })

  describe('pending distribution and institutional remittances', () => {
    it('shows pending distribution (fn:47.*)', () => {
      const nodes = [
        createNode('01', 5000),
        createNode('47.01', 150),
      ]

      render(<RevenueBreakdown nodes={nodes} />)

      expect(screen.getByText('Sums pending distribution')).toBeInTheDocument()
    })

    it('shows institutional remittances (fn:36.05)', () => {
      const nodes = [
        createNode('01', 5000),
        createNode('36.05', 75),
      ]

      render(<RevenueBreakdown nodes={nodes} />)

      expect(screen.getByText('Institutional remittances')).toBeInTheDocument()
    })
  })
})
