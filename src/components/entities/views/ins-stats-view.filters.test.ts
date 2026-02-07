import { describe, expect, it } from 'vitest'

import {
  buildHistoryFilter,
  buildIndicatorFallbackFilter,
  buildIndicatorPeriodFilter,
  getReportPeriodAnchor,
  mapPeriodicityToTemporalSplit,
  mapTemporalSplitToPeriodicity,
} from './ins-stats-view.filters'

describe('ins-stats-view filter helpers', () => {
  it('builds county and lau history filters', () => {
    expect(buildHistoryFilter({ isCounty: true, countyCode: 'SB', sirutaCode: '143450' })).toEqual({
      territoryCodes: ['SB'],
      territoryLevels: ['NUTS3'],
    })

    expect(buildHistoryFilter({ isCounty: false, countyCode: 'SB', sirutaCode: '143450' })).toEqual({
      sirutaCodes: ['143450'],
      territoryLevels: ['LAU'],
    })
  })

  it('extracts report period anchors from interval and dates', () => {
    expect(
      getReportPeriodAnchor({
        type: 'YEAR',
        selection: { interval: { start: '2025', end: '2025' } },
      })
    ).toBe('2025')

    expect(
      getReportPeriodAnchor({
        type: 'MONTH',
        selection: { dates: ['2025-03'] },
      })
    ).toBe('2025-03')
  })

  it('builds period-aware indicator filters for year/quarter/month', () => {
    expect(
      buildIndicatorPeriodFilter({
        reportPeriod: {
          type: 'YEAR',
          selection: { interval: { start: '2025', end: '2025' } },
        },
        isCounty: false,
        countyCode: 'SB',
        sirutaCode: '143450',
      })
    ).toEqual({
      sirutaCodes: ['143450'],
      territoryLevels: ['LAU'],
      periodicity: 'ANNUAL',
      years: [2025],
      period: '2025',
    })

    expect(
      buildIndicatorPeriodFilter({
        reportPeriod: {
          type: 'QUARTER',
          selection: { interval: { start: '2025-Q2', end: '2025-Q2' } },
        },
        isCounty: false,
        countyCode: 'SB',
        sirutaCode: '143450',
      })
    ).toEqual({
      sirutaCodes: ['143450'],
      territoryLevels: ['LAU'],
      periodicity: 'QUARTERLY',
      years: [2025],
      quarters: [2],
      period: '2025-Q2',
    })

    expect(
      buildIndicatorPeriodFilter({
        reportPeriod: {
          type: 'MONTH',
          selection: { interval: { start: '2025-03', end: '2025-03' } },
        },
        isCounty: false,
        countyCode: 'SB',
        sirutaCode: '143450',
      })
    ).toEqual({
      sirutaCodes: ['143450'],
      territoryLevels: ['LAU'],
      periodicity: 'MONTHLY',
      years: [2025],
      months: [3],
      period: '2025-03',
    })
  })

  it('builds fallback filters by report period type', () => {
    expect(
      buildIndicatorFallbackFilter({
        reportPeriod: {
          type: 'YEAR',
          selection: { interval: { start: '2025', end: '2025' } },
        },
        isCounty: true,
        countyCode: 'SB',
        sirutaCode: '143450',
      })
    ).toEqual({
      territoryCodes: ['SB'],
      territoryLevels: ['NUTS3'],
      periodicity: 'ANNUAL',
    })

    expect(mapTemporalSplitToPeriodicity('quarter')).toEqual(['QUARTERLY'])
    expect(mapPeriodicityToTemporalSplit('MONTHLY')).toBe('month')
  })
})
