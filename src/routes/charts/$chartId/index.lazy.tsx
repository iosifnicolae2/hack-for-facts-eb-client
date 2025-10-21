import { createLazyFileRoute } from "@tanstack/react-router";
import { ChartConfigView } from "@/components/charts/components/views/ChartConfigView";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ChartView } from "@/components/charts/components/views/ChartView";
import { SeriesConfigView } from "@/components/charts/components/views/SeriesConfigView";
import { useChartStore } from "@/components/charts/hooks/useChartStore";
import { useCallback } from "react";
import { AnnotationConfigView } from "@/components/charts/components/views/AnnotationConfigView";
import { getSiteUrl } from "@/config/env";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { FloatingQuickNav } from "@/components/ui/FloatingQuickNav";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";

export const Route = createLazyFileRoute("/charts/$chartId/")({
  component: ChartDetailPage,
});

function ChartDetailPage() {
  const { view, goToOverview, undo, redo, canUndo, canRedo } = useChartStore();

  const handleCloseDialog = useCallback((open: boolean) => {
    if (!open) {
      goToOverview()
    }
  }, [goToOverview]);

  // Wire up keyboard shortcuts for undo/redo
  const handleUndo = useCallback(() => {
    if (canUndo) {
      undo();
      toast.success(t`Undo successful`);
    }
  }, [undo, canUndo]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      redo();
      toast.success(t`Redo successful`);
    }
  }, [redo, canRedo]);

  useHotkeys('mod+z', handleUndo, { enabled: canUndo, enableOnFormTags: false });
  useHotkeys('mod+shift+z', handleRedo, { enabled: canRedo, enableOnFormTags: false });

  return (
    <>
      <FloatingQuickNav
        mapViewType="UAT"
        mapActive
        tableActive
        filterInput={{
          entity_cuis: [],
          uat_ids: [],
          county_codes: [],
          report_period: {
            type: 'YEAR',
            selection: { dates: [String(new Date().getFullYear())] },
          },
          account_category: 'ch',
          normalization: 'total',
        }}
      />
      {/* Head handled by Route.head */}
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

function buildChartDetailHead() {
  const site = getSiteUrl()
  const canonical = `${site}/charts/`
  const title = 'Chart – Transparenta.eu'
  const description = 'View and share your chart.'
  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { name: 'og:title', content: title },
      { name: 'og:description', content: description },
      { name: 'og:url', content: canonical },
      { name: 'canonical', content: canonical },
    ],
  }
}

export function head() {
  return buildChartDetailHead()
}
