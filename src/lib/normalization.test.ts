import { describe, it, expect } from 'vitest'
import { normalizeNormalizationOptions } from './normalization'

describe('normalizeNormalizationOptions', () => {
  describe('total normalization', () => {
    it('should return total with RON by default', () => {
      const result = normalizeNormalizationOptions({})

      expect(result.normalization).toBe('total')
      expect(result.currency).toBe('RON')
      expect(result.inflation_adjusted).toBe(false)
      expect(result.show_period_growth).toBe(false)
    })

    it('should preserve explicit currency', () => {
      const result = normalizeNormalizationOptions({ currency: 'EUR' })

      expect(result.normalization).toBe('total')
      expect(result.currency).toBe('EUR')
    })

    it('should handle explicit total normalization', () => {
      const result = normalizeNormalizationOptions({ normalization: 'total' })

      expect(result.normalization).toBe('total')
      expect(result.currency).toBe('RON')
    })
  })

  describe('total_euro normalization', () => {
    it('should convert total_euro to total with EUR', () => {
      const result = normalizeNormalizationOptions({ normalization: 'total_euro' })

      expect(result.normalization).toBe('total')
      expect(result.currency).toBe('EUR')
    })

    it('should preserve inflation_adjusted flag', () => {
      const result = normalizeNormalizationOptions({
        normalization: 'total_euro',
        inflation_adjusted: true,
      })

      expect(result.inflation_adjusted).toBe(true)
    })

    it('should preserve show_period_growth flag', () => {
      const result = normalizeNormalizationOptions({
        normalization: 'total_euro',
        show_period_growth: true,
      })

      expect(result.show_period_growth).toBe(true)
    })
  })

  describe('per_capita normalization', () => {
    it('should handle per_capita with default currency', () => {
      const result = normalizeNormalizationOptions({ normalization: 'per_capita' })

      expect(result.normalization).toBe('per_capita')
      expect(result.currency).toBe('RON')
    })

    it('should preserve explicit currency for per_capita', () => {
      const result = normalizeNormalizationOptions({
        normalization: 'per_capita',
        currency: 'USD',
      })

      expect(result.normalization).toBe('per_capita')
      expect(result.currency).toBe('USD')
    })
  })

  describe('per_capita_euro normalization', () => {
    it('should convert per_capita_euro to per_capita with EUR', () => {
      const result = normalizeNormalizationOptions({ normalization: 'per_capita_euro' })

      expect(result.normalization).toBe('per_capita')
      expect(result.currency).toBe('EUR')
    })

    it('should preserve inflation_adjusted flag', () => {
      const result = normalizeNormalizationOptions({
        normalization: 'per_capita_euro',
        inflation_adjusted: true,
      })

      expect(result.inflation_adjusted).toBe(true)
    })
  })

  describe('percent_gdp normalization', () => {
    it('should handle percent_gdp', () => {
      const result = normalizeNormalizationOptions({ normalization: 'percent_gdp' })

      expect(result.normalization).toBe('percent_gdp')
    })

    it('should force inflation_adjusted to false for percent_gdp', () => {
      const result = normalizeNormalizationOptions({
        normalization: 'percent_gdp',
        inflation_adjusted: true,
      })

      expect(result.inflation_adjusted).toBe(false)
    })

    it('should preserve show_period_growth for percent_gdp', () => {
      const result = normalizeNormalizationOptions({
        normalization: 'percent_gdp',
        show_period_growth: true,
      })

      expect(result.show_period_growth).toBe(true)
    })

    it('should use provided currency for percent_gdp', () => {
      const result = normalizeNormalizationOptions({
        normalization: 'percent_gdp',
        currency: 'EUR',
      })

      expect(result.currency).toBe('EUR')
    })

    it('should default to RON for percent_gdp without currency', () => {
      const result = normalizeNormalizationOptions({ normalization: 'percent_gdp' })

      expect(result.currency).toBe('RON')
    })
  })

  describe('undefined options', () => {
    it('should handle undefined input', () => {
      const result = normalizeNormalizationOptions(undefined)

      expect(result.normalization).toBe('total')
      expect(result.currency).toBe('RON')
      expect(result.inflation_adjusted).toBe(false)
      expect(result.show_period_growth).toBe(false)
    })
  })

  describe('boolean coercion', () => {
    it('should coerce undefined inflation_adjusted to false', () => {
      const result = normalizeNormalizationOptions({ normalization: 'total' })

      expect(result.inflation_adjusted).toBe(false)
    })

    it('should coerce undefined show_period_growth to false', () => {
      const result = normalizeNormalizationOptions({ normalization: 'total' })

      expect(result.show_period_growth).toBe(false)
    })

    it('should preserve true values', () => {
      const result = normalizeNormalizationOptions({
        inflation_adjusted: true,
        show_period_growth: true,
      })

      expect(result.inflation_adjusted).toBe(true)
      expect(result.show_period_growth).toBe(true)
    })

    it('should preserve false values explicitly set', () => {
      const result = normalizeNormalizationOptions({
        inflation_adjusted: false,
        show_period_growth: false,
      })

      expect(result.inflation_adjusted).toBe(false)
      expect(result.show_period_growth).toBe(false)
    })
  })

  describe('combined options', () => {
    it('should handle all options together', () => {
      const result = normalizeNormalizationOptions({
        normalization: 'per_capita',
        currency: 'EUR',
        inflation_adjusted: true,
        show_period_growth: true,
      })

      expect(result.normalization).toBe('per_capita')
      expect(result.currency).toBe('EUR')
      expect(result.inflation_adjusted).toBe(true)
      expect(result.show_period_growth).toBe(true)
    })

    it('should override currency when using _euro suffixed normalization', () => {
      const result = normalizeNormalizationOptions({
        normalization: 'total_euro',
        currency: 'USD', // This should be overridden
      })

      expect(result.currency).toBe('EUR')
    })
  })
})
