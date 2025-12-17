import { describe, it, expect } from 'vitest'
import { getXAxisUnit, parseQuarter, parseMonth } from './chart-data-utils'
import type { AnalyticsSeries } from '@/schemas/charts'

describe('chart-data-utils', () => {
  describe('getXAxisUnit', () => {
    it('returns year by default when map is empty', () => {
      const emptyMap = new Map<string, AnalyticsSeries>()
      expect(getXAxisUnit(emptyMap)).toBe('year')
    })

    it('returns year when xAxis unit is empty', () => {
      const seriesMap = new Map<string, AnalyticsSeries>([
        [
          'series1',
          {
            seriesId: 'series1',
            xAxis: { name: 'Period', type: 'STRING', unit: '' },
            yAxis: { name: 'Amount', type: 'FLOAT', unit: 'RON' },
            data: [],
          },
        ],
      ])
      expect(getXAxisUnit(seriesMap)).toBe('year')
    })

    it('returns month when xAxis unit is month', () => {
      const seriesMap = new Map<string, AnalyticsSeries>([
        [
          'series1',
          {
            seriesId: 'series1',
            xAxis: { name: 'Period', type: 'STRING', unit: 'month' },
            yAxis: { name: 'Amount', type: 'FLOAT', unit: 'RON' },
            data: [],
          },
        ],
      ])
      expect(getXAxisUnit(seriesMap)).toBe('month')
    })

    it('returns month when xAxis unit is MONTH (case insensitive)', () => {
      const seriesMap = new Map<string, AnalyticsSeries>([
        [
          'series1',
          {
            seriesId: 'series1',
            xAxis: { name: 'Period', type: 'STRING', unit: 'MONTH' },
            yAxis: { name: 'Amount', type: 'FLOAT', unit: 'RON' },
            data: [],
          },
        ],
      ])
      expect(getXAxisUnit(seriesMap)).toBe('month')
    })

    it('returns quarter when xAxis unit is quarter', () => {
      const seriesMap = new Map<string, AnalyticsSeries>([
        [
          'series1',
          {
            seriesId: 'series1',
            xAxis: { name: 'Period', type: 'STRING', unit: 'quarter' },
            yAxis: { name: 'Amount', type: 'FLOAT', unit: 'RON' },
            data: [],
          },
        ],
      ])
      expect(getXAxisUnit(seriesMap)).toBe('quarter')
    })

    it('returns quarter when xAxis unit is QUARTER (case insensitive)', () => {
      const seriesMap = new Map<string, AnalyticsSeries>([
        [
          'series1',
          {
            seriesId: 'series1',
            xAxis: { name: 'Period', type: 'STRING', unit: 'QUARTER' },
            yAxis: { name: 'Amount', type: 'FLOAT', unit: 'RON' },
            data: [],
          },
        ],
      ])
      expect(getXAxisUnit(seriesMap)).toBe('quarter')
    })

    it('returns year for unrecognized unit', () => {
      const seriesMap = new Map<string, AnalyticsSeries>([
        [
          'series1',
          {
            seriesId: 'series1',
            xAxis: { name: 'Period', type: 'STRING', unit: 'day' },
            yAxis: { name: 'Amount', type: 'FLOAT', unit: 'RON' },
            data: [],
          },
        ],
      ])
      expect(getXAxisUnit(seriesMap)).toBe('year')
    })

    it('uses first series in map', () => {
      const seriesMap = new Map<string, AnalyticsSeries>([
        [
          'series1',
          {
            seriesId: 'series1',
            xAxis: { name: 'Period', type: 'STRING', unit: 'month' },
            yAxis: { name: 'Amount', type: 'FLOAT', unit: 'RON' },
            data: [],
          },
        ],
        [
          'series2',
          {
            seriesId: 'series2',
            xAxis: { name: 'Period', type: 'STRING', unit: 'quarter' },
            yAxis: { name: 'Amount', type: 'FLOAT', unit: 'RON' },
            data: [],
          },
        ],
      ])
      expect(getXAxisUnit(seriesMap)).toBe('month')
    })
  })

  describe('parseQuarter', () => {
    it('parses Q1-Q4 format', () => {
      expect(parseQuarter('Q1')).toEqual({ y: null, q: 1 })
      expect(parseQuarter('Q2')).toEqual({ y: null, q: 2 })
      expect(parseQuarter('Q3')).toEqual({ y: null, q: 3 })
      expect(parseQuarter('Q4')).toEqual({ y: null, q: 4 })
    })

    it('parses lowercase q1-q4 format', () => {
      expect(parseQuarter('q1')).toEqual({ y: null, q: 1 })
      expect(parseQuarter('q2')).toEqual({ y: null, q: 2 })
    })

    it('parses YYYY-Q format', () => {
      expect(parseQuarter('2020-Q1')).toEqual({ y: 2020, q: 1 })
      expect(parseQuarter('2023-Q4')).toEqual({ y: 2023, q: 4 })
      expect(parseQuarter('2025-Q2')).toEqual({ y: 2025, q: 2 })
    })

    it('parses lowercase yyyy-q format', () => {
      expect(parseQuarter('2020-q1')).toEqual({ y: 2020, q: 1 })
    })

    it('parses single digit 1-4', () => {
      expect(parseQuarter('1')).toEqual({ y: null, q: 1 })
      expect(parseQuarter('2')).toEqual({ y: null, q: 2 })
      expect(parseQuarter('3')).toEqual({ y: null, q: 3 })
      expect(parseQuarter('4')).toEqual({ y: null, q: 4 })
    })

    it('returns null for invalid quarter numbers when not matching Q format', () => {
      // Note: Q0 and Q5 match the ^Q(\d)$ regex, but we strictly validate 1-4 range
      expect(parseQuarter('Q0')).toEqual({ y: null, q: null })
      expect(parseQuarter('Q5')).toEqual({ y: null, q: null })
      expect(parseQuarter('0')).toEqual({ y: null, q: null })
      expect(parseQuarter('5')).toEqual({ y: null, q: null })
    })

    it('returns null for invalid formats', () => {
      expect(parseQuarter('')).toEqual({ y: null, q: null })
      expect(parseQuarter('abc')).toEqual({ y: null, q: null })
      expect(parseQuarter('2020')).toEqual({ y: null, q: null })
      expect(parseQuarter('2020-01')).toEqual({ y: null, q: null })
    })

    it('handles whitespace', () => {
      expect(parseQuarter('  Q1  ')).toEqual({ y: null, q: 1 })
      expect(parseQuarter('  2020-Q1  ')).toEqual({ y: 2020, q: 1 })
    })
  })

  describe('parseMonth', () => {
    it('parses YYYY-MM format', () => {
      expect(parseMonth('2023-01')).toEqual({ y: 2023, m: 1 })
      expect(parseMonth('2023-06')).toEqual({ y: 2023, m: 6 })
      expect(parseMonth('2023-12')).toEqual({ y: 2023, m: 12 })
    })

    it('parses two-digit month format', () => {
      expect(parseMonth('01')).toEqual({ y: null, m: 1 })
      expect(parseMonth('06')).toEqual({ y: null, m: 6 })
      expect(parseMonth('12')).toEqual({ y: null, m: 12 })
    })

    it('parses single-digit month format', () => {
      expect(parseMonth('1')).toEqual({ y: null, m: 1 })
      expect(parseMonth('6')).toEqual({ y: null, m: 6 })
      expect(parseMonth('9')).toEqual({ y: null, m: 9 })
    })

    it('returns null for invalid formats', () => {
      expect(parseMonth('')).toEqual({ y: null, m: null })
      expect(parseMonth('abc')).toEqual({ y: null, m: null })
      expect(parseMonth('2023')).toEqual({ y: null, m: null })
      expect(parseMonth('2023-Q1')).toEqual({ y: null, m: null })
    })

    it('handles whitespace', () => {
      expect(parseMonth('  2023-01  ')).toEqual({ y: 2023, m: 1 })
      expect(parseMonth('  01  ')).toEqual({ y: null, m: 1 })
    })
  })
})
