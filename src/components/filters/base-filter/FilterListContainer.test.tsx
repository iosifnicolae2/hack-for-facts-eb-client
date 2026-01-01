/**
 * FilterListContainer Component Tests
 *
 * This file tests the FilterListContainer component which wraps
 * list filter components with accordion, title, and selected options display.
 *
 * Pattern: Container Component Testing
 * - Test accordion behavior
 * - Test selection toggle
 * - Test clear functionality
 * - Test badge count
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { FilterListContainer } from './FilterListContainer'
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

const MockListComponent = ({
  selectedOptions,
  toggleSelect,
}: {
  selectedOptions: OptionItem[]
  toggleSelect: (option: OptionItem) => void
  pageSize: number
}) => (
  <div data-testid="list-component">
    <button
      onClick={() => toggleSelect({ id: 'opt-1', label: 'Option 1' })}
      data-testid="toggle-opt-1"
    >
      Toggle Option 1
    </button>
    <button
      onClick={() => toggleSelect({ id: 'opt-2', label: 'Option 2' })}
      data-testid="toggle-opt-2"
    >
      Toggle Option 2
    </button>
    <div data-testid="selected-count">{selectedOptions.length}</div>
  </div>
)

const TestIcon = () => <span data-testid="test-icon">📋</span>

const option1: OptionItem = { id: 'opt-1', label: 'Option 1' }
const option2: OptionItem = { id: 'opt-2', label: 'Option 2' }
const option3: OptionItem = { id: 'opt-3', label: 'Option 3' }

// ============================================================================
// TESTS
// ============================================================================

describe('FilterListContainer', () => {
  const mockSetSelected = vi.fn()

  const defaultProps = {
    title: 'Test List Filter',
    listComponent: MockListComponent,
    icon: <TestIcon />,
    selected: [] as OptionItem[],
    setSelected: mockSetSelected,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders accordion with title', () => {
      render(<FilterListContainer {...defaultProps} />)

      expect(screen.getByText('Test List Filter')).toBeInTheDocument()
    })

    it('renders icon', () => {
      render(<FilterListContainer {...defaultProps} />)

      expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    })

    it('renders list component when accordion is open', () => {
      render(<FilterListContainer {...defaultProps} />)

      // Open accordion
      fireEvent.click(screen.getByText('Test List Filter'))

      expect(screen.getByTestId('list-component')).toBeInTheDocument()
    })

    it('renders selected options display', () => {
      render(<FilterListContainer {...defaultProps} />)

      expect(screen.getByTestId('selected-options-display')).toBeInTheDocument()
    })
  })

  describe('badge count', () => {
    it('does not show badge when no items selected', () => {
      render(<FilterListContainer {...defaultProps} selected={[]} />)

      // No badge should be visible
      expect(screen.queryByText('1')).not.toBeInTheDocument()
      expect(screen.queryByText('2')).not.toBeInTheDocument()
    })

    it('shows badge with count 1 when one item selected', () => {
      render(<FilterListContainer {...defaultProps} selected={[option1]} />)

      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('shows badge with count 2 when two items selected', () => {
      render(
        <FilterListContainer {...defaultProps} selected={[option1, option2]} />
      )

      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('shows badge with count 3 when three items selected', () => {
      render(
        <FilterListContainer
          {...defaultProps}
          selected={[option1, option2, option3]}
        />
      )

      expect(screen.getByText('3')).toBeInTheDocument()
    })
  })

  describe('selection toggle', () => {
    it('calls setSelected with new option when selecting', () => {
      render(<FilterListContainer {...defaultProps} selected={[]} />)

      // Open accordion
      fireEvent.click(screen.getByText('Test List Filter'))

      // Click to select option 1
      fireEvent.click(screen.getByTestId('toggle-opt-1'))

      expect(mockSetSelected).toHaveBeenCalled()
      // Get the callback function and call it to verify behavior
      const callback = mockSetSelected.mock.calls[0][0]
      const result = callback([])
      expect(result).toEqual([{ id: 'opt-1', label: 'Option 1' }])
    })

    it('calls setSelected to remove option when deselecting', () => {
      render(<FilterListContainer {...defaultProps} selected={[option1]} />)

      // Open accordion
      fireEvent.click(screen.getByText('Test List Filter'))

      // Click to deselect option 1
      fireEvent.click(screen.getByTestId('toggle-opt-1'))

      expect(mockSetSelected).toHaveBeenCalled()
      // Get the callback function and call it to verify behavior
      const callback = mockSetSelected.mock.calls[0][0]
      const result = callback([option1])
      expect(result).toEqual([])
    })

    it('adds option to existing selections', () => {
      render(<FilterListContainer {...defaultProps} selected={[option1]} />)

      fireEvent.click(screen.getByText('Test List Filter'))
      fireEvent.click(screen.getByTestId('toggle-opt-2'))

      const callback = mockSetSelected.mock.calls[0][0]
      const result = callback([option1])
      expect(result).toEqual([option1, { id: 'opt-2', label: 'Option 2' }])
    })
  })

  describe('removing options via SelectedOptionsDisplay', () => {
    it('removes option when remove button clicked', () => {
      render(<FilterListContainer {...defaultProps} selected={[option1]} />)

      fireEvent.click(screen.getByTestId('remove-opt-1'))

      expect(mockSetSelected).toHaveBeenCalled()
      const callback = mockSetSelected.mock.calls[0][0]
      const result = callback([option1])
      expect(result).toEqual([])
    })

    it('removes specific option from multiple selections', () => {
      render(
        <FilterListContainer {...defaultProps} selected={[option1, option2]} />
      )

      fireEvent.click(screen.getByTestId('remove-opt-1'))

      const callback = mockSetSelected.mock.calls[0][0]
      const result = callback([option1, option2])
      expect(result).toEqual([option2])
    })
  })

  describe('clearing selection', () => {
    it('clears all selections when clear button clicked', () => {
      render(
        <FilterListContainer {...defaultProps} selected={[option1, option2]} />
      )

      fireEvent.click(screen.getByTestId('clear-selection'))

      expect(mockSetSelected).toHaveBeenCalled()
      const callback = mockSetSelected.mock.calls[0][0]
      const result = callback([option1, option2])
      expect(result).toEqual([])
    })
  })

  describe('accordion behavior', () => {
    it('toggles accordion content on click', () => {
      render(<FilterListContainer {...defaultProps} />)

      // Click to open
      fireEvent.click(screen.getByText('Test List Filter'))
      expect(screen.getByTestId('list-component')).toBeInTheDocument()

      // Click to close
      fireEvent.click(screen.getByText('Test List Filter'))
      // Content should be hidden
    })
  })

  describe('list component integration', () => {
    it('passes selectedOptions to list component', () => {
      render(
        <FilterListContainer {...defaultProps} selected={[option1, option2]} />
      )

      fireEvent.click(screen.getByText('Test List Filter'))

      expect(screen.getByTestId('selected-count')).toHaveTextContent('2')
    })

    it('passes pageSize of 100 to list component', () => {
      const ListWithPageSize = ({ pageSize }: { pageSize: number }) => (
        <div data-testid="page-size">{pageSize}</div>
      )

      render(
        <FilterListContainer
          {...defaultProps}
          listComponent={ListWithPageSize as any}
        />
      )

      fireEvent.click(screen.getByText('Test List Filter'))
      expect(screen.getByTestId('page-size')).toHaveTextContent('100')
    })
  })

  describe('selected options display', () => {
    it('shows selected option labels', () => {
      render(<FilterListContainer {...defaultProps} selected={[option1]} />)

      expect(screen.getByText('Option 1')).toBeInTheDocument()
    })

    it('shows all selected options', () => {
      render(
        <FilterListContainer {...defaultProps} selected={[option1, option2]} />
      )

      expect(screen.getByText('Option 1')).toBeInTheDocument()
      expect(screen.getByText('Option 2')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('handles empty selected array', () => {
      render(<FilterListContainer {...defaultProps} selected={[]} />)

      expect(
        screen.queryByTestId('clear-selection')
      ).not.toBeInTheDocument()
    })

    it('handles selecting same option twice (no duplicate)', () => {
      render(<FilterListContainer {...defaultProps} selected={[option1]} />)

      fireEvent.click(screen.getByText('Test List Filter'))
      fireEvent.click(screen.getByTestId('toggle-opt-1'))

      // Should remove the option, not add duplicate
      const callback = mockSetSelected.mock.calls[0][0]
      const result = callback([option1])
      expect(result).toEqual([])
    })
  })
})
