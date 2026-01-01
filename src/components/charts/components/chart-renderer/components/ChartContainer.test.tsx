/**
 * ChartContainer Component Tests
 *
 * This file tests the ChartContainer component which renders
 * basic chart axes, grid, tooltip, legend, and annotations.
 *
 * Pattern: Recharts Container Testing
 * - Mock Recharts components
 * - Test conditional rendering (grid, tooltip, legend)
 * - Test Y-axis formatting (currency vs percentage)
 * - Test annotations rendering
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { ChartContainer } from './ChartContainer'
import type { Chart, SeriesConfiguration } from '@/schemas/charts'

// ============================================================================
// MOCKS
// ============================================================================

// Captured props for assertions
let capturedYAxisProps: any = null

vi.mock('recharts', () => ({
  XAxis: (props: any) => (
    <div data-testid="x-axis" data-datakey={props.dataKey} />
  ),
  YAxis: (props: any) => {
    capturedYAxisProps = props
    return <div data-testid="y-axis" />
  },
  CartesianGrid: (props: any) => (
    <div data-testid="cartesian-grid" data-strokedasharray={props.strokeDasharray} />
  ),
  Tooltip: (props: any) => (
    <div data-testid="tooltip" data-zindex={props.wrapperStyle?.zIndex} />
  ),
  Legend: (props: any) => (
    <div data-testid="legend" data-verticalalign={props.verticalAlign} />
  ),
}))

// Mock ChartAnnotation
vi.mock('./ChartAnnotation', () => ({
  ChartAnnotation: ({ annotation }: any) => (
    <div data-testid="chart-annotation" data-id={annotation.id} />
  ),
}))

// Mock CustomSeriesTooltip
vi.mock('./Tooltips', () => ({
  CustomSeriesTooltip: ({ chartConfig }: any) => (
    <div data-testid="series-tooltip" data-showlegend={chartConfig?.showLegend} />
  ),
}))

// Mock utils
vi.mock('@/lib/utils', () => ({
  formatCurrency: (value: number, format: string) =>
    format === 'compact' ? `$${value.toLocaleString()}` : `$${value}`,
  formatNumber: (value: number) => value.toLocaleString(),
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}))

// ============================================================================
// TEST DATA
// ============================================================================

const createMockSeries = (
  overrides: Partial<SeriesConfiguration> = {}
): SeriesConfiguration => ({
  id: 'series-1',
  type: 'line-items-aggregated-yearly',
  enabled: true,
  label: 'Test Series',
  unit: 'RON',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  filter: { account_category: 'ch', normalization: 'total' },
  config: { color: '#0000ff', showDataLabels: false },
  ...overrides,
})

const createMockChart = (overrides: Partial<Chart> = {}): Chart => ({
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
    showDiffControl: false,
    showDataLabels: false,
  },
  series: [createMockSeries()],
  annotations: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

// ============================================================================
// TESTS
// ============================================================================

describe('ChartContainer', () => {
  const mockOnAnnotationPositionChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    capturedYAxisProps = null
  })

  describe('rendering', () => {
    it('renders XAxis with year dataKey', () => {
      render(
        <ChartContainer
          chart={createMockChart()}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        >
          <div>Chart content</div>
        </ChartContainer>
      )

      expect(screen.getByTestId('x-axis')).toBeInTheDocument()
      expect(screen.getByTestId('x-axis')).toHaveAttribute('data-datakey', 'year')
    })

    it('renders YAxis', () => {
      render(
        <ChartContainer
          chart={createMockChart()}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        >
          <div>Chart content</div>
        </ChartContainer>
      )

      expect(screen.getByTestId('y-axis')).toBeInTheDocument()
    })

    it('renders children', () => {
      render(
        <ChartContainer
          chart={createMockChart()}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        >
          <div data-testid="child-content">Chart content</div>
        </ChartContainer>
      )

      expect(screen.getByTestId('child-content')).toBeInTheDocument()
    })
  })

  describe('grid lines', () => {
    it('renders CartesianGrid when showGridLines is true', () => {
      render(
        <ChartContainer
          chart={createMockChart({ config: { ...createMockChart().config, showGridLines: true } })}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        >
          <div>Content</div>
        </ChartContainer>
      )

      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
    })

    it('does not render CartesianGrid when showGridLines is false', () => {
      render(
        <ChartContainer
          chart={createMockChart({ config: { ...createMockChart().config, showGridLines: false } })}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        >
          <div>Content</div>
        </ChartContainer>
      )

      expect(screen.queryByTestId('cartesian-grid')).not.toBeInTheDocument()
    })
  })

  describe('tooltip', () => {
    it('renders Tooltip when showTooltip is true', () => {
      render(
        <ChartContainer
          chart={createMockChart({ config: { ...createMockChart().config, showTooltip: true } })}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        >
          <div>Content</div>
        </ChartContainer>
      )

      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    })

    it('does not render Tooltip when showTooltip is false', () => {
      render(
        <ChartContainer
          chart={createMockChart({ config: { ...createMockChart().config, showTooltip: false } })}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        >
          <div>Content</div>
        </ChartContainer>
      )

      expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument()
    })

    it('sets tooltip z-index to 10', () => {
      render(
        <ChartContainer
          chart={createMockChart({ config: { ...createMockChart().config, showTooltip: true } })}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        >
          <div>Content</div>
        </ChartContainer>
      )

      expect(screen.getByTestId('tooltip')).toHaveAttribute('data-zindex', '10')
    })
  })

  describe('legend', () => {
    it('renders Legend when showLegend is true', () => {
      render(
        <ChartContainer
          chart={createMockChart({ config: { ...createMockChart().config, showLegend: true } })}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        >
          <div>Content</div>
        </ChartContainer>
      )

      expect(screen.getByTestId('legend')).toBeInTheDocument()
    })

    it('does not render Legend when showLegend is false', () => {
      render(
        <ChartContainer
          chart={createMockChart({ config: { ...createMockChart().config, showLegend: false } })}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        >
          <div>Content</div>
        </ChartContainer>
      )

      expect(screen.queryByTestId('legend')).not.toBeInTheDocument()
    })

    it('configures Legend with bottom alignment', () => {
      render(
        <ChartContainer
          chart={createMockChart({ config: { ...createMockChart().config, showLegend: true } })}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        >
          <div>Content</div>
        </ChartContainer>
      )

      expect(screen.getByTestId('legend')).toHaveAttribute('data-verticalalign', 'bottom')
    })
  })

  describe('Y-axis formatting', () => {
    it('formats Y-axis values as currency when showRelativeValues is false', () => {
      render(
        <ChartContainer
          chart={createMockChart({ config: { ...createMockChart().config, showRelativeValues: false } })}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        >
          <div>Content</div>
        </ChartContainer>
      )

      const formatter = capturedYAxisProps.tickFormatter
      expect(formatter(1000)).toBe('$1,000')
    })

    it('formats Y-axis values as percentage when showRelativeValues is true', () => {
      render(
        <ChartContainer
          chart={createMockChart({ config: { ...createMockChart().config, showRelativeValues: true } })}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        >
          <div>Content</div>
        </ChartContainer>
      )

      const formatter = capturedYAxisProps.tickFormatter
      expect(formatter(50)).toBe('50%')
    })

    it('defaults to currency formatting when showRelativeValues is undefined', () => {
      const chart = createMockChart()
      delete (chart.config as any).showRelativeValues

      render(
        <ChartContainer
          chart={chart}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        >
          <div>Content</div>
        </ChartContainer>
      )

      const formatter = capturedYAxisProps.tickFormatter
      expect(formatter(1000)).toBe('$1,000')
    })
  })

  describe('annotations', () => {
    it('renders annotations when showAnnotations is true', () => {
      const chart = createMockChart({
        config: { ...createMockChart().config, showAnnotations: true },
        annotations: [
          {
            id: 'ann-1',
            type: 'annotation',
            enabled: true,
            pX: 0.5,
            pY: 0.5,
            pXDelta: 0.1,
            pYDelta: 0.1,
            color: '#ff0000',
            title: 'Test',
            subtitle: '',
            connector: true,
            subject: true,
            label: true,
            locked: false,
          },
        ],
      })

      render(
        <ChartContainer
          chart={chart}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        >
          <div>Content</div>
        </ChartContainer>
      )

      expect(screen.getByTestId('chart-annotation')).toBeInTheDocument()
    })

    it('does not render annotations when showAnnotations is false', () => {
      const chart = createMockChart({
        config: { ...createMockChart().config, showAnnotations: false },
        annotations: [
          {
            id: 'ann-1',
            type: 'annotation',
            enabled: true,
            pX: 0.5,
            pY: 0.5,
            pXDelta: 0.1,
            pYDelta: 0.1,
            color: '#ff0000',
            title: 'Test',
            subtitle: '',
            connector: true,
            subject: true,
            label: true,
            locked: false,
          },
        ],
      })

      render(
        <ChartContainer
          chart={chart}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        >
          <div>Content</div>
        </ChartContainer>
      )

      expect(screen.queryByTestId('chart-annotation')).not.toBeInTheDocument()
    })

    it('does not render disabled annotations', () => {
      const chart = createMockChart({
        config: { ...createMockChart().config, showAnnotations: true },
        annotations: [
          {
            id: 'ann-1',
            type: 'annotation',
            enabled: false,
            pX: 0.5,
            pY: 0.5,
            pXDelta: 0.1,
            pYDelta: 0.1,
            color: '#ff0000',
            title: 'Test',
            subtitle: '',
            connector: true,
            subject: true,
            label: true,
            locked: false,
          },
        ],
      })

      render(
        <ChartContainer
          chart={chart}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        >
          <div>Content</div>
        </ChartContainer>
      )

      expect(screen.queryByTestId('chart-annotation')).not.toBeInTheDocument()
    })

    it('renders multiple annotations', () => {
      const chart = createMockChart({
        config: { ...createMockChart().config, showAnnotations: true },
        annotations: [
          {
            id: 'ann-1',
            type: 'annotation',
            enabled: true,
            pX: 0.3,
            pY: 0.3,
            pXDelta: 0.1,
            pYDelta: 0.1,
            color: '#ff0000',
            title: 'First',
            subtitle: '',
            connector: true,
            subject: true,
            label: true,
            locked: false,
          },
          {
            id: 'ann-2',
            type: 'annotation',
            enabled: true,
            pX: 0.7,
            pY: 0.7,
            pXDelta: 0.1,
            pYDelta: 0.1,
            color: '#00ff00',
            title: 'Second',
            subtitle: '',
            connector: true,
            subject: true,
            label: true,
            locked: false,
          },
        ],
      })

      render(
        <ChartContainer
          chart={chart}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        >
          <div>Content</div>
        </ChartContainer>
      )

      expect(screen.getAllByTestId('chart-annotation')).toHaveLength(2)
    })
  })
})
