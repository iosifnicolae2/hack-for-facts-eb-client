/**
 * FilterContainer Component Tests
 *
 * This file tests the FilterContainer component which wraps
 * filter content with accordion, title, and selected options display.
 *
 * Pattern: Container Component Testing
 * - Test accordion behavior
 * - Test clear functionality
 * - Test badge count
 * - Test defaultOpen prop
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { FilterContainer } from './FilterContainer'
import type { OptionItem } from './interfaces'

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

// Mock SelectedOptionsDisplay
vi.mock('./SelectedOptionsDisplay', () => ({
  SelectedOptionsDisplay: ({
    selectedOptions,
    toggleSelect,
    clearSelection,
  }: {
    selectedOptions: OptionItem[]
    toggleSelect: (option: OptionItem) => void
    clearSelection: () => void
  }) => (
    <div data-testid="selected-options-display">
      {selectedOptions.map((opt) => (
        <div key={opt.id} data-testid={`selected-${opt.id}`}>
          <span>{opt.label}</span>
          <button
            onClick={() => toggleSelect(opt)}
            data-testid={`remove-${opt.id}`}
          >
            Remove
          </button>
        </div>
      ))}
      {selectedOptions.length > 0 && (
        <button onClick={clearSelection} data-testid="clear-selection">
          Clear
        </button>
      )}
    </div>
  ),
}))

// ============================================================================
// TEST DATA
// ============================================================================

const TestIcon = () => <span data-testid="test-icon">🔍</span>

const option1: OptionItem = { id: 'opt-1', label: 'Option 1' }
const option2: OptionItem = { id: 'opt-2', label: 'Option 2' }
const option3: OptionItem = { id: 'opt-3', label: 'Option 3' }

// ============================================================================
// TESTS
// ============================================================================

describe('FilterContainer', () => {
  const mockOnClearOption = vi.fn()
  const mockOnClearAll = vi.fn()

  const defaultProps = {
    title: 'Test Filter',
    icon: <TestIcon />,
    children: <div data-testid="filter-content">Filter Content</div>,
    selectedOptions: [] as OptionItem[],
    onClearOption: mockOnClearOption,
    onClearAll: mockOnClearAll,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders accordion with title', () => {
      render(<FilterContainer {...defaultProps} />)

      expect(screen.getByText('Test Filter')).toBeInTheDocument()
    })

    it('renders icon', () => {
      render(<FilterContainer {...defaultProps} />)

      expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    })

    it('renders children when accordion is open', () => {
      render(<FilterContainer {...defaultProps} />)

      // Open accordion
      fireEvent.click(screen.getByText('Test Filter'))

      expect(screen.getByTestId('filter-content')).toBeInTheDocument()
    })

    it('renders selected options display', () => {
      render(<FilterContainer {...defaultProps} />)

      expect(screen.getByTestId('selected-options-display')).toBeInTheDocument()
    })
  })

  describe('defaultOpen prop', () => {
    it('accordion is closed by default', () => {
      render(<FilterContainer {...defaultProps} />)

      // Content should not be visible initially
      expect(screen.queryByTestId('filter-content')).not.toBeInTheDocument()
    })

    it('accordion is open when defaultOpen is true', () => {
      render(<FilterContainer {...defaultProps} defaultOpen={true} />)

      // Content should be visible
      expect(screen.getByTestId('filter-content')).toBeInTheDocument()
    })

    it('accordion is closed when defaultOpen is false', () => {
      render(<FilterContainer {...defaultProps} defaultOpen={false} />)

      expect(screen.queryByTestId('filter-content')).not.toBeInTheDocument()
    })
  })

  describe('badge count', () => {
    it('does not show badge when no items selected', () => {
      render(<FilterContainer {...defaultProps} selectedOptions={[]} />)

      // No badge should be visible
      expect(screen.queryByText('1')).not.toBeInTheDocument()
    })

    it('shows badge with count 1 when one item selected', () => {
      render(<FilterContainer {...defaultProps} selectedOptions={[option1]} />)

      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('shows badge with count 2 when two items selected', () => {
      render(
        <FilterContainer
          {...defaultProps}
          selectedOptions={[option1, option2]}
        />
      )

      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('shows badge with count 3 when three items selected', () => {
      render(
        <FilterContainer
          {...defaultProps}
          selectedOptions={[option1, option2, option3]}
        />
      )

      expect(screen.getByText('3')).toBeInTheDocument()
    })
  })

  describe('accordion behavior', () => {
    it('toggles accordion content on click', () => {
      render(<FilterContainer {...defaultProps} />)

      // Content not visible initially
      expect(screen.queryByTestId('filter-content')).not.toBeInTheDocument()

      // Click to open
      fireEvent.click(screen.getByText('Test Filter'))
      expect(screen.getByTestId('filter-content')).toBeInTheDocument()

      // Click to close
      fireEvent.click(screen.getByText('Test Filter'))
      // Content should be hidden after toggle
    })

    it('can open after starting closed', () => {
      render(<FilterContainer {...defaultProps} defaultOpen={false} />)

      fireEvent.click(screen.getByText('Test Filter'))

      expect(screen.getByTestId('filter-content')).toBeInTheDocument()
    })

    it('can close after starting open', () => {
      render(<FilterContainer {...defaultProps} defaultOpen={true} />)

      expect(screen.getByTestId('filter-content')).toBeInTheDocument()

      fireEvent.click(screen.getByText('Test Filter'))
      // Content should be hidden
    })
  })

  describe('clearing options', () => {
    it('calls onClearOption when remove button clicked', () => {
      render(<FilterContainer {...defaultProps} selectedOptions={[option1]} />)

      fireEvent.click(screen.getByTestId('remove-opt-1'))

      expect(mockOnClearOption).toHaveBeenCalledWith(option1)
    })

    it('calls onClearOption with correct option', () => {
      render(
        <FilterContainer
          {...defaultProps}
          selectedOptions={[option1, option2]}
        />
      )

      fireEvent.click(screen.getByTestId('remove-opt-2'))

      expect(mockOnClearOption).toHaveBeenCalledWith(option2)
    })

    it('calls onClearAll when clear button clicked', () => {
      render(<FilterContainer {...defaultProps} selectedOptions={[option1]} />)

      fireEvent.click(screen.getByTestId('clear-selection'))

      expect(mockOnClearAll).toHaveBeenCalled()
    })
  })

  describe('selected options display', () => {
    it('shows selected option labels', () => {
      render(<FilterContainer {...defaultProps} selectedOptions={[option1]} />)

      expect(screen.getByText('Option 1')).toBeInTheDocument()
    })

    it('shows all selected options', () => {
      render(
        <FilterContainer
          {...defaultProps}
          selectedOptions={[option1, option2]}
        />
      )

      expect(screen.getByText('Option 1')).toBeInTheDocument()
      expect(screen.getByText('Option 2')).toBeInTheDocument()
    })

    it('does not show clear button when no options selected', () => {
      render(<FilterContainer {...defaultProps} selectedOptions={[]} />)

      expect(screen.queryByTestId('clear-selection')).not.toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('handles empty selectedOptions array', () => {
      render(<FilterContainer {...defaultProps} selectedOptions={[]} />)

      expect(screen.getByTestId('selected-options-display')).toBeInTheDocument()
      expect(screen.queryByTestId('clear-selection')).not.toBeInTheDocument()
    })

    it('renders custom children content', () => {
      render(
        <FilterContainer {...defaultProps}>
          <input data-testid="custom-input" placeholder="Custom" />
        </FilterContainer>
      )

      fireEvent.click(screen.getByText('Test Filter'))
      expect(screen.getByTestId('custom-input')).toBeInTheDocument()
    })

    it('renders multiple children elements', () => {
      render(
        <FilterContainer {...defaultProps}>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </FilterContainer>
      )

      fireEvent.click(screen.getByText('Test Filter'))
      expect(screen.getByTestId('child-1')).toBeInTheDocument()
      expect(screen.getByTestId('child-2')).toBeInTheDocument()
    })
  })
})
