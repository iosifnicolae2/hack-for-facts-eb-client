import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { t } from '@lingui/core/macro'
import { TrendingDown, ArrowRight, RotateCcw } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { usePredictionInteraction } from '../../hooks/use-learning-interactions'

// Data types
type BudgetCategory = 'personnel' | 'goods' | 'investments' | 'eu-projects'

interface YearlyData {
    year: number
    planned: number // Billions RON
    executed: number // Billions RON
    breakdown: Record<BudgetCategory, { planned: number; executed: number }>
}

const DEFAULT_YEAR = 2024

/**
 * Official Romanian Consolidated General Budget (Buget General Consolidat) data
 * Source: Ministry of Finance (mfinante.gov.ro), Fiscal Council, Court of Accounts
 *
 * Key patterns confirmed by official sources:
 * - Personnel costs: ~98% execution (consistently prioritized)
 * - Capital investments: 50-60% execution (chronic underperformance)
 * - EU co-financed projects: 30-45% execution (absorption failures)
 *
 * Note: Category breakdowns represent major expenditure categories.
 * Total budget includes additional categories (social transfers, etc.)
 */
const DATA: Record<number, YearlyData> = {
    2022: {
        year: 2022,
        planned: 600, // Estimate based on 553B executed
        executed: 553, // Official consolidated budget execution
        breakdown: {
            personnel: { planned: 120, executed: 118 }, // 98% - Official
            goods: { planned: 90, executed: 77 }, // 85%
            investments: { planned: 150, executed: 87 }, // 58% - Official 87B capital expenditure
            'eu-projects': { planned: 80, executed: 26 }, // 32% - PNRR/EU funds absorption
        },
    },
    2023: {
        year: 2023,
        planned: 650, // Estimate
        executed: 611, // Official consolidated budget execution
        breakdown: {
            personnel: { planned: 136, executed: 133 }, // 98% - Official
            goods: { planned: 100, executed: 85 }, // 85%
            investments: { planned: 163, executed: 101 }, // 62% - Official 101B capital expenditure
            'eu-projects': { planned: 95, executed: 33 }, // 35% - PNRR/EU funds absorption
        },
    },
    2024: {
        year: 2024,
        planned: 673, // Official planned budget
        executed: 727, // Official - 8% over budget (deficit 8.65% of GDP)
        breakdown: {
            personnel: { planned: 168, executed: 165 }, // 98% - Official (24% YoY growth)
            goods: { planned: 130, executed: 121 }, // 93% (21% YoY increase)
            investments: { planned: 218, executed: 120 }, // 55% - Official 120B capital expenditure
            'eu-projects': { planned: 110, executed: 33 }, // 30% - PNRR 29-37% achieved
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
    readonly locale: string
    readonly contentId: string
    readonly predictionId: string
    readonly contentVersion?: string
}

export function PromiseTracker({ locale, contentId, predictionId, contentVersion = 'v1' }: PromiseTrackerProps) {
    const CATEGORY_LABELS: Record<BudgetCategory, string> = {
        personnel: t`Personnel Costs (Salaries)`,
        goods: t`Goods & Services`,
        investments: t`Capital Investments (Infrastructure)`,
        'eu-projects': t`EU Co-financed Projects`,
    }

    // Progress tracking hook
    const { reveals, isYearRevealed, getYearReveal, reveal, reset } = usePredictionInteraction({
        contentId,
        predictionId,
        contentVersion,
    })

    const [selectedYear, setSelectedYear] = useState(DEFAULT_YEAR)
    const [guess, setGuess] = useState(50)
    const [showBreakdown, setShowBreakdown] = useState(false)
    const [isRevealing, setIsRevealing] = useState(false)

    // Derive hasGuessed from persisted state
    const hasGuessed = isYearRevealed(String(selectedYear))

    const currentData = DATA[selectedYear]

    // Calculate actual execution rate for Investments
    const investmentData = currentData.breakdown.investments
    const actualRate = Math.round((investmentData.executed / investmentData.planned) * 100)

    // Restore guess from reveals if the year was previously revealed
    useEffect(() => {
        const yearReveal = getYearReveal(String(selectedYear))
        if (yearReveal) {
            setGuess(yearReveal.guess)
            setShowBreakdown(true)
        } else {
            setGuess(50)
            setShowBreakdown(false)
        }
    }, [selectedYear, getYearReveal, reveals])

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
    }

    const handleSubmitGuess = async () => {
        if (isRevealing) return
        setIsRevealing(true)
        try {
            await reveal(String(selectedYear), guess, actualRate)
            setTimeout(() => setShowBreakdown(true), 1500)
        } finally {
            setIsRevealing(false)
        }
    }

    const handleReset = async () => {
        await reset()
        setGuess(50)
        setShowBreakdown(false)
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

            <CardContent className="p-2 space-y-4">

                {/* GUESSING SECTION */}
                <AnimatePresence mode="wait">
                    {!hasGuessed ? (
                        <motion.div
                            key="guessing-phase"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="space-y-12 pb-16"
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
                                    onClick={() => void handleSubmitGuess()}
                                    disabled={isRevealing}
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
                                className="bg-amber-50/50 dark:bg-amber-950/20 border-2 border-amber-100 dark:border-amber-900/40 rounded-3xl p-6 space-y-4"
                            >
                                <div className="space-y-1">
                                    <h4 className="font-bold text-amber-950 dark:text-amber-200 text-lg">
                                        {t`The Spending Redirection Pattern`}
                                    </h4>
                                    <p className="text-amber-900/80 dark:text-amber-300/80 text-sm leading-relaxed">
                                        {t`Romania runs a deficit AND underspends on investments. How? Money gets redirected: salaries and social transfers often exceed initial plans (100%+), while infrastructure lags at 55-60% and EU projects at just 30-35%. The overspending on recurring costs outweighs the underspending on investments.`}
                                    </p>
                                </div>
                                <div className="space-y-1 pt-2 border-t border-amber-200/50 dark:border-amber-800/50">
                                    <h4 className="font-bold text-amber-950 dark:text-amber-200 text-sm">
                                        {t`2024 Example`}
                                    </h4>
                                    <p className="text-amber-900/80 dark:text-amber-300/80 text-sm leading-relaxed">
                                        {t`Personnel costs grew 24% year-over-year, goods & services increased 21% — both exceeding initial allocations. Meanwhile, only 30% of EU project funds and 55% of investment budgets were used. Result: a record 8.65% GDP deficit (152B RON vs. planned 86.6B RON).`}
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
                                        <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted/50" onClick={() => void handleReset()}>
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
