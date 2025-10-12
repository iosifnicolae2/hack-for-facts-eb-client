import { HeatmapUATDataPoint, HeatmapCountyDataPoint } from "@/schemas/heatmap";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useState } from "react";
import { getPercentileValues, createHeatmapStyleFunction } from "@/components/maps/utils";
import { InteractiveMap } from "@/components/maps/InteractiveMap";
import { UatProperties } from "@/components/maps/interfaces";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useGeoJsonData } from "@/hooks/useGeoJson";
import { MapFilter } from "@/components/filters/MapFilter";
import { MapLegend } from "@/components/maps/MapLegend";
import { Filter as FilterIcon, X, HelpCircleIcon } from "lucide-react";
import { UatDataCharts } from "@/components/maps/charts/UatDataCharts";
import {
  SortingState,
  PaginationState,
} from "@tanstack/react-table";
import { HeatmapDataTable } from "@/components/maps/HeatmapDataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHeatmapData } from "@/hooks/useHeatmapData";
import { useMapFilter } from "@/hooks/useMapFilter";
import { FloatingQuickNav } from "@/components/ui/FloatingQuickNav";
import { Seo } from "@/lib/seo";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";

export const Route = createLazyFileRoute("/map")({
  component: MapPage,
});

function MapPage() {
  const navigate = useNavigate({ from: '/map' });
  const { mapState } = useMapFilter();

  const isMobile = useIsMobile();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isLegendModalOpen, setIsLegendModalOpen] = useState(false);

  const mapZoom = isMobile ? 6 : 7.7;

  const {
    data: heatmapData,
    isLoading: isLoadingHeatmap,
    error: heatmapError,
  } = useHeatmapData(mapState.filters, mapState.mapViewType);

  const handleFeatureClick = (properties: UatProperties) => {
    // The entity map support only a limited set of filters, so we need to pass them as a search param.
    // If we set all the filters, the data doesn't make sense for the entity page, as the filters are not visible.
    const { report_period: period, account_category, normalization } = mapState.filters;
    const searchParams = {
      mapFilters: {
        account_category,
        normalization,
        period,
      },
    };

    if (mapState.mapViewType === 'UAT') {
      const uatCui = (heatmapData as HeatmapUATDataPoint[])?.find(
        (data) => data.siruta_code === properties.natcode
      )?.uat_code;
      if (uatCui) {
        navigate({ to: `/entities/${uatCui}`, search: { ...searchParams } });
      }
    } else {
      const countyCui = (heatmapData as HeatmapCountyDataPoint[])?.find(
        (data) => data.county_code === properties.mnemonic
      )?.county_entity?.cui;
      if (countyCui) {
        navigate({ to: `/entities/${countyCui}`, search: { ...searchParams } });
      }
    }
  };

  const {
    data: geoJsonData,
    isLoading: isLoadingGeoJson,
    error: geoJsonError
  } = useGeoJsonData(mapState.mapViewType);

  const valueKey = mapState.filters.normalization === 'total' ? 'total_amount' : 'per_capita_amount';

  const { min: minAggregatedValue, max: maxAggregatedValue } = React.useMemo(() => {
    if (!heatmapData) return { min: 0, max: 0 };
    return getPercentileValues(heatmapData, 5, 95, valueKey);
  }, [heatmapData, valueKey]);

  const aDynamicGetFeatureStyle = React.useMemo(() => {
    if (!heatmapData) return () => ({});
    return createHeatmapStyleFunction(heatmapData, minAggregatedValue, maxAggregatedValue, mapState.mapViewType, valueKey);
  }, [heatmapData, minAggregatedValue, maxAggregatedValue, mapState.mapViewType, valueKey]);

  const isLoading = isLoadingHeatmap || isLoadingGeoJson;
  const error = heatmapError || geoJsonError;

  let loadingText = t`Loading data...`;
  if (isLoadingHeatmap && isLoadingGeoJson) {
    loadingText = t`Loading map and heatmap data...`;
  } else if (isLoadingHeatmap) {
    loadingText = t`Loading heatmap data...`;
  } else if (isLoadingGeoJson) {
    loadingText = t`Loading map data...`;
  }

  return (
    <div className="flex flex-col md:flex-row md:h-screen bg-background">
      <Seo
        title={t`Romania spending heatmap – Transparenta.eu`}
        description={t`Explore choropleth maps of public spending by UAT/County with per-capita or total normalization.`}
      />
      <div className="hidden md:flex md:flex-col w-[320px] lg:w-[360px] flex-shrink-0 border-r border-border bg-card text-card-foreground overflow-y-auto">
        <MapFilter />
      </div>
      <div className="flex-grow flex flex-col relative">
        <FloatingQuickNav
          tableActive
          chartActive
          filterInput={mapState.filters}
          mapViewType={mapState.mapViewType}
        />

        <div className="flex-grow overflow-hidden">
          {isLoading && !heatmapData ? (
            <div className="flex items-center justify-center h-full w-full" aria-live="polite" aria-busy="true">
              <LoadingSpinner size="lg" text={loadingText} />
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500"><Trans>Error loading data:</Trans> {error.message}</div>
          ) : !geoJsonData ? (
            <div className="p-4 text-center"><Trans>Map data not available.</Trans></div>
          ) : (
            <>
              {mapState.activeView === "map" && (
                <div className="sm:h-screen md:h-[calc(100vh-10rem)] w-full m-0 relative">
                  {heatmapData ? (
                    <InteractiveMap
                      onFeatureClick={handleFeatureClick}
                      getFeatureStyle={aDynamicGetFeatureStyle}
                      heatmapData={heatmapData}
                      geoJsonData={geoJsonData}
                      zoom={mapZoom}
                      mapViewType={mapState.mapViewType}
                      filters={mapState.filters}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full">
                      <Trans>No data available for the map.</Trans>
                    </div>
                  )}
                  <MapLegend
                    min={minAggregatedValue}
                    max={maxAggregatedValue}
                    className="absolute bottom-[-6rem] right-[4rem] z-10 hidden md:block"
                    title={t`Aggregated Value Legend`}
                    normalization={mapState.filters.normalization}
                  />
                  <Dialog open={isLegendModalOpen} onOpenChange={setIsLegendModalOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-4 right-4 md:hidden rounded-full shadow-lg w-14 h-14 z-50"
                      >
                        <HelpCircleIcon className="w-6 h-6" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent hideCloseButton={true} className="p-0 m-0 w-full max-w-full h-full max-h-full sm:h-[calc(100%-2rem)] sm:max-h-[calc(100%-2rem)] sm:w-[calc(100%-2rem)] sm:max-w-md sm:rounded-lg flex flex-col">
                      <DialogHeader className="p-4 border-b flex flex-row justify-between items-center shrink-0">
                        <DialogTitle className="text-lg font-semibold"><Trans>Legend</Trans></DialogTitle>
                        <DialogClose asChild>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <X className="h-5 w-5" />
                          </Button>
                        </DialogClose>
                      </DialogHeader>
                      <div className="p-4 overflow-y-auto">
                        <MapLegend
                          min={minAggregatedValue}
                          max={maxAggregatedValue}
                          title={t`Aggregated Value Legend`}
                          normalization={mapState.filters.normalization}
                          isInModal={true}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
              {mapState.activeView === "table" && (
                <div className="h-full m-0">
                  <div className="p-4 h-full flex flex-col overflow-auto">
                    <h2 className="text-xl font-semibold mb-4"><Trans>Data Table View</Trans></h2>
                    <div className="flex-grow overflow-x-auto">
                      {heatmapData ? (
                        <HeatmapDataTable
                          data={heatmapData}
                          isLoading={isLoadingHeatmap}
                          sorting={sorting}
                          setSorting={setSorting}
                          pagination={pagination}
                          setPagination={setPagination}
                          mapViewType={mapState.mapViewType}
                        />
                      ) : isLoadingHeatmap ? (
                        <div className="flex items-center justify-center h-full">
                          <LoadingSpinner size="md" text={t`Loading table data...`} />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-muted-foreground"><Trans>No data available for the table.</Trans></p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {mapState.activeView === "chart" && (
                <div className="h-full w-full m-0">
                  <div className="h-full w-full p-4 overflow-y-auto">
                    {heatmapData && geoJsonData ? (
                      <UatDataCharts data={heatmapData} mapViewType={mapState.mapViewType} />
                    ) : (
                      <p className="text-center text-muted-foreground"><Trans>Chart data is loading or not available.</Trans></p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>

      <div className="md:hidden fixed right-6 bottom-[5.75rem] z-50 flex flex-col items-end gap-3">

        <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
          <DialogTrigger asChild>
            <Button
              variant="default"
              size="icon"
              className="rounded-full shadow-lg w-14 h-14"
            >
              <FilterIcon className="w-6 h-6" />
            </Button>
          </DialogTrigger>
          <DialogContent hideCloseButton={true} className="p-0 m-0 w-full max-w-full h-full max-h-full sm:h-[calc(100%-2rem)] sm:max-h-[calc(100%-2rem)] sm:w-[calc(100%-2rem)] sm:max-w-md sm:rounded-lg flex flex-col">
            <DialogHeader className="p-4 border-b flex flex-row justify-between items-center shrink-0">
              <DialogTitle className="text-lg font-semibold"><Trans>Filters</Trans></DialogTitle>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </DialogClose>
            </DialogHeader>
            <div className="flex-grow overflow-y-auto">
              <MapFilter />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}