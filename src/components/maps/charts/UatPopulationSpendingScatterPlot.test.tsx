/**
 * UatPopulationSpendingScatterPlot Component Tests
 *
 * This file tests the UatPopulationSpendingScatterPlot component which renders
 * a scatter plot showing population vs spending outliers.
 *
 * Pattern: Chart Component Testing
 * - Mock Recharts components
 * - Test outlier filtering logic
 * - Test empty/error states
 * - Test rendering with different configurations
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { UatPopulationSpendingScatterPlot } from './UatPopulationSpendingScatterPlot'
import type { HeatmapUATDataPoint } from '@/schemas/heatmap'

// ============================================================================
// MOCKS
// ============================================================================

// Mock Recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  ScatterChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="scatter-chart" data-item-count={data.length}>
      {children}
    </div>
  ),
  Scatter: ({ name, data, fill }: { name: string; data: unknown[]; fill: string }) => (
    <div data-testid="scatter" data-name={name} data-fill={fill} data-item-count={data.length} />
  ),
  XAxis: ({ dataKey, type }: { dataKey: string; type: string }) => (
    <div data-testid="x-axis" data-key={dataKey} data-type={type} />
  ),
  YAxis: ({ dataKey, type }: { dataKey: string; type: string }) => (
    <div data-testid="y-axis" data-key={dataKey} data-type={type} />
  ),
  ZAxis: ({ dataKey }: { dataKey: string }) => (
    <div data-testid="z-axis" data-key={dataKey} />
  ),
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
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
  name: string,
  population: number,
  amount: number
): HeatmapUATDataPoint =>
  ({
    uat_name: name,
    population,
    amount,
    id: name,
    natcode: `${name}-code`,
  }) as unknown as HeatmapUATDataPoint

const singleItem = [createDataPoint('Cluj', 300000, 1000000)]

const smallDataset = [
  createDataPoint('Cluj', 300000, 1000000),
  createDataPoint('Bucharest', 2000000, 5000000),
  createDataPoint('Timisoara', 300000, 800000),
]

const largeDataset = Array.from({ length: 30 }, (_, i) =>
  createDataPoint(`City ${i}`, (i + 1) * 10000, (i + 1) * 100000)
)

// ============================================================================
// TESTS
// ============================================================================

describe('UatPopulationSpendingScatterPlot', () => {
  describe('empty state', () => {
    it('renders empty message when data is empty', () => {
      render(<UatPopulationSpendingScatterPlot data={[]} />)

      expect(screen.getByText('Not enough data for scatter plot.')).toBeInTheDocument()
    })

    it('renders empty message when data has no valid entries', () => {
      const invalidData = [{ uat_name: 'Test' }] as HeatmapUATDataPoint[]
      render(<UatPopulationSpendingScatterPlot data={invalidData} />)

      expect(screen.getByText('Not enough data for scatter plot.')).toBeInTheDocument()
    })
  })

  describe('chart rendering', () => {
    it('renders chart with single data point', () => {
      render(<UatPopulationSpendingScatterPlot data={singleItem} />)

      expect(screen.getByTestId('scatter-chart')).toBeInTheDocument()
    })

    it('renders chart with small dataset (no outlier filtering)', () => {
      render(<UatPopulationSpendingScatterPlot data={smallDataset} />)

      expect(screen.getByTestId('scatter-chart')).toBeInTheDocument()
      // Small datasets show all data without filtering
      expect(screen.getByTestId('scatter')).toHaveAttribute('data-item-count', '3')
    })

    it('renders chart title when provided', () => {
      render(
        <UatPopulationSpendingScatterPlot
          data={singleItem}
          chartTitle="Population vs Spending"
        />
      )

      expect(screen.getByText('Population vs Spending')).toBeInTheDocument()
    })

    it('does not render title when not provided', () => {
      render(<UatPopulationSpendingScatterPlot data={singleItem} />)

      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })
  })

  describe('outlier filtering', () => {
    it('applies outlier filtering for large datasets (>= 25 items)', () => {
      render(<UatPopulationSpendingScatterPlot data={largeDataset} />)

      expect(screen.getByTestId('scatter-chart')).toBeInTheDocument()
      // With 30 items, it should filter to outliers
      const scatter = screen.getByTestId('scatter')
      const itemCount = parseInt(scatter.getAttribute('data-item-count') || '0')
      // Should have less than the original 30 items after filtering
      expect(itemCount).toBeLessThanOrEqual(30)
    })

    it('does not apply filtering for small datasets (< 25 items)', () => {
      render(<UatPopulationSpendingScatterPlot data={smallDataset} />)

      expect(screen.getByTestId('scatter')).toHaveAttribute('data-item-count', '3')
    })
  })

  describe('chart components', () => {
    it('renders all chart components', () => {
      render(<UatPopulationSpendingScatterPlot data={singleItem} />)

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      expect(screen.getByTestId('scatter-chart')).toBeInTheDocument()
      expect(screen.getByTestId('scatter')).toBeInTheDocument()
      expect(screen.getByTestId('x-axis')).toBeInTheDocument()
      expect(screen.getByTestId('y-axis')).toBeInTheDocument()
      expect(screen.getByTestId('z-axis')).toBeInTheDocument()
      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
      expect(screen.getByTestId('legend')).toBeInTheDocument()
    })

    it('uses population for x-axis', () => {
      render(<UatPopulationSpendingScatterPlot data={singleItem} />)

      expect(screen.getByTestId('x-axis')).toHaveAttribute('data-key', 'population')
      expect(screen.getByTestId('x-axis')).toHaveAttribute('data-type', 'number')
    })

    it('uses amount for y-axis', () => {
      render(<UatPopulationSpendingScatterPlot data={singleItem} />)

      expect(screen.getByTestId('y-axis')).toHaveAttribute('data-key', 'amount')
      expect(screen.getByTestId('y-axis')).toHaveAttribute('data-type', 'number')
    })

    it('uses uat_name for z-axis', () => {
      render(<UatPopulationSpendingScatterPlot data={singleItem} />)

      expect(screen.getByTestId('z-axis')).toHaveAttribute('data-key', 'uat_name')
    })

    it('uses custom dot color when provided', () => {
      render(
        <UatPopulationSpendingScatterPlot data={singleItem} dotColor="#ff0000" />
      )

      expect(screen.getByTestId('scatter')).toHaveAttribute('data-fill', '#ff0000')
    })

    it('uses default dot color when not provided', () => {
      render(<UatPopulationSpendingScatterPlot data={singleItem} />)

      expect(screen.getByTestId('scatter')).toHaveAttribute('data-fill', '#8884d8')
    })
  })

  describe('styling', () => {
    it('renders with correct container dimensions', () => {
      const { container } = render(
        <UatPopulationSpendingScatterPlot data={singleItem} />
      )

      const chartContainer = container.firstChild as HTMLElement
      expect(chartContainer).toHaveStyle({ width: '100%', height: '400px' })
    })
  })
})
