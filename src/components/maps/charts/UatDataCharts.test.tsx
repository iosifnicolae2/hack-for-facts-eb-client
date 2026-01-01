/**
 * UatDataCharts Component Tests
 *
 * This file tests the UatDataCharts component which is a wrapper that
 * composes UatTopNBarChart and UatPopulationSpendingScatterPlot.
 *
 * Pattern: Wrapper Component Testing
 * - Mock child chart components
 * - Test empty/error states
 * - Test prop passing to child components
 * - Test view type switching (UAT vs County)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { UatDataCharts } from './UatDataCharts'
import type { HeatmapUATDataPoint, HeatmapCountyDataPoint } from '@/schemas/heatmap'

// ============================================================================
// MOCKS
// ============================================================================

// Mock child chart components
vi.mock('./UatTopNBarChart', () => ({
  UatTopNBarChart: ({
    data,
    valueKey,
    nameKey,
    topN,
    chartTitle,
  }: {
    data: unknown[]
    valueKey: string
    nameKey: string
    topN: number
    chartTitle: string
  }) => (
    <div
      data-testid="top-n-bar-chart"
      data-count={data.length}
      data-value-key={valueKey}
      data-name-key={nameKey}
      data-top-n={topN}
      data-title={chartTitle}
    />
  ),
}))

vi.mock('./UatPopulationSpendingScatterPlot', () => ({
  UatPopulationSpendingScatterPlot: ({
    data,
    chartTitle,
  }: {
    data: unknown[]
    chartTitle: string
  }) => (
    <div
      data-testid="scatter-plot"
      data-count={data.length}
      data-title={chartTitle}
    />
  ),
}))

// Mock hooks
const mockMapState: {
  filters: {
    normalization: string | undefined
    currency: string | undefined
  }
} = {
  filters: {
    normalization: 'total',
    currency: 'RON',
  },
}

vi.mock('@/hooks/useMapFilter', () => ({
  useMapFilter: () => ({
    mapState: mockMapState,
  }),
}))

vi.mock('@/lib/hooks/useUserCurrency', () => ({
  useUserCurrency: () => ['RON', vi.fn()],
}))

// Mock Lingui
vi.mock('@lingui/core/macro', () => ({
  t: (strings: TemplateStringsArray) => strings[0],
}))

// ============================================================================
// TEST DATA
// ============================================================================

const createUatDataPoint = (
  uat_name: string,
  amount: number
): HeatmapUATDataPoint =>
  ({
    uat_name,
    total_amount: amount,
    population: 100000,
    id: uat_name,
    natcode: `${uat_name}-code`,
  }) as unknown as HeatmapUATDataPoint

const createCountyDataPoint = (
  county_name: string,
  amount: number
): HeatmapCountyDataPoint =>
  ({
    county_name,
    total_amount: amount,
    id: county_name,
    natcode: `${county_name}-code`,
  }) as unknown as HeatmapCountyDataPoint

const uatData = [
  createUatDataPoint('Cluj', 1000000),
  createUatDataPoint('Bucharest', 2000000),
]

const countyData = [
  createCountyDataPoint('Cluj', 1000000),
  createCountyDataPoint('Timis', 500000),
]

// ============================================================================
// TESTS
// ============================================================================

describe('UatDataCharts', () => {
  beforeEach(() => {
    // Reset mock state
    mockMapState.filters = {
      normalization: 'total',
      currency: 'RON',
    }
  })

  describe('empty state', () => {
    it('renders empty message when data is null', () => {
      render(<UatDataCharts data={null as unknown as []} mapViewType="UAT" />)

      expect(
        screen.getByText('No data available to display charts.')
      ).toBeInTheDocument()
    })

    it('renders empty message when data is empty array', () => {
      render(<UatDataCharts data={[]} mapViewType="UAT" />)

      expect(
        screen.getByText('No data available to display charts.')
      ).toBeInTheDocument()
    })
  })

  describe('UAT view', () => {
    it('renders both charts for UAT view', () => {
      render(<UatDataCharts data={uatData} mapViewType="UAT" />)

      expect(screen.getByTestId('top-n-bar-chart')).toBeInTheDocument()
      expect(screen.getByTestId('scatter-plot')).toBeInTheDocument()
    })

    it('passes correct nameKey for UAT view', () => {
      render(<UatDataCharts data={uatData} mapViewType="UAT" />)

      expect(screen.getByTestId('top-n-bar-chart')).toHaveAttribute(
        'data-name-key',
        'uat_name'
      )
    })

    it('passes data to child components', () => {
      render(<UatDataCharts data={uatData} mapViewType="UAT" />)

      expect(screen.getByTestId('top-n-bar-chart')).toHaveAttribute(
        'data-count',
        '2'
      )
      expect(screen.getByTestId('scatter-plot')).toHaveAttribute(
        'data-count',
        '2'
      )
    })

    it('sets topN to 15', () => {
      render(<UatDataCharts data={uatData} mapViewType="UAT" />)

      expect(screen.getByTestId('top-n-bar-chart')).toHaveAttribute(
        'data-top-n',
        '15'
      )
    })
  })

  describe('County view', () => {
    it('renders both charts for County view', () => {
      render(<UatDataCharts data={countyData} mapViewType="County" />)

      expect(screen.getByTestId('top-n-bar-chart')).toBeInTheDocument()
      expect(screen.getByTestId('scatter-plot')).toBeInTheDocument()
    })

    it('passes correct nameKey for County view', () => {
      render(<UatDataCharts data={countyData} mapViewType="County" />)

      expect(screen.getByTestId('top-n-bar-chart')).toHaveAttribute(
        'data-name-key',
        'county_name'
      )
    })
  })

  describe('normalization handling', () => {
    it('handles total normalization', () => {
      mockMapState.filters.normalization = 'total'
      render(<UatDataCharts data={uatData} mapViewType="UAT" />)

      expect(screen.getByTestId('top-n-bar-chart')).toBeInTheDocument()
    })

    it('handles per_capita normalization', () => {
      mockMapState.filters.normalization = 'per_capita'
      render(<UatDataCharts data={uatData} mapViewType="UAT" />)

      expect(screen.getByTestId('top-n-bar-chart')).toBeInTheDocument()
    })

    it('handles total_euro normalization', () => {
      mockMapState.filters.normalization = 'total_euro'
      render(<UatDataCharts data={uatData} mapViewType="UAT" />)

      expect(screen.getByTestId('top-n-bar-chart')).toBeInTheDocument()
    })

    it('handles per_capita_euro normalization', () => {
      mockMapState.filters.normalization = 'per_capita_euro'
      render(<UatDataCharts data={uatData} mapViewType="UAT" />)

      expect(screen.getByTestId('top-n-bar-chart')).toBeInTheDocument()
    })

    it('defaults to total when normalization is undefined', () => {
      mockMapState.filters.normalization = undefined
      render(<UatDataCharts data={uatData} mapViewType="UAT" />)

      expect(screen.getByTestId('top-n-bar-chart')).toBeInTheDocument()
    })
  })

  describe('chart configuration', () => {
    it('passes valueKey as total_amount', () => {
      render(<UatDataCharts data={uatData} mapViewType="UAT" />)

      expect(screen.getByTestId('top-n-bar-chart')).toHaveAttribute(
        'data-value-key',
        'total_amount'
      )
    })
  })

  describe('layout', () => {
    it('renders charts in proper container structure', () => {
      const { container } = render(
        <UatDataCharts data={uatData} mapViewType="UAT" />
      )

      // Check for the outer container with spacing
      const outerContainer = container.firstChild as HTMLElement
      expect(outerContainer).toHaveClass('space-y-8')

      // Check for chart cards
      const cards = container.querySelectorAll('.border.rounded-lg')
      expect(cards.length).toBe(2)
    })
  })
})
