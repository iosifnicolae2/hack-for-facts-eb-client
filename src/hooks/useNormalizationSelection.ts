import { useCallback, useMemo, useRef } from 'react'
import { Normalization } from '@/schemas/charts'
import { useUserCurrency } from '@/lib/hooks/useUserCurrency'

type Currency = 'RON' | 'EUR' | 'USD'
export type DisplayNormalization = 'total' | 'per_capita'

export function useNormalizationSelection(current?: Normalization) {
  const [currency] = useUserCurrency()
  const initialCurrency = useRef<Currency>(currency)

  const defaultNormalization: Normalization = useMemo(
    () => (initialCurrency.current === 'EUR' ? 'total_euro' : 'total'),
    []
  )

  const toDisplayNormalization = useCallback((n?: Normalization): DisplayNormalization => (
    n && String(n).includes('per_capita') ? 'per_capita' : 'total'
  ), [])

  const toEffectiveNormalization = useCallback((d: DisplayNormalization): Normalization => {
    return initialCurrency.current === 'EUR'
      ? (d === 'total' ? 'total_euro' : 'per_capita_euro')
      : (d === 'total' ? 'total' : 'per_capita')
  }, [])

  const effectiveNormalization = current ?? defaultNormalization

  return {
    initialCurrency: initialCurrency.current,
    defaultNormalization,
    effectiveNormalization,
    toDisplayNormalization,
    toEffectiveNormalization,
  }
}
