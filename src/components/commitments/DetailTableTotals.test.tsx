import { describe, it, expect } from 'vitest'

import { render, screen } from '@/test/test-utils'
import { DetailTable } from './DetailTable'

describe('DetailTable totals', () => {
  it('renders a totals footer row with sums', () => {
    render(
      <DetailTable
        data={[
          { id: 'A', name: 'Chapter A', budget: 100, committed: 50, paid: 10 },
          { id: 'B', name: 'Chapter B', budget: 200, committed: 80, paid: 20 },
        ]}
        currency="RON"
        grouping="fn"
        detailLevel="chapter"
      />
    )

    expect(screen.getByTestId('detail-table-total-row')).toBeInTheDocument()
    expect(screen.getByTestId('detail-table-total-budget')).toHaveTextContent('300')
    expect(screen.getByTestId('detail-table-total-committed')).toHaveTextContent('130')
    expect(screen.getByTestId('detail-table-total-paid')).toHaveTextContent('30')
    expect(screen.getByTestId('detail-table-total-unpaid')).toHaveTextContent('100')
    expect(screen.getByTestId('detail-table-total-execution-percent')).toHaveTextContent('10%')
  })
})

