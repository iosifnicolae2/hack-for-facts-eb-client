import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable'
import type { ReactNode } from 'react'

type ClassificationLayoutProps = {
  readonly treePanel: ReactNode
  readonly detailPanel: ReactNode
}

export function ClassificationLayout({
  treePanel,
  detailPanel,
}: ClassificationLayoutProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Desktop: Side-by-side with resizable panels */}
      <div className="hidden h-full md:block">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
            {treePanel}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={60} minSize={40}>
            {detailPanel}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile: Stacked vertically */}
      <div className="flex h-full flex-col md:hidden">
        <div className="h-1/2 border-b">{treePanel}</div>
        <div className="h-1/2">{detailPanel}</div>
      </div>
    </div>
  )
}
