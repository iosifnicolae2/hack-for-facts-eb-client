/**
 * DiffArea Component Tests
 *
 * This file tests the DiffArea component which renders a reference area
 * on the chart to highlight differences between selected points.
 *
 * Pattern: Recharts Component Wrapper Testing
 * - Mock Recharts ReferenceArea
 * - Test props passing
 * - Test styling configuration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { DiffArea } from './DiffArea'
import type { DiffInfo } from './DiffLabel'

// ============================================================================
// MOCKS
// ============================================================================

// Mock Recharts
let capturedReferenceAreaProps: any = null
vi.mock('recharts', () => ({
  ReferenceArea: (props: any) => {
    capturedReferenceAreaProps = props
    return <div data-testid="reference-area" data-x1={props.x1} data-x2={props.x2} />
  },
}))

// Mock DiffLabel
vi.mock('./DiffLabel', () => ({
  DiffLabel: ({ data, start, end }: { data: DiffInfo[]; start: any; end: any }) => (
    <div data-testid="diff-label" data-start={start} data-end={end} data-count={data.length}>
      DiffLabel
    </div>
  ),
}))

// ============================================================================
// TEST DATA
// ============================================================================

const createMockDiffInfo = (overrides: Partial<DiffInfo> = {}): DiffInfo => ({
  label: 'Test Diff',
  color: '#0000ff',
  diff: 100,
  percentage: 100,
  unit: 'RON',
  ...overrides,
})

// ============================================================================
// TESTS
// ============================================================================

describe('DiffArea', () => {
  beforeEach(() => {
    capturedReferenceAreaProps = null
  })

  describe('rendering', () => {
    it('renders ReferenceArea component', () => {
      render(
        <DiffArea
          yAxisId="y-1"
          refAreaLeft={0}
          refAreaRight={10}
          diffs={[createMockDiffInfo()]}
        />
      )

      expect(screen.getByTestId('reference-area')).toBeInTheDocument()
    })
  })

  describe('props passing', () => {
    it('passes yAxisId to ReferenceArea', () => {
      render(
        <DiffArea
          yAxisId="custom-y-axis"
          refAreaLeft={0}
          refAreaRight={10}
          diffs={[createMockDiffInfo()]}
        />
      )

      expect(capturedReferenceAreaProps.yAxisId).toBe('custom-y-axis')
    })

    it('passes x1 from refAreaLeft', () => {
      render(
        <DiffArea
          yAxisId="y-1"
          refAreaLeft={5}
          refAreaRight={15}
          diffs={[createMockDiffInfo()]}
        />
      )

      expect(capturedReferenceAreaProps.x1).toBe(5)
    })

    it('passes x2 from refAreaRight', () => {
      render(
        <DiffArea
          yAxisId="y-1"
          refAreaLeft={5}
          refAreaRight={15}
          diffs={[createMockDiffInfo()]}
        />
      )

      expect(capturedReferenceAreaProps.x2).toBe(15)
    })

    it('accepts string values for refArea bounds', () => {
      render(
        <DiffArea
          yAxisId="y-1"
          refAreaLeft="2020"
          refAreaRight="2023"
          diffs={[createMockDiffInfo()]}
        />
      )

      expect(capturedReferenceAreaProps.x1).toBe('2020')
      expect(capturedReferenceAreaProps.x2).toBe('2023')
    })
  })

  describe('styling', () => {
    it('uses primary color for stroke', () => {
      render(
        <DiffArea
          yAxisId="y-1"
          refAreaLeft={0}
          refAreaRight={10}
          diffs={[createMockDiffInfo()]}
        />
      )

      expect(capturedReferenceAreaProps.stroke).toBe('hsl(var(--primary))')
    })

    it('uses dashed stroke', () => {
      render(
        <DiffArea
          yAxisId="y-1"
          refAreaLeft={0}
          refAreaRight={10}
          diffs={[createMockDiffInfo()]}
        />
      )

      expect(capturedReferenceAreaProps.strokeDasharray).toBe('3 3')
    })

    it('sets stroke opacity to 0.7', () => {
      render(
        <DiffArea
          yAxisId="y-1"
          refAreaLeft={0}
          refAreaRight={10}
          diffs={[createMockDiffInfo()]}
        />
      )

      expect(capturedReferenceAreaProps.strokeOpacity).toBe(0.7)
    })

    it('uses primary color for fill', () => {
      render(
        <DiffArea
          yAxisId="y-1"
          refAreaLeft={0}
          refAreaRight={10}
          diffs={[createMockDiffInfo()]}
        />
      )

      expect(capturedReferenceAreaProps.fill).toBe('hsl(var(--primary))')
    })

    it('sets fill opacity to 0.05', () => {
      render(
        <DiffArea
          yAxisId="y-1"
          refAreaLeft={0}
          refAreaRight={10}
          diffs={[createMockDiffInfo()]}
        />
      )

      expect(capturedReferenceAreaProps.fillOpacity).toBe(0.05)
    })

    it('sets ifOverflow to visible', () => {
      render(
        <DiffArea
          yAxisId="y-1"
          refAreaLeft={0}
          refAreaRight={10}
          diffs={[createMockDiffInfo()]}
        />
      )

      expect(capturedReferenceAreaProps.ifOverflow).toBe('visible')
    })

    it('sets high zIndex', () => {
      render(
        <DiffArea
          yAxisId="y-1"
          refAreaLeft={0}
          refAreaRight={10}
          diffs={[createMockDiffInfo()]}
        />
      )

      expect(capturedReferenceAreaProps.zIndex).toBe(10000)
    })
  })

  describe('DiffLabel integration', () => {
    it('passes diffs to DiffLabel', () => {
      const diffs = [createMockDiffInfo(), createMockDiffInfo({ label: 'Diff 2' })]

      render(
        <DiffArea
          yAxisId="y-1"
          refAreaLeft={0}
          refAreaRight={10}
          diffs={diffs}
        />
      )

      // The label prop should be a React element with DiffLabel
      expect(capturedReferenceAreaProps.label).toBeTruthy()
    })

    it('passes refAreaLeft as start to DiffLabel', () => {
      render(
        <DiffArea
          yAxisId="y-1"
          refAreaLeft={5}
          refAreaRight={10}
          diffs={[createMockDiffInfo()]}
        />
      )

      const labelProps = capturedReferenceAreaProps.label.props
      expect(labelProps.start).toBe(5)
    })

    it('passes refAreaRight as end to DiffLabel', () => {
      render(
        <DiffArea
          yAxisId="y-1"
          refAreaLeft={5}
          refAreaRight={15}
          diffs={[createMockDiffInfo()]}
        />
      )

      const labelProps = capturedReferenceAreaProps.label.props
      expect(labelProps.end).toBe(15)
    })

    it('passes diffs array to DiffLabel', () => {
      const diffs = [createMockDiffInfo(), createMockDiffInfo({ label: 'Diff 2' })]

      render(
        <DiffArea
          yAxisId="y-1"
          refAreaLeft={0}
          refAreaRight={10}
          diffs={diffs}
        />
      )

      const labelProps = capturedReferenceAreaProps.label.props
      expect(labelProps.data).toHaveLength(2)
    })
  })
})
