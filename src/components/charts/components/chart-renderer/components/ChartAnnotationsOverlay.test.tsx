/**
 * ChartAnnotationsOverlay Component Tests
 *
 * This file tests the ChartAnnotationsOverlay component which renders
 * multiple annotations as an overlay on the chart container.
 *
 * Pattern: ResizeObserver + Visx Annotation Testing
 * - Mock ResizeObserver
 * - Mock @visx/annotation components
 * - Test annotations rendering
 * - Test editable vs locked states
 * - Test margin calculations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@/test/test-utils'
import { ChartAnnotationsOverlay } from './ChartAnnotationsOverlay'
import type { TAnnotation } from '@/schemas/charts'

// ============================================================================
// POLYFILLS
// ============================================================================

let resizeCallback: ResizeObserverCallback | null = null

class ResizeObserverMock {
  constructor(callback: ResizeObserverCallback) {
    resizeCallback = callback
  }
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
global.ResizeObserver = ResizeObserverMock

// Helper to simulate resize
const simulateResize = (width: number, height: number) => {
  if (resizeCallback) {
    resizeCallback(
      [{ contentRect: { width, height } } as ResizeObserverEntry],
      {} as ResizeObserver
    )
  }
}

// ============================================================================
// MOCKS
// ============================================================================

// Mock @visx/annotation
let capturedAnnotationProps: any[] = []
let capturedEditableProps: any[] = []

vi.mock('@visx/annotation', () => ({
  Annotation: ({ children, ...props }: any) => {
    capturedAnnotationProps.push(props)
    return <g data-testid="annotation">{children}</g>
  },
  EditableAnnotation: ({ children, onDragEnd, ...props }: any) => {
    capturedEditableProps.push({ ...props, onDragEnd })
    return (
      <g
        data-testid="editable-annotation"
        onClick={() => {
          if (onDragEnd) {
            onDragEnd({ x: 100, y: 100, dx: 50, dy: 50 })
          }
        }}
      >
        {children}
      </g>
    )
  },
  Connector: ({ stroke, type }: { stroke: string; type: string }) => (
    <line data-testid="connector" data-stroke={stroke} data-type={type} />
  ),
  CircleSubject: ({ stroke }: { stroke: string }) => (
    <circle data-testid="circle-subject" data-stroke={stroke} />
  ),
  Label: (props: any) => (
    <text data-testid="label" data-title={props.title}>
      {props.title}
    </text>
  ),
}))

// Mock utils
vi.mock('../utils', () => ({
  applyAlpha: (color: string, alpha: number) => `${color}-alpha-${alpha}`,
}))

// ============================================================================
// TEST DATA
// ============================================================================

const createMockAnnotation = (overrides: Partial<TAnnotation> = {}): TAnnotation => ({
  id: 'annotation-1',
  type: 'annotation',
  enabled: true,
  pX: 0.5,
  pY: 0.5,
  pXDelta: 0.1,
  pYDelta: 0.1,
  color: '#ff0000',
  title: 'Test Annotation',
  subtitle: 'Test Subtitle',
  connector: true,
  subject: true,
  label: true,
  locked: false,
  ...overrides,
})

// ============================================================================
// TESTS
// ============================================================================

describe('ChartAnnotationsOverlay', () => {
  const mockOnPositionChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    capturedAnnotationProps = []
    capturedEditableProps = []
    resizeCallback = null
  })

  describe('empty state', () => {
    it('returns null when annotations is undefined', () => {
      const { container } = render(
        <ChartAnnotationsOverlay
          annotations={undefined as any}
          editable={false}
          onPositionChange={mockOnPositionChange}
        />
      )

      expect(container.firstChild).toBeNull()
    })

    it('returns null when annotations array is empty', () => {
      const { container } = render(
        <ChartAnnotationsOverlay
          annotations={[]}
          editable={false}
          onPositionChange={mockOnPositionChange}
        />
      )

      expect(container.firstChild).toBeNull()
    })
  })

  describe('container rendering', () => {
    it('renders container div', () => {
      render(
        <ChartAnnotationsOverlay
          annotations={[createMockAnnotation()]}
          editable={false}
          onPositionChange={mockOnPositionChange}
        />
      )

      const container = document.querySelector('[style*="position: absolute"]')
      expect(container).toBeInTheDocument()
    })

    it('sets pointer-events to none when not editable', () => {
      render(
        <ChartAnnotationsOverlay
          annotations={[createMockAnnotation()]}
          editable={false}
          onPositionChange={mockOnPositionChange}
        />
      )

      const container = document.querySelector('[style*="position: absolute"]')
      expect(container).toHaveStyle({ pointerEvents: 'none' })
    })

    it('sets pointer-events to auto when editable', () => {
      render(
        <ChartAnnotationsOverlay
          annotations={[createMockAnnotation()]}
          editable={true}
          onPositionChange={mockOnPositionChange}
        />
      )

      const container = document.querySelector('[style*="position: absolute"]')
      expect(container).toHaveStyle({ pointerEvents: 'auto' })
    })
  })

  describe('multiple annotations', () => {
    it('renders all annotations', () => {
      const annotations = [
        createMockAnnotation({ id: 'ann-1' }),
        createMockAnnotation({ id: 'ann-2' }),
        createMockAnnotation({ id: 'ann-3' }),
      ]

      render(
        <ChartAnnotationsOverlay
          annotations={annotations}
          editable={true}
          onPositionChange={mockOnPositionChange}
        />
      )

      expect(screen.getAllByTestId('editable-annotation')).toHaveLength(3)
    })
  })

  describe('locked annotations', () => {
    it('renders non-editable Annotation when locked and not globally editable', () => {
      render(
        <ChartAnnotationsOverlay
          annotations={[createMockAnnotation({ locked: true })]}
          editable={false}
          onPositionChange={mockOnPositionChange}
        />
      )

      expect(screen.getByTestId('annotation')).toBeInTheDocument()
      expect(screen.queryByTestId('editable-annotation')).not.toBeInTheDocument()
    })

    it('renders EditableAnnotation when locked but globally editable', () => {
      render(
        <ChartAnnotationsOverlay
          annotations={[createMockAnnotation({ locked: true })]}
          editable={true}
          onPositionChange={mockOnPositionChange}
        />
      )

      expect(screen.getByTestId('editable-annotation')).toBeInTheDocument()
    })
  })

  describe('annotation content', () => {
    it('renders connector when enabled', () => {
      render(
        <ChartAnnotationsOverlay
          annotations={[createMockAnnotation({ connector: true })]}
          editable={true}
          onPositionChange={mockOnPositionChange}
        />
      )

      expect(screen.getByTestId('connector')).toBeInTheDocument()
    })

    it('renders circle subject when enabled', () => {
      render(
        <ChartAnnotationsOverlay
          annotations={[createMockAnnotation({ subject: true })]}
          editable={true}
          onPositionChange={mockOnPositionChange}
        />
      )

      expect(screen.getByTestId('circle-subject')).toBeInTheDocument()
    })

    it('renders label when enabled', () => {
      render(
        <ChartAnnotationsOverlay
          annotations={[createMockAnnotation({ label: true, title: 'My Label' })]}
          editable={true}
          onPositionChange={mockOnPositionChange}
        />
      )

      expect(screen.getByTestId('label')).toBeInTheDocument()
      expect(screen.getByTestId('label')).toHaveAttribute('data-title', 'My Label')
    })
  })

  describe('margins', () => {
    it('uses default margins when not provided', () => {
      render(
        <ChartAnnotationsOverlay
          annotations={[createMockAnnotation()]}
          editable={true}
          onPositionChange={mockOnPositionChange}
        />
      )

      // With no size observed, positions will be calculated from default 0 margins
      expect(capturedEditableProps[0]).toBeDefined()
    })

    it('applies partial margins', () => {
      render(
        <ChartAnnotationsOverlay
          annotations={[createMockAnnotation()]}
          editable={true}
          onPositionChange={mockOnPositionChange}
          margins={{ left: 50, top: 20 }}
        />
      )

      expect(capturedEditableProps[0]).toBeDefined()
    })

    it('applies full margins', () => {
      render(
        <ChartAnnotationsOverlay
          annotations={[createMockAnnotation()]}
          editable={true}
          onPositionChange={mockOnPositionChange}
          margins={{ left: 50, top: 20, right: 30, bottom: 40 }}
        />
      )

      expect(capturedEditableProps[0]).toBeDefined()
    })
  })

  describe('resize observer', () => {
    it('creates ResizeObserver on mount', () => {
      render(
        <ChartAnnotationsOverlay
          annotations={[createMockAnnotation()]}
          editable={true}
          onPositionChange={mockOnPositionChange}
        />
      )

      expect(resizeCallback).not.toBeNull()
    })
  })

  describe('onDragEnd', () => {
    it('calls onPositionChange when annotation is dragged', () => {
      render(
        <ChartAnnotationsOverlay
          annotations={[createMockAnnotation({ id: 'drag-test' })]}
          editable={true}
          onPositionChange={mockOnPositionChange}
        />
      )

      // Simulate resize first to set dimensions
      act(() => {
        simulateResize(500, 400)
      })

      // Click to trigger onDragEnd
      screen.getByTestId('editable-annotation').click()

      expect(mockOnPositionChange).toHaveBeenCalledWith(
        expect.objectContaining({ annotationId: 'drag-test' })
      )
    })

    it('includes position in callback', () => {
      render(
        <ChartAnnotationsOverlay
          annotations={[createMockAnnotation()]}
          editable={true}
          onPositionChange={mockOnPositionChange}
        />
      )

      act(() => {
        simulateResize(500, 400)
      })

      screen.getByTestId('editable-annotation').click()

      expect(mockOnPositionChange).toHaveBeenCalledWith(
        expect.objectContaining({
          position: expect.objectContaining({
            pX: expect.any(Number),
            pY: expect.any(Number),
            pXDelta: expect.any(Number),
            pYDelta: expect.any(Number),
          }),
        })
      )
    })
  })

  describe('connector type', () => {
    it('uses line type when subject is present', () => {
      render(
        <ChartAnnotationsOverlay
          annotations={[createMockAnnotation({ connector: true, subject: true })]}
          editable={true}
          onPositionChange={mockOnPositionChange}
        />
      )

      expect(screen.getByTestId('connector')).toHaveAttribute('data-type', 'line')
    })

    it('uses elbow type when no subject', () => {
      render(
        <ChartAnnotationsOverlay
          annotations={[createMockAnnotation({ connector: true, subject: false })]}
          editable={true}
          onPositionChange={mockOnPositionChange}
        />
      )

      expect(screen.getByTestId('connector')).toHaveAttribute('data-type', 'elbow')
    })
  })
})
