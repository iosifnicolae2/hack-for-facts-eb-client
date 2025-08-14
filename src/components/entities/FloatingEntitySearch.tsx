import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from '@/components/ui/dialog';
import { EntitySearchInput } from './EntitySearch';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useHotkeys } from 'react-hotkeys-hook';
import { t } from '@lingui/macro';

interface FloatingEntitySearchProps {
    className?: string;
}

export function FloatingEntitySearch({ className }: FloatingEntitySearchProps) {
    const [isOpen, setIsOpen] = useState(false);
    const isMobile = useIsMobile();

    const toggleSearchOpen = () => {
        setIsOpen(!isOpen);
    };
    // Use keyboard shortcuts to open and close the dialog react-hotkeys-hook
    useHotkeys('mod+k', (e) => {
        e.preventDefault();
        toggleSearchOpen();
    }, {
        enableOnFormTags: ['INPUT', 'TEXTAREA', 'SELECT'],
    });
    useHotkeys('esc', () => setIsOpen(false));

    const handleSelect = () => {
        setIsOpen(false);
    };

    return (
        <>
            <div className={cn(className)}>
                <Button
                    onClick={() => setIsOpen(true)}
                    className={cn(isMobile ? "fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg z-40" : "fixed top-8 right-8 h-8 w-8 rounded-full shadow-lg z-40 border-1 border-slate-200 dark:border-slate-700")}
                    aria-label={t`Search for another entity`}
                    variant="ghost"
                    size="icon"
                >
                    <Search className="h-8 w-8" />
                </Button>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogOverlay className="bg-slate-500/80" />
                <DialogTitle className="sr-only">{t`Search for another entity`}</DialogTitle>
                <DialogContent hideCloseButton={true} className="fixed top-1/3 max-w-3xl w-full p-0 bg-transparent border-0 shadow-none outline-none focus:outline-none">
                    <EntitySearchInput
                        onSelect={handleSelect}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
} 