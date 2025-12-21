import { describe, expect, it, vi } from 'vitest'

// Mock lingui macro before importing module
vi.mock('@lingui/core/macro', () => ({
  t: (strings: TemplateStringsArray, ...values: unknown[]) => {
    let result = strings[0]
    for (let i = 0; i < values.length; i++) {
      result += String(values[i]) + strings[i + 1]
    }
    return result
  },
}))

import {
  getDateString,
  getDaysDifference,
  getEmptyStreakState,
  calculateStreakUpdate,
  getDisplayStreak,
  formatStreak,
} from './streak'
import type { LearningStreakState } from '../types'

describe('streak utilities', () => {
  describe('getDateString', () => {
    it('formats a date as YYYY-MM-DD', () => {
      const date = new Date('2024-03-15T10:30:00Z')
      expect(getDateString(date)).toBe('2024-03-15')
    })

    it('handles start of year', () => {
      const date = new Date('2024-01-01T00:00:00Z')
      expect(getDateString(date)).toBe('2024-01-01')
    })

    it('handles end of year', () => {
      const date = new Date('2024-12-31T23:59:59Z')
      expect(getDateString(date)).toBe('2024-12-31')
    })
  })

  describe('getDaysDifference', () => {
    it('returns 0 for same date', () => {
      expect(getDaysDifference('2024-03-15', '2024-03-15')).toBe(0)
    })

    it('returns 1 when date1 is one day after date2', () => {
      expect(getDaysDifference('2024-03-16', '2024-03-15')).toBe(1)
    })

    it('returns -1 when date1 is one day before date2', () => {
      expect(getDaysDifference('2024-03-14', '2024-03-15')).toBe(-1)
    })

    it('returns positive for future dates', () => {
      expect(getDaysDifference('2024-03-20', '2024-03-15')).toBe(5)
    })

    it('returns negative for past dates', () => {
      expect(getDaysDifference('2024-03-10', '2024-03-15')).toBe(-5)
    })

    it('handles month boundaries', () => {
      // Using June/July to avoid DST transitions
      expect(getDaysDifference('2024-07-01', '2024-06-30')).toBe(1)
    })

    it('handles year boundaries', () => {
      expect(getDaysDifference('2025-01-01', '2024-12-31')).toBe(1)
    })
  })

  describe('getEmptyStreakState', () => {
    it('returns default streak state', () => {
      const state = getEmptyStreakState()
      expect(state).toEqual({
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
      })
    })
  })

  describe('calculateStreakUpdate', () => {
    const today = '2024-03-15'

    describe('first activity ever', () => {
      it('starts streak at 1', () => {
        const current: LearningStreakState = {
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: null,
        }
        const result = calculateStreakUpdate(current, today)
        expect(result).toEqual({
          currentStreak: 1,
          longestStreak: 1,
          lastActivityDate: today,
        })
      })

      it('preserves existing longest streak if higher', () => {
        const current: LearningStreakState = {
          currentStreak: 0,
          longestStreak: 5,
          lastActivityDate: null,
        }
        const result = calculateStreakUpdate(current, today)
        expect(result).toEqual({
          currentStreak: 1,
          longestStreak: 5,
          lastActivityDate: today,
        })
      })
    })

    describe('activity on same day', () => {
      it('returns unchanged state', () => {
        const current: LearningStreakState = {
          currentStreak: 3,
          longestStreak: 5,
          lastActivityDate: today,
        }
        const result = calculateStreakUpdate(current, today)
        expect(result).toBe(current)
      })
    })

    describe('activity on consecutive day', () => {
      it('increments streak by 1', () => {
        const current: LearningStreakState = {
          currentStreak: 3,
          longestStreak: 5,
          lastActivityDate: '2024-03-14',
        }
        const result = calculateStreakUpdate(current, today)
        expect(result).toEqual({
          currentStreak: 4,
          longestStreak: 5,
          lastActivityDate: today,
        })
      })

      it('updates longest streak when current exceeds it', () => {
        const current: LearningStreakState = {
          currentStreak: 5,
          longestStreak: 5,
          lastActivityDate: '2024-03-14',
        }
        const result = calculateStreakUpdate(current, today)
        expect(result).toEqual({
          currentStreak: 6,
          longestStreak: 6,
          lastActivityDate: today,
        })
      })
    })

    describe('activity after gap (more than 1 day)', () => {
      it('resets streak to 1 after 2 day gap', () => {
        const current: LearningStreakState = {
          currentStreak: 10,
          longestStreak: 10,
          lastActivityDate: '2024-03-13',
        }
        const result = calculateStreakUpdate(current, today)
        expect(result).toEqual({
          currentStreak: 1,
          longestStreak: 10,
          lastActivityDate: today,
        })
      })

      it('resets streak to 1 after long gap', () => {
        const current: LearningStreakState = {
          currentStreak: 7,
          longestStreak: 14,
          lastActivityDate: '2024-01-01',
        }
        const result = calculateStreakUpdate(current, today)
        expect(result).toEqual({
          currentStreak: 1,
          longestStreak: 14,
          lastActivityDate: today,
        })
      })
    })

    describe('activity in the past', () => {
      it('returns unchanged state for past activity', () => {
        const current: LearningStreakState = {
          currentStreak: 5,
          longestStreak: 10,
          lastActivityDate: '2024-03-16',
        }
        const result = calculateStreakUpdate(current, today)
        expect(result).toBe(current)
      })
    })
  })

  describe('getDisplayStreak', () => {
    const today = '2024-03-15'

    it('returns 0 when no activity ever', () => {
      const state: LearningStreakState = {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
      }
      expect(getDisplayStreak(state, today)).toBe(0)
    })

    it('returns current streak when activity was today', () => {
      const state: LearningStreakState = {
        currentStreak: 5,
        longestStreak: 10,
        lastActivityDate: today,
      }
      expect(getDisplayStreak(state, today)).toBe(5)
    })

    it('returns current streak when activity was yesterday', () => {
      const state: LearningStreakState = {
        currentStreak: 5,
        longestStreak: 10,
        lastActivityDate: '2024-03-14',
      }
      expect(getDisplayStreak(state, today)).toBe(5)
    })

    it('returns 0 when streak is broken (2+ days gap)', () => {
      const state: LearningStreakState = {
        currentStreak: 5,
        longestStreak: 10,
        lastActivityDate: '2024-03-13',
      }
      expect(getDisplayStreak(state, today)).toBe(0)
    })

    it('returns 0 when streak is broken (long gap)', () => {
      const state: LearningStreakState = {
        currentStreak: 20,
        longestStreak: 20,
        lastActivityDate: '2024-01-01',
      }
      expect(getDisplayStreak(state, today)).toBe(0)
    })
  })

  describe('formatStreak', () => {
    it('formats 0 days', () => {
      expect(formatStreak(0)).toBe('0 days')
    })

    it('formats 1 day (singular)', () => {
      expect(formatStreak(1)).toBe('1 day')
    })

    it('formats multiple days (plural)', () => {
      expect(formatStreak(5)).toBe('5 days')
    })

    it('formats large numbers', () => {
      expect(formatStreak(100)).toBe('100 days')
    })
  })
})
