/**
 * SeriesFilter Component Tests
 *
 * This file tests the SeriesFilter component which provides comprehensive
 * filtering capabilities for chart series data. The component supports
 * both adapter-based and seriesId-based usage patterns.
 *
 * Pattern: Complex Form Component Testing
 * - Mock all external dependencies (hooks, stores, i18n)
 * - Test rendering modes (adapter vs seriesId)
 * - Test filter state management
 * - Test clear/reset functionality
 * - Test exclude filters section
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { SeriesFilter, SeriesFilterAdapter } from './SeriesFilter'
import type { SeriesConfiguration } from '@/schemas/charts'

// ============================================================================
// MOCKS
// ============================================================================

// Mock Lingui
vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@lingui/core/macro', () => ({
  t: (strings: TemplateStringsArray) => strings[0],
}))

// Mock @/lib/utils to avoid lingui macro imports
vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
  getNormalizationUnit: () => 'RON',
}))

// Mock period utils
vi.mock('@/lib/period-utils', () => ({
  getPeriodTags: () => [],
}))

// Mock chart filter utils
vi.mock('@/lib/chart-filter-utils', () => ({
  getEconomicPrefixLabel: (prefix: string) => prefix,
  getFunctionalPrefixLabel: (prefix: string) => prefix,
}))

// Mock user preferences hooks
vi.mock('@/lib/hooks/useUserCurrency', () => ({
  useUserCurrency: () => ['RON', vi.fn()],
}))

vi.mock('@/lib/hooks/useUserInflationAdjusted', () => ({
  useUserInflationAdjusted: () => [false, vi.fn()],
}))

// Mock all filter label hooks
vi.mock('@/hooks/filters/useFilterLabels', () => ({
  useEntityLabel: () => ({ map: (id: string) => `Entity ${id}`, add: vi.fn() }),
  useUatLabel: () => ({ map: (id: string) => `UAT ${id}`, add: vi.fn() }),
  useEconomicClassificationLabel: () => ({ map: (id: string) => `EC ${id}`, add: vi.fn() }),
  useFunctionalClassificationLabel: () => ({ map: (id: string) => `FC ${id}`, add: vi.fn() }),
  useBudgetSectorLabel: () => ({ map: (id: string) => `BS ${id}`, add: vi.fn() }),
  useFundingSourceLabel: () => ({ map: (id: string) => `FS ${id}`, add: vi.fn() }),
  useEntityTypeLabel: () => ({ map: (id: string) => `ET ${id}`, add: vi.fn() }),
  useAccountCategoryLabel: () => ({ map: (id: string) => id === 'ch' ? 'Expenses' : 'Revenues', add: vi.fn() }),
}))

// Mock chart store
const mockUpdateSeries = vi.fn()
vi.mock('../../hooks/useChartStore', () => ({
  useChartStore: () => ({
    chart: {
      series: [
        {
          id: 'test-series-id',
          type: 'line-items-aggregated-yearly',
          filter: {
            account_category: 'ch',
            normalization: 'total',
            currency: 'RON',
            inflation_adjusted: false,
          },
        },
      ],
    },
    updateSeries: mockUpdateSeries,
  }),
}))

// Mock filter components to simplify testing
vi.mock('../../../filters/base-filter/FilterListContainer', () => ({
  FilterListContainer: ({ title }: { title: string }) => (
    <div data-testid={`filter-list-${title}`}>{title}</div>
  ),
}))

vi.mock('../../../filters/base-filter/FilterRangeContainer', () => ({
  FilterRangeContainer: ({ title }: { title: string }) => (
    <div data-testid={`filter-range-${title}`}>{title}</div>
  ),
}))

vi.mock('../../../filters/base-filter/FilterRadioContainer', () => ({
  FilterRadioContainer: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div data-testid={`filter-radio-${title}`}>
      <span>{title}</span>
      {children}
    </div>
  ),
}))

vi.mock('../../../filters/base-filter/FilterContainer', () => ({
  FilterContainer: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div data-testid={`filter-container-${title}`}>
      <span>{title}</span>
      {children}
    </div>
  ),
}))

vi.mock('../../../filters/prefix-filter', () => ({
  FilterPrefixContainer: ({ title }: { title: string }) => (
    <div data-testid={`filter-prefix-${title}`}>{title}</div>
  ),
  PrefixFilter: () => <div>Prefix Filter</div>,
}))

vi.mock('../../../filters/report-type-filter', () => ({
  ReportTypeFilter: () => <div data-testid="report-type-filter">Report Type</div>,
}))

vi.mock('../../../filters/account-type-filter/AccountCategoryRadio', () => ({
  AccountCategoryRadio: () => <div data-testid="account-category-radio">Account Category</div>,
}))

vi.mock('../../../filters/flags-filter', () => ({
  IsUatFilter: () => <div data-testid="is-uat-filter">Is UAT</div>,
}))

vi.mock('../../../filters/amount-range-filter', () => ({
  AmountRangeFilter: () => <div data-testid="amount-range-filter">Amount Range</div>,
}))

vi.mock('@/components/filters/normalization-filter/NormalizationFilter', () => ({
  NormalizationFilter: () => <div data-testid="normalization-filter">Normalization</div>,
}))

vi.mock('@/components/filters/period-filter/PeriodFilter', () => ({
  PeriodFilter: () => <div data-testid="period-filter">Period Filter</div>,
}))

vi.mock('@/components/ui/radio-group-buttons', () => ({
  RadioGroupButtons: ({ options }: { options: { value: string; label: string }[] }) => (
    <div data-testid="radio-group-buttons">
      {options.map((opt) => (
        <button key={String(opt.value)}>{opt.label}</button>
      ))}
    </div>
  ),
}))

// Mock list components
vi.mock('../../../filters/entity-filter', () => ({
  EntityList: () => <div data-testid="entity-list">Entity List</div>,
}))

vi.mock('../../../filters/uat-filter', () => ({
  UatList: () => <div data-testid="uat-list">UAT List</div>,
}))

vi.mock('../../../filters/county-filter/CountyList', () => ({
  CountyList: () => <div data-testid="county-list">County List</div>,
}))

vi.mock('../../../filters/entity-type-filter/EntityTypeList', () => ({
  EntityTypeList: () => <div data-testid="entity-type-list">Entity Type List</div>,
}))

vi.mock('../../../filters/functional-classification-filter', () => ({
  FunctionalClassificationList: () => <div data-testid="fc-list">FC List</div>,
}))

vi.mock('../../../filters/economic-classification-filter', () => ({
  EconomicClassificationList: () => <div data-testid="ec-list">EC List</div>,
}))

vi.mock('@/components/filters/budget-sector-filter', () => ({
  BudgetSectorList: () => <div data-testid="budget-sector-list">Budget Sector List</div>,
}))

vi.mock('@/components/filters/funding-source-filter', () => ({
  FundingSourceList: () => <div data-testid="funding-source-list">Funding Source List</div>,
}))

// ============================================================================
// TEST DATA FACTORIES
// ============================================================================

const createMockSeries = (overrides: Partial<SeriesConfiguration> = {}): SeriesConfiguration => ({
  id: 'test-series',
  type: 'line-items-aggregated-yearly',
  enabled: true,
  label: 'Test Series',
  unit: 'RON',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  filter: {
    account_category: 'ch',
    normalization: 'total',
    currency: 'RON',
    inflation_adjusted: false,
    ...overrides.filter,
  },
  config: {
    showDataLabels: false,
    color: '#0000ff',
  },
  ...overrides,
})

const createMockAdapter = (series?: SeriesConfiguration): SeriesFilterAdapter => ({
  series: series ?? createMockSeries(),
  applyChanges: vi.fn(),
})

// ============================================================================
// TESTS
// ============================================================================

describe('SeriesFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering modes', () => {
    it('renders with adapter prop', () => {
      const adapter = createMockAdapter()

      render(<SeriesFilter adapter={adapter} />)

      expect(screen.getByText('Filters')).toBeInTheDocument()
    })

    it('renders with seriesId prop using chart store', () => {
      render(<SeriesFilter seriesId="test-series-id" />)

      expect(screen.getByText('Filters')).toBeInTheDocument()
    })

    it('returns null when no seriesId and no adapter', () => {
      const { container } = render(<SeriesFilter />)

      expect(container.firstChild).toBeNull()
    })

    it('returns null when adapter has no series', () => {
      const adapter: SeriesFilterAdapter = {
        series: undefined,
        applyChanges: vi.fn(),
      }

      const { container } = render(<SeriesFilter adapter={adapter} />)

      expect(container.firstChild).toBeNull()
    })
  })

  describe('filter sections', () => {
    it('renders revenues/expenses filter section', () => {
      const adapter = createMockAdapter()

      render(<SeriesFilter adapter={adapter} />)

      expect(screen.getByTestId('filter-radio-Revenues/Expenses')).toBeInTheDocument()
    })

    it('renders normalization filter section', () => {
      const adapter = createMockAdapter()

      render(<SeriesFilter adapter={adapter} />)

      expect(screen.getByTestId('filter-radio-Normalization')).toBeInTheDocument()
    })

    it('renders currency filter section', () => {
      const adapter = createMockAdapter()

      render(<SeriesFilter adapter={adapter} />)

      expect(screen.getByTestId('filter-radio-Currency')).toBeInTheDocument()
    })

    it('renders inflation adjustment filter section', () => {
      const adapter = createMockAdapter()

      render(<SeriesFilter adapter={adapter} />)

      expect(screen.getByTestId('filter-radio-Inflation Adjustment')).toBeInTheDocument()
    })

    it('renders period filter section', () => {
      const adapter = createMockAdapter()

      render(<SeriesFilter adapter={adapter} />)

      expect(screen.getByTestId('filter-container-Period')).toBeInTheDocument()
    })

    it('renders entities filter section', () => {
      const adapter = createMockAdapter()

      render(<SeriesFilter adapter={adapter} />)

      expect(screen.getByTestId('filter-list-Entities')).toBeInTheDocument()
    })

    it('renders report type filter section', () => {
      const adapter = createMockAdapter()

      render(<SeriesFilter adapter={adapter} />)

      expect(screen.getByTestId('filter-radio-Report Type')).toBeInTheDocument()
    })
  })

  describe('exclude filters section', () => {
    it('renders exclude filters accordion', () => {
      const adapter = createMockAdapter()

      render(<SeriesFilter adapter={adapter} />)

      expect(screen.getByText('Exclude Filters')).toBeInTheDocument()
    })

    it('shows exclude filter count badge when exclude filters are active', () => {
      const series = createMockSeries({
        filter: {
          account_category: 'ch',
          normalization: 'total',
          exclude: {
            entity_cuis: ['entity1', 'entity2'],
          },
        },
      })
      const adapter = createMockAdapter(series)

      render(<SeriesFilter adapter={adapter} />)

      // The badge showing count of exclude filters
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  describe('clear all functionality', () => {
    it('shows clear all button when filters are active', () => {
      const series = createMockSeries({
        filter: {
          account_category: 'ch',
          normalization: 'total',
          entity_cuis: ['entity1'],
        },
      })
      const adapter = createMockAdapter(series)

      render(<SeriesFilter adapter={adapter} />)

      // Find clear all button (there may be multiple)
      const clearButtons = screen.getAllByRole('button', { name: /clear all/i })
      expect(clearButtons.length).toBeGreaterThan(0)
    })

    it('calls applyChanges when clear all is clicked', () => {
      const series = createMockSeries({
        filter: {
          account_category: 'ch',
          normalization: 'total',
          entity_cuis: ['entity1'],
        },
      })
      const applyChanges = vi.fn()
      const adapter: SeriesFilterAdapter = {
        series,
        applyChanges,
      }

      render(<SeriesFilter adapter={adapter} />)

      // Find and click the main clear all button (in header)
      const clearAllButtons = screen.getAllByRole('button', { name: /clear all/i })
      fireEvent.click(clearAllButtons[0])

      expect(applyChanges).toHaveBeenCalled()
    })
  })

  describe('period growth checkbox', () => {
    it('renders period growth section', () => {
      const adapter = createMockAdapter()

      render(<SeriesFilter adapter={adapter} />)

      expect(screen.getByTestId('filter-container-Period Growth')).toBeInTheDocument()
    })

    it('renders show growth checkbox', () => {
      const adapter = createMockAdapter()

      render(<SeriesFilter adapter={adapter} />)

      expect(screen.getByLabelText('Show growth (%)')).toBeInTheDocument()
    })

    it('calls applyChanges when growth checkbox is toggled', () => {
      const applyChanges = vi.fn()
      const adapter: SeriesFilterAdapter = {
        series: createMockSeries(),
        applyChanges,
      }

      render(<SeriesFilter adapter={adapter} />)

      const checkbox = screen.getByLabelText('Show growth (%)')
      fireEvent.click(checkbox)

      expect(applyChanges).toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('has accessible region with title', () => {
      const adapter = createMockAdapter()

      render(<SeriesFilter adapter={adapter} />)

      const region = screen.getByRole('region', { name: /filters/i })
      expect(region).toBeInTheDocument()
    })

    it('renders filter title as heading', () => {
      const adapter = createMockAdapter()

      render(<SeriesFilter adapter={adapter} />)

      expect(screen.getByText('Filters')).toBeInTheDocument()
    })
  })

  describe('custom className', () => {
    it('applies custom className to container', () => {
      const adapter = createMockAdapter()

      render(<SeriesFilter adapter={adapter} className="custom-class" />)

      const region = screen.getByRole('region')
      expect(region).toHaveClass('custom-class')
    })
  })

  describe('filter counts', () => {
    it('calculates total filter count correctly', () => {
      const series = createMockSeries({
        filter: {
          account_category: 'ch',
          normalization: 'total',
          entity_cuis: ['e1', 'e2'],
          uat_ids: ['u1'],
          report_type: 'Executie bugetara agregata la nivel de ordonator principal',
        },
      })
      const adapter = createMockAdapter(series)

      render(<SeriesFilter adapter={adapter} />)

      // Should show clear all with total count
      // account_category (1) + normalization (1) + entity_cuis (2) + uat_ids (1) + report_type (1) = 6
      expect(screen.getByText(/\(6\)/)).toBeInTheDocument()
    })
  })
})
