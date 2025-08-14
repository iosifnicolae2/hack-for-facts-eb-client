import { createLazyFileRoute } from "@tanstack/react-router";
import { ChartConfigView } from "@/components/charts/components/views/ChartConfigView";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ChartView } from "@/components/charts/components/views/ChartView";
import { SeriesConfigView } from "@/components/charts/components/views/SeriesConfigView";
import { useChartStore } from "@/components/charts/hooks/useChartStore";
import { useCallback } from "react";
import { AnnotationConfigView } from "@/components/charts/components/views/AnnotationConfigView";
import { Seo } from "@/lib/seo";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";

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
        title={view === 'overview' ? t`Chart – Transparenta.eu` : t`Configure chart – Transparenta.eu`}
        description={view === 'overview' ? t`View and share your chart.` : t`Configure chart options, series, and annotations.`}
        type={view === 'overview' ? 'article' : 'website'}
      />
      {view === "overview" && <ChartView />}
      <Dialog open={view === 'config' || view === 'series-config' || view === 'annotation-config'} onOpenChange={handleCloseDialog}>
        <DialogTitle className="sr-only"><Trans>Configure Chart</Trans></DialogTitle>
        <DialogContent hideCloseButton className="max-w-4xl h-full overflow-y-auto">
          <DialogDescription className="sr-only"><Trans>Configure Chart</Trans></DialogDescription>
          {view === "config" && <ChartConfigView />}
          {view === "series-config" && <SeriesConfigView />}
          {view === "annotation-config" && <AnnotationConfigView />}
        </DialogContent>
      </Dialog>
    </>
  );
}
