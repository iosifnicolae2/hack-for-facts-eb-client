import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { DiffLabel, DiffInfo } from './DiffLabel'

// Mocks
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.join(' '),
}))

vi.mock('../../utils', () => ({
  yValueFormatter: (val: number, unit: string) => `${val} ${unit}`,
}))

vi.mock('recharts', () => ({
  useChartWidth: () => 500,
}))

vi.mock('lucide-react', () => ({
  ChartArea: () => <span data-testid="icon-chart-area" />,
}))

describe('DiffLabel', () => {
  const mockData: DiffInfo[] = [
    { label: 'Series A', color: '#ff0000', diff: 100, percentage: 50, unit: 'RON' },
    { label: 'Series B', color: '#00ff00', diff: -50, percentage: -25, unit: 'EUR' },
  ]

  const mockViewBox = { x: 100, y: 50, width: 200, height: 300 }

  it('renders nothing if viewBox is missing', () => {
    const { container } = render(
      <DiffLabel data={mockData} start={2020} end={2021} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing if data is empty', () => {
    const { container } = render(
      <DiffLabel viewBox={mockViewBox} data={[]} start={2020} end={2021} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders correct header with years', () => {
    render(
      <svg>
        <DiffLabel viewBox={mockViewBox} data={mockData} start={2020} end={2021} />
      </svg>
    )
    expect(screen.getByText('2020 - 2021')).toBeInTheDocument()
  })

  it('renders correct header with years sorted', () => {
    render(
      <svg>
        <DiffLabel viewBox={mockViewBox} data={mockData} start={2021} end={2020} />
      </svg>
    )
    expect(screen.getByText('2020 - 2021')).toBeInTheDocument()
  })

  it('renders diff info for each series', () => {
    render(
      <svg>
        <DiffLabel viewBox={mockViewBox} data={mockData} start={2020} end={2021} />
      </svg>
    )
    
    // Check Series A
    expect(screen.getByText('Series A')).toBeInTheDocument()
    expect(screen.getByText('+100 RON')).toBeInTheDocument()
    expect(screen.getByText('(+50.0%)')).toBeInTheDocument()

    // Check Series B
    expect(screen.getByText('Series B')).toBeInTheDocument()
    expect(screen.getByText('-50 EUR')).toBeInTheDocument()
    expect(screen.getByText('(-25.0%)')).toBeInTheDocument()
  })
})
