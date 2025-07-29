import { StoredChart } from "@/components/chartBuilder/chartsStore";
import { ChartCard } from "./ChartCard";

interface ChartListProps {
    charts: StoredChart[];
    onDelete: (chartId: string) => void;
    onToggleFavorite: (chartId: string) => void;
}

export function ChartList({ charts, onDelete, onToggleFavorite }: ChartListProps) {

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {charts.map((chart) => (
                    <ChartCard
                        key={chart.id}
                        chart={chart}
                        onDelete={onDelete}
                        onToggleFavorite={onToggleFavorite}
                    />
                ))}
            </div>
        </div>
    );
} 