import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Trash2, ArrowLeft, Filter } from 'lucide-react';
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

  // Initialize filter state from series when component mounts or series changes
  useEffect(() => {
    if (!series || hasInitializedFilters) return;

    console.log('Initializing filters from series:', series.filter);

    // Convert series filter back to UI state format
    const { filter } = series;

    // Clear existing filters first
    setSelectedYearOptions([]);
    setSelectedEntityOptions([]);
    setSelectedUatOptions([]);
    setSelectedEconomicClassificationOptions([]);
    setSelectedFunctionalClassificationOptions([]);
    setMinAmount(undefined);
    setMaxAmount(undefined);
    setSelectedAccountTypeOptions([]);
    setReportType(undefined);
    setIsMainCreditor(undefined);
    setIsUat(undefined);
    setFunctionalPrefix(undefined);
    setEconomicPrefix(undefined);
    setSelectedEntityTypeOptions([]);

    // Then set values from series filter
    if (filter.years?.length) {
      setSelectedYearOptions(filter.years.map(year => ({ id: year, label: String(year) })));
    }
    if (filter.entity_cuis?.length) {
      setSelectedEntityOptions(filter.entity_cuis.map(cui => ({ id: cui, label: cui })));
    }
    if (filter.uat_ids?.length) {
      setSelectedUatOptions(filter.uat_ids.map(id => ({ id: String(id), label: String(id) })));
    }
    if (filter.economic_codes?.length) {
      setSelectedEconomicClassificationOptions(filter.economic_codes.map(code => ({ id: code, label: code })));
    }
    if (filter.functional_codes?.length) {
      setSelectedFunctionalClassificationOptions(filter.functional_codes.map(code => ({ id: code, label: code })));
    }
    if (filter.min_amount !== undefined) {
      setMinAmount(String(filter.min_amount));
    }
    if (filter.max_amount !== undefined) {
      setMaxAmount(String(filter.max_amount));
    }
    if (filter.account_categories?.length) {
      setSelectedAccountTypeOptions(filter.account_categories.map(cat => ({ id: cat, label: cat === 'ch' ? 'Cheltuieli' : 'Venituri' })));
    }
    if (filter.report_type) {
      setReportType(filter.report_type);
    }
    if (filter.is_main_creditor !== undefined) {
      setIsMainCreditor(filter.is_main_creditor);
    }
    if (filter.is_uat !== undefined) {
      setIsUat(filter.is_uat);
    }
    if (filter.functional_prefixes?.length) {
      setFunctionalPrefix(filter.functional_prefixes[0]);
    }
    if (filter.economic_prefixes?.length) {
      setEconomicPrefix(filter.economic_prefixes[0]);
    }
    if (filter.entity_types?.length) {
      setSelectedEntityTypeOptions(filter.entity_types.map(type => ({ id: type, label: type })));
    }

    setHasInitializedFilters(true);
  }, [series, hasInitializedFilters]);

  // Reset initialization when series changes
  useEffect(() => {
    setHasInitializedFilters(false);
  }, [selectedSeriesId]);

  if (!series) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-muted-foreground">Series not found</p>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Overview
        </Button>
      </div>
    );
  }

  const updateSeriesField = (field: keyof SeriesConfiguration, value: string | AnalyticsFilterType | Date) => {
    onUpdateSeries(series.id, { [field]: value });
  };

  const updateSeriesConfig = (configUpdates: Partial<SeriesConfiguration['config']>) => {
    onUpdateSeries(series.id, {
      config: { ...series.config, ...configUpdates }
    });
  };

  const handleSaveFilters = () => {
    // Convert current filter state to AnalyticsFilter format and save to series
    const analyticsFilter: AnalyticsFilterType = {
      years: currentFilterState.years && currentFilterState.years.length > 0 ? currentFilterState.years : undefined,
      entity_cuis: currentFilterState.entity_cuis && currentFilterState.entity_cuis.length > 0 ? currentFilterState.entity_cuis : undefined,
      uat_ids: currentFilterState.uat_ids && currentFilterState.uat_ids.length > 0 ? currentFilterState.uat_ids : undefined,
      economic_codes: currentFilterState.economic_codes && currentFilterState.economic_codes.length > 0 ? currentFilterState.economic_codes : undefined,
      functional_codes: currentFilterState.functional_codes && currentFilterState.functional_codes.length > 0 ? currentFilterState.functional_codes : undefined,
      min_amount: currentFilterState.min_amount,
      max_amount: currentFilterState.max_amount,
      account_categories: currentFilterState.account_categories && currentFilterState.account_categories.length > 0 ? currentFilterState.account_categories : undefined,
      report_type: currentFilterState.report_type,
      is_main_creditor: currentFilterState.is_main_creditor,
      is_uat: currentFilterState.is_uat,
      functional_prefixes: currentFilterState.functional_prefixes,
      economic_prefixes: currentFilterState.economic_prefixes,
      entity_types: currentFilterState.entity_types && currentFilterState.entity_types.length > 0 ? currentFilterState.entity_types : undefined,
    };

    console.log('Saving filters to series:', analyticsFilter);
    
    onUpdateSeries(series.id, { 
      filter: analyticsFilter,
      updatedAt: new Date() 
    });
    
    onBack();
  };

  // Count active filters for display
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

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
      {/* Series Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Series Configuration</CardTitle>
          <CardDescription>
            Configure the label, color, and chart type for this data series
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="series-label">Series Label *</Label>
            <Input
              id="series-label"
              value={series.label}
              onChange={(e) => updateSeriesField('label', e.target.value)}
              placeholder="Enter series label..."
            />
            {validationErrors[`series.${series.id}.label`] && (
              <p className="text-sm text-destructive">
                {validationErrors[`series.${series.id}.label`][0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="series-color">Series Color</Label>
            <div className="flex gap-2">
              <Input
                id="series-color"
                type="color"
                value={series.config.color || chart.config.color}
                onChange={(e) => updateSeriesConfig({ color: e.target.value })}
                className="w-20 h-10 p-1 border rounded"
              />
              <Input
                value={series.config.color || chart.config.color}
                onChange={(e) => updateSeriesConfig({ color: e.target.value })}
                placeholder="#8884d8"
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Data Filters
              </CardTitle>
              <CardDescription>
                Configure the filters to determine what data this series will display
              </CardDescription>
            </div>
            {activeFilterCount > 0 && (
              <Badge variant="secondary">
                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            Use the filter options below to specify which data should be included in this series.
            The selected filters will be used to query the analytics API.
          </div>
          <LineItemsFilter isInModal={true} />
        </CardContent>
      </Card>

      {/* Filter Preview */}
      {activeFilterCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Filter Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground space-y-1">
              {selectedYearOptions.length > 0 && (
                <div><strong>Years:</strong> {selectedYearOptions.map(y => y.label).join(', ')}</div>
              )}
              {selectedEntityOptions.length > 0 && (
                <div><strong>Entities:</strong> {selectedEntityOptions.length} selected</div>
              )}
              {selectedAccountTypeOptions.length > 0 && (
                <div><strong>Account Types:</strong> {selectedAccountTypeOptions.map(a => a.label).join(', ')}</div>
              )}
              {reportType && (
                <div><strong>Report Type:</strong> {reportType}</div>
              )}
              {minAmount && <div><strong>Min Amount:</strong> {minAmount} RON</div>}
              {maxAmount && <div><strong>Max Amount:</strong> {maxAmount} RON</div>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button onClick={onBack} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Overview
        </Button>
        
        <div className="flex gap-2">
          <Button
            onClick={() => onDeleteSeries(series.id)}
            variant="destructive"
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Series
          </Button>
          <Button onClick={handleSaveFilters} className="gap-2">
            <Save className="h-4 w-4" />
            Save & Continue
          </Button>
        </div>
      </div>
    </div>
  );
} 