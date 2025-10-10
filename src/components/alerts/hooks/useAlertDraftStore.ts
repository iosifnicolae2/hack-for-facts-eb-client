import { useCallback } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { produce } from 'immer';
import { AlertSchema } from '@/schemas/alerts';
import type { Alert, AlertEditorMode, AlertView } from '@/schemas/alerts';

type AlertUpdater = Partial<Alert> | ((draft: Alert) => void);

export function useAlertDraftStore() {
  const navigate = useNavigate({ from: '/alerts/new' });
  const { alert, view, mode } = useSearch({ from: '/alerts/new' }) as unknown as { alert: Alert; view: AlertView; mode: AlertEditorMode };

  const updateAlert = useCallback((updater: AlertUpdater) => {
    navigate({
      search: (prev: any) => {
        const nextAlert = typeof updater === 'function'
          ? produce(prev.alert, (draft: Alert) => {
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

  const setCondition = useCallback(
    (recipe: Alert['condition'] | ((draft: Alert['condition']) => void)) => {
      updateAlert((draft) => {
        if (typeof recipe === 'function') {
          if (!draft.condition) {
            draft.condition = { operator: 'gt', threshold: 0, unit: 'RON' };
          }
          draft.condition = produce(draft.condition, (conditionDraft) => {
            recipe(conditionDraft);
          });
        } else {
          draft.condition = recipe;
        }
      });
    },
    [updateAlert],
  );

  const setView = useCallback(
    (nextView: AlertView) => {
      navigate({
        search: (prev: any) => ({
          ...prev,
          view: nextView,
        }),
        replace: true,
      });
    },
    [navigate],
  );

  const setMode = useCallback(
    (nextMode: AlertEditorMode) => {
      navigate({
        search: (prev: any) => ({
          ...prev,
          mode: nextMode,
        }),
        replace: true,
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
      search: (prev: any) => ({
        ...prev,
        alert: parsed,
        mode: options?.mode ?? prev.mode,
      }),
      replace: true,
    });
  }, [navigate]);

  return {
    alert,
    view,
    mode,
    updateAlert,
    // updateSeries, // TODO: Update for filter instead of series
    setCondition,
    setView,
    setMode,
    toggleActive,
    setAlert,
  };
}


