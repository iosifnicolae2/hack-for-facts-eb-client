import { describe, it, expect } from 'vitest'
import { chartRelatesToEntity } from './chart-entity-utils'
import type { EntityDetailsData } from '@/lib/api/entities'
import type { StoredChart } from '@/components/charts/chartsStore'

describe('chart-entity-utils', () => {
  describe('chartRelatesToEntity', () => {
    const createMockEntity = (overrides: Partial<EntityDetailsData> = {}): EntityDetailsData => ({
      cui: '12345678',
      name: 'Test Entity',
      default_report_type: 'PRINCIPAL_AGGREGATED',
      ...overrides,
    })

    const createMockChart = (series: any[] = []): StoredChart => ({
      id: 'chart-1',
      title: 'Test Chart',
      config: {
        chartType: 'line',
        color: '#000',
        showGridLines: true,
        showLegend: true,
        showTooltip: true,
        editAnnotations: true,
        showAnnotations: true,
      },
      series,
      annotations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      favorite: false,
      deleted: false,
      categories: [],
    })

    it('returns false for chart with no series', () => {
      const entity = createMockEntity()
      const chart = createMockChart([])

      expect(chartRelatesToEntity(chart, entity)).toBe(false)
    })

    it('returns false for chart with non-line-items series', () => {
      const entity = createMockEntity()
      const chart = createMockChart([
        { type: 'custom-series', data: [] },
        { type: 'aggregated-series-calculation', calculation: { op: 'sum', args: [] } },
      ])

      expect(chartRelatesToEntity(chart, entity)).toBe(false)
    })

    it('returns true when entity CUI matches in entity_cuis filter', () => {
      const entity = createMockEntity({ cui: '12345678' })
      const chart = createMockChart([
        {
          type: 'line-items-aggregated-yearly',
          filter: { entity_cuis: ['12345678', '87654321'] },
        },
      ])

      expect(chartRelatesToEntity(chart, entity)).toBe(true)
    })

    it('returns false when entity CUI does not match', () => {
      const entity = createMockEntity({ cui: '12345678' })
      const chart = createMockChart([
        {
          type: 'line-items-aggregated-yearly',
          filter: { entity_cuis: ['87654321'] },
        },
      ])

      expect(chartRelatesToEntity(chart, entity)).toBe(false)
    })

    it('returns true when UAT entity matches in uat_ids filter', () => {
      const entity = createMockEntity({
        is_uat: true,
        uat: { siruta_code: 123456 },
      })
      const chart = createMockChart([
        {
          type: 'line-items-aggregated-yearly',
          filter: { uat_ids: ['123456', '789012'] },
        },
      ])

      expect(chartRelatesToEntity(chart, entity)).toBe(true)
    })

    it('returns false when UAT ID does not match', () => {
      const entity = createMockEntity({
        is_uat: true,
        uat: { siruta_code: 123456 },
      })
      const chart = createMockChart([
        {
          type: 'line-items-aggregated-yearly',
          filter: { uat_ids: ['789012'] },
        },
      ])

      expect(chartRelatesToEntity(chart, entity)).toBe(false)
    })

    it('returns true when county council matches in county_codes filter', () => {
      const entity = createMockEntity({
        entity_type: 'admin_county_council',
        uat: { county_code: 'CJ' },
      })
      const chart = createMockChart([
        {
          type: 'line-items-aggregated-yearly',
          filter: { county_codes: ['CJ', 'TM'] },
        },
      ])

      expect(chartRelatesToEntity(chart, entity)).toBe(true)
    })

    it('returns false when county code does not match', () => {
      const entity = createMockEntity({
        entity_type: 'admin_county_council',
        uat: { county_code: 'CJ' },
      })
      const chart = createMockChart([
        {
          type: 'line-items-aggregated-yearly',
          filter: { county_codes: ['TM', 'B'] },
        },
      ])

      expect(chartRelatesToEntity(chart, entity)).toBe(false)
    })

    it('handles multiple series - returns true if any matches', () => {
      const entity = createMockEntity({ cui: '12345678' })
      const chart = createMockChart([
        {
          type: 'line-items-aggregated-yearly',
          filter: { entity_cuis: ['87654321'] },
        },
        {
          type: 'line-items-aggregated-yearly',
          filter: { entity_cuis: ['12345678'] },
        },
      ])

      expect(chartRelatesToEntity(chart, entity)).toBe(true)
    })

    it('handles mixed series types', () => {
      const entity = createMockEntity({ cui: '12345678' })
      const chart = createMockChart([
        { type: 'custom-series', data: [] },
        {
          type: 'line-items-aggregated-yearly',
          filter: { entity_cuis: ['12345678'] },
        },
      ])

      expect(chartRelatesToEntity(chart, entity)).toBe(true)
    })

    it('returns true when commitments series matches entity CUI', () => {
      const entity = createMockEntity({ cui: '12345678' })
      const chart = createMockChart([
        {
          type: 'commitments-analytics',
          metric: 'CREDITE_ANGAJAMENT',
          filter: { entity_cuis: ['12345678'] },
        },
      ])

      expect(chartRelatesToEntity(chart, entity)).toBe(true)
    })

    it('returns true when commitments series matches county code', () => {
      const entity = createMockEntity({
        entity_type: 'admin_county_council',
        uat: { county_code: 'CJ' },
      })
      const chart = createMockChart([
        {
          type: 'commitments-analytics',
          metric: 'CREDITE_ANGAJAMENT',
          filter: { county_codes: ['CJ'] },
        },
      ])

      expect(chartRelatesToEntity(chart, entity)).toBe(true)
    })

    it('handles empty filter', () => {
      const entity = createMockEntity({ cui: '12345678' })
      const chart = createMockChart([
        {
          type: 'line-items-aggregated-yearly',
          filter: {},
        },
      ])

      expect(chartRelatesToEntity(chart, entity)).toBe(false)
    })

    it('handles undefined filter', () => {
      const entity = createMockEntity({ cui: '12345678' })
      const chart = createMockChart([
        {
          type: 'line-items-aggregated-yearly',
        },
      ])

      expect(chartRelatesToEntity(chart, entity)).toBe(false)
    })

    it('returns true when INS series matches UAT siruta code', () => {
      const entity = createMockEntity({
        is_uat: true,
        uat: { siruta_code: 54975, county_code: 'CJ' },
      })

      const chart = createMockChart([
        {
          type: 'ins-series',
          sirutaCodes: ['54975'],
        },
      ])

      expect(chartRelatesToEntity(chart, entity)).toBe(true)
    })

    it('returns false for UAT when INS series matches only county territory code', () => {
      const entity = createMockEntity({
        is_uat: true,
        uat: { siruta_code: 54975, county_code: 'CJ' },
      })

      const chart = createMockChart([
        {
          type: 'ins-series',
          territoryCodes: ['CJ'],
        },
      ])

      expect(chartRelatesToEntity(chart, entity)).toBe(false)
    })

    it('returns true when INS series matches county territory code', () => {
      const entity = createMockEntity({
        entity_type: 'admin_county_council',
        uat: { county_code: 'TM' },
      })

      const chart = createMockChart([
        {
          type: 'ins-series',
          territoryCodes: ['CJ', 'TM'],
        },
      ])

      expect(chartRelatesToEntity(chart, entity)).toBe(true)
    })
  })
})
