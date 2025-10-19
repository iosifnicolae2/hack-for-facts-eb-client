import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowLeftRight, CheckSquare, Copy, MoreVertical, Redo2, Settings, Square, Trash2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Trans } from "@lingui/react/macro";

interface ChartQuickConfigMenuProps {
    onOpenConfigPanel: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
    onCopyData: () => void;
    onOpenBulkEdit: () => void;
    onEnableAll: () => void;
    onDisableAll: () => void;
    onUndo?: () => void;
    onRedo?: () => void;
    canUndo?: boolean;
    canRedo?: boolean;
}

export function ChartQuickConfigMenu({ onOpenConfigPanel, onDelete, onDuplicate, onCopyData, onOpenBulkEdit, onEnableAll, onDisableAll, onUndo, onRedo, canUndo = false, canRedo = false }: ChartQuickConfigMenuProps) {

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
                {onUndo && (
                    <DropdownMenuItem onSelect={onUndo} onClick={handleClick} disabled={!canUndo}>
                        <Undo2 className="mr-2 h-4 w-4" />
                        <Trans>Undo</Trans>
                        <span className="ml-auto text-xs text-muted-foreground">⌘Z</span>
                    </DropdownMenuItem>
                )}
                {onRedo && (
                    <DropdownMenuItem onSelect={onRedo} onClick={handleClick} disabled={!canRedo}>
                        <Redo2 className="mr-2 h-4 w-4" />
                        <Trans>Redo</Trans>
                        <span className="ml-auto text-xs text-muted-foreground">⌘⇧Z</span>
                    </DropdownMenuItem>
                )}
                {(onUndo || onRedo) && <DropdownMenuSeparator />}
                <DropdownMenuItem onSelect={onOpenConfigPanel} onClick={handleClick}>
                    <Settings className="mr-2 h-4 w-4" />
                    <Trans>Open Config Panel</Trans>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onDuplicate} onClick={handleClick}>
                    <Copy className="mr-2 h-4 w-4" />
                    <Trans>Duplicate</Trans>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onCopyData} onClick={handleClick}>
                    <Copy className="mr-2 h-4 w-4" />
                    <Trans>Copy Data</Trans>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onOpenBulkEdit} onClick={handleClick}>
                    <ArrowLeftRight className="mr-2 h-4 w-4" />
                    <Trans>Bulk edit filters</Trans>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={onEnableAll} onClick={handleClick}>
                    <CheckSquare className="mr-2 h-4 w-4" />
                    <Trans>Enable All Series</Trans>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onDisableAll} onClick={handleClick}>
                    <Square className="mr-2 h-4 w-4" />
                    <Trans>Disable All Series</Trans>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <Trans>Delete</Trans>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent className="mx-1 mt-0">
                            <DropdownMenuItem className="text-destructive" onSelect={onDelete} onClick={handleClick}>
                                <Trans>Confirm Delete</Trans>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Trans>Cancel</Trans>
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}