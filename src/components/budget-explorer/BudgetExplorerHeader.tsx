import { Trans } from '@lingui/react/macro'
import { useState } from 'react'
import type { BudgetExplorerState } from '@/routes/budget-explorer.lazy'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Label } from '@/components/ui/label'
import { PeriodFilter } from '@/components/filters/period-filter/PeriodFilter'
import type { ReportPeriodInput } from '@/schemas/reporting'
import { Button } from '@/components/ui/button'
import { ResponsivePopover } from '@/components/ui/ResponsivePopover'
import { EntityReportLabel } from '@/components/entities/EntityReportLabel'

type Props = {
  state: BudgetExplorerState
  onChange: (partial: Partial<BudgetExplorerState>) => void
}

export function BudgetExplorerHeader({ state, onChange }: Props) {
  const { filter } = state
  const isEuroMode =
    filter.normalization === 'total_euro' ||
    filter.normalization === 'per_capita_euro'
  const [advancedOpen, setAdvancedOpen] = useState(false)

  return (
    <div className="md:sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-md">
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">
              <Trans>Income vs Expenses</Trans>
            </Label>
            <ToggleGroup
              type="single"
              value={filter.account_category}
              onValueChange={(value: 'ch' | 'vn') => {
                if (!value) return
                const nextFilter = {
                  ...filter,
                  account_category: value,
                } as BudgetExplorerState['filter']
                const partialState: Partial<BudgetExplorerState> = {
                  filter: nextFilter,
                }
                if (value === 'vn') {
                  partialState.primary = 'fn'
                }
                onChange(partialState)
              }}
              variant="outline"
              size="default"
              className="w-full"
            >
              <ToggleGroupItem
                value="vn"
                className="flex-1 data-[state=on]:bg-foreground data-[state=on]:text-background"
              >
                <Trans>Income</Trans>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="ch"
                className="flex-1 data-[state=on]:bg-foreground data-[state=on]:text-background"
              >
                <Trans>Expenses</Trans>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">
              <Trans>Normalization</Trans>
            </Label>
            <ToggleGroup
              type="single"
              value={filter.normalization ?? 'total'}
              onValueChange={(
                v: 'total' | 'per_capita' | 'total_euro' | 'per_capita_euro'
              ) => {
                if (v) onChange({ filter: { ...filter, normalization: v } as any })
              }}
              variant="outline"
              size="default"
              className="w-full"
            >
              <ToggleGroupItem
                value={isEuroMode ? 'total_euro' : 'total'}
                className="flex-1 data-[state=on]:bg-foreground data-[state=on]:text-background"
              >
                <Trans>Total</Trans>
              </ToggleGroupItem>
              <ToggleGroupItem
                value={isEuroMode ? 'per_capita_euro' : 'per_capita'}
                className="flex-1 data-[state=on]:bg-foreground data-[state=on]:text-background"
              >
                <Trans>Per capita</Trans>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-1">
            <Label className="text-xs text-muted-foreground">
              <Trans>Period</Trans>
            </Label>
            <div className="flex items-center gap-2">
              <ResponsivePopover
                open={advancedOpen}
                onOpenChange={setAdvancedOpen}
                trigger={
                  <Button variant="outline" className="w-full lg:w-[420px] justify-start text-left font-normal rounded-xl px-4 py-2 shadow-sm h-auto" aria-label="Reporting period">
                    <EntityReportLabel period={filter.report_period as ReportPeriodInput} />
                  </Button>
                }
                content={
                  <PeriodFilter
                    value={filter.report_period as ReportPeriodInput | undefined}
                    onChange={(report_period) => {
                      onChange({ filter: { ...filter, report_period } })
                    }}
                    allowDeselect={false}
                  />
                }
                align="end"
                className="p-0 w-md"
                mobileSide="bottom"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

