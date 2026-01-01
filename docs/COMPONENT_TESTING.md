# Component Testing Standards

This document provides comprehensive guidelines for component testing in the Transparenta.eu project using Vitest and React Testing Library.

## Table of Contents

1. [Testing Philosophy](#1-testing-philosophy)
2. [Test File Structure](#2-test-file-structure)
3. [Mocking Strategy](#3-mocking-strategy)
4. [Test Utilities](#4-test-utilities)
5. [Component Testing Patterns](#5-component-testing-patterns)
6. [Best Practices](#6-best-practices)
7. [Coverage Guidelines](#7-coverage-guidelines)
8. [Example Templates](#8-example-templates)

---

## 1. Testing Philosophy

### What to Test

**DO Test:**
- User-visible behavior and interactions
- Component rendering based on props
- Error states and loading states
- User event handlers (clicks, input changes, form submissions)
- Conditional rendering logic
- Accessibility attributes (roles, labels, states)
- Edge cases (empty states, maximum values, null/undefined handling)

**DO NOT Test:**
- Implementation details (internal state, private methods)
- Third-party library internals (shadcn, Radix primitives, Recharts)
- CSS styling details (leave to visual regression tests)
- TypeScript type definitions (compiler handles this)

### Accessibility-First Testing

Always prefer accessible queries:

```typescript
// BEST - uses accessible role
screen.getByRole('button', { name: /submit/i })
screen.getByRole('textbox', { name: /email/i })

// GOOD - uses label
screen.getByLabelText(/email address/i)

// ACCEPTABLE - uses text content
screen.getByText(/welcome/i)

// LAST RESORT - use test id only when nothing else works
screen.getByTestId('complex-widget')
```

Query priority (most to least preferred):
1. `getByRole` - reflects accessibility tree
2. `getByLabelText` - for form fields
3. `getByPlaceholderText` - for search inputs
4. `getByText` - for non-interactive elements
5. `getByDisplayValue` - for filled form fields
6. `getByAltText` - for images
7. `getByTestId` - only when nothing else works

---

## 2. Test File Structure

### File Naming and Location

- Place test files adjacent to the component: `ComponentName.test.tsx`
- Use `.test.tsx` for component tests, `.test.ts` for utility tests
- Match the component file name exactly

```
src/components/
  ui/
    badge.tsx
    badge.test.tsx        # Tests for Badge component
  filters/
    period-filter/
      PeriodFilter.tsx
      PeriodFilter.test.tsx  # Tests for PeriodFilter
```

### Describe Block Organization

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/test-utils'
import { ComponentName } from './ComponentName'

describe('ComponentName', () => {
  // Setup/teardown
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Group by feature or behavior
  describe('rendering', () => {
    it('renders with default props', () => {})
    it('renders with custom className', () => {})
  })

  describe('user interactions', () => {
    it('calls onClick when button is clicked', () => {})
    it('toggles state on checkbox change', () => {})
  })

  describe('accessibility', () => {
    it('has correct aria-label', () => {})
    it('is keyboard navigable', () => {})
  })

  describe('error handling', () => {
    it('displays error message on failure', () => {})
  })

  describe('edge cases', () => {
    it('handles empty data gracefully', () => {})
  })
})
```

---

## 3. Mocking Strategy

### Lingui (i18n) Mocks

Always mock Lingui in tests:

```typescript
// Mock Trans component
vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock t and msg macros
vi.mock('@lingui/core/macro', () => ({
  t: (strings: TemplateStringsArray, ...values: unknown[]) =>
    strings.reduce((acc, str, i) => acc + str + (values[i] ?? ''), ''),
  msg: (strings: TemplateStringsArray, ...values: unknown[]) =>
    strings.reduce((acc, str, i) => acc + str + (values[i] ?? ''), ''),
}))

// Mock i18n instance
vi.mock('@lingui/core', () => ({
  i18n: {
    _: (message: string | { id: string }) =>
      typeof message === 'string' ? message : message.id,
    locale: 'en',
  },
}))
```

Or use the shared mock from `@/test/mocks/lingui`:

```typescript
import '@/test/mocks/lingui'
```

### TanStack Router Mocks

```typescript
const mockNavigate = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  useSearch: () => ({}),
  useParams: () => ({}),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))
```

Or use the shared mock:

```typescript
import { mockNavigate } from '@/test/mocks/router'
```

### GraphQL API Mocks

```typescript
const mockGraphqlRequest = vi.fn()

vi.mock('@/lib/api/graphql', () => ({
  graphqlRequest: (...args: unknown[]) => mockGraphqlRequest(...args),
}))

// In tests
beforeEach(() => {
  mockGraphqlRequest.mockResolvedValue({
    entities: { nodes: [], pageInfo: { totalCount: 0 } },
  })
})
```

### Motion/Animation Mocks

```typescript
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => (
      <div {...props}>{children}</div>
    ),
    // Add other elements as needed
  },
  useAnimationControls: () => ({
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn(),
  }),
}))
```

### Recharts Mocks

For chart components, mock Recharts to avoid SVG complexity:

```typescript
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <svg data-testid="line-chart">{children}</svg>
  ),
  // Add other chart types as needed
}))
```

---

## 4. Test Utilities

### Using the Custom Render

Always import from `@/test/test-utils` instead of `@testing-library/react`:

```typescript
import { render, screen, fireEvent, waitFor } from '@/test/test-utils'
```

The custom render automatically wraps components with:
- `QueryClientProvider` (TanStack Query)
- Other providers as configured

### Helper Functions

Located in `@/test/helpers.ts`:

```typescript
import { setupUser, waitForLoadingToComplete, mockResizeObserver } from '@/test/helpers'

// Setup userEvent
const user = setupUser()
await user.click(button)

// Wait for loading to complete
await waitForLoadingToComplete()

// Mock ResizeObserver
beforeAll(() => {
  mockResizeObserver()
})
```

---

## 5. Component Testing Patterns

### Pattern 1: Simple UI Components

For presentational components like Button, Badge, Card:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { Badge } from './badge'

describe('Badge', () => {
  it('renders with default variant', () => {
    render(<Badge>Test</Badge>)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('renders with different variants', () => {
    const { rerender } = render(<Badge variant="destructive">Error</Badge>)
    expect(screen.getByText('Error')).toHaveClass('bg-destructive')

    rerender(<Badge variant="outline">Outline</Badge>)
    expect(screen.getByText('Outline')).toHaveClass('text-foreground')
  })

  it('applies custom className', () => {
    render(<Badge className="custom-class">Test</Badge>)
    expect(screen.getByText('Test')).toHaveClass('custom-class')
  })
})
```

### Pattern 2: Components with Hooks/State

For components with internal state:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { PeriodFilter } from './PeriodFilter'

// Mock Lingui
vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('PeriodFilter', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders period type options', () => {
    render(<PeriodFilter onChange={mockOnChange} />)

    expect(screen.getByRole('radio', { name: /yearly/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /quarterly/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /monthly/i })).toBeInTheDocument()
  })

  it('calls onChange when period type changes', async () => {
    const user = userEvent.setup()
    render(<PeriodFilter onChange={mockOnChange} />)

    await user.click(screen.getByRole('radio', { name: /quarterly/i }))

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'QUARTER' })
    )
  })
})
```

### Pattern 3: Components with API Calls

For components using TanStack Query:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import { EntityList } from './EntityList'

const mockGraphqlRequest = vi.fn()

vi.mock('@/lib/api/graphql', () => ({
  graphqlRequest: (...args: unknown[]) => mockGraphqlRequest(...args),
}))

describe('EntityList', () => {
  const mockEntities = {
    entities: {
      nodes: [{ name: 'Test Entity', cui: '12345' }],
      pageInfo: { totalCount: 1, hasNextPage: false },
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGraphqlRequest.mockResolvedValue(mockEntities)
  })

  it('shows loading state initially', () => {
    render(<EntityList />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('renders entities after loading', async () => {
    render(<EntityList />)

    await waitFor(() => {
      expect(screen.getByText(/Test Entity/i)).toBeInTheDocument()
    })
  })

  it('handles error state', async () => {
    mockGraphqlRequest.mockRejectedValue(new Error('Network error'))

    render(<EntityList />)

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
  })
})
```

### Pattern 4: Conditional Rendering Components

For components that render different content based on props:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { ChartRenderer } from './ChartRenderer'

// Mock child chart components
vi.mock('./TimeSeriesLineChart', () => ({
  TimeSeriesLineChart: () => <div data-testid="line-chart" />,
}))

vi.mock('./TimeSeriesBarChart', () => ({
  TimeSeriesBarChart: () => <div data-testid="bar-chart" />,
}))

describe('ChartRenderer', () => {
  const createMockChart = (chartType: string) => ({
    id: 'test-chart',
    config: { chartType },
    series: [{ id: 's1', enabled: true }],
  })

  it('renders line chart for line type', () => {
    render(<ChartRenderer chart={createMockChart('line')} {...otherProps} />)
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('renders bar chart for bar type', () => {
    render(<ChartRenderer chart={createMockChart('bar')} {...otherProps} />)
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('shows empty state when no series enabled', () => {
    const chart = { ...createMockChart('line'), series: [] }
    render(<ChartRenderer chart={chart} {...otherProps} />)
    expect(screen.getByText(/no enabled series/i)).toBeInTheDocument()
  })
})
```

---

## 6. Best Practices

### AAA Pattern (Arrange-Act-Assert)

```typescript
it('increments counter when button is clicked', async () => {
  // Arrange
  const user = userEvent.setup()
  render(<Counter initialValue={0} />)

  // Act
  await user.click(screen.getByRole('button', { name: /increment/i }))

  // Assert
  expect(screen.getByText('1')).toBeInTheDocument()
})
```

### Async Handling

```typescript
// For elements that appear after async operations
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})

// For user interactions - use fireEvent
fireEvent.click(button)
fireEvent.change(input, { target: { value: 'new value' } })

// Using findBy (combines getBy + waitFor)
const element = await screen.findByText('Async content')
```

### Avoid Implementation Details

```typescript
// BAD - tests implementation details
it('sets internal state to true', () => {
  const { result } = renderHook(() => useState(false))
  // Testing internal state
})

// GOOD - tests user-visible behavior
it('shows expanded content after click', async () => {
  const user = userEvent.setup()
  render(<Accordion />)

  await user.click(screen.getByRole('button', { name: /expand/i }))

  expect(screen.getByText('Hidden content')).toBeVisible()
})
```

### Test Data Factories

Create reusable test data factories:

```typescript
const createMockEntity = (overrides = {}) => ({
  cui: '12345',
  name: 'Test Entity',
  type: 'UAT',
  ...overrides,
})

const createMockTreemapData = (count = 3) =>
  Array.from({ length: count }, (_, i) => ({
    name: `Category ${i + 1}`,
    value: (count - i) * 1000000,
    code: `${i + 1}`,
  }))
```

---

## 7. Coverage Guidelines

### Target Coverage

| Category | Minimum | Target |
|----------|---------|--------|
| Critical business logic | 90% | 95% |
| UI components | 70% | 80% |
| Utility functions | 85% | 95% |
| Overall | 70% | 80% |

### Run Coverage Report

```bash
yarn test:coverage
```

### Critical Paths to Cover

1. **Data fetching** - Success, error, loading states
2. **User interactions** - Clicks, form submissions, selections
3. **Filter interactions** - Selection, clearing, URL sync
4. **Navigation** - Route changes, breadcrumbs
5. **Error boundaries** - Error catching, fallback UI

---

## 8. Example Templates

### Template: Simple Component

```typescript
// ComponentName.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { ComponentName } from './ComponentName'

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<ComponentName onClick={handleClick} />)
    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Template: Component with API

```typescript
// ComponentWithAPI.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import { ComponentWithAPI } from './ComponentWithAPI'

const mockFetch = vi.fn()
vi.mock('@/lib/api/graphql', () => ({
  graphqlRequest: (...args: unknown[]) => mockFetch(...args),
}))

describe('ComponentWithAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({ data: [] })
  })

  it('shows loading then data', async () => {
    mockFetch.mockResolvedValue({ data: [{ id: 1, name: 'Test' }] })

    render(<ComponentWithAPI />)

    // Initially loading
    expect(screen.getByRole('progressbar')).toBeInTheDocument()

    // Then shows data
    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument()
    })
  })

  it('handles errors', async () => {
    mockFetch.mockRejectedValue(new Error('Failed'))

    render(<ComponentWithAPI />)

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
  })
})
```

### Template: Hook Test

```typescript
// useCustomHook.test.ts
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCustomHook } from './useCustomHook'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useCustomHook', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useCustomHook(), {
      wrapper: createWrapper(),
    })

    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(true)
  })

  it('updates state on action', async () => {
    const { result } = renderHook(() => useCustomHook(), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.performAction()
    })

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })
  })
})
```

---

## Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with UI
yarn test:ui

# Run tests with coverage
yarn test:coverage

# Run a specific test file
yarn test src/components/ui/badge.test.tsx
```

---

## Reference Files

- Test utilities: `src/test/test-utils.tsx`
- Test setup: `src/test/setup.ts`
- Mock files: `src/test/mocks/`
- Example tests:
  - Simple: `src/components/ui/badge.test.tsx`
  - With state: `src/components/filters/period-filter/PeriodFilter.test.tsx`
  - Conditional: `src/components/charts/components/chart-renderer/components/ChartRenderer.test.tsx`
  - Complex: `src/components/budget-explorer/BudgetTreemap.test.tsx`
