import { getChartsStore } from "@/components/charts/chartsStore";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { chartUrlStateSchema } from "../../../components/charts/page-schema";

export const Route = createFileRoute("/charts/$chartId")({
    ssr: false,
    validateSearch: chartUrlStateSchema,
    component: RouteComponent,
    onEnter: async ({ params, search }) => {
        if (search.chart.id !== params.chartId) {
            search.chart.id = params.chartId;
        }

        // Defer store access to runtime - getChartsStore checks for browser internally
        if (typeof window !== 'undefined') {
            getChartsStore().saveChartToLocalStorage(search.chart)
        }

        return {
            ...search,
        }
    },
});

function RouteComponent() {
    return <Outlet />
}
