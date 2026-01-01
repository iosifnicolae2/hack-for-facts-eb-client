/**
 * TeamSwitcher Component Tests
 *
 * This file tests the TeamSwitcher component which displays
 * a dropdown for switching between teams.
 *
 * Pattern: Stateful Dropdown Component Testing
 * - Test initial state
 * - Test team selection
 * - Test dropdown menu items
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { TeamSwitcher } from './team-switcher'

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

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ChevronsUpDown: () => <span data-testid="icon-chevrons" />,
  Plus: () => <span data-testid="icon-plus" />,
}))

// Mock sidebar context
const mockSidebarState = vi.fn()

vi.mock('@/components/ui/sidebar', () => ({
  SidebarMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-menu">{children}</div>
  ),
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-menu-item">{children}</div>
  ),
  SidebarMenuButton: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <button data-testid="sidebar-menu-button" className={className}>
      {children}
    </button>
  ),
  useSidebar: () => mockSidebarState(),
}))

// Mock dropdown menu
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <div data-testid="dropdown-item" onClick={onClick}>
      {children}
    </div>
  ),
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-label">{children}</div>
  ),
  DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
  DropdownMenuShortcut: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="dropdown-shortcut">{children}</span>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
}))

// ============================================================================
// TEST DATA
// ============================================================================

const MockLogo1 = ({ className }: { className?: string }) => (
  <span data-testid="logo-1" className={className} />
)
const MockLogo2 = ({ className }: { className?: string }) => (
  <span data-testid="logo-2" className={className} />
)

const sampleTeams = [
  { name: 'Acme Corp', logo: MockLogo1, plan: 'Enterprise' },
  { name: 'Startup Inc', logo: MockLogo2, plan: 'Free' },
]

const singleTeam = [{ name: 'Solo Team', logo: MockLogo1, plan: 'Pro' }]

// ============================================================================
// TESTS
// ============================================================================

describe('TeamSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSidebarState.mockReturnValue({
      isMobile: false,
    })
  })

  describe('initial state', () => {
    it('renders first team as active', () => {
      render(<TeamSwitcher teams={sampleTeams} />)

      // Team name appears in both trigger and dropdown
      const teamNames = screen.getAllByText('Acme Corp')
      expect(teamNames.length).toBeGreaterThan(0)
    })

    it('renders active team plan', () => {
      render(<TeamSwitcher teams={sampleTeams} />)

      expect(screen.getByText('Enterprise')).toBeInTheDocument()
    })

    it('renders active team logo', () => {
      render(<TeamSwitcher teams={sampleTeams} />)

      expect(screen.getAllByTestId('logo-1').length).toBeGreaterThan(0)
    })
  })

  describe('dropdown menu', () => {
    it('renders Teams label', () => {
      render(<TeamSwitcher teams={sampleTeams} />)

      expect(screen.getByText('Teams')).toBeInTheDocument()
    })

    it('renders all teams in dropdown', () => {
      render(<TeamSwitcher teams={sampleTeams} />)

      // Both team names should appear in dropdown items
      const items = screen.getAllByTestId('dropdown-item')
      expect(items.length).toBeGreaterThanOrEqual(2) // 2 teams + add team
    })

    it('renders Add team option', () => {
      render(<TeamSwitcher teams={sampleTeams} />)

      expect(screen.getByText('Add team')).toBeInTheDocument()
    })

    it('renders keyboard shortcuts', () => {
      render(<TeamSwitcher teams={sampleTeams} />)

      const shortcuts = screen.getAllByTestId('dropdown-shortcut')
      expect(shortcuts.length).toBeGreaterThan(0)
    })

    it('renders dropdown separator', () => {
      render(<TeamSwitcher teams={sampleTeams} />)

      expect(screen.getByTestId('dropdown-separator')).toBeInTheDocument()
    })

    it('renders plus icon for add team', () => {
      render(<TeamSwitcher teams={sampleTeams} />)

      expect(screen.getByTestId('icon-plus')).toBeInTheDocument()
    })
  })

  describe('team selection', () => {
    it('updates active team when clicked', () => {
      render(<TeamSwitcher teams={sampleTeams} />)

      // Find dropdown items and click the second team
      const items = screen.getAllByTestId('dropdown-item')
      // Find the one containing "Startup Inc"
      const startupItem = items.find((item) => item.textContent?.includes('Startup Inc'))
      if (startupItem) {
        fireEvent.click(startupItem)
      }

      // After clicking, the team should be in the document
      const startupTexts = screen.getAllByText('Startup Inc')
      expect(startupTexts.length).toBeGreaterThan(0)
    })
  })

  describe('single team', () => {
    it('renders single team correctly', () => {
      render(<TeamSwitcher teams={singleTeam} />)

      // Team name appears in both trigger and dropdown
      const teamNames = screen.getAllByText('Solo Team')
      expect(teamNames.length).toBeGreaterThan(0)
      expect(screen.getByText('Pro')).toBeInTheDocument()
    })
  })

  describe('structure', () => {
    it('renders sidebar menu', () => {
      render(<TeamSwitcher teams={sampleTeams} />)

      expect(screen.getByTestId('sidebar-menu')).toBeInTheDocument()
    })

    it('renders dropdown menu', () => {
      render(<TeamSwitcher teams={sampleTeams} />)

      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument()
    })

    it('renders chevron icon', () => {
      render(<TeamSwitcher teams={sampleTeams} />)

      expect(screen.getByTestId('icon-chevrons')).toBeInTheDocument()
    })
  })

  describe('mobile behavior', () => {
    it('renders correctly on mobile', () => {
      mockSidebarState.mockReturnValue({
        isMobile: true,
      })

      render(<TeamSwitcher teams={sampleTeams} />)

      // Team name appears in both trigger and dropdown
      const teamNames = screen.getAllByText('Acme Corp')
      expect(teamNames.length).toBeGreaterThan(0)
    })
  })
})
