import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Lingui before importing the module
vi.mock('@lingui/core/macro', () => ({
  t: (strings: TemplateStringsArray) => strings[0],
}))

// Mock classification functions
vi.mock('@/lib/classifications', () => ({
  getClassificationName: vi.fn((code: string) => {
    const names: Record<string, string> = {
      '70': 'Education',
      '84': 'Health',
    }
    return names[code]
  }),
}))

vi.mock('@/lib/economic-classifications', () => ({
  getEconomicChapterName: vi.fn((code: string) => {
    const names: Record<string, string> = {
      '10': 'Personnel Expenses',
      '20': 'Goods and Services',
    }
    return names[code]
  }),
  getEconomicSubchapterName: vi.fn((code: string) => {
    const names: Record<string, string> = {
      '10.01': 'Salaries',
      '20.01': 'Office Supplies',
    }
    return names[code]
  }),
}))

// Mock the hooks since they use React and Lingui internally
vi.mock('@/hooks/filters/useFilterLabels', () => ({
  useAccountCategoryLabel: vi.fn(),
  useBudgetSectorLabel: vi.fn(),
  useEconomicClassificationLabel: vi.fn(),
  useEntityLabel: vi.fn(),
  useEntityTypeLabel: vi.fn(),
  useFunctionalClassificationLabel: vi.fn(),
  useFundingSourceLabel: vi.fn(),
  useUatLabel: vi.fn(),
}))

import {
  getFunctionalPrefixLabel,
  getEconomicPrefixLabel,
  createDataDiscoveryUrl,
  createEntityUrl,
  isEntityCui,
  isInteractiveFilter,
  getSortOrder,
  collectUniqueFilterValues,
  countPotentialReplacements,
  replaceFilterValue,
} from './chart-filter-utils'
import type { Chart } from '@/schemas/charts'

describe('chart-filter-utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getFunctionalPrefixLabel', () => {
    it('returns code with name when found', () => {
      expect(getFunctionalPrefixLabel('70')).toBe('70 - Education')
      expect(getFunctionalPrefixLabel('84')).toBe('84 - Health')
    })

    it('returns just the prefix when name not found', () => {
      expect(getFunctionalPrefixLabel('99')).toBe('99')
    })

    it('normalizes prefix by removing trailing dot', () => {
      expect(getFunctionalPrefixLabel('70.')).toBe('70 - Education')
    })

    it('trims whitespace', () => {
      expect(getFunctionalPrefixLabel('  70  ')).toBe('70 - Education')
    })
  })

  describe('getEconomicPrefixLabel', () => {
    it('returns chapter name for single-part code', () => {
      expect(getEconomicPrefixLabel('10')).toBe('10 - Personnel Expenses')
      expect(getEconomicPrefixLabel('20')).toBe('20 - Goods and Services')
    })

    it('returns subchapter name for two-part code', () => {
      expect(getEconomicPrefixLabel('10.01')).toBe('10.01 - Salaries')
      expect(getEconomicPrefixLabel('20.01')).toBe('20.01 - Office Supplies')
    })

    it('returns just the prefix when name not found', () => {
      expect(getEconomicPrefixLabel('99')).toBe('99')
      expect(getEconomicPrefixLabel('10.99')).toBe('10.99')
    })

    it('normalizes prefix by removing trailing dot', () => {
      expect(getEconomicPrefixLabel('10.')).toBe('10 - Personnel Expenses')
    })
  })

  describe('createDataDiscoveryUrl', () => {
    it('creates URL with key and value', () => {
      expect(createDataDiscoveryUrl('entity_cuis', '12345')).toBe('/data-discovery?entity_cuis=12345')
      expect(createDataDiscoveryUrl('functional_prefixes', '70')).toBe('/data-discovery?functional_prefixes=70')
    })
  })

  describe('createEntityUrl', () => {
    it('creates entity URL with CUI', () => {
      expect(createEntityUrl('12345678')).toBe('/entities/12345678')
    })
  })

  describe('isEntityCui', () => {
    it('returns true for cui key', () => {
      expect(isEntityCui('cui')).toBe(true)
    })

    it('returns false for other keys', () => {
      expect(isEntityCui('entity_cuis')).toBe(false)
      expect(isEntityCui('name')).toBe(false)
    })
  })

  describe('isInteractiveFilter', () => {
    it('returns true for cui', () => {
      expect(isInteractiveFilter('cui')).toBe(true)
    })

    it('returns false for other keys', () => {
      expect(isInteractiveFilter('entity_cuis')).toBe(false)
      expect(isInteractiveFilter('functional_codes')).toBe(false)
    })
  })

  describe('getSortOrder', () => {
    it('sorts according to predefined order', () => {
      expect(getSortOrder('account_category', 'report_period')).toBeLessThan(0)
      expect(getSortOrder('report_period', 'account_category')).toBeGreaterThan(0)
      expect(getSortOrder('entity_cuis', 'functional_prefixes')).toBeLessThan(0)
    })

    it('returns 0 for same keys', () => {
      expect(getSortOrder('entity_cuis', 'entity_cuis')).toBe(0)
    })

    it('puts unknown keys at the end', () => {
      expect(getSortOrder('unknown_key' as any, 'account_category')).toBeGreaterThan(0)
      expect(getSortOrder('account_category', 'unknown_key' as any)).toBeLessThan(0)
    })

    it('returns 0 for two unknown keys', () => {
      expect(getSortOrder('unknown1' as any, 'unknown2' as any)).toBe(0)
    })
  })

  describe('collectUniqueFilterValues', () => {
    const createChart = (series: any[]): Chart =>
      ({
        id: 'test',
        title: 'Test',
        config: { chartType: 'line' },
        series,
        annotations: [],
      }) as unknown as Chart

    it('collects unique values from array filters', () => {
      const chart = createChart([
        { type: 'line-items-aggregated-yearly', filter: { entity_cuis: ['123', '456'] } },
        { type: 'line-items-aggregated-yearly', filter: { entity_cuis: ['456', '789'] } },
      ])

      const result = collectUniqueFilterValues(chart, 'entity_cuis')
      expect(result.sort()).toEqual(['123', '456', '789'])
    })

    it('collects unique values from scalar filters', () => {
      const chart = createChart([
        { type: 'line-items-aggregated-yearly', filter: { is_uat: true } },
        { type: 'line-items-aggregated-yearly', filter: { is_uat: false } },
      ])

      const result = collectUniqueFilterValues(chart, 'is_uat')
      expect(result.sort()).toEqual(['false', 'true'])
    })

    it('ignores non-aggregated series', () => {
      const chart = createChart([
        { type: 'custom-series', data: [], entity_cuis: ['123'] },
        { type: 'line-items-aggregated-yearly', filter: { entity_cuis: ['456'] } },
      ])

      const result = collectUniqueFilterValues(chart, 'entity_cuis')
      expect(result).toEqual(['456'])
    })

    it('returns empty array when no values found', () => {
      const chart = createChart([{ type: 'line-items-aggregated-yearly', filter: {} }])

      const result = collectUniqueFilterValues(chart, 'entity_cuis')
      expect(result).toEqual([])
    })
  })

  describe('countPotentialReplacements', () => {
    const createChart = (series: any[]): Chart =>
      ({
        id: 'test',
        title: 'Test',
        config: { chartType: 'line' },
        series,
        annotations: [],
      }) as unknown as Chart

    it('counts occurrences in array filters', () => {
      const chart = createChart([
        { type: 'line-items-aggregated-yearly', filter: { entity_cuis: ['123', '456'] } },
        { type: 'line-items-aggregated-yearly', filter: { entity_cuis: ['123', '789'] } },
      ])

      expect(countPotentialReplacements(chart, 'entity_cuis', '123')).toBe(2)
      expect(countPotentialReplacements(chart, 'entity_cuis', '456')).toBe(1)
      expect(countPotentialReplacements(chart, 'entity_cuis', '999')).toBe(0)
    })

    it('counts occurrences in scalar filters', () => {
      const chart = createChart([
        { type: 'line-items-aggregated-yearly', filter: { account_category: 'ch' } },
        { type: 'line-items-aggregated-yearly', filter: { account_category: 'ch' } },
        { type: 'line-items-aggregated-yearly', filter: { account_category: 'vn' } },
      ])

      expect(countPotentialReplacements(chart, 'account_category', 'ch')).toBe(2)
      expect(countPotentialReplacements(chart, 'account_category', 'vn')).toBe(1)
    })
  })

  describe('replaceFilterValue', () => {
    const createChart = (series: any[]): Chart =>
      ({
        id: 'test',
        title: 'Test',
        config: { chartType: 'line' },
        series,
        annotations: [],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      }) as unknown as Chart

    it('replaces values in array filters', () => {
      const chart = createChart([
        { type: 'line-items-aggregated-yearly', filter: { entity_cuis: ['123', '456'] } },
      ])

      const result = replaceFilterValue(chart, 'entity_cuis', '123', '999')

      expect((result.series[0] as any).filter.entity_cuis).toEqual(['999', '456'])
    })

    it('replaces values in scalar filters', () => {
      const chart = createChart([
        { type: 'line-items-aggregated-yearly', filter: { account_category: 'ch' } },
      ])

      const result = replaceFilterValue(chart, 'account_category', 'ch', 'vn')

      expect((result.series[0] as any).filter.account_category).toBe('vn')
    })

    it('parses boolean values for is_uat', () => {
      const chart = createChart([{ type: 'line-items-aggregated-yearly', filter: { is_uat: false } }])

      const result = replaceFilterValue(chart, 'is_uat', 'false', 'true')

      expect((result.series[0] as any).filter.is_uat).toBe(true)
    })

    it('updates the updatedAt timestamp', () => {
      const chart = createChart([
        { type: 'line-items-aggregated-yearly', filter: { entity_cuis: ['123'] } },
      ])

      const result = replaceFilterValue(chart, 'entity_cuis', '123', '999')

      expect(result.updatedAt).not.toBe(chart.updatedAt)
    })

    it('does not modify non-aggregated series', () => {
      const chart = createChart([
        { type: 'custom-series', data: [], filter: { entity_cuis: ['123'] } },
      ])

      const result = replaceFilterValue(chart, 'entity_cuis', '123', '999')

      expect((result.series[0] as any).filter?.entity_cuis).toEqual(['123'])
    })
  })
})
