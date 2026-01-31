/**
 * AggregatedPieChart Component Tests
 *
 * This file tests the AggregatedPieChart component which renders
 * aggregated data as pie charts using Recharts.
 *
 * Pattern: Aggregated Chart Testing
 * - Mock Recharts components
 * - Test multi-unit warning
 * - Test pie configuration
 * - Test legend and tooltip
 * - Test annotations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { AggregatedPieChart } from './AggregatedPieChart'
import type { Chart, SeriesConfiguration } from '@/schemas/charts'
import type { DataPointPayload } from '@/components/charts/hooks/useChartData'

// ============================================================================
// MOCKS
// ============================================================================

// Captured props for assertions
let capturedPieChartProps: any = null
let capturedPieProps: any = null
let capturedLegendProps: any = null

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children, height }: any) => (
    <div data-testid="responsive-container" data-height={height}>{children}</div>
  ),
  PieChart: ({ children, ...props }: any) => {
    capturedPieChartProps = props
    return <div data-testid="pie-chart">{children}</div>
  },
  Pie: ({ children, label, ...props }: any) => {
    capturedPieProps = { ...props, label }
    // Test label function
    if (label) {
      const result = label({ cx: 100, cy: 100, midAngle: 45, outerRadius: 80, percent: 0.25 })
      const labelContent =
        typeof result === 'string' || typeof result === 'number'
          ? result
          : result?.props?.children
      return (
        <div data-testid="pie">
          {result && <span data-testid="pie-label">{labelContent}</span>}
          {children}
        </div>
      )
    }
    return <div data-testid="pie">{children}</div>
  },
  Cell: ({ fill, stroke }: { fill: string; stroke: string }) => (
    <div data-testid="pie-cell" data-fill={fill} data-stroke={stroke} />
  ),
  Tooltip: ({ content }: any) => {
    if (content) {
      const result = content({ payload: [{ payload: { id: 'test' } }] })
      return <div data-testid="tooltip">{result}</div>
    }
    return <div data-testid="tooltip" />
  },
  Legend: (props: any) => {
    capturedLegendProps = props
    return <div data-testid="legend" data-vertical-align={props.verticalAlign} />
  },
}))

vi.mock('@/components/charts/safe-responsive-container', () => ({
  SafeResponsiveContainer: ({ children, height }: any) => (
    <div data-testid="responsive-container" data-height={height}>{children}</div>
  ),
}))

// Mock ChartAnnotation
vi.mock('../ChartAnnotation', () => ({
  ChartAnnotation: ({ annotation }: any) => (
    <div data-testid="chart-annotation" data-id={annotation.id} />
  ),
}))

// Mock Tooltips
vi.mock('../Tooltips', () => ({
  CustomSeriesTooltip: () => <div data-testid="custom-tooltip">Tooltip Content</div>,
}))

// ============================================================================
// TEST DATA
// ============================================================================

const createMockSeries = (overrides: Partial<SeriesConfiguration> = {}): SeriesConfiguration => ({
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
    chartType: 'pie-aggr',
    color: '#000000',
    showLegend: true,
    showTooltip: true,
    showGridLines: true,
    editAnnotations: true,
    showAnnotations: true,
  },
  series: [createMockSeries()],
  annotations: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

const createMockDataPoint = (overrides: Partial<DataPointPayload> = {}): DataPointPayload => ({
  id: 'dp-1',
  value: 1000,
  unit: 'RON',
  year: 2023,
  initialValue: 1000,
  initialUnit: 'RON',
  series: createMockSeries(),
  ...overrides,
})

const mockUnitMap = new Map([['dp-1', 'RON']])
const mockDataMap = new Map()
const mockTimeSeriesData: any[] = []

// Default props that are required but not used by aggregated charts
const defaultProps = {
  dataMap: mockDataMap,
  timeSeriesData: mockTimeSeriesData,
}

// ============================================================================
// TESTS
// ============================================================================

describe('AggregatedPieChart', () => {
  const mockOnAnnotationPositionChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    capturedPieChartProps = null
    capturedPieProps = null
    capturedLegendProps = null
  })

  describe('multi-unit warning', () => {
    it('shows warning when multiple units are present', () => {
      const multiUnitMap = new Map([
        ['dp-1', 'RON'],
        ['dp-2', 'EUR'],
      ])

      render(
        <AggregatedPieChart
          chart={createMockChart()}
          unitMap={multiUnitMap}
          aggregatedData={[createMockDataPoint()]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(screen.getByText('Multiple units selected')).toBeInTheDocument()
    })

    it('lists the conflicting units', () => {
      const multiUnitMap = new Map([
        ['dp-1', 'RON'],
        ['dp-2', 'EUR'],
      ])

      render(
        <AggregatedPieChart
          chart={createMockChart()}
          unitMap={multiUnitMap}
          aggregatedData={[createMockDataPoint()]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(screen.getByText(/RON, EUR|EUR, RON/)).toBeInTheDocument()
    })

    it('renders warning icon', () => {
      const multiUnitMap = new Map([
        ['dp-1', 'RON'],
        ['dp-2', 'EUR'],
      ])

      render(
        <AggregatedPieChart
          chart={createMockChart()}
          unitMap={multiUnitMap}
          aggregatedData={[createMockDataPoint()]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(document.querySelector('.lucide-triangle-alert')).toBeInTheDocument()
    })

    it('shows helpful message about selecting same unit', () => {
      const multiUnitMap = new Map([
        ['dp-1', 'RON'],
        ['dp-2', 'EUR'],
      ])

      render(
        <AggregatedPieChart
          chart={createMockChart()}
          unitMap={multiUnitMap}
          aggregatedData={[createMockDataPoint()]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(screen.getByText(/Please select series with the same unit/)).toBeInTheDocument()
    })
  })

  describe('chart rendering', () => {
    it('renders ResponsiveContainer with correct height', () => {
      render(
        <AggregatedPieChart
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={[createMockDataPoint()]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={500}
          {...defaultProps}
        />
      )

      expect(screen.getByTestId('responsive-container')).toHaveAttribute('data-height', '500')
    })

    it('renders PieChart', () => {
      render(
        <AggregatedPieChart
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={[createMockDataPoint()]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    })

    it('sets correct margins', () => {
      render(
        <AggregatedPieChart
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={[createMockDataPoint()]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(capturedPieChartProps.margin).toEqual({ top: 40, right: 5, bottom: 70, left: 5 })
    })
  })

  describe('pie configuration', () => {
    it('sets Pie dataKey to value', () => {
      render(
        <AggregatedPieChart
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={[createMockDataPoint()]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(capturedPieProps.dataKey).toBe('value')
    })

    it('sets Pie nameKey to series.label', () => {
      render(
        <AggregatedPieChart
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={[createMockDataPoint()]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(capturedPieProps.nameKey).toBe('series.label')
    })

    it('centers pie at 50%', () => {
      render(
        <AggregatedPieChart
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={[createMockDataPoint()]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(capturedPieProps.cx).toBe('50%')
      expect(capturedPieProps.cy).toBe('50%')
    })

    it('sets padding angle to 2', () => {
      render(
        <AggregatedPieChart
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={[createMockDataPoint()]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(capturedPieProps.paddingAngle).toBe(2)
    })

    it('disables label line', () => {
      render(
        <AggregatedPieChart
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={[createMockDataPoint()]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(capturedPieProps.labelLine).toBe(false)
    })
  })

  describe('animation', () => {
    it('sets animation duration to 800ms', () => {
      render(
        <AggregatedPieChart
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={[createMockDataPoint()]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(capturedPieProps.animationDuration).toBe(800)
    })

    it('sets animation easing to ease-out', () => {
      render(
        <AggregatedPieChart
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={[createMockDataPoint()]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(capturedPieProps.animationEasing).toBe('ease-out')
    })
  })

  describe('pie cells', () => {
    it('renders Cell for each data point', () => {
      const data = [
        createMockDataPoint({ id: 'dp-1' }),
        createMockDataPoint({ id: 'dp-2' }),
      ]

      render(
        <AggregatedPieChart
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={data}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      const cells = screen.getAllByTestId('pie-cell')
      expect(cells).toHaveLength(2)
    })

    it('uses white stroke for cells', () => {
      render(
        <AggregatedPieChart
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={[createMockDataPoint()]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(screen.getByTestId('pie-cell')).toHaveAttribute('data-stroke', 'white')
    })

    it('uses series color when available', () => {
      const data = [
        createMockDataPoint({
          series: createMockSeries({ config: { color: '#ff00ff', showDataLabels: false } }),
        }),
      ]

      render(
        <AggregatedPieChart
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={data}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(screen.getByTestId('pie-cell')).toHaveAttribute('data-fill', '#ff00ff')
    })
  })

  describe('tooltip', () => {
    it('renders Tooltip when showTooltip is true', () => {
      render(
        <AggregatedPieChart
          chart={createMockChart({ config: { ...createMockChart().config, showTooltip: true } })}
          unitMap={mockUnitMap}
          aggregatedData={[createMockDataPoint()]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    })

    it('does not render Tooltip when showTooltip is false', () => {
      render(
        <AggregatedPieChart
          chart={createMockChart({ config: { ...createMockChart().config, showTooltip: false } })}
          unitMap={mockUnitMap}
          aggregatedData={[createMockDataPoint()]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument()
    })
  })

  describe('legend', () => {
    it('renders Legend when showLegend is true', () => {
      render(
        <AggregatedPieChart
          chart={createMockChart({ config: { ...createMockChart().config, showLegend: true } })}
          unitMap={mockUnitMap}
          aggregatedData={[createMockDataPoint()]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(screen.getByTestId('legend')).toBeInTheDocument()
    })

    it('does not render Legend when showLegend is false', () => {
      render(
        <AggregatedPieChart
          chart={createMockChart({ config: { ...createMockChart().config, showLegend: false } })}
          unitMap={mockUnitMap}
          aggregatedData={[createMockDataPoint()]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(screen.queryByTestId('legend')).not.toBeInTheDocument()
    })

    it('positions legend at bottom', () => {
      render(
        <AggregatedPieChart
          chart={createMockChart({ config: { ...createMockChart().config, showLegend: true } })}
          unitMap={mockUnitMap}
          aggregatedData={[createMockDataPoint()]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(capturedLegendProps.verticalAlign).toBe('bottom')
    })

    it('uses horizontal layout', () => {
      render(
        <AggregatedPieChart
          chart={createMockChart({ config: { ...createMockChart().config, showLegend: true } })}
          unitMap={mockUnitMap}
          aggregatedData={[createMockDataPoint()]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(capturedLegendProps.layout).toBe('horizontal')
    })

    it('uses circle icon type', () => {
      render(
        <AggregatedPieChart
          chart={createMockChart({ config: { ...createMockChart().config, showLegend: true } })}
          unitMap={mockUnitMap}
          aggregatedData={[createMockDataPoint()]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(capturedLegendProps.iconType).toBe('circle')
    })
  })

  describe('annotations', () => {
    it('renders annotations when showAnnotations is true', () => {
      const chart = createMockChart({
        config: { ...createMockChart().config, showAnnotations: true },
        annotations: [
          { id: 'ann-1', type: 'annotation', enabled: true, pX: 0.5, pY: 0.5, pXDelta: 0, pYDelta: 0, color: '#000', title: 'Test', locked: false, connector: true, subject: true, label: true },
        ],
      })

      render(
        <AggregatedPieChart
          chart={chart}
          unitMap={mockUnitMap}
          aggregatedData={[createMockDataPoint()]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(screen.getByTestId('chart-annotation')).toBeInTheDocument()
    })

    it('does not render disabled annotations', () => {
      const chart = createMockChart({
        config: { ...createMockChart().config, showAnnotations: true },
        annotations: [
          { id: 'ann-1', type: 'annotation', enabled: false, pX: 0.5, pY: 0.5, pXDelta: 0, pYDelta: 0, color: '#000', title: 'Test', locked: false, connector: true, subject: true, label: true },
        ],
      })

      render(
        <AggregatedPieChart
          chart={chart}
          unitMap={mockUnitMap}
          aggregatedData={[createMockDataPoint()]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(screen.queryByTestId('chart-annotation')).not.toBeInTheDocument()
    })
  })
})
