import { createLazyFileRoute } from "@tanstack/react-router";
import { ChartConfigView } from "@/components/charts/components/views/ChartConfigView";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ChartView } from "@/components/charts/components/views/ChartView";
import { SeriesConfigView } from "@/components/charts/components/views/SeriesConfigView";
import { useChartStore } from "@/components/charts/hooks/useChartStore";
import { useCallback } from "react";
import { AnnotationConfigView } from "@/components/charts/components/views/AnnotationConfigView";
import { Seo } from "@/lib/seo";

export const Route = createLazyFileRoute("/charts/$chartId/")({
  component: ChartDetailPage,
});

function ChartDetailPage() {
  const { view, goToOverview, } = useChartStore();

  const handleCloseDialog = useCallback((open: boolean) => {
    if (!open) {
      goToOverview()
    }
  }, [goToOverview]);

  return (
    <>
      <Seo
        title={view === 'overview' ? 'Chart – Transparenta.eu' : 'Configure chart – Transparenta.eu'}
        description={view === 'overview' ? 'View and share your chart.' : 'Configure chart options, series, and annotations.'}
        type={view === 'overview' ? 'article' : 'website'}
      />
      {view === "overview" && <ChartView />}
      <Dialog open={view === 'config' || view === 'series-config' || view === 'annotation-config'} onOpenChange={handleCloseDialog}>
        <DialogTitle className="sr-only">Configure Chart</DialogTitle>
        <DialogContent hideCloseButton className="max-w-4xl h-full overflow-y-auto">
          <DialogDescription className="sr-only">Configure Chart</DialogDescription>
          {view === "config" && <ChartConfigView />}
          {view === "series-config" && <SeriesConfigView />}
          {view === "annotation-config" && <AnnotationConfigView />}
        </DialogContent>
      </Dialog>
    </>
  );
}
