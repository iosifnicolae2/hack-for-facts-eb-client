/**
 * Badge Component Tests
 *
 * This file demonstrates the testing pattern for simple UI components.
 * These components are typically presentational with minimal logic.
 *
 * Pattern: Simple UI Component Testing
 * - Test rendering with default props
 * - Test all variants
 * - Test custom className application
 * - Test accessibility attributes
 *
 * @see docs/COMPONENT_TESTING.md for full testing guidelines
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { Badge } from './badge'

// ============================================================================
// MOCKS
// ============================================================================

// Mock @/lib/utils to avoid lingui macro imports
// The cn function is a simple class name merger, so we can mock it directly
vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
}))

describe('Badge', () => {
  describe('rendering', () => {
    it('renders children correctly', () => {
      render(<Badge>Test Badge</Badge>)

      expect(screen.getByText('Test Badge')).toBeInTheDocument()
    })

    it('renders with default variant styles', () => {
      render(<Badge>Default</Badge>)

      const badge = screen.getByText('Default')
      // Default variant has primary background
      expect(badge).toHaveClass('bg-primary')
      expect(badge).toHaveClass('text-primary-foreground')
    })
  })

  describe('variants', () => {
    it('renders secondary variant', () => {
      render(<Badge variant="secondary">Secondary</Badge>)

      const badge = screen.getByText('Secondary')
      expect(badge).toHaveClass('bg-secondary')
      expect(badge).toHaveClass('text-secondary-foreground')
    })

    it('renders accent variant', () => {
      render(<Badge variant="accent">Accent</Badge>)

      const badge = screen.getByText('Accent')
      expect(badge).toHaveClass('bg-black')
      expect(badge).toHaveClass('text-white')
    })

    it('renders destructive variant', () => {
      render(<Badge variant="destructive">Destructive</Badge>)

      const badge = screen.getByText('Destructive')
      expect(badge).toHaveClass('bg-destructive')
      expect(badge).toHaveClass('text-destructive-foreground')
    })

    it('renders outline variant', () => {
      render(<Badge variant="outline">Outline</Badge>)

      const badge = screen.getByText('Outline')
      expect(badge).toHaveClass('text-foreground')
    })

    it('renders success variant', () => {
      render(<Badge variant="success">Success</Badge>)

      const badge = screen.getByText('Success')
      expect(badge).toHaveClass('bg-muted')
      expect(badge).toHaveClass('text-foreground')
    })
  })

  describe('styling', () => {
    it('applies custom className', () => {
      render(<Badge className="custom-class">Styled</Badge>)

      const badge = screen.getByText('Styled')
      expect(badge).toHaveClass('custom-class')
    })

    it('merges custom className with variant styles', () => {
      render(
        <Badge variant="destructive" className="my-custom-class">
          Merged
        </Badge>
      )

      const badge = screen.getByText('Merged')
      expect(badge).toHaveClass('my-custom-class')
      expect(badge).toHaveClass('bg-destructive')
    })

    it('has base styles applied', () => {
      render(<Badge>Base Styles</Badge>)

      const badge = screen.getByText('Base Styles')
      expect(badge).toHaveClass('inline-flex')
      expect(badge).toHaveClass('items-center')
      expect(badge).toHaveClass('rounded-md')
      expect(badge).toHaveClass('border')
      expect(badge).toHaveClass('px-2.5')
      expect(badge).toHaveClass('py-0.5')
      expect(badge).toHaveClass('text-xs')
      expect(badge).toHaveClass('font-semibold')
    })
  })

  describe('accessibility', () => {
    it('renders as a div element', () => {
      render(<Badge>Accessible</Badge>)

      const badge = screen.getByText('Accessible')
      expect(badge.tagName).toBe('DIV')
    })

    it('passes through additional HTML attributes', () => {
      render(
        <Badge data-testid="custom-badge" aria-label="Status badge">
          Status
        </Badge>
      )

      const badge = screen.getByTestId('custom-badge')
      expect(badge).toHaveAttribute('aria-label', 'Status badge')
    })

    it('has focus ring styles for keyboard navigation', () => {
      render(<Badge>Focusable</Badge>)

      const badge = screen.getByText('Focusable')
      expect(badge).toHaveClass('focus:ring-2')
      expect(badge).toHaveClass('focus:ring-ring')
      expect(badge).toHaveClass('focus:ring-offset-2')
    })
  })

  describe('edge cases', () => {
    it('renders with empty children', () => {
      render(<Badge>{''}</Badge>)

      // Should render the badge container even with empty content
      const badges = document.querySelectorAll('.inline-flex')
      expect(badges.length).toBeGreaterThan(0)
    })

    it('renders with number children', () => {
      render(<Badge>{42}</Badge>)

      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('renders with complex children', () => {
      render(
        <Badge>
          <span>Icon</span> Label
        </Badge>
      )

      expect(screen.getByText('Icon')).toBeInTheDocument()
      expect(screen.getByText(/Label/)).toBeInTheDocument()
    })
  })
})
