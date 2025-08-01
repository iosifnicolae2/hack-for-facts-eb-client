import { Series } from "@/schemas/charts";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "@/lib/hooks/useDebouncedCallback";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { SeriesItemMenu } from "../series-config/SeriesItemMenu";
import { cn } from "@/lib/utils";

interface SeriesListItemProps {
  series: Series;
  index: number;
  isSelected: boolean;
  onToggle: (enabled: boolean) => void;
  onClick: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isMoveUpDisabled: boolean;
  isMoveDownDisabled: boolean;
  chartColor?: string;
  onUpdate: (updates: Partial<Series>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onCopy: () => void;
  onSelect: () => void;
  onDeselect: () => void;
}

export function SeriesListItem({ series, index, isSelected, onToggle, onClick, onMoveUp, onMoveDown, isMoveUpDisabled, isMoveDownDisabled, chartColor, onUpdate, onDelete, onDuplicate, onCopy, onSelect, onDeselect }: SeriesListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: series.id });
  const [localColor, setLocalColor] = useState(series.config.color);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
  };

  const handleColorChange = useDebouncedCallback((color: string) => {
    setLocalColor(color);
    onUpdate({ config: { ...series.config, color } });
  }, 500);

  return (
    <div ref={setNodeRef} style={style} {...attributes}
      onFocus={onSelect}
      onBlur={onDeselect}
      className={cn("relative flex items-center justify-between p-2.5 border rounded-lg hover:bg-muted/50 bg-background/50 backdrop-blur-sm transition-colors", isSelected && "bg-muted/50")}>
      <div className="flex items-center gap-3 text-sm flex-1 cursor-pointer min-w-0">
        <div {...listeners} className="cursor-grab">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="color"
            value={localColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-6 h-4 rounded-full cursor-pointer shadow-gray-600/50 shadow-sm"
            style={{ backgroundColor: series.config.color || chartColor, border: "none" }}
            aria-label="Color Picker"
          />
        </div>
        <div className="flex-1 min-w-0" onClick={onClick}>
          <p className="font-medium truncate" title={series.label}>{series.label}</p>
          <p className="text-xs text-muted-foreground">Series {index + 1}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 ml-2">
        <Switch
          checked={series.enabled}
          onCheckedChange={onToggle}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Toggle series ${series.label}`}
        />
        <SeriesItemMenu
          series={series}
          isMoveUpDisabled={isMoveUpDisabled}
          isMoveDownDisabled={isMoveDownDisabled}
          onToggleEnabled={() => onToggle(!series.enabled)}
          onToggleDataLabels={() => onUpdate({ config: { ...series.config, showDataLabels: !series.config.showDataLabels } })}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onCopy={onCopy}
        />
      </div>
    </div>
  );
}