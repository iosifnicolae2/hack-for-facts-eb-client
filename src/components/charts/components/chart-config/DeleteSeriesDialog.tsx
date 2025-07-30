import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Trash2 } from 'lucide-react';

interface DeleteSeriesDialogProps {
    onDelete: () => void;
}

export const DeleteSeriesDialog = React.memo(({ onDelete }: DeleteSeriesDialogProps) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" title="Delete series">
                <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>Are you sure you want to delete this series?</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:bg-destructive focus:text-white"
            >
                Delete
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
)); 