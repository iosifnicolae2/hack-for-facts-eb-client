/**
 * SpendingBreakdown Component Tests
 *
 * This file tests the SpendingBreakdown component which displays
 * effective spending calculations with transfer deductions.
 *
 * Pattern: Data Display Component Testing
 * - Test loading states
 * - Test empty states
 * - Test calculations with mock data
 * - Test visual structure
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { SpendingBreakdown } from './SpendingBreakdown'
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

// ============================================================================
// TEST DATA
// ============================================================================

const createNode = (ec_c: string, amount: number): AggregatedNode => ({
  fn_c: '',
  fn_n: '',
  ec_c,
  ec_n: `Name ${ec_c}`,
  amount,
  count: 1,
})

// ============================================================================
// TESTS
// ============================================================================

describe('SpendingBreakdown', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders card with header', () => {
      render(<SpendingBreakdown nodes={[]} />)

      expect(
        screen.getByText('Effective Spending Calculation')
      ).toBeInTheDocument()
    })

    it('renders description text', () => {
      render(<SpendingBreakdown nodes={[]} />)

      expect(
        screen.getByText(/Understanding the consolidated general budget spending/)
      ).toBeInTheDocument()
    })

    it('renders with period label', () => {
      render(<SpendingBreakdown nodes={[]} periodLabel="2023" />)

      expect(screen.getByText('2023')).toBeInTheDocument()
    })

    it('renders info note', () => {
      render(<SpendingBreakdown nodes={[]} />)

      expect(
        screen.getByText(/Transfers between institutions/)
      ).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('shows skeletons when isLoading is true', () => {
      const { container } = render(<SpendingBreakdown nodes={[]} isLoading />)

      const skeletons = container.querySelectorAll('[class*="animate-pulse"]')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('does not show calculation content when loading', () => {
      render(<SpendingBreakdown nodes={[]} isLoading />)

      expect(screen.queryByText('Total Spending')).not.toBeInTheDocument()
    })

    it('does not show info note when loading', () => {
      render(<SpendingBreakdown nodes={[]} isLoading />)

      expect(
        screen.queryByText(/Transfers between institutions/)
      ).not.toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('renders with empty nodes array', () => {
      render(<SpendingBreakdown nodes={[]} />)

      expect(screen.getByText('Total Spending')).toBeInTheDocument()
      // Multiple sections show 0 (compact) for empty data
      const compactZeros = screen.getAllByText('0 (compact)')
      expect(compactZeros.length).toBeGreaterThan(0)
    })

    it('renders with undefined nodes', () => {
      render(<SpendingBreakdown nodes={undefined} />)

      expect(screen.getByText('Total Spending')).toBeInTheDocument()
    })
  })

  describe('calculations', () => {
    it('calculates total spending from all nodes', () => {
      const nodes = [
        createNode('10', 1000),
        createNode('20', 2000),
        createNode('30', 3000),
      ]

      render(<SpendingBreakdown nodes={nodes} />)

      // Total spending (6000) appears in both total and effective sections when no deductions
      const amountElements = screen.getAllByText('6,000 (compact)')
      expect(amountElements.length).toBeGreaterThan(0)
    })

    it('deducts transfers between institutions (ec:51)', () => {
      const nodes = [
        createNode('10', 5000),
        createNode('51.01', 1000),
        createNode('51.02', 500),
      ]

      render(<SpendingBreakdown nodes={nodes} />)

      expect(screen.getByText('Transfers Between Institutions')).toBeInTheDocument()
      expect(screen.getByText('ec:51')).toBeInTheDocument()
    })

    it('deducts internal transfers (ec:55.01)', () => {
      const nodes = [
        createNode('10', 5000),
        createNode('55.01.01', 300),
      ]

      render(<SpendingBreakdown nodes={nodes} />)

      expect(screen.getByText('Internal Transfers')).toBeInTheDocument()
      expect(screen.getByText('ec:55.01')).toBeInTheDocument()
    })

    it('calculates effective spending correctly', () => {
      const nodes = [
        createNode('10', 10000), // regular spending
        createNode('51.01', 1000), // transfers between institutions
        createNode('55.01.01', 500), // internal transfers
      ]

      render(<SpendingBreakdown nodes={nodes} />)

      expect(screen.getByText('Effective Spending')).toBeInTheDocument()
      // Total: 10000 + 1000 + 500 = 11500
      // Deductions: 1000 + 500 = 1500
      // Effective: 11500 - 1500 = 10000
      expect(screen.getByText('10,000 (compact)')).toBeInTheDocument()
    })

    it('handles nodes with no transfer codes', () => {
      const nodes = [
        createNode('10', 5000),
        createNode('20', 3000),
      ]

      render(<SpendingBreakdown nodes={nodes} />)

      // Total equals effective when no transfers
      const values = screen.getAllByText('8,000 (compact)')
      expect(values.length).toBe(2) // total and effective
    })
  })

  describe('visual structure', () => {
    it('renders minus signs between sections', () => {
      const nodes = [
        createNode('10', 5000),
        createNode('51.01', 1000),
      ]

      render(<SpendingBreakdown nodes={nodes} />)

      const minusSigns = screen.getAllByText('−')
      expect(minusSigns.length).toBe(2) // Two deduction rows
    })

    it('renders equals sign before effective spending', () => {
      render(<SpendingBreakdown nodes={[]} />)

      expect(screen.getByText('=')).toBeInTheDocument()
    })

    it('highlights effective spending section', () => {
      const { container } = render(<SpendingBreakdown nodes={[]} />)

      const effectiveSection = container.querySelector('.bg-primary\\/5')
      expect(effectiveSection).toBeInTheDocument()
    })
  })

  describe('formatting', () => {
    it('displays amounts in both compact and standard format', () => {
      const nodes = [createNode('10', 1000)]

      render(<SpendingBreakdown nodes={nodes} />)

      const compactValues = screen.getAllByText(/\(compact\)/)
      const standardValues = screen.getAllByText(/\(standard\)/)
      expect(compactValues.length).toBeGreaterThan(0)
      expect(standardValues.length).toBeGreaterThan(0)
    })
  })

  describe('economic code normalization', () => {
    it('handles codes with non-numeric characters', () => {
      const nodes = [
        createNode('10', 5000),
        createNode('51-01', 1000), // hyphen instead of dot
      ]

      render(<SpendingBreakdown nodes={nodes} />)

      // Should still deduct 1000 from transfers
      expect(screen.getByText('Transfers Between Institutions')).toBeInTheDocument()
    })

    it('handles null or undefined ec_c values', () => {
      const nodes = [
        { id: '1', ec_c: null, amount: 5000, label: 'Node 1', color: '#000' },
        { id: '2', ec_c: undefined, amount: 3000, label: 'Node 2', color: '#000' },
      ] as unknown as AggregatedNode[]

      render(<SpendingBreakdown nodes={nodes} />)

      // Should render without crashing
      expect(screen.getByText('Total Spending')).toBeInTheDocument()
    })
  })
})
