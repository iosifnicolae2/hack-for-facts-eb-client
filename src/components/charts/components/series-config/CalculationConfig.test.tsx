/**
 * CalculationConfig Component Tests
 *
 * This file tests the CalculationConfig component which provides
 * a recursive interface for configuring chart calculations.
 *
 * Pattern: Recursive Component Testing
 * - Mock useChartStore hook
 * - Mock hasCalculationCycle utility
 * - Test operation selection
 * - Test operand management
 * - Test circular dependency detection
 * - Test nested calculations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { CalculationConfig } from './CalculationConfig'
import type { SeriesGroupConfiguration, Chart, Series, Calculation } from '@/schemas/charts'

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

// Mock toast
const mockToastError = vi.fn()
vi.mock('sonner', () => ({
  toast: {
    error: (msg: string) => mockToastError(msg),
  },
}))

// Mock hasCalculationCycle
const mockHasCalculationCycle = vi.fn(() => false)
vi.mock('@/lib/chart-calculation-utils', () => ({
  hasCalculationCycle: () => mockHasCalculationCycle(),
}))

// Mock applyAlpha
vi.mock('../chart-renderer/utils', () => ({
  applyAlpha: (color: string) => color,
}))

// Mock utils
vi.mock('./utils', () => ({
  getContextualOperandLabel: (op: string, index: number) => {
    if (op === 'subtract' || op === 'divide') {
      return index === 0 ? 'From' : 'Minus'
    }
    return null
  },
  operationIcons: {
    sum: null,
    subtract: null,
    multiply: null,
    divide: null,
  },
  operationLabels: {
    sum: 'Sum',
    subtract: 'Subtract',
    multiply: 'Multiply',
    divide: 'Divide',
  },
}))

// Mock chart store
const mockUpdateSeries = vi.fn()

const createMockSeries = (id: string, label: string): Series => ({
  id,
  type: 'line-items-aggregated-yearly',
  enabled: true,
  label,
  unit: 'RON',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  filter: {
    account_category: 'ch',
    normalization: 'total',
  },
  config: { color: '#0000ff', showDataLabels: false },
})

const mockChart: Chart = {
  id: 'chart-1',
  title: 'Test Chart',
  config: {
    chartType: 'line',
    color: '#000000',
    showLegend: true,
    showTooltip: true,
    showGridLines: true,
    editAnnotations: true,
    showAnnotations: true,
  },
  series: [
    createMockSeries('series-1', 'Series One'),
    createMockSeries('series-2', 'Series Two'),
    createMockSeries('series-3', 'Series Three'),
  ],
  annotations: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

vi.mock('../../hooks/useChartStore', () => ({
  useChartStore: () => ({
    chart: mockChart,
    updateSeries: mockUpdateSeries,
  }),
}))

// ============================================================================
// TEST DATA FACTORIES
// ============================================================================

const createMockSeriesGroup = (
  overrides: Partial<SeriesGroupConfiguration> = {}
): SeriesGroupConfiguration => ({
  id: 'group-1',
  type: 'aggregated-series-calculation',
  enabled: true,
  label: 'Test Group',
  unit: 'RON',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  calculation: { op: 'sum', args: [] },
  config: { color: '#ff0000', showDataLabels: false },
  ...overrides,
})

// ============================================================================
// TESTS
// ============================================================================

describe('CalculationConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders card with calculation title', () => {
      render(<CalculationConfig series={createMockSeriesGroup()} />)

      expect(screen.getByText('Calculation')).toBeInTheDocument()
    })

    it('renders operation selector', () => {
      render(<CalculationConfig series={createMockSeriesGroup()} />)

      expect(screen.getByText('Sum')).toBeInTheDocument()
    })

    it('renders add series button', () => {
      render(<CalculationConfig series={createMockSeriesGroup()} />)

      expect(screen.getByText('Add Series')).toBeInTheDocument()
    })

    it('renders add number button', () => {
      render(<CalculationConfig series={createMockSeriesGroup()} />)

      expect(screen.getByText('Add Number')).toBeInTheDocument()
    })

    it('renders add calculation button', () => {
      render(<CalculationConfig series={createMockSeriesGroup()} />)

      expect(screen.getByText('Add Calculation')).toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('shows empty message when no operands', () => {
      render(<CalculationConfig series={createMockSeriesGroup()} />)

      expect(
        screen.getByText('No operands. Add a series or a new calculation.')
      ).toBeInTheDocument()
    })
  })

  describe('operation selection', () => {
    it('can select sum operation', () => {
      const series = createMockSeriesGroup({
        calculation: { op: 'sum', args: ['series-1'] },
      })
      render(<CalculationConfig series={series} />)

      expect(screen.getByText('Sum')).toBeInTheDocument()
    })

    it('can select subtract operation', () => {
      const series = createMockSeriesGroup({
        calculation: { op: 'subtract', args: ['series-1', 'series-2'] },
      })
      render(<CalculationConfig series={series} />)

      // Should show contextual labels for subtract
      expect(screen.getByText('From')).toBeInTheDocument()
      expect(screen.getByText('Minus')).toBeInTheDocument()
    })
  })

  describe('operand display', () => {
    it('displays series operand with label', () => {
      const series = createMockSeriesGroup({
        calculation: { op: 'sum', args: ['series-1'] },
      })
      render(<CalculationConfig series={series} />)

      expect(screen.getByText('Series One')).toBeInTheDocument()
    })

    it('displays series ID prefix', () => {
      const series = createMockSeriesGroup({
        calculation: { op: 'sum', args: ['series-1'] },
      })
      render(<CalculationConfig series={series} />)

      expect(screen.getByText(/\[id::series/)).toBeInTheDocument()
    })

    it('displays number operand with input', () => {
      const series = createMockSeriesGroup({
        calculation: { op: 'sum', args: [100] },
      })
      render(<CalculationConfig series={series} />)

      const input = screen.getByRole('spinbutton')
      expect(input).toHaveValue(100)
    })

    it('displays not found message for missing series', () => {
      const series = createMockSeriesGroup({
        calculation: { op: 'sum', args: ['non-existent-series'] },
      })
      render(<CalculationConfig series={series} />)

      expect(screen.getByText(/Error: Series not found/)).toBeInTheDocument()
    })
  })

  describe('adding operands', () => {
    it('adds number operand when Add Number is clicked', () => {
      const series = createMockSeriesGroup()
      render(<CalculationConfig series={series} />)

      fireEvent.click(screen.getByText('Add Number'))

      expect(mockUpdateSeries).toHaveBeenCalledWith(
        'group-1',
        expect.objectContaining({
          calculation: { op: 'sum', args: [0] },
        })
      )
    })

    it('adds nested calculation when Add Calculation is clicked', () => {
      const series = createMockSeriesGroup()
      render(<CalculationConfig series={series} />)

      fireEvent.click(screen.getByText('Add Calculation'))

      expect(mockUpdateSeries).toHaveBeenCalledWith(
        'group-1',
        expect.objectContaining({
          calculation: {
            op: 'sum',
            args: [{ op: 'sum', args: [] }],
          },
        })
      )
    })
  })

  describe('circular dependency detection', () => {
    it('shows toast error when circular dependency detected', () => {
      mockHasCalculationCycle.mockReturnValueOnce(true)

      const series = createMockSeriesGroup()
      render(<CalculationConfig series={series} />)

      fireEvent.click(screen.getByText('Add Number'))

      expect(mockToastError).toHaveBeenCalledWith(
        'This change would create a circular dependency.'
      )
    })

    it('does not update series when circular dependency detected', () => {
      mockHasCalculationCycle.mockReturnValueOnce(true)

      const series = createMockSeriesGroup()
      render(<CalculationConfig series={series} />)

      fireEvent.click(screen.getByText('Add Number'))

      expect(mockUpdateSeries).not.toHaveBeenCalled()
    })
  })

  describe('operand controls', () => {
    it('renders move up button for operands', () => {
      const series = createMockSeriesGroup({
        calculation: { op: 'sum', args: ['series-1', 'series-2'] },
      })
      render(<CalculationConfig series={series} />)

      // ArrowUp icons should be present
      const upButtons = document.querySelectorAll('.lucide-arrow-up')
      expect(upButtons.length).toBeGreaterThan(0)
    })

    it('renders move down button for operands', () => {
      const series = createMockSeriesGroup({
        calculation: { op: 'sum', args: ['series-1', 'series-2'] },
      })
      render(<CalculationConfig series={series} />)

      // ArrowDown icons should be present
      const downButtons = document.querySelectorAll('.lucide-arrow-down')
      expect(downButtons.length).toBeGreaterThan(0)
    })

    it('renders delete button for operands', () => {
      const series = createMockSeriesGroup({
        calculation: { op: 'sum', args: ['series-1'] },
      })
      render(<CalculationConfig series={series} />)

      // Trash2 icons should be present
      const deleteButtons = document.querySelectorAll('.lucide-trash-2')
      expect(deleteButtons.length).toBeGreaterThan(0)
    })
  })

  describe('nested calculations', () => {
    it('renders nested calculation structure', () => {
      const nestedCalc: Calculation = { op: 'multiply', args: [2] }
      const series = createMockSeriesGroup({
        calculation: { op: 'sum', args: [nestedCalc] },
      })
      render(<CalculationConfig series={series} />)

      // Should show both Sum and Multiply operations
      expect(screen.getByText('Sum')).toBeInTheDocument()
      expect(screen.getByText('Multiply')).toBeInTheDocument()
    })

    it('renders deeply nested calculations', () => {
      const deepNested: Calculation = {
        op: 'sum',
        args: [
          {
            op: 'multiply',
            args: [
              { op: 'divide', args: [100, 2] },
            ],
          },
        ],
      }
      const series = createMockSeriesGroup({
        calculation: deepNested,
      })
      render(<CalculationConfig series={series} />)

      // Should show all three operations
      expect(screen.getByText('Sum')).toBeInTheDocument()
      expect(screen.getByText('Multiply')).toBeInTheDocument()
      expect(screen.getByText('Divide')).toBeInTheDocument()
    })
  })

  describe('number input', () => {
    it('updates number value when input changes', () => {
      const series = createMockSeriesGroup({
        calculation: { op: 'sum', args: [100] },
      })
      render(<CalculationConfig series={series} />)

      const input = screen.getByRole('spinbutton')
      fireEvent.change(input, { target: { value: '200' } })

      expect(mockUpdateSeries).toHaveBeenCalled()
    })
  })

  describe('multiple operands', () => {
    it('renders multiple series operands', () => {
      const series = createMockSeriesGroup({
        calculation: { op: 'sum', args: ['series-1', 'series-2', 'series-3'] },
      })
      render(<CalculationConfig series={series} />)

      expect(screen.getByText('Series One')).toBeInTheDocument()
      expect(screen.getByText('Series Two')).toBeInTheDocument()
      expect(screen.getByText('Series Three')).toBeInTheDocument()
    })

    it('renders mixed operand types', () => {
      const series = createMockSeriesGroup({
        calculation: {
          op: 'sum',
          args: ['series-1', 100, { op: 'multiply', args: [2, 3] }],
        },
      })
      render(<CalculationConfig series={series} />)

      // Series operand
      expect(screen.getByText('Series One')).toBeInTheDocument()
      // Number operand
      expect(screen.getByDisplayValue('100')).toBeInTheDocument()
      // Nested calculation
      expect(screen.getByText('Multiply')).toBeInTheDocument()
    })
  })
})
