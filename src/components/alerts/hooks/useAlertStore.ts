import { useCallback } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { produce } from 'immer';
import { AlertSchema } from '@/schemas/alerts';
import type { Alert, AlertEditorMode, AlertView } from '@/schemas/alerts';

type AlertUpdater = Partial<Alert> | ((draft: Alert) => void);

const META_FIELDS = new Set(['id', 'lastEvaluatedAt']);

const stripMetaFields = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(stripMetaFields);
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !META_FIELDS.has(key));

    return entries.reduce<Record<string, unknown>>((acc, [key, val]) => {
      const sanitized = stripMetaFields(val);
      if (sanitized !== undefined) {
        acc[key] = sanitized;
      }
      return acc;
    }, {});
  }

  return value === undefined ? undefined : value;
};

const comparableAlert = (alert?: Alert): unknown => {
  if (!alert) return undefined;
  return stripMetaFields({
    title: alert.title,
    description: alert.description ?? '',
    isActive: alert.isActive,
    notificationType: alert.notificationType,
    filter: alert.filter,
    conditions: alert.conditions,
  });
};

const alertsEqual = (left?: Alert, right?: Alert): boolean => {
  if (!left && !right) return true;
  if (!left || !right) return false;
  return JSON.stringify(comparableAlert(left)) === JSON.stringify(comparableAlert(right));
};

export function useAlertStore() {
  const navigate = useNavigate({ from: '/alerts/$alertId' });
  const { alert, view, mode } = useSearch({ from: '/alerts/$alertId' });

  const updateAlert = useCallback((updater: AlertUpdater) => {
    navigate({
      search: (prev) => {
        const nextAlert = typeof updater === 'function'
          ? produce(prev.alert, (draft) => {
              updater(draft);
            })
          : {
              ...prev.alert,
              ...updater,
            };

        const parsed = AlertSchema.parse(nextAlert);
        return {
          ...prev,
          alert: parsed,
        };
      },
      replace: true,
      resetScroll: false,
    });
  }, [navigate]);

  // TODO: Update for filter instead of series
  // const updateSeries = useCallback(
  //   (recipe: (draft: Alert['series']) => void) => {
  //     updateAlert((draft) => {
  //       draft.series = produce(draft.series, (seriesDraft) => {
  //         recipe(seriesDraft);
  //       });
  //     });
  //   },
  //   [updateAlert],
  // );

  const setConditions = useCallback(
    (recipe: Alert['conditions'] | ((draft: Alert['conditions']) => void)) => {
      updateAlert((draft) => {
        if (typeof recipe === 'function') {
          if (!draft.conditions) {
            draft.conditions = [];
          }
          draft.conditions = produce(draft.conditions, (conditionsDraft) => {
            recipe(conditionsDraft);
          });
        } else {
          draft.conditions = recipe;
        }
      });
    },
    [updateAlert],
  );

  const setView = useCallback(
    (nextView: AlertView) => {
      navigate({
        search: (prev) => ({
          ...prev,
          view: nextView,
        }),
        replace: true,
        resetScroll: false,
      });
    },
    [navigate],
  );

  const setMode = useCallback(
    (nextMode: AlertEditorMode) => {
      navigate({
        search: (prev) => ({
          ...prev,
          mode: nextMode,
        }),
        replace: true,
        resetScroll: false,
      });
    },
    [navigate],
  );

  const toggleActive = useCallback(
    (isActive: boolean) => {
      updateAlert({ isActive });
    },
    [updateAlert],
  );

  const setAlert = useCallback((next: Alert, options?: { mode?: AlertEditorMode }) => {
    const parsed = AlertSchema.parse(next);
    navigate({
      search: (prev) => ({
        ...prev,
        alert: parsed,
        mode: options?.mode ?? prev.mode,
      }),
      replace: true,
      resetScroll: false,
    });
  }, [navigate]);

  return {
    alert,
    view,
    mode,
    updateAlert,
    // updateSeries, // TODO: Update for filter instead of series
    setConditions,
    setView,
    setMode,
    toggleActive,
    setAlert,
  };
}

export const areAlertsEqual = alertsEqual;
