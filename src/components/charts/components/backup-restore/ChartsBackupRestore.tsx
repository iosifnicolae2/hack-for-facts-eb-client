import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getChartsStore } from "@/components/charts/chartsStore";
import { useClipboard } from "@/lib/hooks/useClipboard";

export type ConflictStrategy = 'skip' | 'replace' | 'keep-both';

type ChartsBackupRestoreProps = {
  readonly onAfterImport?: () => void;
};

/**
 * ChartsBackupRestore renders the UI actions and dialog to backup and restore charts.
 * It encapsulates file handling, validation, conflict preview, and import strategies.
 */
export function ChartsBackupRestore({ onAfterImport }: ChartsBackupRestoreProps) {
  const chartsStore = getChartsStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<{
    totalCharts: number;
    unique: number;
    conflicts: readonly { id: string; currentTitle: string; importedTitle: string }[];
    totalCategories: number;
    categoriesNew: number;
    categoriesMatchedByName: number;
  } | null>(null);
  const [importBackupRaw, setImportBackupRaw] = useState<unknown>(null);
  const [conflictStrategy, setConflictStrategy] = useState<ConflictStrategy>("skip");

  const handleExportBackup = useCallback(() => {
    try {
      const backup = chartsStore.createBackup();
      const content = JSON.stringify(backup, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      a.href = url;
      a.download = `charts-backup-${ts}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Backup exported");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export backup");
    }
  }, [chartsStore]);

  const handleStartImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImportFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const preview = chartsStore.previewImport(json);
      if (!preview.ok) {
        toast.error("Invalid backup file");
        return;
      }
      setImportBackupRaw(preview.backup);
      if (preview.preview.conflicts.length > 0) {
        setImportPreview(preview.preview);
        setConflictStrategy('skip');
        setIsImportDialogOpen(true);
      } else {
        const result = chartsStore.importBackup(preview.backup, 'skip');
        if (result.ok) {
          onAfterImport?.();
          toast.success(`Imported ${result.result.added} charts`);
        } else {
          toast.error("Failed to import backup");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to read backup file");
    } finally {
      event.target.value = '';
    }
  }, [chartsStore, onAfterImport]);

  const applyImportWithStrategy = useCallback((strategy: ConflictStrategy) => {
    if (!importBackupRaw) return;
    const result = chartsStore.importBackup(importBackupRaw, strategy);
    if (result.ok) {
      onAfterImport?.();
      const { added, replaced, duplicated, skipped } = result.result;
      const parts = [
        added ? `${added} added` : null,
        replaced ? `${replaced} replaced` : null,
        duplicated ? `${duplicated} duplicated` : null,
        skipped ? `${skipped} skipped` : null,
      ].filter(Boolean);
      toast.success(`Import complete${parts.length ? `: ${parts.join(', ')}` : ''}`);
    } else {
      toast.error("Failed to import backup");
    }
    setIsImportDialogOpen(false);
    setImportPreview(null);
    setImportBackupRaw(null);
  }, [chartsStore, importBackupRaw, onAfterImport]);

  // Paste-to-import support (only when not typing into an input/textarea/contentEditable)
  useClipboard({
    onPaste: (text, event) => {
      const target = event.target as HTMLElement | null;
      const isTypingIntoField = !!target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        (target as HTMLElement).isContentEditable
      );
      if (isTypingIntoField) return;
      if (!text || text.trim().length < 2) return;

      try {
        const json = JSON.parse(text);
        const preview = chartsStore.previewImport(json);
        if (!preview.ok) return; // Not a valid backup; ignore
        setImportBackupRaw(preview.backup);
        if (preview.preview.conflicts.length > 0) {
          setImportPreview(preview.preview);
          setConflictStrategy('skip');
          setIsImportDialogOpen(true);
        } else {
          const result = chartsStore.importBackup(preview.backup, 'skip');
          if (result.ok) {
            onAfterImport?.();
            toast.success(`Imported ${result.result.added} charts from clipboard`);
          } else {
            toast.error("Failed to import backup from clipboard");
          }
        }
      } catch {
        // Not JSON; ignore
      }
    }
  });

  return (
    <>
      <Button variant="outline" onClick={handleExportBackup} className="h-11 px-4">
        <Download className="mr-2 h-5 w-5" />
        Backup
      </Button>
      <Button variant="outline" onClick={handleStartImport} className="h-11 px-4">
        <Upload className="mr-2 h-5 w-5" />
        Restore
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleImportFileChange}
      />

      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve import conflicts</DialogTitle>
            <DialogDescription>
              We found existing charts with the same IDs. Choose how to handle them.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {importPreview ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  {importPreview.unique} new charts, {importPreview.conflicts.length} conflicts.
                </div>
                {importPreview.conflicts.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto rounded border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/40">
                          <th className="text-left px-2 py-1">ID</th>
                          <th className="text-left px-2 py-1">Current</th>
                          <th className="text-left px-2 py-1">Imported</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.conflicts.map((c) => (
                          <tr key={c.id} className="border-t">
                            <td className="px-2 py-1 font-mono text-xs text-muted-foreground">{c.id}</td>
                            <td className="px-2 py-1">{c.currentTitle || '(untitled)'}</td>
                            <td className="px-2 py-1">{c.importedTitle || '(untitled)'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label>Conflict strategy</Label>
              <RadioGroup value={conflictStrategy} onValueChange={(v) => setConflictStrategy(v as ConflictStrategy)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="skip" id="strategy-skip" />
                  <Label htmlFor="strategy-skip">Skip duplicates (add only new charts)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="replace" id="strategy-replace" />
                  <Label htmlFor="strategy-replace">Replace existing charts</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="keep-both" id="strategy-keep-both" />
                  <Label htmlFor="strategy-keep-both">Keep both (duplicate imported as new)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsImportDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => applyImportWithStrategy(conflictStrategy)}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ChartsBackupRestore;


