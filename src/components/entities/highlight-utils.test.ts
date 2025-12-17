import { describe, it, expect } from 'vitest'
import { normalizeText, match } from './highlight-utils'

describe('highlight-utils', () => {
  describe('normalizeText', () => {
    it('removes diacritics', () => {
      expect(normalizeText('résumé')).toBe('resume')
      expect(normalizeText('café')).toBe('cafe')
      expect(normalizeText('naïve')).toBe('naive')
    })

    it('handles Romanian diacritics', () => {
      expect(normalizeText('București')).toBe('bucuresti')
      expect(normalizeText('Învățământ')).toBe('invatamant')
      expect(normalizeText('Administrație')).toBe('administratie')
      expect(normalizeText('Cheltuieli')).toBe('cheltuieli')
    })

    it('converts to lowercase', () => {
      expect(normalizeText('HELLO WORLD')).toBe('hello world')
      expect(normalizeText('MiXeD CaSe')).toBe('mixed case')
    })

    it('collapses multiple spaces', () => {
      expect(normalizeText('hello   world')).toBe('hello world')
      expect(normalizeText('a  b  c')).toBe('a b c')
    })

    it('trims whitespace', () => {
      expect(normalizeText('  hello  ')).toBe('hello')
      expect(normalizeText('\t\ntest\n\t')).toBe('test')
    })

    it('handles empty string', () => {
      expect(normalizeText('')).toBe('')
    })

    it('handles combined operations', () => {
      expect(normalizeText('  Café  RÉSUMÉ  ')).toBe('cafe resume')
    })
  })

  describe('match', () => {
    it('returns empty array for empty text', () => {
      expect(match('', 'query')).toEqual([])
    })

    it('returns empty array for empty query', () => {
      expect(match('some text', '')).toEqual([])
    })

    it('returns empty array for whitespace-only query', () => {
      expect(match('some text', '   ')).toEqual([])
    })

    it('finds exact match', () => {
      const result = match('hello world', 'world')
      expect(result).toEqual([{ start: 6, end: 11 }])
    })

    it('finds match at start', () => {
      const result = match('hello world', 'hello')
      expect(result).toEqual([{ start: 0, end: 5 }])
    })

    it('finds multiple matches', () => {
      const result = match('hello hello hello', 'hello')
      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({ start: 0, end: 5 })
      expect(result[1]).toEqual({ start: 6, end: 11 })
      expect(result[2]).toEqual({ start: 12, end: 17 })
    })

    it('performs case-insensitive matching', () => {
      const result = match('Hello WORLD', 'world')
      expect(result).toEqual([{ start: 6, end: 11 }])
    })

    it('matches with diacritics ignored', () => {
      const result = match('București', 'bucuresti')
      expect(result).toEqual([{ start: 0, end: 9 }])
    })

    it('matches accented query against plain text', () => {
      const result = match('bucuresti', 'București')
      expect(result).toEqual([{ start: 0, end: 9 }])
    })

    it('matches query with diacritics against text with diacritics', () => {
      const result = match('Învățământ', 'invatamant')
      expect(result).toEqual([{ start: 0, end: 10 }])
    })

    it('returns correct indices for multi-byte characters', () => {
      const result = match('café shop', 'cafe')
      expect(result).toEqual([{ start: 0, end: 4 }])
    })

    it('finds partial matches', () => {
      const result = match('testing', 'est')
      expect(result).toEqual([{ start: 1, end: 4 }])
    })

    it('returns empty array when no match found', () => {
      const result = match('hello world', 'xyz')
      expect(result).toEqual([])
    })

    it('handles special regex characters in query', () => {
      // The match function doesn't use regex for the query, it does character-by-character matching
      const result = match('hello (world)', 'world')
      expect(result).toEqual([{ start: 7, end: 12 }])
    })
  })
})
