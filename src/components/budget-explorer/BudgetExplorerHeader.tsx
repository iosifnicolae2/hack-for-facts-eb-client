import { Trans } from '@lingui/react/macro'
import type { BudgetExplorerState } from '@/routes/budget-explorer.lazy'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Label } from '@/components/ui/label'
import { PeriodFilter } from '@/components/filters/period-filter/PeriodFilter'
import type { ReportPeriodInput } from '@/schemas/reporting'

type Props = {
  state: BudgetExplorerState
  onChange: (partial: Partial<BudgetExplorerState>) => void
}

export function BudgetExplorerHeader({ state, onChange }: Props) {
  const { filter, primary, depth } = state

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="lg:col-span-1">
        <div className="flex flex-col gap-2 p-4 border rounded-md">
          <Label className="text-xs text-muted-foreground"><Trans>Income vs Expenses</Trans></Label>
          <ToggleGroup
            type="single"
            value={filter.account_category}
            onValueChange={(v: 'ch' | 'vn') => { if(v) onChange({ filter: { ...filter, account_category: v } as any })}}
            variant="outline"
            size="sm"
            className="w-full justify-between gap-2"
          >
            <ToggleGroupItem value="vn" className="flex-1 data-[state=on]:bg-foreground data-[state=on]:text-background"><Trans>Income</Trans></ToggleGroupItem>
            <ToggleGroupItem value="ch" className="flex-1 data-[state=on]:bg-foreground data-[state=on]:text-background"><Trans>Expenses</Trans></ToggleGroupItem>
          </ToggleGroup>

          <Label className="text-xs text-muted-foreground"><Trans>Normalization</Trans></Label>
          <ToggleGroup
            type="single"
            value={filter.normalization ?? 'total'}
            onValueChange={(v: 'total' | 'per_capita' | 'total_euro' | 'per_capita_euro') => {if(v) onChange({ filter: { ...filter, normalization: v } as any })}}
            variant="outline"
            size="sm"
            className="w-full justify-between gap-2"
          >
            <ToggleGroupItem value="total" className="flex-1 data-[state=on]:bg-foreground data-[state=on]:text-background"><Trans>Total</Trans></ToggleGroupItem>
            <ToggleGroupItem value="per_capita" className="flex-1 data-[state=on]:bg-foreground data-[state=on]:text-background"><Trans>Per capita</Trans></ToggleGroupItem>
          </ToggleGroup>
          <Label className="text-xs text-muted-foreground"><Trans>Grouping</Trans></Label>
          <ToggleGroup
            type="single"
            value={primary}
            onValueChange={(v: 'fn' | 'ec') => {if(v) onChange({ primary: v })}}
            variant="outline"
            size="sm"
            className="w-full justify-between gap-2"
          >
            <ToggleGroupItem value="fn" className="flex-1 data-[state=on]:bg-foreground data-[state=on]:text-background"><Trans>Functional</Trans></ToggleGroupItem>
            <ToggleGroupItem value="ec" className="flex-1 data-[state=on]:bg-foreground data-[state=on]:text-background"><Trans>Economic</Trans></ToggleGroupItem>
          </ToggleGroup>

          <Label className="text-xs text-muted-foreground"><Trans>Detail level</Trans></Label>
          <ToggleGroup
            type="single"
            value={depth}
            onValueChange={(v: 'main' | 'detail') => {if(v) onChange({ depth: v })}}
            variant="outline"
            size="sm"
            className="w-full justify-between gap-2"
          >
            <ToggleGroupItem value="main" className="flex-1 data-[state=on]:bg-foreground data-[state=on]:text-background"><Trans>Main chapters</Trans></ToggleGroupItem>
            <ToggleGroupItem value="detail" className="flex-1 data-[state=on]:bg-foreground data-[state=on]:text-background"><Trans>Detailed categories</Trans></ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="lg:col-span-1">
        <PeriodFilter
          value={filter.report_period as ReportPeriodInput | undefined}
          onChange={(report_period) => onChange({ filter: { ...filter, report_period } as any })}
          allowDeselect={false}
        />
      </div>
    </div>
  )
}


