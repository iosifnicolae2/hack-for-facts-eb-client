import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type DataSourceInfoModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DataSourceInfoModal({ open, onOpenChange }: DataSourceInfoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>About the Data Source</DialogTitle>
          <DialogDescription>
            Analiză administrația locală – Septembrie 2025
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            The information presented on this page is for informational purposes and represents a snapshot of the
            personnel in the administrative bodies of town halls and county councils in Romania.
          </p>
          <p>
            Methodology: Based on population data from the National Institute of Statistics and the maximum number of posts
            calculated according to O.U.G no. 63/2010 for each administrative-territorial unit.
          </p>
          <p>
            Accuracy: Due to slight differences in reporting, there may be an error margin of approximately ±2% at the national level.
          </p>
          <p>
            Source: <a className="underline" href="https://gov.ro/aal/" target="_blank" rel="noreferrer">gov.ro/aal</a>
          </p>
        </div>
        <div className="pt-4">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


