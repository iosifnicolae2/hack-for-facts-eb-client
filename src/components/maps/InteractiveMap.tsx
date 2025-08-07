import 'leaflet/dist/leaflet.css';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
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
  PERMANENT_HIGHLIGHT_STYLE,
} from './constants';
import { HeatmapJudetDataPoint, HeatmapUATDataPoint } from '@/schemas/heatmap';
import { useMapFilter } from '@/lib/hooks/useMapFilterStore';
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
  highlightedFeatureId,
  scrollWheelZoom = true,
}) => {
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const { mapViewType } = useMapFilter();

  console.log('heatmapData', heatmapData);

  const heatmapDataMap = useMemo(() => {
    const map = new Map<string | number, HeatmapUATDataPoint | HeatmapJudetDataPoint>();
    console.log('updating heatmapDataMap');
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
      minZoom={minZoom}
      maxZoom={maxZoom}
      maxBounds={maxBounds}
      scrollWheelZoom={scrollWheelZoom}
      style={{ height: '100vh', width: '100%', backgroundColor: 'transparent' }}
      className="z-10"
      preferCanvas={true}
    >
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