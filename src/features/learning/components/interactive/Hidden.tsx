import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HiddenProps {
  label?: string
  children: React.ReactNode
}

export function Hidden({ label = 'Technical Details', children }: HiddenProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="my-6 border border-zinc-100 rounded-2xl overflow-hidden bg-white">
      <Button 
        variant="ghost" 
        className="w-full justify-between hover:bg-zinc-50 rounded-none px-6 py-4 text-zinc-400 text-xs font-bold uppercase tracking-widest h-auto"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{label}</span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-zinc-300" /> : <ChevronDown className="w-4 h-4 text-zinc-300" />}
      </Button>
      {isOpen && (
        <div className="p-6 bg-zinc-50/50 border-t border-zinc-100 overflow-auto max-h-[500px] text-zinc-600 font-mono text-[11px] leading-relaxed">
          {children}
        </div>
      )}
    </div>
  )
}
