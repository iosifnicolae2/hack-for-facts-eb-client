import { useState, useMemo } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { ArrowRight, Coins, Building2, TrendingUp, Landmark } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

// -----------------------------------------------------------------------------
// TYPES & CONSTANTS
// -----------------------------------------------------------------------------

type GameStep = 'HOOK' | 'GUESS' | 'REVEAL'

type CategoryId = 'taxes' | 'social' | 'other'

interface CategoryData {
  id: CategoryId
  label: string
  subLabel: string
  actualPercentage: number
  icon: React.ComponentType<{ className?: string }>
  color: string // Tailwind color prefix, e.g., 'emerald'
  description: string
}

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

const COLOR_VARIANTS = {
  indigo: {
    bg: 'bg-indigo-500',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-t-indigo-600 dark:border-t-indigo-500',
    bgLight: 'bg-indigo-500/10'
  },
  emerald: {
    bg: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-t-emerald-600 dark:border-t-emerald-500',
    bgLight: 'bg-emerald-500/10'
  },
  amber: {
    bg: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-t-amber-600 dark:border-t-amber-500',
    bgLight: 'bg-amber-500/10'
  }
} as const

export function RevenueDistributionGame() {
  const CATEGORIES: CategoryData[] = useMemo(() => [
    {
      id: 'taxes',
      label: t`Taxes`,
      subLabel: t`VAT, Income, Profit`,
      actualPercentage: 50,
      icon: Landmark,
      color: 'indigo',
      description: t`The largest chunk. VAT alone brings in nearly as much as all salary taxes combined.`,
    },
    {
      id: 'social',
      label: t`Social Contrib.`,
      subLabel: t`Pensions (CAS), Health (CASS)`,
      actualPercentage: 34,
      icon: Building2,
      color: 'emerald',
      description: t`Funds the pension checks and hospital bills directly. It's a huge mandatory system.`,
    },
    {
      id: 'other',
      label: t`Other Sources`,
      subLabel: t`EU Funds, Dividends, etc.`,
      actualPercentage: 16,
      icon: Coins,
      color: 'amber',
      description: t`Includes EU money (PNRR) and profits from state-owned companies. Essential but smaller.`,
    },
  ], [])

  const [step, setStep] = useState<GameStep>('HOOK')
  const [guesses, setGuesses] = useState<Record<CategoryId, number>>({
    taxes: 33,
    social: 33,
    other: 34,
  })

  const handleSliderChange = (id: CategoryId, value: number) => {
    setGuesses(prev => ({ ...prev, [id]: value }))
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { 
        duration: 0.6, 
        ease: [0.16, 1, 0.3, 1] 
      } 
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      transition: { duration: 0.3 } 
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 select-none">
      <AnimatePresence mode="wait">
        
        {/* STEP 1: THE HOOK */}
        {step === 'HOOK' && (
          <motion.div
            key="hook"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="p-6 md:p-20 text-center rounded-[3rem] bg-white text-zinc-900 shadow-xl border border-zinc-100 relative overflow-hidden">
              <div className="relative z-10 space-y-6 pt-10">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.1]">
                  <Trans>Who fuels the budget?</Trans>
                </h2>
                <p className="text-zinc-500 text-xl md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
                  <Trans>Most people think they know, but the reality often surprises. Ready to test your intuition?</Trans>
                </p>
                <div className="pt-8">
                  <Button
                    onClick={() => setStep('GUESS')}
                    size="lg"
                    className="h-16 px-10 rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800 transition-all font-black text-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0"
                  >
                    {t`Let's find out`} <ArrowRight className="ml-3 w-6 h-6" />
                  </Button>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            </Card>
          </motion.div>
        )}

        {/* STEP 2: THE INTERACTION */}
        {step === 'GUESS' && (
          <motion.div
            key="guess"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="p-4 md:p-14 rounded-[3rem] shadow-xl border-white/10 relative">
              <div className="space-y-10">
                <div className="text-center space-y-3">
                  <h3 className="text-3xl md:text-4xl font-black tracking-tight"><Trans>Estimate the Shares</Trans></h3>
                  <p className="text-zinc-500 font-medium text-lg"><Trans>Drag the sliders to guess how much each source contributes.</Trans></p>
                </div>

                <div className="grid gap-12 max-w-2xl mx-auto py-6">
                  {CATEGORIES.map((cat) => (
                    <div key={cat.id} className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-xl", COLOR_VARIANTS[cat.color as keyof typeof COLOR_VARIANTS].bgLight, COLOR_VARIANTS[cat.color as keyof typeof COLOR_VARIANTS].text)}>
                            <cat.icon className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-lg md:text-xl tracking-tight">{cat.label}</span>
                        </div>
                        <span className={cn("text-2xl font-black tabular-nums", COLOR_VARIANTS[cat.color as keyof typeof COLOR_VARIANTS].text)}>
                          {guesses[cat.id]}%
                        </span>
                      </div>
                      <Slider
                        value={[guesses[cat.id]]}
                        onValueChange={([val]) => handleSliderChange(cat.id, val)}
                        max={100}
                        step={1}
                        className="py-4 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-center pt-6">
                  <Button
                    onClick={() => setStep('REVEAL')}
                    size="lg"
                    className="h-16 px-12 rounded-[2rem] bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white hover:bg-zinc-800 dark:hover:bg-white transition-all font-black text-xl shadow-xl"
                  >
                    {t`Reveal Truth`}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* STEP 3: THE REVEAL */}
        {step === 'REVEAL' && (
          <motion.div
            key="reveal"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="p-4 md:p-14 rounded-[3rem] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white shadow-3xl border-none relative overflow-hidden transition-colors duration-500">
              <div className="relative z-10 space-y-10">
                <div className="text-center space-y-2">
                  <h3 className="text-3xl md:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white">
                    <Trans>The Reality</Trans>
                  </h3>
                  <p className="text-zinc-500 dark:text-zinc-400 font-medium">{t`Based on 2024 budgetary data`}</p>
                </div>

                <div className="space-y-4">
                  {CATEGORIES.map((cat, index) => {
                    const variants = COLOR_VARIANTS[cat.color as keyof typeof COLOR_VARIANTS] || COLOR_VARIANTS.indigo
                    return (
                      <motion.div
                        key={cat.id}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="group"
                      >
                        <div className="bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-[2rem] p-5 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors">
                          {/* Header Row */}
                          <div className="flex items-center justify-between mb-8">
                              <div className="flex items-center gap-3">
                                  <div className={cn("p-2.5 rounded-xl", variants.bgLight, variants.text)}>
                                    <cat.icon className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <div className="font-black tracking-tight text-lg leading-none mb-1 text-zinc-900 dark:text-white">{cat.label}</div>
                                    <div className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-widest">{cat.subLabel}</div>
                                  </div>
                              </div>
                             <div className={cn("text-2xl font-black", variants.text)}>{cat.actualPercentage}%</div>
                          </div>

                          {/* Comparison Bar */}
                          <div className="relative h-12 w-full select-none mb-6 flex items-center">
                              {/* Track Container */}
                              <div className="relative w-full h-3">
                                  {/* Track Background */}
                                  <div className="w-full h-full bg-zinc-200 dark:bg-zinc-900 rounded-full overflow-hidden">
                                      <motion.div 
                                          initial={{ width: 0 }}
                                          animate={{ width: `${cat.actualPercentage}%` }}
                                          transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
                                          className={cn("h-full", variants.bg)}
                                      />
                                  </div>

                                  {/* Reality Indicator - Tip touches TOP border */}
                                  <motion.div
                                      initial={{ left: 0, opacity: 0 }}
                                      animate={{ left: `${cat.actualPercentage}%`, opacity: 1 }}
                                      transition={{ duration: 0.8, ease: "easeOut" }}
                                      className="absolute left-0 bottom-full mb-[1px] flex flex-col items-center"
                                      style={{ transform: 'translateX(-50%)' }}
                                  >
                                      <div className={cn("text-[9px] font-black uppercase tracking-tight mb-0.5 whitespace-nowrap", variants.text)}>{t`Reality`}</div>
                                      <div className={cn("w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px]", variants.border)} />
                                  </motion.div>

                                  {/* User Guess Indicator - Tip touches BOTTOM border */}
                                  <motion.div
                                      initial={{ left: 0, opacity: 0 }}
                                      animate={{ left: `${guesses[cat.id]}%`, opacity: 1 }}
                                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                                      className="absolute left-0 top-full mt-[1px] flex flex-col-reverse items-center"
                                      style={{ transform: 'translateX(-50%)' }}
                                  >
                                      <div className="text-[9px] font-black uppercase tracking-tight mt-0.5 text-zinc-400 dark:text-zinc-600 whitespace-nowrap">{t`You`}</div>
                                      <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[7px] border-b-zinc-300 dark:border-b-zinc-700" />
                                  </motion.div>
                              </div>
                          </div>

                          {/* Insight Text */}
                          <div className="pt-4 border-t border-zinc-100 dark:border-white/5">
                             <p className="text-zinc-500 dark:text-zinc-400 text-[13px] leading-snug font-medium">
                              {cat.description}
                             </p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                <div className="flex justify-center pt-8">
                  <Button
                    variant="ghost"
                    onClick={() => {
                        setStep('GUESS')
                        setGuesses({ taxes: 33, social: 33, other: 34 })
                    }}
                    className="h-14 px-8 rounded-2xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 font-bold"
                  >
                    <TrendingUp className="w-5 h-5 mr-3" /> {t`Try guessing again`}
                  </Button>
                </div>
              </div>
              
              {/* Atmospheric Glows */}
              <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-emerald-500/5 dark:bg-emerald-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
