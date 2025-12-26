import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { PhaseCards } from './PhaseCards'

// Mock Lingui - handle both regular strings and template literals
vi.mock('@lingui/core/macro', () => ({
  t: (strings: TemplateStringsArray | string, ...values: unknown[]) => {
    if (typeof strings === 'string') return strings
    // Handle tagged template literal: t`Phase: ${content.name}`
    return strings.reduce((acc, str, i) => acc + str + (values[i] ?? ''), '')
  },
  msg: (str: any) => str,
}))
vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: any) => <>{children}</>,
}))

// Mock interaction hook
vi.mock('../../hooks/interactions', () => ({
  useBudgetCycleInteraction: () => ({
    exploredPhases: [],
    explorePhase: vi.fn(),
    isPhaseExplored: () => false,
    isComplete: false,
    reset: vi.fn()
  })
}))

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

describe('PhaseCards', () => {
  it('renders correctly', () => {
    render(
      <PhaseCards
        content={phaseContent}
        text={{ title: "Budget Phases" }}
      />
    )

    expect(screen.getByText('Budget Phases')).toBeInTheDocument()
    // Phase names may appear multiple times (desktop/mobile views)
    expect(screen.getAllByText('Planning').length).toBeGreaterThan(0)
  })

  it('selects phase on click', () => {
    render(
      <PhaseCards
        content={phaseContent}
      />
    )

    // Get all buttons with Planning in the name
    const planningButtons = screen.getAllByRole('button', { name: /Planning/i })

    // Initially not pressed
    expect(planningButtons[0]).toHaveAttribute('aria-pressed', 'false')

    // Click the button
    fireEvent.click(planningButtons[0])

    // After click, should be pressed
    expect(planningButtons[0]).toHaveAttribute('aria-pressed', 'true')
  })

  it('displays all six phases', () => {
    render(
      <PhaseCards
        content={phaseContent}
      />
    )

    // Check all phases are rendered
    expect(screen.getAllByText('Planning').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Drafting').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Approval').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Execution').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Reporting').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Audit').length).toBeGreaterThan(0)
  })
})
