import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { t } from '@lingui/core/macro'
import { TrendingDown, ArrowRight, RotateCcw } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

// Data types
type BudgetCategory = 'personnel' | 'goods' | 'investments' | 'eu-projects'

interface YearlyData {
    year: number
    planned: number // Billions RON
    executed: number // Billions RON
    breakdown: Record<BudgetCategory, { planned: number; executed: number }>
}

const DEFAULT_YEAR = 2024

const DATA: Record<number, YearlyData> = {
    2022: {
        year: 2022,
        planned: 100,
        executed: 72,
        breakdown: {
            personnel: { planned: 30, executed: 29.5 }, // 98%
            goods: { planned: 20, executed: 17 }, // 85%
            investments: { planned: 25, executed: 14.5 }, // 58%
            'eu-projects': { planned: 25, executed: 11 }, // 44%
        },
    },
    2023: {
        year: 2023,
        planned: 110,
        executed: 80,
        breakdown: {
            personnel: { planned: 33, executed: 32.5 },
            goods: { planned: 22, executed: 18 },
            investments: { planned: 27, executed: 16 }, // ~60%
            'eu-projects': { planned: 28, executed: 13.5 },
        },
    },
    2024: { // Projections / Partial
        year: 2024,
        planned: 120,
        executed: 85,
        breakdown: {
            personnel: { planned: 36, executed: 35.5 },
            goods: { planned: 25, executed: 20 },
            investments: { planned: 30, executed: 18 }, // 60%
            'eu-projects': { planned: 29, executed: 11.5 },
        }
    }
}



const CATEGORY_ICONS: Record<BudgetCategory, string> = {
    personnel: '👷',
    goods: '📦',
    investments: '🏗️',
    'eu-projects': '🇪🇺',
}

interface PromiseTrackerProps {
    locale: string
}

export function PromiseTracker({ locale }: PromiseTrackerProps) {
    const CATEGORY_LABELS: Record<BudgetCategory, string> = {
        personnel: t`Personnel Costs (Salaries)`,
        goods: t`Goods & Services`,
        investments: t`Capital Investments (Infrastructure)`,
        'eu-projects': t`EU Co-financed Projects`,
    }

    const [selectedYear, setSelectedYear] = useState(DEFAULT_YEAR)
    const [guess, setGuess] = useState(50)
    const [hasGuessed, setHasGuessed] = useState(false)
    const [showBreakdown, setShowBreakdown] = useState(false)

    const currentData = DATA[selectedYear]

    // Calculate actual execution rate for Investments
    const investmentData = currentData.breakdown.investments
    const actualRate = Math.round((investmentData.executed / investmentData.planned) * 100)

    // Wrapper to simplify keeping the billions logic invisible if preferred, 
    // but "compact" notation is native.
    const formatBillions = (billions: number) => {
        // 1 billion = 1,000,000,000
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'RON',
            notation: 'compact',
            maximumFractionDigits: 1
        }).format(billions * 1_000_000_000)
    }

    const handleYearChange = (yearStr: string) => {
        const year = parseInt(yearStr)
        setSelectedYear(year)
        setHasGuessed(false)
        setShowBreakdown(false)
        setGuess(50)
    }

    const handleSubmitGuess = () => {
        setHasGuessed(true)
        setTimeout(() => setShowBreakdown(true), 1500)
    }

    const getAccuracyFeedback = () => {
        const diff = Math.abs(guess - actualRate)
        if (diff < 5) return t`Spot on!`
        if (diff < 15) return t`Close enough!`
        return t`Quite a difference...`
    }

    return (
        <Card className="my-10 w-full max-w-3xl mx-auto shadow-md border-border/60 overflow-hidden">
            <CardHeader className="bg-transparent pb-0 border-b-0 pt-8 px-8 md:px-10">
                <div className="flex justify-center w-full">
                    <Tabs
                        value={selectedYear.toString()}
                        onValueChange={handleYearChange}
                        className="w-full sm:w-auto"
                    >
                        <TabsList className="grid w-full grid-cols-3 sm:w-[320px] h-12 bg-muted/40 rounded-full p-1.5 gap-1">
                            <TabsTrigger value="2022" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all text-sm font-medium">2022</TabsTrigger>
                            <TabsTrigger value="2023" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all text-sm font-medium">2023</TabsTrigger>
                            <TabsTrigger value="2024" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all text-sm font-medium">2024</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>

            <CardContent className="p-2 md:pb-16 space-y-4">

                {/* GUESSING SECTION */}
                <AnimatePresence mode="wait">
                    {!hasGuessed ? (
                        <motion.div
                            key="guessing-phase"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="space-y-12"
                        >
                            <div className="text-center space-y-4">
                                <h3 className="text-3xl font-bold text-foreground tracking-tight">
                                    {t`Make a Prediction for ${selectedYear}`}
                                </h3>
                                <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
                                    {t`The government planned to spend`} <span className="font-bold text-foreground">{formatBillions(investmentData.planned)}</span> {t`on Infrastructure. How much of that budget was actually used?`}
                                </p>
                            </div>

                            <div className="max-w-xl mx-auto bg-card border rounded-[2rem] p-10 shadow-sm hover:shadow-md transition-shadow duration-300">
                                <div className="space-y-10">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{t`Your Prediction`}</span>
                                        <span className="text-7xl font-black text-primary tabular-nums tracking-tighter">
                                            {guess}%
                                        </span>
                                    </div>

                                    <div className="px-2">
                                        <Slider
                                            value={[guess]}
                                            onValueChange={(vals) => setGuess(vals[0])}
                                            max={100}
                                            step={1}
                                            className="py-4"
                                        />
                                        <div className="flex justify-between mt-2 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
                                            <span>0%</span>
                                            <span>100%</span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleSubmitGuess}
                                    className="w-full h-14 mt-10 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] transition-all"
                                >
                                    {t`Reveal Reality`}
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result-phase"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                                className="space-y-10 p-10"
                        >
                            {/* RESULT COMPARISON CARD */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                                {/* USER GUESS */}
                                <div className="flex flex-col items-center justify-center p-10 bg-muted/20 rounded-[2rem] border border-border/40">
                                    <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-4">{t`Your Prediction`}</span>
                                    <span className="text-6xl font-black text-muted-foreground/40 tabular-nums tracking-tighter">{guess}%</span>
                                </div>

                                {/* REALITY with Animation */}
                                <div className={cn(
                                    "flex flex-col items-center justify-center p-10 rounded-[2rem] border-2 transition-all duration-1000 relative overflow-hidden",
                                    "bg-primary/5 border-primary/20"
                                )}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />

                                    <span className="text-xs text-primary font-bold uppercase tracking-widest mb-4 relative z-10">{t`Reality`}</span>

                                    <div className="relative z-10 flex flex-col items-center">
                                        <motion.span
                                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            transition={{ type: "spring", bounce: 0.4, delay: 0.1 }}
                                            className="text-7xl font-black text-primary tabular-nums tracking-tighter"
                                        >
                                            {actualRate}%
                                        </motion.span>

                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.6 }}
                                            className="mt-4"
                                        >
                                            <span className="inline-flex items-center rounded-full bg-background px-4 py-1.5 text-sm font-semibold text-foreground shadow-sm ring-1 ring-inset ring-border/60">
                                                {getAccuracyFeedback()}
                                            </span>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>

                            {/* MAIN INSIGHT */}
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                transition={{ delay: 0.5 }}
                                    className="bg-amber-50/50 dark:bg-amber-950/20 border-2 border-amber-100 dark:border-amber-900/40 rounded-3xl p-6 flex items-start gap-4"
                            >
                                    <div className="space-y-1">
                                        <div className="h-10 flex items-center">
                                            <h4 className="font-bold text-amber-950 dark:text-amber-200 text-lg leading-none">
                                                {t`The Implementation Gap`}
                                            </h4>
                                        </div>
                                        <p className="text-amber-900/80 dark:text-amber-300/80 text-sm leading-relaxed">
                                        {t`While personnel costs are usually paid in full (~98%), infrastructure investments consistently lag behind planning (around 50-60%). This means promises for new roads and hospitals are technically "funded" but practically delayed.`}
                                    </p>
                                </div>
                            </motion.div>

                            {/* FULL BREAKDOWN */}
                            {showBreakdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="pt-8"
                                >
                                    <h4 className="font-bold text-lg mb-8 flex items-center gap-3 text-foreground/80">
                                        <TrendingDown className="w-5 h-5" />
                                        {t`Detailed Spending Breakdown (${selectedYear})`}
                                    </h4>

                                    <div className="grid gap-6">
                                        {(Object.entries(currentData.breakdown) as [BudgetCategory, { planned: number; executed: number }][]).map(([key, data], idx) => {
                                            const rate = Math.round((data.executed / data.planned) * 100)
                                            const isLow = rate < 70
                                            const isHigh = rate > 90

                                            return (
                                                <motion.div
                                                    key={key}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    className="group"
                                                >
                                                    <div className="flex justify-between items-center mb-2.5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-muted/50 group-hover:bg-muted transition-colors flex items-center justify-center text-xl shadow-sm">
                                                                {CATEGORY_ICONS[key]}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-foreground">{CATEGORY_LABELS[key]}</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {t`Planned`}: {formatBillions(data.planned)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className={cn(
                                                                "font-black font-mono text-xl",
                                                                isLow ? "text-rose-600 dark:text-rose-400" : isHigh ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                                                            )}>
                                                                {rate}%
                                                            </div>
                                                            <div className="text-xs font-medium text-muted-foreground/70">
                                                                {formatBillions(data.executed)} {t`spent`}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="h-4 w-full bg-muted/30 rounded-full overflow-hidden p-0.5">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${rate}%` }}
                                                            transition={{ duration: 1.2, delay: idx * 0.1 + 0.5, type: "spring", bounce: 0 }}
                                                            className={cn(
                                                                "h-full rounded-full shadow-sm",
                                                                isLow ? "bg-rose-500" : isHigh ? "bg-emerald-500" : "bg-amber-500"
                                                            )}
                                                        />
                                                    </div>
                                                </motion.div>
                                            )
                                        })}
                                    </div>

                                    <div className="mt-12 pt-8 border-t flex justify-center">
                                        <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted/50" onClick={() => handleYearChange(selectedYear.toString())}>
                                            <RotateCcw className="w-4 h-4 mr-2" />
                                            {t`Reset Prediction`}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    )
}
