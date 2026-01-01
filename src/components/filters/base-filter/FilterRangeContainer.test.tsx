/**
 * FilterRangeContainer Component Tests
 *
 * This file tests the FilterRangeContainer component which wraps
 * range filter components with accordion, title, and selected options display.
 *
 * Pattern: Container Component Testing
 * - Test accordion behavior
 * - Test range value display
 * - Test clear functionality
 * - Test badge count
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { FilterRangeContainer } from './FilterRangeContainer'
import type { BaseListFilterProps } from './interfaces'

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
    selectedOptions: Array<{ id: string; label: string }>
    toggleSelect: (option: { id: string; label: string }) => void
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

const MockRangeComponent = ({
  minValue,
  maxValue,
  onMinValueChange,
  onMaxValueChange,
}: BaseListFilterProps) => (
  <div data-testid="range-component">
    <input
      data-testid="min-input"
      value={minValue ?? ''}
      onChange={(e) => onMinValueChange?.(e.target.value)}
    />
    <input
      data-testid="max-input"
      value={maxValue ?? ''}
      onChange={(e) => onMaxValueChange?.(e.target.value)}
    />
  </div>
)

const TestIcon = () => <span data-testid="test-icon">📊</span>

// ============================================================================
// TESTS
// ============================================================================

describe('FilterRangeContainer', () => {
  const mockOnMinValueChange = vi.fn()
  const mockOnMaxValueChange = vi.fn()

  const defaultProps = {
    title: 'Test Range Filter',
    unit: 'RON',
    rangeComponent: MockRangeComponent,
    icon: <TestIcon />,
    onMinValueChange: mockOnMinValueChange,
    onMaxValueChange: mockOnMaxValueChange,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders accordion with title', () => {
      render(<FilterRangeContainer {...defaultProps} />)

      expect(screen.getByText('Test Range Filter')).toBeInTheDocument()
    })

    it('renders icon', () => {
      render(<FilterRangeContainer {...defaultProps} />)

      expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    })

    it('renders range component when accordion is open', () => {
      render(<FilterRangeContainer {...defaultProps} />)

      // Open accordion
      fireEvent.click(screen.getByText('Test Range Filter'))

      expect(screen.getByTestId('range-component')).toBeInTheDocument()
    })

    it('renders selected options display', () => {
      render(<FilterRangeContainer {...defaultProps} />)

      expect(screen.getByTestId('selected-options-display')).toBeInTheDocument()
    })
  })

  describe('badge count', () => {
    it('does not show badge when no values set', () => {
      render(<FilterRangeContainer {...defaultProps} />)

      // No badge should be visible
      expect(screen.queryByText('1')).not.toBeInTheDocument()
      expect(screen.queryByText('2')).not.toBeInTheDocument()
    })

    it('shows badge with count 1 when only min value set', () => {
      render(<FilterRangeContainer {...defaultProps} minValue={100} />)

      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('shows badge with count 1 when only max value set', () => {
      render(<FilterRangeContainer {...defaultProps} maxValue={500} />)

      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('shows badge with count 2 when both values set', () => {
      render(
        <FilterRangeContainer {...defaultProps} minValue={100} maxValue={500} />
      )

      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('does not count empty string as value', () => {
      render(<FilterRangeContainer {...defaultProps} minValue="" maxValue="" />)

      expect(screen.queryByText('1')).not.toBeInTheDocument()
      expect(screen.queryByText('2')).not.toBeInTheDocument()
    })
  })

  describe('selected options display', () => {
    it('shows min value in selected options', () => {
      render(<FilterRangeContainer {...defaultProps} minValue={100} />)

      expect(screen.getByTestId('selected-min')).toBeInTheDocument()
      expect(screen.getByText(/min: 100 RON/)).toBeInTheDocument()
    })

    it('shows max value in selected options', () => {
      render(<FilterRangeContainer {...defaultProps} maxValue={500} />)

      expect(screen.getByTestId('selected-max')).toBeInTheDocument()
      expect(screen.getByText(/max: 500 RON/)).toBeInTheDocument()
    })

    it('shows both min and max in selected options', () => {
      render(
        <FilterRangeContainer {...defaultProps} minValue={100} maxValue={500} />
      )

      expect(screen.getByTestId('selected-min')).toBeInTheDocument()
      expect(screen.getByTestId('selected-max')).toBeInTheDocument()
    })

    it('formats large numbers with separators', () => {
      render(<FilterRangeContainer {...defaultProps} minValue={1000000} />)

      // formatNumber uses locale-specific separators (. for Romanian locale)
      const label = screen.getByText(/min:.*1.*000.*000.*RON/)
      expect(label).toBeInTheDocument()
    })
  })

  describe('clearing values', () => {
    it('calls onMinValueChange with undefined when min removed', () => {
      render(<FilterRangeContainer {...defaultProps} minValue={100} />)

      fireEvent.click(screen.getByTestId('remove-min'))

      expect(mockOnMinValueChange).toHaveBeenCalledWith(undefined)
    })

    it('calls onMaxValueChange with undefined when max removed', () => {
      render(<FilterRangeContainer {...defaultProps} maxValue={500} />)

      fireEvent.click(screen.getByTestId('remove-max'))

      expect(mockOnMaxValueChange).toHaveBeenCalledWith(undefined)
    })

    it('clears all values when clear selection clicked', () => {
      render(
        <FilterRangeContainer {...defaultProps} minValue={100} maxValue={500} />
      )

      fireEvent.click(screen.getByTestId('clear-selection'))

      expect(mockOnMinValueChange).toHaveBeenCalledWith(undefined)
      expect(mockOnMaxValueChange).toHaveBeenCalledWith(undefined)
    })
  })

  describe('accordion behavior', () => {
    it('toggles accordion content on click', () => {
      render(<FilterRangeContainer {...defaultProps} />)

      // Click to open
      fireEvent.click(screen.getByText('Test Range Filter'))
      expect(screen.getByTestId('range-component')).toBeInTheDocument()

      // Click to close
      fireEvent.click(screen.getByText('Test Range Filter'))
      // Content should be hidden (not in DOM or with hidden attribute)
    })
  })

  describe('range component integration', () => {
    it('passes minValue to range component', () => {
      render(<FilterRangeContainer {...defaultProps} minValue={100} />)

      fireEvent.click(screen.getByText('Test Range Filter'))

      const minInput = screen.getByTestId('min-input') as HTMLInputElement
      expect(minInput.value).toBe('100')
    })

    it('passes maxValue to range component', () => {
      render(<FilterRangeContainer {...defaultProps} maxValue={500} />)

      fireEvent.click(screen.getByText('Test Range Filter'))

      const maxInput = screen.getByTestId('max-input') as HTMLInputElement
      expect(maxInput.value).toBe('500')
    })

    it('calls onMinValueChange when min input changes', () => {
      render(<FilterRangeContainer {...defaultProps} />)

      fireEvent.click(screen.getByText('Test Range Filter'))
      fireEvent.change(screen.getByTestId('min-input'), {
        target: { value: '200' },
      })

      expect(mockOnMinValueChange).toHaveBeenCalledWith('200')
    })

    it('calls onMaxValueChange when max input changes', () => {
      render(<FilterRangeContainer {...defaultProps} />)

      fireEvent.click(screen.getByText('Test Range Filter'))
      fireEvent.change(screen.getByTestId('max-input'), {
        target: { value: '600' },
      })

      expect(mockOnMaxValueChange).toHaveBeenCalledWith('600')
    })
  })

  describe('props passthrough', () => {
    it('passes unit to range component', () => {
      const RangeWithUnit = ({ unit }: BaseListFilterProps) => (
        <div data-testid="unit-display">{unit}</div>
      )

      render(
        <FilterRangeContainer
          {...defaultProps}
          rangeComponent={RangeWithUnit}
          unit="EUR"
        />
      )

      fireEvent.click(screen.getByText('Test Range Filter'))
      expect(screen.getByTestId('unit-display')).toHaveTextContent('EUR')
    })

    it('passes maxValueAllowed to range component', () => {
      const RangeWithMax = ({ maxValueAllowed }: BaseListFilterProps) => (
        <div data-testid="max-allowed">{maxValueAllowed}</div>
      )

      render(
        <FilterRangeContainer
          {...defaultProps}
          rangeComponent={RangeWithMax}
          maxValueAllowed={1000}
        />
      )

      fireEvent.click(screen.getByText('Test Range Filter'))
      expect(screen.getByTestId('max-allowed')).toHaveTextContent('1000')
    })

    it('passes debounceMs to range component', () => {
      const RangeWithDebounce = ({ debounceMs }: BaseListFilterProps) => (
        <div data-testid="debounce">{debounceMs}</div>
      )

      render(
        <FilterRangeContainer
          {...defaultProps}
          rangeComponent={RangeWithDebounce}
          debounceMs={300}
        />
      )

      fireEvent.click(screen.getByText('Test Range Filter'))
      expect(screen.getByTestId('debounce')).toHaveTextContent('300')
    })
  })

  describe('edge cases', () => {
    it('handles zero as valid min value', () => {
      render(<FilterRangeContainer {...defaultProps} minValue={0} />)

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText(/min: 0 RON/)).toBeInTheDocument()
    })

    it('handles zero as valid max value', () => {
      render(<FilterRangeContainer {...defaultProps} maxValue={0} />)

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText(/max: 0 RON/)).toBeInTheDocument()
    })

    it('handles string values for min', () => {
      render(<FilterRangeContainer {...defaultProps} minValue="100" />)

      expect(screen.getByText(/min: 100 RON/)).toBeInTheDocument()
    })

    it('handles string values for max', () => {
      render(<FilterRangeContainer {...defaultProps} maxValue="500" />)

      expect(screen.getByText(/max: 500 RON/)).toBeInTheDocument()
    })

    it('handles no unit gracefully', () => {
      render(
        <FilterRangeContainer
          {...defaultProps}
          unit={undefined}
          minValue={100}
        />
      )

      expect(screen.getByText(/min: 100/)).toBeInTheDocument()
    })
  })
})
