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

// Mock JSON imports
vi.mock('@/assets/functional-classifications-general-ro.json', () => ({
  default: [],
}))

vi.mock('@/assets/functional-classifications-general-en.json', () => ({
  default: [],
}))

vi.mock('@/assets/economic-classifications-general-ro.json', () => ({
  default: [],
}))

vi.mock('@/assets/economic-classifications-general-en.json', () => ({
  default: [],
}))

// Mock getUserLocale
vi.mock('@/lib/utils', () => ({
  getUserLocale: vi.fn(() => 'en'),
}))

import {
  getClassificationLevel,
  parseClassificationCode,
  getParentCode,
  isChildOf,
  isDescendantOf,
  getAncestorCodes,
  getCodePath,
  filterClassifications,
  getSearchMatchesWithAncestors,
  codeMatchesSearch,
} from './classification-explorer-utils'
import type { FlatClassification } from '@/types/classification-explorer'

describe('classification-explorer-utils', () => {
  describe('getClassificationLevel', () => {
    it('returns chapter for codes without dots', () => {
      expect(getClassificationLevel('68')).toBe('chapter')
      expect(getClassificationLevel('10')).toBe('chapter')
      expect(getClassificationLevel('1')).toBe('chapter')
    })

    it('returns subchapter for codes with one dot', () => {
      expect(getClassificationLevel('68.03')).toBe('subchapter')
      expect(getClassificationLevel('10.01')).toBe('subchapter')
    })

    it('returns paragraph for codes with two or more dots', () => {
      expect(getClassificationLevel('68.03.01')).toBe('paragraph')
      expect(getClassificationLevel('10.01.30')).toBe('paragraph')
      expect(getClassificationLevel('10.01.30.01')).toBe('paragraph')
    })
  })

  describe('parseClassificationCode', () => {
    it('parses chapter-only code', () => {
      const result = parseClassificationCode('68')
      expect(result).toEqual({
        chapter: '68',
        subchapter: undefined,
        paragraph: undefined,
      })
    })

    it('parses subchapter code', () => {
      const result = parseClassificationCode('68.03')
      expect(result).toEqual({
        chapter: '68',
        subchapter: '68.03',
        paragraph: undefined,
      })
    })

    it('parses paragraph code', () => {
      const result = parseClassificationCode('68.03.01')
      expect(result).toEqual({
        chapter: '68',
        subchapter: '68.03',
        paragraph: '68.03.01',
      })
    })

    it('parses deeply nested code', () => {
      const result = parseClassificationCode('68.03.01.02')
      expect(result).toEqual({
        chapter: '68',
        subchapter: '68.03',
        paragraph: '68.03.01.02',
      })
    })
  })

  describe('getParentCode', () => {
    it('returns null for chapter-level code', () => {
      expect(getParentCode('68')).toBeNull()
      expect(getParentCode('10')).toBeNull()
    })

    it('returns chapter for subchapter', () => {
      expect(getParentCode('68.03')).toBe('68')
      expect(getParentCode('10.01')).toBe('10')
    })

    it('returns subchapter for paragraph', () => {
      expect(getParentCode('68.03.01')).toBe('68.03')
    })

    it('returns parent for deeply nested code', () => {
      expect(getParentCode('68.03.01.02')).toBe('68.03.01')
    })
  })

  describe('isChildOf', () => {
    it('returns true for direct children', () => {
      expect(isChildOf('68.03', '68')).toBe(true)
      expect(isChildOf('68.03.01', '68.03')).toBe(true)
    })

    it('returns false for self-reference', () => {
      expect(isChildOf('68', '68')).toBe(false)
    })

    it('returns true for grandchildren (implementation checks startsWith)', () => {
      // Note: The implementation uses startsWith(parent + '.'), so grandchildren also match
      // This effectively checks "is descendant" rather than "is direct child"
      expect(isChildOf('68.03.01', '68')).toBe(true)
    })

    it('returns false for unrelated codes', () => {
      expect(isChildOf('69.03', '68')).toBe(false)
      expect(isChildOf('10.01', '68')).toBe(false)
    })
  })

  describe('isDescendantOf', () => {
    it('returns true for direct children', () => {
      expect(isDescendantOf('68.03', '68')).toBe(true)
    })

    it('returns true for grandchildren', () => {
      expect(isDescendantOf('68.03.01', '68')).toBe(true)
      expect(isDescendantOf('68.03.01.02', '68')).toBe(true)
    })

    it('returns false for self', () => {
      expect(isDescendantOf('68', '68')).toBe(false)
    })

    it('returns false for unrelated codes', () => {
      expect(isDescendantOf('10.01', '68')).toBe(false)
    })
  })

  describe('getAncestorCodes', () => {
    it('returns empty array for chapter', () => {
      expect(getAncestorCodes('68')).toEqual([])
    })

    it('returns chapter for subchapter', () => {
      expect(getAncestorCodes('68.03')).toEqual(['68'])
    })

    it('returns all ancestors for paragraph', () => {
      expect(getAncestorCodes('68.03.01')).toEqual(['68', '68.03'])
    })

    it('returns all ancestors for deeply nested code', () => {
      expect(getAncestorCodes('68.03.01.02')).toEqual(['68', '68.03', '68.03.01'])
    })
  })

  describe('getCodePath', () => {
    it('returns single element for chapter', () => {
      expect(getCodePath('68')).toEqual(['68'])
    })

    it('returns full path for subchapter', () => {
      expect(getCodePath('68.03')).toEqual(['68', '68.03'])
    })

    it('returns full path for paragraph', () => {
      expect(getCodePath('68.03.01')).toEqual(['68', '68.03', '68.03.01'])
    })
  })

  describe('filterClassifications', () => {
    const classifications: FlatClassification[] = [
      { code: '68', name: 'Social Protection', description: undefined },
      { code: '68.03', name: 'Elderly Care', description: undefined },
      { code: '70', name: 'Education', description: undefined },
      { code: '70.11', name: 'Primary Education', description: undefined },
    ]

    it('returns all for empty search', () => {
      expect(filterClassifications(classifications, '')).toEqual(classifications)
      expect(filterClassifications(classifications, '   ')).toEqual(classifications)
    })

    it('filters by code', () => {
      const result = filterClassifications(classifications, '68')
      expect(result).toHaveLength(2)
      expect(result.map((c) => c.code)).toEqual(['68', '68.03'])
    })

    it('filters by name case-insensitive', () => {
      const result = filterClassifications(classifications, 'education')
      expect(result).toHaveLength(2)
      expect(result.map((c) => c.code)).toEqual(['70', '70.11'])
    })

    it('filters by partial name', () => {
      const result = filterClassifications(classifications, 'care')
      expect(result).toHaveLength(1)
      expect(result[0]!.code).toBe('68.03')
    })

    it('returns empty for no matches', () => {
      const result = filterClassifications(classifications, 'xyz')
      expect(result).toHaveLength(0)
    })
  })

  describe('getSearchMatchesWithAncestors', () => {
    const classifications: FlatClassification[] = [
      { code: '68', name: 'Social Protection', description: undefined },
      { code: '68.03', name: 'Elderly Care', description: undefined },
      { code: '68.03.01', name: 'Nursing Homes', description: undefined },
      { code: '70', name: 'Education', description: undefined },
    ]

    it('returns matches and their ancestors', () => {
      const result = getSearchMatchesWithAncestors(classifications, 'nursing')
      expect(result.has('68.03.01')).toBe(true) // match
      expect(result.has('68.03')).toBe(true) // ancestor
      expect(result.has('68')).toBe(true) // ancestor
      expect(result.has('70')).toBe(false)
    })

    it('returns empty set for no matches', () => {
      const result = getSearchMatchesWithAncestors(classifications, 'xyz')
      expect(result.size).toBe(0)
    })
  })

  describe('codeMatchesSearch', () => {
    const classifications: FlatClassification[] = [
      { code: '68', name: 'Social Protection', description: undefined },
      { code: '68.03', name: 'Elderly Care', description: undefined },
      { code: '68.03.01', name: 'Nursing Homes', description: undefined },
    ]

    it('returns true for empty search', () => {
      expect(codeMatchesSearch('68', classifications, '')).toBe(true)
    })

    it('returns true if code name matches', () => {
      expect(codeMatchesSearch('68', classifications, 'social')).toBe(true)
    })

    it('returns true if code matches', () => {
      expect(codeMatchesSearch('68.03', classifications, '68.03')).toBe(true)
    })

    it('returns true if descendant matches', () => {
      expect(codeMatchesSearch('68', classifications, 'nursing')).toBe(true)
    })

    it('returns false if no match', () => {
      expect(codeMatchesSearch('68', classifications, 'education')).toBe(false)
    })
  })
})
