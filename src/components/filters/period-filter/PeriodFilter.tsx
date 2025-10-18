import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Label } from '@/components/ui/label'
import type { ReportPeriodInput, ReportPeriodType, PeriodDate } from '@/schemas/reporting'
import { Trans } from '@lingui/react/macro'
import { useMemo } from 'react'
import { defaultYearRange } from '@/schemas/charts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TMonth, TQuarter } from '@/schemas/reporting'
import { i18n } from '@lingui/core'

type PeriodSelectionMode = 'dates' | 'interval'

type Props = {
  value?: ReportPeriodInput
  onChange: (value?: ReportPeriodInput) => void
  allowDeselect?: boolean
}

export function PeriodFilter({ value, onChange, allowDeselect = true }: Props) {
  const periodType = value?.type ?? 'YEAR'
  const selectionMode: PeriodSelectionMode = value?.selection.interval ? 'interval' : 'dates'

  const handlePeriodTypeChange = (type: ReportPeriodType) => {
    if (!type) return
    // Reset selection when changing period type
    const currentYear = String(new Date().getFullYear())
    let defaultDate: PeriodDate
    switch (type) {
      case 'YEAR':
        defaultDate = currentYear as PeriodDate
        break
      case 'QUARTER':
        defaultDate = `${currentYear}-Q1` as PeriodDate
        break
      case 'MONTH':
        defaultDate = `${currentYear}-01` as PeriodDate
        break
    }
    onChange?.({ type, selection: { dates: [defaultDate] } })
  }

  const handleSelectionModeChange = (mode: PeriodSelectionMode) => {
    if (!mode) return
    // Reset selection when changing mode
    if (mode === 'dates') {
      const currentYear = String(new Date().getFullYear())
      let defaultDate: PeriodDate
      switch (periodType) {
        case 'YEAR':
          defaultDate = currentYear as PeriodDate
          break
        case 'QUARTER':
          defaultDate = `${currentYear}-Q1` as PeriodDate
          break
        case 'MONTH':
          defaultDate = `${currentYear}-01` as PeriodDate
          break
      }
      onChange?.({ type: periodType, selection: { dates: [defaultDate] } })
    } else {
      const currentYear = String(new Date().getFullYear())
      let start: PeriodDate
      let end: PeriodDate

      switch (periodType) {
        case 'YEAR':
          start = sortedPeriodOptions[0] as PeriodDate
          end = sortedPeriodOptions[sortedPeriodOptions.length - 1] as PeriodDate
          break;
        case 'QUARTER':
          start = `${currentYear}-Q1` as PeriodDate
          end = `${currentYear}-Q4` as PeriodDate
          break;
        case 'MONTH':
          start = `${currentYear}-01` as PeriodDate
          end = `${currentYear}-12` as PeriodDate
          break;
      }
      onChange?.({ type: periodType, selection: { interval: { start, end } } })
    }
  }

  const availableYears = useMemo(() => {
    return Array.from({ length: defaultYearRange.end - defaultYearRange.start + 1 }, (_, idx) => String(defaultYearRange.end - idx))
  }, [])

  const monthFormatter = useMemo(() => new Intl.DateTimeFormat(i18n.locale || 'en', { month: 'short' }), [i18n.locale])
  const availableMonths: { id: TMonth; label: string }[] = useMemo(() => {
    return Array.from({ length: 12 }, (_, idx) => {
      const id = String(idx + 1).padStart(2, '0') as TMonth
      let short = monthFormatter.format(new Date(2000, idx, 1))
      if (!short.endsWith('.')) short = `${short}.`
      return { id, label: `${id} ${short}` }
    })
  }, [monthFormatter])

  const availableQuarters: { id: TQuarter; label: string }[] = [
    { id: 'Q1', label: 'Q1' },
    { id: 'Q2', label: 'Q2' },
    { id: 'Q3', label: 'Q3' },
    { id: 'Q4', label: 'Q4' },
  ]

  const renderDateSelectionGrid = () => {
    if (periodType === 'YEAR') {
      return (
        <ToggleGroup type="single" value={value?.selection.dates?.[0]} onValueChange={(date) => {
          if (!date && !allowDeselect) return;
          onChange?.({ type: 'YEAR', selection: { dates: date ? [date as PeriodDate] : [] } })
        }} className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {availableYears.map((year) => (
            <ToggleGroupItem key={year} value={year} className="data-[state=on]:bg-foreground data-[state=on]:text-background">
              {year}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )
    }
    if (periodType === 'QUARTER') {
      return (
        <div className="flex flex-col gap-2">
          {availableYears.map((year) => (
            <div key={year}>
              <Label className="text-sm font-medium">{year}</Label>
              <ToggleGroup type="multiple" value={value?.selection.dates} onValueChange={(dates) => onChange?.({ type: periodType, selection: { dates: dates as PeriodDate[] } })} className="grid grid-cols-4 gap-2 mt-1">
                {availableQuarters.map((q) => {
                  const date = `${year}-${q.id}` as PeriodDate
                  return (
                    <ToggleGroupItem key={date} value={date} className="data-[state=on]:bg-foreground data-[state=on]:text-background">
                      {q.label}
                    </ToggleGroupItem>
                  )
                })}
              </ToggleGroup>
            </div>
          ))}
        </div>
      )
    }
    if (periodType === 'MONTH') {
      return (
        <div className="flex flex-col gap-2">
          {availableYears.map((year) => (
            <div key={year}>
              <Label className="text-sm font-medium">{year}</Label>
              <ToggleGroup type="multiple" value={value?.selection.dates} onValueChange={(dates) => onChange?.({ type: periodType, selection: { dates: dates as PeriodDate[] } })} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-1">
                {availableMonths.map((m) => {
                  const date = `${year}-${m.id}` as PeriodDate
                  return (
                    <ToggleGroupItem key={date} value={date} className="data-[state=on]:bg-foreground data-[state=on]:text-background">
                      {m.label}
                    </ToggleGroupItem>
                  )
                })}
              </ToggleGroup>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const getPeriodOptions = (type: ReportPeriodType) => {
    switch (type) {
      case 'YEAR':
        return availableYears
      case 'QUARTER':
        return availableYears.flatMap((year) => availableQuarters.map((q) => `${year}-${q.id}`))
      case 'MONTH':
        return availableYears.flatMap((year) => availableMonths.map((m) => `${year}-${m.id}`))
      default:
        return []
    }
  }
  const periodOptions = useMemo(() => getPeriodOptions(periodType), [periodType, availableYears, availableMonths, availableQuarters]);
  const sortedPeriodOptions = useMemo(() => [...periodOptions].sort(), [periodOptions]);


  const handleIntervalStartChange = (start: PeriodDate) => {
    const end = value?.selection.interval?.end ?? sortedPeriodOptions[sortedPeriodOptions.length - 1] as PeriodDate
    onChange?.({ type: periodType, selection: { interval: { start, end } } })
  }
  const handleIntervalEndChange = (end: PeriodDate) => {
    const start = value?.selection.interval?.start ?? sortedPeriodOptions[0] as PeriodDate
    onChange?.({ type: periodType, selection: { interval: { start, end } } })
  }

  const renderIntervalSelection = () => {
    const startValue = value?.selection.interval?.start
    const endValue = value?.selection.interval?.end

    const startIndex = startValue ? sortedPeriodOptions.indexOf(startValue) : 0
    const endIndex = endValue ? sortedPeriodOptions.indexOf(endValue) : sortedPeriodOptions.length - 1
    const endOptions = sortedPeriodOptions.slice(startIndex)
    const startOptions = sortedPeriodOptions.slice(0, endIndex + 1)

    return (
      <div className="flex items-center gap-2">
        <Select value={startValue} onValueChange={(v) => handleIntervalStartChange(v as PeriodDate)}>
          <SelectTrigger>
            <SelectValue placeholder="Start" />
          </SelectTrigger>
          <SelectContent>
            {[...startOptions].reverse().map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>-</span>
        <Select value={endValue} onValueChange={(v) => handleIntervalEndChange(v as PeriodDate)}>
          <SelectTrigger>
            <SelectValue placeholder="End" />
          </SelectTrigger>
          <SelectContent>
            {[...endOptions].reverse().map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-md">
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">
          <Trans>Period Type</Trans>
        </Label>
        <ToggleGroup type="single" value={periodType} onValueChange={(v: ReportPeriodType) => handlePeriodTypeChange(v)} variant="outline" size="sm" className="w-full justify-between gap-2">
          <ToggleGroupItem value="YEAR" className="flex-1">
            <Trans>Yearly</Trans>
          </ToggleGroupItem>
          <ToggleGroupItem value="QUARTER" className="flex-1">
            <Trans>Quarterly</Trans>
          </ToggleGroupItem>
          <ToggleGroupItem value="MONTH" className="flex-1">
            <Trans>Monthly</Trans>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">
          <Trans>Selection Mode</Trans>
        </Label>
        <ToggleGroup type="single" value={selectionMode} onValueChange={(v: PeriodSelectionMode) => handleSelectionModeChange(v)} variant="outline" size="sm" className="w-full justify-between gap-2">
          <ToggleGroupItem value="dates" className="flex-1">
            <Trans>Dates</Trans>
          </ToggleGroupItem>
          <ToggleGroupItem value="interval" className="flex-1">
            <Trans>Interval</Trans>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="max-h-60 overflow-y-auto pr-2">{selectionMode === 'dates' ? renderDateSelectionGrid() : renderIntervalSelection()}</div>
    </div>
  )
}
