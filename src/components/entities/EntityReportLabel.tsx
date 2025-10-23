import { cn } from '@/lib/utils'
import type { ReportPeriodInput, GqlReportType } from '@/schemas/reporting'
import { Trans } from '@lingui/react/macro'

type Props = {
  className?: string
  period: ReportPeriodInput
  reportType?: GqlReportType
  mainCreditorLabel?: string | null
}

function toCompactPeriodLabel(period: ReportPeriodInput): string {
  if (period.selection.interval) {
    const start = period.selection.interval.start
    const end = period.selection.interval.end
    if (!start && !end) return ''
    if (start && end && start !== end) return `${start} - ${end}`
    return String(start ?? end ?? '')
  }
  if (period.selection.dates && period.selection.dates.length > 0) {
    const dates = period.selection.dates
    if (dates.length > 3) {
      return `${dates.slice(0, 3).join(', ')}...`
    }
    return dates.join(', ')
  }
  return ''
}

export function EntityReportLabel({ className, period: period, reportType, mainCreditorLabel }: Props) {
  const parts: string[] = []
  parts.push(toCompactPeriodLabel(period))
  if (reportType) parts.push(reportType.split('_').join(' ').toLowerCase())
  if (mainCreditorLabel) parts.push(mainCreditorLabel)
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <span className="font-bold"><Trans>Reporting:</Trans></span>
      <span className="capitalize font-bold max-w-42 sm:max-w-none truncate">{parts.join(' • ')}</span>
    </span>
  )
}


