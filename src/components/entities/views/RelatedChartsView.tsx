import { useMemo, useCallback, useEffect, useState } from 'react';
import { EntityDetailsData } from '@/lib/api/entities';
import { getChartsStore } from '@/components/charts/chartsStore';
import { ChartList } from '@/components/charts/components/chart-list/ChartList';
import { Button } from '@/components/ui/button';
import { Plus, BarChart3 } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { chartRelatesToEntity } from '@/lib/chart-entity-utils';
import { buildEntityIncomeExpenseChartLink } from '@/lib/chart-links';
import { Trans } from '@lingui/react/macro';
import type { NormalizationOptions } from '@/lib/normalization';

type Props = {
    entity?: EntityDetailsData | null | undefined;
    normalizationOptions: NormalizationOptions;
};

const chartsStore = getChartsStore();

export function RelatedChartsView({ entity, normalizationOptions }: Props) {
    const [charts, setCharts] = useState(() => chartsStore.loadSavedCharts({ filterDeleted: true, sort: true }));
    const [categories, setCategories] = useState(() => chartsStore.loadCategories());

    useEffect(() => {
        const reload = () => {
            setCharts(chartsStore.loadSavedCharts({ filterDeleted: true, sort: true }));
            setCategories(chartsStore.loadCategories());
        };
        window.addEventListener('storage', reload);
        return () => window.removeEventListener('storage', reload);
    }, []);

    const filtered = useMemo(() => {
        if (!entity) return [];
        return charts.filter((c) => chartRelatesToEntity(c, entity));
    }, [charts, entity]);


    const onDelete = useCallback(async (chartId: string) => {
        await chartsStore.deleteChart(chartId);
        setCharts((prev) => prev.filter((c) => c.id !== chartId));
    }, []);
    const onToggleFavorite = useCallback((chartId: string) => {
        chartsStore.toggleChartFavorite(chartId);
        setCharts((prev) => prev.map((c) => (c.id === chartId ? { ...c, favorite: !c.favorite } : c)));
    }, []);

    if (!entity) {
        return null;
    }

    if (filtered.length === 0) {
        const link = buildEntityIncomeExpenseChartLink(entity.cui, entity.name, normalizationOptions);
        return (
            <div className="text-center py-16 space-y-4">
                <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground" />
                <h3 className="text-xl font-semibold"><Trans>No related charts yet</Trans></h3>
                <p className="text-muted-foreground">
                    <Trans>Create a chart for this entity to start tracking its financial evolution.</Trans>
                </p>
                <Link to={link.to} params={link.params} search={link.search}>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        <Trans>Create chart for this entity</Trans>
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <ChartList
                charts={filtered}
                onDelete={onDelete}
                onToggleFavorite={onToggleFavorite}
                categories={categories}
            />
        </div>
    );
}

