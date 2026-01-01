/**
 * SelectedOptionsDisplay Component Tests
 *
 * This file tests the SelectedOptionsDisplay component which renders
 * selected filter options as badges with remove functionality.
 *
 * Pattern: Filter Component Testing
 * - Test empty state
 * - Test compact vs expanded view
 * - Test badge interactions
 * - Test clear/toggle actions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { SelectedOptionsDisplay } from './SelectedOptionsDisplay'
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

// ============================================================================
// TEST DATA
// ============================================================================

const createOption = (id: string, label: string): OptionItem => ({
  id,
  label,
})

const singleOption = [createOption('1', 'Option 1')]
const twoOptions = [createOption('1', 'Option 1'), createOption('2', 'Option 2')]
const threeOptions = [
  createOption('1', 'Option 1'),
  createOption('2', 'Option 2'),
  createOption('3', 'Option 3'),
]
const manyOptions = [
  createOption('1', 'Option 1'),
  createOption('2', 'Option 2'),
  createOption('3', 'Option 3'),
  createOption('4', 'Option 4'),
  createOption('5', 'Option 5'),
]

// ============================================================================
// TESTS
// ============================================================================

describe('SelectedOptionsDisplay', () => {
  const mockToggleSelect = vi.fn()
  const mockClearSelection = vi.fn()
  const mockSetShowAllSelected = vi.fn()

  const defaultProps = {
    toggleSelect: mockToggleSelect,
    clearSelection: mockClearSelection,
    showAllSelected: false,
    setShowAllSelected: mockSetShowAllSelected,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('empty state', () => {
    it('returns null when no options selected', () => {
      const { container } = render(
        <SelectedOptionsDisplay {...defaultProps} selectedOptions={[]} />
      )

      expect(container.firstChild).toBeNull()
    })
  })

  describe('single option', () => {
    it('renders single selected option', () => {
      render(
        <SelectedOptionsDisplay {...defaultProps} selectedOptions={singleOption} />
      )

      expect(screen.getByText('Option 1')).toBeInTheDocument()
    })

    it('displays count of 1', () => {
      render(
        <SelectedOptionsDisplay {...defaultProps} selectedOptions={singleOption} />
      )

      // Text is split across multiple elements by Trans component
      const header = screen.getByText(/Selected/).closest('span')
      expect(header?.textContent).toContain('1')
    })

    it('does not show show all/less button for single item', () => {
      render(
        <SelectedOptionsDisplay {...defaultProps} selectedOptions={singleOption} />
      )

      expect(screen.queryByText('Show all')).not.toBeInTheDocument()
      expect(screen.queryByText('Show less')).not.toBeInTheDocument()
    })
  })

  describe('two options', () => {
    it('renders both options without compact view', () => {
      render(
        <SelectedOptionsDisplay {...defaultProps} selectedOptions={twoOptions} />
      )

      expect(screen.getByText('Option 1')).toBeInTheDocument()
      expect(screen.getByText('Option 2')).toBeInTheDocument()
    })

    it('displays count of 2', () => {
      render(
        <SelectedOptionsDisplay {...defaultProps} selectedOptions={twoOptions} />
      )

      // Text is split across multiple elements by Trans component
      const header = screen.getByText(/Selected/).closest('span')
      expect(header?.textContent).toContain('2')
    })

    it('does not show show all/less button for two items', () => {
      render(
        <SelectedOptionsDisplay {...defaultProps} selectedOptions={twoOptions} />
      )

      expect(screen.queryByText('Show all')).not.toBeInTheDocument()
    })
  })

  describe('compact view (more than 2 options)', () => {
    it('shows compact view with +X more badge when collapsed', () => {
      render(
        <SelectedOptionsDisplay
          {...defaultProps}
          selectedOptions={threeOptions}
          showAllSelected={false}
        />
      )

      expect(screen.getByText('Option 1')).toBeInTheDocument()
      // +X more badge accessible name is computed from text content
      const moreBadge = screen.getByRole('button', { name: /\+2 more/ })
      expect(moreBadge).toBeInTheDocument()
    })

    it('shows all options when expanded', () => {
      render(
        <SelectedOptionsDisplay
          {...defaultProps}
          selectedOptions={threeOptions}
          showAllSelected={true}
        />
      )

      expect(screen.getByText('Option 1')).toBeInTheDocument()
      expect(screen.getByText('Option 2')).toBeInTheDocument()
      expect(screen.getByText('Option 3')).toBeInTheDocument()
      // No +X more badge when expanded
      expect(screen.queryByRole('button', { name: /\+\d+ more/ })).not.toBeInTheDocument()
    })

    it('shows Show all button when collapsed', () => {
      render(
        <SelectedOptionsDisplay
          {...defaultProps}
          selectedOptions={threeOptions}
          showAllSelected={false}
        />
      )

      expect(screen.getByText('Show all')).toBeInTheDocument()
    })

    it('shows Show less button when expanded', () => {
      render(
        <SelectedOptionsDisplay
          {...defaultProps}
          selectedOptions={threeOptions}
          showAllSelected={true}
        />
      )

      expect(screen.getByText('Show less')).toBeInTheDocument()
    })

    it('calls setShowAllSelected when Show all clicked', () => {
      render(
        <SelectedOptionsDisplay
          {...defaultProps}
          selectedOptions={threeOptions}
          showAllSelected={false}
        />
      )

      fireEvent.click(screen.getByText('Show all'))
      expect(mockSetShowAllSelected).toHaveBeenCalledWith(true)
    })

    it('calls setShowAllSelected when Show less clicked', () => {
      render(
        <SelectedOptionsDisplay
          {...defaultProps}
          selectedOptions={threeOptions}
          showAllSelected={true}
        />
      )

      fireEvent.click(screen.getByText('Show less'))
      expect(mockSetShowAllSelected).toHaveBeenCalledWith(false)
    })

    it('expands when +X more badge is clicked', () => {
      render(
        <SelectedOptionsDisplay
          {...defaultProps}
          selectedOptions={manyOptions}
          showAllSelected={false}
        />
      )

      // Click the +4 more badge
      const moreBadge = screen.getByRole('button', { name: /\+4 more/ })
      fireEvent.click(moreBadge)
      expect(mockSetShowAllSelected).toHaveBeenCalledWith(true)
    })

    it('expands when +X more badge Enter key pressed', () => {
      render(
        <SelectedOptionsDisplay
          {...defaultProps}
          selectedOptions={manyOptions}
          showAllSelected={false}
        />
      )

      const moreBadge = screen.getByRole('button', { name: /\+4 more/ })
      fireEvent.keyDown(moreBadge, { key: 'Enter' })
      expect(mockSetShowAllSelected).toHaveBeenCalledWith(true)
    })

    it('expands when +X more badge Space key pressed', () => {
      render(
        <SelectedOptionsDisplay
          {...defaultProps}
          selectedOptions={manyOptions}
          showAllSelected={false}
        />
      )

      const moreBadge = screen.getByRole('button', { name: /\+4 more/ })
      fireEvent.keyDown(moreBadge, { key: ' ' })
      expect(mockSetShowAllSelected).toHaveBeenCalledWith(true)
    })
  })

  describe('clear selection', () => {
    it('renders Clear button', () => {
      render(
        <SelectedOptionsDisplay {...defaultProps} selectedOptions={singleOption} />
      )

      expect(screen.getByText('Clear')).toBeInTheDocument()
    })

    it('calls clearSelection when Clear clicked', () => {
      render(
        <SelectedOptionsDisplay {...defaultProps} selectedOptions={singleOption} />
      )

      fireEvent.click(screen.getByText('Clear'))
      expect(mockClearSelection).toHaveBeenCalled()
    })
  })

  describe('remove individual option', () => {
    it('renders remove button for each badge', () => {
      render(
        <SelectedOptionsDisplay
          {...defaultProps}
          selectedOptions={twoOptions}
          showAllSelected={true}
        />
      )

      expect(screen.getByLabelText('Remove Option 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Remove Option 2')).toBeInTheDocument()
    })

    it('calls toggleSelect when remove button clicked', () => {
      render(
        <SelectedOptionsDisplay {...defaultProps} selectedOptions={singleOption} />
      )

      fireEvent.click(screen.getByLabelText('Remove Option 1'))
      expect(mockToggleSelect).toHaveBeenCalledWith(singleOption[0])
    })

    it('calls toggleSelect in compact view', () => {
      render(
        <SelectedOptionsDisplay
          {...defaultProps}
          selectedOptions={threeOptions}
          showAllSelected={false}
        />
      )

      fireEvent.click(screen.getByLabelText('Remove Option 1'))
      expect(mockToggleSelect).toHaveBeenCalledWith(threeOptions[0])
    })
  })

  describe('styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <SelectedOptionsDisplay
          {...defaultProps}
          selectedOptions={singleOption}
          className="custom-class"
        />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('renders badges with truncated labels', () => {
      render(
        <SelectedOptionsDisplay {...defaultProps} selectedOptions={singleOption} />
      )

      const labelSpan = screen.getByText('Option 1')
      expect(labelSpan).toHaveClass('truncate')
    })

    it('sets title attribute on badge label', () => {
      render(
        <SelectedOptionsDisplay {...defaultProps} selectedOptions={singleOption} />
      )

      const labelSpan = screen.getByText('Option 1')
      expect(labelSpan).toHaveAttribute('title', 'Option 1')
    })
  })

  describe('accessibility', () => {
    it('has aria-live on toggle button', () => {
      render(
        <SelectedOptionsDisplay
          {...defaultProps}
          selectedOptions={threeOptions}
          showAllSelected={false}
        />
      )

      const toggleButton = screen.getByText('Show all').closest('button')
      expect(toggleButton).toHaveAttribute('aria-live', 'polite')
    })

    it('has aria-label on remove buttons', () => {
      render(
        <SelectedOptionsDisplay {...defaultProps} selectedOptions={singleOption} />
      )

      expect(screen.getByLabelText('Remove Option 1')).toBeInTheDocument()
    })

    it('+X more badge has tabIndex for keyboard navigation', () => {
      render(
        <SelectedOptionsDisplay
          {...defaultProps}
          selectedOptions={threeOptions}
          showAllSelected={false}
        />
      )

      const moreBadge = screen.getByRole('button', { name: /\+2 more/ })
      expect(moreBadge).toHaveAttribute('tabIndex', '0')
    })
  })
})
