/**
 * TimeSeriesBarChart Component Tests
 *
 * This file tests the TimeSeriesBarChart component which renders
 * time-series data as bar charts using Recharts.
 *
 * Pattern: Recharts Component Testing
 * - Mock Recharts components
 * - Mock chart hooks
 * - Test series rendering
 * - Test bar configuration
 * - Test diff selection
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { TimeSeriesBarChart } from './TimeSeriesBarChart'
import type { Chart, SeriesConfiguration } from '@/schemas/charts'

// ============================================================================
// MOCKS
// ============================================================================

// Captured props for assertions
let capturedBarChartProps: any = null
let capturedBarProps: any[] = []

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children, onMouseDown, onMouseMove, onMouseUp, onMouseLeave, ...props }: any) => {
    capturedBarChartProps = { ...props, onMouseDown, onMouseMove, onMouseUp, onMouseLeave }
    return (
      <div data-testid="bar-chart">
        {typeof children === 'function' ? children((id: string) => `y-axis-${id}`) : children}
      </div>
    )
  },
  Bar: ({ children, ...props }: any) => {
    capturedBarProps.push(props)
    return <div data-testid="bar" data-series-id={props.name}>{children}</div>
  },
  LabelList: ({ content }: any) => {
    if (content) {
      const result = content({ value: { value: 100, year: '2023', unit: 'RON' }, x: 0, y: 0 })
      return result ? <div data-testid="label-list">{result}</div> : null
    }
    return <div data-testid="label-list" />
  },
}))

// Mock MultiAxisChartContainer - chart param intentionally ignored
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
    chartType: 'bar',
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

describe('TimeSeriesBarChart', () => {
  const mockOnAnnotationPositionChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    capturedBarChartProps = null
    capturedBarProps = []
    mockDiffState.refAreaLeft = null
    mockDiffState.refAreaRight = null
    mockDiffState.diffs = []
  })

  describe('rendering', () => {
    it('renders ResponsiveContainer', () => {
      render(
        <TimeSeriesBarChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          timeSeriesData={mockTimeSeriesData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })

    it('renders BarChart', () => {
      render(
        <TimeSeriesBarChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          timeSeriesData={mockTimeSeriesData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    })

    it('renders MultiAxisChartContainer', () => {
      render(
        <TimeSeriesBarChart
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
    it('renders Bar for each enabled series', () => {
      const chart = createMockChart({
        series: [
          createMockSeries({ id: 's1', label: 'Series 1', enabled: true }),
          createMockSeries({ id: 's2', label: 'Series 2', enabled: true }),
        ],
      })

      render(
        <TimeSeriesBarChart
          {...defaultProps}
          chart={chart}
          unitMap={mockUnitMap}
          timeSeriesData={mockTimeSeriesData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(screen.getAllByTestId('bar')).toHaveLength(2)
    })

    it('does not render Bar for disabled series', () => {
      const chart = createMockChart({
        series: [
          createMockSeries({ id: 's1', label: 'Series 1', enabled: true }),
          createMockSeries({ id: 's2', label: 'Series 2', enabled: false }),
        ],
      })

      render(
        <TimeSeriesBarChart
          {...defaultProps}
          chart={chart}
          unitMap={mockUnitMap}
          timeSeriesData={mockTimeSeriesData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(screen.getAllByTestId('bar')).toHaveLength(1)
    })

    it('uses series color for fill', () => {
      const chart = createMockChart({
        series: [createMockSeries({ config: { color: '#ff0000', showDataLabels: false } })],
      })

      render(
        <TimeSeriesBarChart
          {...defaultProps}
          chart={chart}
          unitMap={mockUnitMap}
          timeSeriesData={mockTimeSeriesData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(capturedBarProps[0].fill).toBe('#ff0000')
    })

    it('uses series label for bar name', () => {
      const chart = createMockChart({
        series: [createMockSeries({ label: 'My Bar Series' })],
      })

      render(
        <TimeSeriesBarChart
          {...defaultProps}
          chart={chart}
          unitMap={mockUnitMap}
          timeSeriesData={mockTimeSeriesData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(capturedBarProps[0].name).toBe('My Bar Series')
    })

    it('uses Untitled when no label', () => {
      const chart = createMockChart({
        series: [createMockSeries({ label: '' })],
      })

      render(
        <TimeSeriesBarChart
          {...defaultProps}
          chart={chart}
          unitMap={mockUnitMap}
          timeSeriesData={mockTimeSeriesData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(capturedBarProps[0].name).toBe('Untitled')
    })
  })

  describe('margins', () => {
    it('uses default margins', () => {
      render(
        <TimeSeriesBarChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          timeSeriesData={mockTimeSeriesData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(capturedBarChartProps.margin).toEqual({ top: 30, right: 50, left: 50, bottom: 20 })
    })

    it('overrides margins when provided', () => {
      render(
        <TimeSeriesBarChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          timeSeriesData={mockTimeSeriesData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          margins={{ top: 100 }}
        />
      )

      expect(capturedBarChartProps.margin.top).toBe(100)
    })
  })

  describe('diff area', () => {
    it('renders DiffArea when diff is enabled', () => {
      mockDiffState.refAreaLeft = '2021'
      mockDiffState.refAreaRight = '2023'
      mockDiffState.diffs = [{ id: 'diff-1' }]

      render(
        <TimeSeriesBarChart
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
        <TimeSeriesBarChart
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
        <TimeSeriesBarChart
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

  describe('animation', () => {
    it('enables animation', () => {
      render(
        <TimeSeriesBarChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          timeSeriesData={mockTimeSeriesData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(capturedBarProps[0].isAnimationActive).toBe(true)
    })

    it('sets animation duration', () => {
      render(
        <TimeSeriesBarChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          timeSeriesData={mockTimeSeriesData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(capturedBarProps[0].animationDuration).toBe(600)
    })

    it('sets animation easing', () => {
      render(
        <TimeSeriesBarChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          timeSeriesData={mockTimeSeriesData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(capturedBarProps[0].animationEasing).toBe('ease-in-out')
    })
  })
})
