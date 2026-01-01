/**
 * ListContainer Component Tests
 *
 * This file tests the ListContainer component which provides
 * a scrollable container for filter lists with loading/empty states.
 *
 * Pattern: Container Component Testing
 * - Test loading states
 * - Test empty states
 * - Test accessibility attributes
 * - Test ref forwarding
 */

import { createRef } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { ListContainer } from './ListContainer'

// ============================================================================
// MOCKS
// ============================================================================

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@lingui/core/macro', () => ({
  t: (strings: TemplateStringsArray) => strings[0],
  msg: (strings: TemplateStringsArray) => strings[0],
}))

// Mock loading spinner
vi.mock('./LoadingSpinner', () => ({
  LoadingSpinner: ({ text }: { text: string }) => (
    <div data-testid="loading-spinner">{text}</div>
  ),
}))

// Mock no results
vi.mock('./NoResults', () => ({
  NoResults: ({ message }: { message: string }) => (
    <div data-testid="no-results">{message}</div>
  ),
}))

// Mock empty list
vi.mock('./EmptyList', () => ({
  EmptyList: ({ message }: { message: string }) => (
    <div data-testid="empty-list">{message}</div>
  ),
}))

// Mock keyboard navigation hook
vi.mock('@/hooks/useListKeyboardNavigation', () => ({
  useListKeyboardNavigation: () => ({
    activeDescendant: 'item-1',
    handleKeyDown: vi.fn(),
    handleMouseDown: vi.fn(),
  }),
}))

// ============================================================================
// TESTS
// ============================================================================

describe('ListContainer', () => {
  const defaultProps = {
    height: 300,
    isFetchingNextPage: false,
    isLoading: false,
    isSearchResultsEmpty: false,
    isEmpty: false,
    children: <div data-testid="list-content">List Content</div>,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders children', () => {
      render(<ListContainer {...defaultProps} />)

      expect(screen.getByTestId('list-content')).toBeInTheDocument()
    })

    it('renders with correct height', () => {
      render(<ListContainer {...defaultProps} height={500} />)

      const innerContainer = screen.getByTestId('list-content').parentElement
      expect(innerContainer).toHaveStyle({ height: '500px' })
    })

    it('renders with default aria-label', () => {
      render(<ListContainer {...defaultProps} />)

      expect(screen.getByRole('listbox')).toHaveAttribute(
        'aria-label',
        'Filter options'
      )
    })

    it('renders with custom aria-label', () => {
      render(<ListContainer {...defaultProps} ariaLabel="Custom Options" />)

      expect(screen.getByRole('listbox')).toHaveAttribute(
        'aria-label',
        'Custom Options'
      )
    })
  })

  describe('accessibility', () => {
    it('has listbox role', () => {
      render(<ListContainer {...defaultProps} />)

      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('has aria-multiselectable attribute', () => {
      render(<ListContainer {...defaultProps} />)

      expect(screen.getByRole('listbox')).toHaveAttribute(
        'aria-multiselectable',
        'true'
      )
    })

    it('has aria-activedescendant from hook', () => {
      render(<ListContainer {...defaultProps} />)

      expect(screen.getByRole('listbox')).toHaveAttribute(
        'aria-activedescendant',
        'item-1'
      )
    })

    it('has tabIndex 0 for keyboard focus', () => {
      render(<ListContainer {...defaultProps} />)

      expect(screen.getByRole('listbox')).toHaveAttribute('tabIndex', '0')
    })
  })

  describe('loading state', () => {
    it('shows loading spinner when isLoading is true', () => {
      render(<ListContainer {...defaultProps} isLoading={true} />)

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('does not show loading spinner when isLoading is false', () => {
      render(<ListContainer {...defaultProps} isLoading={false} />)

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })
  })

  describe('fetching next page state', () => {
    it('shows loading spinner when isFetchingNextPage is true', () => {
      render(<ListContainer {...defaultProps} isFetchingNextPage={true} />)

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      expect(screen.getByText('Loading more...')).toBeInTheDocument()
    })

    it('does not show fetching spinner when isFetchingNextPage is false', () => {
      render(<ListContainer {...defaultProps} isFetchingNextPage={false} />)

      expect(screen.queryByText('Loading more...')).not.toBeInTheDocument()
    })
  })

  describe('empty states', () => {
    it('shows no results message when isSearchResultsEmpty is true', () => {
      render(<ListContainer {...defaultProps} isSearchResultsEmpty={true} />)

      expect(screen.getByTestId('no-results')).toBeInTheDocument()
      expect(screen.getByText('No results found.')).toBeInTheDocument()
    })

    it('does not show no results when isSearchResultsEmpty is false', () => {
      render(<ListContainer {...defaultProps} isSearchResultsEmpty={false} />)

      expect(screen.queryByTestId('no-results')).not.toBeInTheDocument()
    })

    it('shows empty list message when isEmpty is true', () => {
      render(<ListContainer {...defaultProps} isEmpty={true} />)

      expect(screen.getByTestId('empty-list')).toBeInTheDocument()
      expect(screen.getByText('List is empty.')).toBeInTheDocument()
    })

    it('does not show empty message when isEmpty is false', () => {
      render(<ListContainer {...defaultProps} isEmpty={false} />)

      expect(screen.queryByTestId('empty-list')).not.toBeInTheDocument()
    })
  })

  describe('ref forwarding', () => {
    it('forwards ref to container div', () => {
      const ref = createRef<HTMLDivElement>()

      render(<ListContainer {...defaultProps} ref={ref} />)

      expect(ref.current).toBeInstanceOf(HTMLDivElement)
      expect(ref.current).toHaveAttribute('role', 'listbox')
    })
  })

  describe('className props', () => {
    it('applies custom className', () => {
      render(<ListContainer {...defaultProps} className="custom-class" />)

      expect(screen.getByRole('listbox')).toHaveClass('custom-class')
    })

    it('applies listClassName to inner container', () => {
      render(<ListContainer {...defaultProps} listClassName="inner-class" />)

      const innerContainer = screen.getByTestId('list-content').parentElement
      expect(innerContainer).toHaveClass('inner-class')
    })

    it('maintains default classes with custom className', () => {
      render(<ListContainer {...defaultProps} className="custom-class" />)

      const container = screen.getByRole('listbox')
      expect(container).toHaveClass('h-64')
      expect(container).toHaveClass('overflow-auto')
      expect(container).toHaveClass('border')
      expect(container).toHaveClass('rounded-md')
      expect(container).toHaveClass('custom-class')
    })
  })

  describe('multiple states', () => {
    it('can show both loading and fetching next page', () => {
      render(
        <ListContainer
          {...defaultProps}
          isLoading={true}
          isFetchingNextPage={true}
        />
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.getByText('Loading more...')).toBeInTheDocument()
    })

    it('still renders children with loading state', () => {
      render(<ListContainer {...defaultProps} isLoading={true} />)

      expect(screen.getByTestId('list-content')).toBeInTheDocument()
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('displayName', () => {
    it('has correct displayName', () => {
      expect(ListContainer.displayName).toBe('ListContainer')
    })
  })
})
