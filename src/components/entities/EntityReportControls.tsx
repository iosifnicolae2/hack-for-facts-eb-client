import { useMemo, type ReactNode } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { EntityDetailsData } from '@/lib/api/entities'
import { defaultYearRange } from '@/schemas/charts'
import type { GqlReportType, ReportPeriodInput, ReportPeriodType, TMonth, TQuarter, DateInput } from '@/schemas/reporting'
import { makeSingleTimePeriod, getQuarterEndMonth, getQuarterForMonth } from '@/schemas/reporting'
import { FilterIcon } from 'lucide-react'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

type Props = {
  entity?: EntityDetailsData
  periodType: ReportPeriodType
  year: number
  quarter: TQuarter
  month: TMonth
  reportType?: GqlReportType
  mainCreditor?: 'ALL' | string
  onChange?: (payload: { report_period: ReportPeriodInput; report_type?: GqlReportType; main_creditor_cui?: 'ALL' | string }) => void
}

export function EntityReportControls({ entity, periodType, year, quarter, month, reportType, mainCreditor = 'ALL', onChange }: Props) {
  const MONTHS: { id: string; label: string }[] = [
    { id: '01', label: t`January` },
    { id: '02', label: t`February` },
    { id: '03', label: t`March` },
    { id: '04', label: t`April` },
    { id: '05', label: t`May` },
    { id: '06', label: t`June` },
    { id: '07', label: t`July` },
    { id: '08', label: t`August` },
    { id: '09', label: t`September` },
    { id: '10', label: t`October` },
    { id: '11', label: t`November` },
    { id: '12', label: t`December` },
  ]

  const REPORT_TYPE_OPTIONS: { id: GqlReportType; label: ReactNode }[] = [
    { id: 'PRINCIPAL_AGGREGATED', label: t`Main creditor aggregated` },
    { id: 'SECONDARY_AGGREGATED', label: t`Secondary creditor aggregated` },
    { id: 'DETAILED', label: t`Detailed` },
  ]

  const availableYears = useMemo(() => {
    return Array.from({ length: defaultYearRange.end - defaultYearRange.start + 1 }, (_, idx) => defaultYearRange.end - idx)
  }, [])

  const creditorEntries = useMemo(() => {
    const set = new Map<string, string>()
    if (entity?.reports?.nodes) {
      for (const r of entity.reports.nodes) {
        if (r.main_creditor?.cui && r.main_creditor?.name) {
          set.set(r.main_creditor.cui, r.main_creditor.name)
        }
      }
    }
    return Array.from(set.entries()).map(([id, label]) => ({ id, label }))
  }, [entity?.reports?.nodes])

  const creditorOptions = useMemo(() => {
    return creditorEntries.length ? [{ id: 'ALL', label: t`All` }, ...creditorEntries] : []
  }, [creditorEntries])

  const quarterOptions = [
    { id: 'Q1', label: 'Q1' },
    { id: 'Q2', label: 'Q2' },
    { id: 'Q3', label: 'Q3' },
    { id: 'Q4', label: 'Q4' },
  ]

  const emitChange = (type: ReportPeriodType, year: number, quarter: TQuarter, month: TMonth, reportType?: GqlReportType, creditor?: 'ALL' | string) => {
    let dateFilter: DateInput
    if (type === 'YEAR') dateFilter = `${year}`
    else if (type === 'QUARTER') dateFilter = `${year}-${quarter}`
    else if (type === 'MONTH') dateFilter = `${year}-${month}`
    else throw new Error('Invalid period type')
    const report_period = makeSingleTimePeriod(type, dateFilter)
    onChange?.({ report_period, report_type: reportType, main_creditor_cui: creditor })
  }

  const handleTypeChange = (value: string | number | boolean | undefined) => {
    const nextType = String(value) as ReportPeriodType

    // Prepare derived values based on transitions
    let nextYear = year
    let nextQuarter = quarter
    let nextMonth = month

    if (nextType === 'YEAR') {
      // Anchor to year start (month 01)
      nextMonth = '01'
    } else if (nextType === 'QUARTER') {
      if (periodType === 'YEAR') {
        // YEAR → QUARTER: choose last quarter of the selected year
        nextQuarter = 'Q4'
      } else if (periodType === 'MONTH') {
        // MONTH → QUARTER: compute quarter from current month
        const monthNum = Number(nextMonth)
        nextQuarter = getQuarterForMonth(monthNum)
      }
    } else if (nextType === 'MONTH') {
      if (periodType === 'YEAR') {
        // YEAR → MONTH: choose last month of the selected year
        nextMonth = '12'
      } else if (periodType === 'QUARTER') {
        // QUARTER → MONTH: choose the end month of the selected quarter
        nextMonth = getQuarterEndMonth(nextQuarter)
      }
    }

    emitChange(nextType, nextYear, nextQuarter, nextMonth, reportType, mainCreditor)
  }

  const handleYearChange = (value: string) => {
    const y = Number(value)
    emitChange(periodType, y, quarter, month, reportType, mainCreditor)
  }
  const handleQuarterChange = (value: string | number | boolean | undefined) => {
    const q = String(value) as TQuarter
    emitChange(periodType, year, q, month, reportType, mainCreditor)
  }
  const handleMonthChange = (value: string | number | boolean | undefined) => {
    const monthValue = String(value) as TMonth
    emitChange(periodType, year, quarter, monthValue, reportType, mainCreditor)
  }
  const handleReportTypeChange = (value: string | number | boolean | undefined) => {
    const nextReportType = String(value) as GqlReportType
    emitChange(periodType, year, quarter, month, nextReportType, mainCreditor)
  }
  const handleCreditorChange = (value: string) => {
    const creditor = value as 'ALL' | string
    emitChange(periodType, year, quarter, month, reportType, creditor)
  }

  return (
    <div className="flex flex-col gap-4 max-w-md">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground/80">
          <FilterIcon className="h-4 w-4 text-muted-foreground" />
          <span><Trans>Reporting filters</Trans></span>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground"><Trans>Period</Trans></Label>
            <Select value={periodType} onValueChange={handleTypeChange}>
              <SelectTrigger className="hover:bg-muted/50 transition-colors"><SelectValue placeholder={t`Choose type`} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="YEAR"><Trans>Yearly</Trans></SelectItem>
                <SelectItem value="QUARTER"><Trans>Quarterly</Trans></SelectItem>
                <SelectItem value="MONTH"><Trans>Monthly</Trans></SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground"><Trans>Year</Trans></Label>
            <Select value={String(year)} onValueChange={handleYearChange}>
              <SelectTrigger className="hover:bg-muted/50 transition-colors"><SelectValue placeholder={t`Year`} /></SelectTrigger>
              <SelectContent>
                {availableYears.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {periodType === 'QUARTER' && (
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground"><Trans>Quarter</Trans></Label>
              <Select value={quarter} onValueChange={handleQuarterChange}>
                <SelectTrigger className="hover:bg-muted/50 transition-colors"><SelectValue placeholder={t`Quarter`} /></SelectTrigger>
                <SelectContent>
                  {quarterOptions.map((q) => (
                    <SelectItem key={q.id} value={q.id}>{q.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {periodType === 'MONTH' && (
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground"><Trans>Month</Trans></Label>
              <Select value={month} onValueChange={handleMonthChange}>
                <SelectTrigger className="hover:bg-muted/50 transition-colors"><SelectValue placeholder={t`Month`} /></SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Report type */}
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground"><Trans>Report type</Trans></Label>
        <Select value={reportType ?? entity?.default_report_type} onValueChange={handleReportTypeChange}>
          <SelectTrigger className="hover:bg-muted/50 transition-colors">
            <SelectValue defaultValue={reportType} />
          </SelectTrigger>
          <SelectContent>
            {REPORT_TYPE_OPTIONS.map((o) => (
              <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main creditor */}
      {creditorOptions.length > 0 && (
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground"><Trans>Main creditor</Trans></Label>
          <Select value={mainCreditor} onValueChange={handleCreditorChange}>
            <SelectTrigger className="hover:bg-muted/50 transition-colors"><SelectValue placeholder={t`All`} /></SelectTrigger>
            <SelectContent>
              {creditorOptions.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}


