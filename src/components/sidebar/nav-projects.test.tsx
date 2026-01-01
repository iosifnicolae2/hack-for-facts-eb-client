/**
 * NavProjects Component Tests
 *
 * This file tests the NavProjects component which displays
 * a list of project links with dropdown actions.
 *
 * Pattern: List with Actions Component Testing
 * - Test project rendering
 * - Test dropdown actions
 * - Test empty state
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { NavProjects } from './nav-projects'
import type { LucideIcon } from 'lucide-react'

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
  Folder: () => <span data-testid="icon-folder" />,
  Forward: () => <span data-testid="icon-forward" />,
  MoreHorizontal: () => <span data-testid="icon-more" />,
  Trash2: () => <span data-testid="icon-trash" />,
}))

// Mock sidebar context
const mockSidebarState = vi.fn()

vi.mock('@/components/ui/sidebar', () => ({
  SidebarGroup: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="sidebar-group" className={className}>
      {children}
    </div>
  ),
  SidebarGroupLabel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-group-label">{children}</div>
  ),
  SidebarMenu: ({ children }: { children: React.ReactNode }) => (
    <ul data-testid="sidebar-menu">{children}</ul>
  ),
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => (
    <li data-testid="sidebar-menu-item">{children}</li>
  ),
  SidebarMenuButton: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <button data-testid="sidebar-menu-button" className={className}>
      {children}
    </button>
  ),
  SidebarMenuAction: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-menu-action">{children}</div>
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
  DropdownMenuItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-item">{children}</div>
  ),
  DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
}))

// ============================================================================
// TEST DATA
// ============================================================================

const MockIcon = (() => <span data-testid="project-icon" />) as unknown as LucideIcon

const sampleProjects = [
  { name: 'Project Alpha', url: '/projects/alpha', icon: MockIcon },
  { name: 'Project Beta', url: '/projects/beta', icon: MockIcon },
  { name: 'Project Gamma', url: '/projects/gamma', icon: MockIcon },
]

const singleProject = [{ name: 'Solo Project', url: '/projects/solo', icon: MockIcon }]

// ============================================================================
// TESTS
// ============================================================================

describe('NavProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSidebarState.mockReturnValue({
      isMobile: false,
    })
  })

  describe('header', () => {
    it('renders Projects label', () => {
      render(<NavProjects projects={sampleProjects} />)

      expect(screen.getByText('Projects')).toBeInTheDocument()
    })

    it('renders sidebar group label', () => {
      render(<NavProjects projects={sampleProjects} />)

      expect(screen.getByTestId('sidebar-group-label')).toBeInTheDocument()
    })
  })

  describe('project rendering', () => {
    it('renders project names', () => {
      render(<NavProjects projects={sampleProjects} />)

      expect(screen.getByText('Project Alpha')).toBeInTheDocument()
      expect(screen.getByText('Project Beta')).toBeInTheDocument()
      expect(screen.getByText('Project Gamma')).toBeInTheDocument()
    })

    it('renders correct number of projects', () => {
      render(<NavProjects projects={sampleProjects} />)

      // 3 projects + 1 "More" item = 4 menu items
      const menuItems = screen.getAllByTestId('sidebar-menu-item')
      expect(menuItems).toHaveLength(4)
    })

    it('renders project links with correct URLs', () => {
      render(<NavProjects projects={sampleProjects} />)

      const links = screen.getAllByRole('link')
      expect(links[0]).toHaveAttribute('href', '/projects/alpha')
      expect(links[1]).toHaveAttribute('href', '/projects/beta')
      expect(links[2]).toHaveAttribute('href', '/projects/gamma')
    })

    it('renders project icons', () => {
      render(<NavProjects projects={sampleProjects} />)

      const icons = screen.getAllByTestId('project-icon')
      expect(icons).toHaveLength(3)
    })
  })

  describe('more button', () => {
    it('renders More button', () => {
      render(<NavProjects projects={sampleProjects} />)

      // Multiple "More" texts exist - sr-only in dropdowns + visible "More" button
      const moreTexts = screen.getAllByText('More')
      expect(moreTexts.length).toBeGreaterThan(0)
    })

    it('renders more icon', () => {
      render(<NavProjects projects={sampleProjects} />)

      // Multiple "more" icons - one for each project action + one for "More" button
      const moreIcons = screen.getAllByTestId('icon-more')
      expect(moreIcons.length).toBeGreaterThan(0)
    })
  })

  describe('dropdown actions', () => {
    it('renders dropdown menus for projects', () => {
      render(<NavProjects projects={sampleProjects} />)

      const dropdowns = screen.getAllByTestId('dropdown-menu')
      expect(dropdowns).toHaveLength(3)
    })

    it('renders View Project action', () => {
      render(<NavProjects projects={sampleProjects} />)

      const viewActions = screen.getAllByText('View Project')
      expect(viewActions).toHaveLength(3)
    })

    it('renders Share Project action', () => {
      render(<NavProjects projects={sampleProjects} />)

      const shareActions = screen.getAllByText('Share Project')
      expect(shareActions).toHaveLength(3)
    })

    it('renders Delete Project action', () => {
      render(<NavProjects projects={sampleProjects} />)

      const deleteActions = screen.getAllByText('Delete Project')
      expect(deleteActions).toHaveLength(3)
    })

    it('renders dropdown separators', () => {
      render(<NavProjects projects={sampleProjects} />)

      const separators = screen.getAllByTestId('dropdown-separator')
      expect(separators).toHaveLength(3)
    })
  })

  describe('empty state', () => {
    it('renders only More button when no projects', () => {
      render(<NavProjects projects={[]} />)

      const menuItems = screen.getAllByTestId('sidebar-menu-item')
      expect(menuItems).toHaveLength(1) // Only "More" item
    })

    it('still renders Projects label when empty', () => {
      render(<NavProjects projects={[]} />)

      expect(screen.getByText('Projects')).toBeInTheDocument()
    })
  })

  describe('single project', () => {
    it('renders single project correctly', () => {
      render(<NavProjects projects={singleProject} />)

      expect(screen.getByText('Solo Project')).toBeInTheDocument()
    })

    it('renders 2 menu items for single project', () => {
      render(<NavProjects projects={singleProject} />)

      // 1 project + 1 "More" item
      const menuItems = screen.getAllByTestId('sidebar-menu-item')
      expect(menuItems).toHaveLength(2)
    })
  })

  describe('structure', () => {
    it('renders sidebar group', () => {
      render(<NavProjects projects={sampleProjects} />)

      expect(screen.getByTestId('sidebar-group')).toBeInTheDocument()
    })

    it('renders sidebar menu', () => {
      render(<NavProjects projects={sampleProjects} />)

      expect(screen.getByTestId('sidebar-menu')).toBeInTheDocument()
    })

    it('has collapsible class on sidebar group', () => {
      render(<NavProjects projects={sampleProjects} />)

      const group = screen.getByTestId('sidebar-group')
      expect(group).toHaveClass('group-data-[collapsible=icon]:hidden')
    })
  })

  describe('mobile behavior', () => {
    it('renders correctly on mobile', () => {
      mockSidebarState.mockReturnValue({
        isMobile: true,
      })

      render(<NavProjects projects={sampleProjects} />)

      expect(screen.getByText('Project Alpha')).toBeInTheDocument()
    })
  })
})
