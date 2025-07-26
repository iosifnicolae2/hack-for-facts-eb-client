import { saveChartToLocalStorage } from "@/lib/api/chartBuilder";
import { ChartSchema } from "@/schemas/chartBuilder";
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
    onEnter: async ({ search }) => {
        saveChartToLocalStorage(search.chart)
    },
});

function RouteComponent() {
    return <Outlet />
}