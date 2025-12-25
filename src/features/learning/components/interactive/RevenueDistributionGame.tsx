import { useState, useMemo } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { ArrowRight, Coins, Building2, RotateCcw, Landmark, Check } from 'lucide-react'
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
            <Card className="p-10 md:p-16 rounded-[3rem] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-lg overflow-hidden relative border-none">
              <div className="relative z-10 flex flex-col items-center text-center space-y-12">
                <div className="space-y-6 max-w-xl">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-2 shadow-inner"
                  >
                    <Landmark className="w-10 h-10" />
                  </motion.div>
                  <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-900 dark:text-white mt-6 leading-[0.95]">
                    <Trans>Who fuels the <span className="text-indigo-600 dark:text-indigo-400 italic">budget</span>?</Trans>
                  </h2>
                  <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                    <Trans>Most people think they know, but the reality often surprises. Ready to test your intuition?</Trans>
                  </p>
                </div>

                <div className="w-full max-w-md">
                  <Button
                    onClick={() => setStep('GUESS')}
                    className="w-full h-20 rounded-[1.8rem] text-2xl font-black bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-black dark:hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                  >
                    {t`Let's find out`} <ArrowRight className="ml-2 w-7 h-7" />
                  </Button>
                </div>
              </div>
              
              {/* Decorative artifacts */}
              <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-100/30 dark:bg-indigo-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[20rem] h-[20rem] bg-emerald-100/20 dark:bg-emerald-500/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />
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
            <Card className="p-10 md:p-20 rounded-[3.5rem] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white shadow-3xl overflow-hidden relative border-none transition-colors duration-500">
              <div className="relative z-10 flex flex-col items-center text-center space-y-14">
                <div className="space-y-6">
                  <div className="text-zinc-400 dark:text-zinc-500 text-sm font-black uppercase tracking-[0.3em]">{t`Phase 01`}</div>
                  <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none text-zinc-900 dark:text-zinc-100 mt-6">
                    <Trans>Estimate the <span className="text-emerald-500 dark:text-emerald-400">Shares</span></Trans>
                  </h2>
                  <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium max-w-sm mx-auto leading-relaxed">
                    <Trans>Drag the sliders to guess how much each source contributes.</Trans>
                  </p>
                </div>

                <div className="w-full max-w-2xl space-y-12">
                  <div className="grid gap-12">
                    {CATEGORIES.map((cat) => (
                      <div key={cat.id} className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={cn("p-3 rounded-2xl", COLOR_VARIANTS[cat.color as keyof typeof COLOR_VARIANTS].bgLight, COLOR_VARIANTS[cat.color as keyof typeof COLOR_VARIANTS].text)}>
                              <cat.icon className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-xl tracking-tight">{cat.label}</div>
                                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{cat.subLabel}</div>
                            </div>
                          </div>
                          <span className={cn("text-4xl font-black tabular-nums", COLOR_VARIANTS[cat.color as keyof typeof COLOR_VARIANTS].text)}>
                            {guesses[cat.id]}%
                          </span>
                        </div>
                        <Slider
                          value={[guesses[cat.id]]}
                          onValueChange={([val]) => handleSliderChange(cat.id, val)}
                          max={100}
                          step={1}
                          className="py-4 cursor-pointer scale-110"
                        />
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => setStep('REVEAL')}
                    className="w-full h-24 rounded-[2rem] text-2xl font-black bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-black dark:hover:bg-zinc-100 hover:scale-[1.03] active:scale-[0.97] transition-all shadow-xl group"
                  >
                    {t`Reveal Truth`} <Check className="ml-3 w-8 h-8 group-hover:scale-110 transition-transform" />
                  </Button>
                </div>
              </div>

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.08),transparent)] pointer-events-none" />
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
            <Card className="rounded-[4rem] overflow-hidden border-none shadow-3xl bg-white dark:bg-zinc-950 transition-colors duration-500">
              <div className="p-8 md:p-12 max-w-2xl mx-auto space-y-12">
                
                {/* Header Section */}
                <div className="text-center space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em]">
                    {t`Reality Check`}
                  </div>
                  
                  <h2 className="text-[4rem] md:text-[5rem] font-[1000] text-zinc-950 dark:text-white tracking-[-0.04em] leading-none drop-shadow-sm">
                    <Trans>The Reality</Trans>
                  </h2>
                  <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg">{t`Based on 2024 budgetary data`}</p>
                </div>

                <div className="space-y-6">
                  {CATEGORIES.map((cat, index) => {
                    const variants = COLOR_VARIANTS[cat.color as keyof typeof COLOR_VARIANTS] || COLOR_VARIANTS.indigo
                    return (
                      <motion.div
                        key={cat.id}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative overflow-hidden rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/30 dark:bg-zinc-950/30 p-8 hover:bg-white/50 dark:hover:bg-zinc-900/50 transition-colors"
                      >
                        {/* Header Row */}
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className={cn("p-3 rounded-2xl", variants.bgLight, variants.text)}>
                                  <cat.icon className="w-6 h-6" />
                                </div>
                                <div>
                                  <div className="font-black tracking-tight text-xl leading-none mb-1.5 text-zinc-900 dark:text-white">{cat.label}</div>
                                  <div className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-widest">{cat.subLabel}</div>
                                </div>
                            </div>
                           <div className={cn("text-4xl font-black", variants.text)}>{cat.actualPercentage}%</div>
                        </div>

                        {/* Comparison Bar */}
                        <div className="relative h-16 w-full select-none mb-6 flex items-center z-10">
                            {/* Track Container */}
                            <div className="relative w-full h-4">
                                {/* Track Background */}
                                <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
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
                                    className="absolute left-0 bottom-full mb-2 flex flex-col items-center"
                                    style={{ transform: 'translateX(-50%)' }}
                                >
                                    <div className={cn("text-[10px] font-black uppercase tracking-tight mb-1 whitespace-nowrap px-2 py-0.5 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-zinc-700", variants.text)}>{t`Reality`}</div>
                                    <div className={cn("w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px]", variants.border)} />
                                </motion.div>

                                {/* User Guess Indicator - Tip touches BOTTOM border */}
                                <motion.div
                                    initial={{ left: 0, opacity: 0 }}
                                    animate={{ left: `${guesses[cat.id]}%`, opacity: 1 }}
                                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                                    className="absolute left-0 top-full mt-2 flex flex-col-reverse items-center"
                                    style={{ transform: 'translateX(-50%)' }}
                                >
                                    <div className="text-[10px] font-black uppercase tracking-tight mt-1 text-zinc-400 dark:text-zinc-500 whitespace-nowrap px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900">{t`You`}</div>
                                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-zinc-300 dark:border-b-zinc-700" />
                                </motion.div>
                            </div>
                        </div>

                        {/* Insight Text */}
                        <div className="pt-6 border-t border-zinc-200/50 dark:border-white/5 relative z-10">
                           <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-medium">
                            {cat.description}
                           </p>
                        </div>

                        {/* Background Glow */}
                        <div className={cn("absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none", variants.bg)} />
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
                    className="h-14 px-8 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all font-bold uppercase tracking-widest text-xs"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" /> {t`Try guessing again`}
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
