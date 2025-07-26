import { chartStateSchema } from "@/components/chartBuilder/validation";
import { createFileRoute, Outlet, retainSearchParams, useSearch } from "@tanstack/react-router";

export const Route = createFileRoute("/charts/$chartId")({
    validateSearch: chartStateSchema,
    component: RouteComponent,
    search: {
        middlewares: [retainSearchParams(true)],
    },
});

function RouteComponent() {
    const { seriesId } = useSearch({ from: Route.id });
    console.log("Route", seriesId)
    return (
        <div>
            <Outlet />
        </div>
    )
}