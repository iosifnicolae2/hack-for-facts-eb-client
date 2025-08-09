import { Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Chart } from "@/schemas/charts";
import { getChartTypeIcon } from "../../utils";

interface ChartViewHeaderProps {
  chart: Chart;
  onConfigure: () => void;
}

export function ChartViewHeader({ chart, onConfigure }: ChartViewHeaderProps) {
  const chartTitle = chart.title || 'Untitled Chart';
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {getChartTypeIcon(chart.config.chartType, "h-8 w-8 text-muted-foreground")}
          <h1 className="text-3xl font-bold tracking-tight">{chartTitle}</h1>
          <Badge variant="outline" className="capitalize">{chart.config.chartType}</Badge>
        </div>
      </div>
      <Button className="gap-2" onClick={onConfigure}>
        <Settings className="h-4 w-4" />
        Configure
      </Button>
    </div>
  );
}; 