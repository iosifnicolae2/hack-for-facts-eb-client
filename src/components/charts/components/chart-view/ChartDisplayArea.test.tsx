import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { ChartDisplayArea } from './ChartDisplayArea'
import { Chart } from '@/schemas/charts'

// Mocks
vi.mock('@/components/ui/LoadingSpinner', () => ({
  LoadingSpinner: ({ text }: { text: string }) => <div data-testid="loading-spinner">{text}</div>
}))

vi.mock('../chart-renderer/components/ChartRenderer', () => ({
  ChartRenderer: () => <div data-testid="chart-renderer" />
}))

vi.mock('../chart-renderer/components/ChartTitle', () => ({
  ChartTitle: ({ title }: { title: string }) => <h1>{title}</h1>
}))

vi.mock('../../utils', () => ({
  getChartTypeIcon: () => <span data-testid="chart-icon" />
}))

// Mock Lingui
vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@lingui/core/macro', () => ({
  t: (strings: TemplateStringsArray) => strings[0],
  msg: (strings: TemplateStringsArray) => strings[0],
}))

// Data
const mockChart: Chart = {
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
  series: [{ id: 's1', type: 'line-items-aggregated-yearly', enabled: true, label: 'S1', filter: {}, config: {} } as any],
  annotations: [],
  createdAt: '',
  updatedAt: ''
}

describe('ChartDisplayArea', () => {
  const onAddSeries = vi.fn()
  const onAnnotationPositionChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state', () => {
    render(
      <ChartDisplayArea
        chart={mockChart}
        timeSeriesData={[]}
        aggregatedData={[]}
        dataMap={new Map()}
        unitMap={new Map()}
        isLoading={true}
        error={null}
        onAddSeries={onAddSeries}
        onAnnotationPositionChange={onAnnotationPositionChange}
      />
    )
    expect(screen.getByTestId('loading-spinner')).toHaveTextContent('Loading chart data...')
  })

  it('renders error state', () => {
    const error = new Error('Failed to fetch')
    render(
      <ChartDisplayArea
        chart={mockChart}
        timeSeriesData={[]}
        aggregatedData={[]}
        dataMap={new Map()}
        unitMap={new Map()}
        isLoading={false}
        error={error}
        onAddSeries={onAddSeries}
        onAnnotationPositionChange={onAnnotationPositionChange}
      />
    )
    expect(screen.getByText('Error Loading Chart Data')).toBeInTheDocument()
    expect(screen.getByText('Failed to fetch')).toBeInTheDocument()
  })

  it('renders no data series state', () => {
    const emptyChart = { ...mockChart, series: [] }
    render(
      <ChartDisplayArea
        chart={emptyChart}
        timeSeriesData={[]}
        aggregatedData={[]}
        dataMap={new Map()}
        unitMap={new Map()}
        isLoading={false}
        error={null}
        onAddSeries={onAddSeries}
        onAnnotationPositionChange={onAnnotationPositionChange}
      />
    )
    expect(screen.getByText('No Data Series')).toBeInTheDocument()
    expect(screen.getByText('Add Data Series')).toBeInTheDocument()
  })

  it('renders no data available state', () => {
    // Has series but dataMap is empty (filtered out or empty response)
    render(
      <ChartDisplayArea
        chart={mockChart}
        timeSeriesData={[]}
        aggregatedData={[]}
        dataMap={new Map()}
        unitMap={new Map()}
        isLoading={false}
        error={null}
        onAddSeries={onAddSeries}
        onAnnotationPositionChange={onAnnotationPositionChange}
      />
    )
    expect(screen.getByText('No Data Available')).toBeInTheDocument()
  })

  it('renders chart content when data is available', () => {
    const dataMap = new Map([['s1', { seriesId: 's1', data: [], yAxis: { unit: 'RON', name: 'v', type: 'FLOAT' }, xAxis: { unit: 'Year', name: 't', type: 'INTEGER' } }]])
    render(
      <ChartDisplayArea
        chart={mockChart}
        timeSeriesData={[]}
        aggregatedData={[]}
        dataMap={dataMap as any}
        unitMap={new Map()}
        isLoading={false}
        error={null}
        onAddSeries={onAddSeries}
        onAnnotationPositionChange={onAnnotationPositionChange}
      />
    )
    expect(screen.getByTestId('chart-renderer')).toBeInTheDocument()
    expect(screen.getByRole('heading')).toHaveTextContent('Test Chart')
  })
})
