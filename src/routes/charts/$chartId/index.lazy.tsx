import { createLazyFileRoute, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { ChartConfig } from "@/components/chartBuilder/pages/ChartConfig";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChartView } from "@/components/chartBuilder/pages/ChartView";
import { SeriesDetailView } from "@/components/chartBuilder/views/SeriesDetailView";

export const Route = createLazyFileRoute("/charts/$chartId/")({
  component: ChartDetailPage,
});

function ChartDetailPage() {
  const navigate = useNavigate();
  const { view } = useSearch({ from: "/charts/$chartId/" });
  const { chartId } = useParams({ from: "/charts/$chartId/" });


  if (view === "series-config") {
    return (
      <Dialog open={view === "series-config"} onOpenChange={() => navigate({ to: "/charts/$chartId", search: (prev) => ({ ...prev, view: "overview" }), params: { chartId } })}>
        <DialogContent className="max-w-4xl">
          <SeriesDetailView />
        </DialogContent>
      </Dialog>
    )
  }
  if (view === "config") {
    return (
      <Dialog open={view === "config"} onOpenChange={() => navigate({ to: "/charts/$chartId", search: (prev) => ({ ...prev, view: "overview" }), params: { chartId } })}>
        <DialogContent className="max-w-4xl">
          <ChartConfig />
        </DialogContent>
      </Dialog>
    )
  }
  return (
    <ChartView />
  );
}
