import { Series } from "@/schemas/charts";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, MoreVertical, Tags, Trash2 } from "lucide-react";
import { Button } from "../../../ui/button";

interface SeriesItemMenuProps {
    series: Series;
    isMoveUpDisabled: boolean;
    isMoveDownDisabled: boolean;
    onToggleEnabled: () => void;
    onToggleDataLabels: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
    onCopy: () => void;
}

export function SeriesItemMenu({ series, isMoveUpDisabled, isMoveDownDisabled, onToggleEnabled, onToggleDataLabels, onMoveUp, onMoveDown, onDelete, onDuplicate, onCopy }: SeriesItemMenuProps) {

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Not sure why, but the click was propagating without this.
        e.stopPropagation();
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onSelect={onToggleDataLabels} onClick={handleClick}>
                    <Tags className="mr-2 h-4 w-4" />
                    {series.config.showDataLabels ? "Hide" : "Show"} Data Labels
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={onMoveUp} disabled={isMoveUpDisabled} onClick={handleClick}>
                    <ArrowUp className="mr-2 h-4 w-4" />
                    Move Up
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onMoveDown} disabled={isMoveDownDisabled} onClick={handleClick}>
                    <ArrowDown className="mr-2 h-4 w-4" />
                    Move Down
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={onDuplicate} onClick={handleClick}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate Series
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onCopy} onClick={handleClick}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Series
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={onToggleEnabled} onClick={handleClick}>
                    {series.enabled ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                    {series.enabled ? 'Disable series' : 'Enable series'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent className="mx-1 mt-0">
                            <DropdownMenuItem className="text-destructive" onSelect={onDelete}>
                                Confirm Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                Cancel
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}