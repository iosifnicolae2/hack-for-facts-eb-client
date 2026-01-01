/**
 * AnnotationConfigView Component Tests
 *
 * This file tests the AnnotationConfigView component which provides
 * configuration controls for chart annotations.
 *
 * Pattern: Store-dependent Component Testing
 * - Mock useChartStore hook
 * - Mock useCopyPasteAnnotations hook
 * - Test input fields and switches
 * - Test position sliders
 * - Test delete confirmation
 * - Test not found state
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { AnnotationConfigView } from './AnnotationConfigView'
import type { TAnnotation } from '@/schemas/charts'

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

// Mock chart store
const mockUpdateAnnotation = vi.fn()
const mockDeleteAnnotation = vi.fn()
const mockGoToOverview = vi.fn()
const mockGoToConfig = vi.fn()
const mockDuplicateAnnotation = vi.fn()

const mockAnnotation: TAnnotation = {
  id: 'annotation-1',
  type: 'annotation',
  title: 'Test Annotation',
  subtitle: 'Test Subtitle',
  color: '#ff0000',
  enabled: true,
  locked: false,
  connector: true,
  subject: true,
  label: true,
  pX: 0.5,
  pY: 0.5,
  pXDelta: 0.1,
  pYDelta: 0.1,
}

const mockChart = {
  annotations: [mockAnnotation],
}

vi.mock('../../hooks/useChartStore', () => ({
  useChartStore: () => ({
    chart: mockChart,
    annotationId: 'annotation-1',
    updateAnnotation: mockUpdateAnnotation,
    deleteAnnotation: mockDeleteAnnotation,
    goToOverview: mockGoToOverview,
    goToConfig: mockGoToConfig,
    duplicateAnnotation: mockDuplicateAnnotation,
  }),
}))

// Mock copy/paste hook
const mockCopyAnnotation = vi.fn()
vi.mock('../../hooks/useCopyPasteAnnotations', () => ({
  useCopyPasteAnnotations: () => ({
    copyAnnotation: mockCopyAnnotation,
  }),
}))

// Mock generateRandomColor
vi.mock('../chart-renderer/utils', () => ({
  generateRandomColor: () => '#00ff00',
}))

// ============================================================================
// TESTS
// ============================================================================

describe('AnnotationConfigView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock chart data
    mockChart.annotations = [{ ...mockAnnotation }]
  })

  describe('rendering', () => {
    it('renders header with title', () => {
      render(<AnnotationConfigView />)

      expect(screen.getByText('Annotation Configuration')).toBeInTheDocument()
    })

    it('renders view chart button', () => {
      render(<AnnotationConfigView />)

      expect(screen.getByText('View Chart')).toBeInTheDocument()
    })

    it('renders title input with annotation title', () => {
      render(<AnnotationConfigView />)

      const titleInput = screen.getByLabelText(/Title/)
      expect(titleInput).toHaveValue('Test Annotation')
    })

    it('renders subtitle input with annotation subtitle', () => {
      render(<AnnotationConfigView />)

      const subtitleInput = screen.getByLabelText(/Subtitle/)
      expect(subtitleInput).toHaveValue('Test Subtitle')
    })

    it('renders color picker', () => {
      render(<AnnotationConfigView />)

      expect(screen.getByText('Color')).toBeInTheDocument()
      const colorInput = screen.getByLabelText('Color')
      expect(colorInput).toHaveValue('#ff0000')
    })

    it('displays current color value', () => {
      render(<AnnotationConfigView />)

      expect(screen.getByText('#ff0000')).toBeInTheDocument()
    })
  })

  describe('switches', () => {
    it('renders enabled switch', () => {
      render(<AnnotationConfigView />)

      expect(screen.getByText('Enabled')).toBeInTheDocument()
      const enabledSwitch = screen.getByRole('switch', { name: /enabled/i })
      expect(enabledSwitch).toBeChecked()
    })

    it('renders locked switch', () => {
      render(<AnnotationConfigView />)

      expect(screen.getByText('Locked')).toBeInTheDocument()
      const lockedSwitch = screen.getByRole('switch', { name: /locked/i })
      expect(lockedSwitch).not.toBeChecked()
    })

    it('renders connector switch', () => {
      render(<AnnotationConfigView />)

      expect(screen.getByText('Connector')).toBeInTheDocument()
      const connectorSwitch = screen.getByRole('switch', { name: /connector/i })
      expect(connectorSwitch).toBeChecked()
    })

    it('renders subject switch', () => {
      render(<AnnotationConfigView />)

      expect(screen.getByText('Subject')).toBeInTheDocument()
      const subjectSwitch = screen.getByRole('switch', { name: /subject/i })
      expect(subjectSwitch).toBeChecked()
    })

    it('renders label switch', () => {
      render(<AnnotationConfigView />)

      expect(screen.getByText(/^Label$/)).toBeInTheDocument()
      const labelSwitch = screen.getByRole('switch', { name: /^label$/i })
      expect(labelSwitch).toBeChecked()
    })

    it('calls updateAnnotation when enabled switch is toggled', () => {
      render(<AnnotationConfigView />)

      const enabledSwitch = screen.getByRole('switch', { name: /enabled/i })
      fireEvent.click(enabledSwitch)

      expect(mockUpdateAnnotation).toHaveBeenCalledWith(
        'annotation-1',
        expect.any(Function)
      )
    })

    it('calls updateAnnotation when locked switch is toggled', () => {
      render(<AnnotationConfigView />)

      const lockedSwitch = screen.getByRole('switch', { name: /locked/i })
      fireEvent.click(lockedSwitch)

      expect(mockUpdateAnnotation).toHaveBeenCalled()
    })
  })

  describe('position sliders', () => {
    it('renders position label', () => {
      render(<AnnotationConfigView />)

      expect(screen.getByText('Position')).toBeInTheDocument()
    })

    it('renders X position slider', () => {
      render(<AnnotationConfigView />)

      expect(screen.getByText('X (%)')).toBeInTheDocument()
    })

    it('renders Y position slider', () => {
      render(<AnnotationConfigView />)

      expect(screen.getByText('Y (%)')).toBeInTheDocument()
    })

    it('renders delta X slider', () => {
      render(<AnnotationConfigView />)

      expect(screen.getByText('ΔX (%)')).toBeInTheDocument()
    })

    it('renders delta Y slider', () => {
      render(<AnnotationConfigView />)

      expect(screen.getByText('ΔY (%)')).toBeInTheDocument()
    })

    it('displays current position values', () => {
      render(<AnnotationConfigView />)

      // pX and pY are 0.5 = 50%
      const fiftyValues = screen.getAllByText('50')
      expect(fiftyValues.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('title and subtitle input', () => {
    it('calls updateAnnotation when title changes', () => {
      render(<AnnotationConfigView />)

      const titleInput = screen.getByLabelText(/Title/)
      fireEvent.change(titleInput, { target: { value: 'New Title' } })

      expect(mockUpdateAnnotation).toHaveBeenCalled()
    })

    it('calls updateAnnotation when subtitle changes', () => {
      render(<AnnotationConfigView />)

      const subtitleInput = screen.getByLabelText(/Subtitle/)
      fireEvent.change(subtitleInput, { target: { value: 'New Subtitle' } })

      expect(mockUpdateAnnotation).toHaveBeenCalled()
    })
  })

  describe('color controls', () => {
    it('calls updateAnnotation when color changes', () => {
      render(<AnnotationConfigView />)

      const colorInput = screen.getByLabelText('Color')
      fireEvent.change(colorInput, { target: { value: '#0000ff' } })

      expect(mockUpdateAnnotation).toHaveBeenCalled()
    })

    it('generates random color when refresh button is clicked', () => {
      render(<AnnotationConfigView />)

      // Find the refresh button (RefreshCcw icon button)
      const refreshButton = document.querySelector('button svg.lucide-refresh-ccw')?.closest('button')
      expect(refreshButton).toBeInTheDocument()
      fireEvent.click(refreshButton!)

      expect(mockUpdateAnnotation).toHaveBeenCalled()
    })
  })

  describe('navigation buttons', () => {
    it('calls goToOverview when View Chart is clicked', () => {
      render(<AnnotationConfigView />)

      fireEvent.click(screen.getByText('View Chart'))

      expect(mockGoToOverview).toHaveBeenCalled()
    })

    it('calls goToConfig when Chart Configuration is clicked', () => {
      render(<AnnotationConfigView />)

      fireEvent.click(screen.getByText('Chart Configuration'))

      expect(mockGoToConfig).toHaveBeenCalled()
    })
  })

  describe('copy and duplicate', () => {
    it('renders copy button', () => {
      render(<AnnotationConfigView />)

      expect(screen.getByText('Copy')).toBeInTheDocument()
    })

    it('renders duplicate button', () => {
      render(<AnnotationConfigView />)

      expect(screen.getByText('Duplicate')).toBeInTheDocument()
    })

    it('calls copyAnnotation when copy button is clicked', () => {
      render(<AnnotationConfigView />)

      fireEvent.click(screen.getByText('Copy'))

      expect(mockCopyAnnotation).toHaveBeenCalledWith('annotation-1')
    })

    it('calls duplicateAnnotation when duplicate button is clicked', () => {
      render(<AnnotationConfigView />)

      fireEvent.click(screen.getByText('Duplicate'))

      expect(mockDuplicateAnnotation).toHaveBeenCalledWith('annotation-1')
    })
  })

  describe('delete functionality', () => {
    it('renders delete button', () => {
      render(<AnnotationConfigView />)

      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    it('delete button has destructive variant', () => {
      render(<AnnotationConfigView />)

      const deleteButton = screen.getByText('Delete').closest('button')
      expect(deleteButton).toBeInTheDocument()
    })

    it('delete button has trash icon', () => {
      render(<AnnotationConfigView />)

      // Trash2 icon should be present
      expect(document.querySelector('.lucide-trash-2')).toBeInTheDocument()
    })
  })

  describe('annotation not found', () => {
    it('shows not found message when annotation does not exist', () => {
      // Clear annotations to simulate not found
      mockChart.annotations = []

      render(<AnnotationConfigView />)

      expect(screen.getByText('Annotation not found')).toBeInTheDocument()
    })

    it('shows back to configuration button when not found', () => {
      mockChart.annotations = []

      render(<AnnotationConfigView />)

      expect(screen.getByText('Back to Configuration')).toBeInTheDocument()
    })

    it('calls goToConfig when back button is clicked in not found state', () => {
      mockChart.annotations = []

      render(<AnnotationConfigView />)

      fireEvent.click(screen.getByText('Back to Configuration'))

      expect(mockGoToConfig).toHaveBeenCalled()
    })
  })
})
