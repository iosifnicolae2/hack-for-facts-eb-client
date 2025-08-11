import 'leaflet/dist/leaflet.css';
import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
import L, { LeafletMouseEvent, PathOptions, Layer, LatLngExpression, LatLngBoundsExpression } from 'leaflet';
import { Feature, Geometry, GeoJsonObject } from 'geojson';
import { createTooltipContent, buildHeatmapDataMap, restyleAllFeatures, getStyleForFeature } from './utils';
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
import { ScrollWheelZoomControl } from './ScrollWheelZoomControl';
import { AnalyticsFilterType } from '@/schemas/charts';


interface InteractiveMapProps {
  onFeatureClick: (properties: UatProperties, event: LeafletMouseEvent) => void;
  getFeatureStyle: (feature: UatFeature, heatmapDataMap: Map<string | number, HeatmapUATDataPoint | HeatmapJudetDataPoint>) => PathOptions;
  center?: LatLngExpression;
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  maxBounds?: LatLngBoundsExpression;
  heatmapData: HeatmapUATDataPoint[] | HeatmapJudetDataPoint[];
  geoJsonData: GeoJsonObject | null;
  highlightedFeatureId?: string | number;
  scrollWheelZoom?: boolean;
  mapHeight?: string;
  mapViewType: 'UAT' | 'Judet';
  filters: AnalyticsFilterType;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = React.memo(({
  onFeatureClick,
  getFeatureStyle,
  center = DEFAULT_MAP_CENTER,
  zoom = DEFAULT_MAP_ZOOM,
  minZoom = DEFAULT_MIN_ZOOM,
  maxZoom = DEFAULT_MAX_ZOOM,
  maxBounds = DEFAULT_MAX_BOUNDS,
  mapHeight = '100vh',
  mapViewType,
  heatmapData,
  geoJsonData,
  highlightedFeatureId,
  scrollWheelZoom = true,
  filters,
}) => {
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const latestStyleFnRef = useRef<(feature?: Feature<Geometry, unknown>) => PathOptions>(() => DEFAULT_FEATURE_STYLE);

  const heatmapDataMap = useMemo(() => buildHeatmapDataMap(heatmapData), [heatmapData]);

  const heatmapDataContentHash = useMemo(() => generateHash(JSON.stringify(heatmapData)), [heatmapData]);

  const highlightFeature = useCallback((layer: Layer) => {
    if (layer instanceof L.Path) {
      layer.setStyle(HIGHLIGHT_FEATURE_STYLE);
      layer.bringToFront();
    }
  }, []);


  const styleFunction = useCallback(
    (feature?: Feature<Geometry, unknown>): PathOptions =>
      getStyleForFeature(feature, { heatmapDataMap, getFeatureStyle, highlightedFeatureId }),
    [heatmapDataMap, getFeatureStyle, highlightedFeatureId]
  );

  // Keep a ref to the latest style function so event handlers always use fresh logic
  useEffect(() => {
    latestStyleFnRef.current = styleFunction;
  }, [styleFunction]);

  // Re-apply styles to all features when the style function logic changes (e.g., normalization toggles)
  useEffect(() => {
    restyleAllFeatures(geoJsonLayerRef.current, latestStyleFnRef.current);
  }, [styleFunction]);


  const onEachFeature = useCallback(
    (feature: Feature<Geometry, unknown>, layer: Layer) => {
      if (!feature.properties) return;

      const uatProps = feature.properties as UatProperties;

      // Lazy tooltip creation: create it only on mouseover for better initial performance.
      layer.on({
        mouseover: (e) => {
          highlightFeature(e.target);
          if (!layer.getTooltip()) {
            const tooltipHtml = createTooltipContent(uatProps, heatmapData, mapViewType, filters);
            layer.bindTooltip(tooltipHtml).openTooltip();
          }
        },
        mouseout: (e) => {
          // Use latest style function to avoid stale styling after data/normalization changes
          const nextStyle = latestStyleFnRef.current(feature);
          (e.target as L.Path).setStyle(nextStyle);
        },
        click: (e) => {
          onFeatureClick(uatProps, e);
        },
      });
    },
    [highlightFeature, onFeatureClick, heatmapData, mapViewType, filters]
  );

  if (!geoJsonData) {
    return <div className="p-4 text-center text-muted-foreground">Map geometry not available.</div>;
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      zoomSnap={0.1}
      wheelPxPerZoomLevel={3}
      minZoom={minZoom}
      maxZoom={maxZoom}
      maxBounds={maxBounds}
      scrollWheelZoom={false}
      style={{ height: mapHeight, width: '100%', backgroundColor: 'transparent' }}
      className="z-0 isolate"
      preferCanvas={true}
    >
      {scrollWheelZoom !== false && <ScrollWheelZoomControl />}
      <MapUpdater center={center} zoom={zoom} />
      {geoJsonData.type === 'FeatureCollection' && (
        <GeoJSON
          key={`geojson-layer-${mapViewType}-${heatmapDataContentHash}-${highlightedFeatureId}`}
          ref={geoJsonLayerRef}
          data={geoJsonData}
          style={styleFunction}
          onEachFeature={onEachFeature}
        />
      )}
    </MapContainer>
  );
});


/**
 * This component is used to update the map center and zoom when the center or zoom changes.
 * It is used to ensure that the map is updated when the center or zoom changes.
 * It is used to ensure that the map is updated when the center or zoom changes.
 */
const MapUpdater: React.FC<{ center: LatLngExpression, zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};