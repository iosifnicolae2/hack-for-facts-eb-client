import { createLazyFileRoute, Navigate } from '@tanstack/react-router'
import { Analytics } from '@/lib/analytics'

export const Route = createLazyFileRoute('/charts/new')({
    component: RouteComponent,
})

function RouteComponent() {
    const newChartId = crypto.randomUUID();
    Analytics.capture(Analytics.EVENTS.ChartCreated, { chart_id: newChartId })
    return <Navigate to={"/charts/$chartId"} params={{ chartId: newChartId }} search={{ view: "config" }} replace={true} />
}
