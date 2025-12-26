import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { BudgetCycleTimeline } from './BudgetCycleTimeline'

// Mock Lingui
vi.mock('@lingui/core/macro', () => ({
  t: (str: any) => str,
  msg: (str: any) => str,
}))
vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: any) => <>{children}</>,
}))

beforeAll(() => {
  // Mock IntersectionObserver
  class MockIntersectionObserver {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  }
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  })
})

const phaseLabels = {
  planning: { name: "Planning", timing: "Jun - Aug" },
  drafting: { name: "Drafting", timing: "Aug - Nov 15" },
  approval: { name: "Approval", timing: "Nov 15 - Dec" },
  execution: { name: "Execution", timing: "Jan - Dec" },
  reporting: { name: "Reporting", timing: "Quarterly" },
  audit: { name: "Audit", timing: "Following Year" }
}

const phaseContent = {
  planning: {
    name: "Planning",
    timing: "June - August",
    description: "Planning description",
    keyActivities: ["Activity 1"],
    citizenOpportunities: ["Opportunity 1"],
    keyDeadlines: [{ date: "Jun 1", description: "Deadline 1" }]
  },
  drafting: {
    name: "Drafting",
    timing: "August - November 15",
    description: "Drafting description",
    keyActivities: ["Activity 2"],
    citizenOpportunities: ["Opportunity 2"],
    keyDeadlines: [{ date: "Sep 15", description: "Deadline 2" }]
  },
  approval: {
    name: "Approval",
    timing: "November 15 - December",
    description: "Approval description",
    keyActivities: ["Activity 3"],
    citizenOpportunities: ["Opportunity 3"],
    keyDeadlines: [{ date: "Dec 15", description: "Deadline 3" }]
  },
  execution: {
    name: "Execution",
    timing: "January - December",
    description: "Execution description",
    keyActivities: ["Activity 4"],
    citizenOpportunities: ["Opportunity 4"],
    keyDeadlines: [{ date: "Dec 31", description: "Deadline 4" }]
  },
  reporting: {
    name: "Reporting",
    timing: "Quarterly",
    description: "Reporting description",
    keyActivities: ["Activity 5"],
    citizenOpportunities: ["Opportunity 5"],
    keyDeadlines: [{ date: "Q1", description: "Deadline 5" }]
  },
  audit: {
    name: "Audit",
    timing: "Following Year",
    description: "Audit description",
    keyActivities: ["Activity 6"],
    citizenOpportunities: ["Opportunity 6"],
    keyDeadlines: [{ date: "Jul 1", description: "Deadline 6" }]
  }
}

describe('BudgetCycleTimeline', () => {
  it('renders correctly', () => {
    render(
      <BudgetCycleTimeline
        phaseLabels={phaseLabels}
        content={phaseContent}
      />
    )

    // Check if title is present (default)
    expect(screen.getByText('Budget Cycle Timeline')).toBeInTheDocument()

    // Check if phase labels are present (may appear multiple times due to desktop/mobile views)
    expect(screen.getAllByText('Planning').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Approval').length).toBeGreaterThan(0)
  })

  it('handles phase clicks', async () => {
    render(
      <BudgetCycleTimeline
        phaseLabels={phaseLabels}
        content={phaseContent}
      />
    )

    // Find all phase bar buttons and click on Drafting (a different phase)
    const draftingButtons = screen.getAllByRole('button', { name: /Drafting/i })
    fireEvent.click(draftingButtons[0])

    // Wait for animation and check if detail panel shows
    await waitFor(() => {
      expect(screen.getByText('Drafting description')).toBeInTheDocument()
    })
    expect(screen.getByText('Activity 2')).toBeInTheDocument()
  })

  it('shows countdown', () => {
    render(
      <BudgetCycleTimeline
        phaseLabels={phaseLabels}
        content={phaseContent}
        text={{ countdownLabel: "days left" }}
      />
    )

    expect(screen.getByText('days')).toBeInTheDocument()
  })
})
