/**
 * StatCard Component for Angajamente Bugetare
 *
 * Displays a KPI card with icon, value, and subtitle
 * Three variants: budget (emerald), committed (blue), paid (sky)
 */

import { ArrowUpRight, ArrowDownRight, Scale } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

type StatCardVariant = 'budget' | 'committed' | 'paid'
type IconType = 'up' | 'down' | 'scale'

type Props = {
  readonly title: string
  readonly value: number
  readonly subtitle?: string
  readonly variant: StatCardVariant
  readonly icon: IconType
  readonly currency?: 'RON' | 'EUR' | 'USD'
  readonly isLoading?: boolean
}

const variantStyles: Record<StatCardVariant, { text: string; bg: string; border: string }> = {
  budget: {
    text: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
  committed: {
    text: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  paid: {
    text: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-100',
  },
}

const IconComponent: Record<IconType, typeof ArrowUpRight> = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  scale: Scale,
}

export function StatCard({
  title,
  value,
  subtitle,
  variant,
  icon,
  currency = 'RON',
  isLoading = false,
}: Props) {
  const styles = variantStyles[variant]
  const Icon = IconComponent[icon]

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-start mb-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
        <Skeleton className="h-9 w-40 mb-1" />
        <Skeleton className="h-4 w-48" />
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
          {title}
        </p>
        <div className={cn('p-2 rounded-lg', styles.bg, styles.border, 'border')}>
          <Icon size={20} className={styles.text} />
        </div>
      </div>
      <div>
        <h2 className="text-3xl font-bold text-slate-800 mb-1">
          {formatCurrency(value, 'compact', currency)}
        </h2>
        {subtitle && (
          <p className="text-sm text-slate-400 font-mono">{subtitle}</p>
        )}
      </div>

      {/* Decorative background element */}
      <div
        className={cn(
          'absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-5',
          styles.bg
        )}
      />
    </div>
  )
}
