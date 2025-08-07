import React, { useMemo } from 'react';
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
import { HeatmapJudetDataPoint, HeatmapUATDataPoint } from '@/schemas/heatmap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UatProperties } from '@/components/maps/interfaces';
import { useHeatmapData } from '@/hooks/useHeatmapData';
import { MapFilters } from '@/schemas/map-filters';

interface MapViewProps {
  entity: EntityDetailsData | null;
  mapFilters: MapFilters;
  updateMapFilters: (filters: Partial<MapFilters>) => void;
}

export const MapView: React.FC<MapViewProps> = ({ entity, mapFilters, updateMapFilters }) => {
  const mapViewType = entity?.entity_type === 'admin_county_council' ? 'Judet' : 'UAT';
  const navigate = useNavigate();

  const {
    data: geoJsonData,
    isLoading: isLoadingGeoJson,
    error: geoJsonError,
  } = useGeoJsonData(mapViewType);

  const mapHeight = '60vh';
  const { center, zoom, featureId } = useMemo(() => {
    const defaultState = { center: undefined, zoom: 7, featureId: '' };
    if (!entity || !geoJsonData) {
      return defaultState;
    }

    const featureInfo = getEntityFeatureInfo(entity, geoJsonData);
    if (!featureInfo) {
      return defaultState;
    } else {
      return featureInfo;
    }
  }, [entity, geoJsonData]);

  const {
    data: heatmapData,
    isLoading: isLoadingHeatmap,
    error: heatmapError,
  } = useHeatmapData(mapFilters, mapViewType);

  const { min: minAggregatedValue, max: maxAggregatedValue } = useMemo(() => {
    if (!heatmapData || !Array.isArray(heatmapData)) return { min: 0, max: 0 };
    return getPercentileValues(heatmapData, 5, 95, mapFilters.normalization === 'per_capita' ? 'per_capita_amount' : 'total_amount');
  }, [heatmapData, mapFilters.normalization]);

  const getFeatureStyle = useMemo(() => {
    if (!heatmapData || !Array.isArray(heatmapData)) {
      return () => ({});
    }
    const valueKey = mapFilters.normalization === 'per_capita' ? 'per_capita_amount' : 'total_amount';
    return createHeatmapStyleFunction(heatmapData, minAggregatedValue, maxAggregatedValue, mapViewType, valueKey);
  }, [heatmapData, minAggregatedValue, maxAggregatedValue, mapViewType, mapFilters.normalization]);

  const handleOpenMap = () => {

    navigate({
      to: '/map',
      search: {
        filters: mapFilters,
        mapViewType: mapViewType,
        activeView: 'map',
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
            <ToggleGroup type="single" size="sm" value={mapFilters.account_categories[0]} onValueChange={(value: 'vn' | 'ch') => { if (value) updateMapFilters({ account_categories: [value] }) }}>
              <ToggleGroupItem value="ch">Cheltuieli</ToggleGroupItem>
              <ToggleGroupItem value="vn">Venituri</ToggleGroupItem>
            </ToggleGroup>
            <ToggleGroup type="single" size="sm" value={mapFilters.normalization} onValueChange={(value: 'per_capita' | 'total') => { if (value) updateMapFilters({ normalization: value }) }}>
              <ToggleGroupItem value="per_capita">Per Capita</ToggleGroupItem>
              <ToggleGroupItem value="total">Total</ToggleGroupItem>
            </ToggleGroup>
            <Button onClick={handleOpenMap} variant="outline" size="sm">
              <Maximize className="mr-2 h-4 w-4" />
              Explore Full Map
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full relative rounded-md overflow-hidden border" style={{ height: mapHeight }}>
          {(isLoadingGeoJson || isLoadingHeatmap) &&
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-20">
              <LoadingSpinner text={isLoadingGeoJson ? "Loading map geometry..." : "Loading financial data..."} />
            </div>
          }
          {geoJsonData && (
            <InteractiveMap
              onFeatureClick={handleFeatureClick}
              getFeatureStyle={getFeatureStyle}
              heatmapData={heatmapData || []}
              geoJsonData={geoJsonData}
              center={center}
              zoom={zoom}
              highlightedFeatureId={featureId?.toString()}
              scrollWheelZoom={false}
              mapHeight={mapHeight}
              mapViewType={mapViewType}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};