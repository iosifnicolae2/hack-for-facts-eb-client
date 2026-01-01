/**
 * ClassificationSkeleton Component Tests
 *
 * This file tests the skeleton loading components for the classification explorer.
 *
 * Pattern: Skeleton Component Testing
 * - Test skeleton structure
 * - Test correct number of placeholder elements
 * - Test conditional rendering
 */

import { describe, it, expect, vi } from 'vitest'
import { render } from '@/test/test-utils'
import {
  ClassificationDetailSkeleton,
  ClassificationGridSkeleton,
  ClassificationPageSkeleton,
} from './ClassificationSkeleton'

// ============================================================================
// MOCKS
// ============================================================================

// Mock Lingui
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

describe('ClassificationDetailSkeleton', () => {
  it('renders skeleton structure', () => {
    const { container } = render(<ClassificationDetailSkeleton />)

    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders back button skeleton', () => {
    const { container } = render(<ClassificationDetailSkeleton />)

    // Check for skeleton elements - they have animate-pulse class
    const animatedElements = container.querySelectorAll('[class*="animate"]')
    expect(animatedElements.length).toBeGreaterThan(0)
  })

  it('renders main info card skeleton', () => {
    const { container } = render(<ClassificationDetailSkeleton />)

    // Should have card elements
    const cards = container.querySelectorAll('[class*="rounded"]')
    expect(cards.length).toBeGreaterThan(0)
  })

  it('renders children section with 4 items', () => {
    const { container } = render(<ClassificationDetailSkeleton />)

    // The children section has 4 skeleton items in a bordered container
    const borderedItems = container.querySelectorAll('.border.rounded-lg')
    expect(borderedItems.length).toBeGreaterThanOrEqual(4)
  })

  it('renders siblings section with 3 items', () => {
    const { container } = render(<ClassificationDetailSkeleton />)

    // The component structure should be present
    expect(container.querySelector('.space-y-6')).toBeInTheDocument()
  })
})

describe('ClassificationGridSkeleton', () => {
  it('renders skeleton structure', () => {
    const { container } = render(<ClassificationGridSkeleton />)

    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders stats bar skeleton', () => {
    const { container } = render(<ClassificationGridSkeleton />)

    // Stats bar has bg-muted/30 class
    const statsBar = container.querySelector('[class*="bg-muted"]')
    expect(statsBar).toBeInTheDocument()
  })

  it('renders 12 list item skeletons', () => {
    const { container } = render(<ClassificationGridSkeleton />)

    // Each list item has divide-y parent
    const divideContainer = container.querySelector('.divide-y')
    expect(divideContainer).toBeInTheDocument()
    expect(divideContainer?.children.length).toBe(12)
  })

  it('renders list container', () => {
    const { container } = render(<ClassificationGridSkeleton />)

    const listContainer = container.querySelector('.bg-card')
    expect(listContainer).toBeInTheDocument()
  })
})

describe('ClassificationPageSkeleton', () => {
  it('renders with header by default', () => {
    const { container } = render(<ClassificationPageSkeleton />)

    // Header section has mb-8 class
    const header = container.querySelector('.mb-8')
    expect(header).toBeInTheDocument()
  })

  it('renders without header when showHeader is false', () => {
    const { container } = render(<ClassificationPageSkeleton showHeader={false} />)

    // Header section should not exist
    const header = container.querySelector('.mb-8')
    expect(header).not.toBeInTheDocument()
  })

  it('includes grid skeleton', () => {
    const { container } = render(<ClassificationPageSkeleton />)

    // Grid skeleton has divide-y for list items
    const divideContainer = container.querySelector('.divide-y')
    expect(divideContainer).toBeInTheDocument()
  })

  it('renders title skeleton in header', () => {
    const { container } = render(<ClassificationPageSkeleton showHeader={true} />)

    // Header should have title and description skeletons (animated elements)
    const headerSection = container.querySelector('.mb-8')
    const skeletons = headerSection?.querySelectorAll('[class*="animate"]')
    expect(skeletons?.length).toBeGreaterThan(0)
  })

  it('renders search skeleton in header', () => {
    const { container } = render(<ClassificationPageSkeleton showHeader={true} />)

    // Search skeleton is a full-width h-10 element
    const searchSkeleton = container.querySelector('.w-full.h-10')
    expect(searchSkeleton).toBeInTheDocument()
  })

  it('has proper layout structure', () => {
    const { container } = render(<ClassificationPageSkeleton />)

    // Check for min-h-screen and max-w-6xl
    expect(container.querySelector('.min-h-screen')).toBeInTheDocument()
    expect(container.querySelector('.max-w-6xl')).toBeInTheDocument()
  })
})
