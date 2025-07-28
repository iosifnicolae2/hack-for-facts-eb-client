import React, { useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Chart } from '@/schemas/charts';
import { SettingsCard } from './SettingsCard';
import { getChartTypeIcon } from '../../utils';
import { ChartTypeSelect } from './ChartTypeSelect';
import { ColorPicker } from './ColorPicker';
import { ToggleSwitch } from './ToggleSwitch';

interface GlobalSettingsCardProps {
    chart: Chart;
    onUpdateChart: (updates: Partial<Chart>) => void;
}

export const GlobalSettingsCard = React.memo(({ chart, onUpdateChart }: GlobalSettingsCardProps) => {
    const handleConfigChange = useCallback((updates: Partial<Chart['config']>) => {
        onUpdateChart({ config: { ...chart.config, ...updates } });
    }, [chart.config, onUpdateChart]);

    return (
        <SettingsCard
            icon={getChartTypeIcon(chart.config.chartType)}
            title="Global Chart Settings"
            description="Default settings that apply to all series (can be overridden per series)"
        >
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Chart Type</Label>
                        <ChartTypeSelect
                            value={chart.config.chartType}
                            onValueChange={(value) => handleConfigChange({ chartType: value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="default-color">Default Color</Label>
                        <ColorPicker
                            value={chart.config.color}
                            onChange={(value) => handleConfigChange({ color: value })}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <ToggleSwitch id="show-grid-lines" label="Show Grid Lines" checked={chart.config.showGridLines} onCheckedChange={(checked) => handleConfigChange({ showGridLines: checked })} />
                    <ToggleSwitch id="show-legend" label="Show Legend" checked={chart.config.showLegend} onCheckedChange={(checked) => handleConfigChange({ showLegend: checked })} />
                    <ToggleSwitch id="show-data-labels" label="Show Data Labels" checked={chart.config.showDataLabels} onCheckedChange={(checked) => handleConfigChange({ showDataLabels: checked })} />
                    <ToggleSwitch id="show-relative-values" label="Show Relative Values (%)" checked={chart.config.showRelativeValues} onCheckedChange={(checked) => handleConfigChange({ showRelativeValues: checked })} />
                </div>
            </div>
        </SettingsCard>
    );
}); 