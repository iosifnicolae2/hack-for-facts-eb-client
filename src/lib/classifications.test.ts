import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock JSON imports before importing the module
vi.mock('@/assets/functional-classifications-general-ro.json', () => ({
  default: [
    {
      description: 'TOTAL VENITURI',
      children: [
        {
          code: '01',
          description: 'Impozit pe profit',
          children: [
            { code: '01.01', description: 'Impozit pe profit de la agenți economici' },
            { code: '01.02', description: 'Impozit pe profit de la bănci comerciale' },
          ],
        },
        {
          code: '51',
          description: 'Administrație publică',
          children: [
            {
              code: '51.01',
              description: 'Autorități executive și legislative',
              children: [
                { code: '51.01.01', description: 'Autorități executive' },
                { code: '51.01.02', description: 'Autorități legislative' },
              ],
            },
            { code: '51.02', description: 'Servicii publice generale' },
          ],
        },
        {
          code: '65',
          description: 'Învățământ',
          children: [
            { code: '65.03', description: 'Învățământ liceal' },
            { code: '65.03.00', description: 'Învățământ liceal general' },
          ],
        },
      ],
    },
  ],
}))

vi.mock('@/assets/functional-classifications-general-en.json', () => ({
  default: [
    {
      description: 'TOTAL REVENUES',
      children: [
        {
          code: '01',
          description: 'Profit tax',
          children: [
            { code: '01.01', description: 'Profit tax from economic agents' },
            { code: '01.02', description: 'Profit tax from commercial banks' },
          ],
        },
        {
          code: '51',
          description: 'Public Administration',
          children: [
            {
              code: '51.01',
              description: 'Executive and Legislative',
              children: [
                { code: '51.01.01', description: 'Executive authorities' },
                { code: '51.01.02', description: 'Legislative authorities' },
              ],
            },
            { code: '51.02', description: 'General public services' },
          ],
        },
        {
          code: '65',
          description: 'Education',
          children: [
            { code: '65.03', description: 'Secondary education' },
            { code: '65.03.00', description: 'General secondary education' },
          ],
        },
      ],
    },
  ],
}))

// Mock getUserLocale
const mockGetUserLocale = vi.fn(() => 'en')
vi.mock('@/lib/utils', () => ({
  getUserLocale: () => mockGetUserLocale(),
}))

// Import after mocking
import { getClassificationName, getClassificationParent } from './classifications'

describe('classifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserLocale.mockReturnValue('en')
  })

  describe('getClassificationName', () => {
    describe('with English locale', () => {
      beforeEach(() => {
        mockGetUserLocale.mockReturnValue('en')
      })

      it('returns name for chapter code', () => {
        expect(getClassificationName('01')).toBe('Profit tax')
        expect(getClassificationName('51')).toBe('Public Administration')
        expect(getClassificationName('65')).toBe('Education')
      })

      it('returns name for subchapter code', () => {
        expect(getClassificationName('01.01')).toBe('Profit tax from economic agents')
        expect(getClassificationName('51.01')).toBe('Executive and Legislative')
        expect(getClassificationName('65.03')).toBe('Secondary education')
      })

      it('returns name for detailed code', () => {
        expect(getClassificationName('51.01.01')).toBe('Executive authorities')
        expect(getClassificationName('51.01.02')).toBe('Legislative authorities')
      })

      it('returns undefined for non-existent code', () => {
        expect(getClassificationName('99')).toBeUndefined()
        expect(getClassificationName('51.99')).toBeUndefined()
      })

      it('falls back to parent for codes ending in 00', () => {
        // 65.03.00 exists directly in the mock, so returns that value
        expect(getClassificationName('65.03.00')).toBe('General secondary education')
      })

      it('recursively strips 00 suffixes', () => {
        // If code ends in .00 and not found, try without .00
        // Since we have 65.03.00 in the mock, test with a non-existent one
        // Actually testing the fallback: if we look for a code like 51.01.00 (not in mock)
        // it should fall back to 51.01
        expect(getClassificationName('51.01.00')).toBe('Executive and Legislative')
      })
    })

    describe('with Romanian locale', () => {
      beforeEach(() => {
        mockGetUserLocale.mockReturnValue('ro')
      })

      it('returns Romanian name for chapter code', () => {
        expect(getClassificationName('01')).toBe('Impozit pe profit')
        expect(getClassificationName('51')).toBe('Administrație publică')
        expect(getClassificationName('65')).toBe('Învățământ')
      })

      it('returns Romanian name for subchapter code', () => {
        expect(getClassificationName('01.01')).toBe('Impozit pe profit de la agenți economici')
        expect(getClassificationName('51.01')).toBe('Autorități executive și legislative')
        expect(getClassificationName('65.03')).toBe('Învățământ liceal')
      })

      it('returns Romanian name for detailed code', () => {
        expect(getClassificationName('51.01.01')).toBe('Autorități executive')
        expect(getClassificationName('51.01.02')).toBe('Autorități legislative')
      })
    })

    describe('locale switching', () => {
      it('returns correct locale-specific name', () => {
        mockGetUserLocale.mockReturnValue('en')
        expect(getClassificationName('51')).toBe('Public Administration')

        mockGetUserLocale.mockReturnValue('ro')
        expect(getClassificationName('51')).toBe('Administrație publică')
      })
    })
  })

  describe('getClassificationParent', () => {
    it('returns parent for code with multiple parts', () => {
      expect(getClassificationParent('51.01.02')).toBe('51.01')
      expect(getClassificationParent('51.01')).toBe('51')
      expect(getClassificationParent('01.01')).toBe('01')
    })

    it('returns null for top-level code', () => {
      expect(getClassificationParent('51')).toBeNull()
      expect(getClassificationParent('01')).toBeNull()
      expect(getClassificationParent('65')).toBeNull()
    })

    it('handles codes with many levels', () => {
      expect(getClassificationParent('51.01.02.03')).toBe('51.01.02')
      expect(getClassificationParent('a.b.c.d')).toBe('a.b.c')
    })

    it('returns null for code without dots', () => {
      expect(getClassificationParent('abc')).toBeNull()
      expect(getClassificationParent('')).toBeNull()
    })

    it('handles edge cases', () => {
      // Code with only a dot at the end
      expect(getClassificationParent('51.')).toBe('51')
      // Code starting with a dot
      expect(getClassificationParent('.01')).toBe('')
      // Multiple consecutive dots
      expect(getClassificationParent('51..01')).toBe('51.')
    })
  })
})
