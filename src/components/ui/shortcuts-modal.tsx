import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { KeyboardShortcuts } from "./shortcuts";
import { t } from "@lingui/core/macro";

interface ShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShortcutsModal({ open, onOpenChange }: ShortcutsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden p-0">
        <div className="max-h-[85vh] overflow-y-auto">
          <DialogHeader className="px-6 py-4 border-b border-border">
            <DialogTitle className="sr-only">
              {t`Keyboard Shortcuts`}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {t`Learn all the keyboard shortcuts available in the application.`}
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-6">
            <KeyboardShortcuts />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
