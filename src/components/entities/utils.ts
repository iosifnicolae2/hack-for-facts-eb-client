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

    let feature: Feature | undefined;
    let featureId: string | number | undefined;

    if (entity.entity_type === 'admin_county_council') {
        const countyCode = entity.uat?.county_code;
        feature = featureCollection.features.find(f => f.properties?.mnemonic === countyCode);
        featureId = feature?.properties?.mnemonic;
    } else {
        feature = featureCollection.features.find(f => f.properties?.natcode === entity.uat?.siruta_code?.toString());
        featureId = feature?.properties?.natcode;
    }

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
        featureId: featureId || entity.cui,
    };
};
