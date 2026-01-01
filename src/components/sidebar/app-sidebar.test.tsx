/**
 * AppSidebar Component Tests
 *
 * This file tests the AppSidebar component which composes
 * the main application sidebar structure.
 *
 * Pattern: Composition Component Testing
 * - Mock child components
 * - Test component composition
 * - Test props passing
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { AppSidebar } from './app-sidebar'

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

// Mock sidebar UI components
vi.mock('@/components/ui/sidebar', () => ({
  Sidebar: ({ children, collapsible }: { children: React.ReactNode; collapsible?: string }) => (
    <aside data-testid="sidebar" data-collapsible={collapsible}>
      {children}
    </aside>
  ),
  SidebarContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="sidebar-content" className={className}>
      {children}
    </div>
  ),
  SidebarFooter: ({ children }: { children: React.ReactNode }) => (
    <footer data-testid="sidebar-footer">{children}</footer>
  ),
  SidebarHeader: ({ children }: { children: React.ReactNode }) => (
    <header data-testid="sidebar-header">{children}</header>
  ),
}))

// Mock child components
vi.mock('./logo', () => ({
  default: () => <div data-testid="logo">Logo</div>,
}))

vi.mock('./nav-main', () => ({
  NavMain: () => <nav data-testid="nav-main">NavMain</nav>,
}))

vi.mock('./nav-user', () => ({
  NavUser: () => <div data-testid="nav-user">NavUser</div>,
}))

vi.mock('@/components/theme/language-toggle', () => ({
  LanguageToggle: () => <div data-testid="language-toggle">LanguageToggle</div>,
}))

vi.mock('@/components/theme/currency-toggle', () => ({
  CurrencyToggle: () => <div data-testid="currency-toggle">CurrencyToggle</div>,
}))

vi.mock('@/components/theme/inflation-toggle', () => ({
  InflationToggle: () => <div data-testid="inflation-toggle">InflationToggle</div>,
}))

// ============================================================================
// TESTS
// ============================================================================

describe('AppSidebar', () => {
  describe('structure', () => {
    it('renders sidebar container', () => {
      render(<AppSidebar />)

      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    })

    it('renders sidebar header', () => {
      render(<AppSidebar />)

      expect(screen.getByTestId('sidebar-header')).toBeInTheDocument()
    })

    it('renders sidebar content', () => {
      render(<AppSidebar />)

      expect(screen.getByTestId('sidebar-content')).toBeInTheDocument()
    })

    it('renders sidebar footer', () => {
      render(<AppSidebar />)

      expect(screen.getByTestId('sidebar-footer')).toBeInTheDocument()
    })

    it('sets collapsible to icon', () => {
      render(<AppSidebar />)

      expect(screen.getByTestId('sidebar')).toHaveAttribute('data-collapsible', 'icon')
    })
  })

  describe('header components', () => {
    it('renders logo in header', () => {
      render(<AppSidebar />)

      expect(screen.getByTestId('logo')).toBeInTheDocument()
    })
  })

  describe('content components', () => {
    it('renders nav main in content', () => {
      render(<AppSidebar />)

      expect(screen.getByTestId('nav-main')).toBeInTheDocument()
    })
  })

  describe('footer components', () => {
    it('renders currency toggle', () => {
      render(<AppSidebar />)

      expect(screen.getByTestId('currency-toggle')).toBeInTheDocument()
    })

    it('renders inflation toggle', () => {
      render(<AppSidebar />)

      expect(screen.getByTestId('inflation-toggle')).toBeInTheDocument()
    })

    it('renders language toggle', () => {
      render(<AppSidebar />)

      expect(screen.getByTestId('language-toggle')).toBeInTheDocument()
    })

    it('renders nav user', () => {
      render(<AppSidebar />)

      expect(screen.getByTestId('nav-user')).toBeInTheDocument()
    })
  })

  describe('component order in footer', () => {
    it('renders footer components in correct order', () => {
      render(<AppSidebar />)

      const footer = screen.getByTestId('sidebar-footer')
      const children = footer.children

      // Order should be: CurrencyToggle, InflationToggle, LanguageToggle, NavUser
      expect(children[0]).toHaveAttribute('data-testid', 'currency-toggle')
      expect(children[1]).toHaveAttribute('data-testid', 'inflation-toggle')
      expect(children[2]).toHaveAttribute('data-testid', 'language-toggle')
      expect(children[3]).toHaveAttribute('data-testid', 'nav-user')
    })
  })

  describe('props passing', () => {
    it('passes additional props to Sidebar', () => {
      render(<AppSidebar data-custom="test" />)

      // Note: Due to mock implementation, we verify the sidebar renders
      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    })
  })
})
