import { useCallback, useEffect } from 'react';
import { CopiedAnnotationsSchema, TAnnotation } from '@/schemas/charts';
import { useChartStore } from './useChartStore';
import { toast } from 'sonner';

/**
 * Clipboard utilities for annotations: copy one annotation and paste annotations into the current chart.
 */
export function useCopyPasteAnnotations() {
  const { chart, setAnnotations } = useChartStore();

  const copyAnnotation = useCallback(async (annotationId: string) => {
    const annotation = chart.annotations.find(a => a.id === annotationId);
    if (!annotation) return;

    const clipboardData = {
      type: 'chart-annotations-copy' as const,
      payload: [annotation satisfies TAnnotation],
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(clipboardData));
      toast.success('Annotation Copied', {
        description: `Annotation "${annotation.title || 'Untitled'}" copied. Paste into another chart or the same chart.`,
      });
    } catch {
      toast.error('Copy Failed', { description: 'Could not copy the annotation to the clipboard.' });
    }
  }, [chart.annotations]);

  useEffect(() => {
    const handlePaste = async () => {
      const text = await navigator.clipboard.readText();
      if (!text) return;

      try {
        const parsed = JSON.parse(text);
        const validated = CopiedAnnotationsSchema.safeParse(parsed);
        if (!validated.success) return;

        const incoming = validated.data.payload as ReadonlyArray<TAnnotation>;

        // Remap IDs to avoid collisions and append
        const remapped: TAnnotation[] = incoming.map((a) => ({
          ...a,
          id: crypto.randomUUID(),
        }));

        const next = [...chart.annotations, ...remapped];
        setAnnotations(next);
        toast.success('Annotation Pasted', {
          description: `${remapped.length} annotation${remapped.length > 1 ? 's' : ''} added to the chart`,
        });
      } catch {
        // ignore non-JSON clipboard
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [chart.annotations, setAnnotations]);

  return { copyAnnotation };
}


