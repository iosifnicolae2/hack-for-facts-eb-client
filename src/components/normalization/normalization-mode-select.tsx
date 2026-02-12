import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Normalization } from '@/schemas/charts'
import { t } from '@lingui/core/macro'

type Props = {
  value?: Normalization
  onChange: (value: Normalization) => void
  allowPerCapita?: boolean
  className?: string
  triggerClassName?: string
  triggerTestId?: string
}

export function NormalizationModeSelect({
  value,
  onChange,
  allowPerCapita = false,
  className,
  triggerClassName,
  triggerTestId,
}: Readonly<Props>) {
  let effectiveValue: Normalization;
  if (value === 'total_euro') {
    effectiveValue = 'total';
  } else if (value === 'per_capita_euro') {
    effectiveValue = 'per_capita';
  } else {
    effectiveValue = value ?? 'total';
  }

  return (
    <div className={className}>
        <Select value={effectiveValue} onValueChange={(val) => onChange(val as Normalization)}>
        <SelectTrigger className={triggerClassName} data-testid={triggerTestId}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="total">{t`Total`}</SelectItem>
          <SelectItem value="per_capita" disabled={!allowPerCapita}>{t`Per capita`}</SelectItem>
          <SelectItem value="percent_gdp">{t`% of GDP`}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
