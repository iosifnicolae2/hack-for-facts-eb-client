import { Target, ExternalLink } from 'lucide-react'
import { t } from '@lingui/core/macro'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface PlatformMissionProps {
    title: string
    description?: string
    tasks: string[]
    actionLabel: string
    actionLink: string
}

export function PlatformMission({
    title,
    description,
    tasks,
    actionLabel,
    actionLink
}: PlatformMissionProps) {
    return (
        <Card className="p-6 md:p-10 rounded-[2.5rem] bg-zinc-50 border-none shadow-sm my-8 relative overflow-hidden">
            <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-zinc-900 rounded-2xl text-white shadow-xl shadow-zinc-200">
                        <Target className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">{t`Platform Mission`}</div>
                        <h3 className="text-xl font-black text-zinc-900 tracking-tight">{title}</h3>
                    </div>
                </div>

                {description && (
                    <p className="text-zinc-600 font-medium text-base leading-relaxed max-w-2xl">
                        {description}
                    </p>
                )}

                <ul className="grid grid-cols-1 gap-4">
                    {tasks.map((task, i) => (
                        <li key={i} className="flex items-start gap-4 p-4 bg-white/60 rounded-2xl border border-white scroll-mt-20">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-black mt-0.5">
                                {i + 1}
                            </span>
                            <span className="text-zinc-700 font-bold leading-tight">{task}</span>
                        </li>
                    ))}
                </ul>

                <div className="pt-4">
                    <Button asChild className="rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black h-12 px-8 text-base shadow-2xl shadow-zinc-200 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        <a href={actionLink} target="_blank" rel="noreferrer">
                            <ExternalLink className="w-5 h-5 mr-3 text-white" /> <span className="text-white">{actionLabel}</span>
                    </a>
                </Button>
            </div>
        </div>

            {/* Decorative elements to match other cards */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-400/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        </Card >
    )
}
