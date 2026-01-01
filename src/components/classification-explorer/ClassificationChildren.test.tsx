/**
 * ClassificationChildren Component Tests
 *
 * This file tests the ClassificationChildren component which displays
 * a list of child classification nodes with navigation links.
 *
 * Pattern: List Component Testing
 * - Mock router Link components
 * - Test empty state
 * - Test child rendering
 * - Test navigation links
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { ClassificationChildren } from './ClassificationChildren'
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
    <a href={to} data-testid="child-link">
      {children}
    </a>
  ),
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ChevronRight: () => <span data-testid="chevron-icon" />,
  Layers: () => <span data-testid="layers-icon" />,
}))

// ============================================================================
// TEST DATA
// ============================================================================

const createChild = (
  code: string,
  name: string
): ClassificationNode =>
  ({
    code,
    name,
    level: 2,
    children: [],
    hasChildren: false,
  }) as unknown as ClassificationNode

const singleChild = [createChild('51.01', 'Primary Education')]

const multipleChildren = [
  createChild('51.01', 'Primary Education'),
  createChild('51.02', 'Secondary Education'),
  createChild('51.03', 'Higher Education'),
]

const childWithoutName = [createChild('99.99', '')]

// ============================================================================
// TESTS
// ============================================================================

describe('ClassificationChildren', () => {
  describe('header', () => {
    it('renders "Subcategories" heading', () => {
      render(
        <ClassificationChildren type="functional" children={singleChild} />
      )

      expect(screen.getByText('Subcategories')).toBeInTheDocument()
    })

    it('displays child count', () => {
      render(
        <ClassificationChildren type="functional" children={multipleChildren} />
      )

      expect(screen.getByText('(3)')).toBeInTheDocument()
    })

    it('displays zero count when no children', () => {
      render(<ClassificationChildren type="functional" children={[]} />)

      expect(screen.getByText('(0)')).toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('renders empty message when no children', () => {
      render(<ClassificationChildren type="functional" children={[]} />)

      expect(
        screen.getByText('This classification has no subcategories')
      ).toBeInTheDocument()
    })

    it('renders layers icon when empty', () => {
      render(<ClassificationChildren type="functional" children={[]} />)

      expect(screen.getByTestId('layers-icon')).toBeInTheDocument()
    })
  })

  describe('child rendering', () => {
    it('renders child code', () => {
      render(
        <ClassificationChildren type="functional" children={singleChild} />
      )

      expect(screen.getByText('51.01')).toBeInTheDocument()
    })

    it('renders child name', () => {
      render(
        <ClassificationChildren type="functional" children={singleChild} />
      )

      expect(screen.getByText('Primary Education')).toBeInTheDocument()
    })

    it('renders multiple children', () => {
      render(
        <ClassificationChildren type="functional" children={multipleChildren} />
      )

      expect(screen.getByText('51.01')).toBeInTheDocument()
      expect(screen.getByText('51.02')).toBeInTheDocument()
      expect(screen.getByText('51.03')).toBeInTheDocument()
    })

    it('renders "Missing title" for children without name', () => {
      render(
        <ClassificationChildren type="functional" children={childWithoutName} />
      )

      expect(screen.getByText('Missing title')).toBeInTheDocument()
    })

    it('renders chevron icons for each child', () => {
      render(
        <ClassificationChildren type="functional" children={multipleChildren} />
      )

      const chevrons = screen.getAllByTestId('chevron-icon')
      expect(chevrons).toHaveLength(3)
    })
  })

  describe('navigation links', () => {
    it('creates correct link for functional type', () => {
      render(
        <ClassificationChildren type="functional" children={singleChild} />
      )

      const link = screen.getByTestId('child-link')
      expect(link).toHaveAttribute('href', '/classifications/functional/51.01')
    })

    it('creates correct link for economic type', () => {
      render(
        <ClassificationChildren type="economic" children={singleChild} />
      )

      const link = screen.getByTestId('child-link')
      expect(link).toHaveAttribute('href', '/classifications/economic/51.01')
    })

    it('creates links for all children', () => {
      render(
        <ClassificationChildren type="functional" children={multipleChildren} />
      )

      const links = screen.getAllByTestId('child-link')
      expect(links).toHaveLength(3)
      expect(links[0]).toHaveAttribute(
        'href',
        '/classifications/functional/51.01'
      )
      expect(links[1]).toHaveAttribute(
        'href',
        '/classifications/functional/51.02'
      )
      expect(links[2]).toHaveAttribute(
        'href',
        '/classifications/functional/51.03'
      )
    })
  })

  describe('type handling', () => {
    const types: ClassificationType[] = ['functional', 'economic']

    types.forEach((type) => {
      it(`renders correctly for ${type} type`, () => {
        render(
          <ClassificationChildren type={type} children={singleChild} />
        )

        expect(screen.getByText('Subcategories')).toBeInTheDocument()
        expect(screen.getByText('51.01')).toBeInTheDocument()
      })
    })
  })
})
