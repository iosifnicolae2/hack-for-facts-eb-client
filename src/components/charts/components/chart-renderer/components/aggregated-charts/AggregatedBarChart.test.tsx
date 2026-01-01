/**
 * AggregatedBarChart Component Tests
 *
 * This file tests the AggregatedBarChart component which renders
 * aggregated data as horizontal bar charts using Recharts.
 *
 * Pattern: Aggregated Chart Testing
 * - Mock Recharts components
 * - Test multi-unit warning
 * - Test label truncation
 * - Test bar configuration
 * - Test annotations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { AggregatedBarChart } from './AggregatedBarChart'
import type { Chart, SeriesConfiguration } from '@/schemas/charts'
import type { DataPointPayload } from '@/components/charts/hooks/useChartData'

// ============================================================================
// MOCKS
// ============================================================================

// Captured props for assertions
let capturedBarChartProps: any = null
let capturedBarProps: any = null
let capturedYAxisProps: any = null

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children, height }: any) => (
    <div data-testid="responsive-container" data-height={height}>{children}</div>
  ),
  BarChart: ({ children, layout, ...props }: any) => {
    capturedBarChartProps = { ...props, layout }
    return <div data-testid="bar-chart" data-layout={layout}>{children}</div>
  },
  Bar: ({ children, dataKey, ...props }: any) => {
    capturedBarProps = { ...props, dataKey }
    return <div data-testid="bar">{children}</div>
  },
  Cell: ({ fill }: { fill: string }) => <div data-testid="bar-cell" data-fill={fill} />,
  XAxis: (props: any) => <div data-testid="x-axis" data-type={props.type} />,
  YAxis: (props: any) => {
    capturedYAxisProps = props
    return <div data-testid="y-axis" data-type={props.type} />
  },
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: ({ content }: any) => {
    // Call content to test tooltip rendering
    if (content) {
      const result = content({ payload: [{ payload: { id: 'test' } }] })
      return <div data-testid="tooltip">{result}</div>
    }
    return <div data-testid="tooltip" />
  },
  LabelList: ({ formatter }: any) => {
    // Test formatter
    const result = formatter ? formatter(1000) : null
    return <div data-testid="label-list" data-formatted-value={result} />
  },
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

// Mock utils
vi.mock('../../utils', () => ({
  yValueFormatter: (value: number, unit: string) => `${value} ${unit}`,
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
    chartType: 'bar-aggr',
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

describe('AggregatedBarChart', () => {
  const mockOnAnnotationPositionChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    capturedBarChartProps = null
    capturedBarProps = null
    capturedYAxisProps = null
  })

  describe('multi-unit warning', () => {
    it('shows warning when multiple units are present', () => {
      const multiUnitMap = new Map([
        ['dp-1', 'RON'],
        ['dp-2', 'EUR'],
      ])

      render(
        <AggregatedBarChart
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
        <AggregatedBarChart
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
        <AggregatedBarChart
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
  })

  describe('chart rendering', () => {
    it('renders ResponsiveContainer with correct height', () => {
      render(
        <AggregatedBarChart
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

    it('renders BarChart with vertical layout', () => {
      render(
        <AggregatedBarChart
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={[createMockDataPoint()]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-layout', 'vertical')
    })

    it('sets correct margins', () => {
      render(
        <AggregatedBarChart
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={[createMockDataPoint()]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(capturedBarChartProps.margin).toEqual({ top: 50, right: 40, left: 40, bottom: 20 })
    })

    it('renders CartesianGrid', () => {
      render(
        <AggregatedBarChart
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={[createMockDataPoint()]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(screen.getByTestId('grid')).toBeInTheDocument()
    })
  })

  describe('axes configuration', () => {
    it('sets XAxis type to number', () => {
      render(
        <AggregatedBarChart
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={[createMockDataPoint()]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(screen.getByTestId('x-axis')).toHaveAttribute('data-type', 'number')
    })

    it('sets YAxis type to category', () => {
      render(
        <AggregatedBarChart
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={[createMockDataPoint()]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(screen.getByTestId('y-axis')).toHaveAttribute('data-type', 'category')
    })

    it('sets YAxis dataKey to series.label', () => {
      render(
        <AggregatedBarChart
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={[createMockDataPoint()]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(capturedYAxisProps.dataKey).toBe('series.label')
    })

    it('sets YAxis width to 120', () => {
      render(
        <AggregatedBarChart
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={[createMockDataPoint()]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(capturedYAxisProps.width).toBe(120)
    })
  })

  describe('tooltip', () => {
    it('renders Tooltip when showTooltip is true', () => {
      render(
        <AggregatedBarChart
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
        <AggregatedBarChart
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

  describe('bar cells', () => {
    it('renders Cell for each data point', () => {
      const data = [
        createMockDataPoint({ id: 'dp-1', series: createMockSeries({ config: { color: '#ff0000', showDataLabels: false } }) }),
        createMockDataPoint({ id: 'dp-2', series: createMockSeries({ config: { color: '#00ff00', showDataLabels: false } }) }),
      ]

      render(
        <AggregatedBarChart
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={data}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      const cells = screen.getAllByTestId('bar-cell')
      expect(cells).toHaveLength(2)
    })

    it('uses series color for Cell fill', () => {
      const data = [
        createMockDataPoint({ series: createMockSeries({ config: { color: '#ff00ff', showDataLabels: false } }) }),
      ]

      render(
        <AggregatedBarChart
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={data}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(screen.getByTestId('bar-cell')).toHaveAttribute('data-fill', '#ff00ff')
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
        <AggregatedBarChart
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
        <AggregatedBarChart
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

    it('does not render annotations when showAnnotations is false', () => {
      const chart = createMockChart({
        config: { ...createMockChart().config, showAnnotations: false },
        annotations: [
          { id: 'ann-1', type: 'annotation', enabled: true, pX: 0.5, pY: 0.5, pXDelta: 0, pYDelta: 0, color: '#000', title: 'Test', locked: false, connector: true, subject: true, label: true },
        ],
      })

      render(
        <AggregatedBarChart
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

  describe('bar data key', () => {
    it('sets Bar dataKey to value', () => {
      render(
        <AggregatedBarChart
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={[createMockDataPoint()]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(capturedBarProps.dataKey).toBe('value')
    })
  })

  describe('label list', () => {
    it('renders LabelList', () => {
      render(
        <AggregatedBarChart
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={[createMockDataPoint()]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={400}
          {...defaultProps}
        />
      )

      expect(screen.getByTestId('label-list')).toBeInTheDocument()
    })
  })
})
