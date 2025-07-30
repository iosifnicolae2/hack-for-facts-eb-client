import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Settings, Eye, Lock, Unlock } from 'lucide-react';
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

export function AnnotationConfigView() {
  const { chart, annotationId, updateAnnotation, deleteAnnotation, goToOverview, goToConfig } = useChartStore();
  const annotation = chart.annotations.find(a => a.id === annotationId);

  const [localTitle, setLocalTitle] = useState(annotation?.title || '');
  const [localSubtitle, setLocalSubtitle] = useState(annotation?.subtitle || '');

  useEffect(() => {
    setLocalTitle(annotation?.title || '');
    setLocalSubtitle(annotation?.subtitle || '');
  }, [annotation?.title, annotation?.subtitle]);

  const updateAnnotationField = (field: keyof TAnnotation, value: any) => {
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
    <div className="flex flex-col space-y-6 p-2 w-full overflow-x-hidden">

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
              <span className="text-sm text-muted-foreground">
                {annotation.color}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Label htmlFor="annotation-enabled">Enabled</Label>
            <Switch
              id="annotation-enabled"
              checked={annotation.enabled}
              onCheckedChange={(checked) => updateAnnotationField('enabled', checked)}
            />
          </div>
          <div className="flex items-center gap-4">
            <Label htmlFor="annotation-locked" className='flex items-center gap-2'>{annotation.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />} Locked</Label>
            <Switch
              id="annotation-locked"
              checked={annotation.locked}
              onCheckedChange={(checked) => updateAnnotationField('locked', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <footer className="flex justify-between pt-4">
        <Button onClick={goToConfig} variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Chart Configuration
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="destructive"
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Annotation
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
      </footer>
    </div>
  );
}
