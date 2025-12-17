import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { ChartRenderer } from './ChartRenderer'
import { Chart } from '@/schemas/charts'
import { DataPointPayload, DataSeriesMap, Unit } from '@/components/charts/hooks/useChartData'

// Mocks
vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@lingui/core/macro', () => ({
  t: (strings: TemplateStringsArray) => strings[0],
}))

// Mock Sub-Components
vi.mock('./TimeSeriesLineChart', () => ({
  TimeSeriesLineChart: () => <div data-testid="time-series-line-chart" />
}))

vi.mock('./TimeSeriesBarChart', () => ({
  TimeSeriesBarChart: () => <div data-testid="time-series-bar-chart" />
}))

vi.mock('./TimeSeriesAreaChart', () => ({
  TimeSeriesAreaChart: () => <div data-testid="time-series-area-chart" />
}))

vi.mock('./aggregated-charts/AggregatedBarChart', () => ({
  AggregatedBarChart: () => <div data-testid="aggregated-bar-chart" />
}))

vi.mock('./aggregated-charts/AggregatedPieChart', () => ({
  AggregatedPieChart: () => <div data-testid="aggregated-pie-chart" />
}))

vi.mock('./aggregated-charts/AggregatedTreemapChart', () => ({
  AggregatedTreemapChart: () => <div data-testid="aggregated-treemap-chart" />
}))

vi.mock('./aggregated-charts/AggregatedSankeyChart', () => ({
  AggregatedSankeyChart: () => <div data-testid="aggregated-sankey-chart" />
}))

// Test Data
const mockChartBase: Chart = {
  id: '123',
  title: 'Test Chart',
  config: {
    chartType: 'line',
    color: '#000',
    showGridLines: true,
    showLegend: true,
    showTooltip: true,
    editAnnotations: false,
    showAnnotations: false,
  },
  series: [
    { id: 's1', type: 'line-items-aggregated-yearly', enabled: true, label: 'S1', filter: {}, config: {} } as any
  ],
  annotations: [],
  createdAt: '',
  updatedAt: ''
}

const mockDataMap: DataSeriesMap = new Map()
const mockUnitMap: Map<string, Unit> = new Map()
const mockTimeSeriesData: any[] = []
const mockAggregatedData: DataPointPayload[] = []

describe('ChartRenderer', () => {
  const onAnnotationPositionChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders "No enabled series" message when all series are disabled', () => {
    const chart = { ...mockChartBase, series: [{ ...mockChartBase.series[0], enabled: false }] as any }
    render(
      <ChartRenderer
        chart={chart}
        dataMap={mockDataMap}
        unitMap={mockUnitMap}
        timeSeriesData={mockTimeSeriesData}
        aggregatedData={mockAggregatedData}
        onAnnotationPositionChange={onAnnotationPositionChange}
      />
    )
    expect(screen.getByText('No enabled series data available to display.')).toBeInTheDocument()
  })

  it('renders "Unsupported chart type" message for invalid type', () => {
    const chart = { ...mockChartBase, config: { ...mockChartBase.config, chartType: 'invalid' as any } }
    render(
      <ChartRenderer
        chart={chart}
        dataMap={mockDataMap}
        unitMap={mockUnitMap}
        timeSeriesData={mockTimeSeriesData}
        aggregatedData={mockAggregatedData}
        onAnnotationPositionChange={onAnnotationPositionChange}
      />
    )
    expect(screen.getByText('Unsupported chart type: invalid')).toBeInTheDocument()
  })

  it('renders TimeSeriesLineChart for line chart type', () => {
    const chart = { ...mockChartBase, config: { ...mockChartBase.config, chartType: 'line' as any } }
    render(
      <ChartRenderer
        chart={chart}
        dataMap={mockDataMap}
        unitMap={mockUnitMap}
        timeSeriesData={mockTimeSeriesData}
        aggregatedData={mockAggregatedData}
        onAnnotationPositionChange={onAnnotationPositionChange}
      />
    )
    expect(screen.getByTestId('time-series-line-chart')).toBeInTheDocument()
  })

  it('renders TimeSeriesBarChart for bar chart type', () => {
    const chart = { ...mockChartBase, config: { ...mockChartBase.config, chartType: 'bar' as any } }
    render(
      <ChartRenderer
        chart={chart}
        dataMap={mockDataMap}
        unitMap={mockUnitMap}
        timeSeriesData={mockTimeSeriesData}
        aggregatedData={mockAggregatedData}
        onAnnotationPositionChange={onAnnotationPositionChange}
      />
    )
    expect(screen.getByTestId('time-series-bar-chart')).toBeInTheDocument()
  })

  it('renders TimeSeriesAreaChart for area chart type', () => {
    const chart = { ...mockChartBase, config: { ...mockChartBase.config, chartType: 'area' as any } }
    render(
      <ChartRenderer
        chart={chart}
        dataMap={mockDataMap}
        unitMap={mockUnitMap}
        timeSeriesData={mockTimeSeriesData}
        aggregatedData={mockAggregatedData}
        onAnnotationPositionChange={onAnnotationPositionChange}
      />
    )
    expect(screen.getByTestId('time-series-area-chart')).toBeInTheDocument()
  })

  it('renders AggregatedBarChart for bar-aggr chart type', () => {
    const chart = { ...mockChartBase, config: { ...mockChartBase.config, chartType: 'bar-aggr' as any } }
    render(
      <ChartRenderer
        chart={chart}
        dataMap={mockDataMap}
        unitMap={mockUnitMap}
        timeSeriesData={mockTimeSeriesData}
        aggregatedData={mockAggregatedData}
        onAnnotationPositionChange={onAnnotationPositionChange}
      />
    )
    expect(screen.getByTestId('aggregated-bar-chart')).toBeInTheDocument()
  })

  it('renders AggregatedPieChart for pie-aggr chart type', () => {
    const chart = { ...mockChartBase, config: { ...mockChartBase.config, chartType: 'pie-aggr' as any } }
    render(
      <ChartRenderer
        chart={chart}
        dataMap={mockDataMap}
        unitMap={mockUnitMap}
        timeSeriesData={mockTimeSeriesData}
        aggregatedData={mockAggregatedData}
        onAnnotationPositionChange={onAnnotationPositionChange}
      />
    )
    expect(screen.getByTestId('aggregated-pie-chart')).toBeInTheDocument()
  })

  it('renders AggregatedTreemapChart for treemap-aggr chart type', () => {
    const chart = { ...mockChartBase, config: { ...mockChartBase.config, chartType: 'treemap-aggr' as any } }
    render(
      <ChartRenderer
        chart={chart}
        dataMap={mockDataMap}
        unitMap={mockUnitMap}
        timeSeriesData={mockTimeSeriesData}
        aggregatedData={mockAggregatedData}
        onAnnotationPositionChange={onAnnotationPositionChange}
      />
    )
    expect(screen.getByTestId('aggregated-treemap-chart')).toBeInTheDocument()
  })

  it('renders AggregatedSankeyChart for sankey-aggr chart type', () => {
    const chart = { ...mockChartBase, config: { ...mockChartBase.config, chartType: 'sankey-aggr' as any } }
    render(
      <ChartRenderer
        chart={chart}
        dataMap={mockDataMap}
        unitMap={mockUnitMap}
        timeSeriesData={mockTimeSeriesData}
        aggregatedData={mockAggregatedData}
        onAnnotationPositionChange={onAnnotationPositionChange}
      />
    )
    expect(screen.getByTestId('aggregated-sankey-chart')).toBeInTheDocument()
  })
})
