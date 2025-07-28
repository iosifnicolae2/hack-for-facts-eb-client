import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Copy, MoreVertical, Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChartQuickConfigMenuProps {
    onOpenConfigPanel: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
}

export function ChartQuickConfigMenu({ onOpenConfigPanel, onDelete, onDuplicate }: ChartQuickConfigMenuProps) {

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
            <DropdownMenuContent align="end" onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
            }}>
                <DropdownMenuItem onSelect={onOpenConfigPanel} onClick={handleClick}>
                    <Settings className="mr-2 h-4 w-4" />
                    Open Config Panel
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onDuplicate} onClick={handleClick}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent className="mx-1 mt-0">
                            <DropdownMenuItem className="text-destructive" onSelect={onDelete} onClick={handleClick}>
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