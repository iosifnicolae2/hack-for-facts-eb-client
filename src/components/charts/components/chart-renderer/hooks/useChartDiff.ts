import { useState, useCallback } from 'react';
import { DataPointPayload, TimeSeriesDataPoint } from '@/components/charts/hooks/useChartData';
import { Series } from '@/schemas/charts';
import { DiffInfo } from '../components/diff-select/DiffLabel';

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

      const startValue = startPayload?.value;
      const endValue = endPayload?.value;
      if (startValue === undefined || endValue === undefined || typeof startValue !== 'number' || typeof endValue !== 'number') {
        return null;
      }

      const diff = endValue - startValue;
      const percentage = startValue === 0 ? 0 : (diff / startValue) * 100;

      return {
        label: series.label || 'Untitled',
        color: series.config.color,
        diff,
        percentage,
        unit: endPayload?.unit ?? startPayload?.unit ?? '',
      };
    }).filter((d): d is DiffInfo => d !== null);

    setDiffs(calculatedDiffs);
  }, [timeSeriesData, enabledSeries]);

  const handleMouseDown = useCallback((e: { activeLabel: string | number | undefined } | undefined) => {
    if (e && e.activeLabel !== undefined) {
      setDragStart(e.activeLabel);
      setRefAreaRight('');
    }
  }, []);

  const handleMouseMove = useCallback((e: { activeLabel: string | number | undefined } | undefined) => {
    if (dragStart && e && e.activeLabel !== undefined) {
      const left = dragStart;
      const right = e.activeLabel;
      setRefAreaLeft(left);
      setRefAreaRight(right);
      // Calculate diffs in real-time during drag if we have different bounds
      if (left !== right) {
        calculateAndSetDiffs(left, right);
      }
    }
  }, [dragStart, calculateAndSetDiffs]);

  const handleMouseUp = useCallback(() => {
    if (dragStart) {
      if (refAreaRight && refAreaLeft !== refAreaRight) {
        calculateAndSetDiffs(refAreaLeft, refAreaRight);
      } else {
        clearSelection();
      }
    }
    setDragStart('');
  }, [dragStart, refAreaLeft, refAreaRight, calculateAndSetDiffs, clearSelection]);

  // On mouse leave: finalize selection if we have valid bounds, otherwise cancel
  const handleMouseLeave = useCallback(() => {
    if (dragStart) {
      // If we have a valid selection (both bounds set and different), finalize it
      if (refAreaLeft && refAreaRight && refAreaLeft !== refAreaRight) {
        calculateAndSetDiffs(refAreaLeft, refAreaRight);
      } else {
        // No valid selection, clear everything
        setRefAreaLeft('');
        setRefAreaRight('');
        setDiffs([]);
      }
      setDragStart('');
    }
    // If not dragging, keep the finalized selection visible
  }, [dragStart, refAreaLeft, refAreaRight, calculateAndSetDiffs]);

  return {
    refAreaLeft,
    refAreaRight,
    diffs,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    clearSelection,
  };
};
