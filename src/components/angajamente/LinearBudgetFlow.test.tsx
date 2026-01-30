import { describe, it, expect } from 'vitest'

import { render, screen } from '@/test/test-utils'
import { LinearBudgetFlow } from './LinearBudgetFlow'

describe('LinearBudgetFlow', () => {
  it('shows a hint when legal commitments exceed the annual budget', () => {
    render(
      <LinearBudgetFlow
        totalBudget={100}
        commitmentAuthority={200}
        committed={150}
        paid={50}
        currency="RON"
      />
    )

    expect(
      screen.getByText('Legal commitments can exceed the annual budget')
    ).toBeInTheDocument()
  })

  it('clamps progress bars at 100% when ratios exceed 100%', () => {
    render(
      <LinearBudgetFlow
        totalBudget={100}
        commitmentAuthority={100}
        committed={150}
        paid={250}
        currency="RON"
      />
    )

    expect(screen.getByTestId('budget-execution-bar')).toHaveStyle({ width: '100%' })
    expect(screen.getByTestId('commitment-utilization-bar')).toHaveStyle({ width: '100%' })
  })

  it('shows N/A for commitment utilization when commitment authority is missing', () => {
    render(
      <LinearBudgetFlow
        totalBudget={100}
        commitmentAuthority={0}
        committed={50}
        paid={10}
        currency="RON"
      />
    )

    expect(screen.getByText('N/A')).toBeInTheDocument()
  })
})

