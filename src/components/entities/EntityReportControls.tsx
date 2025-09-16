import { useMemo, type ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { EntityDetailsData } from '@/lib/api/entities'
import { defaultYearRange, type Normalization } from '@/schemas/charts'
import type { GqlReportType, ReportPeriodInput, ReportPeriodType, TMonth, TQuarter, DateInput } from '@/schemas/reporting'
import { makeSingleTimePeriod, getQuarterEndMonth, getQuarterForMonth } from '@/schemas/reporting'
import { FilterIcon } from 'lucide-react'
import { i18n } from '@lingui/core'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

type Props = {
  entity?: EntityDetailsData | null | undefined;
  periodType: ReportPeriodType
  year: number
  quarter: TQuarter
  month: TMonth
  reportType?: GqlReportType
  mainCreditor?: 'ALL' | string
  normalization?: Normalization
  onChange?: (payload: { report_period: ReportPeriodInput; report_type?: GqlReportType; main_creditor_cui?: 'ALL' | string; normalization?: Normalization }) => void
}

export function EntityReportControls({ entity, periodType, year, quarter, month, reportType, mainCreditor = 'ALL', normalization, onChange }: Props) {
  const monthFormatter = useMemo(() => new Intl.DateTimeFormat(i18n.locale || 'en', { month: 'short' }), [i18n.locale])
  const MONTHS: { id: TMonth; label: string }[] = useMemo(() => {
    return Array.from({ length: 12 }, (_, idx) => {
      const id = String(idx + 1).padStart(2, '0') as TMonth
      let short = monthFormatter.format(new Date(2000, idx, 1))
      if (!short.endsWith('.')) short = `${short}.`
      return { id, label: `${id} ${short}` }
    })
  }, [monthFormatter])

  const REPORT_TYPE_OPTIONS: { id: GqlReportType; label: ReactNode }[] = [
    { id: 'PRINCIPAL_AGGREGATED', label: t`Main creditor aggregated` },
    { id: 'SECONDARY_AGGREGATED', label: t`Secondary creditor aggregated` },
    { id: 'DETAILED', label: t`Detailed` },
  ]

  const NORMALIZATION_OPTIONS: { id: Normalization; label: ReactNode }[] = [
    { id: 'total', label: t`Total (RON)` },
    { id: 'total_euro', label: t`Total (EUR)` },
    { id: 'per_capita', label: t`Per Capita (RON)` },
    { id: 'per_capita_euro', label: t`Per Capita (EUR)` },
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

  const emitChange = (type: ReportPeriodType, year: number, quarter: TQuarter, month: TMonth, reportType?: GqlReportType, creditor?: 'ALL' | string, norm?: Normalization) => {
    let dateFilter: DateInput
    if (type === 'YEAR') dateFilter = `${year}`
    else if (type === 'QUARTER') dateFilter = `${year}-${quarter}`
    else if (type === 'MONTH') dateFilter = `${year}-${month}`
    else throw new Error('Invalid period type')
    const report_period = makeSingleTimePeriod(type, dateFilter)
    onChange?.({ report_period, report_type: reportType, main_creditor_cui: creditor, normalization: norm })
  }

  const handleTypeChange = (value: string | number | boolean | undefined) => {
    if (!value) return
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

    emitChange(nextType, nextYear, nextQuarter, nextMonth, reportType, mainCreditor, normalization)
  }

  const handleYearChange = (value: string) => {
    if (!value) return
    const y = Number(value)
    emitChange(periodType, y, quarter, month, reportType, mainCreditor, normalization)
  }
  const handleQuarterChange = (value: string | number | boolean | undefined) => {
    if (!value) return
    const q = String(value) as TQuarter
    emitChange(periodType, year, q, month, reportType, mainCreditor, normalization)
  }
  const handleMonthChange = (value: string | number | boolean | undefined) => {
    if (!value) return
    const monthValue = String(value) as TMonth
    emitChange(periodType, year, quarter, monthValue, reportType, mainCreditor, normalization)
  }
  const handleReportTypeChange = (value: string | number | boolean | undefined) => {
    const nextReportType = String(value) as GqlReportType
    emitChange(periodType, year, quarter, month, nextReportType, mainCreditor, normalization)
  }
  const handleCreditorChange = (value: string) => {
    const creditor = value as 'ALL' | string
    emitChange(periodType, year, quarter, month, reportType, creditor, normalization)
  }
  const handleNormalizationChange = (value: Normalization) => {
    emitChange(periodType, year, quarter, month, reportType, mainCreditor, value)
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground/80">
          <FilterIcon className="h-4 w-4 text-muted-foreground" />
          <span><Trans>Reporting filters</Trans></span>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground"><Trans>Period</Trans></Label>
            <ToggleGroup type="single" value={periodType} onValueChange={handleTypeChange} variant="outline" size="sm" className="w-full justify-between gap-2">
              {[
                { id: 'YEAR', label: <Trans>Yearly</Trans> },
                { id: 'QUARTER', label: <Trans>Quarterly</Trans> },
                { id: 'MONTH', label: <Trans>Monthly</Trans> }
              ].map((o) => (
                <ToggleGroupItem
                  key={o.id}
                  value={o.id}
                  className="flex-1 inline-flex items-center gap-2 data-[state=on]:bg-foreground data-[state=on]:text-background">
                  {o.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground"><Trans>Year</Trans></Label>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <ToggleGroup
                  type="single"
                  value={String(year)}
                  onValueChange={handleYearChange}
                  variant="outline"
                  size="sm"
                  className="grid grid-cols-3 sm:grid-cols-5 gap-2"
                >
                  {availableYears.map((year) => (
                    <ToggleGroupItem
                      key={year}
                      value={String(year)}
                      className="justify-center data-[state=on]:bg-foreground data-[state=on]:text-background"
                    >
                      {year}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            </div>
          </div>
          {periodType === 'QUARTER' && (
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground"><Trans>Quarter</Trans></Label>
              <ToggleGroup type="single" value={quarter} onValueChange={handleQuarterChange} variant="outline" size="sm" className="grid grid-cols-4 gap-2">
                {quarterOptions.map((q) => (
                  <ToggleGroupItem key={q.id} value={q.id} className="data-[state=on]:bg-foreground data-[state=on]:text-background">{q.label}</ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          )}
          {periodType === 'MONTH' && (
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground"><Trans>Month</Trans></Label>
              <ToggleGroup type="single" value={month} onValueChange={handleMonthChange} variant="outline" size="sm" className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {MONTHS.map((m) => (
                  <ToggleGroupItem key={m.id} value={m.id} className="justify-center data-[state=on]:bg-foreground data-[state=on]:text-background">{m.label}</ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground"><Trans>Normalization</Trans></Label>
            <ToggleGroup
              type="single"
              value={normalization ?? 'total'}
              onValueChange={(v) => v && handleNormalizationChange(v as Normalization)}
              variant="outline"
              size="sm"
              className="grid grid-cols-1 gap-2"
            >
              {NORMALIZATION_OPTIONS.map((o) => (
                <ToggleGroupItem key={o.id} value={o.id} className="data-[state=on]:bg-foreground data-[state=on]:text-background">{o.label}</ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
      </div>

      {/* Report type */}
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground"><Trans>Report type</Trans></Label>
        <ToggleGroup
          type="single"
          value={reportType ?? entity?.default_report_type}
          onValueChange={handleReportTypeChange}
          variant="outline"
          size="sm"
          className="grid grid-cols-1 gap-2"
        >
          {REPORT_TYPE_OPTIONS.map((o) => (
            <ToggleGroupItem key={o.id} value={o.id} className="data-[state=on]:bg-foreground data-[state=on]:text-background">{o.label}</ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* Main creditor */}
      {creditorOptions.length > 0 && (
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground"><Trans>Main creditor</Trans></Label>
          <ToggleGroup
            type="single"
            value={mainCreditor}
            onValueChange={(v) => v && handleCreditorChange(String(v))}
            variant="outline"
            size="sm"
            className="grid grid-cols-1 gap-2"
          >
            {creditorOptions.map((c) => (
              <ToggleGroupItem key={c.id} value={c.id} className="data-[state=on]:bg-foreground data-[state=on]:text-background">{c.label}</ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      )}
    </div>
  )
}


