import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Settings, Eye, Lock, Unlock, RefreshCcw, Copy, Layers } from 'lucide-react';
import { TAnnotation } from '@/schemas/charts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { useChartStore } from '../../hooks/useChartStore';
import { useCopyPasteAnnotations } from '../../hooks/useCopyPasteAnnotations';
import { generateRandomColor } from '../chart-renderer/utils';

export function AnnotationConfigView() {
  const { chart, annotationId, updateAnnotation, deleteAnnotation, goToOverview, goToConfig, duplicateAnnotation } = useChartStore();
  const annotation = chart.annotations.find(a => a.id === annotationId);

  const [localTitle, setLocalTitle] = useState(annotation?.title || '');
  const [localSubtitle, setLocalSubtitle] = useState(annotation?.subtitle || '');
  const titleInputRef = useRef<HTMLInputElement>(null);
  const { copyAnnotation } = useCopyPasteAnnotations();

  useEffect(() => {
    setLocalTitle(annotation?.title || '');
    setLocalSubtitle(annotation?.subtitle || '');
  }, [annotation?.title, annotation?.subtitle]);

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  const updateAnnotationField = (field: keyof TAnnotation, value: boolean | string | number) => {
    if (!annotation) return;
    updateAnnotation(annotation.id, (prev) => ({ ...prev, [field]: value }));
  };

  if (!annotation) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Annotation not found</p>
          <Button onClick={goToConfig} className="mt-4">
            Back to Configuration
          </Button>
        </div>
      </div>
    );
  }

  const handleDeleteAnnotation = () => {
    goToOverview();
    deleteAnnotation(annotation?.id || '');
  };

  return (
    <div className="flex flex-col space-y-6 p-3 w-full overflow-x-hidden">

      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Annotation Configuration
        </h1>
        <Button onClick={goToOverview} className="gap-2">
          <Eye className="h-4 w-4" />
          View Chart
        </Button>
      </header>
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="annotation-title">Title *</Label>
            <Input
              ref={titleInputRef}
              id="annotation-title"
              value={localTitle}
              onChange={(e) => {
                setLocalTitle(e.target.value);
                updateAnnotationField('title', e.target.value);
              }}
              placeholder="Enter annotation title..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="annotation-subtitle">Subtitle</Label>
            <Input
              id="annotation-subtitle"
              value={localSubtitle}
              onChange={(e) => {
                setLocalSubtitle(e.target.value);
                updateAnnotationField('subtitle', e.target.value);
              }}
              placeholder="Enter annotation subtitle..."
            />
          </div>

          {/* Layout: two-column controls for quick toggles and color */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="annotation-color">Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="annotation-color"
                    type="color"
                    value={annotation.color}
                    onChange={(e) => updateAnnotationField('color', e.target.value)}
                    className="w-12 h-8 rounded border cursor-pointer"
                  />
                  <Button variant="outline" size="icon" onClick={() => updateAnnotationField('color', generateRandomColor())}>
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {annotation.color}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="annotation-enabled">Enabled</Label>
                <Switch id="annotation-enabled" checked={annotation.enabled} onCheckedChange={(checked) => updateAnnotationField('enabled', checked)} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="annotation-locked" className='flex items-center gap-2'>{annotation.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />} Locked</Label>
                <Switch id="annotation-locked" checked={annotation.locked} onCheckedChange={(checked) => updateAnnotationField('locked', checked)} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="annotation-connector" className='flex items-center gap-2'>Connector</Label>
                <Switch id="annotation-connector" checked={!!annotation.connector} onCheckedChange={(checked) => updateAnnotationField('connector', checked)} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="annotation-subject" className='flex items-center gap-2'>Subject</Label>
                <Switch id="annotation-subject" checked={!!annotation.subject} onCheckedChange={(checked) => updateAnnotationField('subject', checked)} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="annotation-label" className='flex items-center gap-2'>Label</Label>
                <Switch id="annotation-label" checked={!!annotation.label} onCheckedChange={(checked) => updateAnnotationField('label', checked)} />
              </div>
            </div>
            <div className="space-y-3">
              <Label>Position</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="w-16 text-xs text-muted-foreground">X (%)</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={Math.round((annotation.pX ?? 0.5) * 100)}
                    onChange={(e) => updateAnnotationField('pX', Number(e.target.value) / 100)}
                    className="w-full"
                  />
                  <span className="w-10 text-right text-sm">{Math.round((annotation.pX ?? 0.5) * 100)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-16 text-xs text-muted-foreground">Y (%)</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={Math.round((annotation.pY ?? 0.5) * 100)}
                    onChange={(e) => updateAnnotationField('pY', Number(e.target.value) / 100)}
                    className="w-full"
                  />
                  <span className="w-10 text-right text-sm">{Math.round((annotation.pY ?? 0.5) * 100)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-16 text-xs text-muted-foreground">ΔX (%)</span>
                  <input
                    type="range"
                    min={-100}
                    max={100}
                    step={1}
                    value={Math.round((annotation.pXDelta ?? 0.05) * 100)}
                    onChange={(e) => updateAnnotationField('pXDelta', Number(e.target.value) / 100)}
                    className="w-full"
                  />
                  <span className="w-10 text-right text-sm">{Math.round((annotation.pXDelta ?? 0.05) * 100)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-16 text-xs text-muted-foreground">ΔY (%)</span>
                  <input
                    type="range"
                    min={-100}
                    max={100}
                    step={1}
                    value={Math.round((annotation.pYDelta ?? 0.05) * 100)}
                    onChange={(e) => updateAnnotationField('pYDelta', Number(e.target.value) / 100)}
                    className="w-full"
                  />
                  <span className="w-10 text-right text-sm">{Math.round((annotation.pYDelta ?? 0.05) * 100)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <footer className="flex justify-between pt-4">
        <Button onClick={goToConfig} variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Chart Configuration
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="secondary" className="gap-2" onClick={() => copyAnnotation(annotation.id)}>
            <Copy className="h-4 w-4" />
            Copy
          </Button>
          <Button variant="secondary" className="gap-2" onClick={() => duplicateAnnotation(annotation.id)}>
            <Layers className="h-4 w-4" />
            Duplicate
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="destructive"
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Are you sure?</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDeleteAnnotation}
                className="text-destructive focus:bg-destructive focus:text-white"
              >
                Delete
              </DropdownMenuItem>
              <DropdownMenuItem>
                Cancel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </footer>
    </div>
  );
}
