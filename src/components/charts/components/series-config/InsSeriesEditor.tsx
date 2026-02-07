import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { Database, MapPin, Ruler, Tags } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilterContainer } from '@/components/filters/base-filter/FilterContainer';
import { FilterListContainer } from '@/components/filters/base-filter/FilterListContainer';
import type { OptionItem } from '@/components/filters/base-filter/interfaces';

import {
  InsSeriesConfigurationSchema,
  type InsSeriesPeriodicity,
} from '@/schemas/charts';
import type { InsDataset, InsDatasetDetails, InsDimension } from '@/schemas/ins';
import { useChartStore } from '../../hooks/useChartStore';
import { getInsDatasetDetails, getInsDimensionValuesPage } from '@/lib/api/ins';
import { getUserLocale } from '@/lib/utils';
import {
  mapInsDimensionValueToOption,
  pickDefaultDimensionValue,
  type InsLocale,
  type InsDimensionOptionKind,
  upsertSelectionRecord,
} from './ins-series-editor.utils';
import { InsDatasetList } from './ins-dataset-list';
import { InsDimensionValuesList } from './ins-dimension-values-list';

interface InsSeriesEditorProps {
  series: z.infer<typeof InsSeriesConfigurationSchema>;
}

interface InsDimensionFilterListProps {
  title: string;
  icon: React.ReactNode;
  selected: OptionItem[];
  setSelected: React.Dispatch<React.SetStateAction<OptionItem[]>>;
  datasetCode: string;
  dimensionIndex: number;
  optionKind: InsDimensionOptionKind;
  classificationTypeCode?: string;
}

function toPeriodRangeForPeriodicity(
  yearRange: number[] | null | undefined,
  periodicity: InsSeriesPeriodicity
): { start: string; end: string } | undefined {
  if (!yearRange || yearRange.length < 2) return undefined;
  const [startYear, endYear] = yearRange;

  if (periodicity === 'MONTHLY') {
    return { start: `${startYear}-01`, end: `${endYear}-12` };
  }
  if (periodicity === 'QUARTERLY') {
    return { start: `${startYear}-Q1`, end: `${endYear}-Q4` };
  }

  return { start: String(startYear), end: String(endYear) };
}

function getDatasetDisplayName(
  dataset: InsDataset | null | undefined,
  locale: InsLocale
): string {
  if (!dataset) return '';
  return locale === 'en'
    ? dataset.name_en || dataset.name_ro || dataset.code
    : dataset.name_ro || dataset.name_en || dataset.code;
}

function getDimensionLabel(
  dimension: InsDimension,
  fallback: string,
  locale: InsLocale
): string {
  return locale === 'en'
    ? dimension.label_en || dimension.label_ro || fallback
    : dimension.label_ro || dimension.label_en || fallback;
}

function mapCodesToOptions(codes: string[], labels: Record<string, string>): OptionItem[] {
  return codes.map((code) => ({
    id: code,
    label: labels[code] ?? code,
  }));
}

function mergeLabels(current: Record<string, string>, options: OptionItem[]): Record<string, string> {
  const next = { ...current };
  for (const option of options) {
    const code = String(option.id);
    if (!next[code]) {
      next[code] = option.label;
    }
  }
  return next;
}

function toDatasetSeriesLabel(datasetCode: string, optionLabel: string): string {
  const prefix = `${datasetCode} - `;
  if (optionLabel.startsWith(prefix)) {
    return optionLabel.slice(prefix.length).trim() || datasetCode;
  }
  return optionLabel.trim() || datasetCode;
}

function InsDimensionFilterList({
  title,
  icon,
  selected,
  setSelected,
  datasetCode,
  dimensionIndex,
  optionKind,
  classificationTypeCode,
}: InsDimensionFilterListProps) {
  const ListComponent = useMemo(() => {
    function Component(props: {
      selectedOptions: OptionItem[];
      toggleSelect: (option: OptionItem) => void;
      pageSize: number;
    }) {
      return (
        <InsDimensionValuesList
          selectedOptions={props.selectedOptions}
          toggleSelect={props.toggleSelect}
          pageSize={props.pageSize}
          datasetCode={datasetCode}
          dimensionIndex={dimensionIndex}
          optionKind={optionKind}
          classificationTypeCode={classificationTypeCode}
        />
      );
    }

    return Component;
  }, [classificationTypeCode, datasetCode, dimensionIndex, optionKind]);

  return (
    <FilterListContainer
      title={title}
      icon={icon}
      listComponent={ListComponent}
      selected={selected}
      setSelected={setSelected}
    />
  );
}

async function buildDatasetDefaultPatch(
  dataset: InsDatasetDetails
): Promise<Partial<z.infer<typeof InsSeriesConfigurationSchema>>> {
  const periodicity = dataset.periodicity.includes('ANNUAL')
    ? 'ANNUAL'
    : dataset.periodicity[0] ?? 'ANNUAL';

  const defaults: Partial<z.infer<typeof InsSeriesConfigurationSchema>> = {
    periodicity,
    aggregation: 'sum',
    hasValue: true,
  };

  const periodRange = toPeriodRangeForPeriodicity(dataset.year_range ?? undefined, periodicity);
  if (periodRange) {
    defaults.periodRange = periodRange;
  }

  const dimensions = dataset.dimensions ?? [];
  const classificationSelections: Record<string, string[]> = {};

  for (const dimension of dimensions) {
    if (dimension.type === 'TEMPORAL') continue;

    const connection = await getInsDimensionValuesPage({
      datasetCode: dataset.code,
      dimensionIndex: dimension.index,
      limit: 200,
      offset: 0,
    });

    const selected = pickDefaultDimensionValue(connection.nodes ?? []);
    if (!selected) continue;

    if (dimension.type === 'TERRITORIAL') {
      if (selected.territory?.siruta_code) {
        defaults.sirutaCodes = [selected.territory.siruta_code];
      } else if (selected.territory?.code) {
        defaults.territoryCodes = [selected.territory.code];
      }
    }

    if (dimension.type === 'UNIT_OF_MEASURE') {
      const unitCode = selected.unit?.code;
      if (unitCode) {
        defaults.unitCodes = [unitCode];
      }
    }

    if (dimension.type === 'CLASSIFICATION') {
      const typeCode = selected.classification_value?.type_code;
      const code = selected.classification_value?.code;
      if (typeCode && code) {
        classificationSelections[typeCode] = [code];
      }
    }
  }

  if (Object.keys(classificationSelections).length > 0) {
    defaults.classificationSelections = classificationSelections;
  }

  return defaults;
}

export function InsSeriesEditor({ series }: InsSeriesEditorProps) {
  const { updateSeries } = useChartStore();
  const locale: InsLocale = getUserLocale() === 'en' ? 'en' : 'ro';
  const latestDatasetRequestIdRef = useRef(0);
  const latestSeriesRef = useRef(series);
  const latestDimensionRequestNonceRef = useRef(0);
  const latestDimensionRequestByKeyRef = useRef<Map<string, number>>(new Map());

  const [classificationLabelsByTypeCode, setClassificationLabelsByTypeCode] =
    useState<Record<string, Record<string, string>>>({});
  const [unitLabelsByCode, setUnitLabelsByCode] = useState<Record<string, string>>({});
  const [territoryLabelsByCode, setTerritoryLabelsByCode] = useState<Record<string, string>>({});
  const [sirutaLabelsByCode, setSirutaLabelsByCode] = useState<Record<string, string>>({});

  useEffect(() => {
    setClassificationLabelsByTypeCode({});
    setUnitLabelsByCode({});
    setTerritoryLabelsByCode({});
    setSirutaLabelsByCode({});
    latestDimensionRequestByKeyRef.current.clear();
  }, [series.datasetCode]);

  useEffect(() => {
    latestSeriesRef.current = series;
  }, [series]);

  const datasetDetailQuery = useQuery({
    queryKey: ['ins-series-dataset', series.datasetCode],
    queryFn: () => getInsDatasetDetails(series.datasetCode ?? ''),
    enabled: !!series.datasetCode,
    staleTime: 1000 * 60 * 5,
  });

  const dataset = datasetDetailQuery.data;

  const nonTemporalDimensions = useMemo(
    () => (dataset?.dimensions ?? []).filter((dimension) => dimension.type !== 'TEMPORAL'),
    [dataset?.dimensions]
  );
  const firstTerritorialDimensionIndex = useMemo(
    () => nonTemporalDimensions.find((dimension) => dimension.type === 'TERRITORIAL')?.index,
    [nonTemporalDimensions]
  );

  const update = (patch: Partial<z.infer<typeof InsSeriesConfigurationSchema>>) => {
    updateSeries(series.id, {
      ...patch,
      updatedAt: new Date().toISOString(),
    });
  };

  const beginDimensionRequest = (
    datasetCode: string,
    dimensionIndex: number,
    optionKind: InsDimensionOptionKind,
    classificationTypeCode?: string
  ): { requestKey: string; requestId: number } => {
    const requestKey = [
      datasetCode,
      String(dimensionIndex),
      optionKind,
      classificationTypeCode ?? '',
    ].join(':');
    latestDimensionRequestNonceRef.current += 1;
    const requestId = latestDimensionRequestNonceRef.current;
    latestDimensionRequestByKeyRef.current.set(requestKey, requestId);
    return { requestKey, requestId };
  };

  const isDimensionRequestCurrent = (requestKey: string, requestId: number): boolean => {
    return latestDimensionRequestByKeyRef.current.get(requestKey) === requestId;
  };

  const resolveDefaultDimensionOption = async ({
    datasetCode,
    dimensionIndex,
    optionKind,
    classificationTypeCode,
  }: {
    datasetCode: string;
    dimensionIndex: number;
    optionKind: InsDimensionOptionKind;
    classificationTypeCode?: string;
  }): Promise<OptionItem | null> => {
    const response = await getInsDimensionValuesPage({
      datasetCode,
      dimensionIndex,
      limit: 200,
      offset: 0,
    });

    const defaultValue = pickDefaultDimensionValue(response.nodes ?? []);
    if (!defaultValue) return null;
    return mapInsDimensionValueToOption(defaultValue, optionKind, classificationTypeCode, locale);
  };

  const handleDatasetSelect = async (datasetCode: string, optionLabel: string) => {
    const requestId = latestDatasetRequestIdRef.current + 1;
    latestDatasetRequestIdRef.current = requestId;

    update({
      datasetCode,
      label: toDatasetSeriesLabel(datasetCode, optionLabel),
      unitCodes: undefined,
      territoryCodes: undefined,
      sirutaCodes: undefined,
      classificationSelections: undefined,
    });

    const details = await getInsDatasetDetails(datasetCode);
    if (latestDatasetRequestIdRef.current !== requestId || !details) return;

    const defaults = await buildDatasetDefaultPatch(details);
    if (latestDatasetRequestIdRef.current !== requestId) return;

    update({
      label: getDatasetDisplayName(details, locale),
      ...defaults,
    });
  };

  const clearDatasetSelection = () => {
    latestDatasetRequestIdRef.current += 1;
    update({
      datasetCode: undefined,
      unitCodes: undefined,
      territoryCodes: undefined,
      sirutaCodes: undefined,
      classificationSelections: undefined,
    });
  };

  const selectedDatasetOptions: OptionItem[] = useMemo(() => {
    if (!series.datasetCode) return [];

    const datasetLabel = dataset
      ? `${dataset.code} - ${getDatasetDisplayName(dataset, locale)}`
      : `${series.datasetCode} - ${series.label || series.datasetCode}`;

    return [{ id: series.datasetCode, label: datasetLabel }];
  }, [dataset, locale, series.datasetCode, series.label]);

  return (
    <Card data-testid="ins-series-editor">
      <CardHeader>
        <CardTitle>
          <Trans>INS Dataset Configuration</Trans>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <FilterContainer
          title={t`Dataset`}
          icon={<Database className="w-4 h-4" aria-hidden="true" />}
          selectedOptions={selectedDatasetOptions}
          onClearOption={clearDatasetSelection}
          onClearAll={clearDatasetSelection}
          defaultOpen={selectedDatasetOptions.length === 0}
        >
          <InsDatasetList
            selectedOptions={selectedDatasetOptions}
            toggleSelect={(option) => {
              const datasetCode = String(option.id);
              if (datasetCode === series.datasetCode) {
                return;
              }
              void handleDatasetSelect(datasetCode, option.label);
            }}
            pageSize={100}
          />
        </FilterContainer>

        <div className="space-y-2">
          <Label>
            <Trans>Periodicity</Trans>
          </Label>
          <Select
            value={series.periodicity ?? ''}
            onValueChange={(value) => update({ periodicity: value as InsSeriesPeriodicity })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t`Select periodicity`} />
            </SelectTrigger>
            <SelectContent>
              {(dataset?.periodicity ?? ['ANNUAL', 'QUARTERLY', 'MONTHLY']).map((periodicity) => (
                <SelectItem key={periodicity} value={periodicity}>
                  {periodicity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>
              <Trans>Period Start</Trans>
            </Label>
            <Input
              value={series.periodRange?.start ?? ''}
              placeholder={t`Example: 2020 / 2020-Q1 / 2020-01`}
              onChange={(event) => {
                const nextStart = event.target.value;
                update({
                  periodRange: {
                    start: nextStart,
                    end: series.periodRange?.end ?? nextStart,
                  },
                });
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>
              <Trans>Period End</Trans>
            </Label>
            <Input
              value={series.periodRange?.end ?? ''}
              placeholder={t`Example: 2024 / 2024-Q4 / 2024-12`}
              onChange={(event) => {
                const nextEnd = event.target.value;
                update({
                  periodRange: {
                    start: series.periodRange?.start ?? nextEnd,
                    end: nextEnd,
                  },
                });
              }}
            />
          </div>
        </div>

        {dataset && (
          <div className="border-t pt-2">
            {nonTemporalDimensions.map((dimension) => {
              if (dimension.type === 'CLASSIFICATION') {
                const typeCode = dimension.classification_type?.code ?? `DIM_${dimension.index}`;
                const selectedCodes = series.classificationSelections?.[typeCode] ?? [];
                const selectedOptions = mapCodesToOptions(
                  selectedCodes,
                  classificationLabelsByTypeCode[typeCode] ?? {}
                );

                const setSelected: React.Dispatch<React.SetStateAction<OptionItem[]>> = (
                  action
                ) => {
                  const currentOptions = mapCodesToOptions(
                    selectedCodes,
                    classificationLabelsByTypeCode[typeCode] ?? {}
                  );
                  const nextOptions =
                    typeof action === 'function' ? action(currentOptions) : action;
                  const { requestKey, requestId } = beginDimensionRequest(
                    dataset.code,
                    dimension.index,
                    'classification',
                    typeCode
                  );

                  const nextCodes = nextOptions.map((option) => String(option.id));

                  if (nextCodes.length === 0) {
                    void (async () => {
                      try {
                        const defaultOption = await resolveDefaultDimensionOption({
                          datasetCode: dataset.code,
                          dimensionIndex: dimension.index,
                          optionKind: 'classification',
                          classificationTypeCode: typeCode,
                        });
                        if (!defaultOption) return;
                        if (!isDimensionRequestCurrent(requestKey, requestId)) return;

                        const defaultCode = String(defaultOption.id);
                        setClassificationLabelsByTypeCode((current) => ({
                          ...current,
                          [typeCode]: mergeLabels(current[typeCode] ?? {}, [defaultOption]),
                        }));

                        const latestClassificationSelections =
                          latestSeriesRef.current.classificationSelections;
                        update({
                          classificationSelections: upsertSelectionRecord(
                            latestClassificationSelections,
                            typeCode,
                            [defaultCode]
                          ),
                        });
                      } catch {
                        // Keep previous selection if default resolution fails.
                      }
                    })();
                    return currentOptions;
                  }

                  setClassificationLabelsByTypeCode((current) => ({
                    ...current,
                    [typeCode]: mergeLabels(current[typeCode] ?? {}, nextOptions),
                  }));

                  update({
                    classificationSelections: upsertSelectionRecord(
                      series.classificationSelections,
                      typeCode,
                      nextCodes
                    ),
                  });

                  return nextOptions;
                };

                return (
                  <InsDimensionFilterList
                    key={`ins-dim-classification-${dimension.index}`}
                    title={getDimensionLabel(dimension, typeCode, locale)}
                    icon={<Tags className="w-4 h-4" aria-hidden="true" />}
                    selected={selectedOptions}
                    setSelected={setSelected}
                    datasetCode={dataset.code}
                    dimensionIndex={dimension.index}
                    optionKind="classification"
                    classificationTypeCode={typeCode}
                  />
                );
              }

              if (dimension.type === 'UNIT_OF_MEASURE') {
                const selectedCodes = series.unitCodes ?? [];
                const selectedOptions = mapCodesToOptions(selectedCodes, unitLabelsByCode);

                const setSelected: React.Dispatch<React.SetStateAction<OptionItem[]>> = (
                  action
                ) => {
                  const currentOptions = mapCodesToOptions(selectedCodes, unitLabelsByCode);
                  const nextOptions =
                    typeof action === 'function' ? action(currentOptions) : action;
                  const { requestKey, requestId } = beginDimensionRequest(
                    dataset.code,
                    dimension.index,
                    'unit'
                  );

                  const nextCodes = nextOptions.map((option) => String(option.id));

                  if (nextCodes.length === 0) {
                    void (async () => {
                      try {
                        const defaultOption = await resolveDefaultDimensionOption({
                          datasetCode: dataset.code,
                          dimensionIndex: dimension.index,
                          optionKind: 'unit',
                        });
                        if (!defaultOption) return;
                        if (!isDimensionRequestCurrent(requestKey, requestId)) return;

                        const defaultCode = String(defaultOption.id);
                        setUnitLabelsByCode((current) => mergeLabels(current, [defaultOption]));
                        update({
                          unitCodes: [defaultCode],
                        });
                      } catch {
                        // Keep previous selection if default resolution fails.
                      }
                    })();
                    return currentOptions;
                  }

                  setUnitLabelsByCode((current) => mergeLabels(current, nextOptions));
                  update({
                    unitCodes: nextCodes,
                  });

                  return nextOptions;
                };

                return (
                  <InsDimensionFilterList
                    key={`ins-dim-unit-${dimension.index}`}
                    title={getDimensionLabel(dimension, t`Unit`, locale)}
                    icon={<Ruler className="w-4 h-4" aria-hidden="true" />}
                    selected={selectedOptions}
                    setSelected={setSelected}
                    datasetCode={dataset.code}
                    dimensionIndex={dimension.index}
                    optionKind="unit"
                  />
                );
              }

              if (dimension.type === 'TERRITORIAL') {
                const primaryTerritorialIndex =
                  firstTerritorialDimensionIndex ?? dimension.index;
                const isPrimaryTerritoryDimension =
                  dimension.index === primaryTerritorialIndex;

                const selectedCodes = isPrimaryTerritoryDimension
                  ? (series.territoryCodes ?? [])
                  : (series.sirutaCodes ?? []);
                const selectedOptions = mapCodesToOptions(
                  selectedCodes,
                  isPrimaryTerritoryDimension ? territoryLabelsByCode : sirutaLabelsByCode
                );

                const setSelected: React.Dispatch<React.SetStateAction<OptionItem[]>> = (
                  action
                ) => {
                  const currentOptions = mapCodesToOptions(
                    selectedCodes,
                    isPrimaryTerritoryDimension ? territoryLabelsByCode : sirutaLabelsByCode
                  );
                  const nextOptions =
                    typeof action === 'function' ? action(currentOptions) : action;
                  const optionKind: InsDimensionOptionKind = isPrimaryTerritoryDimension
                    ? 'territory'
                    : 'siruta';
                  const { requestKey, requestId } = beginDimensionRequest(
                    dataset.code,
                    dimension.index,
                    optionKind
                  );

                  const nextCodes = nextOptions.map((option) => String(option.id));

                  if (nextCodes.length === 0) {
                    void (async () => {
                      try {
                        const defaultOption = await resolveDefaultDimensionOption({
                          datasetCode: dataset.code,
                          dimensionIndex: dimension.index,
                          optionKind,
                        });
                        if (!defaultOption) return;
                        if (!isDimensionRequestCurrent(requestKey, requestId)) return;

                        const defaultCode = String(defaultOption.id);
                        if (isPrimaryTerritoryDimension) {
                          setTerritoryLabelsByCode((current) => mergeLabels(current, [defaultOption]));
                          update({
                            territoryCodes: [defaultCode],
                          });
                        } else {
                          setSirutaLabelsByCode((current) => mergeLabels(current, [defaultOption]));
                          update({
                            sirutaCodes: [defaultCode],
                          });
                        }
                      } catch {
                        // Keep previous selection if default resolution fails.
                      }
                    })();
                    return currentOptions;
                  }

                  if (isPrimaryTerritoryDimension) {
                    setTerritoryLabelsByCode((current) => mergeLabels(current, nextOptions));
                    update({
                      territoryCodes: nextCodes,
                    });
                  } else {
                    setSirutaLabelsByCode((current) => mergeLabels(current, nextOptions));
                    update({
                      sirutaCodes: nextCodes,
                    });
                  }

                  return nextOptions;
                };

                return (
                  <InsDimensionFilterList
                    key={`ins-dim-territorial-${dimension.index}`}
                    title={getDimensionLabel(dimension, t`Territory`, locale)}
                    icon={<MapPin className="w-4 h-4" aria-hidden="true" />}
                    selected={selectedOptions}
                    setSelected={setSelected}
                    datasetCode={dataset.code}
                    dimensionIndex={dimension.index}
                    optionKind={isPrimaryTerritoryDimension ? 'territory' : 'siruta'}
                  />
                );
              }

              return null;
            })}
          </div>
        )}

        {datasetDetailQuery.isLoading && (
          <p className="text-sm text-muted-foreground">
            <Trans>Loading dataset dimensions...</Trans>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
