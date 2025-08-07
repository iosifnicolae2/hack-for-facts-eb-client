import { useQuery } from "@tanstack/react-query";
import { GeoJsonObject } from 'geojson';
import { useMapFilter } from "@/lib/hooks/useMapFilterStore";

const fetchGeoJsonData = async (path: string): Promise<GeoJsonObject> => {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Network response was not ok when fetching ${path}`);
    }
    const data = await response.json();
    return data;
};

export const useGeoJsonData = () => {
    const { mapViewType } = useMapFilter();

    const geoJsonPath = mapViewType === 'UAT' ? '/assets/geojson/uat.json' : '/assets/geojson/judete.json';

    return useQuery<GeoJsonObject, Error>({
        queryKey: ['geoJsonData', mapViewType],
        queryFn: () => fetchGeoJsonData(geoJsonPath),
        staleTime: 1000 * 60 * 60 * 24,
        enabled: !!mapViewType,
    });
};