/**
 * DetailTable Component for Angajamente Bugetare
 *
 * Color-coded table showing budget chapters with commitments,
 * payments, and unpaid amounts
 */

import { AlertCircle, Download } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Trans } from '@lingui/react/macro'
import type { CategoryData } from './CategoryChart'

type Props = {
  readonly data: CategoryData[]
  readonly currency?: 'RON' | 'EUR' | 'USD'
  readonly isLoading?: boolean
  readonly onDownload?: () => void
}

export function DetailTable({
  data,
  currency = 'RON',
  isLoading = false,
  onDownload,
}: Props) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="p-4 space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">
            <Trans>Table Detail</Trans>
          </h3>
        </div>
        <div className="p-8 text-center text-slate-400">
          <Trans>No data available</Trans>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">
          <Trans>Table Detail</Trans>
        </h3>
        {onDownload && (
          <button
            onClick={onDownload}
            className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:text-blue-700 transition-colors"
          >
            <Trans>Download Excel</Trans>
            <Download size={14} />
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-semibold border-b border-slate-200">
                <Trans>Budget Chapter</Trans>
              </th>
              <th className="p-4 font-semibold border-b border-slate-200 text-right">
                <Trans>Budget Credits</Trans>
              </th>
              <th className="p-4 font-semibold border-b border-slate-200 text-right text-blue-700">
                <Trans>Commitments</Trans>
              </th>
              <th className="p-4 font-semibold border-b border-slate-200 text-right">
                <Trans>% Committed</Trans>
              </th>
              <th className="p-4 font-semibold border-b border-slate-200 text-right text-emerald-700">
                <Trans>Payments Made</Trans>
              </th>
              <th className="p-4 font-semibold border-b border-slate-200 text-right text-amber-600">
                <Trans>To Pay</Trans>
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {data.map((item, idx) => {
              const unpaid = item.committed - item.paid
              const percentCommitted =
                item.budget > 0
                  ? Math.round((item.committed / item.budget) * 100)
                  : 0

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50 transition-colors ${
                    idx !== data.length - 1 ? 'border-b border-slate-100' : ''
                  }`}
                >
                  <td className="p-4 font-medium text-slate-800">{item.name}</td>
                  <td className="p-4 text-right text-slate-600">
                    {formatCurrency(item.budget, 'compact', currency)}
                  </td>
                  <td className="p-4 text-right font-semibold text-blue-600">
                    {formatCurrency(item.committed, 'compact', currency)}
                  </td>
                  <td className="p-4 text-right">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        percentCommitted > 90
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {percentCommitted}%
                    </span>
                  </td>
                  <td className="p-4 text-right font-semibold text-emerald-600">
                    {formatCurrency(item.paid, 'compact', currency)}
                  </td>
                  <td className="p-4 text-right font-medium text-amber-600">
                    <div className="flex items-center justify-end gap-1">
                      {unpaid > 0 && (
                        <AlertCircle size={12} className="text-amber-400" />
                      )}
                      {formatCurrency(unpaid, 'compact', currency)}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
