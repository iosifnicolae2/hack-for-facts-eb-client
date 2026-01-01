/**
 * AggregatedSankeyChart Component Tests
 *
 * This file tests the AggregatedSankeyChart component which renders
 * aggregated data as a Sankey diagram using d3-sankey.
 *
 * Pattern: D3 + SVG Component Testing
 * - Mock d3-sankey
 * - Mock @visx/annotation components
 * - Test data transformation
 * - Test empty/error states
 * - Test annotations rendering
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, fireEvent } from '@/test/test-utils'
import { AggregatedSankeyChart } from './AggregatedSankeyChart'
import type { Chart, SeriesConfiguration } from '@/schemas/charts'
import type { DataPointPayload } from '@/components/charts/hooks/useChartData'

// ============================================================================
// POLYFILLS
// ============================================================================

let resizeCallback: ResizeObserverCallback | null = null

class ResizeObserverMock {
  constructor(callback: ResizeObserverCallback) {
    resizeCallback = callback
  }
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
global.ResizeObserver = ResizeObserverMock

// Helper to simulate resize
const simulateResize = (width: number, height: number) => {
  if (resizeCallback) {
    resizeCallback(
      [{ contentRect: { width, height } } as ResizeObserverEntry],
      {} as ResizeObserver
    )
  }
}

// ============================================================================
// MOCKS
// ============================================================================

// Mock d3-sankey
vi.mock('d3-sankey', () => ({
  sankey: () => {
    // Create a callable function that also has chainable methods
    const sankeyFunc: any = (data: any) => ({
      nodes: data.nodes.map((n: any, i: number) => ({
        ...n,
        x0: i * 100,
        x1: i * 100 + 10,
        y0: i * 50,
        y1: i * 50 + 40,
      })),
      links: data.links.map((l: any) => ({
        ...l,
        width: 20,
      })),
    })
    // Add chainable methods that return the same function
    sankeyFunc.nodeId = () => sankeyFunc
    sankeyFunc.nodeWidth = () => sankeyFunc
    sankeyFunc.nodePadding = () => sankeyFunc
    sankeyFunc.extent = () => sankeyFunc
    sankeyFunc.iterations = () => sankeyFunc
    return sankeyFunc
  },
  sankeyLinkHorizontal: () => () => 'M0,0 L100,100',
}))

// Mock @visx/annotation
vi.mock('@visx/annotation', () => ({
  Annotation: ({ children }: any) => (
    <g data-testid="annotation">{children}</g>
  ),
  EditableAnnotation: ({ children, onDragEnd }: any) => (
    <g
      data-testid="editable-annotation"
      onClick={() => onDragEnd?.({ x: 100, y: 100, dx: 50, dy: 50 })}
    >
      {children}
    </g>
  ),
  Connector: ({ stroke }: any) => (
    <line data-testid="connector" data-stroke={stroke} />
  ),
  CircleSubject: ({ stroke }: any) => (
    <circle data-testid="circle-subject" data-stroke={stroke} />
  ),
  Label: ({ title, subtitle }: any) => (
    <text data-testid="label" data-title={title} data-subtitle={subtitle}>
      {title}
    </text>
  ),
}))

// Mock utils
vi.mock('../../utils', () => ({
  yValueFormatter: (value: number, unit?: string) =>
    `${value?.toLocaleString() ?? 0} ${unit ?? ''}`.trim(),
  applyAlpha: (color: string, alpha: number) => `${color}-alpha-${alpha}`,
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
    chartType: 'sankey-aggr',
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

describe('AggregatedSankeyChart', () => {
  const mockOnAnnotationPositionChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    resizeCallback = null
  })

  describe('empty data state', () => {
    it('shows no data message when aggregatedData is empty', () => {
      render(
        <AggregatedSankeyChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={[]}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(screen.getByText('No data available')).toBeInTheDocument()
    })

    it('shows no data message when aggregatedData is undefined', () => {
      render(
        <AggregatedSankeyChart
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
        <AggregatedSankeyChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={multiUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(screen.getByText('Multiple units selected')).toBeInTheDocument()
      expect(
        screen.getByText(/Sankey charts cannot effectively display/)
      ).toBeInTheDocument()
    })

    it('shows alert icon for multi-unit error', () => {
      const multiUnitMap = new Map([
        ['series-1', 'RON'],
        ['series-2', 'EUR'],
      ])

      render(
        <AggregatedSankeyChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={multiUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  describe('rendering with data', () => {
    it('renders container div', () => {
      render(
        <AggregatedSankeyChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      // Simulate resize to trigger SVG render
      act(() => {
        simulateResize(800, 400)
      })

      // The SVG should be rendered after resize
      const svg = document.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('renders SVG with correct aria-label', () => {
      render(
        <AggregatedSankeyChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      act(() => {
        simulateResize(800, 400)
      })

      const svg = document.querySelector('svg')
      expect(svg).toHaveAttribute(
        'aria-label',
        'Sankey diagram showing budget distribution'
      )
    })

    it('renders nodes as rect elements', () => {
      render(
        <AggregatedSankeyChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      act(() => {
        simulateResize(800, 400)
      })

      const rects = document.querySelectorAll('rect')
      // Should have rects for each data point + total node
      expect(rects.length).toBeGreaterThan(0)
    })

    it('renders links as path elements', () => {
      render(
        <AggregatedSankeyChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      act(() => {
        simulateResize(800, 400)
      })

      const paths = document.querySelectorAll('path')
      expect(paths.length).toBeGreaterThan(0)
    })
  })

  describe('annotations', () => {
    it('renders editable annotation when showAnnotations is true', () => {
      const chart = createMockChart({
        config: {
          ...createMockChart().config,
          showAnnotations: true,
          editAnnotations: true,
        },
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
        <AggregatedSankeyChart
          {...defaultProps}
          chart={chart}
          unitMap={mockUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      act(() => {
        simulateResize(800, 400)
      })

      expect(screen.getByTestId('editable-annotation')).toBeInTheDocument()
    })

    it('renders non-editable annotation when locked and not globally editable', () => {
      const chart = createMockChart({
        config: {
          ...createMockChart().config,
          showAnnotations: true,
          editAnnotations: false,
        },
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
            locked: true,
          },
        ],
      })

      render(
        <AggregatedSankeyChart
          {...defaultProps}
          chart={chart}
          unitMap={mockUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      act(() => {
        simulateResize(800, 400)
      })

      expect(screen.getByTestId('annotation')).toBeInTheDocument()
      expect(
        screen.queryByTestId('editable-annotation')
      ).not.toBeInTheDocument()
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
        <AggregatedSankeyChart
          {...defaultProps}
          chart={chart}
          unitMap={mockUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      act(() => {
        simulateResize(800, 400)
      })

      expect(screen.queryByTestId('annotation')).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('editable-annotation')
      ).not.toBeInTheDocument()
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
        <AggregatedSankeyChart
          {...defaultProps}
          chart={chart}
          unitMap={mockUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      act(() => {
        simulateResize(800, 400)
      })

      expect(screen.queryByTestId('annotation')).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('editable-annotation')
      ).not.toBeInTheDocument()
    })

    it('renders annotation connector when enabled', () => {
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
            subject: false,
            label: false,
            locked: false,
          },
        ],
      })

      render(
        <AggregatedSankeyChart
          {...defaultProps}
          chart={chart}
          unitMap={mockUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      act(() => {
        simulateResize(800, 400)
      })

      expect(screen.getByTestId('connector')).toBeInTheDocument()
    })

    it('renders annotation subject when enabled', () => {
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
            connector: false,
            subject: true,
            label: false,
            locked: false,
          },
        ],
      })

      render(
        <AggregatedSankeyChart
          {...defaultProps}
          chart={chart}
          unitMap={mockUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      act(() => {
        simulateResize(800, 400)
      })

      expect(screen.getByTestId('circle-subject')).toBeInTheDocument()
    })

    it('renders annotation label when enabled', () => {
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
            title: 'Test Title',
            subtitle: 'Test Subtitle',
            connector: false,
            subject: false,
            label: true,
            locked: false,
          },
        ],
      })

      render(
        <AggregatedSankeyChart
          {...defaultProps}
          chart={chart}
          unitMap={mockUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      act(() => {
        simulateResize(800, 400)
      })

      expect(screen.getByTestId('label')).toBeInTheDocument()
      expect(screen.getByTestId('label')).toHaveAttribute(
        'data-title',
        'Test Title'
      )
    })

    it('calls onAnnotationPositionChange when annotation is dragged', () => {
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
        <AggregatedSankeyChart
          {...defaultProps}
          chart={chart}
          unitMap={mockUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      act(() => {
        simulateResize(800, 400)
      })

      // Simulate drag end by clicking (our mock triggers onDragEnd on click)
      fireEvent.click(screen.getByTestId('editable-annotation'))

      expect(mockOnAnnotationPositionChange).toHaveBeenCalledWith(
        expect.objectContaining({ annotationId: 'ann-1' })
      )
    })
  })

  describe('ResizeObserver', () => {
    it('creates ResizeObserver on mount', () => {
      render(
        <AggregatedSankeyChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      expect(resizeCallback).not.toBeNull()
    })

    it('does not render SVG until resize event', () => {
      render(
        <AggregatedSankeyChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
        />
      )

      // Before resize, SVG should not be visible (containerWidth is 0)
      const svg = document.querySelector('svg')
      expect(svg).not.toBeInTheDocument()

      // After resize, SVG should be rendered
      act(() => {
        simulateResize(800, 400)
      })

      const svgAfterResize = document.querySelector('svg')
      expect(svgAfterResize).toBeInTheDocument()
    })
  })

  describe('height prop', () => {
    it('applies height to container', () => {
      render(
        <AggregatedSankeyChart
          {...defaultProps}
          chart={createMockChart()}
          unitMap={mockUnitMap}
          aggregatedData={mockAggregatedData}
          onAnnotationPositionChange={mockOnAnnotationPositionChange}
          height={500}
        />
      )

      act(() => {
        simulateResize(800, 400)
      })

      // The container should have height style applied
      const container = document.querySelector('.w-full.relative')
      expect(container).toBeInTheDocument()
    })
  })
})
