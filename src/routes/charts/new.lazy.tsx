import { createLazyFileRoute, Navigate } from '@tanstack/react-router'
import { Analytics } from '@/lib/analytics'
import { DEFAULT_CHART_CONFIG } from '@/schemas/constants'
import type { Chart } from '@/schemas/charts'

export const Route = createLazyFileRoute('/charts/new')({
    component: RouteComponent,
})

function RouteComponent() {
    const newChartId = crypto.randomUUID();
    const newChart: Chart = {
        id: newChartId,
        title: '',
        description: '',
        config: DEFAULT_CHART_CONFIG,
        series: [],
        annotations: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    Analytics.capture(Analytics.EVENTS.ChartCreated, { chart_id: newChartId })
    return <Navigate to={"/charts/$chartId"} params={{ chartId: newChartId }} search={{ view: "config", chart: newChart }} replace={true} />
}
