import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { ChartList } from './ChartList'
import { ChartCard } from './ChartCard'
import type { StoredChart } from '@/components/charts/chartsStore'

// Mocks
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, params, search, onClick }: any) => (
    <a 
      href={to} 
      onClick={(e) => {
        if (onClick) onClick(e);
      }} 
      data-params={JSON.stringify(params)} 
      data-search={JSON.stringify(search)}
    >
      {children}
    </a>
  ),
  useNavigate: () => vi.fn(),
}))

vi.mock('@/lib/analytics', () => ({
  Analytics: {
    capture: vi.fn(),
    EVENTS: {
      ChartOpened: 'chart_opened',
      ChartFavoritedToggled: 'chart_favorited_toggled',
      ChartCategoryToggled: 'chart_category_toggled',
      ChartViewChanged: 'chart_view_changed',
    }
  }
}))

vi.mock('@/components/charts/components/chart-preview/ChartPreview', () => ({
  ChartPreview: () => <div data-testid="chart-preview" />
}))

vi.mock('date-fns', () => ({
  formatDistanceToNow: () => '2 days ago'
}))

// Mock Icons
vi.mock('lucide-react', () => ({
  Edit: () => <span data-testid="icon-edit" />,
  Trash2: () => <span data-testid="icon-trash" />,
  Star: ({ fill }: { fill: string }) => <span data-testid="icon-star" data-fill={fill} />,
  Eye: () => <span data-testid="icon-eye" />,
  Tag: () => <span data-testid="icon-tag" />,
}))

// Mock Lingui
vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@lingui/core/macro', () => ({
  t: (strings: TemplateStringsArray) => strings[0],
  msg: (strings: TemplateStringsArray) => strings[0],
}))

const mockChart: StoredChart = {
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
  series: [],
  annotations: [],
  createdAt: '2023-01-01',
  updatedAt: '2023-01-02',
  favorite: false,
  deleted: false,
  categories: []
}

describe('ChartList & ChartCard', () => {
  const onDelete = vi.fn()
  const onToggleFavorite = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a list of charts', () => {
    const charts = [
        { ...mockChart, id: '1', title: 'Chart 1' },
        { ...mockChart, id: '2', title: 'Chart 2' }
    ]
    render(<ChartList charts={charts} onDelete={onDelete} onToggleFavorite={onToggleFavorite} />)

    expect(screen.getByText('Chart 1')).toBeInTheDocument()
    expect(screen.getByText('Chart 2')).toBeInTheDocument()
  })

  it('renders chart details in card', () => {
    render(<ChartCard chart={mockChart} onDelete={onDelete} onToggleFavorite={onToggleFavorite} />)

    expect(screen.getByText('Test Chart')).toBeInTheDocument()
    expect(screen.getByText(/2 days ago/)).toBeInTheDocument()
    expect(screen.getByTestId('chart-preview')).toBeInTheDocument()
  })

  it('handles delete interaction', async () => {
    render(<ChartCard chart={mockChart} onDelete={onDelete} onToggleFavorite={onToggleFavorite} />)

    // Find the delete button (in the footer, accessible via tooltip or direct icon)
    // The component uses TooltipTrigger -> Button -> Trash2
    // It's wrapped in AlertDialogTrigger
    const deleteBtn = screen.getByLabelText('Delete chart')
    fireEvent.click(deleteBtn)

    // Dialog should open
    expect(screen.getByText('Delete chart')).toBeInTheDocument()
    expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument()

    // Click confirm
    const confirmBtn = screen.getByText('Delete', { selector: 'button' })
    fireEvent.click(confirmBtn)

    expect(onDelete).toHaveBeenCalledWith('123')
  })

  it('handles favorite toggle', () => {
    render(<ChartCard chart={mockChart} onDelete={onDelete} onToggleFavorite={onToggleFavorite} />)

    const starBtn = screen.getByLabelText('Add to favorites')
    fireEvent.click(starBtn)

    expect(onToggleFavorite).toHaveBeenCalledWith('123')
  })

  it('renders filled star for favorite chart', () => {
    render(<ChartCard chart={{ ...mockChart, favorite: true }} onDelete={onDelete} onToggleFavorite={onToggleFavorite} />)
    const starIcon = screen.getByTestId('icon-star')
    expect(starIcon).toHaveAttribute('data-fill', 'currentColor')
  })
})
