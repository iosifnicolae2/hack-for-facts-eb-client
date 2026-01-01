/**
 * Tooltips Component Tests
 *
 * This file tests the CustomSeriesTooltip component which renders
 * tooltip content for chart data points.
 *
 * Pattern: Recharts Tooltip Testing
 * - Test active/inactive states
 * - Test payload data rendering
 * - Test aggregated vs time-series modes
 * - Test value formatting
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { CustomSeriesTooltip } from './Tooltips'
import type { Chart } from '@/schemas/charts'
import type { DataPointPayload } from '../../../hooks/useChartData'

// ============================================================================
// MOCKS
// ============================================================================

// Mock Lingui
vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock utils
vi.mock('../utils', () => ({
  yValueFormatter: (value: number, unit: string, format: string) => {
    if (format === 'compact') {
      return `${value.toLocaleString()} ${unit}`
    }
    return `${value.toLocaleString()} ${unit} (std)`
  },
}))

// ============================================================================
// TEST DATA
// ============================================================================

const createMockChartConfig = (
  chartType: string = 'line'
): Chart['config'] => ({
  chartType: chartType as any,
  color: '#000000',
  showLegend: true,
  showTooltip: true,
  showGridLines: true,
  editAnnotations: true,
  showAnnotations: true,
})

const createMockDataPointPayload = (
  overrides: Partial<DataPointPayload> = {}
): DataPointPayload => ({
  id: 'dp-1',
  year: 2023,
  value: 1000,
  unit: 'RON',
  initialValue: 1000,
  initialUnit: 'RON',
  originalLabel: '2023',
  series: {
    id: 'series-1',
    label: 'Test Series',
    config: { color: '#0000ff' },
  },
  ...overrides,
})

// ============================================================================
// TESTS
// ============================================================================

describe('CustomSeriesTooltip', () => {
  describe('inactive state', () => {
    it('returns null when not active', () => {
      const { container } = render(
        <CustomSeriesTooltip
          active={false}
          payload={[createMockDataPointPayload()]}
          chartConfig={createMockChartConfig()}
        />
      )

      expect(container.firstChild).toBeNull()
    })

    it('returns null when active is undefined', () => {
      const { container } = render(
        <CustomSeriesTooltip
          payload={[createMockDataPointPayload()]}
          chartConfig={createMockChartConfig()}
        />
      )

      expect(container.firstChild).toBeNull()
    })
  })

  describe('empty payload', () => {
    it('returns null when payload is undefined', () => {
      const { container } = render(
        <CustomSeriesTooltip active={true} chartConfig={createMockChartConfig()} />
      )

      expect(container.firstChild).toBeNull()
    })

    it('returns null when payload is empty array', () => {
      const { container } = render(
        <CustomSeriesTooltip
          active={true}
          payload={[]}
          chartConfig={createMockChartConfig()}
        />
      )

      expect(container.firstChild).toBeNull()
    })
  })

  describe('time-series tooltip', () => {
    it('renders year label for time-series chart', () => {
      render(
        <CustomSeriesTooltip
          active={true}
          payload={[createMockDataPointPayload()]}
          label="2023"
          chartConfig={createMockChartConfig('line')}
        />
      )

      expect(screen.getByText(/Year/)).toBeInTheDocument()
    })

    it('renders series label', () => {
      render(
        <CustomSeriesTooltip
          active={true}
          payload={[createMockDataPointPayload({ series: { ...createMockDataPointPayload().series!, label: 'Revenue' } })]}
          chartConfig={createMockChartConfig()}
        />
      )

      expect(screen.getByText('Revenue')).toBeInTheDocument()
    })

    it('renders formatted values', () => {
      render(
        <CustomSeriesTooltip
          active={true}
          payload={[createMockDataPointPayload({ value: 1500, unit: 'EUR' })]}
          chartConfig={createMockChartConfig()}
        />
      )

      expect(screen.getByText('1,500 EUR')).toBeInTheDocument()
    })

    it('renders secondary value with standard format', () => {
      render(
        <CustomSeriesTooltip
          active={true}
          payload={[createMockDataPointPayload({ initialValue: 2000, initialUnit: 'RON' })]}
          chartConfig={createMockChartConfig()}
        />
      )

      expect(screen.getByText('2,000 RON (std)')).toBeInTheDocument()
    })

    it('uses originalLabel for header when available', () => {
      render(
        <CustomSeriesTooltip
          active={true}
          payload={[createMockDataPointPayload({ originalLabel: 'Q1 2023' })]}
          label="2023"
          chartConfig={createMockChartConfig()}
        />
      )

      expect(screen.getByText(/Year Q1 2023/)).toBeInTheDocument()
    })
  })

  describe('aggregated tooltip', () => {
    it('renders aggregated data label for aggregated chart', () => {
      render(
        <CustomSeriesTooltip
          active={true}
          payload={[createMockDataPointPayload()]}
          chartConfig={createMockChartConfig('bar-aggr')}
        />
      )

      expect(screen.getByText('Aggregated data')).toBeInTheDocument()
    })

    it('identifies pie-aggr as aggregated', () => {
      render(
        <CustomSeriesTooltip
          active={true}
          payload={[createMockDataPointPayload()]}
          chartConfig={createMockChartConfig('pie-aggr')}
        />
      )

      expect(screen.getByText('Aggregated data')).toBeInTheDocument()
    })
  })

  describe('multiple data points', () => {
    it('renders all data points', () => {
      const payload = [
        createMockDataPointPayload({
          id: 'dp-1',
          series: { ...createMockDataPointPayload().series!, label: 'Series A' },
        }),
        createMockDataPointPayload({
          id: 'dp-2',
          series: { ...createMockDataPointPayload().series!, label: 'Series B' },
        }),
      ]

      render(
        <CustomSeriesTooltip
          active={true}
          payload={payload}
          chartConfig={createMockChartConfig()}
        />
      )

      expect(screen.getByText('Series A')).toBeInTheDocument()
      expect(screen.getByText('Series B')).toBeInTheDocument()
    })

    it('sorts data points by value descending', () => {
      const payload = [
        createMockDataPointPayload({
          id: 'dp-1',
          value: 100,
          series: { ...createMockDataPointPayload().series!, label: 'Small' },
        }),
        createMockDataPointPayload({
          id: 'dp-2',
          value: 1000,
          series: { ...createMockDataPointPayload().series!, label: 'Large' },
        }),
      ]

      render(
        <CustomSeriesTooltip
          active={true}
          payload={payload}
          chartConfig={createMockChartConfig()}
        />
      )

      const labels = screen.getAllByText(/Small|Large/)
      expect(labels[0]).toHaveTextContent('Large')
      expect(labels[1]).toHaveTextContent('Small')
    })
  })

  describe('color indicator', () => {
    it('renders series color indicator', () => {
      render(
        <CustomSeriesTooltip
          active={true}
          payload={[
            createMockDataPointPayload({
              series: { ...createMockDataPointPayload().series!, config: { color: '#ff0000' } },
            }),
          ]}
          chartConfig={createMockChartConfig()}
        />
      )

      const colorIndicator = document.querySelector('.rounded-full')
      expect(colorIndicator).toHaveStyle({ backgroundColor: '#ff0000' })
    })
  })

  describe('payload with dataKey', () => {
    it('handles payload with string dataKey', () => {
      const payloadWithDataKey = [
        {
          dataKey: 'series-1.value',
          payload: {
            'series-1': createMockDataPointPayload({
              series: { ...createMockDataPointPayload().series!, label: 'Extracted Series' },
            }),
          },
          name: 'Extracted Series',
          color: '#0000ff',
        },
      ]

      render(
        <CustomSeriesTooltip
          active={true}
          payload={payloadWithDataKey as any}
          chartConfig={createMockChartConfig()}
        />
      )

      expect(screen.getByText('Extracted Series')).toBeInTheDocument()
    })

    it('handles payload matching by label', () => {
      const payloadWithName = [
        {
          dataKey: () => {},
          payload: {
            'series-1': createMockDataPointPayload({
              series: { ...createMockDataPointPayload().series!, label: 'Match By Label' },
            }),
          },
          name: 'Match By Label',
          color: '#123456',
        },
      ]

      render(
        <CustomSeriesTooltip
          active={true}
          payload={payloadWithName as any}
          chartConfig={createMockChartConfig()}
        />
      )

      expect(screen.getByText('Match By Label')).toBeInTheDocument()
    })

    it('handles payload matching by color', () => {
      const payloadWithColor = [
        {
          dataKey: () => {},
          payload: {
            'series-1': createMockDataPointPayload({
              series: {
                ...createMockDataPointPayload().series!,
                label: 'Match By Color',
                config: { color: '#ff00ff' },
              },
            }),
          },
          name: 'Different Name',
          color: '#ff00ff',
        },
      ]

      render(
        <CustomSeriesTooltip
          active={true}
          payload={payloadWithColor as any}
          chartConfig={createMockChartConfig()}
        />
      )

      expect(screen.getByText('Match By Color')).toBeInTheDocument()
    })
  })

  describe('styling', () => {
    it('renders tooltip container with correct classes', () => {
      render(
        <CustomSeriesTooltip
          active={true}
          payload={[createMockDataPointPayload()]}
          chartConfig={createMockChartConfig()}
        />
      )

      const container = document.querySelector('.bg-background\\/50')
      expect(container).toBeInTheDocument()
      expect(container).toHaveClass('backdrop-blur-sm')
      expect(container).toHaveClass('rounded-lg')
      expect(container).toHaveClass('shadow-lg')
    })

    it('renders header with border-b class', () => {
      render(
        <CustomSeriesTooltip
          active={true}
          payload={[createMockDataPointPayload()]}
          chartConfig={createMockChartConfig()}
        />
      )

      const header = document.querySelector('.border-b')
      expect(header).toBeInTheDocument()
    })
  })
})
