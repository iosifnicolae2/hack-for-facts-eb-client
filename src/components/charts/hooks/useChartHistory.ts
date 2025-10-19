import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chart } from '@/schemas/charts';
import { useSearch } from '@tanstack/react-router';
import { generateHash } from '@/lib/utils';

interface HistoryState {
  readonly past: readonly Chart[];
  readonly future: readonly Chart[];
}

interface UseChartHistoryReturn {
  readonly pushState: (chart: Chart) => void; // Backward compatibility (no-op)
  readonly undo: () => Chart | null;
  readonly redo: () => Chart | null;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly clearHistory: () => void;
}

const MAX_HISTORY_SIZE = 50;

/**
 * URL-driven chart history manager.
 * - Observes the chart object in the router search state and records a history entry
 *   only when that chart changes (using a stable hash to detect changes).
 * - Keeps a bounded history (MAX_HISTORY_SIZE), dropping oldest entries.
 * - Undo/redo operate relative to the current chart in the URL.
 */
export function useChartHistory(chartId: string, _initialChart: Chart): UseChartHistoryReturn {
  const { chart } = useSearch({ from: '/charts/$chartId' });

  const historyRef = useRef<HistoryState>({ past: [], future: [] });
  const lastChartIdRef = useRef<string>(chartId);
  const lastHashRef = useRef<string | null>(null);
  const lastChartSnapshotRef = useRef<Chart | null>(null);
  const suppressNextChangeRef = useRef<boolean>(false);

  // Track state changes to trigger re-renders for canUndo/canRedo
  const [, setHistoryVersion] = useState(0);

  const currentChartHash = useMemo(() => generateHash(JSON.stringify(chart)), [chart]);

  // Initialize or reset when chartId changes
  useEffect(() => {
    if (lastChartIdRef.current !== chartId) {
      historyRef.current = { past: [], future: [] };
      lastChartIdRef.current = chartId;
      lastHashRef.current = currentChartHash;
      lastChartSnapshotRef.current = structuredClone(chart) as Chart;
      setHistoryVersion((v) => v + 1);
    }
  }, [chartId, currentChartHash, chart]);

  // Observe URL chart changes and record history
  useEffect(() => {
    if (lastHashRef.current == null) {
      // First run: just initialize the hash without recording
      lastHashRef.current = currentChartHash;
      lastChartSnapshotRef.current = structuredClone(chart) as Chart;
      return;
    }

    if (currentChartHash === lastHashRef.current) {
      // No change in chart part of URL
      return;
    }

    // If this change was caused by an undo/redo navigation, suppress recording
    if (suppressNextChangeRef.current) {
      suppressNextChangeRef.current = false;
      lastHashRef.current = currentChartHash;
      lastChartSnapshotRef.current = structuredClone(chart) as Chart;
      return;
    }

    // Record previous chart into history (bounded), clear future
    historyRef.current = {
      past: [...historyRef.current.past, structuredClone(lastChartSnapshotRef.current as Chart) as Chart].slice(-MAX_HISTORY_SIZE),
      future: [],
    };

    // Update last hash and notify consumers
    lastHashRef.current = currentChartHash;
    lastChartSnapshotRef.current = structuredClone(chart) as Chart;
    setHistoryVersion((v) => v + 1);
  }, [currentChartHash, chart]);

  // Compatibility shim: external code previously pushed state manually.
  // With URL-driven tracking, we ignore manual pushes to avoid duplicates.
  const pushState = useCallback((_chart: Chart) => {
    // no-op by design; URL observer handles history updates
  }, []);

  const undo = useCallback((): Chart | null => {
    const { past, future } = historyRef.current;
    if (past.length === 0) return null;

    // The previous chart is the last of past
    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);

    // Push current chart into future
    const newFuture = [structuredClone(chart) as Chart, ...future];

    historyRef.current = { past: newPast, future: newFuture };
    suppressNextChangeRef.current = true;
    setHistoryVersion((v) => v + 1);
    return structuredClone(previous) as Chart;
  }, [chart]);

  const redo = useCallback((): Chart | null => {
    const { past, future } = historyRef.current;
    if (future.length === 0) return null;

    // The next chart is the first of future
    const next = future[0];
    const newFuture = future.slice(1);

    // Push current chart into past (bounded)
    const newPast = [...past, structuredClone(chart) as Chart].slice(-MAX_HISTORY_SIZE);

    historyRef.current = { past: newPast, future: newFuture };
    suppressNextChangeRef.current = true;
    setHistoryVersion((v) => v + 1);
    return structuredClone(next) as Chart;
  }, [chart]);

  const clearHistory = useCallback(() => {
    historyRef.current = { past: [], future: [] };
    suppressNextChangeRef.current = false;
    setHistoryVersion((v) => v + 1);
  }, []);

  return {
    pushState,
    undo,
    redo,
    canUndo: historyRef.current.past.length > 0,
    canRedo: historyRef.current.future.length > 0,
    clearHistory,
  };
}
