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
import { useNormalizationSelection } from '@/hooks/useNormalizationSelection'

type Props = {
  entity?: EntityDetailsData | null | undefined;
  periodType: ReportPeriodType
  year: number
  quarter: TQuarter
  month: TMonth
  reportType?: GqlReportType
  mainCreditor?: string
  normalization?: Normalization
  onChange?: (payload: { report_period: ReportPeriodInput; report_type?: GqlReportType; main_creditor_cui?: string; normalization?: Normalization }) => void
  onPrefetch?: (payload: { report_period: ReportPeriodInput; report_type?: GqlReportType; main_creditor_cui?: string; normalization?: Normalization }) => void
}

export function EntityReportControls({ entity, periodType, year, quarter, month, reportType, mainCreditor, normalization, onChange, onPrefetch }: Props) {
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

  // Display only two options without currency suffix; map to actual normalization
  const DISPLAY_NORMALIZATION_OPTIONS: { id: 'total' | 'per_capita'; label: ReactNode }[] = [
    { id: 'total', label: t`Total` },
    { id: 'per_capita', label: t`Per Capita` },
  ]
  const { toDisplayNormalization, toEffectiveNormalization } = useNormalizationSelection(normalization)

  const availableYears = useMemo(() => {
    return Array.from({ length: defaultYearRange.end - defaultYearRange.start + 1 }, (_, idx) => defaultYearRange.end - idx)
  }, [])

  const creditorOptions = useMemo(() => {
    const parents = entity?.parents?.filter((p) => p.cui !== entity?.cui).map((p) => ({ id: p.cui, label: p.name })) ?? []
    if (parents.length === 0) {
      return []
    }
    return [{ id: 'undefined', label: t`All` }, ...parents]
  }, [entity])

  const quarterOptions = [
    { id: 'Q1', label: 'Q1' },
    { id: 'Q2', label: 'Q2' },
    { id: 'Q3', label: 'Q3' },
    { id: 'Q4', label: 'Q4' },
  ]

  const emitChange = (type: ReportPeriodType, year: number, quarter: TQuarter, month: TMonth, reportType?: GqlReportType, creditor?: string, norm?: Normalization) => {
    let dateFilter: DateInput
    if (type === 'YEAR') dateFilter = `${year}`
    else if (type === 'QUARTER') dateFilter = `${year}-${quarter}`
    else if (type === 'MONTH') dateFilter = `${year}-${month}`
    else throw new Error('Invalid period type')
    const report_period = makeSingleTimePeriod(type, dateFilter)
    const main_creditor_cui = creditor === 'undefined' ? undefined : creditor
    onChange?.({ report_period, report_type: reportType, main_creditor_cui, normalization: norm })
  }

  const emitPrefetch = (type: ReportPeriodType, year: number, quarter: TQuarter, month: TMonth, reportType?: GqlReportType, creditor?: string, norm?: Normalization) => {
    if (!onPrefetch) return
    let dateFilter: DateInput
    if (type === 'YEAR') dateFilter = `${year}`
    else if (type === 'QUARTER') dateFilter = `${year}-${quarter}`
    else if (type === 'MONTH') dateFilter = `${year}-${month}`
    else throw new Error('Invalid period type')
    const report_period = makeSingleTimePeriod(type, dateFilter)
    const main_creditor_cui = creditor === 'undefined' ? undefined : creditor
    onPrefetch({ report_period, report_type: reportType, main_creditor_cui, normalization: norm })
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
        // YEAR → QUARTER: choose first quarter of the selected year
        nextQuarter = 'Q1'
      } else if (periodType === 'MONTH') {
        // MONTH → QUARTER: compute quarter from current month
        const monthNum = Number(nextMonth)
        nextQuarter = getQuarterForMonth(monthNum)
      }
    } else if (nextType === 'MONTH') {
      if (periodType === 'YEAR') {
        // YEAR → MONTH: choose first month of the selected year
        nextMonth = '01'
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
    const creditor = value as string
    emitChange(periodType, year, quarter, month, reportType, creditor, normalization)
  }
  const handleNormalizationChange = (display: 'total' | 'per_capita') => {
    const effective = toEffectiveNormalization(display)
    emitChange(periodType, year, quarter, month, reportType, mainCreditor, effective)
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
                  onMouseEnter={() => {
                    const nextType = o.id as ReportPeriodType
                    let nextYear = year
                    let nextQuarter = quarter
                    let nextMonth = month
                    if (nextType === 'YEAR') {
                      nextMonth = '01'
                    } else if (nextType === 'QUARTER') {
                      if (periodType === 'YEAR') nextQuarter = 'Q1'
                      else if (periodType === 'MONTH') {
                        const monthNum = Number(nextMonth)
                        nextQuarter = getQuarterForMonth(monthNum)
                      }
                    } else if (nextType === 'MONTH') {
                      if (periodType === 'YEAR') nextMonth = '01'
                      else if (periodType === 'QUARTER') nextMonth = getQuarterEndMonth(nextQuarter)
                    }
                    emitPrefetch(nextType, nextYear, nextQuarter, nextMonth, reportType, mainCreditor, normalization)
                  }}
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
                      onMouseEnter={() => emitPrefetch(periodType, year, quarter, month, reportType, mainCreditor, normalization)}
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
                  <ToggleGroupItem key={q.id} value={q.id} onMouseEnter={() => emitPrefetch(periodType, year, q.id as TQuarter, month, reportType, mainCreditor, normalization)} className="data-[state=on]:bg-foreground data-[state=on]:text-background">{q.label}</ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          )}
          {periodType === 'MONTH' && (
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground"><Trans>Month</Trans></Label>
              <ToggleGroup type="single" value={month} onValueChange={handleMonthChange} variant="outline" size="sm" className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {MONTHS.map((m) => (
                  <ToggleGroupItem key={m.id} value={m.id} onMouseEnter={() => emitPrefetch(periodType, year, quarter, m.id, reportType, mainCreditor, normalization)} className="justify-center data-[state=on]:bg-foreground data-[state=on]:text-background">{m.label}</ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground"><Trans>Normalization</Trans></Label>
            <ToggleGroup
              type="single"
              value={toDisplayNormalization(normalization)}
              onValueChange={(v) => v && handleNormalizationChange(v as 'total' | 'per_capita')}
              variant="outline"
              size="sm"
              className="grid grid-cols-1 gap-2"
            >
              {DISPLAY_NORMALIZATION_OPTIONS.map((o) => (
                <ToggleGroupItem
                  key={o.id}
                  value={o.id}
                  onMouseEnter={() => emitPrefetch(
                    periodType,
                    year,
                    quarter,
                    month,
                    reportType,
                    mainCreditor,
                    toEffectiveNormalization(o.id)
                  )}
                  className="data-[state=on]:bg-foreground data-[state=on]:text-background"
                >
                  {o.label}
                </ToggleGroupItem>
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
            <ToggleGroupItem key={o.id} value={o.id} onMouseEnter={() => emitPrefetch(periodType, year, quarter, month, o.id, mainCreditor, normalization)} className="data-[state=on]:bg-foreground data-[state=on]:text-background">{o.label}</ToggleGroupItem>
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
              <ToggleGroupItem key={c.id} value={c.id} onMouseEnter={() => emitPrefetch(periodType, year, quarter, month, reportType, c.id, normalization)} className="data-[state=on]:bg-foreground data-[state=on]:text-background">{c.label}</ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      )}
    </div>
  )
}


