import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { EntitySearchInput } from './EntitySearch';
import { cn } from '@/lib/utils';
import { EntitySearchSchema } from '@/routes/entities.$cui';
import { useIsMobile } from '@/hooks/use-mobile';
import { useHotkeys } from 'react-hotkeys-hook';

interface FloatingEntitySearchProps {
    baseSearch?: EntitySearchSchema;
    className?: string;
}

export function FloatingEntitySearch({ baseSearch, className }: FloatingEntitySearchProps) {
    const [isOpen, setIsOpen] = useState(false);
    const isMobile = useIsMobile();

    // Use keyboard shortcuts to open and close the dialog react-hotkeys-hook
    useHotkeys('ctrl+k', (e) => {
        e.preventDefault();
        setIsOpen(true)
    }, {
        enableOnFormTags: ['INPUT', 'TEXTAREA', 'SELECT'],
    });
    useHotkeys('esc', () => setIsOpen(false));

    const handleSelect = () => {
        console.log('handleSelect');
        setIsOpen(false);
    };

    return (
        <>
            <div className={cn(className)}>
                <Button
                    onClick={() => setIsOpen(true)}
                    className={cn(isMobile ? "fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg z-40" : "fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg z-40")}
                    aria-label="Search for another entity"
                    variant="default"
                    size="icon"
                >
                    <Search className="h-8 w-8" />
                </Button>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTitle className="sr-only">Search for another entity</DialogTitle>
                <DialogContent hideCloseButton={true} className="fixed bottom-8 right-8 max-w-3xl w-full p-0 bg-transparent border-0 shadow-none outline-none focus:outline-none">
                    <EntitySearchInput
                        baseSearch={baseSearch}
                        onSelect={handleSelect}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
} 