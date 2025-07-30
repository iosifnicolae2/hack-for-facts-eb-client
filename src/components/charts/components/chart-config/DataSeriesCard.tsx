import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { Chart } from '@/schemas/charts';
import { SeriesList } from './SeriesList';

interface DataSeriesCardProps {
    chart: Chart;
    onUpdateChart: (updates: Partial<Chart>) => void;
    onAddSeries: () => void;
    onEditSeries: (seriesId: string) => void;
    onDeleteSeries: (seriesId: string) => void;
    onDuplicateSeries: (seriesId: string) => void;
    onMoveSeriesUp: (seriesId: string) => void;
    onMoveSeriesDown: (seriesId:string) => void;
}

export const DataSeriesCard = React.memo((props: DataSeriesCardProps) => (
    <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Data Series</CardTitle>
                    <CardDescription>Add and manage data series for your chart</CardDescription>
                </div>
                <Button onClick={props.onAddSeries} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Series
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <SeriesList {...props} />
        </CardContent>
    </Card>
)); 