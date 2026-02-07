import { describe, expect, it } from 'vitest';

import {
  buildEntityIncomeExpenseChartLink,
  buildInsStatsChartLink,
  buildInsStatsChartState,
  buildTreemapChartLink,
} from './chart-links';

describe('chart-links', () => {
  it('builds INS stats chart state with UAT scope and mapped selectors', () => {
    const state = buildInsStatsChartState({
      datasetCode: 'POP107D',
      datasetLabel: 'Population by domicile',
      entityName: 'Sibiu',
      temporalSplit: 'quarter',
      classificationSelections: {
        SEX: ['M', 'F'],
        AGE: ['TOTAL'],
      },
      unitKey: 'PERS',
      isCounty: false,
      sirutaCode: '143450',
    });

    expect(state.view).toBe('overview');
    expect(state.chart.series).toHaveLength(1);

    const series = state.chart.series[0];
    expect(series.type).toBe('ins-series');
    if (series.type !== 'ins-series') {
      throw new Error('Expected INS series');
    }

    expect(series.datasetCode).toBe('POP107D');
    expect(series.sirutaCodes).toEqual(['143450']);
    expect(series.territoryCodes).toBeUndefined();
    expect(series.unitCodes).toEqual(['PERS']);
    expect(series.classificationSelections).toEqual({
      SEX: ['M', 'F'],
      AGE: ['TOTAL'],
    });
    expect(series.aggregation).toBe('sum');
    expect(series.hasValue).toBe(true);
    expect(series.period).toEqual({
      type: 'QUARTER',
      selection: {
        interval: {
          start: '1900-Q1',
          end: '2100-Q4',
        },
      },
    });
  });

  it('omits optional INS fields when split is all and unit is __none__', () => {
    const state = buildInsStatsChartState({
      datasetCode: 'POP107D',
      datasetLabel: 'Population by domicile',
      entityName: 'Sibiu',
      temporalSplit: 'all',
      classificationSelections: {},
      unitKey: '__none__',
      isCounty: true,
      countyCode: 'sb',
    });

    const series = state.chart.series[0];
    expect(series.type).toBe('ins-series');
    if (series.type !== 'ins-series') {
      throw new Error('Expected INS series');
    }

    expect(series.period).toBeUndefined();
    expect(series.classificationSelections).toBeUndefined();
    expect(series.unitCodes).toBeUndefined();
    expect(series.territoryCodes).toEqual(['SB']);
    expect(series.sirutaCodes).toBeUndefined();
  });

  it('builds INS chart link with route params tied to chart id', () => {
    const link = buildInsStatsChartLink({
      datasetCode: 'POP107D',
      datasetLabel: 'Population by domicile',
      entityName: 'Sibiu',
      temporalSplit: 'year',
      isCounty: false,
      sirutaCode: '143450',
    });

    expect(link.to).toBe('/charts/$chartId');
    expect(link.params.chartId).toBe(link.search.chart.id);
    expect(link.search.view).toBe('overview');
  });

  it('returns consistent chart route link shape across existing builders', () => {
    const entityLink = buildEntityIncomeExpenseChartLink('123', 'Test Entity', {
      normalization: 'total',
      currency: 'RON',
      inflation_adjusted: false,
      show_period_growth: false,
    });

    const treemapLink = buildTreemapChartLink({
      title: 'Treemap chart',
      seriesConfigs: [
        {
          id: 'series-1',
          type: 'custom-series-value',
          label: 'Threshold',
          value: 5,
          unit: 'units',
          enabled: true,
          config: {
            color: '#123456',
            showDataLabels: false,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });

    expect(entityLink.to).toBe('/charts/$chartId');
    expect(entityLink.params.chartId).toBe(entityLink.search.chart.id);

    expect(treemapLink.to).toBe('/charts/$chartId');
    expect(treemapLink.params.chartId).toBe(treemapLink.search.chart.id);
  });
});
