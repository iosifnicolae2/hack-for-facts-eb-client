import { t } from '@lingui/core/macro'
import type { LearningStreakState } from '../types'

/**
 * Get the current date as an ISO date string (YYYY-MM-DD) in user's local timezone
 */
export function getTodayDateString(): string {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

/**
 * Get a date string for a specific Date object
 */
export function getDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Calculate the difference in days between two ISO date strings
 * Returns positive number if date1 is after date2
 */
export function getDaysDifference(date1: string, date2: string): number {
  const d1 = new Date(date1 + 'T00:00:00')
  const d2 = new Date(date2 + 'T00:00:00')
  const diffTime = d1.getTime() - d2.getTime()
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Get the default/empty streak state
 */
export function getEmptyStreakState(): LearningStreakState {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
  }
}

/**
 * Calculate the updated streak state when user completes an activity
 *
 * Rules:
 * - If no previous activity, start streak at 1
 * - If activity was today (same date), no change to streak
 * - If activity was yesterday, increment streak by 1
 * - If activity was more than 1 day ago, reset streak to 1
 * - Always update longestStreak if currentStreak exceeds it
 */
export function calculateStreakUpdate(
  currentState: LearningStreakState,
  activityDate: string = getTodayDateString()
): LearningStreakState {
  const { currentStreak, longestStreak, lastActivityDate } = currentState

  // First activity ever
  if (!lastActivityDate) {
    return {
      currentStreak: 1,
      longestStreak: Math.max(1, longestStreak),
      lastActivityDate: activityDate,
    }
  }

  // Already had activity today - no change
  if (lastActivityDate === activityDate) {
    return currentState
  }

  const daysDiff = getDaysDifference(activityDate, lastActivityDate)

  // Activity is in the past relative to last activity (shouldn't happen normally)
  if (daysDiff < 0) {
    return currentState
  }

  // Activity was yesterday - continue streak
  if (daysDiff === 1) {
    const newStreak = currentStreak + 1
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, longestStreak),
      lastActivityDate: activityDate,
    }
  }

  // Activity was more than 1 day ago - reset streak
  return {
    currentStreak: 1,
    longestStreak: Math.max(1, longestStreak),
    lastActivityDate: activityDate,
  }
}

/**
 * Get the display streak value
 * If user had activity today or yesterday, show current streak
 * If more time has passed, show 0 (streak broken)
 */
export function getDisplayStreak(
  state: LearningStreakState,
  today: string = getTodayDateString()
): number {
  if (!state.lastActivityDate) {
    return 0
  }

  const daysDiff = getDaysDifference(today, state.lastActivityDate)

  // Activity was today or yesterday - streak is still active
  if (daysDiff <= 1) {
    return state.currentStreak
  }

  // More than 1 day has passed - streak is broken
  return 0
}

/**
 * Format streak for display with i18n pluralization
 */
export function formatStreak(days: number): string {
  const daysMessage = days === 1 ? t`day` : t`days`
  return `${days} ${daysMessage}`
}
