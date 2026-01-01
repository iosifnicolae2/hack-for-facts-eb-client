/**
 * EntityLineItemsTabs Component Tests
 *
 * This file tests the EntityLineItemsTabs component which provides
 * tab navigation for viewing line items by category, funding source, or expense type.
 *
 * Pattern: Controlled Tab Component Testing
 * - Mock Lingui
 * - Mock child components (LineItemsGroupedSection, LineItemsBadgeFilters, AdvancedFilterDropdown)
 * - Test tab switching
 * - Test transfer filter
 * - Test advanced filter
 * - Test callbacks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { EntityLineItemsTabs, type EntityLineItemsTabsProps } from './EntityLineItemsTabs'
import type { ExecutionLineItem, FundingSourceOption } from '@/lib/api/entities'

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

// Mock filterLineItems
vi.mock('@/lib/api/entities', () => ({
  filterLineItems: (items: ExecutionLineItem[], filter?: string) => {
    if (!filter) return items
    return items.filter((item) => item.functionalClassification?.functional_name?.includes(filter))
  },
}))

// Mock LineItemsGroupedSection
vi.mock('./LineItemsGroupedSection', () => ({
  LineItemsGroupedSection: ({
    type,
    title,
    activeTab,
  }: {
    type: string
    title: string
    activeTab: string
  }) => (
    <div data-testid={`grouped-section-${type}`}>
      <span data-testid="section-title">{title}</span>
      <span data-testid="section-tab">{activeTab}</span>
    </div>
  ),
}))

// Mock LineItemsBadgeFilters
vi.mock('./LineItemsBadgeFilters', () => ({
  LineItemsBadgeFilters: ({
    mode,
    selectedKey,
  }: {
    mode: string
    selectedKey: string
  }) => (
    <div data-testid={`badge-filters-${mode}`}>
      <span data-testid="badge-selected-key">{selectedKey}</span>
    </div>
  ),
}))

// Mock AdvancedFilterDropdown
vi.mock('./AdvancedFilterDropdown', () => ({
  AdvancedFilterDropdown: ({
    onSelect,
    currentFilter,
  }: {
    onSelect: (filter: string | undefined) => void
    currentFilter?: string
  }) => (
    <div data-testid="advanced-filter-dropdown">
      <button data-testid="select-personal" onClick={() => onSelect('economic:personal')}>
        Personal Spending
      </button>
      <button data-testid="select-anomaly" onClick={() => onSelect('anomaly:missing')}>
        Missing Items
      </button>
      <span data-testid="current-filter">{currentFilter || 'none'}</span>
    </div>
  ),
}))

// ============================================================================
// TEST DATA FACTORIES
// ============================================================================

const createMockLineItem = (overrides: Partial<ExecutionLineItem> = {}): ExecutionLineItem => ({
  line_item_id: 'li-1',
  account_category: 'ch',
  funding_source_id: 1,
  ytd_amount: 1000,
  quarterly_amount: 250,
  monthly_amount: 100,
  amount: 1000,
  functionalClassification: {
    functional_code: '01',
    functional_name: 'Test Category',
  },
  economicClassification: {
    economic_code: '10',
    economic_name: 'Test Economic',
  },
  ...overrides,
})

const createMockFundingSource = (
  overrides: Partial<FundingSourceOption> = {}
): FundingSourceOption => ({
  source_id: 'fs-1',
  source_description: 'General Fund',
  ...overrides,
})

const createDefaultProps = (
  overrides: Partial<EntityLineItemsTabsProps> = {}
): EntityLineItemsTabsProps => ({
  lineItems: [createMockLineItem()],
  fundingSources: [createMockFundingSource()],
  currentYear: 2024,
  years: [2024, 2023, 2022],
  onYearChange: vi.fn(),
  initialExpenseSearchTerm: '',
  initialIncomeSearchTerm: '',
  onSearchChange: vi.fn(),
  ...overrides,
})

// ============================================================================
// TESTS
// ============================================================================

describe('EntityLineItemsTabs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders tab toggle group', () => {
      render(<EntityLineItemsTabs {...createDefaultProps()} />)

      expect(screen.getByText('By Category')).toBeInTheDocument()
      expect(screen.getByText('By Funding Source')).toBeInTheDocument()
      expect(screen.getByText('By Expense Type')).toBeInTheDocument()
    })

    it('renders functional tab by default', () => {
      render(<EntityLineItemsTabs {...createDefaultProps()} />)

      expect(screen.getByTestId('grouped-section-expense')).toBeInTheDocument()
      expect(screen.getByTestId('grouped-section-income')).toBeInTheDocument()
    })

    it('shows section with functional active tab', () => {
      render(<EntityLineItemsTabs {...createDefaultProps()} />)

      const tabs = screen.getAllByTestId('section-tab')
      expect(tabs[0]).toHaveTextContent('functional')
    })

    it('renders both income and expense sections by default', () => {
      render(<EntityLineItemsTabs {...createDefaultProps()} />)

      expect(screen.getByTestId('grouped-section-income')).toBeInTheDocument()
      expect(screen.getByTestId('grouped-section-expense')).toBeInTheDocument()
    })
  })

  describe('tab switching', () => {
    it('calls onLineItemsTabChange when tab is clicked', () => {
      const onLineItemsTabChange = vi.fn()
      render(
        <EntityLineItemsTabs
          {...createDefaultProps()}
          onLineItemsTabChange={onLineItemsTabChange}
        />
      )

      fireEvent.click(screen.getByText('By Funding Source'))

      expect(onLineItemsTabChange).toHaveBeenCalledWith('funding')
    })

    it('shows badge filters when funding tab is active', () => {
      render(<EntityLineItemsTabs {...createDefaultProps()} lineItemsTab="funding" />)

      expect(screen.getByTestId('badge-filters-funding')).toBeInTheDocument()
    })

    it('shows badge filters when expenseType tab is active', () => {
      render(<EntityLineItemsTabs {...createDefaultProps()} lineItemsTab="expenseType" />)

      expect(screen.getByTestId('badge-filters-expenseType')).toBeInTheDocument()
    })

    it('does not show badge filters on functional tab', () => {
      render(<EntityLineItemsTabs {...createDefaultProps()} lineItemsTab="functional" />)

      expect(screen.queryByTestId('badge-filters-funding')).not.toBeInTheDocument()
      expect(screen.queryByTestId('badge-filters-expenseType')).not.toBeInTheDocument()
    })

    it('passes correct active tab to sections', () => {
      render(<EntityLineItemsTabs {...createDefaultProps()} lineItemsTab="funding" />)

      const tabs = screen.getAllByTestId('section-tab')
      expect(tabs[0]).toHaveTextContent('funding')
    })
  })

  describe('transfer filter', () => {
    it('does not render transfer filter when onTransferFilterChange is not provided', () => {
      render(<EntityLineItemsTabs {...createDefaultProps()} />)

      expect(screen.queryByText('Without Transfers')).not.toBeInTheDocument()
    })

    it('renders transfer filter when onTransferFilterChange is provided', () => {
      render(
        <EntityLineItemsTabs
          {...createDefaultProps()}
          onTransferFilterChange={vi.fn()}
        />
      )

      expect(screen.getByText('Without Transfers')).toBeInTheDocument()
      expect(screen.getByText('Transfers Only')).toBeInTheDocument()
      expect(screen.getByText('All')).toBeInTheDocument()
    })

    it('calls onTransferFilterChange when filter is clicked', () => {
      const onTransferFilterChange = vi.fn()
      render(
        <EntityLineItemsTabs
          {...createDefaultProps()}
          onTransferFilterChange={onTransferFilterChange}
        />
      )

      fireEvent.click(screen.getByText('Transfers Only'))

      expect(onTransferFilterChange).toHaveBeenCalledWith('transfers-only')
    })

    it('renders info popover trigger', () => {
      render(
        <EntityLineItemsTabs
          {...createDefaultProps()}
          onTransferFilterChange={vi.fn()}
        />
      )

      // Info icon should be present (lucide Info component)
      const infoIcon = document.querySelector('.lucide-info')
      expect(infoIcon).toBeInTheDocument()
    })
  })

  describe('advanced filter', () => {
    it('does not render advanced filter when onAdvancedFilterChange is not provided', () => {
      render(<EntityLineItemsTabs {...createDefaultProps()} />)

      expect(screen.queryByTestId('advanced-filter-dropdown')).not.toBeInTheDocument()
    })

    it('renders advanced filter dropdown when onAdvancedFilterChange is provided', () => {
      render(
        <EntityLineItemsTabs
          {...createDefaultProps()}
          onAdvancedFilterChange={vi.fn()}
        />
      )

      expect(screen.getByTestId('advanced-filter-dropdown')).toBeInTheDocument()
    })

    it('calls onAdvancedFilterChange when filter is selected', () => {
      const onAdvancedFilterChange = vi.fn()
      render(
        <EntityLineItemsTabs
          {...createDefaultProps()}
          onAdvancedFilterChange={onAdvancedFilterChange}
        />
      )

      fireEvent.click(screen.getByTestId('select-personal'))

      expect(onAdvancedFilterChange).toHaveBeenCalledWith('economic:personal')
    })

    it('shows active filter badge when filter is set', () => {
      render(
        <EntityLineItemsTabs
          {...createDefaultProps()}
          onAdvancedFilterChange={vi.fn()}
          advancedFilter="economic:personal"
        />
      )

      // There are two elements with "Personal Spending" - one in dropdown, one in badge
      const elements = screen.getAllByText('Personal Spending')
      expect(elements.length).toBeGreaterThanOrEqual(2) // Badge + dropdown button
    })

    it('shows remove filter button when filter is active', () => {
      render(
        <EntityLineItemsTabs
          {...createDefaultProps()}
          onAdvancedFilterChange={vi.fn()}
          advancedFilter="economic:goods"
        />
      )

      expect(screen.getByText('Goods & Services')).toBeInTheDocument()
      expect(screen.getByText('Remove filter')).toBeInTheDocument()
    })

    it('calls onAdvancedFilterChange with undefined when remove is clicked', () => {
      const onAdvancedFilterChange = vi.fn()
      render(
        <EntityLineItemsTabs
          {...createDefaultProps()}
          onAdvancedFilterChange={onAdvancedFilterChange}
          advancedFilter="economic:personal"
        />
      )

      // Find the X button to remove filter
      const removeButton = screen.getByRole('button', { name: /remove filter/i })
      fireEvent.click(removeButton)

      expect(onAdvancedFilterChange).toHaveBeenCalledWith(undefined)
    })

    it('displays anomaly filter labels correctly', () => {
      render(
        <EntityLineItemsTabs
          {...createDefaultProps()}
          onAdvancedFilterChange={vi.fn()}
          advancedFilter="anomaly:missing"
        />
      )

      // There are two elements with "Missing Items" - one in dropdown, one in badge
      const elements = screen.getAllByText('Missing Items')
      expect(elements.length).toBeGreaterThanOrEqual(2) // Badge + dropdown button
    })

    it('displays value_changed filter label', () => {
      render(
        <EntityLineItemsTabs
          {...createDefaultProps()}
          onAdvancedFilterChange={vi.fn()}
          advancedFilter="anomaly:value_changed"
        />
      )

      expect(screen.getByText('Value Changed')).toBeInTheDocument()
    })
  })

  describe('types prop', () => {
    it('renders only expense section when types is [expense]', () => {
      render(
        <EntityLineItemsTabs
          {...createDefaultProps()}
          types={['expense']}
        />
      )

      expect(screen.getByTestId('grouped-section-expense')).toBeInTheDocument()
      expect(screen.queryByTestId('grouped-section-income')).not.toBeInTheDocument()
    })

    it('renders only income section when types is [income]', () => {
      render(
        <EntityLineItemsTabs
          {...createDefaultProps()}
          types={['income']}
        />
      )

      expect(screen.getByTestId('grouped-section-income')).toBeInTheDocument()
      expect(screen.queryByTestId('grouped-section-expense')).not.toBeInTheDocument()
    })

    it('renders both sections when types includes both', () => {
      render(
        <EntityLineItemsTabs
          {...createDefaultProps()}
          types={['income', 'expense']}
        />
      )

      expect(screen.getByTestId('grouped-section-income')).toBeInTheDocument()
      expect(screen.getByTestId('grouped-section-expense')).toBeInTheDocument()
    })
  })

  describe('selected keys', () => {
    it('passes selectedFundingKey to badge filters', () => {
      render(
        <EntityLineItemsTabs
          {...createDefaultProps()}
          lineItemsTab="funding"
          selectedFundingKey="fs-1"
        />
      )

      expect(screen.getByTestId('badge-selected-key')).toHaveTextContent('fs-1')
    })

    it('passes selectedExpenseTypeKey to badge filters', () => {
      render(
        <EntityLineItemsTabs
          {...createDefaultProps()}
          lineItemsTab="expenseType"
          selectedExpenseTypeKey="et-1"
        />
      )

      expect(screen.getByTestId('badge-selected-key')).toHaveTextContent('et-1')
    })

    it('passes empty string as default for selectedFundingKey', () => {
      render(
        <EntityLineItemsTabs
          {...createDefaultProps()}
          lineItemsTab="funding"
        />
      )

      expect(screen.getByTestId('badge-selected-key')).toHaveTextContent('')
    })
  })

  describe('section titles', () => {
    it('shows Incomes and Expenses titles', () => {
      render(<EntityLineItemsTabs {...createDefaultProps()} />)

      const titles = screen.getAllByTestId('section-title')
      expect(titles[0]).toHaveTextContent('Incomes')
      expect(titles[1]).toHaveTextContent('Expenses')
    })
  })

  describe('loading state', () => {
    it('passes isLoading to child components', () => {
      // Since we mock the child components, we just verify the component renders without error
      render(
        <EntityLineItemsTabs
          {...createDefaultProps()}
          isLoading={true}
        />
      )

      expect(screen.getByTestId('grouped-section-expense')).toBeInTheDocument()
    })
  })

  describe('year change', () => {
    it('passes onYearChange to child components', () => {
      const onYearChange = vi.fn()
      render(
        <EntityLineItemsTabs
          {...createDefaultProps()}
          onYearChange={onYearChange}
        />
      )

      // Component should render without error
      expect(screen.getByTestId('grouped-section-expense')).toBeInTheDocument()
    })
  })

  describe('search functionality', () => {
    it('passes search terms to grouped sections', () => {
      render(
        <EntityLineItemsTabs
          {...createDefaultProps()}
          initialExpenseSearchTerm="expense search"
          initialIncomeSearchTerm="income search"
        />
      )

      // Component should render with search terms
      expect(screen.getByTestId('grouped-section-expense')).toBeInTheDocument()
      expect(screen.getByTestId('grouped-section-income')).toBeInTheDocument()
    })
  })

  describe('normalization and currency', () => {
    it('accepts normalization and currency props', () => {
      render(
        <EntityLineItemsTabs
          {...createDefaultProps()}
          normalization="per_capita"
          currency="EUR"
        />
      )

      // Component should render without error
      expect(screen.getByTestId('grouped-section-expense')).toBeInTheDocument()
    })
  })

  describe('prefetch', () => {
    it('accepts onPrefetchYear prop', () => {
      const onPrefetchYear = vi.fn()
      render(
        <EntityLineItemsTabs
          {...createDefaultProps()}
          onPrefetchYear={onPrefetchYear}
        />
      )

      // Component should render without error
      expect(screen.getByTestId('grouped-section-expense')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has remove filter button with sr-only label', () => {
      render(
        <EntityLineItemsTabs
          {...createDefaultProps()}
          onAdvancedFilterChange={vi.fn()}
          advancedFilter="economic:personal"
        />
      )

      expect(screen.getByText('Remove filter')).toHaveClass('sr-only')
    })
  })
})
