import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { AnnotationItem } from "./AnnotationItem";
import { useState } from "react";
import { useChartStore } from "../../hooks/useChartStore";
import { useCopyPasteAnnotations } from "../../hooks/useCopyPasteAnnotations";
import { Trans } from "@lingui/react/macro";

export function AnnotationsList() {
  const { chart, addAnnotation, updateAnnotation, deleteAnnotation, goToAnnotationConfig, duplicateAnnotation } = useChartStore();
  const { copyAnnotation } = useCopyPasteAnnotations();

  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);

  const handleSelect = (annotationId: string) => {
    setSelectedAnnotationId(annotationId);
  };
  const handleDeselect = (annotationId: string) => {
    setSelectedAnnotationId(prev => prev === annotationId ? null : prev);
  };

  const onAddAnnotation = () => {
    addAnnotation();
  };

  const onAnnotationClick = (annotationId: string) => {
    goToAnnotationConfig(annotationId);
  };

  const onToggleAnnotation = (annotationId: string) => {
    updateAnnotation(annotationId, (prev) => ({ ...prev, enabled: !prev.enabled }));
  };

  const onToggleLocked = (annotationId: string) => {
    updateAnnotation(annotationId, (prev) => ({ ...prev, locked: !prev.locked }));
  };

  const onDuplicateAnnotation = (annotationId: string) => {
    duplicateAnnotation(annotationId);
  };

  const onCopyAnnotation = (annotationId: string) => {
    copyAnnotation(annotationId);
  };

  const handleOpenEdit = (annotationId: string) => {
    goToAnnotationConfig(annotationId);
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span><Trans>Annotations</Trans></span>
          <Button size="icon" onClick={onAddAnnotation} className="rounded-full w-7 h-7 cursor-pointer" aria-label="Add new annotation">
            <Plus className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription><Trans>{chart.annotations.length} annotations</Trans></CardDescription>
      </CardHeader>
      <CardContent>
        {chart.annotations.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3"><Trans>No annotations yet.</Trans></p>
            <Button size="sm" onClick={onAddAnnotation}><Trans>Add Annotation</Trans></Button>
          </div>
        ) : (
          <div className="space-y-2">
            {chart.annotations.map((annotation, index) => (
              <AnnotationItem
                key={annotation.id}
                annotation={annotation}
                index={index}
                onOpenEdit={() => handleOpenEdit(annotation.id)}
                isSelected={selectedAnnotationId === annotation.id}
                onSelect={() => handleSelect(annotation.id)}
                onDeselect={() => handleDeselect(annotation.id)}
                onClick={() => onAnnotationClick(annotation.id)}
                onToggleEnable={() => onToggleAnnotation(annotation.id)}
                onToggleLocked={() => onToggleLocked(annotation.id)}
                onUpdate={(updates) => updateAnnotation(annotation.id, updates)}
                onDelete={() => deleteAnnotation(annotation.id)}
                onDuplicate={() => onDuplicateAnnotation(annotation.id)}
                onCopy={() => onCopyAnnotation(annotation.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}; 