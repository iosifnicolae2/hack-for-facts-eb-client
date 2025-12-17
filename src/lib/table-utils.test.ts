import { describe, it, expect } from 'vitest'
import { getMergedColumnOrder, moveColumnOrder } from './table-utils'

describe('table-utils', () => {
  describe('getMergedColumnOrder', () => {
    it('returns leaf columns when no state order exists', () => {
      const mockTable = {
        getAllLeafColumns: () => [{ id: 'col1' }, { id: 'col2' }, { id: 'col3' }],
        getState: () => ({ columnOrder: undefined }),
      }

      const result = getMergedColumnOrder(mockTable as any)
      expect(result).toEqual(['col1', 'col2', 'col3'])
    })

    it('returns leaf columns when state order is empty', () => {
      const mockTable = {
        getAllLeafColumns: () => [{ id: 'col1' }, { id: 'col2' }, { id: 'col3' }],
        getState: () => ({ columnOrder: [] }),
      }

      const result = getMergedColumnOrder(mockTable as any)
      expect(result).toEqual(['col1', 'col2', 'col3'])
    })

    it('puts fixed columns first', () => {
      const mockTable = {
        getAllLeafColumns: () => [{ id: 'col1' }, { id: 'col2' }, { id: 'col3' }],
        getState: () => ({ columnOrder: ['col2', 'col1', 'col3'] }),
      }

      const result = getMergedColumnOrder(mockTable as any, ['col3'])
      expect(result).toEqual(['col3', 'col2', 'col1'])
    })

    it('preserves state order after fixed columns', () => {
      const mockTable = {
        getAllLeafColumns: () => [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }],
        getState: () => ({ columnOrder: ['c', 'b'] }),
      }

      const result = getMergedColumnOrder(mockTable as any, ['a'])
      expect(result).toEqual(['a', 'c', 'b', 'd'])
    })

    it('handles multiple fixed columns', () => {
      const mockTable = {
        getAllLeafColumns: () => [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }],
        getState: () => ({ columnOrder: ['d', 'c', 'b', 'a'] }),
      }

      const result = getMergedColumnOrder(mockTable as any, ['a', 'b'])
      expect(result).toEqual(['a', 'b', 'd', 'c'])
    })

    it('does not duplicate columns', () => {
      const mockTable = {
        getAllLeafColumns: () => [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
        getState: () => ({ columnOrder: ['a', 'b', 'c'] }),
      }

      const result = getMergedColumnOrder(mockTable as any, ['a'])
      expect(result).toEqual(['a', 'b', 'c'])
      expect(result.filter((id) => id === 'a')).toHaveLength(1)
    })

    it('adds leaf columns not in state order at the end', () => {
      const mockTable = {
        getAllLeafColumns: () => [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }],
        getState: () => ({ columnOrder: ['b'] }),
      }

      const result = getMergedColumnOrder(mockTable as any)
      expect(result).toEqual(['b', 'a', 'c', 'd'])
    })
  })

  describe('moveColumnOrder', () => {
    it('moves column left', () => {
      const current = ['a', 'b', 'c', 'd']
      const result = moveColumnOrder(current, 'c', 'left')
      expect(result).toEqual(['a', 'c', 'b', 'd'])
    })

    it('moves column right', () => {
      const current = ['a', 'b', 'c', 'd']
      const result = moveColumnOrder(current, 'b', 'right')
      expect(result).toEqual(['a', 'c', 'b', 'd'])
    })

    it('does not move column past left boundary', () => {
      const current = ['a', 'b', 'c']
      const result = moveColumnOrder(current, 'a', 'left')
      expect(result).toEqual(['a', 'b', 'c'])
    })

    it('does not move column past right boundary', () => {
      const current = ['a', 'b', 'c']
      const result = moveColumnOrder(current, 'c', 'right')
      expect(result).toEqual(['a', 'b', 'c'])
    })

    it('does not move fixed columns', () => {
      const current = ['fixed', 'a', 'b', 'c']
      const result = moveColumnOrder(current, 'fixed', 'right', ['fixed'])
      expect(result).toEqual(['fixed', 'a', 'b', 'c'])
    })

    it('excludes fixed columns from movable set', () => {
      const current = ['fixed', 'a', 'b', 'c']
      const result = moveColumnOrder(current, 'a', 'left', ['fixed'])
      // 'a' is already at position 0 in the movable set, so it stays
      expect(result).toEqual(['fixed', 'a', 'b', 'c'])
    })

    it('moves non-fixed column correctly with fixed columns', () => {
      const current = ['fixed', 'a', 'b', 'c']
      const result = moveColumnOrder(current, 'b', 'left', ['fixed'])
      expect(result).toEqual(['fixed', 'b', 'a', 'c'])
    })

    it('returns current array if column not found', () => {
      const current = ['a', 'b', 'c']
      const result = moveColumnOrder(current, 'x', 'left')
      expect(result).toEqual(['a', 'b', 'c'])
    })

    it('handles empty array', () => {
      const current: string[] = []
      const result = moveColumnOrder(current, 'a', 'left')
      expect(result).toEqual([])
    })

    it('handles single column', () => {
      const current = ['a']
      const resultLeft = moveColumnOrder(current, 'a', 'left')
      const resultRight = moveColumnOrder(current, 'a', 'right')
      expect(resultLeft).toEqual(['a'])
      expect(resultRight).toEqual(['a'])
    })
  })
})
