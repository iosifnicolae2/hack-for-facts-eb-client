import { type FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts'
import { Trans } from '@lingui/react/macro'
import { motion, useAnimationControls } from 'motion/react'
import { ArrowLeft, LineChart } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

import { yValueFormatter } from '@/components/charts/components/chart-renderer/utils'
import { Button } from '@/components/ui/button'
import type { TreemapInput, ExcludedItemsSummary } from './budget-transform'
import { FilteredSpendingInfo } from './FilteredSpendingInfo'
import { useIsMobile } from '@/hooks/use-mobile'
import { getNormalizationUnit } from '@/lib/utils'
import type { AnalyticsFilterType } from '@/schemas/charts'
import { useTreemapChartLink } from './useTreemapChartLink'
import { buildTreemapChartLink } from '@/lib/chart-links'

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

const adjustColorBrightness = (hexColor: string | undefined, percentage: number) => {
  if (!hexColor || typeof hexColor !== 'string') {
    return COLORS[0]
  }

  const hexPattern = /^#?[0-9a-fA-F]{3,6}$/
  if (!hexPattern.test(hexColor)) {
    return hexColor
  }

  const normalizedHex = hexColor.replace('#', '')
  const isShort = normalizedHex.length === 3
  const expandedHex = isShort
    ? normalizedHex.split('').map((char) => char + char).join('')
    : normalizedHex

  const numericValue = parseInt(expandedHex, 16)
  const red = (numericValue >> 16) & 0xff
  const green = (numericValue >> 8) & 0xff
  const blue = numericValue & 0xff

  const adjustChannel = (channel: number) => {
    const delta = (percentage / 100) * 255
    return Math.max(0, Math.min(255, channel + delta))
  }

  const adjustedRed = Math.round(adjustChannel(red))
  const adjustedGreen = Math.round(adjustChannel(green))
  const adjustedBlue = Math.round(adjustChannel(blue))

  const toHex = (value: number) => value.toString(16).padStart(2, '0')
  return `#${toHex(adjustedRed)}${toHex(adjustedGreen)}${toHex(adjustedBlue)}`
}

type BreadcrumbEntry = { code: string; label: string; type?: 'fn' | 'ec' }

type Props = {
  data: TreemapInput[]
  primary: 'fn' | 'ec'
  onNodeClick?: (code: string | null) => void
  onBreadcrumbClick?: (code: string | null, index?: number) => void
  path?: BreadcrumbEntry[]
  onViewDetails?: () => void
  showViewDetails?: boolean
  normalization?: 'total' | 'total_euro' | 'per_capita' | 'per_capita_euro'
  excludedItemsSummary?: ExcludedItemsSummary
  chartFilterInput?: AnalyticsFilterType // Optional filter input for the chart link
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
  // Recharts passes the original datum under `payload`. We use its fill for stable coloring.
  payload?: { fill?: string; code?: string; name?: string; value?: number }
}> = (props) => {
  const { name, value, depth, x, y, width, height, fill, root, normalization } = props
  const hasAnimatedInRef = useRef(false)
  const [isHovered, setIsHovered] = useState(false)
  const bounceControls = useAnimationControls()
  const randomDelayRef = useRef(Math.random() * 0.15)
  const textScale = isHovered ? 1.1 : 1

  useEffect(() => {
    hasAnimatedInRef.current = true
  }, [])

  if (!Number.isFinite(value) || depth === 0) {
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

  const rectTransition = {
    type: 'spring',
    damping: 28,
    stiffness: 260,
    mass: 0.8,
  } as const

  const textTransition = {
    type: 'spring',
    damping: 15,
    stiffness: 150,
    mass: 1,
    restDelta: 0.001,
  } as const

  const hoverTransition = {
    type: 'spring',
    damping: 18,
    stiffness: 280,
    mass: 0.7,
  } as const

  const initialRectState = hasAnimatedInRef.current
    ? undefined
    : {
      opacity: 0,
      x: x + (width / 2),
      y: y + (height / 2),
      width: 0,
      height: 0,
    }

  // Keep original color logic; rely on Recharts-provided `fill`, but if payload carries a fill use it.
  const payloadFill = (props as { payload?: { fill?: string } }).payload?.fill
  const defaultFill = typeof fill === 'string' && fill.length > 0
    ? fill
    : (typeof payloadFill === 'string' && payloadFill.length > 0 ? payloadFill : COLORS[0])

  useEffect(() => {
    void bounceControls.start({
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', damping: 30, stiffness: 220, mass: 0.9 },
    })
  }, [bounceControls])

  const triggerBounce = () => {
    void bounceControls.start({
      scale: [1, 0.94, 1.04, 1],
      transition: {
        duration: 0.42,
        times: [0, 0.45, 0.75, 1],
        ease: 'easeInOut',
      },
    })
  }

  return (
    <motion.g
      initial={hasAnimatedInRef.current ? undefined : { opacity: 0, scale: 0.94 }}
      animate={bounceControls}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      onClick={triggerBounce}
    >
      <motion.rect
        animate={{
          x,
          y,
          width,
          height,
          opacity: 1,
          fill: isHovered ? adjustColorBrightness(defaultFill, 12) : defaultFill,
        }}
        initial={initialRectState}
        transition={rectTransition}
        fill={defaultFill}
        stroke="#fff"
        strokeWidth={2 / (depth + 1e-5)}
        strokeOpacity={0.5}
      />
      {canShowName && (
        <motion.text
          animate={{
            x: x + width / 2,
            y: canShowValue ? y + height / 2 - valueFontSize / 2 : y + height / 2,
            opacity: 1,
            scale: textScale,
          }}
          initial={hasAnimatedInRef.current ? { opacity: 0.2 } : {
            opacity: 0,
            x: x + width / 2 + 20,
            y: (canShowValue ? y + height / 2 - valueFontSize / 2 : y + height / 2) - 6,
            scale: 0.3,
          }}
          transition={hasAnimatedInRef.current ? hoverTransition : {
            ...textTransition,
            delay: randomDelayRef.current,
          }}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={baseColor}
          fontSize={nameFontSize}
          fontWeight={500}
          style={{ pointerEvents: 'none' }}
        >
          {truncatedName}
        </motion.text>
      )}
      {canShowValue && (
        <motion.text
          animate={{
            x: x + width / 2,
            y: y + height / 2 + nameFontSize / 2 + 4,
            opacity: 1,
            scale: textScale,
          }}
          initial={hasAnimatedInRef.current ? { opacity: 0.2 } : {
            opacity: 0,
            x: x + width / 2 + 15,
            y: y + height / 2 + nameFontSize / 2 + 4 - 5,
            scale: 0.25,
          }}
          transition={hasAnimatedInRef.current ? hoverTransition : {
            ...textTransition,
            delay: randomDelayRef.current + 0.03,
          }}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={baseColor}
          fontSize={valueFontSize}
          fillOpacity={0.9}
          style={{ pointerEvents: 'none' }}
        >
          {displayValue} {unit.includes('capita') && '/ capita'}
        </motion.text>
      )}
      {canShowPercentage && (
        <motion.text
          animate={{
            x: x + width / 2,
            y: y + height / 2 + nameFontSize / 2 + valueFontSize + 8,
            opacity: 1,
            scale: textScale,
          }}
          initial={hasAnimatedInRef.current ? { opacity: 0.2 } : {
            opacity: 0,
            x: x + width / 2 + 12,
            y: y + height / 2 + nameFontSize / 2 + valueFontSize + 8 - 4,
            scale: 0.2,
          }}
          transition={hasAnimatedInRef.current ? hoverTransition : {
            ...textTransition,
            delay: randomDelayRef.current + 0.06,
          }}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={baseColor}
          fontSize={percentageFontSize}
          fillOpacity={0.85}
          style={{ pointerEvents: 'none' }}
        >
          {`${percentage.toFixed(1)}%`}
        </motion.text>
      )}
    </motion.g>
  )
}

export function BudgetTreemap({ data, primary, onNodeClick, onBreadcrumbClick, path = [], onViewDetails, showViewDetails = false, normalization, excludedItemsSummary, chartFilterInput: filterInput }: Props) {
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  const payloadData = useMemo(() => {
    return data.map((node) => ({
      name: node.name,
      value: node.value,
      code: node.code,
      fill: getColor(`${primary}-${node.code}`),
    }))
  }, [data, primary])

  // Generate chart link configuration
  const { hasChartLink, seriesConfigs, chartTitle } = useTreemapChartLink({
    data,
    path,
    primary,
    filterInput,
  })

  const handleBackClick = () => {
    if (!onBreadcrumbClick) return

    if (path.length > 1) {
      const parentIndex = path.length - 2
      const parent = path[parentIndex]
      onBreadcrumbClick(parent.code, parentIndex)
    } else if (path.length === 1) {
      onBreadcrumbClick(null)
    }
  }

  const handleViewAsChart = () => {
    if (!hasChartLink || seriesConfigs.length === 0) return

    const chartLink = buildTreemapChartLink({
      title: chartTitle,
      seriesConfigs,
      normalization,
    })

    navigate({
      to: chartLink.to,
      params: chartLink.params,
      search: chartLink.search,
    })
  }

  const totalValue = useMemo(() => payloadData.reduce((acc, curr) => acc + (Number.isFinite(curr.value) ? curr.value : 0), 0), [payloadData])
  const unit = getNormalizationUnit(normalization ?? 'total')
  const currencyCode: 'RON' | 'EUR' = unit.includes('EUR') ? 'EUR' : 'RON'

  // Memoize root object to prevent unnecessary re-renders
  const rootValue = useMemo(() => ({ value: totalValue }), [totalValue])

  const handleNodeClick = (event: unknown) => {
    const target = event as { code?: string; payload?: { code?: string } }
    const code = target?.code ?? target?.payload?.code ?? null
    onNodeClick?.(code ?? null)
  }

  // Memoize content renderer to prevent unnecessary re-renders in Recharts
  const renderContent = useCallback((props: any) => (
    <CustomizedContent
      {...props}
      fill={props?.payload?.fill ?? props.fill}
      root={rootValue}
      normalization={normalization}
    />
  ), [rootValue, normalization])

  const memoizedTooltip = useMemo(() => (
    <CustomTooltip
      total={totalValue}
      primary={primary}
      normalization={normalization}
    />
  ), [totalValue, primary, normalization])

  // On mobile, show only last 2 breadcrumb items
  const displayPath = isMobile && path.length > 2 ? path.slice(-2) : path

  return (
    <div className="w-full space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="overflow-x-auto max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-8rem)] md:max-w-[calc(100vw-12rem)]">
          <div className="flex items-center w-fit">
            <div
              onClick={() => onBreadcrumbClick?.(null)}
              className="group relative h-6 pl-4 pr-6 mr-1 flex items-center cursor-pointer transition-all duration-200"
            >
              <div
                className="absolute inset-0 bg-foreground transition-colors duration-200 border-y-2 border-background/20"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 0 0)'
                }}
              />
              <span className="relative z-10 whitespace-nowrap text-sm font-medium text-background">
                <Trans>Main Categories</Trans>
              </span>
            </div>
            {isMobile && path.length > 2 && (
              <div className="relative h-6 pl-5 pr-6 mr-1 flex items-center -ml-[12px]">
                <div
                  className="absolute inset-0 bg-foreground/70 border-y-2 rounded-md border-background/20"
                  style={{
                    clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%)'
                  }}
                />
                <span className="relative z-10 text-sm font-medium text-background/80">...</span>
              </div>
            )}
            {displayPath.map((item, index) => {
              const key = `${item.code}-${item.label}`
              const actualIndex = isMobile && path.length > 2 ? path.length - 2 + index : index
              const isLastCrumb = actualIndex === (path.length - 1)
              const isClickable = !!item.code && /^[0-9.]+$/.test(item.code) && !isLastCrumb
              const isLast = index === displayPath.length - 1

              // Use the breadcrumb's originating type (pre/post pivot) to derive color.
              const crumbType = item.type ?? primary
              const itemColor = getColor(`${crumbType}-${item.code}`)

              return (
                <div
                  key={key}
                  onClick={() => {
                    if (!isClickable) return
                    onBreadcrumbClick?.(item.code, actualIndex)
                  }}
                  className={`group relative h-6 pl-5 pr-6 mr-1 flex items-center -ml-[12px] transition-all duration-200 ${isClickable ? 'cursor-pointer' : 'cursor-default'
                    }`}
                >
                  <div
                    className={`absolute inset-0 transition-all duration-200 shadow-md rounded-md border-y-2 border-background/20`}
                    style={{
                      backgroundColor: itemColor,
                      clipPath: isLast
                        ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 12px 50%)'
                        : 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%)'
                    }}
                  />
                  <span className="relative z-10 whitespace-nowrap text-sm font-medium text-background">
                    {isMobile && item.label && item.label.length > 20
                      ? `${item.label.slice(0, 20)}...`
                      : item.label ?? item.code}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          {showViewDetails && (
            <Button variant="outline" size="sm" onClick={onViewDetails}>
              <Trans>View Details</Trans>
            </Button>
          )}
        </div>
      </div>

      {payloadData.length === 0 ? (
        <div className="relative h-[600px] w-full flex items-center justify-center rounded-md border border-dashed border-muted-foreground/40 p-6">
          <p className="text-sm text-muted-foreground text-center">
            <Trans>No data available for the current selection.</Trans>
          </p>
        </div>
      ) : (
        <>
          <div className="relative h-[600px] w-full">
            {path.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-6 sm:right-2 top-2 z-10 h-8 w-8 rounded-md bg-black text-white transition-colors"
                onClick={handleBackClick}
                aria-label="Go back"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={payloadData}
                dataKey="value"
                nameKey="name"
                isAnimationActive={false}
                onClick={handleNodeClick}
                content={renderContent}
              >
                {!isMobile && (
                  <Tooltip
                    animationEasing='ease-in-out'
                    animationDuration={500}
                    offset={50}
                    allowEscapeViewBox={{ x: false, y: false }}
                    wrapperStyle={{
                      // Keep wrapper visible to allow CSS fade on content
                      visibility: 'visible',
                      pointerEvents: 'none',
                      transition: 'transform 180ms ease-in-out',
                      willChange: 'transform',
                    }}
                    content={memoizedTooltip}
                  />
                )}
              </Treemap>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col items-center gap-2 text-center mt-4">
            <div className="text-sm sm:text-xl font-semibold">
              <Trans>Total</Trans>: <span className="font-bold">{yValueFormatter(totalValue, currencyCode, 'compact')}</span> {unit.includes('capita') && '/ capita'}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-mono">{yValueFormatter(totalValue, currencyCode, 'standard')}</span> {unit.includes('capita') && '/ capita'}
            </div>
            {excludedItemsSummary && excludedItemsSummary.totalExcluded > 0 && (
              <FilteredSpendingInfo
                excludedItemsSummary={excludedItemsSummary}
                currencyCode={currencyCode}
                perCapita={unit.includes('capita')}
              />
            )}
            {hasChartLink && (
              <Button variant="outline" size="sm" onClick={handleViewAsChart} className="gap-2 ml-auto mr-2 -mb-4">
                <LineChart className="w-4 h-4" />
                <Trans>View as Chart</Trans>
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

const CustomTooltip = ({ active, payload, total, primary, normalization }: {
  active?: boolean,
  payload?: any[],
  total: number,
  primary: 'fn' | 'ec',
  normalization?: 'total' | 'total_euro' | 'per_capita' | 'per_capita_euro',
}) => {
  const lastTooltipDataRef = useRef<{
    name: string
    code: string
    fill: string
    value: number
  } | null>(null)

  const isVisible = !!active && !!payload && payload.length > 0

  // Update ref when new valid data is available
  if (isVisible && payload![0].payload) {
    lastTooltipDataRef.current = {
      name: payload![0].payload.name,
      code: payload![0].payload.code,
      fill: payload![0].payload.fill,
      value: payload![0].value,
    }
  }

  // Use current data if visible, otherwise fall back to cached data
  const data = isVisible ? payload![0].payload : lastTooltipDataRef.current
  const value = isVisible ? payload![0].value : (lastTooltipDataRef.current?.value ?? 0)
  const percentage = total > 0 ? (value / total) * 100 : 0
  const unit = getNormalizationUnit(normalization ?? 'total')
  const currencyCode = unit.includes('EUR') ? 'EUR' : 'RON'


  return (
    <div className="relative">
      <div
        className={
          `origin-center` +
          `transition-transform duration-300 ease-in-out ` +
          `${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-1'}`
        }
      >
        <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-lg shadow-lg p-3 text-sm min-w-[250px] select-none">
          <div className="flex items-center gap-3 mb-2 w-full">
            <span
              className="inline-block w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: data?.fill }}
            />
            <div className="max-w-[400px]">
              <p className="font-semibold text-foreground break-words whitespace-pre-wrap">{data?.name}</p>
              <p className="text-muted-foreground text-xs truncate">{primary}:{data?.code}</p>
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
      </div>
    </div>
  )
}
