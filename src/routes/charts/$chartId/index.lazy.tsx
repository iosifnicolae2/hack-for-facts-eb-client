import { createLazyFileRoute, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { ChartConfig } from "@/components/chartBuilder/pages/ChartConfig";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ChartView } from "@/components/chartBuilder/pages/ChartView";
import { SeriesDetailView } from "@/components/chartBuilder/views/SeriesDetailView";

export const Route = createLazyFileRoute("/charts/$chartId/")({
  component: ChartDetailPage,
});

function ChartDetailPage() {
  const navigate = useNavigate();
  const { view } = useSearch({ from: "/charts/$chartId/" });
  const { chartId } = useParams({ from: "/charts/$chartId/" });

  const handleCloseDialog = (open: boolean) => {
    if (!open) {
      navigate({ to: "/charts/$chartId", search: (prev) => ({ ...prev, view: "overview" }), params: { chartId }, replace: true });
    }
  };

  return (
    <div>
      {view === "overview" && <ChartView />}
      <Dialog open={view === "config" || view === "series-config"} onOpenChange={handleCloseDialog}>
        <DialogTitle className="sr-only">Configure Chart</DialogTitle>
        <DialogContent hideCloseButton className="max-w-4xl h-full overflow-y-auto">
          <DialogDescription className="sr-only">Configure Chart</DialogDescription>
          {view === "config" && <ChartConfig />}
          {view === "series-config" && <SeriesDetailView />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
