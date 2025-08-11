import { getChartsStore } from "@/components/charts/chartsStore";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { chartUrlStateSchema } from "./_schema";

const chartsStore = getChartsStore();

export const Route = createFileRoute("/charts/$chartId")({
    validateSearch: chartUrlStateSchema,
    component: RouteComponent,
    onEnter: async ({ params, search }) => {
        if (search.chart.id !== params.chartId) {
            search.chart.id = params.chartId;
        }

        chartsStore.saveChartToLocalStorage(search.chart)

        return {
            ...search,
        }
    },
});

function RouteComponent() {
    return <Outlet />
}