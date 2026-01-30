import { describe, it, expect } from 'vitest'

import type {
  AngajamenteAggregatedItem,
  AngajamenteFilterInput,
  AngajamenteQuarterlySummary,
} from '@/schemas/angajamente'
import {
  buildPaidAggregatedInputs,
  combineAngajamenteAggregatedNodes,
  extractSummaryValues,
} from './angajamente'

describe('angajamente api helpers', () => {
  describe('extractSummaryValues', () => {
    it('uses credite_angajament (not authority) for committed totals in quarterly/annual summaries', () => {
      const quarterlyNode = {
        __typename: 'AngajamenteQuarterlySummary',
        year: 2024,
        quarter: 1,
        entity_cui: '123',
        entity_name: 'Test Entity',
        main_creditor_cui: null,
        report_type: 'PRINCIPAL_AGGREGATED',
        credite_angajament: 100,
        limita_credit_angajament: 0,
        credite_bugetare: 0,
        credite_angajament_initiale: 0,
        credite_bugetare_initiale: 0,
        credite_angajament_definitive: 999,
        credite_bugetare_definitive: 200,
        credite_angajament_disponibile: 0,
        credite_bugetare_disponibile: 0,
        receptii_totale: 0,
        plati_trezor: 0,
        plati_non_trezor: 0,
        receptii_neplatite: 12,
        total_plati: 0,
        execution_rate: null,
        commitment_rate: null,
      } satisfies AngajamenteQuarterlySummary

      const result = extractSummaryValues([quarterlyNode])

      expect(result.totalBudget).toBe(200)
      expect(result.commitmentAuthority).toBe(999)
      expect(result.committed).toBe(100)
      expect(result.arrears).toBe(12)
    })
  })

  describe('buildPaidAggregatedInputs', () => {
    it('builds both treasury and non-treasury inputs', () => {
      const filter: AngajamenteFilterInput = {
        report_period: { type: 'YEAR', selection: { interval: { start: '2024', end: '2024' } } },
      }

      const { paidTreasury, paidNonTreasury } = buildPaidAggregatedInputs({ filter, limit: 20 })

      expect(paidTreasury).toEqual({ filter, metric: 'PLATI_TREZOR', limit: 20, offset: undefined })
      expect(paidNonTreasury).toEqual({ filter, metric: 'PLATI_NON_TREZOR', limit: 20, offset: undefined })
    })
  })

  describe('combineAngajamenteAggregatedNodes', () => {
    it('sums amounts and counts for matching (functional_code, economic_code) pairs', () => {
      const treasury: AngajamenteAggregatedItem[] = [
        {
          functional_code: '51',
          functional_name: 'Fn 51',
          economic_code: '20',
          economic_name: 'Ec 20',
          amount: 100,
          count: 2,
        },
      ]

      const nonTreasury: AngajamenteAggregatedItem[] = [
        {
          functional_code: '51',
          functional_name: 'Fn 51 (non)',
          economic_code: '20',
          economic_name: 'Ec 20 (non)',
          amount: 50,
          count: 1,
        },
        {
          functional_code: '52',
          functional_name: 'Fn 52',
          economic_code: null,
          economic_name: null,
          amount: 10,
          count: 1,
        },
      ]

      const combined = combineAngajamenteAggregatedNodes(treasury, nonTreasury)

      const mergedNode = combined.find((n) => n.functional_code === '51' && n.economic_code === '20')
      expect(mergedNode).toBeDefined()
      expect(mergedNode?.amount).toBe(150)
      expect(mergedNode?.count).toBe(3)

      const secondNode = combined.find((n) => n.functional_code === '52' && n.economic_code === null)
      expect(secondNode).toBeDefined()
      expect(secondNode?.amount).toBe(10)
      expect(secondNode?.count).toBe(1)
    })
  })
})
