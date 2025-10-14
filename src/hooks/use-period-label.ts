import { useMemo } from 'react'
import { getYearLabel } from '@/components/entities/utils'
import type { TMonth, TQuarter } from '@/schemas/reporting'

type GenericReportPeriod = {
  type: 'YEAR' | 'MONTH' | 'QUARTER'
  selection: any
}

/**
 * Returns a human-friendly period label based on a report period selection.
 * Optimized via memoization. Returns an empty string for invalid or missing data.
 */
export function usePeriodLabel(reportPeriod: GenericReportPeriod | undefined): string {
  return useMemo(() => {
    if (!reportPeriod) {
      return ''
    }
    const selection: any = reportPeriod.selection ?? {}
    const raw: string = String(selection?.interval?.start ?? selection?.dates?.[0] ?? '')

    if (reportPeriod.type === 'MONTH') {
      const m = raw.match(/^(\d{4})-(0[1-9]|1[0-2])$/)
      if (m) {
        return getYearLabel(Number(m[1]), m[2] as TMonth)
      }
    } else if (reportPeriod.type === 'QUARTER') {
      const q = raw.match(/^(\d{4})-(Q[1-4])$/)
      if (q) {
        return getYearLabel(Number(q[1]), undefined, q[2] as TQuarter)
      }
    } else if (reportPeriod.type === 'YEAR') {
      const y = Number(raw)
      if (Number.isInteger(y) && y >= 1000 && y <= 9999) {
        return getYearLabel(y)
      }
    }

    return ''
  }, [reportPeriod])
}
