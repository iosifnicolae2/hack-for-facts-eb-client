import React, { useState, useMemo } from 'react';
import { InteractiveMap } from '@/components/maps/InteractiveMap';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useNavigate } from '@tanstack/react-router';
import { useGeoJsonData } from '@/hooks/useGeoJson';
import { createHeatmapStyleFunction, getPercentileValues } from '@/components/maps/utils';
import { EntityDetailsData } from '@/lib/api/entities';
import { getEntityFeatureInfo } from '@/components/entities/utils';
import { useEntityHeatmapData } from '@/hooks/useEntityHeatmapData';
import { HeatmapJudetDataPoint, HeatmapUATDataPoint } from '@/schemas/heatmap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UatProperties } from '@/components/maps/interfaces';
import { InternalMapFiltersState } from '@/lib/hooks/useMapFilterStore';

interface MapViewProps {
  entity: EntityDetailsData | null;
  selectedYear: number;
}

export const MapView: React.FC<MapViewProps> = ({ entity, selectedYear }) => {
  const [dataType, setDataType] = useState<'income' | 'expense'>('expense');
  const [normalization, setNormalization] = useState<'per_capita_amount' | 'total_amount'>('per_capita_amount');
  const navigate = useNavigate();

  const {
    data: geoJsonData,
    isLoading: isLoadingGeoJson,
    error: geoJsonError,
  } = useGeoJsonData();

  const { center, zoom, featureId } = useMemo(() => {
    const defaultState = { center: [43.9432, 24.9668] as [number, number], zoom: 7, featureId: '' };
    if (!entity || !geoJsonData) return defaultState;
    const featureInfo = getEntityFeatureInfo(entity, geoJsonData);
    if (!featureInfo) return defaultState;
    return featureInfo;
  }, [entity, geoJsonData]);

  const {
    data: heatmapData,
    isLoading: isLoadingHeatmap,
    error: heatmapError,
  } = useEntityHeatmapData(entity, selectedYear, dataType);

  const { min: minAggregatedValue, max: maxAggregatedValue } = useMemo(() => {
    if (!heatmapData || !Array.isArray(heatmapData)) return { min: 0, max: 0 };
    return getPercentileValues(heatmapData, 5, 95, normalization);
  }, [heatmapData, normalization]);

  const getFeatureStyle = useMemo(() => {
    if (!heatmapData || !Array.isArray(heatmapData)) return () => ({});
    return createHeatmapStyleFunction(heatmapData, minAggregatedValue, maxAggregatedValue, entity?.entity_type === 'JUDET' ? 'Judet' : 'UAT', normalization);
  }, [heatmapData, minAggregatedValue, maxAggregatedValue, entity?.entity_type, normalization]);

  const handleOpenMap = () => {
    const mapFilters: Partial<InternalMapFiltersState> = {
      years: [{ id: selectedYear, label: selectedYear.toString() }],
      accountCategory: { id: dataType === 'income' ? 'vn' : 'ch', label: dataType === 'income' ? 'Venituri' : 'Cheltuieli' },
      mapViewType: entity?.entity_type === 'JUDET' ? 'Judet' : 'UAT',
      normalization: { id: normalization === 'per_capita_amount' ? 'per-capita' : 'total', label: normalization === 'per_capita_amount' ? 'Per Capita' : 'Total' }
    };

    navigate({
      to: '/map',
      search: {
        'map-filters': JSON.stringify(mapFilters),
      },
    });
  };

  const handleFeatureClick = (properties: UatProperties) => {
    const clickedFeatureId = properties.natcode || properties.mnemonic;
    if (clickedFeatureId === featureId) return;

    const targetEntity = (heatmapData as (HeatmapUATDataPoint[] | HeatmapJudetDataPoint[]))?.find(d => {
      if ('uat_code' in d) return d.siruta_code?.toString() === clickedFeatureId;
      if ('county_code' in d) return d.county_code === clickedFeatureId;
      return false;
    });

    const cui = targetEntity && ('uat_code' in targetEntity ? targetEntity.uat_code : targetEntity.county_entity?.cui);

    if (cui) {
      navigate({ to: `/entities/${cui}` });
    }
  };

  const error = heatmapError || geoJsonError;

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{(error as Error).message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Geographical View</CardTitle>
          <div className="flex flex-wrap items-center gap-4">
            <ToggleGroup type="single" size="sm" value={dataType} onValueChange={(value: 'income' | 'expense') => { if (value) setDataType(value) }}>
              <ToggleGroupItem value="expense">Cheltuieli</ToggleGroupItem>
              <ToggleGroupItem value="income">Venituri</ToggleGroupItem>
            </ToggleGroup>
            <ToggleGroup type="single" size="sm" value={normalization} onValueChange={(value: 'per_capita_amount' | 'total_amount') => { if (value) setNormalization(value) }}>
              <ToggleGroupItem value="per_capita_amount">Per Capita</ToggleGroupItem>
              <ToggleGroupItem value="total_amount">Total</ToggleGroupItem>
            </ToggleGroup>
            <Button onClick={handleOpenMap} variant="outline" size="sm">
              <Maximize className="mr-2 h-4 w-4" />
              Explore Full Map
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[60vh] w-full relative rounded-md overflow-hidden border">
          {(isLoadingGeoJson || isLoadingHeatmap) &&
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-20">
              <LoadingSpinner text={isLoadingGeoJson ? "Loading map geometry..." : "Loading financial data..."} />
            </div>
          }
          {geoJsonData && (
            <InteractiveMap
              onFeatureClick={handleFeatureClick}
              getFeatureStyle={getFeatureStyle}
              heatmapData={heatmapData as (HeatmapUATDataPoint[] | HeatmapJudetDataPoint[]) || []}
              geoJsonData={geoJsonData}
              center={center}
              zoom={zoom}
              highlightedFeatureId={featureId?.toString()}
              scrollWheelZoom={false}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};