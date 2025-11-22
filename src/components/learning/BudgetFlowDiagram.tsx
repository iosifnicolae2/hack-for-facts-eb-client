import { motion } from 'motion/react'
import { Building2, ArrowDown, Wallet, School } from 'lucide-react'

export function BudgetFlowDiagram() {
  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-muted/10 rounded-xl border my-8">
      <div className="relative flex flex-col items-center gap-8">
        {/* Ministry */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="p-4 bg-primary/10 rounded-full border-2 border-primary text-primary">
            <Building2 className="h-8 w-8" />
          </div>
          <div className="text-center">
            <span className="font-bold block">Ministry</span>
            <span className="text-xs text-muted-foreground">Principal Authorizer</span>
          </div>
        </motion.div>

        {/* Arrow 1 */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          whileInView={{ height: 40, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-0.5 bg-muted-foreground/30 relative"
        >
          <ArrowDown className="absolute -bottom-3 -left-2.5 h-5 w-5 text-muted-foreground/30" />
        </motion.div>

        {/* School Inspectorate */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="p-4 bg-primary/5 rounded-full border-2 border-primary/50 text-primary/80">
            <School className="h-8 w-8" />
          </div>
          <div className="text-center">
            <span className="font-bold block">School Inspectorate</span>
            <span className="text-xs text-muted-foreground">Secondary Authorizer</span>
          </div>
        </motion.div>

        {/* Arrow 2 */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          whileInView={{ height: 40, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="w-0.5 bg-muted-foreground/30 relative"
        >
          <ArrowDown className="absolute -bottom-3 -left-2.5 h-5 w-5 text-muted-foreground/30" />
        </motion.div>

        {/* Local School */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="p-4 bg-background rounded-full border-2 border-muted text-muted-foreground">
            <School className="h-8 w-8" />
          </div>
          <div className="text-center">
            <span className="font-bold block">Local School</span>
            <span className="text-xs text-muted-foreground">Tertiary Authorizer</span>
          </div>
        </motion.div>

        {/* Payment Flow Animation */}
        <motion.div
          className="absolute right-10 top-10 flex items-center gap-2 text-sm text-green-600 font-mono bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full border border-green-200 dark:border-green-800"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.5 }}
        >
          <Wallet className="h-4 w-4" />
          Payment happens here!
        </motion.div>
        
        {/* Connecting line to bottom */}
        <motion.svg 
          className="absolute top-10 right-[calc(50%-2rem)] w-1/2 h-full pointer-events-none"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <path 
            d="M 100 20 C 100 20, 100 300, 20 280" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeDasharray="4 4"
            className="text-green-500/50"
          />
        </motion.svg>

      </div>
    </div>
  )
}
