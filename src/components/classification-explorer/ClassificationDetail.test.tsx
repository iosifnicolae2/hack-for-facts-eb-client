/**
 * ClassificationDetail Component Tests
 *
 * This file tests the ClassificationDetail component which composes
 * breadcrumb, info, children, and siblings components.
 *
 * Pattern: Composition Component Testing
 * - Mock child components
 * - Test component composition
 * - Test conditional rendering of siblings
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { ClassificationDetail } from './ClassificationDetail'
import type {
  ClassificationNode,
  ClassificationHierarchy,
  ClassificationType,
} from '@/types/classification-explorer'

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

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => (
      <div data-testid="motion-div" {...props}>
        {children}
      </div>
    ),
  },
}))

// Mock child components
vi.mock('./ClassificationBreadcrumb', () => ({
  ClassificationBreadcrumb: ({
    type,
    current,
  }: {
    type: string
    current: ClassificationNode
  }) => (
    <div data-testid="breadcrumb" data-type={type} data-code={current.code} />
  ),
}))

vi.mock('./ClassificationInfo', () => ({
  ClassificationInfo: ({
    type,
    node,
  }: {
    type: string
    node: ClassificationNode
  }) => <div data-testid="info" data-type={type} data-code={node.code} />,
}))

vi.mock('./ClassificationChildren', () => ({
  ClassificationChildren: ({
    type,
    children,
  }: {
    type: string
    children: ClassificationNode[]
  }) => (
    <div
      data-testid="children"
      data-type={type}
      data-count={children.length}
    />
  ),
}))

vi.mock('./ClassificationSiblings', () => ({
  ClassificationSiblings: ({
    type,
    siblings,
  }: {
    type: string
    siblings: ClassificationNode[]
  }) => (
    <div
      data-testid="siblings"
      data-type={type}
      data-count={siblings.length}
    />
  ),
}))

// ============================================================================
// TEST DATA
// ============================================================================

const createNode = (code: string, name: string): ClassificationNode =>
  ({
    code,
    name,
    level: 2,
    children: [],
    hasChildren: false,
  }) as unknown as ClassificationNode

const createHierarchy = (
  overrides: Partial<ClassificationHierarchy> = {}
): ClassificationHierarchy => ({
  node: createNode('51.01', 'Primary Education'),
  parents: [createNode('51', 'Education')],
  children: [createNode('51.01.01', 'Elementary')],
  siblings: [createNode('51.02', 'Secondary Education')],
  ...overrides,
})

// ============================================================================
// TESTS
// ============================================================================

describe('ClassificationDetail', () => {
  describe('component composition', () => {
    it('renders motion wrapper', () => {
      const hierarchy = createHierarchy()
      render(<ClassificationDetail type="functional" hierarchy={hierarchy} />)

      expect(screen.getByTestId('motion-div')).toBeInTheDocument()
    })

    it('renders breadcrumb component', () => {
      const hierarchy = createHierarchy()
      render(<ClassificationDetail type="functional" hierarchy={hierarchy} />)

      expect(screen.getByTestId('breadcrumb')).toBeInTheDocument()
    })

    it('renders info component', () => {
      const hierarchy = createHierarchy()
      render(<ClassificationDetail type="functional" hierarchy={hierarchy} />)

      expect(screen.getByTestId('info')).toBeInTheDocument()
    })

    it('renders children component', () => {
      const hierarchy = createHierarchy()
      render(<ClassificationDetail type="functional" hierarchy={hierarchy} />)

      expect(screen.getByTestId('children')).toBeInTheDocument()
    })

    it('renders siblings component when siblings exist', () => {
      const hierarchy = createHierarchy()
      render(<ClassificationDetail type="functional" hierarchy={hierarchy} />)

      expect(screen.getByTestId('siblings')).toBeInTheDocument()
    })
  })

  describe('conditional siblings rendering', () => {
    it('does not render siblings when empty', () => {
      const hierarchy = createHierarchy({ siblings: [] })
      render(<ClassificationDetail type="functional" hierarchy={hierarchy} />)

      expect(screen.queryByTestId('siblings')).not.toBeInTheDocument()
    })

    it('renders siblings when they exist', () => {
      const hierarchy = createHierarchy({
        siblings: [
          createNode('51.02', 'Secondary'),
          createNode('51.03', 'Higher'),
        ],
      })
      render(<ClassificationDetail type="functional" hierarchy={hierarchy} />)

      const siblings = screen.getByTestId('siblings')
      expect(siblings).toHaveAttribute('data-count', '2')
    })
  })

  describe('prop passing', () => {
    it('passes type to breadcrumb', () => {
      const hierarchy = createHierarchy()
      render(<ClassificationDetail type="economic" hierarchy={hierarchy} />)

      expect(screen.getByTestId('breadcrumb')).toHaveAttribute(
        'data-type',
        'economic'
      )
    })

    it('passes type to info', () => {
      const hierarchy = createHierarchy()
      render(<ClassificationDetail type="economic" hierarchy={hierarchy} />)

      expect(screen.getByTestId('info')).toHaveAttribute('data-type', 'economic')
    })

    it('passes type to children', () => {
      const hierarchy = createHierarchy()
      render(<ClassificationDetail type="economic" hierarchy={hierarchy} />)

      expect(screen.getByTestId('children')).toHaveAttribute(
        'data-type',
        'economic'
      )
    })

    it('passes type to siblings', () => {
      const hierarchy = createHierarchy()
      render(<ClassificationDetail type="economic" hierarchy={hierarchy} />)

      expect(screen.getByTestId('siblings')).toHaveAttribute(
        'data-type',
        'economic'
      )
    })

    it('passes current node to breadcrumb', () => {
      const hierarchy = createHierarchy()
      render(<ClassificationDetail type="functional" hierarchy={hierarchy} />)

      expect(screen.getByTestId('breadcrumb')).toHaveAttribute(
        'data-code',
        '51.01'
      )
    })

    it('passes node to info', () => {
      const hierarchy = createHierarchy()
      render(<ClassificationDetail type="functional" hierarchy={hierarchy} />)

      expect(screen.getByTestId('info')).toHaveAttribute('data-code', '51.01')
    })

    it('passes children to children component', () => {
      const hierarchy = createHierarchy({
        children: [
          createNode('51.01.01', 'Elementary'),
          createNode('51.01.02', 'Pre-school'),
        ],
      })
      render(<ClassificationDetail type="functional" hierarchy={hierarchy} />)

      expect(screen.getByTestId('children')).toHaveAttribute('data-count', '2')
    })
  })

  describe('type handling', () => {
    const types: ClassificationType[] = ['functional', 'economic']

    types.forEach((type) => {
      it(`renders correctly for ${type} type`, () => {
        const hierarchy = createHierarchy()
        render(<ClassificationDetail type={type} hierarchy={hierarchy} />)

        expect(screen.getByTestId('breadcrumb')).toHaveAttribute(
          'data-type',
          type
        )
        expect(screen.getByTestId('info')).toHaveAttribute('data-type', type)
        expect(screen.getByTestId('children')).toHaveAttribute('data-type', type)
      })
    })
  })
})
