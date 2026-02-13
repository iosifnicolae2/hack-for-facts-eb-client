import { beforeEach, describe, expect, it, vi } from 'vitest'

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

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import {
  ACTIVITIES_EN,
  BudgetFootprintRevealer,
  type DailyActivity,
} from './BudgetFootprintRevealer'

// Mock localStorage with proper isolation
let localStorageStore: Record<string, string> = {}
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageStore[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageStore[key]
  }),
  clear: vi.fn(() => {
    localStorageStore = {}
  }),
  get length() {
    return Object.keys(localStorageStore).length
  },
  key: vi.fn((index: number) => Object.keys(localStorageStore)[index] ?? null),
}

Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true })

// Test data
const TEST_ACTIVITIES: readonly DailyActivity[] = [
  {
    id: 'activity-1',
    time: '08:00',
    icon: '☀️',
    label: 'Morning routine',
    budgetCategory: 'Healthcare',
    hiddenServices: [
      { id: 'service-1', icon: '💧', name: 'Water supply', dailyCostRon: 5.0 },
      { id: 'service-2', icon: '⚡', name: 'Electricity', dailyCostRon: 3.0 },
    ],
    funFact: 'Test fun fact 1',
  },
  {
    id: 'activity-2',
    time: '12:00',
    icon: '🍽️',
    label: 'Lunch break',
    budgetCategory: 'Infrastructure',
    hiddenServices: [{ id: 'service-3', icon: '🛣️', name: 'Roads', dailyCostRon: 10.0 }],
    funFact: 'Test fun fact 2',
  },
]

describe('BudgetFootprintRevealer', () => {
  beforeEach(() => {
    // Reset localStorage store directly and clear mocks
    localStorageStore = {}
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders all activity cards', () => {
      render(<BudgetFootprintRevealer activities={TEST_ACTIVITIES} />)

      expect(screen.getByText('Morning routine')).toBeInTheDocument()
      expect(screen.getByText('Lunch break')).toBeInTheDocument()
      expect(screen.getByText('08:00')).toBeInTheDocument()
      expect(screen.getByText('12:00')).toBeInTheDocument()
    })

    it('shows "Tap" label on unrevealed activities', () => {
      render(<BudgetFootprintRevealer activities={TEST_ACTIVITIES} />)

      const tapLabels = screen.getAllByText('Tap')
      expect(tapLabels).toHaveLength(2)
    })

    it('does not show total display initially', () => {
      render(<BudgetFootprintRevealer activities={TEST_ACTIVITIES} />)

      expect(screen.queryByText('Your daily budget footprint')).not.toBeInTheDocument()
    })
  })

  describe('activity reveal interaction', () => {
    it('reveals activity on click and shows cost', async () => {
      render(<BudgetFootprintRevealer activities={TEST_ACTIVITIES} />)

      const activityCard = screen.getByText('Morning routine').closest('[role="button"]')!
      fireEvent.click(activityCard)

      await waitFor(() => {
        expect(screen.getByText('+8.0')).toBeInTheDocument()
      })
    })

    it('reveals hidden services when activity is expanded', async () => {
      render(<BudgetFootprintRevealer activities={TEST_ACTIVITIES} />)

      const activityCard = screen.getByText('Morning routine').closest('[role="button"]')!
      fireEvent.click(activityCard)

      await waitFor(() => {
        expect(screen.getByText('Water supply')).toBeInTheDocument()
        expect(screen.getByText('Electricity')).toBeInTheDocument()
        expect(screen.getByText('+5.0 RON')).toBeInTheDocument()
        expect(screen.getByText('+3.0 RON')).toBeInTheDocument()
      })
    })

    it('shows fun fact when activity is expanded', async () => {
      render(<BudgetFootprintRevealer activities={TEST_ACTIVITIES} />)

      const activityCard = screen.getByText('Morning routine').closest('[role="button"]')!
      fireEvent.click(activityCard)

      await waitFor(() => {
        expect(screen.getByText('Test fun fact 1')).toBeInTheDocument()
      })
    })

    it('shows budget category when activity is expanded', async () => {
      render(<BudgetFootprintRevealer activities={TEST_ACTIVITIES} />)

      const activityCard = screen.getByText('Morning routine').closest('[role="button"]')!
      fireEvent.click(activityCard)

      await waitFor(() => {
        expect(screen.getByText('Healthcare')).toBeInTheDocument()
      })
    })

    it('collapses expanded activity on second click', async () => {
      render(<BudgetFootprintRevealer activities={TEST_ACTIVITIES} />)

      const activityCard = screen.getByText('Morning routine').closest('[role="button"]')!

      // First click - reveal and expand
      fireEvent.click(activityCard)
      await waitFor(() => {
        expect(screen.getByText('Water supply')).toBeInTheDocument()
      })

      // Second click - collapse
      fireEvent.click(activityCard)
      await waitFor(() => {
        expect(screen.queryByText('Water supply')).not.toBeInTheDocument()
      })
    })

    it('supports keyboard navigation with Enter key', async () => {
      render(<BudgetFootprintRevealer activities={TEST_ACTIVITIES} />)

      const activityCard = screen.getByText('Morning routine').closest('[role="button"]')!
      fireEvent.keyDown(activityCard, { key: 'Enter' })

      await waitFor(() => {
        expect(screen.getByText('Water supply')).toBeInTheDocument()
      })
    })

    it('supports keyboard navigation with Space key', async () => {
      render(<BudgetFootprintRevealer activities={TEST_ACTIVITIES} />)

      const activityCard = screen.getByText('Morning routine').closest('[role="button"]')!
      fireEvent.keyDown(activityCard, { key: ' ' })

      await waitFor(() => {
        expect(screen.getByText('Water supply')).toBeInTheDocument()
      })
    })
  })

  describe('total display', () => {
    it('shows total display after revealing an activity', async () => {
      render(<BudgetFootprintRevealer activities={TEST_ACTIVITIES} />)

      const activityCard = screen.getByText('Morning routine').closest('[role="button"]')!
      fireEvent.click(activityCard)

      await waitFor(() => {
        expect(screen.getByText('Your daily budget footprint')).toBeInTheDocument()
      })
    })

    it('calculates correct total for revealed activities', async () => {
      render(<BudgetFootprintRevealer activities={TEST_ACTIVITIES} />)

      // Reveal first activity (5.0 + 3.0 = 8.0)
      const activityCard1 = screen.getByText('Morning routine').closest('[role="button"]')!
      fireEvent.click(activityCard1)

      // Reveal second activity (10.0)
      const activityCard2 = screen.getByText('Lunch break').closest('[role="button"]')!
      fireEvent.click(activityCard2)

      // Total should be 18.0
      await waitFor(
        () => {
          const totalDisplayText =
            screen.getByText('Your daily budget footprint').parentElement?.textContent ?? ''
          const numericMatch = totalDisplayText.match(/(\d+(?:\.\d+)?)/)

          if (!numericMatch) {
            throw new Error(`Could not parse total from "${totalDisplayText}"`)
          }

          const displayedTotalCost = Number(numericMatch[1])
          expect(displayedTotalCost).toBeGreaterThanOrEqual(17.9)
          expect(displayedTotalCost).toBeLessThanOrEqual(18)
        },
        { timeout: 3000 }
      )
    })
  })

  describe('reset functionality', () => {
    it('shows reset button in total display', async () => {
      render(<BudgetFootprintRevealer activities={TEST_ACTIVITIES} />)

      const activityCard = screen.getByText('Morning routine').closest('[role="button"]')!
      fireEvent.click(activityCard)

      await waitFor(() => {
        expect(screen.getByTitle('Start over')).toBeInTheDocument()
      })
    })

    it('resets all state when reset button is clicked', async () => {
      render(<BudgetFootprintRevealer activities={TEST_ACTIVITIES} />)

      // Reveal an activity
      const activityCard = screen.getByText('Morning routine').closest('[role="button"]')!
      fireEvent.click(activityCard)

      await waitFor(() => {
        expect(screen.getByText('Your daily budget footprint')).toBeInTheDocument()
      })

      // Click reset
      const resetButton = screen.getByTitle('Start over')
      fireEvent.click(resetButton)

      await waitFor(() => {
        // Should no longer show total display
        expect(screen.queryByText('Your daily budget footprint')).not.toBeInTheDocument()
        // Should show "Tap" labels again
        const tapLabels = screen.getAllByText('Tap')
        expect(tapLabels).toHaveLength(2)
      })
    })

    it('clears localStorage when reset is clicked', async () => {
      render(<BudgetFootprintRevealer activities={TEST_ACTIVITIES} componentId="test-reset" />)

      // Reveal an activity
      const activityCard = screen.getByText('Morning routine').closest('[role="button"]')!
      fireEvent.click(activityCard)

      await waitFor(() => {
        expect(screen.getByTitle('Start over')).toBeInTheDocument()
      })

      // Click reset
      const resetButton = screen.getByTitle('Start over')
      fireEvent.click(resetButton)

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'budget-footprint-revealer:test-reset'
      )
    })
  })

  describe('state persistence', () => {
    it('saves state to localStorage when activity is revealed', async () => {
      render(<BudgetFootprintRevealer activities={TEST_ACTIVITIES} componentId="test-persist" />)

      const activityCard = screen.getByText('Morning routine').closest('[role="button"]')!
      fireEvent.click(activityCard)

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalled()
      })

      const calls = localStorageMock.setItem.mock.calls
      const lastCall = calls[calls.length - 1]
      expect(lastCall?.[0]).toBe('budget-footprint-revealer:test-persist')

      const savedState = JSON.parse(lastCall?.[1] ?? '{}')
      expect(savedState.revealedIds).toContain('activity-1')
    })

    it('loads state from localStorage on mount', () => {
      const savedState = { revealedIds: ['activity-1'] }
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedState))

      render(<BudgetFootprintRevealer activities={TEST_ACTIVITIES} componentId="test-load" />)

      // Should show the activity as revealed (with cost, not "Tap")
      expect(screen.getByText('+8.0')).toBeInTheDocument()
      // Should only have one "Tap" label (for the unrevealed activity)
      const tapLabels = screen.getAllByText('Tap')
      expect(tapLabels).toHaveLength(1)
    })
  })

  describe('default data', () => {
    it('uses ACTIVITIES_EN when no activities prop is provided (default locale)', () => {
      render(<BudgetFootprintRevealer />)

      // Check for some default English activities
      expect(screen.getByText('Woke up safely')).toBeInTheDocument()
      expect(screen.getByText('Took a shower')).toBeInTheDocument()
      expect(screen.getByText('Commuted')).toBeInTheDocument()
    })

    it('uses Romanian activities when locale="ro"', () => {
      render(<BudgetFootprintRevealer locale="ro" />)

      // Check for Romanian activities
      expect(screen.getByText('M-am trezit în siguranță')).toBeInTheDocument()
      expect(screen.getByText('Am făcut duș')).toBeInTheDocument()
      expect(screen.getByText('Am făcut naveta')).toBeInTheDocument()
    })

    it('ACTIVITIES_EN has correct structure', () => {
      expect(ACTIVITIES_EN).toHaveLength(6)
      expect(ACTIVITIES_EN[0]).toHaveProperty('id')
      expect(ACTIVITIES_EN[0]).toHaveProperty('time')
      expect(ACTIVITIES_EN[0]).toHaveProperty('icon')
      expect(ACTIVITIES_EN[0]).toHaveProperty('label')
      expect(ACTIVITIES_EN[0]).toHaveProperty('hiddenServices')
      expect(ACTIVITIES_EN[0]).toHaveProperty('budgetCategory')
      expect(ACTIVITIES_EN[0]).toHaveProperty('funFact')
    })
  })

  describe('accessibility', () => {
    it('activity cards have role="button"', () => {
      render(<BudgetFootprintRevealer activities={TEST_ACTIVITIES} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
    })

    it('activity cards have tabIndex for keyboard focus', () => {
      render(<BudgetFootprintRevealer activities={TEST_ACTIVITIES} />)

      const activityCard = screen.getByText('Morning routine').closest('[role="button"]')!
      expect(activityCard).toHaveAttribute('tabindex', '0')
    })

    it('activity cards have aria-expanded attribute', async () => {
      render(<BudgetFootprintRevealer activities={TEST_ACTIVITIES} />)

      const activityCard = screen.getByText('Morning routine').closest('[role="button"]')!

      // Initially not expanded
      expect(activityCard).toHaveAttribute('aria-expanded', 'false')

      // After click, should be expanded
      fireEvent.click(activityCard)

      await waitFor(() => {
        expect(activityCard).toHaveAttribute('aria-expanded', 'true')
      })
    })
  })
})
