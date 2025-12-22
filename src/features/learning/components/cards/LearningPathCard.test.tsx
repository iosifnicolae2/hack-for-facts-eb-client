import { describe, expect, it, vi } from 'vitest'

// Mock lingui macro before any imports that use it
vi.mock('@lingui/core/macro', () => ({
  t: (strings: TemplateStringsArray, ...values: unknown[]) => {
    let result = strings[0]
    for (let i = 0; i < values.length; i++) {
      result += String(values[i]) + strings[i + 1]
    }
    return result
  },
  msg: (strings: TemplateStringsArray, ...values: unknown[]) => {
    let result = strings[0]
    for (let i = 0; i < values.length; i++) {
      result += String(values[i]) + strings[i + 1]
    }
    return result
  },
}))

// Mock TanStack Router Link
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, onClick, ...props }: { children: React.ReactNode; to: string; onClick?: () => void }) => (
    <a href={to} onClick={onClick} {...props}>
      {children}
    </a>
  ),
}))

import { render, screen } from '@testing-library/react'
import { formatRemainingTime, formatTotalTime, LearningPathCard, type LearningPathCardProps } from './LearningPathCard'
import type { LearningPathDefinition } from '@/features/learning/types'

const createTestPath = (): LearningPathDefinition => ({
  id: 'test-path',
  slug: 'test-path',
  difficulty: 'beginner',
  title: { en: 'Test Path', ro: 'Curs de Test' },
  description: { en: 'A test learning path', ro: 'Un curs de test' },
  modules: [
    {
      id: 'module-1',
      slug: 'module-1',
      title: { en: 'Module 1', ro: 'Modulul 1' },
      description: { en: 'First module', ro: 'Primul modul' },
      lessons: [
        {
          id: 'lesson-1',
          slug: 'lesson-1',
          title: { en: 'Lesson 1', ro: 'Lecția 1' },
          durationMinutes: 5,
          contentDir: 'content/lesson-1',
          completionMode: 'mark_complete',
          prerequisites: [],
        },
      ],
    },
  ],
})

const defaultProps: LearningPathCardProps = {
  path: createTestPath(),
  stats: {
    completedCount: 0,
    totalCount: 3,
    percentage: 0,
    remainingMinutes: 15,
    totalMinutes: 15,
  },
  locale: 'en',
  lang: 'en',
  variant: 'active',
  nextLessonUrl: '/en/learning/test-path/module-1/lesson-1',
}

const renderCard = (props: Partial<LearningPathCardProps> = {}) => {
  return render(<LearningPathCard {...defaultProps} {...props} />)
}

describe('formatRemainingTime', () => {
  it('returns "Done" for 0 minutes', () => {
    expect(formatRemainingTime(0)).toBe('Done')
  })

  it('returns "Done" for negative minutes', () => {
    expect(formatRemainingTime(-5)).toBe('Done')
  })

  it('formats minutes under 60', () => {
    expect(formatRemainingTime(30)).toBe('30m remaining')
  })

  it('formats exactly 1 hour', () => {
    expect(formatRemainingTime(60)).toBe('1h remaining')
  })

  it('formats hours and minutes', () => {
    expect(formatRemainingTime(90)).toBe('1h 30m remaining')
  })

  it('formats multiple hours', () => {
    expect(formatRemainingTime(180)).toBe('3h remaining')
  })
})

describe('formatTotalTime', () => {
  it('returns "Done" for 0 minutes', () => {
    expect(formatTotalTime(0)).toBe('Done')
  })

  it('returns "Done" for negative minutes', () => {
    expect(formatTotalTime(-5)).toBe('Done')
  })

  it('formats minutes under 60', () => {
    expect(formatTotalTime(45)).toBe('45m')
  })

  it('formats exactly 1 hour', () => {
    expect(formatTotalTime(60)).toBe('1h')
  })

  it('formats hours and minutes', () => {
    expect(formatTotalTime(75)).toBe('1h 15m')
  })
})

describe('LearningPathCard', () => {
  describe('rendering', () => {
    it('renders path title', () => {
      renderCard()
      expect(screen.getByTestId('path-title')).toHaveTextContent('Test Path')
    })

    it('renders path description', () => {
      renderCard()
      expect(screen.getByTestId('path-description')).toHaveTextContent('A test learning path')
    })

    it('renders Romanian text when locale is ro', () => {
      renderCard({ locale: 'ro' })
      expect(screen.getByTestId('path-title')).toHaveTextContent('Curs de Test')
      expect(screen.getByTestId('path-description')).toHaveTextContent('Un curs de test')
    })

    it('renders view details button with correct link', () => {
      renderCard()
      const detailsButton = screen.getByTestId('view-details-button')
      expect(detailsButton).toBeInTheDocument()
      expect(detailsButton.closest('a')).toHaveAttribute('href', '/en/learning/test-path')
    })
  })

  describe('variant: active', () => {
    it('sets data-variant attribute to active', () => {
      renderCard({ variant: 'active' })
      expect(screen.getByTestId('learning-path-card')).toHaveAttribute('data-variant', 'active')
    })

    it('shows progress bar section', () => {
      renderCard({ variant: 'active' })
      expect(screen.getByTestId('progress-bar-section')).toBeInTheDocument()
    })

    it('displays correct progress percentage', () => {
      renderCard({
        variant: 'active',
        stats: { ...defaultProps.stats, percentage: 67 },
      })
      expect(screen.getByTestId('progress-percentage')).toHaveTextContent('67%')
    })

    it('shows streak when provided', () => {
      renderCard({
        variant: 'active',
        streak: { display: 5, formatted: '5 days' },
      })
      expect(screen.getByTestId('streak-stat')).toBeInTheDocument()
      expect(screen.getByTestId('streak-stat')).toHaveTextContent('5 days')
    })

    it('does not show streak when not provided', () => {
      renderCard({ variant: 'active', streak: undefined })
      expect(screen.queryByTestId('streak-stat')).not.toBeInTheDocument()
    })
  })

  describe('variant: other', () => {
    it('sets data-variant attribute to other', () => {
      renderCard({ variant: 'other' })
      expect(screen.getByTestId('learning-path-card')).toHaveAttribute('data-variant', 'other')
    })

    it('does not show progress bar section', () => {
      renderCard({ variant: 'other' })
      expect(screen.queryByTestId('progress-bar-section')).not.toBeInTheDocument()
    })

    it('does not show streak even when provided', () => {
      renderCard({
        variant: 'other',
        streak: { display: 5, formatted: '5 days' },
      })
      expect(screen.queryByTestId('streak-stat')).not.toBeInTheDocument()
    })
  })

  describe('action button', () => {
    it('shows "Start Path" when no progress', () => {
      renderCard({
        stats: { ...defaultProps.stats, percentage: 0 },
      })
      expect(screen.getByTestId('action-button')).toHaveTextContent('Start Path')
    })

    it('shows "Continue" when has progress', () => {
      renderCard({
        stats: { ...defaultProps.stats, percentage: 50, completedCount: 1 },
      })
      expect(screen.getByTestId('action-button')).toHaveTextContent('Continue')
    })

    it('shows completed button when 100%', () => {
      renderCard({
        stats: { ...defaultProps.stats, percentage: 100, completedCount: 3 },
      })
      expect(screen.getByTestId('completed-button')).toBeInTheDocument()
      expect(screen.getByTestId('completed-button')).toHaveTextContent('Path Completed')
    })

    it('does not show action button when no nextLessonUrl and not completed', () => {
      renderCard({
        nextLessonUrl: undefined,
        stats: { ...defaultProps.stats, percentage: 50 },
      })
      expect(screen.queryByTestId('action-button')).not.toBeInTheDocument()
      expect(screen.queryByTestId('completed-button')).not.toBeInTheDocument()
    })

    it('links to correct lesson URL', () => {
      renderCard({
        nextLessonUrl: '/en/learning/test-path/module-1/lesson-2',
      })
      const actionButton = screen.getByTestId('action-button')
      expect(actionButton.closest('a')).toHaveAttribute('href', '/en/learning/test-path/module-1/lesson-2')
    })
  })

  describe('stats footer', () => {
    describe('when no progress (not started)', () => {
      const noProgressStats = {
        completedCount: 0,
        totalCount: 5,
        percentage: 0,
        remainingMinutes: 25,
        totalMinutes: 25,
      }

      it('does not show completion stat', () => {
        renderCard({ stats: noProgressStats })
        expect(screen.queryByTestId('completion-stat')).not.toBeInTheDocument()
      })

      it('shows only total lessons count', () => {
        renderCard({ stats: noProgressStats })
        const lessonsStat = screen.getByTestId('lessons-stat')
        expect(lessonsStat).toHaveTextContent('5')
        expect(lessonsStat).not.toHaveTextContent('/')
      })

      it('shows "Duration" label for time', () => {
        renderCard({ stats: noProgressStats })
        expect(screen.getByTestId('time-stat')).toHaveTextContent('Duration')
      })

      it('shows total time', () => {
        renderCard({ stats: noProgressStats })
        expect(screen.getByTestId('time-stat')).toHaveTextContent('25m')
      })
    })

    describe('when has progress', () => {
      const progressStats = {
        completedCount: 2,
        totalCount: 5,
        percentage: 40,
        remainingMinutes: 15,
        totalMinutes: 25,
      }

      it('shows completion stat', () => {
        renderCard({ stats: progressStats })
        const completionStat = screen.getByTestId('completion-stat')
        expect(completionStat).toBeInTheDocument()
        expect(completionStat).toHaveTextContent('40')
        expect(completionStat).toHaveTextContent('%')
      })

      it('shows lessons as completed/total', () => {
        renderCard({ stats: progressStats })
        const lessonsStat = screen.getByTestId('lessons-stat')
        expect(lessonsStat).toHaveTextContent('2')
        expect(lessonsStat).toHaveTextContent('/ 5')
      })

      it('shows "Estimate" label for time', () => {
        renderCard({ stats: progressStats })
        expect(screen.getByTestId('time-stat')).toHaveTextContent('Estimate')
      })

      it('shows remaining time', () => {
        renderCard({ stats: progressStats })
        expect(screen.getByTestId('time-stat')).toHaveTextContent('15m remaining')
      })
    })
  })

  describe('onNavigateAndSwitch callback', () => {
    it('attaches onClick to action button for other variant', () => {
      const onNavigateAndSwitch = vi.fn()
      renderCard({
        variant: 'other',
        onNavigateAndSwitch,
      })

      const actionButton = screen.getByTestId('action-button')
      expect(actionButton).toBeInTheDocument()
    })
  })
})
