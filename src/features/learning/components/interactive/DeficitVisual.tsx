import { Card } from '@/components/ui/card'
import { t } from '@lingui/core/macro'

export function DeficitVisual() {
   return (
      <div className="w-full my-8">
         <Card className="p-6 md:p-8 rounded-[2.5rem] bg-zinc-50 border-none shadow-sm relative overflow-hidden">
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12 text-center">
               <div className="space-y-3 flex-1 min-w-0 max-w-48">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 truncate">{t`Revenue`}</div>
                  <div className="text-2xl md:text-3xl lg:text-4xl font-black text-emerald-500 tracking-tighter shrink-0">34.2%</div>
               </div>

               <div className="text-3xl font-black text-zinc-400 select-none hidden lg:block shrink-0 mt-4">-</div>

               <div className="space-y-3 flex-1 min-w-0 max-w-48">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 truncate">{t`Spending`}</div>
                  <div className="text-2xl md:text-3xl lg:text-4xl font-black text-red-500 tracking-tighter shrink-0">43.5%</div>
               </div>

               <div className="text-3xl font-black text-zinc-400 select-none hidden lg:block shrink-0 mt-4">=</div>

               <div className="space-y-3 flex-1 min-w-0 max-w-60">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 truncate">{t`The Deficit`}</div>
                  <div className="text-2xl md:text-3xl lg:text-4xl font-black text-zinc-900 tracking-tighter shrink-0">−9.3%</div>
               </div>
            </div>

            {/* Subtle background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
         </Card>
      </div>
   )
}
