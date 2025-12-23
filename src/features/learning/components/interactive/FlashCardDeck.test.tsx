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
import { FlashCard, FlashCardDeck } from './FlashCardDeck'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Helper component for testing
function TestDeck({ componentId = 'test', title }: { componentId?: string; title?: string }) {
  return (
    <FlashCardDeck componentId={componentId} title={title}>
      <FlashCard
        id="card-1"
        icon="🎯"
        title="Test Card 1"
        frontText="This is the front of card 1"
        backText="This is the back of card 1"
      />
      <FlashCard
        id="card-2"
        icon="🚀"
        title="Test Card 2"
        frontText="This is the front of card 2"
        backText="This is the back of card 2"
      />
    </FlashCardDeck>
  )
}

// Helper to get card buttons (uses aria-pressed for flip cards)
function getCardButtons() {
  const allButtons = screen.getAllByRole('button')
  return allButtons.filter((btn) => btn.hasAttribute('aria-pressed'))
}

describe('FlashCardDeck', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders card buttons with correct attributes', () => {
      render(<TestDeck />)

      const cardButtons = getCardButtons()
      expect(cardButtons.length).toBe(2)
    })

    it('renders progress indicator showing 0/2', () => {
      render(<TestDeck />)

      expect(screen.getByText(/0\/2/)).toBeInTheDocument()
    })

    it('renders custom title when provided', () => {
      render(<TestDeck title="Custom Title" />)

      expect(screen.getByText('Custom Title')).toBeInTheDocument()
    })

    it('renders card titles', () => {
      render(<TestDeck />)
      
      expect(screen.getAllByText('Test Card 1').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Test Card 2').length).toBeGreaterThanOrEqual(1)
    })

    it('renders front text', () => {
      render(<TestDeck />)
      
      expect(screen.getByText('This is the front of card 1')).toBeInTheDocument()
    })

    it('hides progress when showProgress is false', () => {
      render(<TestDeck />) // Default is true
      expect(screen.getByText(/0\/2/)).toBeInTheDocument()

      render(
        <FlashCardDeck componentId="test-no-progress" showProgress={false}>
          <FlashCard id="c1" icon="A" title="T" frontText="F" backText="B" />
        </FlashCardDeck>
      )
      expect(screen.queryByText(/0\/1/)).not.toBeInTheDocument()
    })
  })

  describe('card flipping', () => {
    it('flips card on click and updates aria-pressed', async () => {
      render(<TestDeck />)

      const cardButtons = getCardButtons()
      const firstCard = cardButtons[0]

      expect(firstCard).toHaveAttribute('aria-pressed', 'false')

      fireEvent.click(firstCard)

      await waitFor(() => {
        expect(firstCard).toHaveAttribute('aria-pressed', 'true')
      })
    })

    it('updates progress when card is flipped', async () => {
      render(<TestDeck />)

      const cardButtons = getCardButtons()
      fireEvent.click(cardButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/1\/2/)).toBeInTheDocument()
      })
    })

    it('shows completion message when all cards are flipped', async () => {
      render(
        <FlashCardDeck componentId="test" completionMessage="All done!">
          <FlashCard id="card-1" icon="🎯" title="Card 1" frontText="Front 1" backText="Back 1" />
          <FlashCard id="card-2" icon="🚀" title="Card 2" frontText="Front 2" backText="Back 2" />
        </FlashCardDeck>
      )

      const cardButtons = getCardButtons()
      
      // Flip both cards
      fireEvent.click(cardButtons[0])
      fireEvent.click(cardButtons[1])

      await waitFor(() => {
        expect(screen.getByText(/All done!/)).toBeInTheDocument()
      })
    })

    it('supports keyboard navigation with Enter key', async () => {
      render(<TestDeck />)

      const cardButtons = getCardButtons()
      const firstCard = cardButtons[0]

      fireEvent.keyDown(firstCard, { key: 'Enter' })

      await waitFor(() => {
        expect(firstCard).toHaveAttribute('aria-pressed', 'true')
      })
    })

    it('supports keyboard navigation with Space key', async () => {
      render(<TestDeck />)

      const cardButtons = getCardButtons()
      const firstCard = cardButtons[0]

      fireEvent.keyDown(firstCard, { key: ' ' })

      await waitFor(() => {
        expect(firstCard).toHaveAttribute('aria-pressed', 'true')
      })
    })
  })

  describe('reset functionality', () => {
    it('shows reset button after flipping a card', async () => {
      render(<TestDeck />)

      // Initially no reset button
      expect(screen.queryByText('Start over')).not.toBeInTheDocument()

      // Flip a card
      const cardButtons = getCardButtons()
      fireEvent.click(cardButtons[0])

      await waitFor(() => {
        expect(screen.getByText('Start over')).toBeInTheDocument()
      })
    })

    it('resets all cards when reset button is clicked', async () => {
      render(<TestDeck />)

      const cardButtons = getCardButtons()
      
      // Flip both cards
      fireEvent.click(cardButtons[0])
      fireEvent.click(cardButtons[1])

      await waitFor(() => {
        expect(screen.getByText(/2\/2/)).toBeInTheDocument()
      })

      // Click reset
      fireEvent.click(screen.getByText('Start over'))

      await waitFor(() => {
        expect(screen.getByText(/0\/2/)).toBeInTheDocument()
      })
    })
  })

  describe('state persistence', () => {
    it('saves flipped state to localStorage', async () => {
      render(<TestDeck componentId="test-persist" />)

      const cardButtons = getCardButtons()
      fireEvent.click(cardButtons[0])

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalled()
      })

      const calls = localStorageMock.setItem.mock.calls
      const lastCall = calls[calls.length - 1]
      expect(lastCall?.[0]).toBe('flash-card-deck:test-persist')

      const savedState = JSON.parse(lastCall?.[1] ?? '{}')
      expect(savedState.flippedIds).toContain('card-1')
    })

    it('loads flipped state from localStorage on mount', () => {
      const savedState = { flippedIds: ['card-1'] }
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedState))

      render(<TestDeck componentId="test-load" />)

      // Progress should show 1/2
      expect(screen.getByText(/1\/2/)).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('card buttons have role="button"', () => {
      render(<TestDeck />)

      const cardButtons = getCardButtons()
      expect(cardButtons.length).toBe(2)
    })

    it('card buttons have tabIndex for keyboard focus', () => {
      render(<TestDeck />)

      const cardButtons = getCardButtons()
      expect(cardButtons[0]).toHaveAttribute('tabindex', '0')
    })

    it('card buttons have aria-pressed attribute', () => {
      render(<TestDeck />)

      const cardButtons = getCardButtons()
      expect(cardButtons[0]).toHaveAttribute('aria-pressed', 'false')
    })
  })
})
