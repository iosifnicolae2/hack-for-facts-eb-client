import L from 'leaflet';
import { GeoJsonObject, Feature, Geometry } from 'geojson';
import { HeatmapCountyDataPoint, HeatmapUATDataPoint } from '@/schemas/heatmap';
import { processFeatureForLabel, PolygonLabelData } from './polygonLabels';

interface CanvasLabelLayerOptions extends L.LayerOptions {
  geoJsonData: GeoJsonObject | null;
  mapViewType: 'UAT' | 'County';
  heatmapDataMap: Map<string | number, HeatmapUATDataPoint | HeatmapCountyDataPoint>;
  normalization: 'per_capita' | 'total';
  showLabels?: boolean;
}

/**
 * High-performance canvas-based label layer for Leaflet maps.
 * Uses native canvas rendering with hardware acceleration, avoiding React overhead.
 */
export class CanvasLabelLayer extends L.Layer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private labels: PolygonLabelData[] = [];
  private layerOptions: CanvasLabelLayerOptions;
  private animationFrameId: number | null = null;
  private isZooming = false;
  private isPanning = false;
  private origin: L.Point = L.point(0, 0);

  constructor(options: CanvasLabelLayerOptions) {
    super(options);
    this.layerOptions = options;
  }

  onAdd(map: L.Map): this {
    // Create canvas element
    this.canvas = L.DomUtil.create('canvas', 'leaflet-zoom-hide leaflet-label-layer');
    this.ctx = this.canvas.getContext('2d', {
      alpha: true,
      // Hint to browser that we want performance over quality
      desynchronized: true,
    });

    if (!this.ctx) {
      console.error('Failed to get canvas 2D context');
      return this;
    }

    // Configure canvas for crisp rendering
    this.canvas.style.position = 'absolute';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '450';

    // Add to map pane
    const pane = map.getPane('overlayPane');
    if (pane) {
      pane.appendChild(this.canvas);
    }

    // Register event handlers
    map.on('zoom', this.handleZoom, this);
    map.on('zoomstart', this.handleZoomStart, this);
    map.on('zoomend', this.handleZoomEnd, this);
    map.on('movestart', this.handleMoveStart, this);
    map.on('move', this.handleMove, this);
    map.on('moveend', this.handleMoveEnd, this);
    map.on('resize', this.handleResize, this);
    map.on('viewreset', this.reset, this);

    // Initial setup
    this.reset();
    this.processLabels();
    this.scheduleRedraw();

    return this;
  }

  onRemove(map: L.Map): this {
    // Clean up event handlers
    map.off('zoom', this.handleZoom, this);
    map.off('zoomstart', this.handleZoomStart, this);
    map.off('zoomend', this.handleZoomEnd, this);
    map.off('movestart', this.handleMoveStart, this);
    map.off('move', this.handleMove, this);
    map.off('moveend', this.handleMoveEnd, this);
    map.off('resize', this.handleResize, this);
    map.off('viewreset', this.reset, this);

    // Cancel pending animation frame
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Remove canvas
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    this.canvas = null;
    this.ctx = null;

    return this;
  }

  /**
   * Update layer options and trigger recalculation
   */
  updateOptions(options: Partial<CanvasLabelLayerOptions>): void {
    this.layerOptions = { ...this.layerOptions, ...options };
    this.processLabels();
    this.scheduleRedraw();
  }

  /**
   * Process GeoJSON features to extract label data
   * Only processes features that intersect with the current viewport
   */
  private processLabels(): void {
    const { geoJsonData, mapViewType, heatmapDataMap, normalization, showLabels } = this.layerOptions;

    if (!geoJsonData || geoJsonData.type !== 'FeatureCollection' || !showLabels || !this._map) {
      this.labels = [];
      return;
    }

    const currentZoom = this._map.getZoom();
    const viewportBounds = this._map.getBounds();
    const labelData: PolygonLabelData[] = [];

    const features = 'features' in geoJsonData ? geoJsonData.features : [];
    for (const feature of features as Feature<Geometry, any>[]) {
      // Quick viewport check before processing
      if (!this.featureIntersectsViewport(feature, viewportBounds)) {
        continue;
      }

      const labelInfo = processFeatureForLabel(
        feature,
        this._map,
        currentZoom,
        mapViewType,
        heatmapDataMap,
        normalization
      );
      if (labelInfo) {
        labelData.push(labelInfo);
      }
    }

    this.labels = labelData;
  }

  /**
   * Quick check if a feature might intersect with viewport
   * Uses a bounding box check for performance
   */
  private featureIntersectsViewport(feature: Feature<Geometry, any>, viewportBounds: L.LatLngBounds): boolean {
    const geometry = feature.geometry;
    if (!geometry) return false;

    // Get all coordinates from the geometry
    let coords: number[][] = [];
    if (geometry.type === 'Polygon') {
      coords = geometry.coordinates[0];
    } else if (geometry.type === 'MultiPolygon') {
      // Flatten all polygons
      geometry.coordinates.forEach(polygon => {
        coords.push(...polygon[0]);
      });
    } else {
      return false;
    }

    // Check if any coordinate is within viewport
    for (const coord of coords) {
      const latLng = L.latLng(coord[1], coord[0]);
      if (viewportBounds.contains(latLng)) {
        return true;
      }
    }

    // Check if viewport is completely inside the polygon (rare but possible)
    // For performance, we'll just check the center
    const center = viewportBounds.getCenter();
    return this.pointInPolygon(center, coords);
  }

  /**
   * Simple point-in-polygon check
   */
  private pointInPolygon(point: L.LatLng, polygon: number[][]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1];
      const xj = polygon[j][0], yj = polygon[j][1];

      const intersect = ((yi > point.lat) !== (yj > point.lat))
        && (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  /**
   * Reset canvas size and position
   */
  private reset(): void {
    if (!this.canvas || !this._map) return;

    const size = this._map.getSize();
    const topLeft = this._map.containerPointToLayerPoint([0, 0]);

    // Update canvas dimensions (accounting for device pixel ratio for crisp rendering)
    const devicePixelRatio = window.devicePixelRatio || 1;
    this.canvas.width = size.x * devicePixelRatio;
    this.canvas.height = size.y * devicePixelRatio;
    this.canvas.style.width = `${size.x}px`;
    this.canvas.style.height = `${size.y}px`;

    // Position canvas
    L.DomUtil.setPosition(this.canvas, topLeft);
    this.origin = topLeft.clone();

    // Scale context for device pixel ratio
    if (this.ctx) {
      this.ctx.scale(devicePixelRatio, devicePixelRatio);
    }
  }

  /**
   * Update canvas position without resizing (for smooth pan operations)
   */
  private updatePosition(): void {
    if (!this.canvas || !this._map) return;
    const topLeft = this._map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(this.canvas, topLeft);
    this.origin = topLeft.clone();
  }

  /**
   * Handle resize events
   */
  private handleResize(): void {
    this.reset();
    this.scheduleRedraw();
  }

  /**
   * Handle zoom start (hide labels during zoom)
   */
  private handleZoomStart(): void {
    this.isZooming = true;
    this.clearCanvas();
  }

  /**
   * Handle zoom events
   */
  private handleZoom(): void {
    // Update canvas position during zoom
    this.reset();
  }

  /**
   * Handle zoom end (recalculate and show labels)
   */
  private handleZoomEnd(): void {
    this.isZooming = false;
    this.processLabels();
    this.scheduleRedraw();
  }

  /**
   * Handle movement start (pan/drag start)
   */
  private handleMoveStart(): void {
    this.isPanning = true;
    this.clearCanvas();
  }

  /**
   * Handle map movement (pan/drag)
   */
  private handleMove(): void {
    // Keep canvas hidden during pan
  }

  /**
   * Handle movement end (recalculate labels)
   */
  private handleMoveEnd(): void {
    this.isPanning = false;
    this.updatePosition();
    this.processLabels();
    this.scheduleRedraw();
  }

  /**
   * Schedule a redraw using requestAnimationFrame for smooth performance
   */
  private scheduleRedraw(): void {
    if (this.animationFrameId !== null || this.isZooming || this.isPanning) {
      return;
    }

    this.animationFrameId = requestAnimationFrame(() => {
      this.draw();
      this.animationFrameId = null;
    });
  }

  /**
   * Clear the canvas
   */
  private clearCanvas(): void {
    if (!this.canvas || !this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Main draw method - renders all labels to canvas
   */
  private draw(): void {
    if (!this.canvas || !this.ctx || !this._map || this.isZooming || this.isPanning) {
      return;
    }

    const { showLabels } = this.layerOptions;
    if (!showLabels || this.labels.length === 0) {
      this.clearCanvas();
      return;
    }

    // Clear canvas
    this.clearCanvas();

    // Configure context for high-quality text rendering
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Get viewport bounds for filtering
    const viewportBounds = this._map.getBounds();

    // Draw each label (only those in viewport)
    for (const label of this.labels) {
      if (!label.visible) continue;

      // Check if label is in viewport
      const labelLatLng = L.latLng(label.position[0], label.position[1]);
      if (!viewportBounds.contains(labelLatLng)) continue;

      // Convert lat/lng to layer coordinates (relative to canvas origin)
      const point = this._map.latLngToLayerPoint(labelLatLng);
      const local = point.subtract(this.origin);

      // Draw label name
      this.drawText(
        label.text,
        local.x,
        label.showAmount ? local.y - 6 : local.y,
        label.fontSize,
        '#1f2937',
        '#ffffff',
        3,
        600
      );

      // Draw amount if visible
      if (label.showAmount && label.amount) {
        this.drawText(
          label.amount,
          local.x,
          local.y + label.fontSize * 0.7,
          label.fontSize * 0.75,
          '#4b5563',
          '#ffffff',
          2.5,
          500
        );
      }
    }
  }

  /**
   * Draw text with stroke (outline) effect for better readability
   */
  private drawText(
    text: string,
    x: number,
    y: number,
    fontSize: number,
    fillColor: string,
    strokeColor: string,
    strokeWidth: number,
    fontWeight: number
  ): void {
    if (!this.ctx) return;

    this.ctx.font = `${fontWeight} ${fontSize}px Inter, system-ui, sans-serif`;

    // Draw stroke first (outline)
    this.ctx.strokeStyle = strokeColor;
    this.ctx.lineWidth = strokeWidth;
    this.ctx.lineJoin = 'round';
    this.ctx.strokeText(text, x, y);

    // Draw fill on top
    this.ctx.fillStyle = fillColor;
    this.ctx.fillText(text, x, y);
  }
}

/**
 * Factory function to create a canvas label layer
 */
export function createCanvasLabelLayer(options: CanvasLabelLayerOptions): CanvasLabelLayer {
  return new CanvasLabelLayer(options);
}

