/**
 * ChartDataError Component Tests
 *
 * This file tests the ChartDataError component which displays
 * validation errors and warnings for chart data.
 *
 * Pattern: Self-contained Component Testing
 * - No external hooks or stores to mock
 * - Test rendering states (error vs warning)
 * - Test expand/collapse functionality
 * - Test clipboard copy functionality
 * - Test dismiss callback
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/test-utils'
import { ChartDataError } from './ChartDataError'
import type { ValidationResult, DataValidationError } from '@/lib/chart-data-validation'

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

// Mock clipboard API
const mockClipboardWriteText = vi.fn()
Object.assign(navigator, {
  clipboard: {
    writeText: mockClipboardWriteText,
  },
})

// ============================================================================
// TEST DATA FACTORIES
// ============================================================================

const createError = (
  overrides: Partial<DataValidationError> = {}
): DataValidationError => ({
  type: 'invalid_x_value',
  seriesId: 'series-1',
  message: 'Invalid X value detected',
  ...overrides,
})

const createWarning = (
  overrides: Partial<DataValidationError> = {}
): DataValidationError => ({
  type: 'auto_adjusted_value',
  seriesId: 'series-1',
  message: 'Value was auto-adjusted',
  ...overrides,
})

const createValidResult = (): ValidationResult => ({
  isValid: true,
  errors: [],
  warnings: [],
})

const createErrorResult = (errorCount = 1): ValidationResult => ({
  isValid: false,
  errors: Array.from({ length: errorCount }, (_, i) =>
    createError({ seriesId: `series-${i + 1}` })
  ),
  warnings: [],
})

const createWarningResult = (warningCount = 1): ValidationResult => ({
  isValid: true,
  errors: [],
  warnings: Array.from({ length: warningCount }, (_, i) =>
    createWarning({ seriesId: `series-${i + 1}` })
  ),
})

const createMixedResult = (
  errorCount = 1,
  warningCount = 1
): ValidationResult => ({
  isValid: false,
  errors: Array.from({ length: errorCount }, (_, i) =>
    createError({ seriesId: `error-series-${i + 1}` })
  ),
  warnings: Array.from({ length: warningCount }, (_, i) =>
    createWarning({ seriesId: `warning-series-${i + 1}` })
  ),
})

// ============================================================================
// TESTS
// ============================================================================

describe('ChartDataError', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockClipboardWriteText.mockResolvedValue(undefined)
  })

  describe('visibility', () => {
    it('returns null when valid and no warnings', () => {
      const { container } = render(
        <ChartDataError validationResult={createValidResult()} />
      )

      expect(container.firstChild).toBeNull()
    })

    it('renders when there are errors', () => {
      render(<ChartDataError validationResult={createErrorResult()} />)

      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('renders when there are only warnings', () => {
      render(<ChartDataError validationResult={createWarningResult()} />)

      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('displays error title when errors exist', () => {
      render(<ChartDataError validationResult={createErrorResult()} />)

      expect(screen.getByText('Chart Data Error')).toBeInTheDocument()
    })

    it('displays error description', () => {
      render(<ChartDataError validationResult={createErrorResult()} />)

      expect(screen.getByText('Invalid data detected in chart series')).toBeInTheDocument()
    })

    it('shows error count badge', () => {
      render(<ChartDataError validationResult={createErrorResult(3)} />)

      expect(screen.getByText('3 errors')).toBeInTheDocument()
    })

    it('shows singular error text for one error', () => {
      render(<ChartDataError validationResult={createErrorResult(1)} />)

      expect(screen.getByText('1 error')).toBeInTheDocument()
    })

    it('shows AlertTriangle icon for errors', () => {
      render(<ChartDataError validationResult={createErrorResult()} />)

      // AlertTriangle icon should be present (identified by class)
      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
    })
  })

  describe('warning state', () => {
    it('displays warning title when only warnings exist', () => {
      render(<ChartDataError validationResult={createWarningResult()} />)

      expect(screen.getByText('Chart Data Warning')).toBeInTheDocument()
    })

    it('displays warning description', () => {
      render(<ChartDataError validationResult={createWarningResult()} />)

      expect(screen.getByText('Some data issues were automatically resolved')).toBeInTheDocument()
    })

    it('shows warning count badge', () => {
      render(<ChartDataError validationResult={createWarningResult(2)} />)

      expect(screen.getByText('2 warnings')).toBeInTheDocument()
    })

    it('shows singular warning text for one warning', () => {
      render(<ChartDataError validationResult={createWarningResult(1)} />)

      expect(screen.getByText('1 warning')).toBeInTheDocument()
    })
  })

  describe('mixed state (errors and warnings)', () => {
    it('prioritizes error styling when both exist', () => {
      render(<ChartDataError validationResult={createMixedResult(2, 3)} />)

      // Should show error title, not warning
      expect(screen.getByText('Chart Data Error')).toBeInTheDocument()
    })

    it('shows both error and warning badges', () => {
      render(<ChartDataError validationResult={createMixedResult(2, 3)} />)

      expect(screen.getByText('2 errors')).toBeInTheDocument()
      expect(screen.getByText('3 warnings')).toBeInTheDocument()
    })

    it('shows total issue count badge', () => {
      render(<ChartDataError validationResult={createMixedResult(2, 3)} />)

      expect(screen.getByText('5 issues')).toBeInTheDocument()
    })
  })

  describe('expand/collapse', () => {
    it('shows "Show details" button by default', () => {
      render(<ChartDataError validationResult={createWarningResult()} />)

      expect(screen.getByText('Show details')).toBeInTheDocument()
    })

    it('toggles to "Hide details" when expanded', () => {
      render(<ChartDataError validationResult={createWarningResult()} />)

      fireEvent.click(screen.getByText('Show details'))

      expect(screen.getByText('Hide details')).toBeInTheDocument()
    })

    it('starts expanded when showDetails prop is true', () => {
      render(
        <ChartDataError
          validationResult={createWarningResult()}
          showDetails={true}
        />
      )

      expect(screen.getByText('Hide details')).toBeInTheDocument()
    })

    it('always shows details when there are errors (even if collapsed)', () => {
      render(<ChartDataError validationResult={createErrorResult()} />)

      // Error details should be visible even without expanding
      expect(screen.getByText('Errors')).toBeInTheDocument()
    })
  })

  describe('issue grouping', () => {
    it('groups issues by type', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: [
          createError({ type: 'invalid_x_value', seriesId: 'series-1' }),
          createError({ type: 'invalid_x_value', seriesId: 'series-2' }),
          createError({ type: 'missing_data', seriesId: 'series-3' }),
        ],
        warnings: [],
      }

      render(<ChartDataError validationResult={result} />)

      // Should show type labels with counts
      expect(screen.getByText('Invalid X value (2)')).toBeInTheDocument()
      expect(screen.getByText('Missing data (1)')).toBeInTheDocument()
    })

    it('displays series ID for each issue', () => {
      render(<ChartDataError validationResult={createErrorResult()} />)

      expect(screen.getByText('series-1')).toBeInTheDocument()
    })

    it('displays point index when provided', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: [createError({ pointIndex: 5 })],
        warnings: [],
      }

      render(<ChartDataError validationResult={result} />)

      expect(screen.getByText('@ 5')).toBeInTheDocument()
    })

    it('displays value when provided', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: [createError({ value: 'invalid-value' })],
        warnings: [],
      }

      render(<ChartDataError validationResult={result} />)

      expect(screen.getByText('invalid-value')).toBeInTheDocument()
    })

    it('formats complex values as JSON', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: [createError({ value: { nested: 'object' } })],
        warnings: [],
      }

      render(<ChartDataError validationResult={result} />)

      expect(screen.getByText('{"nested":"object"}')).toBeInTheDocument()
    })

    it('handles null values', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: [createError({ value: null })],
        warnings: [],
      }

      render(<ChartDataError validationResult={result} />)

      expect(screen.getByText('null')).toBeInTheDocument()
    })
  })

  describe('clipboard copy', () => {
    it('calls clipboard API when copy button is clicked', async () => {
      render(<ChartDataError validationResult={createErrorResult()} />)

      const copyButton = screen.getByText('Copy')
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(mockClipboardWriteText).toHaveBeenCalled()
      })
    })

    it('shows "Copied!" feedback after successful copy', async () => {
      render(<ChartDataError validationResult={createErrorResult()} />)

      fireEvent.click(screen.getByText('Copy'))

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument()
      })
    })

    it('shows "Error" feedback on copy failure', async () => {
      mockClipboardWriteText.mockRejectedValueOnce(new Error('Copy failed'))

      render(<ChartDataError validationResult={createErrorResult()} />)

      fireEvent.click(screen.getByText('Copy'))

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument()
      })
    })

    it('disables copy button during feedback', async () => {
      render(<ChartDataError validationResult={createErrorResult()} />)

      const copyButton = screen.getByText('Copy')
      fireEvent.click(copyButton)

      await waitFor(() => {
        const copiedButton = screen.getByText('Copied!').closest('button')
        expect(copiedButton).toBeDisabled()
      })
    })

    it('generates correct report format', async () => {
      const result: ValidationResult = {
        isValid: false,
        errors: [
          createError({
            type: 'invalid_x_value',
            seriesId: 'test-series',
            message: 'Bad X',
            pointIndex: 3,
            value: 'bad-value',
          }),
        ],
        warnings: [],
      }

      render(<ChartDataError validationResult={result} />)

      fireEvent.click(screen.getByText('Copy'))

      await waitFor(() => {
        const reportText = mockClipboardWriteText.mock.calls[0][0]
        expect(reportText).toContain('Chart data issues: 1')
        expect(reportText).toContain('Errors (1):')
        expect(reportText).toContain('[invalid_x_value]')
        expect(reportText).toContain('test-series')
        expect(reportText).toContain('@3')
        expect(reportText).toContain('value=bad-value')
      })
    })
  })

  describe('dismiss functionality', () => {
    it('renders dismiss button when onDismiss is provided', () => {
      const onDismiss = vi.fn()

      render(
        <ChartDataError
          validationResult={createErrorResult()}
          onDismiss={onDismiss}
        />
      )

      // X button should be present
      const buttons = screen.getAllByRole('button')
      const dismissButton = buttons.find((btn) =>
        btn.querySelector('svg.lucide-x')
      )
      expect(dismissButton).toBeInTheDocument()
    })

    it('does not render dismiss button when onDismiss is not provided', () => {
      render(<ChartDataError validationResult={createErrorResult()} />)

      // Should not have X button
      const buttons = screen.getAllByRole('button')
      const dismissButton = buttons.find((btn) =>
        btn.querySelector('svg.lucide-x')
      )
      expect(dismissButton).toBeUndefined()
    })

    it('calls onDismiss when dismiss button is clicked', () => {
      const onDismiss = vi.fn()

      render(
        <ChartDataError
          validationResult={createErrorResult()}
          onDismiss={onDismiss}
        />
      )

      const buttons = screen.getAllByRole('button')
      const dismissButton = buttons.find((btn) =>
        btn.querySelector('svg.lucide-x')
      )
      fireEvent.click(dismissButton!)

      expect(onDismiss).toHaveBeenCalledTimes(1)
    })
  })

  describe('auto-fix note', () => {
    it('shows auto-fix note for warnings without errors', () => {
      render(<ChartDataError validationResult={createWarningResult()} showDetails />)

      expect(
        screen.getByText(
          'These issues were auto-resolved (invalid points removed or values set to 0) so the chart could render.'
        )
      ).toBeInTheDocument()
    })

    it('does not show auto-fix note when errors exist', () => {
      render(<ChartDataError validationResult={createMixedResult(1, 1)} />)

      expect(
        screen.queryByText(/These issues were auto-resolved/)
      ).not.toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has role="alert"', () => {
      render(<ChartDataError validationResult={createErrorResult()} />)

      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('has aria-live="polite"', () => {
      render(<ChartDataError validationResult={createErrorResult()} />)

      const alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('aria-live', 'polite')
    })

    it('copy button has appropriate aria-label', () => {
      render(<ChartDataError validationResult={createErrorResult()} />)

      const copyButton = screen.getByText('Copy').closest('button')
      expect(copyButton).toHaveAttribute('aria-label', 'Copy error report to clipboard')
    })
  })
})
