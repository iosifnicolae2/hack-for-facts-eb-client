/**
 * LinearBudgetFlow Component
 *
 * Sankey-style SVG visualization showing the flow of budget from allocation
 * through commitments to payments, with proportional edges and smooth paths.
 */

import { useState, useRef } from 'react'
import { Info, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

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
  const height = 460

  // Node (bar) positions
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

  // Proportional bar heights (everything relative to totalBudget)
  const scale = (val: number) =>
    totalBudget > 0 ? (val / totalBudget) * maxBarHeight : 0

  const hBudget = maxBarHeight // Budget is always 100% = full height
  const hCommitted = scale(committed)
  const hPaid = scale(paid)
  const hAvailable = hBudget - hCommitted
  const hUnpaid = hCommitted - hPaid

  // Colors
  const cBudget = '#64748b'
  const cCommitted = '#2563eb'
  const cPaid = '#0ea5e9'

  const flowBlue = '#93c5fd'
  const flowSky = '#7dd3fc'
  const flowAmber = '#fcd9a8'

  // Format helpers
  const formatPercent = (part: number, total: number) => {
    if (total === 0) return '0%'
    return `${((part / total) * 100).toFixed(1)}%`
  }

  const committedPercent = totalBudget > 0 ? (committed / totalBudget) * 100 : 0
  const paidPercent = totalBudget > 0 ? (paid / totalBudget) * 100 : 0

  // Tooltip handler
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

  const handleMouseLeave = () => setTooltip(null)

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

  // ─── Sankey edge geometry ───
  // Each main flow connects the top of one bar to the top of the next,
  // and the portion that continues narrows proportionally.
  // The residual splits off as a curved arm whose thickness equals the gap.

  // Main flow: Budget → Committed (carries the committed portion)
  // Top edge: topY on both sides (aligned)
  // Bottom edge: topY + hCommitted on both sides (proportional)
  const flow1Left = x1 + barWidth
  const flow1Right = x2 - barWidth / 2
  const flow1Cp1 = flow1Left + (flow1Right - flow1Left) * 0.4
  const flow1Cp2 = flow1Left + (flow1Right - flow1Left) * 0.6

  // Main flow: Committed → Paid (carries the paid portion)
  const flow2Left = x2 + barWidth / 2
  const flow2Right = x3 - barWidth
  const flow2Cp1 = flow2Left + (flow2Right - flow2Left) * 0.4
  const flow2Cp2 = flow2Left + (flow2Right - flow2Left) * 0.6

  // Available arm: splits from bottom of budget bar, curving down-right
  // End x aligns with the Commitments bar (right border of this flow section)
  const availEndX = x2
  const availEndTopY = topY + hBudget + 40
  const availEndThickness = Math.max(hAvailable * 0.6, 8)

  // Unpaid arm: splits from bottom of committed bar, curving down-right
  // End x aligns with the Payments bar (right border of this flow section)
  const unpaidEndX = x3
  const unpaidEndTopY = topY + hCommitted + 40
  const unpaidEndThickness = Math.max(hUnpaid * 0.6, 8)

  return (
    <div
      ref={containerRef}
      className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-hidden relative"
    >
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-lg font-bold text-slate-800">
          <Trans>Commitment Flow</Trans>
        </h3>
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className="text-slate-400 hover:text-slate-600 transition-colors">
              <Info size={16} />
            </button>
          </PopoverTrigger>
          <PopoverContent side="right" className="max-w-xs text-xs leading-relaxed text-slate-600">
            <Trans>
              This diagram shows how public money flows from budget allocation
              to legal commitments (signed contracts) to actual payments.
              The width of each flow represents the proportion of funds at each stage.
            </Trans>
          </PopoverContent>
        </Popover>
      </div>

      <div className="relative w-full overflow-x-auto">
        <div className="min-w-[800px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            <defs>
              <linearGradient id="flowGradient1" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={flowBlue} stopOpacity="0.6" />
                <stop offset="100%" stopColor={flowBlue} stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="flowGradient2" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={flowBlue} stopOpacity="0.5" />
                <stop offset="100%" stopColor={flowSky} stopOpacity="0.35" />
              </linearGradient>
              <linearGradient id="unpaidGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={flowAmber} stopOpacity="0.6" />
                <stop offset="100%" stopColor={flowAmber} stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="availableGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={flowBlue} stopOpacity="0.3" />
                <stop offset="100%" stopColor={flowSky} stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* ─── LABELS ABOVE BARS ─── */}
            {/* Budget */}
            <text x={x1} y={topY - 45} fontSize="14" fontWeight="600" fill="#334155" textAnchor="start">
              {t`Total Budget`}
            </text>
            <text x={x1} y={topY - 28} fontSize="12" fill="#64748b" textAnchor="start">
              {formatCurrency(totalBudget, 'compact', currency)}
            </text>
            <text x={x1} y={topY - 12} fontSize="11" fill="#94a3b8" textAnchor="start">
              100.0%
            </text>

            {/* Commitments */}
            <text x={x2} y={topY - 45} fontSize="14" fontWeight="700" fill="#2563eb" textAnchor="middle">
              {t`Commitments`}
            </text>
            <text x={x2} y={topY - 28} fontSize="12" fill="#3b82f6" textAnchor="middle">
              {formatCurrency(committed, 'compact', currency)}
            </text>
            <text x={x2} y={topY - 12} fontSize="11" fill="#60a5fa" textAnchor="middle">
              {committedPercent.toFixed(1)}%
            </text>

            {/* Payments */}
            <text x={x3} y={topY - 45} fontSize="14" fontWeight="700" fill="#0ea5e9" textAnchor="end">
              {t`Actual Payments`}
            </text>
            <text x={x3} y={topY - 28} fontSize="12" fill="#38bdf8" textAnchor="end">
              {formatCurrency(paid, 'compact', currency)}
            </text>
            <text x={x3} y={topY - 12} fontSize="11" fill="#7dd3fc" textAnchor="end">
              {paidPercent.toFixed(1)}%
            </text>

            {/* ─── MAIN FLOW: Budget → Committed ─── */}
            {/* The top edges are aligned; the bottom edge narrows from hBudget to hCommitted */}
            <path
              d={`
                M ${flow1Left} ${topY}
                C ${flow1Cp1} ${topY}, ${flow1Cp2} ${topY}, ${flow1Right} ${topY}
                L ${flow1Right} ${topY + hCommitted}
                C ${flow1Cp2} ${topY + hCommitted}, ${flow1Cp1} ${topY + hCommitted}, ${flow1Left} ${topY + hCommitted}
                Z
              `}
              fill="url(#flowGradient1)"
              className="cursor-pointer transition-opacity hover:opacity-70"
              onMouseEnter={(e) =>
                handleMouseEnter(e, t`Budget → Commitments`, committed, committedPercent, cCommitted)
              }
              onMouseLeave={handleMouseLeave}
            />

            {/* ─── AVAILABLE ARM (uncommitted budget) ─── */}
            {/* Splits off proportionally from bottom of budget bar, curving down */}
            {available > 0 && hAvailable > 1 && (
              <>
                <path
                  d={`
                    M ${flow1Left} ${topY + hCommitted}
                    C ${flow1Left + 80} ${topY + hCommitted + 10},
                      ${availEndX - 80} ${availEndTopY},
                      ${availEndX} ${availEndTopY}
                    L ${availEndX} ${availEndTopY + availEndThickness}
                    C ${availEndX - 80} ${availEndTopY + availEndThickness},
                      ${flow1Left + 80} ${topY + hBudget - 10},
                      ${flow1Left} ${topY + hBudget}
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
                <text x={availEndX} y={availEndTopY + availEndThickness + 20} fontSize="12" fontWeight="600" fill="#0ea5e9" textAnchor="middle">
                  {t`Available`}
                </text>
                <text x={availEndX} y={availEndTopY + availEndThickness + 35} fontSize="11" fill="#0ea5e9" textAnchor="middle">
                  {formatCurrency(available, 'compact', currency)}
                </text>
                <text x={availEndX} y={availEndTopY + availEndThickness + 50} fontSize="11" fill="#0ea5e9" textAnchor="middle">
                  {formatPercent(available, totalBudget)}
                </text>
              </>
            )}

            {/* ─── MAIN FLOW: Committed → Paid ─── */}
            {/* Top edges aligned; bottom narrows from hCommitted to hPaid */}
            <path
              d={`
                M ${flow2Left} ${topY}
                C ${flow2Cp1} ${topY}, ${flow2Cp2} ${topY}, ${flow2Right} ${topY}
                L ${flow2Right} ${topY + hPaid}
                C ${flow2Cp2} ${topY + hPaid}, ${flow2Cp1} ${topY + hPaid}, ${flow2Left} ${topY + hPaid}
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

            {/* ─── UNPAID ARM (committed but not paid) ─── */}
            {/* Splits off proportionally from bottom of committed portion, curving down */}
            {unpaid > 0 && hUnpaid > 1 && (
              <>
                <path
                  d={`
                    M ${flow2Left} ${topY + hPaid}
                    C ${flow2Left + 80} ${topY + hPaid + 10},
                      ${unpaidEndX - 80} ${unpaidEndTopY},
                      ${unpaidEndX} ${unpaidEndTopY}
                    L ${unpaidEndX} ${unpaidEndTopY + unpaidEndThickness}
                    C ${unpaidEndX - 80} ${unpaidEndTopY + unpaidEndThickness},
                      ${flow2Left + 80} ${topY + hCommitted - 10},
                      ${flow2Left} ${topY + hCommitted}
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
                <text x={unpaidEndX} y={unpaidEndTopY + unpaidEndThickness + 20} fontSize="12" fontWeight="600" fill="#f59e0b" textAnchor="end">
                  {t`To Pay`}
                </text>
                <text x={unpaidEndX} y={unpaidEndTopY + unpaidEndThickness + 35} fontSize="11" fill="#f59e0b" textAnchor="end">
                  {formatCurrency(unpaid, 'compact', currency)}
                </text>
                <text x={unpaidEndX} y={unpaidEndTopY + unpaidEndThickness + 50} fontSize="11" fill="#f59e0b" textAnchor="end">
                  {formatPercent(unpaid, committed)}
                </text>
              </>
            )}

            {/* ─── VERTICAL BARS (Sankey nodes) ─── */}
            {/* Budget bar — full height (100%) */}
            <rect
              x={x1} y={topY} width={barWidth} height={hBudget || 4}
              fill={cBudget}
              className="cursor-pointer transition-opacity hover:opacity-80"
              onMouseEnter={(e) => handleMouseEnter(e, t`Total Budget`, totalBudget, 100, cBudget)}
              onMouseLeave={handleMouseLeave}
            />

            {/* Commitments bar — proportional height */}
            <rect
              x={x2 - barWidth / 2} y={topY} width={barWidth} height={hCommitted || 4}
              fill={cCommitted}
              className="cursor-pointer transition-opacity hover:opacity-80"
              onMouseEnter={(e) => handleMouseEnter(e, t`Commitments`, committed, committedPercent, cCommitted)}
              onMouseLeave={handleMouseLeave}
            />

            {/* Payments bar — proportional height */}
            <rect
              x={x3 - barWidth} y={topY} width={barWidth} height={hPaid || 4}
              fill={cPaid}
              className="cursor-pointer transition-opacity hover:opacity-80"
              onMouseEnter={(e) => handleMouseEnter(e, t`Actual Payments`, paid, paidPercent, cPaid)}
              onMouseLeave={handleMouseLeave}
            />
          </svg>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-50 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 text-sm shadow-xl border border-slate-200 pointer-events-none min-w-[180px]"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tooltip.color }} />
            <span className="font-semibold text-slate-800">{tooltip.label}</span>
          </div>
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-slate-500 text-xs"><Trans>Amount:</Trans></span>
            <div className="text-right">
              <span className="font-bold text-slate-800">
                {formatCurrency(tooltip.value, 'compact', tooltip.currency as 'RON' | 'EUR' | 'USD')}
              </span>
              <div className="text-[10px] text-slate-400 font-mono">
                {formatCurrency(tooltip.value, 'standard', tooltip.currency as 'RON' | 'EUR' | 'USD')}
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-xs"><Trans>Share:</Trans></span>
            <span className="font-bold text-slate-800 font-mono">
              {tooltip.percentage.toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      {/* Step cards footer */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <p className="text-xs text-slate-500 uppercase font-semibold"><Trans>Step 1</Trans></p>
          <p className="text-sm font-medium text-slate-700"><Trans>Budget Planning</Trans></p>
          <p className="text-xs text-slate-400 mt-1"><Trans>Estimated money to be spent</Trans></p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center justify-center gap-2">
            <ArrowRight size={12} className="text-blue-400" />
            <p className="text-xs text-blue-500 uppercase font-semibold"><Trans>Step 2</Trans></p>
          </div>
          <p className="text-sm font-bold text-blue-800"><Trans>Legal Commitment</Trans></p>
          <p className="text-xs text-blue-600 mt-1"><Trans>Signing contracts (Reservation)</Trans></p>
        </div>
        <div className="p-3 bg-sky-50 rounded-lg border border-sky-100">
          <div className="flex items-center justify-center gap-2">
            <ArrowRight size={12} className="text-sky-400" />
            <p className="text-xs text-sky-500 uppercase font-semibold"><Trans>Step 3</Trans></p>
          </div>
          <p className="text-sm font-bold text-sky-800"><Trans>Payment and Execution</Trans></p>
          <p className="text-xs text-sky-600 mt-1"><Trans>Transfer of money to supplier</Trans></p>
        </div>
      </div>
    </div>
  )
}
