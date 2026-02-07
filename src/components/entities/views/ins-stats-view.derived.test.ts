import { describe, expect, it } from 'vitest'

import type { InsObservation } from '@/schemas/ins'
import { computeDerivedIndicators, getObservationSourceUnitForDerived } from './ins-stats-view.derived'

function buildObservation(params: {
  datasetCode: string
  value: string
  unit?: {
    code?: string | null
    symbol?: string | null
    name_ro?: string | null
  } | null
}): InsObservation {
  return {
    dataset_code: params.datasetCode,
    value: params.value,
    value_status: null,
    time_period: {
      iso_period: '2025',
      year: 2025,
      quarter: null,
      month: null,
      periodicity: 'ANNUAL',
    },
    territory: null,
    unit: {
      code: params.unit?.code ?? null,
      symbol: params.unit?.symbol ?? null,
      name_ro: params.unit?.name_ro ?? null,
    },
    classifications: [],
  }
}

describe('ins-stats-view derived helpers', () => {
  it('returns no derived indicators when population is missing', () => {
    const rows = computeDerivedIndicators([
      { datasetCode: 'POP201D', observation: buildObservation({ datasetCode: 'POP201D', value: '10' }) },
    ])

    expect(rows).toEqual([])
  })

  it('computes expected derived indicator set for valid inputs', () => {
    const rows = computeDerivedIndicators([
      {
        datasetCode: 'POP107D',
        observation: buildObservation({ datasetCode: 'POP107D', value: '1000', unit: { code: 'PERS', symbol: 'pers.' } }),
      },
      {
        datasetCode: 'POP201D',
        observation: buildObservation({ datasetCode: 'POP201D', value: '20', unit: { symbol: 'pers.' } }),
      },
      {
        datasetCode: 'POP206D',
        observation: buildObservation({ datasetCode: 'POP206D', value: '15', unit: { symbol: 'pers.' } }),
      },
      {
        datasetCode: 'FOM104D',
        observation: buildObservation({ datasetCode: 'FOM104D', value: '200', unit: { symbol: 'pers.' } }),
      },
      {
        datasetCode: 'LOC101B',
        observation: buildObservation({ datasetCode: 'LOC101B', value: '400', unit: { code: 'NR', symbol: 'nr.' } }),
      },
      {
        datasetCode: 'LOC103B',
        observation: buildObservation({ datasetCode: 'LOC103B', value: '12000', unit: { symbol: 'm²' } }),
      },
    ])

    const ids = rows.map((row) => row.id)
    expect(ids).toContain('birth-rate')
    expect(ids).toContain('death-rate')
    expect(ids).toContain('natural-increase-rate')
    expect(ids).toContain('employees-rate')
    expect(ids).toContain('dwellings-rate')
    expect(ids).toContain('living-area')

    expect(rows.find((row) => row.id === 'birth-rate')?.sourceDatasetCode).toBe('POP201D')
    expect(rows.find((row) => row.id === 'living-area')?.unitLabel).toContain('m²')
  })

  it('prefers non-numeric unit labels when deriving source units', () => {
    const unit = getObservationSourceUnitForDerived(
      buildObservation({
        datasetCode: 'GOS107A',
        value: '100',
        unit: {
          code: '123',
          symbol: null,
          name_ro: 'm³',
        },
      })
    )

    expect(unit).toBe('m³')
  })
})
