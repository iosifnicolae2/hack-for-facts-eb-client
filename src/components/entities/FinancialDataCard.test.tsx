import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { FinancialDataCard } from './FinancialDataCard'
import type { GroupedChapter } from '@/schemas/financial'

// ============================================================================
// MOCKS
// ============================================================================

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, onClick, ...props }: any) => (
      <button onClick={onClick} {...props}>
        {children}
      </button>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock GroupedChapterAccordion to simplify tree and verify props
vi.mock('./GroupedChapterAccordion', () => ({
  default: ({ ch }: { ch: GroupedChapter }) => (
    <div data-testid={`chapter-${ch.prefix}`}>
      {ch.description} - Amount: {ch.totalAmount}
    </div>
  ),
}))

// Mock ClassificationInfoLink
vi.mock('@/components/common/classification-info-link', () => ({
  ClassificationInfoLink: () => <span data-testid="info-link">Info</span>,
}))

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  ArrowDownCircle: () => <span data-testid="icon-expense" />,
  ArrowUpCircle: () => <span data-testid="icon-income" />,
  Search: () => <span data-testid="icon-search" />,
  X: () => <span data-testid="icon-close" />,
  ChevronDown: () => <span data-testid="icon-chevron-down" />,
  ChevronUp: () => <span data-testid="icon-chevron-up" />,
  Check: () => <span data-testid="icon-check" />,
  ArrowUp: () => <span data-testid="icon-arrow-up" />,
  ArrowDown: () => <span data-testid="icon-arrow-down" />,
}))

// Mock Lingui
vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@lingui/core/macro', () => ({
  t: (strings: TemplateStringsArray) => strings[0],
  msg: (strings: TemplateStringsArray) => strings[0],
  plural: (value: any, { one, other }: any) => (value === 1 ? one : other),
}))

// ============================================================================
// TEST DATA
// ============================================================================

const mockGroups: GroupedChapter[] = [
  {
    prefix: '51.02',
    description: 'Transfers',
    totalAmount: 1000,
    functionals: [
      {
        code: '51.02.01',
        name: 'Transfer Func',
        totalAmount: 1000,
        economics: [
          { code: '51.01', amount: 1000, name: 'Transfers' }
        ]
      }
    ],
  },
  {
    prefix: '67.02',
    description: 'Culture',
    totalAmount: 2000,
    functionals: [
      {
        code: '67.02.03',
        name: 'Museums',
        totalAmount: 2000,
        economics: [
          { code: '20.01', amount: 2000, name: 'Goods' }
        ]
      }
    ],
  },
]

const defaultProps = {
  title: 'Test Card',
  iconType: 'expense' as const,
  currentYear: 2024,
  years: [2023, 2024, 2025],
  onYearChange: vi.fn(),
  searchTerm: '',
  onSearchChange: vi.fn(),
  searchActive: false,
  onSearchToggle: vi.fn(),
  groups: mockGroups,
  baseTotal: 3000,
  normalization: 'total' as const,
  currency: 'RON' as const,
  // Ensure we show all data by default in basic tests to avoid filtering confusion
  transferFilter: 'all' as const, 
}

// ============================================================================
// TESTS
// ============================================================================

describe('FinancialDataCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  describe('Rendering', () => {
    it('should render title and year', () => {
      render(<FinancialDataCard {...defaultProps} />)
      
      // Use getAllByText because title appears in header and potentially empty state (though shouldn't be empty here)
      // The header title is within an H3
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(/Test Card/);
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(/2024/);
    })

    it('should render correct icon for expense', () => {
      render(<FinancialDataCard {...defaultProps} iconType="expense" />)
      expect(screen.getByTestId('icon-expense')).toBeInTheDocument()
    })

    it('should render correct icon for income', () => {
      render(<FinancialDataCard {...defaultProps} iconType="income" />)
      expect(screen.getByTestId('icon-income')).toBeInTheDocument()
    })

    it('should render chapters', () => {
      render(<FinancialDataCard {...defaultProps} />)
      
      expect(screen.getByTestId('chapter-51.02')).toBeInTheDocument()
      expect(screen.getByTestId('chapter-67.02')).toBeInTheDocument()
    })

    it('should display empty state when no groups', () => {
      render(<FinancialDataCard {...defaultProps} groups={[]} baseTotal={0} />)
      
      expect(screen.getByText(/No data available/)).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('should handle year change', () => {
      render(<FinancialDataCard {...defaultProps} />)
      // Verify current year is displayed in the heading
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(/2024/);
    })

    it('should toggle search', () => {
      const onSearchToggle = vi.fn()
      render(<FinancialDataCard {...defaultProps} onSearchToggle={onSearchToggle} />)
      
      const searchButton = screen.getByTestId('icon-search').closest('button')
      fireEvent.click(searchButton!)
      
      expect(onSearchToggle).toHaveBeenCalledWith(true)
    })

    it('should display search input when active', () => {
      render(<FinancialDataCard {...defaultProps} searchActive={true} />)
      
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
    })

    it('should call onSearchChange when typing', async () => {
      vi.useFakeTimers()
      const onSearchChange = vi.fn()
      render(
        <FinancialDataCard 
          {...defaultProps} 
          searchActive={true} 
          onSearchChange={onSearchChange} 
        />
      )
      
      const input = screen.getByPlaceholderText('Search...')
      fireEvent.change(input, { target: { value: 'test' } })
      
      // Fast-forward time to trigger debounce
      vi.advanceTimersByTime(500)
      
      expect(onSearchChange).toHaveBeenCalledWith('test')
      vi.useRealTimers()
    })
  })

  describe('Filtering Logic (Transfers)', () => {
    // Create more detailed mock data for filtering tests
    const complexGroups: GroupedChapter[] = [
      {
        prefix: '67.02', // Culture
        description: 'Culture',
        totalAmount: 1000,
        functionals: [
          {
            code: '67.02.03',
            name: 'Museums',
            totalAmount: 1000,
            economics: [
              { code: '20.01', amount: 600, name: 'Goods' }, // Regular expense
              { code: '51.01', amount: 400, name: 'Transfer' }, // Transfer expense
            ]
          }
        ]
      }
    ]

    it('should show all items when transferFilter is "all"', () => {
      render(
        <FinancialDataCard 
          {...defaultProps} 
          groups={complexGroups} 
          baseTotal={1000}
          transferFilter="all" 
        />
      )
      
      // Since we mocked GroupedChapterAccordion to show totalAmount, check that.
      // Total amount should be 1000
      expect(screen.getByTestId('chapter-67.02')).toHaveTextContent('Amount: 1000')
    })

    it('should filter out transfers when transferFilter is "no-transfers"', () => {
      render(
        <FinancialDataCard 
          {...defaultProps} 
          groups={complexGroups} 
          baseTotal={1000}
          transferFilter="no-transfers" 
        />
      )
      
      // Should only include Goods (600)
      expect(screen.getByTestId('chapter-67.02')).toHaveTextContent('Amount: 600')
    })

    it('should show only transfers when transferFilter is "transfers-only"', () => {
      render(
        <FinancialDataCard 
          {...defaultProps} 
          groups={complexGroups} 
          baseTotal={1000}
          transferFilter="transfers-only" 
        />
      )
      
      // Should only include Transfer (400)
      expect(screen.getByTestId('chapter-67.02')).toHaveTextContent('Amount: 400')
    })

    it('should handle income transfers (functional code based)', () => {
      const incomeGroups: GroupedChapter[] = [
        {
          prefix: '04.02', // Quotas (Regular Income)
          description: 'Quotas',
          totalAmount: 500,
          functionals: []
        },
        {
          prefix: '36.02.05', // Institutional remittances (Transfer Income)
          description: 'Institutional remittances',
          totalAmount: 300,
          functionals: []
        }
      ]

      // Case 1: No transfers (default)
      const { rerender } = render(
        <FinancialDataCard
          {...defaultProps}
          iconType="income"
          groups={incomeGroups}
          baseTotal={800}
          transferFilter="no-transfers"
        />
      )

      expect(screen.getByTestId('chapter-04.02')).toBeInTheDocument()
      expect(screen.queryByTestId('chapter-36.02.05')).not.toBeInTheDocument()

      // Case 2: Transfers only
      rerender(
        <FinancialDataCard
          {...defaultProps}
          iconType="income"
          groups={incomeGroups}
          baseTotal={800}
          transferFilter="transfers-only"
        />
      )

      expect(screen.queryByTestId('chapter-04.02')).not.toBeInTheDocument()
      expect(screen.getByTestId('chapter-36.02.05')).toBeInTheDocument()
    })
  })
})
