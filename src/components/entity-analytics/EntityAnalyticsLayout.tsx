import { ReactNode, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Filter as FilterIcon, X } from 'lucide-react'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

interface Props {
  filters: ReactNode
  children: ReactNode
  title?: string
  subtitle?: string
}

export function EntityAnalyticsLayout({ filters, children, title = t`Entity Analytics`, subtitle }: Props) {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="px-1 md:px-0">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">{title}</h1>
        {subtitle ? <p className="text-muted-foreground text-sm md:text-base">{subtitle}</p> : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[360px_minmax(0,1fr)] lg:grid-cols-[400px_minmax(0,1fr)] gap-4 w-full items-start">
        <aside className="hidden md:block">
          <div className="sticky top-4 space-y-3">{filters}</div>
        </aside>

        <section className="w-full">
          <div className="rounded-lg border border-border bg-card p-2 md:p-4 shadow-sm min-h-[300px]">
            {children}
          </div>
        </section>
      </div>

      <div className="md:hidden fixed right-6 bottom-[5.75rem] z-50 flex flex-col items-end gap-3">
        <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
          <DialogTrigger asChild>
            <Button variant="default" size="icon" className="rounded-full shadow-lg w-14 h-14">
              <FilterIcon className="w-6 h-6" />
            </Button>
          </DialogTrigger>
          <DialogContent hideCloseButton={true} className="p-0 m-0 w-full max-w-full h-full max-h-full sm:h-[calc(100%-2rem)] sm:max-h-[calc(100%-2rem)] sm:w-[calc(100%-2rem)] sm:max-w-md sm:rounded-lg flex flex-col">
            <DialogHeader className="p-4 border-b flex flex-row justify-between items-center shrink-0">
              <DialogTitle className="text-lg font-semibold"><Trans>Filters</Trans></DialogTitle>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </DialogClose>
            </DialogHeader>
            <div className="flex-grow overflow-y-auto p-3">{filters}</div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}


