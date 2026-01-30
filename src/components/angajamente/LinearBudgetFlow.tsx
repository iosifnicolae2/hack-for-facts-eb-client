/**
 * LinearBudgetFlow Component
 *
 * Explains the relationship between annual budget credits, multi-year legal commitments,
 * and payments, without assuming commitments are capped by the annual budget.
 */

import { Info } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type Props = {
  readonly totalBudget: number
  readonly commitmentAuthority: number
  readonly committed: number
  readonly paid: number
  readonly currency?: 'RON' | 'EUR' | 'USD'
  readonly isLoading?: boolean
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(100, value))
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '0.0%'
  return `${value.toFixed(1)}%`
}

export function LinearBudgetFlow({
  totalBudget,
  commitmentAuthority,
  committed,
  paid,
  currency = 'RON',
  isLoading = false,
}: Props) {
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="mb-6">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-[320px] w-full" />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    )
  }

  const budgetExecutionPercent = totalBudget > 0 ? (paid / totalBudget) * 100 : 0
  const commitmentUtilizationPercent =
    commitmentAuthority > 0 ? (committed / commitmentAuthority) * 100 : 0
  const showBudgetVsCommitmentHint = totalBudget > 0 && committed > totalBudget

  const budgetPaidClamped = clampPercent(budgetExecutionPercent)
  const commitmentUsedClamped = clampPercent(commitmentUtilizationPercent)

  const unspentBudget = Math.max(0, totalBudget - paid)
  const remainingCommitmentAuthority = Math.max(0, commitmentAuthority - committed)
  const overCommitmentAuthority = Math.max(0, committed - commitmentAuthority)

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-bold text-slate-800">
          <Trans>Budget & Commitments</Trans>
        </h3>
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className="text-slate-400 hover:text-slate-600 transition-colors">
              <Info size={16} />
            </button>
          </PopoverTrigger>
          <PopoverContent side="right" className="max-w-xs text-xs leading-relaxed text-slate-600">
            <Trans>
              Budget credits are annual (cash you can pay within the selected year). Legal commitments
              represent the total value of contracts signed (often multi-year), so they can exceed the
              annual budget without implying overspending. To assess contracting, compare commitments to
              commitment authority.
            </Trans>
          </PopoverContent>
        </Popover>
      </div>

      {showBudgetVsCommitmentHint && (
        <Alert className="mb-6 bg-slate-50 border-slate-200 text-slate-700">
          <AlertTitle>
            <Trans>Legal commitments can exceed the annual budget</Trans>
          </AlertTitle>
          <AlertDescription>
            <Trans>
              Legal commitments are often multi-year contract values, while the annual budget reflects what can be paid
              within the selected year. This is common for multi-year projects.
            </Trans>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 p-5 bg-white">
          <div className="flex items-baseline justify-between gap-3">
            <h4 className="text-sm font-semibold text-slate-800">
              <Trans>Annual budget execution</Trans>
            </h4>
            <span className="text-xs text-slate-500 font-mono">
              {formatPercent(budgetExecutionPercent)}
            </span>
          </div>

          <div className="mt-3 h-2 rounded-full bg-emerald-100 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all"
              data-testid="budget-execution-bar"
              style={{ width: `${budgetPaidClamped}%` }}
            />
          </div>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">{t`Budget credits`}</dt>
              <dd className="font-mono text-slate-800">
                {formatCurrency(totalBudget, 'compact', currency)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">{t`Payments`}</dt>
              <dd className="font-mono text-slate-800">
                {formatCurrency(paid, 'compact', currency)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">{t`Unspent budget`}</dt>
              <dd className="font-mono text-slate-800">
                {formatCurrency(unspentBudget, 'compact', currency)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-slate-200 p-5 bg-white">
          <div className="flex items-baseline justify-between gap-3">
            <h4 className="text-sm font-semibold text-slate-800">
              <Trans>Commitment authority usage</Trans>
            </h4>
            <span className="text-xs text-slate-500 font-mono">
              {commitmentAuthority > 0 ? formatPercent(commitmentUtilizationPercent) : t`N/A`}
            </span>
          </div>

          <div className="mt-3 h-2 rounded-full bg-blue-100 overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              data-testid="commitment-utilization-bar"
              style={{ width: `${commitmentUsedClamped}%` }}
            />
          </div>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">{t`Commitment authority`}</dt>
              <dd className="font-mono text-slate-800">
                {formatCurrency(commitmentAuthority, 'compact', currency)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">{t`Legal commitments`}</dt>
              <dd className="font-mono text-slate-800">
                {formatCurrency(committed, 'compact', currency)}
              </dd>
            </div>
            {overCommitmentAuthority > 0 ? (
              <div className="flex justify-between gap-4">
                <dt className="text-rose-600 font-medium">{t`Over authority`}</dt>
                <dd className="font-mono text-rose-700">
                  {formatCurrency(overCommitmentAuthority, 'compact', currency)}
                </dd>
              </div>
            ) : (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">{t`Remaining authority`}</dt>
                <dd className="font-mono text-slate-800">
                  {formatCurrency(remainingCommitmentAuthority, 'compact', currency)}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  )
}
