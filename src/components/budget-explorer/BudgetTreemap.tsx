import { Fragment, type FC, useMemo } from 'react'
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts'
import { Trans } from '@lingui/react/macro'

import { yValueFormatter } from '@/components/charts/components/chart-renderer/utils'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import type { TreemapInput } from './budget-transform'
import { useIsMobile } from '@/hooks/use-mobile'
import { getNormalizationUnit } from '@/lib/utils'

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d',
  '#A4DE6C', '#D0ED57', '#FF7300', '#FFB300', '#E53935', '#D81B60',
  '#8E24AA', '#5E35B1', '#3949AB', '#1E88E5', '#039BE5', '#00ACC1',
  '#00897B', '#43A047', '#7CB342', '#C0CA33', '#FDD835', '#FFB300',
  '#FB8C00', '#F4511E',
]

const getColor = (key: string) => {
  let hash = 0
  if (key.length === 0) return COLORS[0]
  for (let index = 0; index < key.length; index += 1) {
    const char = key.charCodeAt(index)
    hash = ((hash << 5) - hash) + char
    hash &= hash
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

type BreadcrumbEntry = { code: string; label: string }

type Props = {
  data: TreemapInput[]
  primary: 'fn' | 'ec'
  onNodeClick?: (code: string | null) => void
  onBreadcrumbClick?: (code: string | null, index?: number) => void
  path?: BreadcrumbEntry[]
  onViewDetails?: () => void
  onBackToMain?: () => void
  showViewDetails?: boolean
  showBackToMain?: boolean
  normalization?: 'total' | 'total_euro' | 'per_capita' | 'per_capita_euro'
}

const CustomizedContent: FC<{
  name: string
  value: number
  depth: number
  x: number
  y: number
  width: number
  height: number
  fill: string
  root: { value: number }
  normalization?: 'total' | 'total_euro' | 'per_capita' | 'per_capita_euro'
}> = (props) => {
  const { name, value, depth, x, y, width, height, fill, root, normalization } = props

  if (!Number.isFinite(value)) {
    return null
  }

  const total = root?.value ?? 0
  const percentage = total > 0 ? (value / total) * 100 : 0
  const unit = getNormalizationUnit(normalization ?? 'total')
  const currencyCode = unit.includes('EUR') ? 'EUR' : 'RON'
  const displayValue = yValueFormatter(value, currencyCode, 'compact')

  const baseColor = '#FFFFFF'
  const nameFontSize = 12
  const valueFontSize = 10
  const percentageFontSize = 10

  const canShowName = width > 50 && height > 24
  const canShowValue = canShowName && height > 40
  const canShowPercentage = canShowName && height > 56

  const maxChars = Math.max(Math.floor(width / (nameFontSize * 0.55)), 0)
  const truncatedName = maxChars > 0 && name.length > maxChars ? `${name.slice(0, maxChars - 1)}…` : name

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill,
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-5),
          strokeOpacity: 0.5,
        }}
      />
      {canShowName && (
        <text
          x={x + width / 2}
          y={canShowValue ? y + height / 2 - valueFontSize / 2 : y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={baseColor}
          fontSize={nameFontSize}
          fontWeight={500}
          style={{ pointerEvents: 'none' }}
        >
          {truncatedName}
        </text>
      )}
      {canShowValue && (
        <text
          x={x + width / 2}
          y={y + height / 2 + nameFontSize / 2 + 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={baseColor}
          fontSize={valueFontSize}
          fillOpacity={0.9}
        >
          {displayValue} {unit.includes('capita') && '/ capita'}
        </text>
      )}
      {canShowPercentage && (
        <text
          x={x + width / 2}
          y={y + height / 2 + nameFontSize / 2 + valueFontSize + 8}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={baseColor}
          fontSize={percentageFontSize}
          fillOpacity={0.85}
        >
          {`${percentage.toFixed(1)}%`}
        </text>
      )}
    </g>
  )
}

export function BudgetTreemap({ data, primary, onNodeClick, onBreadcrumbClick, path = [], onViewDetails, onBackToMain, showViewDetails = false, showBackToMain = false, normalization }: Props) {
  const isMobile = useIsMobile()

  const payloadData = useMemo(() => {
    return data.map((node) => ({
      name: node.name,
      value: node.value,
      code: node.code,
      fill: getColor(`${primary}-${node.code}`),
    }))
  }, [data, primary])

  const handleNodeClick = (event: unknown) => {
    const target = event as { code?: string; payload?: { code?: string } }
    const code = target?.code ?? target?.payload?.code ?? null
    onNodeClick?.(code ?? null)
  }

  // On mobile, show only last 2 breadcrumb items
  const displayPath = isMobile && path.length > 2 ? path.slice(-2) : path

  return (
    <div className="w-full space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <Breadcrumb className="overflow-x-auto">
          <BreadcrumbList className="flex-nowrap">
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => onBreadcrumbClick?.(null)} className="cursor-pointer whitespace-nowrap">
                <Trans>Main Categories</Trans>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {isMobile && path.length > 2 && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <span className="text-muted-foreground">...</span>
                </BreadcrumbItem>
              </>
            )}
            {displayPath.map((item, index) => {
              const key = `${item.code}-${item.label}`
              const isClickable = !!item.code && /^[0-9.]+$/.test(item.code)
              const actualIndex = isMobile && path.length > 2 ? path.length - 2 + index : index

              return (
                <Fragment key={key}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      onClick={() => {
                        if (!isClickable) return
                        onBreadcrumbClick?.(item.code, actualIndex)
                      }}
                      className={`${isClickable ? 'cursor-pointer' : 'cursor-default'} whitespace-nowrap ${isMobile ? 'text-sm' : ''}`}
                    >
                      {isMobile && item.label && item.label.length > 20
                        ? `${item.label.slice(0, 20)}...`
                        : item.label ?? item.code}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex gap-2 flex-shrink-0">
          {showViewDetails && (
            <Button variant="outline" size="sm" onClick={onViewDetails}>
              <Trans>View Details</Trans>
            </Button>
          )}
          {showBackToMain && (
            <Button variant="outline" size="sm" onClick={onBackToMain}>
              <Trans>Back to main view</Trans>
            </Button>
          )}
        </div>
      </div>

      {payloadData.length === 0 ? (
        <div className="flex h-[600px] items-center justify-center rounded-md border border-dashed border-muted-foreground/40 p-6">
          <p className="text-sm text-muted-foreground text-center">
            <Trans>No data available for the current selection.</Trans>
          </p>
        </div>
      ) : (
        <div className="h-[600px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={payloadData}
              dataKey="value"
              nameKey="name"
              animationDuration={300}
              onClick={handleNodeClick}
              content={(props) => <CustomizedContent
                fill={props.fill}
                root={{
                  value: 0
                }}
                {...props}
                normalization={normalization}
              />}
            >
              {!isMobile && (
                <Tooltip
                  content={<CustomTooltip total={payloadData.reduce((acc, curr) => acc + curr.value, 0)} primary={primary} normalization={normalization} />}
                />
              )}
            </Treemap>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

const CustomTooltip = ({ active, payload, total, primary, normalization }: { active?: boolean, payload?: any[], total: number, primary: 'fn' | 'ec', normalization?: 'total' | 'total_euro' | 'per_capita' | 'per_capita_euro' }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = payload[0].value;
    const percentage = total > 0 ? (value / total) * 100 : 0;
    const unit = getNormalizationUnit(normalization ?? 'total')
    const currencyCode = unit.includes('EUR') ? 'EUR' : 'RON'

    return (
      <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-lg shadow-lg p-3 text-sm min-w-[250px] select-none">
        <div className="flex items-center gap-3 mb-2">
          <span
            className="inline-block w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: data.fill }}
          />
          <div>
            <p className="font-semibold text-foreground truncate">{data.name}</p>
            <p className="text-muted-foreground text-xs">{primary}:{data.code}</p>
          </div>
        </div>
        <hr className="my-2 border-border/30" />
        <div className="space-y-1.5">
          <div className="flex justify-between items-center gap-4">
            <span className="text-muted-foreground text-xs">Amount:</span>
            <div className="flex flex-col items-end">
              <span className="font-mono font-semibold text-sm">{yValueFormatter(value, currencyCode, 'compact')} {unit.includes('capita') && '/ capita'}</span>
              <span className="font-mono text-xs text-muted-foreground">{yValueFormatter(value, currencyCode, 'standard')}</span>
            </div>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-muted-foreground text-xs">Share:</span>
            <span className="font-mono font-semibold text-sm">{percentage.toFixed(2)}%</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
