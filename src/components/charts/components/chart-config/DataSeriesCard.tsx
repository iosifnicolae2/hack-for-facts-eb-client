import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { SeriesList } from './SeriesList';
import { SeriesToolbar } from './SeriesToolbar';
import { useChartStore } from '../../hooks/useChartStore';

export const DataSeriesCard = React.memo(() => {
    const { addSeries } = useChartStore();
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Data Series</CardTitle>
                        <CardDescription>Add and manage data series for your chart</CardDescription>
                    </div>
                    <Button onClick={addSeries} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Series
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