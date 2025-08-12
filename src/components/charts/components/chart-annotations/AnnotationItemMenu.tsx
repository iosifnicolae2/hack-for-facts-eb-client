import { TAnnotation } from "@/schemas/charts";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Copy, Eye, EyeOff, Lock, LockOpen, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "../../../ui/button";

interface AnnotationItemMenuProps {
    annotation: TAnnotation;
    onOpenEdit: () => void;
    onToggleEnabled: () => void;
    onToggleLocked: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
    onCopy: () => void;
}

export function AnnotationItemMenu({ annotation, onOpenEdit, onToggleEnabled, onToggleLocked, onDelete, onDuplicate, onCopy }: AnnotationItemMenuProps) {

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
                <DropdownMenuItem onSelect={onOpenEdit} onClick={handleClick}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Annotation
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onToggleEnabled} onClick={handleClick}>
                    {annotation.enabled ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                    {annotation.enabled ? 'Disable annotation' : 'Enable annotation'}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onToggleLocked} onClick={handleClick}>
                    {annotation.locked ? <Lock className="mr-2 h-4 w-4" /> : <LockOpen className="mr-2 h-4 w-4" />}
                    {annotation.locked ? 'Unlock annotation' : 'Lock annotation'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={onDuplicate} onClick={handleClick}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate Annotation
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onCopy} onClick={handleClick}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Annotation
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
        </DropdownMenu >
    );
}