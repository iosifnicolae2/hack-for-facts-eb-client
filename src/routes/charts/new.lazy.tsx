import { createLazyFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/charts/new')({
    component: RouteComponent,
})

function RouteComponent() {
    const newChartId = crypto.randomUUID();
    return <Navigate to={"/charts/$chartId"} params={{ chartId: newChartId }} search={{ view: "config" }} replace={true} />
}
