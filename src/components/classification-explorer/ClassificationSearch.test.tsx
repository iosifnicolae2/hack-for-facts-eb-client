/**
 * ClassificationSearch Component Tests
 *
 * This file tests the ClassificationSearch component which provides
 * a search input for filtering classifications.
 *
 * Pattern: Form Component Testing
 * - Test input rendering and placeholder
 * - Test search term display
 * - Test clear button visibility
 * - Test callback invocations
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { ClassificationSearch } from './ClassificationSearch'
import type { ClassificationSearchState } from '@/types/classification-explorer'

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

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Search: () => <span data-testid="search-icon" />,
  X: () => <span data-testid="x-icon" />,
}))

// ============================================================================
// TEST DATA
// ============================================================================

const createSearchState = (
  overrides: Partial<ClassificationSearchState> = {}
): ClassificationSearchState => ({
  searchTerm: '',
  debouncedSearchTerm: '',
  setSearchTerm: vi.fn(),
  clearSearch: vi.fn(),
  isSearching: false,
  ...overrides,
})

// ============================================================================
// TESTS
// ============================================================================

describe('ClassificationSearch', () => {
  describe('input rendering', () => {
    it('renders search input', () => {
      const searchState = createSearchState()
      render(<ClassificationSearch searchState={searchState} />)

      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('renders search icon', () => {
      const searchState = createSearchState()
      render(<ClassificationSearch searchState={searchState} />)

      expect(screen.getByTestId('search-icon')).toBeInTheDocument()
    })

    it('displays placeholder text', () => {
      const searchState = createSearchState()
      render(<ClassificationSearch searchState={searchState} />)

      expect(
        screen.getByPlaceholderText('Search by code or name...')
      ).toBeInTheDocument()
    })

    it('displays search term value', () => {
      const searchState = createSearchState({ searchTerm: 'education' })
      render(<ClassificationSearch searchState={searchState} />)

      expect(screen.getByRole('textbox')).toHaveValue('education')
    })
  })

  describe('clear button', () => {
    it('does not show clear button when search term is empty', () => {
      const searchState = createSearchState({ searchTerm: '' })
      render(<ClassificationSearch searchState={searchState} />)

      expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument()
    })

    it('shows clear button when search term exists', () => {
      const searchState = createSearchState({ searchTerm: 'test' })
      render(<ClassificationSearch searchState={searchState} />)

      expect(screen.getByTestId('x-icon')).toBeInTheDocument()
    })

    it('calls clearSearch when clear button is clicked', () => {
      const clearSearch = vi.fn()
      const searchState = createSearchState({
        searchTerm: 'test',
        clearSearch,
      })
      render(<ClassificationSearch searchState={searchState} />)

      const clearButton = screen.getByRole('button')
      fireEvent.click(clearButton)

      expect(clearSearch).toHaveBeenCalledOnce()
    })

    it('has accessible label for clear button', () => {
      const searchState = createSearchState({ searchTerm: 'test' })
      render(<ClassificationSearch searchState={searchState} />)

      expect(screen.getByText('Clear search')).toBeInTheDocument()
    })
  })

  describe('input events', () => {
    it('calls setSearchTerm on input change', () => {
      const setSearchTerm = vi.fn()
      const searchState = createSearchState({ setSearchTerm })
      render(<ClassificationSearch searchState={searchState} />)

      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'new search' } })

      expect(setSearchTerm).toHaveBeenCalledWith('new search')
    })
  })

  describe('results count', () => {
    it('does not show results count when searchTerm is empty', () => {
      const searchState = createSearchState({ searchTerm: '' })
      render(
        <ClassificationSearch searchState={searchState} resultsCount={5} />
      )

      expect(screen.queryByText(/results found/)).not.toBeInTheDocument()
    })

    it('does not show results count when resultsCount is undefined', () => {
      const searchState = createSearchState({ searchTerm: 'test' })
      render(<ClassificationSearch searchState={searchState} />)

      expect(screen.queryByText(/results found/)).not.toBeInTheDocument()
    })

    it('shows results count when both searchTerm and resultsCount exist', () => {
      const searchState = createSearchState({ searchTerm: 'test' })
      render(
        <ClassificationSearch searchState={searchState} resultsCount={5} />
      )

      expect(screen.getByText('5 results found')).toBeInTheDocument()
    })

    it('shows zero results', () => {
      const searchState = createSearchState({ searchTerm: 'test' })
      render(
        <ClassificationSearch searchState={searchState} resultsCount={0} />
      )

      expect(screen.getByText('0 results found')).toBeInTheDocument()
    })
  })
})
