/**
 * TextHighlight Component Tests
 *
 * This file tests the TextHighlight component which highlights
 * matching text fragments in search results.
 *
 * Pattern: Text Processing Component Testing
 * - Test highlighting logic
 * - Test case insensitivity
 * - Test multiple matches
 * - Test edge cases
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { TextHighlight } from './TextHighlight'

// ============================================================================
// MOCKS
// ============================================================================

// Mock Lingui (in case of transitive dependencies)
vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@lingui/core/macro', () => ({
  t: (strings: TemplateStringsArray) => strings[0],
  msg: (strings: TemplateStringsArray) => strings[0],
}))

// ============================================================================
// TESTS
// ============================================================================

describe('TextHighlight', () => {
  describe('basic rendering', () => {
    it('renders text when no search term provided', () => {
      render(<TextHighlight text="Hello World" search="" />)

      expect(screen.getByText('Hello World')).toBeInTheDocument()
    })

    it('renders text when search term is whitespace', () => {
      render(<TextHighlight text="Hello World" search="   " />)

      expect(screen.getByText('Hello World')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <TextHighlight text="Test" search="" className="custom-class" />
      )

      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })
  })

  describe('single match highlighting', () => {
    it('highlights matching text', () => {
      render(<TextHighlight text="Hello World" search="World" />)

      const mark = screen.getByText('World')
      expect(mark.tagName).toBe('MARK')
    })

    it('preserves non-matching text', () => {
      render(<TextHighlight text="Hello World" search="World" />)

      expect(screen.getByText('Hello')).toBeInTheDocument()
    })

    it('highlights at the beginning of text', () => {
      render(<TextHighlight text="Hello World" search="Hello" />)

      const mark = screen.getByText('Hello')
      expect(mark.tagName).toBe('MARK')
    })

    it('highlights at the end of text', () => {
      render(<TextHighlight text="Hello World" search="World" />)

      const mark = screen.getByText('World')
      expect(mark.tagName).toBe('MARK')
    })
  })

  describe('case insensitivity', () => {
    it('matches lowercase search against uppercase text', () => {
      render(<TextHighlight text="HELLO" search="hello" />)

      const mark = screen.getByText('HELLO')
      expect(mark.tagName).toBe('MARK')
    })

    it('matches uppercase search against lowercase text', () => {
      render(<TextHighlight text="hello" search="HELLO" />)

      const mark = screen.getByText('hello')
      expect(mark.tagName).toBe('MARK')
    })

    it('matches mixed case search against mixed case text', () => {
      render(<TextHighlight text="HeLLo" search="hElLo" />)

      const mark = screen.getByText('HeLLo')
      expect(mark.tagName).toBe('MARK')
    })
  })

  describe('multiple matches', () => {
    it('highlights all occurrences', () => {
      render(<TextHighlight text="test one test two test" search="test" />)

      const marks = screen.getAllByText('test')
      expect(marks).toHaveLength(3)
      marks.forEach((mark) => {
        expect(mark.tagName).toBe('MARK')
      })
    })

    it('preserves text between matches', () => {
      const { container } = render(
        <TextHighlight text="abc def abc" search="abc" />
      )

      // Check that the non-matching text exists in a span element
      const spans = container.querySelectorAll('span > span')
      const defSpan = Array.from(spans).find((span) =>
        span.textContent?.includes('def')
      )
      expect(defSpan).toBeInTheDocument()
    })
  })

  describe('no matches', () => {
    it('renders text without highlighting when no match', () => {
      const { container } = render(
        <TextHighlight text="Hello World" search="xyz" />
      )

      expect(container.querySelector('mark')).not.toBeInTheDocument()
      expect(screen.getByText('Hello World')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('handles empty text', () => {
      const { container } = render(<TextHighlight text="" search="test" />)

      expect(container.querySelector('mark')).not.toBeInTheDocument()
    })

    it('handles search term longer than text', () => {
      const { container } = render(
        <TextHighlight text="Hi" search="Hello World" />
      )

      expect(container.querySelector('mark')).not.toBeInTheDocument()
      expect(screen.getByText('Hi')).toBeInTheDocument()
    })

    it('handles special regex characters in search', () => {
      render(<TextHighlight text="Price: $100.00" search="$100" />)

      // Should still find and highlight the match
      expect(screen.getByText('$100')).toBeInTheDocument()
    })

    it('handles entire text as match', () => {
      render(<TextHighlight text="Hello" search="Hello" />)

      const mark = screen.getByText('Hello')
      expect(mark.tagName).toBe('MARK')
    })
  })

  describe('styling', () => {
    it('applies highlight styling to mark elements', () => {
      render(<TextHighlight text="Test" search="Test" />)

      const mark = screen.getByText('Test')
      expect(mark).toHaveClass('bg-yellow-200')
    })
  })
})
