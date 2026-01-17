/**
 * LinearBudgetFlow Component
 *
 * SVG visualization showing the flow of budget from allocation
 * through commitments to payments, with gradients and smooth paths.
 * Matches the reference design with separated bars and color gradients.
 */

import { useState, useRef } from 'react'
import { Info, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'

type Props = {
  readonly totalBudget: number
  readonly committed: number
  readonly paid: number
  readonly currency?: 'RON' | 'EUR' | 'USD'
  readonly isLoading?: boolean
}

type TooltipData = {
  x: number
  y: number
  label: string
  value: number
  percentage: number
  color: string
  currency: string
} | null

export function LinearBudgetFlow({
  totalBudget,
  committed,
  paid,
  currency = 'RON',
  isLoading = false,
}: Props) {
  const [tooltip, setTooltip] = useState<TooltipData>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // SVG dimensions
  const width = 1000
  const height = 420

  // Bar positions - well separated for visual clarity
  const barWidth = 14
  const x1 = 100 // Budget bar
  const x2 = 500 // Commitments bar
  const x3 = 900 // Payments bar

  // Vertical positioning
  const topY = 90
  const maxBarHeight = 210

  // Calculate derived values
  const available = Math.max(0, totalBudget - committed)
  const unpaid = Math.max(0, committed - paid)

  // Bar heights based on values (normalized to max height)
  const scale = (val: number) =>
    totalBudget > 0 ? (val / totalBudget) * maxBarHeight : 0

  const hBudget = scale(totalBudget)
  const hCommitted = scale(committed)
  const hPaid = scale(paid)

  // Colors matching reference design
  const cBudget = '#64748b' // Slate 500
  const cCommitted = '#2563eb' // Blue 600
  const cPaid = '#0ea5e9' // Sky 500

  // Flow gradient colors (lighter, more transparent)
  const flowBlue = '#93c5fd' // Blue 300
  const flowSky = '#7dd3fc' // Sky 300
  const flowAmber = '#fcd9a8' // Amber/peach

  // Format percentage
  const formatPercent = (part: number, total: number) => {
    if (total === 0) return '0%'
    return `${((part / total) * 100).toFixed(1)}%`
  }

  // Calculate percentages for each node
  const budgetPercent = 100 // Budget is always 100%
  const committedPercent = totalBudget > 0 ? (committed / totalBudget) * 100 : 0
  const paidPercent = totalBudget > 0 ? (paid / totalBudget) * 100 : 0

  // Handle mouse events for tooltip
  const handleMouseEnter = (
    e: React.MouseEvent<SVGRectElement | SVGPathElement>,
    label: string,
    value: number,
    percentage: number,
    color: string
  ) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return

    setTooltip({
      x: rect.left + rect.width / 2 - containerRect.left,
      y: rect.top - containerRect.top - 10,
      label,
      value,
      percentage,
      color,
      currency,
    })
  }

  const handleMouseLeave = () => {
    setTooltip(null)
  }

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

  // Calculate flow path control points
  const cp1 = x1 + (x2 - x1) * 0.35
  const cp2 = x1 + (x2 - x1) * 0.65
  const cp3 = x2 + (x3 - x2) * 0.35
  const cp4 = x2 + (x3 - x2) * 0.65

  return (
    <div
      ref={containerRef}
      className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-hidden relative"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Trans>Commitment Flow</Trans>
            <Info size={16} className="text-slate-400" />
          </h3>
          <p className="text-sm text-slate-500">
            <Trans>
              Graphical explanation of how the planned budget becomes an actual
              payment.
            </Trans>
          </p>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <div className="min-w-[800px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            <defs>
              {/* Main flow gradient: Budget -> Committed */}
              <linearGradient id="flowGradient1" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={flowBlue} stopOpacity="0.6" />
                <stop offset="100%" stopColor={flowBlue} stopOpacity="0.4" />
              </linearGradient>

              {/* Second flow gradient: Committed -> Paid */}
              <linearGradient id="flowGradient2" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={flowBlue} stopOpacity="0.5" />
                <stop offset="100%" stopColor={flowSky} stopOpacity="0.35" />
              </linearGradient>

              {/* Unpaid area gradient (amber/peach) */}
              <linearGradient id="unpaidGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={flowAmber} stopOpacity="0.6" />
                <stop offset="100%" stopColor={flowAmber} stopOpacity="0.4" />
              </linearGradient>

              {/* Available area gradient */}
              <linearGradient id="availableGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={flowBlue} stopOpacity="0.3" />
                <stop offset="100%" stopColor={flowSky} stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* --- LABELS ABOVE BARS --- */}
            {/* Budget label */}
            <text
              x={x1}
              y={topY - 45}
              fontSize="14"
              fontWeight="600"
              fill="#334155"
              textAnchor="start"
            >
              {t`Total Budget`}
            </text>
            <text
              x={x1}
              y={topY - 28}
              fontSize="12"
              fill="#64748b"
              textAnchor="start"
            >
              {formatCurrency(totalBudget, 'compact', currency)}
            </text>
            <text
              x={x1}
              y={topY - 12}
              fontSize="11"
              fill="#94a3b8"
              textAnchor="start"
            >
              {budgetPercent.toFixed(1)}%
            </text>

            {/* Commitments label */}
            <text
              x={x2}
              y={topY - 45}
              fontSize="14"
              fontWeight="700"
              fill="#2563eb"
              textAnchor="middle"
            >
              {t`Commitments`}
            </text>
            <text
              x={x2}
              y={topY - 28}
              fontSize="12"
              fill="#3b82f6"
              textAnchor="middle"
            >
              {formatCurrency(committed, 'compact', currency)}
            </text>
            <text
              x={x2}
              y={topY - 12}
              fontSize="11"
              fill="#60a5fa"
              textAnchor="middle"
            >
              {committedPercent.toFixed(1)}%
            </text>

            {/* Payments label */}
            <text
              x={x3}
              y={topY - 45}
              fontSize="14"
              fontWeight="700"
              fill="#0ea5e9"
              textAnchor="end"
            >
              {t`Actual Payments`}
            </text>
            <text
              x={x3}
              y={topY - 28}
              fontSize="12"
              fill="#38bdf8"
              textAnchor="end"
            >
              {formatCurrency(paid, 'compact', currency)}
            </text>
            <text
              x={x3}
              y={topY - 12}
              fontSize="11"
              fill="#7dd3fc"
              textAnchor="end"
            >
              {paidPercent.toFixed(1)}%
            </text>

            {/* --- FLOW PATHS --- */}
            {/* Main flow: Budget -> Committed */}
            <path
              d={`
                M ${x1 + barWidth} ${topY}
                C ${cp1} ${topY}, ${cp2} ${topY}, ${x2 - barWidth / 2} ${topY}
                L ${x2 - barWidth / 2} ${topY + hCommitted}
                C ${cp2} ${topY + hCommitted}, ${cp1} ${topY + hBudget}, ${x1 + barWidth} ${topY + hBudget}
                Z
              `}
              fill="url(#flowGradient1)"
              className="cursor-pointer transition-opacity hover:opacity-70"
              onMouseEnter={(e) =>
                handleMouseEnter(
                  e,
                  t`Budget → Commitments`,
                  committed,
                  committedPercent,
                  cCommitted
                )
              }
              onMouseLeave={handleMouseLeave}
            />

            {/* Available area (uncommitted budget) - horizontal flow from budget gap */}
            {available > 0 && (() => {
              // Calculate the height of the available section (gap between committed and budget)
              const hAvailable = hBudget - hCommitted
              const availableTop = topY + hCommitted
              const availableBottom = topY + hBudget
              // End position - flows horizontally to the right, maintaining height
              const endX = (x1 + x2) / 2 + 100
              const endTop = availableBottom + 20
              const endBottom = availableBottom + 20 + Math.max(hAvailable * 0.8, 25)

              return (
                <>
                  <path
                    d={`
                      M ${x1 + barWidth} ${availableTop + 2}
                      C ${x1 + 150} ${availableTop + 20}, ${x1 + 200} ${endTop}, ${endX} ${endTop}
                      L ${endX} ${endBottom}
                      C ${x1 + 200} ${endBottom}, ${x1 + 150} ${availableBottom}, ${x1 + barWidth} ${availableBottom}
                      Z
                    `}
                    fill="url(#availableGradient)"
                    className="cursor-pointer transition-opacity hover:opacity-70"
                    onMouseEnter={(e) =>
                      handleMouseEnter(
                        e,
                        t`Available`,
                        available,
                        totalBudget > 0 ? (available / totalBudget) * 100 : 0,
                        '#0ea5e9'
                      )
                    }
                    onMouseLeave={handleMouseLeave}
                  />
                  {/* Available label */}
                  <text
                    x={endX - 60}
                    y={endBottom + 20}
                    fontSize="12"
                    fontWeight="600"
                    fill="#0ea5e9"
                  >
                    {t`Available`}
                  </text>
                  <text
                    x={endX - 60}
                    y={endBottom + 35}
                    fontSize="11"
                    fill="#0ea5e9"
                  >
                    {formatCurrency(available, 'compact', currency)}
                  </text>
                  <text
                    x={endX - 60}
                    y={endBottom + 50}
                    fontSize="11"
                    fill="#0ea5e9"
                  >
                    {formatPercent(available, totalBudget)}
                  </text>
                </>
              )
            })()}

            {/* Second flow: Committed -> Paid */}
            <path
              d={`
                M ${x2 + barWidth / 2} ${topY}
                C ${cp3} ${topY}, ${cp4} ${topY}, ${x3 - barWidth} ${topY}
                L ${x3 - barWidth} ${topY + hPaid}
                C ${cp4} ${topY + hPaid}, ${cp3} ${topY + hCommitted}, ${x2 + barWidth / 2} ${topY + hCommitted}
                Z
              `}
              fill="url(#flowGradient2)"
              className="cursor-pointer transition-opacity hover:opacity-70"
              onMouseEnter={(e) =>
                handleMouseEnter(
                  e,
                  t`Commitments → Payments`,
                  paid,
                  committed > 0 ? (paid / committed) * 100 : 0,
                  cPaid
                )
              }
              onMouseLeave={handleMouseLeave}
            />

            {/* Unpaid area (committed but not paid) - amber/peach color */}
            {unpaid > 0 && (() => {
              // Calculate the height of the unpaid section (gap between paid and committed)
              const hUnpaid = hCommitted - hPaid
              const unpaidTop = topY + hPaid
              const unpaidBottom = topY + hCommitted
              // End position - flows to the right towards payments bar
              const endX = x3 + 50
              const endTop = unpaidBottom + 20
              const endBottom = unpaidBottom + 20 + Math.max(hUnpaid * 0.8, 25)

              return (
                <>
                  <path
                    d={`
                      M ${x2 + barWidth / 2} ${unpaidTop + 2}
                      C ${x2 + 150} ${unpaidTop + 30}, ${x3 - 100} ${endTop}, ${endX} ${endTop}
                      L ${endX} ${endBottom}
                      C ${x3 - 100} ${endBottom}, ${x2 + 150} ${unpaidBottom}, ${x2 + barWidth / 2} ${unpaidBottom}
                      Z
                    `}
                    fill="url(#unpaidGradient)"
                    className="cursor-pointer transition-opacity hover:opacity-70"
                    onMouseEnter={(e) =>
                      handleMouseEnter(
                        e,
                        t`To Pay`,
                        unpaid,
                        committed > 0 ? (unpaid / committed) * 100 : 0,
                        '#f59e0b'
                      )
                    }
                    onMouseLeave={handleMouseLeave}
                  />
                  {/* To Pay label */}
                  <text
                    x={endX - 100}
                    y={endBottom + 20}
                    fontSize="12"
                    fontWeight="600"
                    fill="#f59e0b"
                  >
                    {t`To Pay`}
                  </text>
                  <text
                    x={endX - 100}
                    y={endBottom + 35}
                    fontSize="11"
                    fill="#f59e0b"
                  >
                    {formatCurrency(unpaid, 'compact', currency)}
                  </text>
                  <text
                    x={endX - 100}
                    y={endBottom + 50}
                    fontSize="11"
                    fill="#f59e0b"
                  >
                    {formatPercent(unpaid, committed)}
                  </text>
                </>
              )
            })()}

            {/* --- VERTICAL BARS (square corners) --- */}
            {/* Budget bar */}
            <rect
              x={x1}
              y={topY}
              width={barWidth}
              height={hBudget || 4}
              fill={cBudget}
              className="cursor-pointer transition-opacity hover:opacity-80"
              onMouseEnter={(e) =>
                handleMouseEnter(
                  e,
                  t`Total Budget`,
                  totalBudget,
                  budgetPercent,
                  cBudget
                )
              }
              onMouseLeave={handleMouseLeave}
            />

            {/* Commitments bar */}
            <rect
              x={x2 - barWidth / 2}
              y={topY}
              width={barWidth}
              height={hCommitted || 4}
              fill={cCommitted}
              className="cursor-pointer transition-opacity hover:opacity-80"
              onMouseEnter={(e) =>
                handleMouseEnter(
                  e,
                  t`Commitments`,
                  committed,
                  committedPercent,
                  cCommitted
                )
              }
              onMouseLeave={handleMouseLeave}
            />

            {/* Payments bar */}
            <rect
              x={x3 - barWidth}
              y={topY}
              width={barWidth}
              height={hPaid || 4}
              fill={cPaid}
              className="cursor-pointer transition-opacity hover:opacity-80"
              onMouseEnter={(e) =>
                handleMouseEnter(
                  e,
                  t`Actual Payments`,
                  paid,
                  paidPercent,
                  cPaid
                )
              }
              onMouseLeave={handleMouseLeave}
            />
          </svg>
        </div>
      </div>

      {/* Tooltip - treemap style */}
      {tooltip && (
        <div
          className="absolute z-50 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 text-sm shadow-xl border border-slate-200 pointer-events-none min-w-[180px]"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {/* Header with color dot */}
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: tooltip.color }}
            />
            <span className="font-semibold text-slate-800">{tooltip.label}</span>
          </div>

          {/* Amount row */}
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-slate-500 text-xs">
              <Trans>Amount:</Trans>
            </span>
            <div className="text-right">
              <span className="font-bold text-slate-800">
                {formatCurrency(tooltip.value, 'compact', tooltip.currency as 'RON' | 'EUR' | 'USD')}
              </span>
              <div className="text-[10px] text-slate-400 font-mono">
                {formatCurrency(tooltip.value, 'standard', tooltip.currency as 'RON' | 'EUR' | 'USD')}
              </div>
            </div>
          </div>

          {/* Share row */}
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-xs">
              <Trans>Share:</Trans>
            </span>
            <span className="font-bold text-slate-800 font-mono">
              {tooltip.percentage.toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      {/* Step cards footer */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <p className="text-xs text-slate-500 uppercase font-semibold">
            <Trans>Step 1</Trans>
          </p>
          <p className="text-sm font-medium text-slate-700">
            <Trans>Budget Planning</Trans>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            <Trans>Estimated money to be spent</Trans>
          </p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center justify-center gap-2">
            <ArrowRight size={12} className="text-blue-400" />
            <p className="text-xs text-blue-500 uppercase font-semibold">
              <Trans>Step 2</Trans>
            </p>
          </div>
          <p className="text-sm font-bold text-blue-800">
            <Trans>Legal Commitment</Trans>
          </p>
          <p className="text-xs text-blue-600 mt-1">
            <Trans>Signing contracts (Reservation)</Trans>
          </p>
        </div>
        <div className="p-3 bg-sky-50 rounded-lg border border-sky-100">
          <div className="flex items-center justify-center gap-2">
            <ArrowRight size={12} className="text-sky-400" />
            <p className="text-xs text-sky-500 uppercase font-semibold">
              <Trans>Step 3</Trans>
            </p>
          </div>
          <p className="text-sm font-bold text-sky-800">
            <Trans>Payment and Execution</Trans>
          </p>
          <p className="text-xs text-sky-600 mt-1">
            <Trans>Transfer of money to supplier</Trans>
          </p>
        </div>
      </div>
    </div>
  )
}
