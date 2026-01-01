/**
 * FilterRadioContainer Component Tests
 *
 * This file tests the FilterRadioContainer component which wraps
 * radio/single-selection filter content with accordion and selected option display.
 *
 * Pattern: Container Component Testing
 * - Test accordion behavior
 * - Test single selection display
 * - Test clear functionality
 * - Test defaultOpen prop
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { FilterRadioContainer } from './FilterRadioContainer'
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
    toggleSelect: () => void
    clearSelection: () => void
  }) => (
    <div data-testid="selected-options-display">
      {selectedOptions.map((opt) => (
        <div key={opt.id} data-testid={`selected-${opt.id}`}>
          <span>{opt.label}</span>
          <button onClick={toggleSelect} data-testid={`remove-${opt.id}`}>
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

const TestIcon = () => <span data-testid="test-icon">📻</span>

const option1: OptionItem = { id: 'opt-1', label: 'Option 1' }
const option2: OptionItem = { id: 'opt-2', label: 'Option 2' }

// ============================================================================
// TESTS
// ============================================================================

describe('FilterRadioContainer', () => {
  const mockOnClear = vi.fn()

  const defaultProps = {
    title: 'Test Radio Filter',
    icon: <TestIcon />,
    children: <div data-testid="filter-content">Radio Options</div>,
    selectedOption: null as OptionItem | null,
    onClear: mockOnClear,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders accordion with title', () => {
      render(<FilterRadioContainer {...defaultProps} />)

      expect(screen.getByText('Test Radio Filter')).toBeInTheDocument()
    })

    it('renders icon', () => {
      render(<FilterRadioContainer {...defaultProps} />)

      expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    })

    it('renders children when accordion is open', () => {
      render(<FilterRadioContainer {...defaultProps} />)

      // Open accordion
      fireEvent.click(screen.getByText('Test Radio Filter'))

      expect(screen.getByTestId('filter-content')).toBeInTheDocument()
    })

    it('renders selected options display', () => {
      render(<FilterRadioContainer {...defaultProps} />)

      expect(screen.getByTestId('selected-options-display')).toBeInTheDocument()
    })
  })

  describe('defaultOpen prop', () => {
    it('accordion is closed by default', () => {
      render(<FilterRadioContainer {...defaultProps} />)

      expect(screen.queryByTestId('filter-content')).not.toBeInTheDocument()
    })

    it('accordion is open when defaultOpen is true', () => {
      render(<FilterRadioContainer {...defaultProps} defaultOpen={true} />)

      expect(screen.getByTestId('filter-content')).toBeInTheDocument()
    })

    it('accordion is closed when defaultOpen is false', () => {
      render(<FilterRadioContainer {...defaultProps} defaultOpen={false} />)

      expect(screen.queryByTestId('filter-content')).not.toBeInTheDocument()
    })
  })

  describe('badge count', () => {
    it('does not show badge when no option selected', () => {
      render(<FilterRadioContainer {...defaultProps} selectedOption={null} />)

      expect(screen.queryByText('1')).not.toBeInTheDocument()
    })

    it('shows badge with count 1 when option is selected', () => {
      render(
        <FilterRadioContainer {...defaultProps} selectedOption={option1} />
      )

      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('badge count is always 1 for single selection', () => {
      render(
        <FilterRadioContainer {...defaultProps} selectedOption={option2} />
      )

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.queryByText('2')).not.toBeInTheDocument()
    })
  })

  describe('accordion behavior', () => {
    it('toggles accordion content on click', () => {
      render(<FilterRadioContainer {...defaultProps} />)

      expect(screen.queryByTestId('filter-content')).not.toBeInTheDocument()

      // Click to open
      fireEvent.click(screen.getByText('Test Radio Filter'))
      expect(screen.getByTestId('filter-content')).toBeInTheDocument()

      // Click to close
      fireEvent.click(screen.getByText('Test Radio Filter'))
    })

    it('can open after starting closed', () => {
      render(<FilterRadioContainer {...defaultProps} defaultOpen={false} />)

      fireEvent.click(screen.getByText('Test Radio Filter'))

      expect(screen.getByTestId('filter-content')).toBeInTheDocument()
    })

    it('can close after starting open', () => {
      render(<FilterRadioContainer {...defaultProps} defaultOpen={true} />)

      expect(screen.getByTestId('filter-content')).toBeInTheDocument()

      fireEvent.click(screen.getByText('Test Radio Filter'))
    })
  })

  describe('clearing selection', () => {
    it('calls onClear when remove button clicked', () => {
      render(
        <FilterRadioContainer {...defaultProps} selectedOption={option1} />
      )

      fireEvent.click(screen.getByTestId('remove-opt-1'))

      expect(mockOnClear).toHaveBeenCalled()
    })

    it('calls onClear when clear button clicked', () => {
      render(
        <FilterRadioContainer {...defaultProps} selectedOption={option1} />
      )

      fireEvent.click(screen.getByTestId('clear-selection'))

      expect(mockOnClear).toHaveBeenCalled()
    })

    it('onClear is called only once per click', () => {
      render(
        <FilterRadioContainer {...defaultProps} selectedOption={option1} />
      )

      fireEvent.click(screen.getByTestId('clear-selection'))

      expect(mockOnClear).toHaveBeenCalledTimes(1)
    })
  })

  describe('selected options display', () => {
    it('shows selected option label when option is selected', () => {
      render(
        <FilterRadioContainer {...defaultProps} selectedOption={option1} />
      )

      expect(screen.getByText('Option 1')).toBeInTheDocument()
    })

    it('shows different option when changed', () => {
      render(
        <FilterRadioContainer {...defaultProps} selectedOption={option2} />
      )

      expect(screen.getByText('Option 2')).toBeInTheDocument()
    })

    it('does not show clear button when no option selected', () => {
      render(<FilterRadioContainer {...defaultProps} selectedOption={null} />)

      expect(screen.queryByTestId('clear-selection')).not.toBeInTheDocument()
    })

    it('shows clear button when option is selected', () => {
      render(
        <FilterRadioContainer {...defaultProps} selectedOption={option1} />
      )

      expect(screen.getByTestId('clear-selection')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('handles null selectedOption', () => {
      render(<FilterRadioContainer {...defaultProps} selectedOption={null} />)

      expect(screen.getByTestId('selected-options-display')).toBeInTheDocument()
      expect(screen.queryByTestId('selected-opt-1')).not.toBeInTheDocument()
    })

    it('renders custom children content', () => {
      render(
        <FilterRadioContainer {...defaultProps}>
          <input
            type="radio"
            data-testid="custom-radio"
            name="test"
            value="1"
          />
        </FilterRadioContainer>
      )

      fireEvent.click(screen.getByText('Test Radio Filter'))
      expect(screen.getByTestId('custom-radio')).toBeInTheDocument()
    })

    it('renders multiple children elements', () => {
      render(
        <FilterRadioContainer {...defaultProps}>
          <div data-testid="radio-1">Radio 1</div>
          <div data-testid="radio-2">Radio 2</div>
        </FilterRadioContainer>
      )

      fireEvent.click(screen.getByText('Test Radio Filter'))
      expect(screen.getByTestId('radio-1')).toBeInTheDocument()
      expect(screen.getByTestId('radio-2')).toBeInTheDocument()
    })
  })
})
