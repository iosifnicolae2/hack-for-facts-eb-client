/**
 * Sidebar Component Tests
 *
 * This file tests the Sidebar UI component library which provides
 * a collapsible sidebar with various sub-components for navigation.
 *
 * Pattern: UI Component Library Testing
 * - Test context provider behavior
 * - Test component rendering
 * - Test state management (open/collapsed)
 * - Test keyboard shortcuts
 * - Test mobile vs desktop behavior
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarInput,
  SidebarSeparator,
  useSidebar,
} from './sidebar'

// ============================================================================
// MOCKS
// ============================================================================

// Mock @/lib/utils
vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
}))

// Mock use-mobile hook
const mockIsMobile = vi.fn(() => false)
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => mockIsMobile(),
}))

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function SidebarContextConsumer() {
  const context = useSidebar()
  return (
    <div>
      <span data-testid="state">{context.state}</span>
      <span data-testid="open">{String(context.open)}</span>
      <span data-testid="isMobile">{String(context.isMobile)}</span>
      <button data-testid="toggle" onClick={context.toggleSidebar}>
        Toggle
      </button>
    </div>
  )
}

// ============================================================================
// TESTS
// ============================================================================

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsMobile.mockReturnValue(false)
  })

  describe('SidebarProvider', () => {
    it('renders children', () => {
      render(
        <SidebarProvider>
          <div>Child content</div>
        </SidebarProvider>
      )

      expect(screen.getByText('Child content')).toBeInTheDocument()
    })

    it('provides context to children', () => {
      render(
        <SidebarProvider>
          <SidebarContextConsumer />
        </SidebarProvider>
      )

      expect(screen.getByTestId('state')).toBeInTheDocument()
      expect(screen.getByTestId('open')).toBeInTheDocument()
    })

    it('starts with collapsed state by default', () => {
      render(
        <SidebarProvider>
          <SidebarContextConsumer />
        </SidebarProvider>
      )

      expect(screen.getByTestId('state')).toHaveTextContent('collapsed')
      expect(screen.getByTestId('open')).toHaveTextContent('false')
    })

    it('respects open prop for initial state', () => {
      render(
        <SidebarProvider open={true}>
          <SidebarContextConsumer />
        </SidebarProvider>
      )

      expect(screen.getByTestId('state')).toHaveTextContent('expanded')
      expect(screen.getByTestId('open')).toHaveTextContent('true')
    })

    it('toggles state when toggleSidebar is called', () => {
      render(
        <SidebarProvider>
          <SidebarContextConsumer />
        </SidebarProvider>
      )

      expect(screen.getByTestId('open')).toHaveTextContent('false')

      fireEvent.click(screen.getByTestId('toggle'))

      expect(screen.getByTestId('open')).toHaveTextContent('true')
    })
  })

  describe('Sidebar', () => {
    it('renders on desktop', () => {
      mockIsMobile.mockReturnValue(false)

      render(
        <SidebarProvider>
          <Sidebar>
            <div>Sidebar content</div>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Sidebar content')).toBeInTheDocument()
    })

    it('has correct data attributes when collapsed', () => {
      render(
        <SidebarProvider open={false}>
          <Sidebar>Content</Sidebar>
        </SidebarProvider>
      )

      const sidebarWrapper = screen.getByText('Content').closest('[data-state]')
      expect(sidebarWrapper).toHaveAttribute('data-state', 'collapsed')
    })

    it('has correct variant data attribute', () => {
      render(
        <SidebarProvider>
          <Sidebar variant="floating">Content</Sidebar>
        </SidebarProvider>
      )

      const sidebarWrapper = screen.getByText('Content').closest('[data-variant]')
      expect(sidebarWrapper).toHaveAttribute('data-variant', 'floating')
    })

    it('renders with left side by default', () => {
      render(
        <SidebarProvider>
          <Sidebar>Content</Sidebar>
        </SidebarProvider>
      )

      const sidebarWrapper = screen.getByText('Content').closest('[data-side]')
      expect(sidebarWrapper).toHaveAttribute('data-side', 'left')
    })

    it('renders with right side when specified', () => {
      render(
        <SidebarProvider>
          <Sidebar side="right">Content</Sidebar>
        </SidebarProvider>
      )

      const sidebarWrapper = screen.getByText('Content').closest('[data-side]')
      expect(sidebarWrapper).toHaveAttribute('data-side', 'right')
    })
  })

  describe('SidebarTrigger', () => {
    it('renders toggle button', () => {
      render(
        <SidebarProvider>
          <SidebarTrigger />
        </SidebarProvider>
      )

      expect(screen.getByRole('button', { name: /toggle sidebar/i })).toBeInTheDocument()
    })

    it('toggles sidebar when clicked', () => {
      render(
        <SidebarProvider>
          <SidebarTrigger />
          <SidebarContextConsumer />
        </SidebarProvider>
      )

      expect(screen.getByTestId('open')).toHaveTextContent('false')

      fireEvent.click(screen.getByRole('button', { name: /toggle sidebar/i }))

      expect(screen.getByTestId('open')).toHaveTextContent('true')
    })

    it('calls custom onClick handler', () => {
      const handleClick = vi.fn()

      render(
        <SidebarProvider>
          <SidebarTrigger onClick={handleClick} />
        </SidebarProvider>
      )

      fireEvent.click(screen.getByRole('button', { name: /toggle sidebar/i }))

      expect(handleClick).toHaveBeenCalled()
    })
  })

  describe('SidebarHeader', () => {
    it('renders children', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>Header content</SidebarHeader>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Header content')).toBeInTheDocument()
    })

    it('has correct data attribute', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>Header</SidebarHeader>
          </Sidebar>
        </SidebarProvider>
      )

      const header = screen.getByText('Header')
      expect(header).toHaveAttribute('data-sidebar', 'header')
    })
  })

  describe('SidebarFooter', () => {
    it('renders children', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarFooter>Footer content</SidebarFooter>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Footer content')).toBeInTheDocument()
    })

    it('has correct data attribute', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarFooter>Footer</SidebarFooter>
          </Sidebar>
        </SidebarProvider>
      )

      const footer = screen.getByText('Footer')
      expect(footer).toHaveAttribute('data-sidebar', 'footer')
    })
  })

  describe('SidebarContent', () => {
    it('renders children', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>Main content</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Main content')).toBeInTheDocument()
    })

    it('has correct data attribute', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>Content</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      const content = screen.getByText('Content')
      expect(content).toHaveAttribute('data-sidebar', 'content')
    })
  })

  describe('SidebarGroup', () => {
    it('renders children', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <SidebarGroup>Group content</SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Group content')).toBeInTheDocument()
    })

    it('has correct data attribute', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <SidebarGroup>Group</SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      const group = screen.getByText('Group')
      expect(group).toHaveAttribute('data-sidebar', 'group')
    })
  })

  describe('SidebarGroupLabel', () => {
    it('renders label text', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Navigation')).toBeInTheDocument()
    })
  })

  describe('SidebarMenu', () => {
    it('renders as list', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <SidebarGroup>
                <SidebarMenu>
                  <SidebarMenuItem>Item</SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByRole('list')).toBeInTheDocument()
      expect(screen.getByText('Item')).toBeInTheDocument()
    })
  })

  describe('SidebarMenuButton', () => {
    it('renders button', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <SidebarGroup>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Click me</SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
    })

    it('handles click', () => {
      const handleClick = vi.fn()

      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <SidebarGroup>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleClick}>
                      Click me
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      fireEvent.click(screen.getByRole('button', { name: 'Click me' }))
      expect(handleClick).toHaveBeenCalled()
    })
  })

  describe('SidebarInset', () => {
    it('renders main content area', () => {
      render(
        <SidebarProvider>
          <Sidebar>Sidebar</Sidebar>
          <SidebarInset>Main content</SidebarInset>
        </SidebarProvider>
      )

      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByText('Main content')).toBeInTheDocument()
    })
  })

  describe('SidebarInput', () => {
    it('renders input', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarInput placeholder="Search..." />
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
    })

    it('has correct data attribute', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarInput placeholder="Search..." />
          </Sidebar>
        </SidebarProvider>
      )

      const input = screen.getByPlaceholderText('Search...')
      expect(input).toHaveAttribute('data-sidebar', 'input')
    })
  })

  describe('SidebarSeparator', () => {
    it('renders separator', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarSeparator data-testid="separator" />
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByTestId('separator')).toBeInTheDocument()
    })

    it('has correct data attribute', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarSeparator data-testid="separator" />
          </Sidebar>
        </SidebarProvider>
      )

      const separator = screen.getByTestId('separator')
      expect(separator).toHaveAttribute('data-sidebar', 'separator')
    })
  })

  describe('useSidebar hook', () => {
    it('throws error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        render(<SidebarContextConsumer />)
      }).toThrow('useSidebar must be used within a SidebarProvider.')

      consoleSpy.mockRestore()
    })
  })

  describe('keyboard shortcuts', () => {
    it('toggles sidebar with Ctrl+B', () => {
      render(
        <SidebarProvider>
          <SidebarContextConsumer />
        </SidebarProvider>
      )

      expect(screen.getByTestId('open')).toHaveTextContent('false')

      fireEvent.keyDown(window, { key: 'b', ctrlKey: true })

      expect(screen.getByTestId('open')).toHaveTextContent('true')
    })

    it('toggles sidebar with Cmd+B (Mac)', () => {
      render(
        <SidebarProvider>
          <SidebarContextConsumer />
        </SidebarProvider>
      )

      expect(screen.getByTestId('open')).toHaveTextContent('false')

      fireEvent.keyDown(window, { key: 'b', metaKey: true })

      expect(screen.getByTestId('open')).toHaveTextContent('true')
    })
  })
})
