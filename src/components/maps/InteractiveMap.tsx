import 'leaflet/dist/leaflet.css';
import React, { useCallback, useMemo, useRef } from 'react';
import { MapContainer, GeoJSON } from 'react-leaflet';
import L, { LeafletMouseEvent, PathOptions, Layer, LatLngExpression, LatLngBoundsExpression } from 'leaflet';
import { Feature, Geometry, GeoJsonObject } from 'geojson';
import { createTooltipContent } from './utils';
import { UatProperties, UatFeature } from './interfaces';
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  DEFAULT_FEATURE_STYLE,
  HIGHLIGHT_FEATURE_STYLE,
  DEFAULT_MIN_ZOOM,
  DEFAULT_MAX_ZOOM,
  DEFAULT_MAX_BOUNDS,
} from './constants';
import { HeatmapJudetDataPoint, HeatmapUATDataPoint } from '@/schemas/heatmap';
import { generateHash } from '@/lib/utils';
import { useMapFilter } from '@/lib/hooks/useMapFilterStore';

interface InteractiveMapProps {
  onFeatureClick: (properties: UatProperties, event: LeafletMouseEvent) => void;
  getFeatureStyle: (feature: UatFeature, heatmapData: (HeatmapUATDataPoint | HeatmapJudetDataPoint)[]) => PathOptions;
  center?: LatLngExpression;
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  maxBounds?: LatLngBoundsExpression;
  heatmapData: HeatmapUATDataPoint[] | HeatmapJudetDataPoint[];
  geoJsonData: GeoJsonObject | null;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = React.memo(({
  onFeatureClick,
  getFeatureStyle,
  center = DEFAULT_MAP_CENTER,
  zoom = DEFAULT_MAP_ZOOM,
  minZoom = DEFAULT_MIN_ZOOM,
  maxZoom = DEFAULT_MAX_ZOOM,
  maxBounds = DEFAULT_MAX_BOUNDS,
  heatmapData,
  geoJsonData,
}) => {
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const { mapViewType } = useMapFilter();
  const handleFeatureClick = useCallback(
    (feature: UatFeature, event: LeafletMouseEvent) => {
      if (onFeatureClick && feature.properties) {
        onFeatureClick(feature.properties, event);
      }
    },
    [onFeatureClick]
  );

  const highlightFeature = useCallback((layer: Layer) => {
    if (layer instanceof L.Path) {
      layer.setStyle(HIGHLIGHT_FEATURE_STYLE);
      layer.bringToFront();
    }
  }, []);

  const resetHighlight = useCallback((layer: Layer) => {
    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.resetStyle(layer);
    }
  }, []);


  const onEachFeature = useCallback(
    (feature: Feature<Geometry, unknown>, layer: Layer) => {
      if (!feature.properties) {
        return;
      }
      const uatProperties = feature.properties as UatProperties;

      const tooltipContent = createTooltipContent(uatProperties, heatmapData, mapViewType);
      layer.bindTooltip(tooltipContent);

      layer.on({
        mouseover: (e) => highlightFeature(e.target),
        mouseout: (e) => resetHighlight(e.target),
        click: (e) => handleFeatureClick(feature as UatFeature, e),
      });
    },
    [handleFeatureClick, highlightFeature, resetHighlight, heatmapData, mapViewType]
  );

  const styleFunction = useCallback(
    (feature?: Feature<Geometry, unknown>): PathOptions => {
      if (getFeatureStyle && feature && feature.properties) {
        return getFeatureStyle(feature as UatFeature, heatmapData);
      }
      return DEFAULT_FEATURE_STYLE;
    },
    [getFeatureStyle, heatmapData]
  );

  const mapKey = useMemo(() => {
    const geoKeyPart = generateHash(JSON.stringify(geoJsonData));
    const heatmapKeyPart = generateHash(JSON.stringify(heatmapData));
    return `${geoKeyPart}-${heatmapKeyPart}`;
  }, [geoJsonData, heatmapData]);


  if (!geoJsonData) {
    return (
      <div className="p-4 text-center text-muted-foreground" role="status">
        Map geometry not available.
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      minZoom={minZoom}
      maxZoom={maxZoom}
      maxBounds={maxBounds}
      scrollWheelZoom={true}
      style={{ height: '100vh', width: '100%' }}
      className="bg-background z-10"
    >
      {geoJsonData && geoJsonData.type === 'FeatureCollection' && (
        <GeoJSON
          key={mapKey}
          ref={geoJsonLayerRef}
          data={geoJsonData}
          style={styleFunction}
          onEachFeature={onEachFeature}
        />
      )}
    </MapContainer>
  );
});