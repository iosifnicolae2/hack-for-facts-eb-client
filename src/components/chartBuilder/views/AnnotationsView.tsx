import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus } from 'lucide-react';
import { Chart } from '@/schemas/chartBuilder';

interface AnnotationsViewProps {
  chart: Chart;
  onUpdateChart: (updates: Partial<Chart>) => void;
  onBack: () => void;
}

export function AnnotationsView({
  chart: _chart,
  onUpdateChart: _onUpdateChart,
  onBack
}: AnnotationsViewProps) {
  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Chart Annotations</CardTitle>
              <CardDescription>
                Add annotations to highlight specific data points or regions
              </CardDescription>
            </div>
            <Button className="gap-2" disabled>
              <Plus className="h-4 w-4" />
              Add Annotation
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-lg font-medium mb-2">Annotations Coming Soon</p>
            <p className="text-sm">
              This feature will allow you to add annotations similar to visx annotation system.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-start pt-4">
        <Button onClick={onBack} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Overview
        </Button>
      </div>
    </div>
  );
} 