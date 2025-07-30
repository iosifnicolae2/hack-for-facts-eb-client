import { TAnnotation } from "@/schemas/charts";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { AnnotationItemMenu } from "./AnnotationItemMenu";
import { useDebouncedCallback } from "@/lib/hooks/useDebouncedCallback";

interface AnnotationItemProps {
  annotation: TAnnotation;
  index: number;
  isSelected: boolean;
  onOpenEdit: () => void;
  onToggleEnable: () => void;
  onToggleLocked: () => void;
  onClick: () => void;
  onUpdate: (updates: Partial<TAnnotation>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onCopy: () => void;
  onSelect: () => void;
  onDeselect: () => void;
}

export function AnnotationItem({ annotation, index, isSelected, onOpenEdit, onToggleEnable, onToggleLocked, onClick, onUpdate, onDelete, onDuplicate, onCopy, onSelect, onDeselect }: AnnotationItemProps) {

  const handleColorChange = useDebouncedCallback((color: string) => {
    onUpdate({ ...annotation, color });
  }, 500);

  const displayTitle = annotation.title || annotation.subtitle;

  return (
    <div
      onFocus={onSelect}
      onBlur={onDeselect}
      className={cn("relative flex items-center justify-between p-2.5 border rounded-lg hover:bg-muted/50 bg-background/50 backdrop-blur-sm transition-colors", isSelected && "bg-muted/50")}>
      <div className="flex items-center gap-3 text-sm flex-1 cursor-pointer min-w-0">
        <div className="flex items-center gap-2">
          <Input
            type="color"
            value={annotation.color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-6 h-4 rounded-full cursor-pointer shadow-gray-600/50 shadow-sm"
            style={{ backgroundColor: annotation.color, border: "none" }}
            aria-label="Color Picker"
          />
        </div>
        <div className="flex-1 min-w-0" onClick={onClick}>
          <p className="font-medium truncate" title={displayTitle}>{displayTitle}</p>
          <p className="text-xs text-muted-foreground">Annotation {index + 1}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 ml-2">
        <Switch
          checked={annotation.enabled}
          onCheckedChange={onToggleEnable}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Toggle annotation ${displayTitle}`}
        />
        <AnnotationItemMenu
          annotation={annotation}
          onOpenEdit={onOpenEdit}
          onToggleEnabled={onToggleEnable}
          onToggleLocked={onToggleLocked}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onCopy={onCopy}
        />
      </div>
    </div>
  );
}