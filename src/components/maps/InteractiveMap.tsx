import 'leaflet/dist/leaflet.css';
import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
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
  PERMANENT_HIGHLIGHT_STYLE,
} from './constants';
import { HeatmapJudetDataPoint, HeatmapUATDataPoint } from '@/schemas/heatmap';
import { generateHash } from '@/lib/utils';


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
}) => {
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  const heatmapDataMap = useMemo(() => {
    const map = new Map<string | number, HeatmapUATDataPoint | HeatmapJudetDataPoint>();
    heatmapData.forEach(item => {
      const key = 'uat_code' in item ? item.uat_code : item.county_code;
      map.set(key, item);
    });
    return map;
  }, [heatmapData]);

  const heatmapDataHash = useMemo(() => {
    return generateHash(JSON.stringify(heatmapData));
  }, [heatmapData]);

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
      if (!feature.properties) return;

      const uatProperties = feature.properties as UatProperties;

      // Lazy tooltip creation: create it only on mouseover for better initial performance.
      layer.on({
        mouseover: (e) => {
          highlightFeature(e.target);
          if (!layer.getTooltip()) {
            const tooltipContent = createTooltipContent(uatProperties, heatmapData, mapViewType);
            layer.bindTooltip(tooltipContent).openTooltip();
          }
        },
        mouseout: (e) => resetHighlight(e.target),
        click: (e) => {
          if (onFeatureClick) {
            onFeatureClick(uatProperties, e);
          }
        },
      });
    },
    [highlightFeature, resetHighlight, onFeatureClick, heatmapData, mapViewType]
  );

  const styleFunction = useCallback(
    (feature?: Feature<Geometry, unknown>): PathOptions => {
      if (feature?.properties) {
        const uatProperties = feature.properties as UatProperties;
        const baseStyle = heatmapDataMap.size > 0 ? getFeatureStyle(feature as UatFeature, heatmapDataMap) : DEFAULT_FEATURE_STYLE;

        // Check if the feature is the one to be permanently highlighted
        if (highlightedFeatureId && (uatProperties.natcode === highlightedFeatureId || uatProperties.mnemonic === highlightedFeatureId)) {
          return { ...baseStyle, ...PERMANENT_HIGHLIGHT_STYLE };
        }

        return baseStyle;
      }
      return DEFAULT_FEATURE_STYLE;
    },
    [getFeatureStyle, heatmapDataMap, highlightedFeatureId]
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
      scrollWheelZoom={scrollWheelZoom}
      style={{ height: mapHeight, width: '100%', backgroundColor: 'transparent' }}
      className="z-10"
      preferCanvas={true}
    >
      <MapUpdater center={center} zoom={zoom} />
      {geoJsonData.type === 'FeatureCollection' && (
        <GeoJSON
          key={`geojson-layer-${mapViewType}-${heatmapDataHash}`}
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
}