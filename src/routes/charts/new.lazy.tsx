import { createLazyFileRoute, Navigate } from '@tanstack/react-router'
import { useEffect, useMemo } from 'react'
import { Analytics } from '@/lib/analytics'

export const Route = createLazyFileRoute('/charts/new')({
    component: RouteComponent,
})

function RouteComponent() {
    const newChartId = useMemo(() => crypto.randomUUID(), []);

    useEffect(() => {
        Analytics.capture(Analytics.EVENTS.ChartCreated, { chart_id: newChartId })
    }, [newChartId]);

    return <Navigate to={"/charts/$chartId"} params={{ chartId: newChartId }} search={{ view: "config" }} replace={true} />
}
