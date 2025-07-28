import { saveChartToLocalStorage } from "@/lib/api/charts";
import { ChartSchema } from "@/schemas/charts";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { z } from "zod";

const stateSchema = z.object({
    chart: ChartSchema,
    view: z.enum(["overview", "config", "series-config"]).default("overview"),
    seriesId: z.string().optional(),
});

export const Route = createFileRoute("/charts/$chartId")({
    validateSearch: stateSchema,
    component: RouteComponent,
    onEnter: async ({ params, search }) => {
        if (search.chart.id !== params.chartId) {
            search.chart.id = params.chartId;
        }

        saveChartToLocalStorage(search.chart)

        return {
            ...search,
        }
    },
});

function RouteComponent() {
    return <Outlet />
}