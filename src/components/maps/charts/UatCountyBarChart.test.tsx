/**
 * UatCountyBarChart Component Tests
 *
 * This file tests the UatCountyBarChart component which renders
 * a bar chart showing aggregated county-level spending data.
 *
 * Pattern: Chart Component Testing
 * - Mock Recharts components
 * - Test data aggregation logic
 * - Test empty/error states
 * - Test rendering with different configurations
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { UatCountyBarChart } from './UatCountyBarChart'
import type { HeatmapCountyDataPoint } from '@/schemas/heatmap'

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

// Mock formatCurrency utility
vi.mock('@/lib/utils', () => ({
  formatCurrency: (value: number, format: string) =>
    format === 'compact' ? `${value / 1000}K` : `${value}`,
}))

// ============================================================================
// TEST DATA
// ============================================================================

const createDataPoint = (
  county_name: string,
  amount: number
): HeatmapCountyDataPoint =>
  ({
    county_name,
    amount,
    id: county_name,
    natcode: `${county_name}-code`,
  }) as unknown as HeatmapCountyDataPoint

const singleCountyData = [createDataPoint('Cluj', 1000000)]

const multiCountyData = [
  createDataPoint('Cluj', 1000000),
  createDataPoint('Bucharest', 2000000),
  createDataPoint('Timisoara', 500000),
]

const multiRecordsSameCounty = [
  createDataPoint('Cluj', 1000000),
  createDataPoint('Cluj', 500000),
  createDataPoint('Bucharest', 2000000),
]

// ============================================================================
// TESTS
// ============================================================================

describe('UatCountyBarChart', () => {
  describe('empty state', () => {
    it('renders empty message when data is empty', () => {
      render(<UatCountyBarChart data={[]} />)

      expect(
        screen.getByText('Not enough county data to display this chart.')
      ).toBeInTheDocument()
    })

    it('renders empty message when data has no county names', () => {
      const invalidData = [{ amount: 1000 }] as HeatmapCountyDataPoint[]
      render(<UatCountyBarChart data={invalidData} />)

      expect(
        screen.getByText('Not enough county data to display this chart.')
      ).toBeInTheDocument()
    })

    it('renders empty message when data has no amounts', () => {
      const invalidData = [{ county_name: 'Cluj' }] as HeatmapCountyDataPoint[]
      render(<UatCountyBarChart data={invalidData} />)

      expect(
        screen.getByText('Not enough county data to display this chart.')
      ).toBeInTheDocument()
    })
  })

  describe('chart rendering', () => {
    it('renders chart with single data point', () => {
      render(<UatCountyBarChart data={singleCountyData} />)

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-item-count', '1')
    })

    it('renders chart with multiple data points', () => {
      render(<UatCountyBarChart data={multiCountyData} />)

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-item-count', '3')
    })

    it('renders chart title when provided', () => {
      render(<UatCountyBarChart data={singleCountyData} chartTitle="County Spending" />)

      expect(screen.getByText('County Spending')).toBeInTheDocument()
    })

    it('does not render title when not provided', () => {
      render(<UatCountyBarChart data={singleCountyData} />)

      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })
  })

  describe('chart components', () => {
    it('renders all chart components', () => {
      render(<UatCountyBarChart data={singleCountyData} />)

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
      render(<UatCountyBarChart data={singleCountyData} />)

      expect(screen.getByTestId('bar')).toHaveAttribute('data-key', 'total_amount')
    })

    it('passes correct x-axis dataKey', () => {
      render(<UatCountyBarChart data={singleCountyData} />)

      expect(screen.getByTestId('x-axis')).toHaveAttribute('data-key', 'county_name')
    })

    it('uses custom bar color when provided', () => {
      render(<UatCountyBarChart data={singleCountyData} barColor="#ff0000" />)

      expect(screen.getByTestId('bar')).toHaveAttribute('data-fill', '#ff0000')
    })

    it('uses default bar color when not provided', () => {
      render(<UatCountyBarChart data={singleCountyData} />)

      expect(screen.getByTestId('bar')).toHaveAttribute('data-fill', '#ffc658')
    })
  })

  describe('data aggregation', () => {
    it('aggregates multiple records for the same county', () => {
      render(<UatCountyBarChart data={multiRecordsSameCounty} />)

      // Should have 2 counties (Cluj with aggregated values, Bucharest)
      expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-item-count', '2')
    })
  })

  describe('styling', () => {
    it('renders with correct container dimensions', () => {
      const { container } = render(<UatCountyBarChart data={singleCountyData} />)

      const chartContainer = container.firstChild as HTMLElement
      expect(chartContainer).toHaveStyle({ width: '100%', height: '400px' })
    })
  })
})
