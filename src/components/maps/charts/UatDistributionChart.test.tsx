/**
 * UatDistributionChart Component Tests
 *
 * This file tests the UatDistributionChart component which renders
 * a histogram/distribution chart showing value distributions across bins.
 *
 * Pattern: Chart Component Testing
 * - Mock Recharts components
 * - Test binning logic
 * - Test empty/error states
 * - Test rendering with different configurations
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { UatDistributionChart } from './UatDistributionChart'
import type { HeatmapUATDataPoint } from '@/schemas/heatmap'

// ============================================================================
// MOCKS
// ============================================================================

// Mock Recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="bar-chart" data-item-count={data.length}>
      {children}
    </div>
  ),
  Bar: ({ dataKey, name, fill }: { dataKey: string; name: string; fill: string }) => (
    <div data-testid="bar" data-key={dataKey} data-name={name} data-fill={fill} />
  ),
  XAxis: ({ dataKey }: { dataKey: string }) => (
    <div data-testid="x-axis" data-key={dataKey} />
  ),
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  LabelList: () => <div data-testid="label-list" />,
}))

// ============================================================================
// TEST DATA
// ============================================================================

const createDataPoint = (amount: number): HeatmapUATDataPoint =>
  ({
    amount,
    id: `item-${amount}`,
    uat_name: `Item ${amount}`,
    natcode: `code-${amount}`,
  }) as unknown as HeatmapUATDataPoint

const singleValueData = [createDataPoint(1000)]

const uniformData = [
  createDataPoint(1000),
  createDataPoint(1000),
  createDataPoint(1000),
]

const distributedData = [
  createDataPoint(100),
  createDataPoint(500),
  createDataPoint(1000),
  createDataPoint(1500),
  createDataPoint(2000),
  createDataPoint(2500),
  createDataPoint(3000),
  createDataPoint(3500),
  createDataPoint(4000),
  createDataPoint(4500),
]

// ============================================================================
// TESTS
// ============================================================================

describe('UatDistributionChart', () => {
  describe('empty state', () => {
    it('renders empty message when data is empty', () => {
      render(<UatDistributionChart data={[]} valueKey="amount" />)

      expect(
        screen.getByText('Not enough data to display distribution chart.')
      ).toBeInTheDocument()
    })

    it('renders empty message when data has no valid values', () => {
      const invalidData = [{ name: 'Test' }] as unknown as HeatmapUATDataPoint[]
      render(<UatDistributionChart data={invalidData} valueKey="amount" />)

      expect(
        screen.getByText('Not enough data to display distribution chart.')
      ).toBeInTheDocument()
    })
  })

  describe('chart rendering', () => {
    it('renders chart with single value', () => {
      render(<UatDistributionChart data={singleValueData} valueKey="amount" />)

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    })

    it('renders chart with distributed data', () => {
      render(<UatDistributionChart data={distributedData} valueKey="amount" />)

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    })

    it('renders chart title when provided', () => {
      render(
        <UatDistributionChart
          data={singleValueData}
          valueKey="amount"
          chartTitle="Value Distribution"
        />
      )

      expect(screen.getByText('Value Distribution')).toBeInTheDocument()
    })

    it('does not render title when not provided', () => {
      render(<UatDistributionChart data={singleValueData} valueKey="amount" />)

      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })
  })

  describe('binning logic', () => {
    it('creates single bin when all values are the same', () => {
      render(<UatDistributionChart data={uniformData} valueKey="amount" />)

      // When all values are the same, only 1 bin is created
      expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-item-count', '1')
    })

    it('creates multiple bins for distributed data', () => {
      render(
        <UatDistributionChart data={distributedData} valueKey="amount" numberOfBins={5} />
      )

      expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-item-count', '5')
    })

    it('respects custom numberOfBins', () => {
      render(
        <UatDistributionChart data={distributedData} valueKey="amount" numberOfBins={3} />
      )

      expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-item-count', '3')
    })

    it('uses default 10 bins', () => {
      render(<UatDistributionChart data={distributedData} valueKey="amount" />)

      expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-item-count', '10')
    })
  })

  describe('chart components', () => {
    it('renders all chart components', () => {
      render(<UatDistributionChart data={singleValueData} valueKey="amount" />)

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      expect(screen.getByTestId('bar')).toBeInTheDocument()
      expect(screen.getByTestId('x-axis')).toBeInTheDocument()
      expect(screen.getByTestId('y-axis')).toBeInTheDocument()
      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
      expect(screen.getByTestId('legend')).toBeInTheDocument()
    })

    it('passes correct dataKey to bar component', () => {
      render(<UatDistributionChart data={singleValueData} valueKey="amount" />)

      expect(screen.getByTestId('bar')).toHaveAttribute('data-key', 'count')
    })

    it('uses x-axis with name dataKey for bins', () => {
      render(<UatDistributionChart data={singleValueData} valueKey="amount" />)

      expect(screen.getByTestId('x-axis')).toHaveAttribute('data-key', 'name')
    })

    it('uses custom bar color when provided', () => {
      render(
        <UatDistributionChart
          data={singleValueData}
          valueKey="amount"
          barColor="#ff0000"
        />
      )

      expect(screen.getByTestId('bar')).toHaveAttribute('data-fill', '#ff0000')
    })

    it('uses default bar color when not provided', () => {
      render(<UatDistributionChart data={singleValueData} valueKey="amount" />)

      expect(screen.getByTestId('bar')).toHaveAttribute('data-fill', '#82ca9d')
    })
  })

  describe('styling', () => {
    it('renders with correct container dimensions', () => {
      const { container } = render(
        <UatDistributionChart data={singleValueData} valueKey="amount" />
      )

      const chartContainer = container.firstChild as HTMLElement
      expect(chartContainer).toHaveStyle({ width: '100%', height: '400px' })
    })
  })
})
