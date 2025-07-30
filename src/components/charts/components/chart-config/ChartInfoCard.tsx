import React, { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Chart } from '@/schemas/charts';
import { SettingsCard } from './SettingsCard';

interface ChartInfoCardProps {
    chart: Chart;
    onUpdateChart: (updates: Partial<Chart>) => void;
}

export const ChartInfoCard = React.memo(({ chart, onUpdateChart }: ChartInfoCardProps) => {
    const [localTitle, setLocalTitle] = useState(chart.title);
    const [localDescription, setLocalDescription] = useState(chart.description || '');

    useEffect(() => {
        setLocalTitle(chart.title);
        setLocalDescription(chart.description || '');
    }, [chart.title, chart.description]);

    return (
        <SettingsCard
            icon={<Settings className="h-5 w-5" />}
            title="Chart Information"
            description="Set the basic properties for your chart"
        >
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="chart-title">Chart Title *</Label>
                    <Input
                        id="chart-title"
                        value={localTitle}
                        onChange={(e) => {
                            setLocalTitle(e.target.value);
                            onUpdateChart({ title: e.target.value });
                        }}
                        placeholder="Enter chart title..."
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="chart-description">Description</Label>
                    <Textarea
                        id="chart-description"
                        value={localDescription}
                        onChange={(e) => {
                            setLocalDescription(e.target.value);
                            onUpdateChart({ description: e.target.value });
                        }}
                        placeholder="Optional description for your chart..."
                        rows={3}
                    />
                </div>
            </div>
        </SettingsCard>
    );
}); 