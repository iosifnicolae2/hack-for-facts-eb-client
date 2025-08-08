import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, formatNumberRO } from '@/lib/utils'
import type { EntityAnalyticsDataPoint } from '@/schemas/entity-analytics'

interface Props {
  data: readonly EntityAnalyticsDataPoint[]
}

export function EntityAnalyticsKPIs({ data }: Props) {
  const totalEntities = data.length
  const totalAmount = data.reduce((acc, d) => acc + (d.total_amount ?? 0), 0)
  const avgPerCapita = (() => {
    const valid = data.filter((d) => d.per_capita_amount != null)
    if (valid.length === 0) return 0
    return valid.reduce((acc, d) => acc + (d.per_capita_amount ?? 0), 0) / valid.length
  })()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">Entities</div>
          <div className="text-2xl font-semibold">{formatNumberRO(totalEntities)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">Total amount</div>
          <div className="text-2xl font-semibold">{formatCurrency(totalAmount)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">Avg per-capita</div>
          <div className="text-2xl font-semibold">{formatCurrency(avgPerCapita)}</div>
        </CardContent>
      </Card>
    </div>
  )
}


