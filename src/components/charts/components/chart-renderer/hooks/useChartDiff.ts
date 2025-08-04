import { useState, useCallback } from 'react';
import { DataPointPayload, TimeSeriesDataPoint } from '@/components/charts/hooks/useChartData';
import { Series } from '@/schemas/charts';
import { DiffInfo } from '../components/DiffLabel';

export const useChartDiff = (timeSeriesData: TimeSeriesDataPoint[], enabledSeries: Series[]) => {
  const [refAreaLeft, setRefAreaLeft] = useState<string | number>('');
  const [refAreaRight, setRefAreaRight] = useState<string | number>('');
  const [dragStart, setDragStart] = useState<string | number>('');
  const [diffs, setDiffs] = useState<DiffInfo[]>([]);

  const clearSelection = useCallback(() => {
    setRefAreaLeft('');
    setRefAreaRight('');
    setDragStart('');
    setDiffs([]);
  }, []);

  const calculateAndSetDiffs = useCallback((left: string | number, right: string | number) => {
    const [startLabel, endLabel] = [left, right].sort((a, b) => Number(a) - Number(b));

    const startData = timeSeriesData.find(d => String(d.year) === String(startLabel));
    const endData = timeSeriesData.find(d => String(d.year) === String(endLabel));

    if (!startData || !endData) return;

    const calculatedDiffs = enabledSeries.map((series): DiffInfo | null => {
      const startPayload = startData[series.id] as DataPointPayload | undefined;
      const endPayload = endData[series.id] as DataPointPayload | undefined;

      if (!startPayload?.value || !endPayload?.value || typeof startPayload.value !== 'number' || typeof endPayload.value !== 'number') {
        return null;
      }

      const diff = endPayload.value - startPayload.value;
      const percentage = startPayload.value === 0 ? 0 : (diff / startPayload.value) * 100;

      return {
        label: series.label || 'Untitled',
        color: series.config.color,
        diff,
        percentage,
        unit: endPayload.unit,
      };
    }).filter((d): d is DiffInfo => d !== null);

    setDiffs(calculatedDiffs);
  }, [timeSeriesData, enabledSeries]);

  const handleMouseDown = (e: any) => {
    if (e && e.activeLabel) {
      setDragStart(e.activeLabel);
    }
  };

  const handleMouseMove = (e: any) => {
    if (dragStart && e && e.activeLabel) {
      setRefAreaLeft(dragStart);
      setRefAreaRight(e.activeLabel);
      setDiffs([]);
    }
  };

  const handleMouseUp = () => {
    if (dragStart) {
      if (refAreaRight && refAreaLeft !== refAreaRight) {
        calculateAndSetDiffs(refAreaLeft, refAreaRight);
      } else {
        clearSelection();
      }
    }
    setDragStart('');
  };

  return {
    refAreaLeft,
    refAreaRight,
    diffs,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    clearSelection,
  };
};
