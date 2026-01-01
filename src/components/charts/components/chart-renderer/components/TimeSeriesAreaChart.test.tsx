/**
 * TimeSeriesAreaChart Component Tests
 *
 * This file tests the TimeSeriesAreaChart component which renders
 * time-series data as area charts using Recharts.
 *
 * Pattern: Recharts Component Testing
 * - Mock Recharts components
 * - Mock chart hooks
 * - Test series rendering
 * - Test fill opacity
 * - Test diff selection
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { TimeSeriesAreaChart } from './TimeSeriesAreaChart'
import type { Chart, SeriesConfiguration } from '@/schemas/charts'

// ============================================================================
// MOCKS
// ============================================================================

// Captured props for assertions
let capturedAreaChartProps: any = null
let capturedAreaProps: any[] = []

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children, onMouseDown, onMouseMove, onMouseUp, onMouseLeave, ...props }: any) => {
    capturedAreaChartProps = { ...props, onMouseDown, onMouseMove, onMouseUp, onMouseLeave }
    return (
      <div data-testid="area-chart">
        {typeof children === 'function' ? children((id: string) => `y-axis-${id}`) : children}
      </div>
    )
  },
  Area: ({ children, ...props }: any) => {
    capturedAreaProps.push(props)
    return <div data-testid="area" data-series-id={props.name}>{children}</div>
  },
  LabelList: ({ content }: any) => {
    if (content) {
      const result = content({ value: { value: 100, year: '2023', unit: 'RON' }, x: 0, y: 0 })
      return result ? <div data-testid="label-list">{result}</div> : null
    }
    return <div data-testid="label-list" />
  },
}))

// Mock MultiAxisChartContainer - unused chart param intentionally ignored
vi.mock('./MultiAxisChartContainer', () => ({
  MultiAxisChartContainer: ({ children, disableTooltip }: any) => (
    <div data-testid="multi-axis-container" data-disable-tooltip={disableTooltip}>
      {children((id: string) => `y-axis-${id}`)}
    </div>
  ),
}))

// Mock ChartLabel
vi.mock('./ChartLabel', () => ({
  ChartLabel: (props: any) => <text data-testid="chart-label" data-value={props.value} />,
}))

// Mock DiffArea
vi.mock('./diff-select/DiffArea', () => ({
  DiffArea: ({ refAreaLeft, refAreaRight, diffs }: any) => (
    <div data-testid="diff-area" data-left={refAreaLeft} data-right={refAreaRight} data-diffs={diffs.length} />
  ),
}))

// Mock utils
vi.mock('../utils', () => ({
  yValueFormatter: (value: number, unit: string) => `${value} ${unit}`,
}))

// Mock hooks
const mockDiffState = {
  handleMouseDown: vi.fn(),
  handleMouseMove: vi.fn(),
  handleMouseUp: vi.fn(),
  handleMouseLeave: vi.fn(),
  refAreaLeft: null as string | number | null,
  refAreaRight: null as string | number | null,
  diffs: [] as any[],
}

vi.mock('../hooks/useChartDiff', () => ({
  useChartDiff: () => mockDiffState,
}))

vi.mock('../hooks/useChartAnimation', () => ({
  useChartAnimation: () => ({ isAnimationActive: true, animationDuration: 600 }),
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
    chartType: 'area',
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

const mockTimeSeriesData: any[] = [
  { year: 2021, 'series-1': { id: 'dp-1', value: 100, unit: 'RON', year: 2021 } },
  { year: 2022, 'series-1': { id: 'dp-2', value: 150, unit: 'RON', year: 2022 } },
  { year: 2023, 'series-1': { id: 'dp-3', value: 200, unit: 'RON', year: 2023 } },
]

const mockUnitMap = new Map([['series-1', 'RON']])
const mockDataMap = new Map()
const mockAggregatedData: any[] = []

const defaultProps = {
  dataMap: mockDataMap,
  aggregatedData: mockAggregatedData,
}

// ============================================================================
// TESTS
// ============================================================================

describe('TimeSeriesAreaChart', () => {
  const mockOnAnnotationPositionChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    capturedAreaChartProps = null
    capturedAreaProps = []
    mockDiffState.refAreaLeft = null
    mockDiffState.refAreaRight = null
    mockDiffState.diffs = []
  })

  describe('rendering', () => {
    it('renders ResponsiveContainer', () => {
      render(
        <TimeSeriesAreaChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          timeSeriesData={mockTimeSeriesData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })

    it('renders AreaChart', () => {
      render(
        <TimeSeriesAreaChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          timeSeriesData={mockTimeSeriesData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    })

    it('renders MultiAxisChartContainer', () => {
      render(
        <TimeSeriesAreaChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          timeSeriesData={mockTimeSeriesData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(screen.getByTestId('multi-axis-container')).toBeInTheDocument()
    })
  })

  describe('series rendering', () => {
    it('renders Area for each enabled series', () => {
      const chart = createMockChart({
        series: [
          createMockSeries({ id: 's1', label: 'Series 1', enabled: true }),
          createMockSeries({ id: 's2', label: 'Series 2', enabled: true }),
        ],
      })

      render(
        <TimeSeriesAreaChart
          {...defaultProps}
          chart={chart}
          unitMap={mockUnitMap}
          timeSeriesData={mockTimeSeriesData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(screen.getAllByTestId('area')).toHaveLength(2)
    })

    it('does not render Area for disabled series', () => {
      const chart = createMockChart({
        series: [
          createMockSeries({ id: 's1', label: 'Series 1', enabled: true }),
          createMockSeries({ id: 's2', label: 'Series 2', enabled: false }),
        ],
      })

      render(
        <TimeSeriesAreaChart
          {...defaultProps}
          chart={chart}
          unitMap={mockUnitMap}
          timeSeriesData={mockTimeSeriesData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(screen.getAllByTestId('area')).toHaveLength(1)
    })

    it('uses series color for stroke', () => {
      const chart = createMockChart({
        series: [createMockSeries({ config: { color: '#ff0000', showDataLabels: false } })],
      })

      render(
        <TimeSeriesAreaChart
          {...defaultProps}
          chart={chart}
          unitMap={mockUnitMap}
          timeSeriesData={mockTimeSeriesData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(capturedAreaProps[0].stroke).toBe('#ff0000')
    })

    it('uses series color for fill', () => {
      const chart = createMockChart({
        series: [createMockSeries({ config: { color: '#00ff00', showDataLabels: false } })],
      })

      render(
        <TimeSeriesAreaChart
          {...defaultProps}
          chart={chart}
          unitMap={mockUnitMap}
          timeSeriesData={mockTimeSeriesData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(capturedAreaProps[0].fill).toBe('#00ff00')
    })

    it('sets fill opacity to 0.6', () => {
      render(
        <TimeSeriesAreaChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          timeSeriesData={mockTimeSeriesData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(capturedAreaProps[0].fillOpacity).toBe(0.6)
    })

    it('uses series label for area name', () => {
      const chart = createMockChart({
        series: [createMockSeries({ label: 'My Area Series' })],
      })

      render(
        <TimeSeriesAreaChart
          {...defaultProps}
          chart={chart}
          unitMap={mockUnitMap}
          timeSeriesData={mockTimeSeriesData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(capturedAreaProps[0].name).toBe('My Area Series')
    })

    it('uses Untitled when no label', () => {
      const chart = createMockChart({
        series: [createMockSeries({ label: '' })],
      })

      render(
        <TimeSeriesAreaChart
          {...defaultProps}
          chart={chart}
          unitMap={mockUnitMap}
          timeSeriesData={mockTimeSeriesData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(capturedAreaProps[0].name).toBe('Untitled')
    })
  })

  describe('margins', () => {
    it('uses default margins', () => {
      render(
        <TimeSeriesAreaChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          timeSeriesData={mockTimeSeriesData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(capturedAreaChartProps.margin).toEqual({ top: 30, right: 50, left: 50, bottom: 20 })
    })

    it('overrides margins when provided', () => {
      render(
        <TimeSeriesAreaChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          timeSeriesData={mockTimeSeriesData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          margins={{ top: 100 }}
        />
      )

      expect(capturedAreaChartProps.margin.top).toBe(100)
    })
  })

  describe('diff area', () => {
    it('renders DiffArea when diff is enabled', () => {
      mockDiffState.refAreaLeft = '2021'
      mockDiffState.refAreaRight = '2023'
      mockDiffState.diffs = [{ id: 'diff-1' }]

      render(
        <TimeSeriesAreaChart
          {...defaultProps}
          chart={createMockChart({ config: { ...createMockChart().config, showDiffControl: true } })}
          unitMap={mockUnitMap}
          timeSeriesData={mockTimeSeriesData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(screen.getByTestId('diff-area')).toBeInTheDocument()
    })

    it('does not render DiffArea when showDiffControl is false', () => {
      mockDiffState.refAreaLeft = '2021'
      mockDiffState.refAreaRight = '2023'

      render(
        <TimeSeriesAreaChart
          {...defaultProps}
          chart={createMockChart({ config: { ...createMockChart().config, showDiffControl: false } })}
          unitMap={mockUnitMap}
          timeSeriesData={mockTimeSeriesData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(screen.queryByTestId('diff-area')).not.toBeInTheDocument()
    })

    it('disables tooltip when diff is active', () => {
      mockDiffState.refAreaLeft = '2021'
      mockDiffState.refAreaRight = '2023'
      mockDiffState.diffs = [{ id: 'diff-1' }]

      render(
        <TimeSeriesAreaChart
          {...defaultProps}
          chart={createMockChart({ config: { ...createMockChart().config, showDiffControl: true } })}
          unitMap={mockUnitMap}
          timeSeriesData={mockTimeSeriesData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(screen.getByTestId('multi-axis-container')).toHaveAttribute('data-disable-tooltip', 'true')
    })
  })

  describe('area configuration', () => {
    it('sets monotone type', () => {
      render(
        <TimeSeriesAreaChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          timeSeriesData={mockTimeSeriesData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(capturedAreaProps[0].type).toBe('monotone')
    })

    it('sets stroke width to 2', () => {
      render(
        <TimeSeriesAreaChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          timeSeriesData={mockTimeSeriesData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(capturedAreaProps[0].strokeWidth).toBe(2)
    })
  })

  describe('animation', () => {
    it('enables animation', () => {
      render(
        <TimeSeriesAreaChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          timeSeriesData={mockTimeSeriesData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(capturedAreaProps[0].isAnimationActive).toBe(true)
    })

    it('sets animation duration', () => {
      render(
        <TimeSeriesAreaChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          timeSeriesData={mockTimeSeriesData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(capturedAreaProps[0].animationDuration).toBe(600)
    })
  })
})
