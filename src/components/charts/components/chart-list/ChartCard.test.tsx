/**
 * ChartCard Component Tests
 *
 * This file tests the ChartCard component which displays chart information
 * in a card format with preview, actions, and category management.
 *
 * Pattern: Component with Router & Analytics Testing
 * - Mock TanStack Router (Link)
 * - Mock Analytics
 * - Mock ChartPreview child component
 * - Test rendering, callbacks, and interactions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { ChartCard } from './ChartCard'
import type { StoredChart, ChartCategory } from '@/components/charts/chartsStore'

// ============================================================================
// MOCKS
// ============================================================================

// Mock Lingui
vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@lingui/core/macro', () => ({
  t: (strings: TemplateStringsArray) => strings[0],
  msg: (strings: TemplateStringsArray) => strings[0],
}))

// Mock TanStack Router
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, params, search, onClick, ...props }: any) => (
    <a
      href={`${to}?chartId=${params?.chartId}`}
      data-testid="router-link"
      data-to={to}
      data-chart-id={params?.chartId}
      data-view={search?.view}
      onClick={(e) => {
        e.preventDefault()
        onClick?.()
      }}
      {...props}
    >
      {children}
    </a>
  ),
}))

// Mock Analytics
const mockCapture = vi.fn()
vi.mock('@/lib/analytics', () => ({
  Analytics: {
    capture: (...args: unknown[]) => mockCapture(...args),
    EVENTS: {
      ChartOpened: 'ChartOpened',
      ChartViewChanged: 'ChartViewChanged',
      ChartFavoritedToggled: 'ChartFavoritedToggled',
      ChartCategoryToggled: 'ChartCategoryToggled',
    },
  },
}))

// Mock ChartPreview to simplify testing
vi.mock('@/components/charts/components/chart-preview/ChartPreview', () => ({
  ChartPreview: ({ chart }: { chart: StoredChart }) => (
    <div data-testid="chart-preview">Preview for {chart.title || 'Untitled'}</div>
  ),
}))

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: () => '2 hours ago',
}))

// ============================================================================
// TEST DATA FACTORIES
// ============================================================================

const createMockChart = (overrides: Partial<StoredChart> = {}): StoredChart => ({
  id: 'chart-123',
  title: 'Test Chart',
  description: 'A test chart description',
  config: {
    chartType: 'line',
    color: '#0000ff',
    showLegend: true,
    showTooltip: true,
    showGridLines: true,
    editAnnotations: true,
    showAnnotations: true,
  },
  series: [
    {
      id: 'series-1',
      type: 'line-items-aggregated-yearly',
      enabled: true,
      label: 'Test Series',
      unit: 'RON',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      filter: {
        account_category: 'ch',
        normalization: 'total',
      },
      config: { color: '#0000ff', showDataLabels: false },
    },
  ],
  annotations: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  favorite: false,
  deleted: false,
  categories: [],
  ...overrides,
})

const createMockCategory = (overrides: Partial<ChartCategory> = {}): ChartCategory => ({
  id: 'category-1',
  name: 'Test Category',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

// ============================================================================
// TESTS
// ============================================================================

describe('ChartCard', () => {
  const mockOnDelete = vi.fn()
  const mockOnToggleFavorite = vi.fn()
  const mockOnToggleCategory = vi.fn()
  const mockOnOpenCategory = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders chart title', () => {
      render(
        <ChartCard
          chart={createMockChart({ title: 'My Chart Title' })}
          onDelete={mockOnDelete}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      expect(screen.getByText('My Chart Title')).toBeInTheDocument()
    })

    it('renders "Untitled chart" when title is empty', () => {
      render(
        <ChartCard
          chart={createMockChart({ title: '' })}
          onDelete={mockOnDelete}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      expect(screen.getByText('Untitled chart')).toBeInTheDocument()
    })

    it('renders "Untitled chart" when title is whitespace', () => {
      render(
        <ChartCard
          chart={createMockChart({ title: '   ' })}
          onDelete={mockOnDelete}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      expect(screen.getByText('Untitled chart')).toBeInTheDocument()
    })

    it('renders chart type badge', () => {
      render(
        <ChartCard
          chart={createMockChart()}
          onDelete={mockOnDelete}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      expect(screen.getByText('line')).toBeInTheDocument()
    })

    it('renders series count', () => {
      render(
        <ChartCard
          chart={createMockChart()}
          onDelete={mockOnDelete}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      expect(screen.getByText('1 series')).toBeInTheDocument()
    })

    it('renders 0 series when no series', () => {
      render(
        <ChartCard
          chart={createMockChart({ series: [] })}
          onDelete={mockOnDelete}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      expect(screen.getByText('0 series')).toBeInTheDocument()
    })

    it('renders relative update time', () => {
      render(
        <ChartCard
          chart={createMockChart()}
          onDelete={mockOnDelete}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      expect(screen.getByText('• 2 hours ago')).toBeInTheDocument()
    })

    it('renders chart preview', () => {
      render(
        <ChartCard
          chart={createMockChart({ title: 'Preview Test' })}
          onDelete={mockOnDelete}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      expect(screen.getByTestId('chart-preview')).toBeInTheDocument()
    })
  })

  describe('navigation links', () => {
    it('has title link to overview', () => {
      render(
        <ChartCard
          chart={createMockChart()}
          onDelete={mockOnDelete}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      const links = screen.getAllByTestId('router-link')
      const titleLink = links.find((link) => link.getAttribute('data-view') === 'overview')
      expect(titleLink).toBeInTheDocument()
    })

    it('has edit button linking to config view', () => {
      render(
        <ChartCard
          chart={createMockChart()}
          onDelete={mockOnDelete}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      const links = screen.getAllByTestId('router-link')
      const configLink = links.find((link) => link.getAttribute('data-view') === 'config')
      expect(configLink).toBeInTheDocument()
    })

    it('has view button linking to overview', () => {
      render(
        <ChartCard
          chart={createMockChart()}
          onDelete={mockOnDelete}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      expect(screen.getByText('View')).toBeInTheDocument()
    })
  })

  describe('favorite functionality', () => {
    it('renders favorite button', () => {
      render(
        <ChartCard
          chart={createMockChart()}
          onDelete={mockOnDelete}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      const favoriteButton = screen.getByRole('button', { name: /add to favorites/i })
      expect(favoriteButton).toBeInTheDocument()
    })

    it('shows "Remove from favorites" label when favorited', () => {
      render(
        <ChartCard
          chart={createMockChart({ favorite: true })}
          onDelete={mockOnDelete}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      const favoriteButton = screen.getByRole('button', { name: /remove from favorites/i })
      expect(favoriteButton).toBeInTheDocument()
    })

    it('calls onToggleFavorite when favorite button is clicked', () => {
      const chart = createMockChart()
      render(
        <ChartCard
          chart={chart}
          onDelete={mockOnDelete}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      const favoriteButton = screen.getByRole('button', { name: /add to favorites/i })
      fireEvent.click(favoriteButton)

      expect(mockOnToggleFavorite).toHaveBeenCalledWith('chart-123')
    })

    it('fires analytics event when favorite is toggled', () => {
      const chart = createMockChart({ favorite: false })
      render(
        <ChartCard
          chart={chart}
          onDelete={mockOnDelete}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      const favoriteButton = screen.getByRole('button', { name: /add to favorites/i })
      fireEvent.click(favoriteButton)

      expect(mockCapture).toHaveBeenCalledWith('ChartFavoritedToggled', {
        chart_id: 'chart-123',
        now_favorite: true,
      })
    })
  })

  describe('delete functionality', () => {
    it('renders delete button', () => {
      render(
        <ChartCard
          chart={createMockChart()}
          onDelete={mockOnDelete}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      const deleteButton = screen.getByRole('button', { name: /delete chart/i })
      expect(deleteButton).toBeInTheDocument()
    })

    it('shows confirmation dialog when delete button is clicked', () => {
      const chart = createMockChart({ title: 'Chart to Delete' })
      render(
        <ChartCard
          chart={chart}
          onDelete={mockOnDelete}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      const deleteButton = screen.getByRole('button', { name: /delete chart/i })
      fireEvent.click(deleteButton)

      expect(screen.getByText('Delete chart')).toBeInTheDocument()
      expect(
        screen.getByText(/Are you sure you want to delete "Chart to Delete"/)
      ).toBeInTheDocument()
    })

    it('calls onDelete when delete is confirmed', () => {
      const chart = createMockChart()
      render(
        <ChartCard
          chart={chart}
          onDelete={mockOnDelete}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      // Open dialog
      const deleteButton = screen.getByRole('button', { name: /delete chart/i })
      fireEvent.click(deleteButton)

      // Confirm delete
      const confirmButton = screen.getByRole('button', { name: /^Delete$/i })
      fireEvent.click(confirmButton)

      expect(mockOnDelete).toHaveBeenCalledWith('chart-123')
    })

    it('does not call onDelete when cancel is clicked', () => {
      const chart = createMockChart()
      render(
        <ChartCard
          chart={chart}
          onDelete={mockOnDelete}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      // Open dialog
      const deleteButton = screen.getByRole('button', { name: /delete chart/i })
      fireEvent.click(deleteButton)

      // Cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      expect(mockOnDelete).not.toHaveBeenCalled()
    })
  })

  describe('category functionality', () => {
    const categories: ChartCategory[] = [
      createMockCategory({ id: 'cat-1', name: 'Finance' }),
      createMockCategory({ id: 'cat-2', name: 'Health' }),
    ]

    it('renders category button when categories exist', () => {
      render(
        <ChartCard
          chart={createMockChart()}
          onDelete={mockOnDelete}
          onToggleFavorite={mockOnToggleFavorite}
          categories={categories}
          onToggleCategory={mockOnToggleCategory}
        />
      )

      // Tag button should be present
      const buttons = screen.getAllByRole('button')
      const tagButton = buttons.find((btn) => btn.querySelector('svg.lucide-tag'))
      expect(tagButton).toBeInTheDocument()
    })

    it('does not render category button when no categories', () => {
      render(
        <ChartCard
          chart={createMockChart()}
          onDelete={mockOnDelete}
          onToggleFavorite={mockOnToggleFavorite}
          categories={[]}
        />
      )

      const buttons = screen.getAllByRole('button')
      const tagButton = buttons.find((btn) => btn.querySelector('svg.lucide-tag'))
      expect(tagButton).toBeUndefined()
    })

    it('displays category badges for assigned categories', () => {
      render(
        <ChartCard
          chart={createMockChart({ categories: ['cat-1'] })}
          onDelete={mockOnDelete}
          onToggleFavorite={mockOnToggleFavorite}
          categories={categories}
          onToggleCategory={mockOnToggleCategory}
        />
      )

      expect(screen.getByText('#Finance')).toBeInTheDocument()
    })

    it('calls onOpenCategory when category badge is clicked', () => {
      render(
        <ChartCard
          chart={createMockChart({ categories: ['cat-1'] })}
          onDelete={mockOnDelete}
          onToggleFavorite={mockOnToggleFavorite}
          categories={categories}
          onToggleCategory={mockOnToggleCategory}
          onOpenCategory={mockOnOpenCategory}
        />
      )

      const categoryBadge = screen.getByText('#Finance')
      fireEvent.click(categoryBadge)

      expect(mockOnOpenCategory).toHaveBeenCalledWith('cat-1')
    })
  })

  describe('analytics events', () => {
    it('fires ChartOpened event when preview is clicked', () => {
      render(
        <ChartCard
          chart={createMockChart()}
          onDelete={mockOnDelete}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      // Preview link wraps the chart preview component
      const chartPreview = screen.getByTestId('chart-preview')
      const previewLink = chartPreview.closest('a')
      fireEvent.click(previewLink!)

      expect(mockCapture).toHaveBeenCalledWith('ChartOpened', {
        chart_id: 'chart-123',
        source: 'card_preview',
      })
    })

    it('fires ChartViewChanged event when edit button is clicked', () => {
      render(
        <ChartCard
          chart={createMockChart()}
          onDelete={mockOnDelete}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      const links = screen.getAllByTestId('router-link')
      const configLink = links.find((link) => link.getAttribute('data-view') === 'config')
      fireEvent.click(configLink!)

      expect(mockCapture).toHaveBeenCalledWith('ChartViewChanged', {
        chart_id: 'chart-123',
        view: 'config',
        source: 'card_footer',
      })
    })

    it('fires ChartOpened event when view button is clicked', () => {
      render(
        <ChartCard
          chart={createMockChart()}
          onDelete={mockOnDelete}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      const viewButton = screen.getByText('View').closest('a')
      fireEvent.click(viewButton!)

      expect(mockCapture).toHaveBeenCalledWith('ChartOpened', {
        chart_id: 'chart-123',
        source: 'card_button',
      })
    })
  })

  describe('accessibility', () => {
    it('delete button has aria-label', () => {
      render(
        <ChartCard
          chart={createMockChart()}
          onDelete={mockOnDelete}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      expect(screen.getByRole('button', { name: /delete chart/i })).toBeInTheDocument()
    })

    it('favorite button has appropriate aria-label', () => {
      render(
        <ChartCard
          chart={createMockChart()}
          onDelete={mockOnDelete}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      expect(screen.getByRole('button', { name: /add to favorites/i })).toBeInTheDocument()
    })
  })
})
