import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { SeriesList } from './SeriesList';
import { SeriesToolbar } from './SeriesToolbar';
import { useChartStore } from '../../hooks/useChartStore';
import { Trans } from '@lingui/react/macro';

export const DataSeriesCard = React.memo(() => {
    const { addSeries } = useChartStore();
    return (
        <Card data-testid="data-series-card">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle><Trans>Data Series</Trans></CardTitle>
                        <CardDescription><Trans>Add and manage data series for your chart</Trans></CardDescription>
                    </div>
                    <Button onClick={addSeries} className="gap-2" data-testid="add-series-button">
                        <Plus className="h-4 w-4" />
                        <Trans>Add Series</Trans>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <SeriesToolbar />
                <SeriesList />
            </CardContent>
        </Card>
    );
}); 
