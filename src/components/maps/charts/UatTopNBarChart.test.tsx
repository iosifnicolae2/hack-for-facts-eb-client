/**
 * UatTopNBarChart Component Tests
 *
 * This file tests the UatTopNBarChart component which renders
 * a horizontal bar chart showing top N items by a specific value.
 *
 * Pattern: Chart Component Testing
 * - Mock Recharts components
 * - Test data sorting and limiting
 * - Test empty/error states
 * - Test rendering with different configurations
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { UatTopNBarChart } from './UatTopNBarChart'
import type { HeatmapUATDataPoint } from '@/schemas/heatmap'

// ============================================================================
// MOCKS
// ============================================================================

// Mock Recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children, data, layout }: { children: React.ReactNode; data: unknown[]; layout: string }) => (
    <div data-testid="bar-chart" data-item-count={data.length} data-layout={layout}>
      {children}
    </div>
  ),
  Bar: ({ dataKey, name, fill }: { dataKey: string; name: string; fill: string }) => (
    <div data-testid="bar" data-key={dataKey} data-name={name} data-fill={fill} />
  ),
  XAxis: ({ type, dataKey }: { type: string; dataKey: string }) => (
    <div data-testid="x-axis" data-type={type} data-key={dataKey} />
  ),
  YAxis: ({ type, dataKey }: { type: string; dataKey: string }) => (
    <div data-testid="y-axis" data-type={type} data-key={dataKey} />
  ),
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  LabelList: () => <div data-testid="label-list" />,
}))

// Mock utility functions
vi.mock('@/lib/utils', () => ({
  formatCurrency: (value: number, format: string) =>
    format === 'compact' ? `${(value / 1000).toFixed(0)}K` : `${value.toLocaleString()}`,
  formatNumber: (value: number) => value.toLocaleString(),
  getNormalizationUnit: () => 'RON',
}))

// ============================================================================
// TEST DATA
// ============================================================================

const createDataPoint = (
  uat_name: string,
  amount: number
): HeatmapUATDataPoint =>
  ({
    uat_name,
    amount,
    id: uat_name,
    natcode: `${uat_name}-code`,
  }) as unknown as HeatmapUATDataPoint

const singleItem = [createDataPoint('Cluj', 1000000)]

const multipleItems = [
  createDataPoint('Cluj', 1000000),
  createDataPoint('Bucharest', 2000000),
  createDataPoint('Timisoara', 500000),
  createDataPoint('Iasi', 1500000),
  createDataPoint('Constanta', 750000),
]

// ============================================================================
// TESTS
// ============================================================================

describe('UatTopNBarChart', () => {
  describe('empty state', () => {
    it('renders empty message when data is empty', () => {
      render(<UatTopNBarChart data={[]} valueKey="amount" nameKey="uat_name" />)

      expect(screen.getByText('Not enough data to display this chart.')).toBeInTheDocument()
    })

    it('renders empty message when data has invalid values', () => {
      const invalidData = [{ uat_name: 'Test' }] as unknown as HeatmapUATDataPoint[]
      render(<UatTopNBarChart data={invalidData} valueKey="amount" nameKey="uat_name" />)

      expect(screen.getByText('Not enough data to display this chart.')).toBeInTheDocument()
    })
  })

  describe('chart rendering', () => {
    it('renders chart with single data point', () => {
      render(<UatTopNBarChart data={singleItem} valueKey="amount" nameKey="uat_name" />)

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-item-count', '1')
    })

    it('renders chart with multiple data points', () => {
      render(<UatTopNBarChart data={multipleItems} valueKey="amount" nameKey="uat_name" />)

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    })

    it('renders chart title when provided', () => {
      render(
        <UatTopNBarChart
          data={singleItem}
          valueKey="amount"
          nameKey="uat_name"
          chartTitle="Top Spending"
        />
      )

      expect(screen.getByText('Top Spending')).toBeInTheDocument()
    })

    it('does not render title when not provided', () => {
      render(<UatTopNBarChart data={singleItem} valueKey="amount" nameKey="uat_name" />)

      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })

    it('uses vertical layout for horizontal bar chart', () => {
      render(<UatTopNBarChart data={singleItem} valueKey="amount" nameKey="uat_name" />)

      expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-layout', 'vertical')
    })
  })

  describe('topN limiting', () => {
    it('limits data to default topN (10)', () => {
      const manyItems = Array.from({ length: 15 }, (_, i) =>
        createDataPoint(`Item ${i}`, (15 - i) * 1000)
      )
      render(<UatTopNBarChart data={manyItems} valueKey="amount" nameKey="uat_name" />)

      expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-item-count', '10')
    })

    it('limits data to custom topN', () => {
      render(
        <UatTopNBarChart data={multipleItems} valueKey="amount" nameKey="uat_name" topN={3} />
      )

      expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-item-count', '3')
    })
  })

  describe('chart components', () => {
    it('renders all chart components', () => {
      render(<UatTopNBarChart data={singleItem} valueKey="amount" nameKey="uat_name" />)

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      expect(screen.getByTestId('bar')).toBeInTheDocument()
      expect(screen.getByTestId('x-axis')).toBeInTheDocument()
      expect(screen.getByTestId('y-axis')).toBeInTheDocument()
      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    })

    it('passes correct dataKey to bar component', () => {
      render(<UatTopNBarChart data={singleItem} valueKey="amount" nameKey="uat_name" />)

      expect(screen.getByTestId('bar')).toHaveAttribute('data-key', 'amount')
    })

    it('uses custom bar color when provided', () => {
      render(
        <UatTopNBarChart
          data={singleItem}
          valueKey="amount"
          nameKey="uat_name"
          barColor="#ff0000"
        />
      )

      expect(screen.getByTestId('bar')).toHaveAttribute('data-fill', '#ff0000')
    })

    it('uses default bar color when not provided', () => {
      render(<UatTopNBarChart data={singleItem} valueKey="amount" nameKey="uat_name" />)

      expect(screen.getByTestId('bar')).toHaveAttribute('data-fill', '#8884d8')
    })

    it('shows legend only when topN <= 15', () => {
      render(<UatTopNBarChart data={singleItem} valueKey="amount" nameKey="uat_name" topN={15} />)
      expect(screen.getByTestId('legend')).toBeInTheDocument()
    })
  })

  describe('axis configuration', () => {
    it('configures x-axis as number type', () => {
      render(<UatTopNBarChart data={singleItem} valueKey="amount" nameKey="uat_name" />)

      expect(screen.getByTestId('x-axis')).toHaveAttribute('data-type', 'number')
    })

    it('configures y-axis as category type', () => {
      render(<UatTopNBarChart data={singleItem} valueKey="amount" nameKey="uat_name" />)

      expect(screen.getByTestId('y-axis')).toHaveAttribute('data-type', 'category')
    })

    it('uses nameKey for y-axis dataKey', () => {
      render(<UatTopNBarChart data={singleItem} valueKey="amount" nameKey="uat_name" />)

      expect(screen.getByTestId('y-axis')).toHaveAttribute('data-key', 'uat_name')
    })
  })
})
