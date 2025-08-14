import { TAnnotation } from "@/schemas/charts";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Copy, Eye, EyeOff, Lock, LockOpen, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "../../../ui/button";
import { Trans } from "@lingui/react/macro";

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
                    <Trans>Edit Annotation</Trans>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onToggleEnabled} onClick={handleClick}>
                    {annotation.enabled ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                    {annotation.enabled ? <Trans>Disable annotation</Trans> : <Trans>Enable annotation</Trans>}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onToggleLocked} onClick={handleClick}>
                    {annotation.locked ? <Lock className="mr-2 h-4 w-4" /> : <LockOpen className="mr-2 h-4 w-4" />}
                    {annotation.locked ? <Trans>Unlock annotation</Trans> : <Trans>Lock annotation</Trans>}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={onDuplicate} onClick={handleClick}>
                    <Copy className="mr-2 h-4 w-4" />
                    <Trans>Duplicate Annotation</Trans>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onCopy} onClick={handleClick}>
                    <Copy className="mr-2 h-4 w-4" />
                    <Trans>Copy Annotation</Trans>  
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <Trans>Delete</Trans>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent className="mx-1 mt-0">
                            <DropdownMenuItem className="text-destructive" onSelect={onDelete}>
                                <Trans>Confirm Delete</Trans>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Trans>Cancel</Trans>
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
            </DropdownMenuContent>
        </DropdownMenu >
    );
}