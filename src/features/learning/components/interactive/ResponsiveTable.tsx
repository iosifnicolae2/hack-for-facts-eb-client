import { cn } from '@/lib/utils'

interface ResponsiveTableProps {
  children: React.ReactNode
  className?: string
}

export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <div className={cn("w-full my-8 p-6 md:p-8 rounded-[2.5rem] bg-zinc-50 border-none shadow-sm relative overflow-hidden", className)}>
      <div className="relative z-10 overflow-x-auto rounded-2xl border border-zinc-100 bg-white/50 backdrop-blur-sm">
        <div className="min-w-[600px] md:min-w-0 p-1">
          {children}
        </div>
      </div>
      {/* Subtle decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-400/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
    </div>
  )
}
