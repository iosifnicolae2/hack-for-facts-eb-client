import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Filter, Settings } from 'lucide-react';
import { Chart, SeriesConfiguration, AnalyticsFilterType } from '@/schemas/chartBuilder';
import { useState, useEffect } from 'react';
import { useFilterSearch } from '@/lib/hooks/useLineItemsFilter';
import { LineItemsFilter } from '@/components/filters/LineItemsFilter';
import { Badge } from '@/components/ui/badge';

interface SeriesDetailViewProps {
  chart: Chart;
  selectedSeriesId?: string;
  onUpdateSeries: (seriesId: string, updates: Partial<SeriesConfiguration>) => void;
  onDeleteSeries: (seriesId: string) => void;
  onBack: () => void;
  validationErrors: Record<string, string[]>;
}

export function SeriesDetailView({
  chart,
  selectedSeriesId,
  onUpdateSeries,
  onDeleteSeries,
  onBack,
  validationErrors
}: SeriesDetailViewProps) {
  const series = chart.series.find(s => s.id === selectedSeriesId);
  const [hasInitializedFilters, setHasInitializedFilters] = useState(false);

  // Access the global filter state
  const {
    // Current filter values from the global store
    selectedYearOptions,
    selectedEntityOptions,
    selectedUatOptions,
    selectedEconomicClassificationOptions,
    selectedFunctionalClassificationOptions,
    minAmount,
    maxAmount,
    selectedAccountTypeOptions,
    reportType,
    isMainCreditor,
    isUat,
    functionalPrefix,
    economicPrefix,
    selectedEntityTypeOptions,
    filter: currentFilterState,
    // Setters to update the global filter state
    setSelectedYearOptions,
    setSelectedEntityOptions,
    setSelectedUatOptions,
    setSelectedEconomicClassificationOptions,
    setSelectedFunctionalClassificationOptions,
    setMinAmount,
    setMaxAmount,
    setSelectedAccountTypeOptions,
    setReportType,
    setIsMainCreditor,
    setIsUat,
    setFunctionalPrefix,
    setEconomicPrefix,
    setSelectedEntityTypeOptions,
  } = useFilterSearch();

  // Auto-save whenever series data changes
  useEffect(() => {
    if (!hasInitializedFilters || !series) return;
    
    const timeoutId = setTimeout(() => {
      onUpdateSeries(series.id, {
        filter: currentFilterState as AnalyticsFilterType,
        updatedAt: new Date()
      });
    }, 1000); // Debounce auto-save by 1 second

    return () => clearTimeout(timeoutId);
  }, [currentFilterState, hasInitializedFilters, series?.id, onUpdateSeries]);

  // Initialize filters from series configuration when component mounts
  useEffect(() => {
    if (!series?.filter || hasInitializedFilters) return;
    
    // Set filter state from series configuration
    if (series.filter.entity_cuis) {
      setSelectedEntityOptions(series.filter.entity_cuis.map(cui => ({ id: cui, value: cui, label: cui })));
    }
    if (series.filter.uat_ids) {
      setSelectedUatOptions(series.filter.uat_ids.map(id => ({ id: id.toString(), value: id, label: id.toString() })));
    }
    if (series.filter.economic_codes) {
      setSelectedEconomicClassificationOptions(series.filter.economic_codes.map(code => ({ id: code, value: code, label: code })));
    }
    if (series.filter.functional_codes) {
      setSelectedFunctionalClassificationOptions(series.filter.functional_codes.map(code => ({ id: code, value: code, label: code })));
    }
    if (series.filter.account_category) {
      // TODO: fix this
      // setSelectedAccountTypeOption(series.filter.account_category.map(cat => ({ 
      //   id: cat,
      //   value: cat, 
      //   label: cat === 'ch' ? 'Cheltuieli' : 'Venituri' 
      // })));
    }
    if (series.filter.report_type) {
      setReportType(series.filter.report_type);
    }
    if (series.filter.min_amount !== undefined) {
      setMinAmount(series.filter.min_amount.toString());
    }
    if (series.filter.max_amount !== undefined) {
      setMaxAmount(series.filter.max_amount.toString());
    }
    if (series.filter.is_main_creditor !== undefined) {
      setIsMainCreditor(series.filter.is_main_creditor);
    }
    if (series.filter.is_uat !== undefined) {
      setIsUat(series.filter.is_uat);
    }
    if (series.filter.functional_prefixes && series.filter.functional_prefixes.length > 0) {
      setFunctionalPrefix(series.filter.functional_prefixes[0]);
    }
    if (series.filter.economic_prefixes && series.filter.economic_prefixes.length > 0) {
      setEconomicPrefix(series.filter.economic_prefixes[0]);
    }
    if (series.filter.entity_types) {
      setSelectedEntityTypeOptions(series.filter.entity_types.map(type => ({ id: type, value: type, label: type })));
    }
    
    setHasInitializedFilters(true);
  }, [series?.filter, hasInitializedFilters, setSelectedYearOptions, setSelectedEntityOptions, setSelectedUatOptions, setSelectedEconomicClassificationOptions, setSelectedFunctionalClassificationOptions, setSelectedAccountTypeOptions, setReportType, setMinAmount, setMaxAmount, setIsMainCreditor, setIsUat, setFunctionalPrefix, setEconomicPrefix, setSelectedEntityTypeOptions]);

  // Update series label with auto-save
  const updateSeriesField = (field: keyof SeriesConfiguration, value: string | object) => {
    if (!series) return;
    onUpdateSeries(series.id, { [field]: value, updatedAt: new Date() });
  };

  // Calculate active filter count for display
  const activeFilterCount = [
    selectedYearOptions,
    selectedEntityOptions,
    selectedUatOptions,
    selectedEconomicClassificationOptions,
    selectedFunctionalClassificationOptions,
    selectedAccountTypeOptions,
    selectedEntityTypeOptions,
  ].reduce((count, options) => count + options.length, 0) +
    (minAmount ? 1 : 0) +
    (maxAmount ? 1 : 0) +
    (reportType ? 1 : 0) +
    (isMainCreditor !== undefined ? 1 : 0) +
    (isUat !== undefined ? 1 : 0) +
    (functionalPrefix ? 1 : 0) +
    (economicPrefix ? 1 : 0);

  if (!series) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Series not found</p>
          <Button onClick={onBack} className="mt-4">
            Back to Overview
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Filter Summary - Moved to top */}
      {activeFilterCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Applied Filters ({activeFilterCount})
            </CardTitle>
            <CardDescription>
              Current filter configuration for this data series
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {selectedYearOptions.length > 0 && (
                <div className="flex flex-col gap-1">
                  <strong className="text-foreground">Years:</strong>
                  <div className="flex flex-wrap gap-1">
                    {selectedYearOptions.map(year => (
                      <Badge key={year.id} variant="secondary" className="text-xs">
                        {year.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {selectedEntityOptions.length > 0 && (
                <div className="flex flex-col gap-1">
                  <strong className="text-foreground">Entities:</strong>
                  <Badge variant="outline" className="text-xs w-fit">
                    {selectedEntityOptions.length} selected
                  </Badge>
                </div>
              )}
              {selectedAccountTypeOptions.length > 0 && (
                <div className="flex flex-col gap-1">
                  <strong className="text-foreground">Account Types:</strong>
                  <div className="flex flex-wrap gap-1">
                    {selectedAccountTypeOptions.map(account => (
                      <Badge key={account.id} variant="secondary" className="text-xs">
                        {account.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {selectedEconomicClassificationOptions.length > 0 && (
                <div className="flex flex-col gap-1">
                  <strong className="text-foreground">Economic Classifications:</strong>
                  <Badge variant="outline" className="text-xs w-fit">
                    {selectedEconomicClassificationOptions.length} selected
                  </Badge>
                </div>
              )}
              {selectedFunctionalClassificationOptions.length > 0 && (
                <div className="flex flex-col gap-1">
                  <strong className="text-foreground">Functional Classifications:</strong>
                  <Badge variant="outline" className="text-xs w-fit">
                    {selectedFunctionalClassificationOptions.length} selected
                  </Badge>
                </div>
              )}
              {reportType && (
                <div className="flex flex-col gap-1">
                  <strong className="text-foreground">Report Type:</strong>
                  <Badge variant="secondary" className="text-xs w-fit">{reportType}</Badge>
                </div>
              )}
              {(minAmount || maxAmount) && (
                <div className="flex flex-col gap-1">
                  <strong className="text-foreground">Amount Range:</strong>
                  <Badge variant="secondary" className="text-xs w-fit">
                    {minAmount ? `≥ ${minAmount.toLocaleString()} RON` : ''} 
                    {minAmount && maxAmount ? ' - ' : ''}
                    {maxAmount ? `≤ ${maxAmount.toLocaleString()} RON` : ''}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Series Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Series Configuration</CardTitle>
          <CardDescription>
            Configure the label and appearance for this data series. Changes are automatically saved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="series-label">Series Label *</Label>
            <Input
              id="series-label"
              value={series?.label || ''}
              onChange={(e) => updateSeriesField('label', e.target.value)}
              placeholder="Enter series label..."
            />
            {validationErrors[`series.${series?.id}.label`] && (
              <p className="text-sm text-destructive">
                {validationErrors[`series.${series?.id}.label`][0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="series-color">Series Color</Label>
            <div className="flex items-center gap-2">
              <input
                id="series-color"
                type="color"
                value={series?.config.color || chart.config.color}
                onChange={(e) => updateSeriesField('config', { ...series?.config, color: e.target.value })}
                className="w-12 h-8 rounded border cursor-pointer"
              />
              <span className="text-sm text-muted-foreground">
                {series?.config.color || chart.config.color}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Data Filters</CardTitle>
          <CardDescription>
            Use the filter options below to specify which data should be included in this series.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LineItemsFilter isInModal={true} />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button onClick={onBack} variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Back to Configuration
        </Button>
        
        <Button
          onClick={() => onDeleteSeries(series?.id || '')}
          variant="destructive"
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete Series
        </Button>
      </div>
    </div>
  );
} 