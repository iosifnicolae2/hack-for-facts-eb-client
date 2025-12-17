import { describe, it, expect, vi } from 'vitest'

// Mock Lingui modules before importing anything that uses them
vi.mock('@lingui/core/macro', () => ({
  msg: (strings: TemplateStringsArray) => strings[0],
  t: (strings: TemplateStringsArray) => strings[0],
}))

vi.mock('@lingui/core', () => ({
  i18n: {
    _: (msg: unknown) => (typeof msg === 'string' ? msg : String(msg)),
    locale: 'en',
  },
}))

// Mock generateRandomColor since it's used in charts schema defaults
vi.mock('@/components/charts/components/chart-renderer/utils', () => ({
  generateRandomColor: vi.fn(() => '#0000ff'),
}))

import { AlertSchema, AlertConditionSchema, AlertOperatorEnum, createEmptyAlert } from './alerts'

describe('alerts schema', () => {
  describe('AlertOperatorEnum', () => {
    it('accepts valid operators', () => {
      expect(AlertOperatorEnum.parse('gt')).toBe('gt')
      expect(AlertOperatorEnum.parse('gte')).toBe('gte')
      expect(AlertOperatorEnum.parse('lt')).toBe('lt')
      expect(AlertOperatorEnum.parse('lte')).toBe('lte')
      expect(AlertOperatorEnum.parse('eq')).toBe('eq')
    })

    it('rejects invalid operators', () => {
      expect(() => AlertOperatorEnum.parse('invalid')).toThrow()
      expect(() => AlertOperatorEnum.parse('')).toThrow()
      expect(() => AlertOperatorEnum.parse('GT')).toThrow()
    })
  })

  describe('AlertConditionSchema', () => {
    it('parses valid condition', () => {
      const result = AlertConditionSchema.parse({
        operator: 'gt',
        threshold: 1000,
        unit: 'EUR',
      })

      expect(result.operator).toBe('gt')
      expect(result.threshold).toBe(1000)
      expect(result.unit).toBe('EUR')
    })

    it('applies defaults', () => {
      const result = AlertConditionSchema.parse({})

      expect(result.operator).toBe('gt')
      expect(result.threshold).toBe(0)
      expect(result.unit).toBe('RON')
    })

    it('validates threshold as number', () => {
      expect(() =>
        AlertConditionSchema.parse({
          threshold: 'not a number',
        })
      ).toThrow()
    })
  })

  describe('AlertSchema', () => {
    it('parses minimal alert', () => {
      const result = AlertSchema.parse({})

      expect(result.isActive).toBe(true)
      expect(result.seriesType).toBe('analytics')
      expect(result.conditions).toEqual([])
      expect(result.filter).toBeDefined()
      expect(result.filter.account_category).toBe('ch')
    })

    it('parses complete alert', () => {
      const alert = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test Alert',
        description: 'A test alert description',
        isActive: false,
        seriesType: 'static' as const,
        datasetId: 'dataset-123',
        conditions: [{ operator: 'gt' as const, threshold: 1000, unit: 'RON' }],
      }

      const result = AlertSchema.parse(alert)

      expect(result.id).toBe(alert.id)
      expect(result.title).toBe('Test Alert')
      expect(result.description).toBe('A test alert description')
      expect(result.isActive).toBe(false)
      expect(result.seriesType).toBe('static')
      expect(result.datasetId).toBe('dataset-123')
      expect(result.conditions).toHaveLength(1)
    })

    it('validates title max length', () => {
      const longTitle = 'a'.repeat(201)
      expect(() => AlertSchema.parse({ title: longTitle })).toThrow(/200 characters/)
    })

    it('validates description max length', () => {
      const longDesc = 'a'.repeat(1001)
      expect(() => AlertSchema.parse({ description: longDesc })).toThrow(/1000 characters/)
    })

    it('validates uuid format for id', () => {
      expect(() => AlertSchema.parse({ id: 'not-a-uuid' })).toThrow()
    })

    it('validates seriesType enum', () => {
      expect(() => AlertSchema.parse({ seriesType: 'invalid' })).toThrow()
    })

    it('creates timestamps on parse', () => {
      const result = AlertSchema.parse({})

      expect(result.createdAt).toBeDefined()
      expect(result.updatedAt).toBeDefined()
      expect(new Date(result.createdAt).getTime()).not.toBeNaN()
    })
  })

  describe('createEmptyAlert', () => {
    it('creates alert with defaults', () => {
      const alert = createEmptyAlert()

      expect(alert.isActive).toBe(true)
      expect(alert.seriesType).toBe('analytics')
      expect(alert.conditions).toEqual([])
      expect(alert.filter).toBeDefined()
    })

    it('merges partial data', () => {
      const alert = createEmptyAlert({
        title: 'Custom Title',
        isActive: false,
      })

      expect(alert.title).toBe('Custom Title')
      expect(alert.isActive).toBe(false)
      expect(alert.seriesType).toBe('analytics')
    })

    it('validates partial data', () => {
      expect(() =>
        createEmptyAlert({
          seriesType: 'invalid' as any,
        })
      ).toThrow()
    })
  })
})
