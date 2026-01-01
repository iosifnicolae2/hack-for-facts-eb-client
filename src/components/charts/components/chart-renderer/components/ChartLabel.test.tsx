/**
 * ChartLabel Component Tests
 *
 * This file tests the ChartLabel component which renders
 * data labels on chart data points.
 *
 * Pattern: SVG Component Testing
 * - Test label positioning
 * - Test value formatting
 * - Test color handling
 * - Test series offset
 */

import { describe, it, expect, vi } from 'vitest'
import { render } from '@/test/test-utils'
import { ChartLabel } from './ChartLabel'
import type { Series } from '@/schemas/charts'

// ============================================================================
// MOCKS
// ============================================================================

vi.mock('../utils', () => ({
  applyAlpha: (color: string, alpha: number) => `${color}-alpha-${alpha}`,
}))

// ============================================================================
// TEST DATA
// ============================================================================

const createMockSeries = (overrides: Record<string, unknown> = {}): Series => ({
  id: 'series-1',
  label: 'Test Series',
  enabled: true,
  config: { color: '#0000ff', showDataLabels: true },
  ...overrides,
} as Series)

const defaultFormatter = (value: number) => `${value.toLocaleString()} RON`

// ============================================================================
// TESTS
// ============================================================================

describe('ChartLabel', () => {
  describe('rendering', () => {
    it('renders a group element', () => {
      const { container } = render(
        <svg>
          <ChartLabel
            x={100}
            y={50}
            value={1000}
            offset={5}
            width={30}
            series={createMockSeries()}
            dataLabelFormatter={defaultFormatter}
            color="#ff0000"
          />
        </svg>
      )

      const group = container.querySelector('g')
      expect(group).toBeInTheDocument()
      expect(group).toHaveClass('select-none')
    })

    it('renders a rect element for background', () => {
      const { container } = render(
        <svg>
          <ChartLabel
            x={100}
            y={50}
            value={1000}
            offset={5}
            width={30}
            series={createMockSeries()}
            dataLabelFormatter={defaultFormatter}
            color="#ff0000"
          />
        </svg>
      )

      const rect = container.querySelector('rect')
      expect(rect).toBeInTheDocument()
    })

    it('renders a text element with formatted value', () => {
      const { container } = render(
        <svg>
          <ChartLabel
            x={100}
            y={50}
            value={1000}
            offset={5}
            width={30}
            series={createMockSeries()}
            dataLabelFormatter={defaultFormatter}
            color="#ff0000"
          />
        </svg>
      )

      const text = container.querySelector('text')
      expect(text).toBeInTheDocument()
      expect(text?.textContent).toBe('1,000 RON')
    })
  })

  describe('positioning', () => {
    it('centers rect horizontally based on label width', () => {
      const { container } = render(
        <svg>
          <ChartLabel
            x={100}
            y={50}
            value={1000}
            offset={5}
            width={30}
            series={createMockSeries()}
            dataLabelFormatter={defaultFormatter}
            color="#ff0000"
          />
        </svg>
      )

      const rect = container.querySelector('rect')
      // x = xValue - labelWidth/2 + chartItemWidth/2 = 100 - 25 + 15 = 90
      // labelWidth for '1,000 RON' (9 chars) = 9 * 7 = 63
      expect(rect).toHaveAttribute('x')
    })

    it('positions text centered on x coordinate', () => {
      const { container } = render(
        <svg>
          <ChartLabel
            x={100}
            y={50}
            value={1000}
            offset={5}
            width={30}
            series={createMockSeries()}
            dataLabelFormatter={defaultFormatter}
            color="#ff0000"
          />
        </svg>
      )

      const text = container.querySelector('text')
      // text x = xValue + chartItemWidth / 2 = 100 + 15 = 115
      expect(text).toHaveAttribute('x', '115')
    })

    it('applies offset to y position', () => {
      const { container } = render(
        <svg>
          <ChartLabel
            x={100}
            y={50}
            value={1000}
            offset={10}
            width={30}
            series={createMockSeries()}
            dataLabelFormatter={defaultFormatter}
            color="#ff0000"
          />
        </svg>
      )

      const rect = container.querySelector('rect')
      // rect y = yValue - offsetValue + seriesOffset = 50 - 10 + 0 = 40
      expect(rect).toHaveAttribute('y', '40')
    })

    it('applies series dataLabelOffset', () => {
      const series = createMockSeries({
        config: { color: '#0000ff', showDataLabels: true, dataLabelOffset: -15 },
      })

      const { container } = render(
        <svg>
          <ChartLabel
            x={100}
            y={50}
            value={1000}
            offset={5}
            width={30}
            series={series}
            dataLabelFormatter={defaultFormatter}
            color="#ff0000"
          />
        </svg>
      )

      const rect = container.querySelector('rect')
      // rect y = yValue - offsetValue + seriesOffset = 50 - 5 + (-15) = 30
      expect(rect).toHaveAttribute('y', '30')
    })
  })

  describe('value formatting', () => {
    it('uses dataLabelFormatter to format value', () => {
      const customFormatter = (value: number) => `$${value.toFixed(2)}`

      const { container } = render(
        <svg>
          <ChartLabel
            x={100}
            y={50}
            value={1234.5}
            offset={5}
            width={30}
            series={createMockSeries()}
            dataLabelFormatter={customFormatter}
            color="#ff0000"
          />
        </svg>
      )

      const text = container.querySelector('text')
      expect(text?.textContent).toBe('$1234.50')
    })

    it('handles zero value', () => {
      const { container } = render(
        <svg>
          <ChartLabel
            x={100}
            y={50}
            value={0}
            offset={5}
            width={30}
            series={createMockSeries()}
            dataLabelFormatter={defaultFormatter}
            color="#ff0000"
          />
        </svg>
      )

      const text = container.querySelector('text')
      expect(text?.textContent).toBe('0 RON')
    })

    it('handles negative value', () => {
      const { container } = render(
        <svg>
          <ChartLabel
            x={100}
            y={50}
            value={-500}
            offset={5}
            width={30}
            series={createMockSeries()}
            dataLabelFormatter={defaultFormatter}
            color="#ff0000"
          />
        </svg>
      )

      const text = container.querySelector('text')
      expect(text?.textContent).toBe('-500 RON')
    })
  })

  describe('styling', () => {
    it('applies color with alpha to rect fill', () => {
      const { container } = render(
        <svg>
          <ChartLabel
            x={100}
            y={50}
            value={1000}
            offset={5}
            width={30}
            series={createMockSeries()}
            dataLabelFormatter={defaultFormatter}
            color="#ff0000"
          />
        </svg>
      )

      const rect = container.querySelector('rect')
      expect(rect).toHaveAttribute('fill', '#ff0000-alpha-0.2')
    })

    it('sets rect height to 20', () => {
      const { container } = render(
        <svg>
          <ChartLabel
            x={100}
            y={50}
            value={1000}
            offset={5}
            width={30}
            series={createMockSeries()}
            dataLabelFormatter={defaultFormatter}
            color="#ff0000"
          />
        </svg>
      )

      const rect = container.querySelector('rect')
      expect(rect).toHaveAttribute('height', '20')
    })

    it('sets rect border radius to 4', () => {
      const { container } = render(
        <svg>
          <ChartLabel
            x={100}
            y={50}
            value={1000}
            offset={5}
            width={30}
            series={createMockSeries()}
            dataLabelFormatter={defaultFormatter}
            color="#ff0000"
          />
        </svg>
      )

      const rect = container.querySelector('rect')
      expect(rect).toHaveAttribute('rx', '4')
    })

    it('sets text anchor to middle', () => {
      const { container } = render(
        <svg>
          <ChartLabel
            x={100}
            y={50}
            value={1000}
            offset={5}
            width={30}
            series={createMockSeries()}
            dataLabelFormatter={defaultFormatter}
            color="#ff0000"
          />
        </svg>
      )

      const text = container.querySelector('text')
      expect(text).toHaveAttribute('text-anchor', 'middle')
    })

    it('sets text fill to black', () => {
      const { container } = render(
        <svg>
          <ChartLabel
            x={100}
            y={50}
            value={1000}
            offset={5}
            width={30}
            series={createMockSeries()}
            dataLabelFormatter={defaultFormatter}
            color="#ff0000"
          />
        </svg>
      )

      const text = container.querySelector('text')
      expect(text).toHaveAttribute('fill', '#000000')
    })

    it('sets text font size to 10px', () => {
      const { container } = render(
        <svg>
          <ChartLabel
            x={100}
            y={50}
            value={1000}
            offset={5}
            width={30}
            series={createMockSeries()}
            dataLabelFormatter={defaultFormatter}
            color="#ff0000"
          />
        </svg>
      )

      const text = container.querySelector('text')
      expect(text).toHaveAttribute('font-size', '10px')
    })
  })

  describe('edge cases', () => {
    it('handles NaN x value', () => {
      const { container } = render(
        <svg>
          <ChartLabel
            x={NaN}
            y={50}
            value={1000}
            offset={5}
            width={30}
            series={createMockSeries()}
            dataLabelFormatter={defaultFormatter}
            color="#ff0000"
          />
        </svg>
      )

      const text = container.querySelector('text')
      // x should default to 0 when NaN, so text x = 0 + 15 = 15
      expect(text).toHaveAttribute('x', '15')
    })

    it('handles NaN y value', () => {
      const { container } = render(
        <svg>
          <ChartLabel
            x={100}
            y={NaN}
            value={1000}
            offset={5}
            width={30}
            series={createMockSeries()}
            dataLabelFormatter={defaultFormatter}
            color="#ff0000"
          />
        </svg>
      )

      const rect = container.querySelector('rect')
      // y should default to 0 when NaN
      expect(rect).toHaveAttribute('y', '-5')
    })

    it('handles NaN offset value', () => {
      const { container } = render(
        <svg>
          <ChartLabel
            x={100}
            y={50}
            value={1000}
            offset={NaN}
            width={30}
            series={createMockSeries()}
            dataLabelFormatter={defaultFormatter}
            color="#ff0000"
          />
        </svg>
      )

      const rect = container.querySelector('rect')
      // offset should default to 0 when NaN
      expect(rect).toHaveAttribute('y', '50')
    })

    it('handles NaN width value', () => {
      const { container } = render(
        <svg>
          <ChartLabel
            x={100}
            y={50}
            value={1000}
            offset={5}
            width={NaN}
            series={createMockSeries()}
            dataLabelFormatter={defaultFormatter}
            color="#ff0000"
          />
        </svg>
      )

      const text = container.querySelector('text')
      // width should default to 0 when NaN
      expect(text).toHaveAttribute('x', '100')
    })

    it('calculates wider label for long formatted values', () => {
      const longFormatter = () => '1,234,567,890 RON'

      const { container } = render(
        <svg>
          <ChartLabel
            x={100}
            y={50}
            value={1000}
            offset={5}
            width={30}
            series={createMockSeries()}
            dataLabelFormatter={longFormatter}
            color="#ff0000"
          />
        </svg>
      )

      const rect = container.querySelector('rect')
      // For long values (> 6 chars), width = length * 7 = 17 * 7 = 119
      expect(rect).toHaveAttribute('width', '119')
    })

    it('uses minimum width 50 for short formatted values', () => {
      const shortFormatter = () => '100'

      const { container } = render(
        <svg>
          <ChartLabel
            x={100}
            y={50}
            value={1000}
            offset={5}
            width={30}
            series={createMockSeries()}
            dataLabelFormatter={shortFormatter}
            color="#ff0000"
          />
        </svg>
      )

      const rect = container.querySelector('rect')
      expect(rect).toHaveAttribute('width', '50')
    })
  })
})
