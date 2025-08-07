import { EntityDetailsData } from '@/lib/api/entities';
import { LatLngExpression } from 'leaflet';
import { GeoJsonObject, Feature, FeatureCollection } from 'geojson';
import bbox from '@turf/bbox';
import center from '@turf/center';

interface FeatureInfo {
    center: LatLngExpression;
    zoom: number;
    featureId: string | number;
}

export const getEntityFeatureInfo = (entity: EntityDetailsData, geoJsonData: GeoJsonObject): FeatureInfo | null => {
    if (geoJsonData.type !== 'FeatureCollection') {
        return null;
    }

    const featureCollection = geoJsonData as FeatureCollection;

    const feature = featureCollection.features.find((f: Feature) => {
        if (entity.entity_type === 'JUDET') {
            return f.properties?.mnemonic === entity.uat?.county_name;
        }
        return f.properties?.natcode === entity.uat?.name;
    });

    if (!feature) {
        return null;
    }

    const featureBbox = bbox(feature);
    const featureCenter = center(feature);

    const [minLon, minLat, maxLon, maxLat] = featureBbox;

    const lonDiff = maxLon - minLon;
    const latDiff = maxLat - minLat;

    const zoomLat = Math.log(360 / latDiff) / Math.LN2;
    const zoomLon = Math.log(360 / lonDiff) / Math.LN2;

    const zoom = Math.min(zoomLat, zoomLon, 15);


    return {
        center: featureCenter.geometry.coordinates.reverse() as LatLngExpression,
        zoom: zoom,
        featureId: entity.cui,
    };
};
