import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useSpring, useTransform, Variants } from 'framer-motion'
import { ArrowRight, Calculator, Check, RefreshCcw, TrendingDown, Wallet, Stethoscope, Landmark, ShieldCheck } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useSalaryCalculatorInteraction } from '../../hooks/interactions/use-salary-calculator-interaction'
import type { LearningSalaryCalculatorStep } from '../../types'

// -----------------------------------------------------------------------------
// TYPES & CONSTANTS
// -----------------------------------------------------------------------------

type SalaryTaxCalculatorProps = {
  readonly contentId: string
  readonly calculatorId: string
  readonly contentVersion?: string
}

type CalculationResult = {
  gross: number
  cas: number // 25% Pension
  cass: number // 10% Health
  taxBase: number
  incomeTax: number // 10%
  net: number
  cam: number // 2.25% Employer
  employerTotal: number
}

const DEFAULT_GROSS = 5000

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

function calculateSalary(gross: number): CalculationResult {
  const cas = Math.round(gross * 0.25)
  const cass = Math.round(gross * 0.10)
  const taxBase = gross - cas - cass
  const incomeTax = Math.max(0, Math.round(taxBase * 0.10))
  const net = gross - cas - cass - incomeTax

  const cam = Math.round(gross * 0.0225)
  const employerTotal = gross + cam

  return { gross, cas, cass, taxBase, incomeTax, net, cam, employerTotal }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    maximumFractionDigits: 0,
  }).format(amount)
}

// -----------------------------------------------------------------------------
// SUB-COMPONENTS
// -----------------------------------------------------------------------------

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 })
  const display = useTransform(spring, (current) => formatCurrency(Math.floor(current)))

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  return <motion.span className="tabular-nums">{display}</motion.span>
}

function RowBreakdown({
  label,
  value,
  calculation,
  icon: Icon,
  colorClass,
  delay = 0,
  isLast = false,
}: {
  label: string
  value: string
  calculation: string
  icon: React.ComponentType<{ className?: string }>
  colorClass: string
  delay?: number
  isLast?: boolean
}) {
  // Extract color for the indicator from colorClass (e.g., 'text-amber-600' -> 'amber')
  const indicatorColor = colorClass.match(/text-([a-z]+)-[0-9]+/)?.[1] || 'zinc'

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={cn(
        "flex items-center justify-between p-6 transition-colors",
        !isLast && "border-b border-zinc-100 dark:border-zinc-800/40"
      )}
    >
      <div className="flex items-center gap-4 text-left">
        <div className={cn("p-2.5 rounded-xl shadow-sm", colorClass.replace('text-', 'bg-').replace(/[0-9]+/, '500/10'), colorClass)}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[13px] font-black tracking-tight text-zinc-900 dark:text-zinc-100">{label}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">{calculation}</div>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div className="text-lg font-black tracking-tighter tabular-nums text-zinc-900 dark:text-zinc-50">
          {value}
        </div>
        <div className={cn("h-1 w-12 rounded-full mt-0.5", `bg-${indicatorColor}-500/40`)} />
      </div>
    </motion.div>
  )
}

function InsightPill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-black tracking-tight border", className)}
    >
      {children}
    </motion.div>
  )
}

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------

export function SalaryTaxCalculator({ contentId, calculatorId, contentVersion }: SalaryTaxCalculatorProps) {
  const [step, setStep] = useState<LearningSalaryCalculatorStep>('INPUT')
  const [grossInput, setGrossInput] = useState(DEFAULT_GROSS.toString())
  const [userGuess, setUserGuess] = useState<number>(0)
  const hasRestoredState = useRef(false)

  // Persistence hook
  const { savedState, save, reset } = useSalaryCalculatorInteraction({
    contentId,
    calculatorId,
    contentVersion,
  })

  // Restore state from persistence on mount
  useEffect(() => {
    if (savedState && !hasRestoredState.current) {
      hasRestoredState.current = true
      setGrossInput(savedState.gross.toString())
      setUserGuess(savedState.userGuess)
      setStep(savedState.step)
    }
  }, [savedState])

  // Derived state
  const gross = parseInt(grossInput) || 0
  const result = useMemo(() => calculateSalary(gross), [gross])
  const maxSlider = Math.ceil(gross * 1.1)

  // Handlers
  const handleStartGuessing = async () => {
    if (gross > 0) {
      const guess = Math.round(gross * 0.7)
      setUserGuess(guess)
      setStep('GUESS')
      await save(gross, guess, 'GUESS')
    }
  }

  const handleReveal = async () => {
    setStep('REVEAL')
    await save(gross, userGuess, 'REVEAL')
  }

  const handleReset = async () => {
    setStep('INPUT')
    setGrossInput(DEFAULT_GROSS.toString())
    setUserGuess(0)
    hasRestoredState.current = false
    await reset()
  }

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } }
  }

  return (
    <div className="w-full max-w-4xl mx-auto mb-16 font-sans">
      <AnimatePresence mode="wait">

        {/* STEP 1: INPUT */}
        {step === 'INPUT' && (
          <motion.div
            key="input"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="p-10 md:p-16 rounded-[3rem] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-lg overflow-hidden relative border-none">
              <div className="relative z-10 flex flex-col items-center text-center space-y-12">
                <div className="space-y-6 max-w-xl">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-2 shadow-inner"
                  >
                    <Calculator className="w-10 h-10" />
                  </motion.div>
                  <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-900 dark:text-white mt-6 leading-[0.95]">
                    What's your <span className="text-indigo-600 dark:text-indigo-400 italic">gross</span> salary?
                  </h2>
                  <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                    Ever wondered where your money actually goes?
                    <br className="hidden md:block" /> Start by entering your monthly Gross (Brut) income.
                  </p>
                </div>

                <div className="w-full max-w-md space-y-6">
                  <div className="relative flex items-center group transition-all duration-500">
                    <span className="absolute left-8 text-indigo-300 dark:text-indigo-800 font-black text-2xl pointer-events-none group-focus-within:text-indigo-500 transition-colors">RON</span>
                    <Input
                      type="number"
                      value={grossInput}
                      onChange={(e) => setGrossInput(e.target.value)}
                      className="h-24 pl-24 pr-8 text-4xl md:text-5xl font-black bg-zinc-50 dark:bg-zinc-900/50 border-4 border-zinc-100 dark:border-zinc-800 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-[2rem] text-center shadow-lg transition-all focus:ring-0"
                      placeholder="0"
                    />
                  </div>
                  <Button
                    onClick={handleStartGuessing}
                    className="w-full h-20 rounded-[1.8rem] text-2xl font-black bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-black dark:hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                    disabled={gross <= 0}
                  >
                    Start Analysis <ArrowRight className="ml-2 w-7 h-7" />
                  </Button>
                </div>
              </div>

              {/* Decorative artifacts */}
              <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-100/30 dark:bg-indigo-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[20rem] h-[20rem] bg-emerald-100/20 dark:bg-emerald-500/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />
            </Card>
          </motion.div>
        )}

        {/* STEP 2: GUESS */}
        {step === 'GUESS' && (
          <motion.div
            key="guess"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="p-10 md:p-20 rounded-[3.5rem] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white shadow-3xl overflow-hidden relative border-none transition-colors duration-500">
              <div className="relative z-10 flex flex-col items-center text-center space-y-14">
                <div className="space-y-6">
                  <div className="text-zinc-400 dark:text-zinc-500 text-sm font-black uppercase tracking-[0.3em]">Phase 02</div>
                  <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none text-zinc-900 dark:text-zinc-100 mt-6">
                    How much stays <br /><span className="text-emerald-500 dark:text-emerald-400">in your wallet?</span>
                  </h2>
                  <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium max-w-sm mx-auto leading-relaxed">
                    If you earn <strong>{formatCurrency(gross)}</strong> brut, drag the slider to your expected net home pay.
                  </p>
                </div>

                <div className="w-full max-w-lg space-y-12">
                  <div className="space-y-6">
                    <div className="flex flex-col items-center">
                      <span className="text-7xl md:text-8xl font-black tracking-tighter text-emerald-500 dark:text-emerald-400 transition-all">
                        <AnimatedNumber value={userGuess} />
                      </span>
                      <div className="mt-2 text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-600 block">YOUR PREDICTION</div>
                    </div>

                    <div className="px-4">
                      <Slider
                        value={[userGuess]}
                        onValueChange={(vals) => setUserGuess(vals[0])}
                        onValueCommit={(vals) => {
                          void save(gross, vals[0], 'GUESS')
                        }}
                        max={maxSlider}
                        step={10}
                        className="py-6 scale-110 md:scale-125"
                      />
                    </div>

                    <div className="flex justify-between text-[11px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-widest px-2">
                      <span>Minimum Pay</span>
                      <span className="text-zinc-500 dark:text-zinc-500">Gross: {formatCurrency(gross)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleReveal}
                    className="w-full h-24 rounded-[2rem] text-2xl font-black bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-black dark:hover:bg-zinc-100 hover:scale-[1.03] active:scale-[0.97] transition-all shadow-xl group"
                  >
                    Lock In Prediction <Check className="ml-3 w-8 h-8 group-hover:scale-110 transition-transform" />
                  </Button>
                </div>
              </div>

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.08),transparent)] pointer-events-none" />
            </Card>
          </motion.div>
        )}

        {/* STEP 3: REVEAL */}
        {step === 'REVEAL' && (
          <motion.div
            key="reveal"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="rounded-[4rem] overflow-hidden border-none shadow-3xl bg-white dark:bg-zinc-950 transition-colors duration-500">

              {/* Analysis Header */}
              <div className="pt-0 pb-8 md:pt-2 md:pb-10 mx-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-b-[3.5rem] text-center relative overflow-hidden transition-colors duration-500">
                <div className="relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex flex-col items-center mb-6"
                  >
                    <div className="px-5 py-1.5 rounded-full bg-zinc-200/40 dark:bg-zinc-800/40 backdrop-blur-md text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em] border border-zinc-300/20 dark:border-zinc-700/20 my-2">
                      Your guess: {formatCurrency(userGuess)}
                    </div>
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Net Monthly Income</div>
                  </motion.div>

                  <h2 className="text-[4.5rem] md:text-[6rem] font-[1000] text-zinc-950 dark:text-white tracking-[-0.04em] mb-6 mt-6 leading-none drop-shadow-sm">
                    <AnimatedNumber value={result.net} />
                  </h2>

                  <div className="flex flex-wrap justify-center gap-2.5">
                    <InsightPill className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 py-2">
                      <Wallet className="w-3.5 h-3.5" /> This is yours
                    </InsightPill>
                    <InsightPill className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 py-2">
                      <TrendingDown className="w-3.5 h-3.5" /> State takes {Math.round((result.gross - result.net) / result.gross * 100)}%
                    </InsightPill>
                  </div>
                </div>

                {/* Visual atmosphere - refined gradient */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.04),transparent)] pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(16,185,129,0.04),transparent)] pointer-events-none" />
              </div>

              {/* Integrated Content */}
              <div className="p-8 md:p-12 max-w-2xl mx-auto space-y-12">

                {/* Single Breakdown Block */}
                <div className="rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800/60 overflow-hidden bg-zinc-50/30 dark:bg-zinc-950/30">
                  <RowBreakdown
                    label="Monthly Gross Income"
                    value={formatCurrency(result.gross)}
                    calculation="Base Amount (100%)"
                    icon={Landmark}
                    colorClass="text-zinc-600 dark:text-zinc-400"
                  />

                  <RowBreakdown
                    label="Pension (CAS)"
                    value={`-${formatCurrency(result.cas)}`}
                    calculation={`${formatCurrency(result.gross)} × 25%`}
                    icon={ShieldCheck}
                    colorClass="text-amber-600 dark:text-amber-400"
                    delay={0.1}
                  />

                  <RowBreakdown
                    label="Health (CASS)"
                    value={`-${formatCurrency(result.cass)}`}
                    calculation={`${formatCurrency(result.gross)} × 10%`}
                    icon={Stethoscope}
                    colorClass="text-indigo-600 dark:text-indigo-400"
                    delay={0.2}
                  />

                  <RowBreakdown
                    label="Income Tax"
                    value={`-${formatCurrency(result.incomeTax)}`}
                    calculation={`(${formatCurrency(result.gross)} - deductions) × 10%`}
                    icon={TrendingDown}
                    colorClass="text-rose-600 dark:text-rose-400"
                    delay={0.3}
                    isLast={true}
                  />
                </div>

                {/* Footer Insight (Integrated) */}
                <div className="flex flex-col items-center space-y-10 group pb-4">
                  <div className="w-full rounded-[2.5rem] bg-zinc-900 dark:bg-zinc-800/50 text-zinc-400 p-10 flex flex-col items-center text-center gap-8 relative overflow-hidden transition-all hover:bg-zinc-950 dark:hover:bg-zinc-800">
                    <div className="relative z-10 flex flex-col items-center gap-4">
                      <div className="space-y-2">
                        <h4 className="font-black text-white text-xl tracking-tight uppercase tracking-[0.2em] text-[10px] opacity-50">Labor Cost Summary</h4>
                        <p className="text-lg leading-relaxed font-medium max-w-sm">
                          Your employer actually spends <span className="text-white font-black">{formatCurrency(result.employerTotal)}</span>.
                          <br /> The state total claim is <span className="text-indigo-400 font-black tracking-tighter">{formatCurrency(result.employerTotal - result.net)}</span>.
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={handleReset}
                      className="relative z-10 h-14 px-8 rounded-2xl bg-white text-zinc-950 hover:bg-zinc-100 transition-all font-black uppercase tracking-[0.2em] text-[10px]"
                    >
                      <RefreshCcw className="w-3.5 h-3.5 mr-2.5" /> Start Over
                    </Button>

                    {/* Atmospheric effects */}
                    <div className="absolute right-0 bottom-0 w-[20rem] h-[20rem] bg-indigo-500/10 rounded-full blur-[80px] translate-x-1/2 translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
