import { useEffect, useState } from 'react'
import { Trans } from '@lingui/react/macro'
import { Info } from 'lucide-react'
import { yValueFormatter } from '@/components/charts/components/chart-renderer/utils'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { ExcludedItemsSummary } from './budget-transform'
import { useIsMobile } from '@/hooks/use-mobile'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { useDebouncedCallback } from '@/lib/hooks/useDebouncedCallback'

type Props = {
  readonly excludedItemsSummary?: ExcludedItemsSummary
  readonly currencyCode: 'RON' | 'EUR'
  readonly perCapita?: boolean
  readonly amountFilter?: {
    minValue: number
    maxValue: number
    range: [number, number]
    onChange: (val: [number, number]) => void
  }
}

export function FilteredSpendingInfo({ excludedItemsSummary, currencyCode, perCapita, amountFilter }: Props) {
  const isMobile = useIsMobile()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [uiRange, setUiRange] = useState<[number, number]>(amountFilter?.range ?? [0, 0])
  const hasExcluded = !!excludedItemsSummary && excludedItemsSummary.totalExcluded > 0
  const showDialog = hasExcluded || (!!amountFilter && amountFilter.maxValue > 0)
  if (!showDialog) return null

  const step = amountFilter ? Math.max(1, Math.round((amountFilter.maxValue - amountFilter.minValue) / 100)) : 1


  useEffect(() => {
    if (!amountFilter) return
    setUiRange([amountFilter.range[0], amountFilter.range[1]])
  }, [amountFilter?.range?.[0], amountFilter?.range?.[1]])

  const debouncedOnChange = useDebouncedCallback<[[number, number]]>((val) => {
    amountFilter?.onChange(val)
  }, 500)

  const content = (
    <div className="space-y-4">
      {hasExcluded && excludedItemsSummary && (
        <>
          {/* Header */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">
              <Trans>Spending Calculation</Trans>
            </h4>
            <p className="text-xs text-muted-foreground">
              <Trans>Understanding the consolidated general budget spending</Trans>
            </p>
          </div>

          {/* Calculation breakdown */}
          <div className="bg-muted/30 rounded-lg p-2 md:p-4 space-y-2.5">
            <div className="flex justify-between items-center gap-6">
              <div className="flex-1">
                <div className="text-xs font-medium text-foreground">
                  <Trans>Total Spending</Trans>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  <Trans>All budget expenditures</Trans>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-base font-semibold text-foreground whitespace-nowrap">
                  {yValueFormatter(excludedItemsSummary.totalBeforeExclusion, currencyCode, 'compact')}
                  {perCapita && <span className="ml-1 font-sans text-xs">/ capita</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center py-1">
              <div className="w-full border-t border-dashed border-border" />
              <span className="px-3 text-sm font-bold text-muted-foreground">−</span>
              <div className="w-full border-t border-dashed border-border" />
            </div>

            <div className="flex justify-between items-center gap-6">
              <div className="flex-1">
                <div className="text-xs font-medium text-foreground">
                  <Trans>Excluded Items</Trans>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  <Trans>Non-direct spending</Trans>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-base font-semibold text-destructive whitespace-nowrap">
                  {yValueFormatter(excludedItemsSummary.totalExcluded, currencyCode, 'compact')}
                  {perCapita && <span className="ml-1 font-sans text-xs">/ capita</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center py-1">
              <div className="w-full border-t-2 border-primary/30" />
              <span className="px-3 text-sm font-bold text-primary">=</span>
              <div className="w-full border-t-2 border-primary/30" />
            </div>

            <div className="flex justify-between items-center gap-6 bg-primary/5 rounded-md p-3 -mx-1">
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">
                  <Trans>Effective Spending</Trans>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  <Trans>Actual impact on budget</Trans>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-lg font-bold text-primary whitespace-nowrap">
                  {yValueFormatter(excludedItemsSummary.totalAfterExclusion, currencyCode, 'compact')}
                  {perCapita && <span className="ml-1 font-sans text-sm">/ capita</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Excluded categories details */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-semibold text-foreground">
              <Trans>Excluded categories</Trans>
            </h5>
            <div className="space-y-2">
              {excludedItemsSummary.items.map((item) => (
                <div key={item.code} className="flex justify-between items-start gap-4 text-xs">
                  <div className="flex-1">
                    <div className="text-foreground font-medium">{item.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      <span className="font-mono bg-muted/70 px-1.5 py-0.5 rounded">ec:{item.code}</span>
                    </div>
                  </div>
                  <div className="font-mono font-semibold text-foreground whitespace-nowrap">
                    {yValueFormatter(item.amount, currencyCode, 'compact')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {amountFilter && amountFilter.maxValue > 0 && (
        <div className="pt-2">
          <h5 className="text-xs font-semibold text-foreground mb-2">
            <Trans>Amount filter (this layer)</Trans>
          </h5>
          <div className="mb-2 flex items-center justify-between">
            <Label className="text-xs text-muted-foreground"><Trans>Range</Trans></Label>
            <div className="text-xs text-muted-foreground font-mono">
              {yValueFormatter(uiRange[0], currencyCode, 'compact')} – {yValueFormatter(uiRange[1], currencyCode, 'compact')}
              {perCapita && ' / capita'}
            </div>
          </div>
          <Slider
            value={uiRange}
            min={Math.floor(amountFilter.minValue)}
            max={Math.ceil(amountFilter.maxValue)}
            step={step}
            onValueChange={(val) => {
              const newRange = val as [number, number]
              setUiRange(newRange)
              debouncedOnChange(newRange)
            }}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
            <span className="font-mono">{yValueFormatter(amountFilter.minValue, currencyCode, 'compact')}</span>
            <span className="font-mono">{yValueFormatter(amountFilter.maxValue, currencyCode, 'compact')}</span>
          </div>
          {(amountFilter.range[0] > amountFilter.minValue || amountFilter.range[1] < amountFilter.maxValue) && (
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => {
                  const next: [number, number] = [amountFilter.minValue, amountFilter.maxValue]
                  setUiRange(next)
                  debouncedOnChange(next)
                }}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                <Trans>Reset amount filter</Trans>
              </button>
            </div>
          )}
        </div>
      )}

      {hasExcluded && (
        <div className="flex gap-2 text-xs text-muted-foreground bg-muted/20 rounded-md p-3">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p className="leading-relaxed">
            <Trans>Note: Financial operations (Titles 80+81) represent loans and credit repayments. These are financing flows, not regular budget expenses, and are excluded from effective spending.</Trans>
          </p>
        </div>
      )}
    </div>
  )

  // Mobile: Use Dialog for better touch experience
  if (isMobile) {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2.5 text-xs gap-1.5 bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900 dark:bg-amber-950 dark:hover:bg-amber-900 dark:border-amber-800 dark:text-amber-100"
          >
            <Info className="w-3.5 h-3.5" />
            <Trans>Filtered</Trans>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-base">
              <Trans>Spending Calculation</Trans>
            </DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  // Desktop: Use Popover with click trigger
  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <button
          onClick={() => setPopoverOpen(!popoverOpen)}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <span className="font-medium">
            <Trans>Filtered</Trans>
          </span>
          <Info className="w-3.5 h-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[420px] p-5 z-10"
        align="center"
        side="bottom"
        sideOffset={8}
      >
        {content}
      </PopoverContent>
    </Popover>
  )
}
