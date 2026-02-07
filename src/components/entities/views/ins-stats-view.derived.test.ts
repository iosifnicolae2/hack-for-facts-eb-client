import { describe, expect, it } from 'vitest'

import type { InsObservation } from '@/schemas/ins'
import {
  buildDerivedIndicatorRuntimeContext,
  computeDerivedIndicators,
  DERIVED_INDICATOR_EXPLANATIONS,
  getObservationSourceUnitForDerived,
} from './ins-stats-view.derived'

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

  it('provides explanations for all derived indicators rendered by computeDerivedIndicators', () => {
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
      {
        datasetCode: 'POP309E',
        observation: buildObservation({ datasetCode: 'POP309E', value: '12', unit: { symbol: 'pers.' } }),
      },
      {
        datasetCode: 'POP310E',
        observation: buildObservation({ datasetCode: 'POP310E', value: '30', unit: { symbol: 'pers.' } }),
      },
      {
        datasetCode: 'GOS107A',
        observation: buildObservation({ datasetCode: 'GOS107A', value: '8000', unit: { symbol: 'm³' } }),
      },
      {
        datasetCode: 'GOS118A',
        observation: buildObservation({ datasetCode: 'GOS118A', value: '9000', unit: { symbol: 'm³' } }),
      },
      {
        datasetCode: 'GOS110A',
        observation: buildObservation({ datasetCode: 'GOS110A', value: '45', unit: { symbol: 'km' } }),
      },
      {
        datasetCode: 'GOS116A',
        observation: buildObservation({ datasetCode: 'GOS116A', value: '27', unit: { symbol: 'km' } }),
      },
    ])

    for (const row of rows) {
      const explanation = DERIVED_INDICATOR_EXPLANATIONS[row.id]
      expect(explanation.whyItMatters.length).toBeGreaterThan(0)
      expect(explanation.formula.length).toBeGreaterThan(0)
      expect(explanation.inputs.length).toBeGreaterThan(0)
      expect(explanation.notes.length).toBeGreaterThan(0)
    }
  })

  it('builds runtime context for selected, mixed, and fallback states', () => {
    const selectedContext = buildDerivedIndicatorRuntimeContext({
      selectedPeriodLabel: '2025',
      dataPeriodLabel: '2025',
      sourceDatasetCode: ' pop201d ',
      hasFallback: false,
    })

    expect(selectedContext).toEqual({
      selectedPeriodLabel: '2025',
      dataPeriodLabel: '2025',
      sourceDatasetCode: 'POP201D',
      hasFallback: false,
    })

    const fallbackContext = buildDerivedIndicatorRuntimeContext({
      selectedPeriodLabel: '2025',
      dataPeriodLabel: 'Mixed',
      sourceDatasetCode: null,
      hasFallback: true,
    })

    expect(fallbackContext).toEqual({
      selectedPeriodLabel: '2025',
      dataPeriodLabel: 'Mixed',
      sourceDatasetCode: null,
      hasFallback: true,
    })
  })
})
