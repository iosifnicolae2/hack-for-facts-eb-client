/**
 * ClassificationSiblings Component Tests
 *
 * This file tests the ClassificationSiblings component which displays
 * related classification categories with expand/collapse functionality.
 *
 * Pattern: Expandable List Component Testing
 * - Test empty state
 * - Test initial display limit
 * - Test expand/collapse behavior
 * - Test navigation links
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { ClassificationSiblings } from './ClassificationSiblings'
import type { ClassificationNode, ClassificationType } from '@/types/classification-explorer'

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

// Mock TanStack Router
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to} data-testid="sibling-link">
      {children}
    </a>
  ),
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ChevronRight: () => <span data-testid="chevron-right" />,
  ChevronDown: () => <span data-testid="chevron-down" />,
  ChevronUp: () => <span data-testid="chevron-up" />,
}))

// ============================================================================
// TEST DATA
// ============================================================================

const createSibling = (code: string, name: string): ClassificationNode =>
  ({
    code,
    name,
    level: 2,
    children: [],
    hasChildren: false,
  }) as unknown as ClassificationNode

const fewSiblings = [
  createSibling('51.01', 'Primary Education'),
  createSibling('51.02', 'Secondary Education'),
  createSibling('51.03', 'Higher Education'),
]

const manySiblings = [
  createSibling('51.01', 'Primary Education'),
  createSibling('51.02', 'Secondary Education'),
  createSibling('51.03', 'Higher Education'),
  createSibling('51.04', 'Vocational Training'),
  createSibling('51.05', 'Special Education'),
  createSibling('51.06', 'Adult Education'),
  createSibling('51.07', 'Online Learning'),
  createSibling('51.08', 'Research Programs'),
]

const siblingWithoutName = [createSibling('99.99', '')]

// ============================================================================
// TESTS
// ============================================================================

describe('ClassificationSiblings', () => {
  describe('empty state', () => {
    it('returns null when siblings array is empty', () => {
      const { container } = render(
        <ClassificationSiblings type="functional" siblings={[]} />
      )

      expect(container.firstChild).toBeNull()
    })
  })

  describe('header', () => {
    it('renders "Related Categories" heading', () => {
      render(
        <ClassificationSiblings type="functional" siblings={fewSiblings} />
      )

      expect(screen.getByText('Related Categories')).toBeInTheDocument()
    })

    it('displays sibling count', () => {
      render(
        <ClassificationSiblings type="functional" siblings={fewSiblings} />
      )

      expect(screen.getByText('(3)')).toBeInTheDocument()
    })
  })

  describe('sibling rendering', () => {
    it('renders sibling codes', () => {
      render(
        <ClassificationSiblings type="functional" siblings={fewSiblings} />
      )

      expect(screen.getByText('51.01')).toBeInTheDocument()
      expect(screen.getByText('51.02')).toBeInTheDocument()
      expect(screen.getByText('51.03')).toBeInTheDocument()
    })

    it('renders sibling names', () => {
      render(
        <ClassificationSiblings type="functional" siblings={fewSiblings} />
      )

      expect(screen.getByText('Primary Education')).toBeInTheDocument()
      expect(screen.getByText('Secondary Education')).toBeInTheDocument()
    })

    it('renders "Missing title" for siblings without name', () => {
      render(
        <ClassificationSiblings type="functional" siblings={siblingWithoutName} />
      )

      expect(screen.getByText('Missing title')).toBeInTheDocument()
    })

    it('renders chevron icons', () => {
      render(
        <ClassificationSiblings type="functional" siblings={fewSiblings} />
      )

      const chevrons = screen.getAllByTestId('chevron-right')
      expect(chevrons).toHaveLength(3)
    })
  })

  describe('navigation links', () => {
    it('creates correct links for functional type', () => {
      render(
        <ClassificationSiblings type="functional" siblings={fewSiblings} />
      )

      const links = screen.getAllByTestId('sibling-link')
      expect(links[0]).toHaveAttribute('href', '/classifications/functional/51.01')
    })

    it('creates correct links for economic type', () => {
      render(
        <ClassificationSiblings type="economic" siblings={fewSiblings} />
      )

      const links = screen.getAllByTestId('sibling-link')
      expect(links[0]).toHaveAttribute('href', '/classifications/economic/51.01')
    })
  })

  describe('expand/collapse functionality', () => {
    it('initially shows only 5 siblings when there are more', () => {
      render(
        <ClassificationSiblings type="functional" siblings={manySiblings} />
      )

      const links = screen.getAllByTestId('sibling-link')
      expect(links).toHaveLength(5)
    })

    it('does not show expand button when 5 or fewer siblings', () => {
      render(
        <ClassificationSiblings type="functional" siblings={fewSiblings} />
      )

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('shows expand button when more than 5 siblings', () => {
      render(
        <ClassificationSiblings type="functional" siblings={manySiblings} />
      )

      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('shows "Show X more" text on expand button', () => {
      render(
        <ClassificationSiblings type="functional" siblings={manySiblings} />
      )

      // manySiblings has 8 items, so should show "Show 3 more"
      expect(screen.getByText(/Show.*more/)).toBeInTheDocument()
    })

    it('shows chevron down icon when collapsed', () => {
      render(
        <ClassificationSiblings type="functional" siblings={manySiblings} />
      )

      expect(screen.getByTestId('chevron-down')).toBeInTheDocument()
    })

    it('expands to show all siblings when button clicked', () => {
      render(
        <ClassificationSiblings type="functional" siblings={manySiblings} />
      )

      const button = screen.getByRole('button')
      fireEvent.click(button)

      const links = screen.getAllByTestId('sibling-link')
      expect(links).toHaveLength(8)
    })

    it('shows "Show less" text after expanding', () => {
      render(
        <ClassificationSiblings type="functional" siblings={manySiblings} />
      )

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(screen.getByText('Show less')).toBeInTheDocument()
    })

    it('shows chevron up icon after expanding', () => {
      render(
        <ClassificationSiblings type="functional" siblings={manySiblings} />
      )

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(screen.getByTestId('chevron-up')).toBeInTheDocument()
    })

    it('collapses back to 5 siblings when clicked again', () => {
      render(
        <ClassificationSiblings type="functional" siblings={manySiblings} />
      )

      const button = screen.getByRole('button')
      fireEvent.click(button) // Expand
      fireEvent.click(button) // Collapse

      const links = screen.getAllByTestId('sibling-link')
      expect(links).toHaveLength(5)
    })
  })

  describe('type handling', () => {
    const types: ClassificationType[] = ['functional', 'economic']

    types.forEach((type) => {
      it(`renders correctly for ${type} type`, () => {
        render(
          <ClassificationSiblings type={type} siblings={fewSiblings} />
        )

        expect(screen.getByText('Related Categories')).toBeInTheDocument()
      })
    })
  })
})
