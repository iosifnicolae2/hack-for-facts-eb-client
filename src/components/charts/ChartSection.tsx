import { StoredChart } from "@/components/chartBuilder/chartsStore";
import { ChartList } from "./ChartList";

interface ChartSectionProps {
    title: string;
    charts: StoredChart[];
    onDelete: (chartId: string) => void;
    onToggleFavorite: (chartId: string) => void;
}

export function ChartSection({ title, charts, onDelete, onToggleFavorite }: ChartSectionProps) {
    if (charts.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            <ChartList
                charts={charts}
                onDelete={onDelete}
                onToggleFavorite={onToggleFavorite}
            />
        </div>
    );
} 