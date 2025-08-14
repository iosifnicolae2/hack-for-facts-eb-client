import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, formatNumber } from '@/lib/utils'
import type { EntityAnalyticsDataPoint } from '@/schemas/entity-analytics'
import { Trans } from '@lingui/react/macro'

interface Props {
  data: readonly EntityAnalyticsDataPoint[]
}

export function EntityAnalyticsKPIs({ data }: Props) {
  const totalEntities = data.length
  const totalAmount = data.reduce((acc, d) => acc + (d.total_amount ?? 0), 0)
  const avgPerCapita = (() => {
    const valid = data.filter((d) => d.per_capita_amount != null && d.population != null)
    if (valid.length === 0) return null
    return valid.reduce((acc, d) => acc + (d.per_capita_amount ?? 0), 0) / valid.length
  })()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground"><Trans>Entities</Trans></div>
          <div className="text-2xl font-semibold">{formatNumber(totalEntities)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground"><Trans>Total amount</Trans></div>
          <div className="text-2xl font-semibold">{formatCurrency(totalAmount)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground"><Trans>Avg per-capita</Trans></div>
          <div className="text-2xl font-semibold">{avgPerCapita == null ? '-' : formatCurrency(avgPerCapita)}</div>
        </CardContent>
      </Card>
    </div>
  )
}


