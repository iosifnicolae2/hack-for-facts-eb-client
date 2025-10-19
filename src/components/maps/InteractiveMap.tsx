import 'leaflet/dist/leaflet.css';
import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { MapContainer, GeoJSON, useMap, useMapEvents } from 'react-leaflet';
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
import { HeatmapCountyDataPoint, HeatmapUATDataPoint } from '@/schemas/heatmap';
import { generateHash } from '@/lib/utils';
import { ScrollWheelZoomControl } from './ScrollWheelZoomControl';
import { AnalyticsFilterType } from '@/schemas/charts';
import { AnimatePresence, motion } from 'framer-motion';
import { Analytics } from '@/lib/analytics';
import { MapLabels } from './MapLabels';


interface InteractiveMapProps {
  onFeatureClick: (properties: UatProperties, event: LeafletMouseEvent) => void;
  getFeatureStyle: (feature: UatFeature, heatmapDataMap: Map<string | number, HeatmapUATDataPoint | HeatmapCountyDataPoint>) => PathOptions;
  center?: LatLngExpression;
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  maxBounds?: LatLngBoundsExpression;
  heatmapData: HeatmapUATDataPoint[] | HeatmapCountyDataPoint[];
  geoJsonData: GeoJsonObject | null;
  highlightedFeatureId?: string | number;
  scrollWheelZoom?: boolean;
  mapHeight?: string;
  mapViewType: 'UAT' | 'County';
  filters: AnalyticsFilterType;
  showLabels?: boolean;
  onViewChange?: (center: [number, number], zoom: number) => void;
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
  showLabels = true,
  onViewChange,
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
          Analytics.capture(Analytics.EVENTS.MapFeatureClicked, {
            map_view_type: mapViewType,
            feature_id: uatProps?.natcode ?? uatProps?.mnemonic ?? uatProps?.id,
          });
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
    <AnimatePresence>
      <motion.div
        key="map-container"
        initial={{ opacity: 0.5, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0.5, scale: 0.99 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
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
          <MapViewChangeListener onViewChange={onViewChange} />
          {geoJsonData.type === 'FeatureCollection' && (
            <>
              <GeoJSON
                key={`geojson-layer-${mapViewType}-${heatmapDataContentHash}-${highlightedFeatureId}`}
                ref={geoJsonLayerRef}
                data={geoJsonData}
                style={styleFunction}
                onEachFeature={onEachFeature}
              />
              <MapLabels
                geoJsonData={geoJsonData}
                showLabels={showLabels}
                mapViewType={mapViewType}
                heatmapDataMap={heatmapDataMap}
                normalization={filters.normalization || 'total'}
              />
            </>
          )}
        </MapContainer>
      </motion.div>
    </AnimatePresence>
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

/**
 * Listens for user-initiated map view changes and reports them upstream.
 * Uses 'moveend' and 'zoomend' to avoid noisy updates while panning/zooming.
 */
const MapViewChangeListener: React.FC<{ onViewChange?: (center: [number, number], zoom: number) => void }> = ({ onViewChange }) => {
  useMapEvents({
    moveend: (e) => {
      if (!onViewChange) return;
      const map = e.target as L.Map;
      const c = map.getCenter();
      const z = map.getZoom();
      onViewChange([Number(c.lat), Number(c.lng)], Number(z));
    },
    zoomend: (e) => {
      if (!onViewChange) return;
      const map = e.target as L.Map;
      const c = map.getCenter();
      const z = map.getZoom();
      onViewChange([Number(c.lat), Number(c.lng)], Number(z));
    },
  });
  return null;
};
