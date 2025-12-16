import { useMemo } from 'react'
import type { EntityAnalyticsDataPoint } from '@/schemas/entity-analytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ScatterChart, Scatter, Cell } from 'recharts'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { useEntityAnalyticsFilter } from '@/hooks/useEntityAnalyticsFilter'

interface Props {
  data: readonly EntityAnalyticsDataPoint[]
  normalization?: 'total' | 'per_capita'
}

export function EntityAnalyticsCharts({ data, normalization = 'per_capita' }: Props) {
  const { setFilter } = useEntityAnalyticsFilter()
  const topByTotal = useMemo(() => [...data].sort((a, b) => b.total_amount - a.total_amount).slice(0, 15), [data])
  const scatterData = useMemo(() => data.filter((d) => d.population != null), [data])
  const barKey = normalization === 'total' ? 'total_amount' : 'per_capita_amount'
  const barLabel = normalization === 'total' ? 'Total' : 'Per Capita'

  const countyAgg = useMemo(() => {
    const map = new Map<string, { county_name: string; county_code: string; total: number; population: number }>()
    for (const d of data) {
      const code = d.county_code ?? 'N/A'
      const name = d.county_name ?? 'Unknown'
      const entry = map.get(code) ?? { county_name: name, county_code: code, total: 0, population: 0 }
      entry.total += d.total_amount || 0
      entry.population += d.population || 0
      map.set(code, entry)
    }
    const arr = Array.from(map.values()).map((x) => ({
      county_name: x.county_name,
      county_code: x.county_code,
      total_amount: x.total,
      per_capita_amount: x.population > 0 ? x.total / x.population : 0,
    }))
    return arr.sort((a, b) => (normalization === 'total' ? b.total_amount - a.total_amount : b.per_capita_amount - a.per_capita_amount)).slice(0, 10)
  }, [data, normalization])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Top 15 entities by total amount</CardTitle>
        </CardHeader>
        <CardContent className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topByTotal} margin={{ top: 8, right: 16, bottom: 24, left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="entity_name" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" interval={0} />
              <YAxis tickFormatter={(v) => formatNumber(v)} />
              <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0))} />
              <Legend />
              <Bar dataKey={barKey} name={barLabel} fill="#3b82f6">
                {topByTotal.map((entry, index) => (
                  <Cell
                    key={`ent-${index}`}
                    cursor="pointer"
                    onClick={() => {
                      setFilter({ entity_cuis: [entry.entity_cui] })
                    }}
                  />)
                )}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Per-capita vs population</CardTitle>
        </CardHeader>
        <CardContent className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 16, bottom: 24, left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="population" name="Population" tickFormatter={(v) => formatNumber(v)} />
              <YAxis dataKey="per_capita_amount" name="Per Capita" tickFormatter={(v) => formatNumber(v)} />
              <Tooltip
                formatter={(v, name) => [formatCurrency(Number(v ?? 0)), name]}
                labelFormatter={(label: string | number) => `Population: ${formatNumber(Number(label))}`}
              />
              <Legend />
              <Scatter data={scatterData} name="Entities" fill="#10b981" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Top 10 counties by {barLabel.toLowerCase()}</CardTitle>
        </CardHeader>
        <CardContent className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={countyAgg} margin={{ top: 8, right: 16, bottom: 24, left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="county_name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" interval={0} />
              <YAxis tickFormatter={(v) => formatNumber(v)} />
              <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0))} />
              <Legend />
              <Bar dataKey={barKey} name={barLabel} fill="#6366f1">
                {countyAgg.map((entry, index) => (
                  <Cell
                    key={`cty-${index}`}
                    cursor="pointer"
                    onClick={() => {
                      setFilter({ county_codes: [entry.county_code] })
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}


