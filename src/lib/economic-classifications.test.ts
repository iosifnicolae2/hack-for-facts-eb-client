import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock JSON imports before importing the module
vi.mock('@/assets/economic-classifications-general-ro.json', () => ({
  default: [
    {
      description: 'CLASIFICARE ECONOMICĂ',
      children: [
        {
          code: '10',
          description: 'Cheltuieli de personal',
          children: [
            {
              code: '10.01',
              description: 'Cheltuieli salariale în bani',
              children: [
                { code: '10.01.01', description: 'Salarii de bază' },
                { code: '10.01.02', description: 'Sporuri pentru condiții de muncă' },
              ],
            },
            { code: '10.02', description: 'Cheltuieli salariale în natură' },
          ],
        },
        {
          code: '20',
          description: 'Bunuri și servicii',
          children: [
            {
              code: '20.01',
              description: 'Bunuri și servicii',
              children: [
                { code: '20.01.01', description: 'Furnituri de birou' },
                { code: '20.01.02', description: 'Materiale pentru curățenie' },
              ],
            },
            { code: '20.05', description: 'Bunuri de natura obiectelor de inventar' },
          ],
        },
        {
          code: '51',
          description: 'Transferuri între unități ale administrației publice',
          children: [
            { code: '51.01', description: 'Transferuri curente' },
            { code: '51.02', description: 'Transferuri de capital' },
          ],
        },
      ],
    },
  ],
}))

vi.mock('@/assets/economic-classifications-general-en.json', () => ({
  default: [
    {
      description: 'ECONOMIC CLASSIFICATION',
      children: [
        {
          code: '10',
          description: 'Personnel expenses',
          children: [
            {
              code: '10.01',
              description: 'Cash salary expenses',
              children: [
                { code: '10.01.01', description: 'Base salary' },
                { code: '10.01.02', description: 'Bonuses for work conditions' },
              ],
            },
            { code: '10.02', description: 'In-kind salary expenses' },
          ],
        },
        {
          code: '20',
          description: 'Goods and services',
          children: [
            {
              code: '20.01',
              description: 'Goods and services',
              children: [
                { code: '20.01.01', description: 'Office supplies' },
                { code: '20.01.02', description: 'Cleaning materials' },
              ],
            },
            { code: '20.05', description: 'Inventory items' },
          ],
        },
        {
          code: '51',
          description: 'Transfers between public administration units',
          children: [
            { code: '51.01', description: 'Current transfers' },
            { code: '51.02', description: 'Capital transfers' },
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
import {
  getEconomicChapterName,
  getEconomicSubchapterName,
  getEconomicClassificationName,
  getEconomicParent,
} from './economic-classifications'

describe('economic-classifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserLocale.mockReturnValue('en')
  })

  describe('getEconomicChapterName', () => {
    describe('with English locale', () => {
      beforeEach(() => {
        mockGetUserLocale.mockReturnValue('en')
      })

      it('returns name for two-digit chapter code', () => {
        expect(getEconomicChapterName('10')).toBe('Personnel expenses')
        expect(getEconomicChapterName('20')).toBe('Goods and services')
        expect(getEconomicChapterName('51')).toBe('Transfers between public administration units')
      })

      it('extracts chapter from longer code', () => {
        expect(getEconomicChapterName('10.01')).toBe('Personnel expenses')
        expect(getEconomicChapterName('20.01.01')).toBe('Goods and services')
      })

      it('returns undefined for non-existent chapter', () => {
        expect(getEconomicChapterName('99')).toBeUndefined()
        expect(getEconomicChapterName('30')).toBeUndefined()
      })

      it('handles codes with special characters', () => {
        expect(getEconomicChapterName('  10  ')).toBe('Personnel expenses')
        expect(getEconomicChapterName('10-01')).toBe('Personnel expenses')
      })

      it('returns undefined for empty or invalid input', () => {
        expect(getEconomicChapterName('')).toBeUndefined()
      })
    })

    describe('with Romanian locale', () => {
      beforeEach(() => {
        mockGetUserLocale.mockReturnValue('ro')
      })

      it('returns Romanian name for chapter code', () => {
        expect(getEconomicChapterName('10')).toBe('Cheltuieli de personal')
        expect(getEconomicChapterName('20')).toBe('Bunuri și servicii')
        expect(getEconomicChapterName('51')).toBe('Transferuri între unități ale administrației publice')
      })
    })
  })

  describe('getEconomicSubchapterName', () => {
    describe('with English locale', () => {
      beforeEach(() => {
        mockGetUserLocale.mockReturnValue('en')
      })

      it('returns name for subchapter code', () => {
        expect(getEconomicSubchapterName('10.01')).toBe('Cash salary expenses')
        expect(getEconomicSubchapterName('10.02')).toBe('In-kind salary expenses')
        expect(getEconomicSubchapterName('20.01')).toBe('Goods and services')
        expect(getEconomicSubchapterName('20.05')).toBe('Inventory items')
      })

      it('extracts subchapter from longer code', () => {
        expect(getEconomicSubchapterName('10.01.01')).toBe('Cash salary expenses')
        expect(getEconomicSubchapterName('20.01.02')).toBe('Goods and services')
      })

      it('returns undefined for non-existent subchapter', () => {
        expect(getEconomicSubchapterName('10.99')).toBeUndefined()
        expect(getEconomicSubchapterName('99.01')).toBeUndefined()
      })

      it('returns undefined for chapter-only code', () => {
        expect(getEconomicSubchapterName('10')).toBeUndefined()
      })

      it('handles codes with special characters', () => {
        expect(getEconomicSubchapterName('  10.01  ')).toBe('Cash salary expenses')
      })

      it('returns undefined for invalid format', () => {
        expect(getEconomicSubchapterName('')).toBeUndefined()
        expect(getEconomicSubchapterName('abc')).toBeUndefined()
      })
    })

    describe('with Romanian locale', () => {
      beforeEach(() => {
        mockGetUserLocale.mockReturnValue('ro')
      })

      it('returns Romanian name for subchapter code', () => {
        expect(getEconomicSubchapterName('10.01')).toBe('Cheltuieli salariale în bani')
        expect(getEconomicSubchapterName('20.01')).toBe('Bunuri și servicii')
      })
    })
  })

  describe('getEconomicClassificationName', () => {
    describe('with English locale', () => {
      beforeEach(() => {
        mockGetUserLocale.mockReturnValue('en')
      })

      it('returns name for any valid code', () => {
        expect(getEconomicClassificationName('10')).toBe('Personnel expenses')
        expect(getEconomicClassificationName('10.01')).toBe('Cash salary expenses')
        expect(getEconomicClassificationName('10.01.01')).toBe('Base salary')
        expect(getEconomicClassificationName('20.01.02')).toBe('Cleaning materials')
      })

      it('returns undefined for non-existent code', () => {
        expect(getEconomicClassificationName('99')).toBeUndefined()
        expect(getEconomicClassificationName('10.01.99')).toBeUndefined()
      })

      it('handles codes with special characters', () => {
        expect(getEconomicClassificationName('  10.01.01  ')).toBe('Base salary')
      })

      it('returns undefined for empty input', () => {
        expect(getEconomicClassificationName('')).toBeUndefined()
      })
    })

    describe('with Romanian locale', () => {
      beforeEach(() => {
        mockGetUserLocale.mockReturnValue('ro')
      })

      it('returns Romanian name for any valid code', () => {
        expect(getEconomicClassificationName('10')).toBe('Cheltuieli de personal')
        expect(getEconomicClassificationName('10.01')).toBe('Cheltuieli salariale în bani')
        expect(getEconomicClassificationName('10.01.01')).toBe('Salarii de bază')
      })
    })
  })

  describe('getEconomicParent', () => {
    it('returns parent for code with multiple parts', () => {
      expect(getEconomicParent('10.01.02')).toBe('10.01')
      expect(getEconomicParent('10.01')).toBe('10')
      expect(getEconomicParent('20.01.01')).toBe('20.01')
    })

    it('returns null for chapter-level code', () => {
      expect(getEconomicParent('10')).toBeNull()
      expect(getEconomicParent('20')).toBeNull()
      expect(getEconomicParent('51')).toBeNull()
    })

    it('handles codes with special characters', () => {
      expect(getEconomicParent('  10.01.02  ')).toBe('10.01')
    })

    it('returns null for code without dots after cleaning', () => {
      expect(getEconomicParent('')).toBeNull()
      expect(getEconomicParent('abc')).toBeNull()
      // Dashes are removed, so '10-01' becomes '1001' with no dots
      expect(getEconomicParent('10-01')).toBeNull()
    })

    it('handles codes with many levels', () => {
      expect(getEconomicParent('10.01.02.03')).toBe('10.01.02')
    })
  })

  describe('locale switching', () => {
    it('returns correct locale-specific names when switching', () => {
      mockGetUserLocale.mockReturnValue('en')
      expect(getEconomicChapterName('10')).toBe('Personnel expenses')

      mockGetUserLocale.mockReturnValue('ro')
      expect(getEconomicChapterName('10')).toBe('Cheltuieli de personal')
    })
  })
})
