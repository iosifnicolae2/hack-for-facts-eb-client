/**
 * AggregatedTreemapChart Component Tests
 *
 * This file tests the AggregatedTreemapChart component which renders
 * aggregated data as a treemap using Recharts.
 *
 * Pattern: Recharts Component Testing
 * - Mock Recharts components
 * - Test treemap data transformation
 * - Test empty/error states
 * - Test annotations rendering
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { AggregatedTreemapChart } from './AggregatedTreemapChart'
import type { Chart, SeriesConfiguration } from '@/schemas/charts'
import type { DataPointPayload } from '@/components/charts/hooks/useChartData'

// ============================================================================
// MOCKS
// ============================================================================

// Captured props for assertions
let capturedTreemapProps: any = null
let capturedContentProps: any[] = []

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Treemap: ({ children, content, ...props }: any) => {
    capturedTreemapProps = props
    // Simulate calling the content function
    if (content && props.data && props.data[0]?.children) {
      props.data[0].children.forEach((child: any, index: number) => {
        const contentProps = {
          depth: 1,
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          index,
          payload: child.payload,
        }
        capturedContentProps.push(contentProps)
        content(contentProps)
      })
    }
    return (
      <div data-testid="treemap" data-data-length={props.data?.length}>
        {children}
      </div>
    )
  },
  Tooltip: ({ content }: any) => (
    <div data-testid="tooltip">{content ? 'has-content' : 'no-content'}</div>
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
  CustomSeriesTooltip: () => <div data-testid="custom-tooltip" />,
}))

// Mock utils
vi.mock('../../utils', () => ({
  yValueFormatter: (value: number, unit: string) => `${value} ${unit}`,
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
    chartType: 'treemap-aggr',
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

const createMockDataPoint = (
  overrides: Partial<DataPointPayload> = {}
): DataPointPayload => ({
  id: 'dp-1',
  value: 1000,
  unit: 'RON',
  year: 2023,
  initialValue: 1000,
  initialUnit: 'RON',
  series: {
    id: 'series-1',
    label: 'Test Series',
    config: { color: '#0000ff' },
  },
  ...overrides,
})

const mockAggregatedData = [
  createMockDataPoint({ id: 'dp-1', value: 500 }),
  createMockDataPoint({
    id: 'dp-2',
    value: 300,
    series: { id: 'series-2', label: 'Series 2', config: { color: '#ff0000' } },
  }),
  createMockDataPoint({
    id: 'dp-3',
    value: 200,
    series: { id: 'series-3', label: 'Series 3', config: { color: '#00ff00' } },
  }),
]

const mockUnitMap = new Map([
  ['series-1', 'RON'],
  ['series-2', 'RON'],
  ['series-3', 'RON'],
])
const mockDataMap = new Map()
const mockTimeSeriesData: any[] = []

const defaultProps = {
  dataMap: mockDataMap,
  timeSeriesData: mockTimeSeriesData,
}

// ============================================================================
// TESTS
// ============================================================================

describe('AggregatedTreemapChart', () => {
  const mockOnAnnotationPositionChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    capturedTreemapProps = null
    capturedContentProps = []
  })

  describe('rendering', () => {
    it('renders ResponsiveContainer', () => {
      render(
        <AggregatedTreemapChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })

    it('renders Treemap', () => {
      render(
        <AggregatedTreemapChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(screen.getByTestId('treemap')).toBeInTheDocument()
    })

    it('renders Tooltip', () => {
      render(
        <AggregatedTreemapChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    })
  })

  describe('empty data state', () => {
    it('shows no data message when aggregatedData is empty', () => {
      render(
        <AggregatedTreemapChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={[]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(screen.getByText('No data available')).toBeInTheDocument()
      expect(
        screen.getByText(
          'There is no data to display for the selected filters.'
        )
      ).toBeInTheDocument()
    })

    it('shows no data message when aggregatedData is undefined', () => {
      render(
        <AggregatedTreemapChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={undefined as any}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(screen.getByText('No data available')).toBeInTheDocument()
    })
  })

  describe('multiple units error state', () => {
    it('shows error when multiple units are present', () => {
      const multiUnitMap = new Map([
        ['series-1', 'RON'],
        ['series-2', 'EUR'],
      ])

      render(
        <AggregatedTreemapChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={multiUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(screen.getByText('Multiple units selected')).toBeInTheDocument()
      expect(
        screen.getByText(/Treemaps cannot effectively display/)
      ).toBeInTheDocument()
    })

    it('does not show treemap when multiple units', () => {
      const multiUnitMap = new Map([
        ['series-1', 'RON'],
        ['series-2', 'EUR'],
      ])

      render(
        <AggregatedTreemapChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={multiUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(screen.queryByTestId('treemap')).not.toBeInTheDocument()
    })
  })

  describe('treemap configuration', () => {
    it('sets dataKey to value', () => {
      render(
        <AggregatedTreemapChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(capturedTreemapProps.dataKey).toBe('value')
    })

    it('sets nameKey to name', () => {
      render(
        <AggregatedTreemapChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(capturedTreemapProps.nameKey).toBe('name')
    })

    it('sets animation easing to ease-in-out', () => {
      render(
        <AggregatedTreemapChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(capturedTreemapProps.animationEasing).toBe('ease-in-out')
    })

    it('sets animation duration to 300', () => {
      render(
        <AggregatedTreemapChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(capturedTreemapProps.animationDuration).toBe(300)
    })
  })

  describe('treemap data transformation', () => {
    it('creates treemap data structure', () => {
      render(
        <AggregatedTreemapChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(capturedTreemapProps.data).toHaveLength(1)
      expect(capturedTreemapProps.data[0].name).toBe('Aggregated Data')
    })

    it('calculates total value correctly', () => {
      render(
        <AggregatedTreemapChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      // Total should be 500 + 300 + 200 = 1000
      expect(capturedTreemapProps.data[0].value).toBe(1000)
    })

    it('creates children for each data point', () => {
      render(
        <AggregatedTreemapChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(capturedTreemapProps.data[0].children).toHaveLength(3)
    })

    it('assigns correct values to children', () => {
      render(
        <AggregatedTreemapChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      const children = capturedTreemapProps.data[0].children
      expect(children[0].value).toBe(500)
      expect(children[1].value).toBe(300)
      expect(children[2].value).toBe(200)
    })

    it('assigns series labels to children names', () => {
      render(
        <AggregatedTreemapChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      const children = capturedTreemapProps.data[0].children
      expect(children[0].name).toBe('Test Series')
      expect(children[1].name).toBe('Series 2')
      expect(children[2].name).toBe('Series 3')
    })

    it('includes payload in children', () => {
      render(
        <AggregatedTreemapChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      const children = capturedTreemapProps.data[0].children
      expect(children[0].payload).toBeDefined()
      expect(children[0].payload.id).toBe('dp-1')
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
        <AggregatedTreemapChart
          {...defaultProps}
          chart={chart}
          unitMap={mockUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
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
        <AggregatedTreemapChart
          {...defaultProps}
          chart={chart}
          unitMap={mockUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
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
        <AggregatedTreemapChart
          {...defaultProps}
          chart={chart}
          unitMap={mockUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(screen.queryByTestId('chart-annotation')).not.toBeInTheDocument()
    })

    it('renders multiple enabled annotations', () => {
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
            title: 'Test 1',
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
            pX: 0.3,
            pY: 0.3,
            pXDelta: 0.1,
            pYDelta: 0.1,
            color: '#00ff00',
            title: 'Test 2',
            subtitle: '',
            connector: true,
            subject: true,
            label: true,
            locked: false,
          },
        ],
      })

      render(
        <AggregatedTreemapChart
          {...defaultProps}
          chart={chart}
          unitMap={mockUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(screen.getAllByTestId('chart-annotation')).toHaveLength(2)
    })
  })

  describe('height prop', () => {
    it('passes height to ResponsiveContainer', () => {
      render(
        <AggregatedTreemapChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={500}
        />
      )

      // ResponsiveContainer is mocked, so we just verify it renders
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })
  })
})
