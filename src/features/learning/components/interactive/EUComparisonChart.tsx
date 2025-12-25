import { useMemo } from 'react'
import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'
import { t } from '@lingui/core/macro'
import { Lightbulb } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ComparisonItem {
    id: string
    label: string
    value: number
    flag?: string
    isHighlighted?: boolean
}

interface InsightData {
    readonly title: string
    readonly content: string
    readonly revenue?: number
    readonly spending?: number
}

interface EUComparisonChartProps {
    title?: string
    items: ReadonlyArray<ComparisonItem>
    unit?: string
    averageValue?: number
    averageLabel?: string
    highlightLabel?: string
    insight?: InsightData
}

function InsightBox({ insight, inView }: { insight: InsightData; inView: boolean }) {
    const hasGap = insight.revenue !== undefined && insight.spending !== undefined
    const gap = hasGap ? insight.spending! - insight.revenue! : 0

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="mt-8 p-6 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/50"
        >
            <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30 shrink-0">
                    <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                        {insight.title}
                    </h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                        {insight.content}
                    </p>

                    {hasGap && (
                        <div className="flex flex-wrap items-center gap-4 md:gap-6 pt-4 border-t border-amber-200/50 dark:border-amber-800/50">
                            <div className="text-center">
                                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
                                    {t`Revenue`}
                                </div>
                                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                                    {insight.revenue}%
                                </div>
                            </div>
                            <div className="flex items-center gap-4 md:gap-6">
                                <div className="text-2xl font-black text-zinc-300 dark:text-zinc-600">←</div>
                                <div className="text-center">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
                                        {t`Gap`}
                                    </div>
                                    <div className="text-xl font-black text-red-600 dark:text-red-400 tabular-nums">
                                        {gap.toFixed(1)}%
                                    </div>
                                </div>
                                <div className="text-2xl font-black text-zinc-300 dark:text-zinc-600">→</div>
                            </div>
                            <div className="text-center">
                                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
                                    {t`Spending`}
                                </div>
                                <div className="text-xl font-black text-zinc-900 dark:text-zinc-100 tabular-nums">
                                    {insight.spending}%
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

export function EUComparisonChart({
    title = t`Revenue as % of GDP: EU Comparison`,
    items,
    unit = '%',
    averageValue,
    averageLabel = t`EU Average`,
    highlightLabel = t`One of the lowest`,
    insight,
}: Readonly<EUComparisonChartProps>) {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.8,
    })

    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => b.value - a.value)
    }, [items])

    const maxValue = Math.max(...items.map(i => i.value), averageValue || 0) * 1.1

    return (
        <div ref={ref} className="w-full max-w-3xl mx-auto py-8">
            <Card className="p-4 md:p-10 rounded-[3rem] bg-zinc-50 border-none shadow-sm relative overflow-hidden">

                {/* Header */}
                <div className="mb-10 text-center md:text-left">
                    <h3 className="text-2xl font-black text-zinc-900 tracking-tight">{title}</h3>
                </div>

                {/* Chart Container */}
                <div className="relative space-y-3">

                    {/* Average Line */}
                    {averageValue && (
                        <div
                            className="absolute -top-3 bottom-0 border-l-2 border-dashed border-zinc-300 z-10 pointer-events-none"
                            style={{ left: `${((averageValue / maxValue) * 100)}%` }}
                        >
                            <div className={cn(
                                "absolute top-0 -translate-y-full pb-2 text-[10px] uppercase font-black text-zinc-400 whitespace-nowrap",
                                (averageValue / maxValue) > 0.75 ? "right-2 text-right" : "left-0 -translate-x-1/2 text-center"
                            )}>
                                {averageLabel} ({averageValue}{unit})
                            </div>
                        </div>
                    )}

                    {sortedItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ width: 0, opacity: 0 }}
                            animate={inView ? { width: "100%", opacity: 1 } : { width: 0, opacity: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
                            className="relative z-10 group"
                        >
                            <div className="flex items-center gap-3 md:gap-4">
                                {/* Label */}
                                <div className="absolute left-4 z-10 w-28 md:w-36 text-left shrink-0">
                                    <span className={cn(
                                        "text-sm font-bold truncate block",
                                        item.isHighlighted ? "text-zinc-100" : "text-zinc-500"
                                    )}>
                                        {item.flag && <span className="mr-2">{item.flag}</span>}
                                        {item.label}
                                    </span>
                                </div>

                                {/* Bar */}
                                <div className="flex-1 h-8 md:h-10 bg-zinc-50 rounded-r-lg relative flex items-center">
                                    <motion.div
                                        className={cn(
                                            "h-full rounded-r-lg relative flex items-center justify-end px-2 transition-colors duration-200",
                                            item.isHighlighted
                                                ? "bg-red-500"
                                                : "bg-zinc-200 group-hover:bg-zinc-300"
                                        )}
                                        initial={{ width: 0 }}
                                        animate={inView ? { width: `${(item.value / maxValue) * 100}%` } : { width: 0 }}
                                        transition={{ delay: index * 0.1, duration: 0.8, ease: "circOut" }}
                                    >
                                        <span className={cn(
                                            "text-sm font-black relative z-10",
                                            item.isHighlighted ? "text-white" : "text-zinc-600"
                                        )}>
                                            {item.value}{unit}
                                        </span>
                                    </motion.div>

                                    {/* Annotation for Highlighted Item */}
                                    {item.isHighlighted && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                                            transition={{ delay: 1.5 }}
                                            className="absolute -right-4 hidden md:flex items-center gap-1.5 whitespace-nowrap"
                                        >
                                            <span className="text-red-500 font-bold text-xs uppercase tracking-wide">← {highlightLabel}</span>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Insight Box */}
                {insight && <InsightBox insight={insight} inView={inView} />}

                {/* Footer info */}
                <div className="mt-10 pt-6 border-t border-zinc-100/50 dark:border-zinc-800/50 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                        {t`Data: Eurostat 2024 (Provisional)`}
                    </p>
                </div>

                {/* Subtle background decoration to match DeficitVisual */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-red-400/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            </Card>
        </div>
    )
}
