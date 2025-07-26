import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Loader2, BarChart3, LineChart, TrendingUp, ScatterChart } from 'lucide-react';
import { Chart, ChartConfig, DEFAULT_CHART_CONFIG, ChartSchema, ChartType } from '@/schemas/chartBuilder';
import { saveChart } from '@/lib/api/chartBuilder';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const Route = createLazyFileRoute("/charts/new")({
  component: NewChartPage,
});

interface ChartFormData {
  title: string;
  description: string;
  config: ChartConfig;
}

const FORM_STORAGE_KEY = 'chart-creation-form';

function NewChartPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ChartFormData>({
    title: '',
    description: '',
    config: { ...DEFAULT_CHART_CONFIG }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // Load form state from localStorage on component mount
  useEffect(() => {
    const savedForm = localStorage.getItem(FORM_STORAGE_KEY);
    if (savedForm) {
      try {
        const parsedForm = JSON.parse(savedForm);
        setFormData(parsedForm);
      } catch (error) {
        console.error('Failed to parse saved form data:', error);
      }
    }
  }, []);

  // Save form state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const updateFormData = (updates: Partial<ChartFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear validation errors when user starts typing
    if (validationErrors && Object.keys(validationErrors).length > 0) {
      setValidationErrors({});
    }
    if (error) {
      setError('');
    }
  };

  const updateConfig = (configUpdates: Partial<ChartConfig>) => {
    setFormData(prev => ({
      ...prev,
      config: { ...prev.config, ...configUpdates }
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string[]> = {};

    if (!formData.title.trim()) {
      errors.title = ['Chart title is required'];
    }

    try {
      // Create a minimal chart object for validation
      const chartToValidate: Partial<Chart> = {
        id: 'temp-id',
        title: formData.title,
        description: formData.description || undefined,
        config: formData.config,
        series: [], // TODO: Should be added here
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      ChartSchema.parse(chartToValidate);
    } catch (validationError: unknown) {
      if (validationError && typeof validationError === 'object' && 'errors' in validationError) {
        (validationError as any).errors.forEach((err: any) => {
          const path = err.path.join('.');
          if (!errors[path]) errors[path] = [];
          errors[path].push(err.message);
        });
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newChart: Chart = {
        id: crypto.randomUUID(),
        title: formData.title,
        description: formData.description || undefined,
        config: formData.config,
        series: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await saveChart(newChart);

      // Clear form data from localStorage after successful creation
      localStorage.removeItem(FORM_STORAGE_KEY);

      // Navigate to the created chart
      navigate({ to: `/charts/${newChart.id}` });
    } catch (saveError) {
      console.error('Failed to create chart:', saveError);
      setError('Failed to create chart. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate({ to: '/charts' });
  };

  const getChartTypeIcon = (chartType: string) => {
    switch (chartType) {
      case 'line': return <LineChart className="h-4 w-4" />;
      case 'bar': return <BarChart3 className="h-4 w-4" />;
      case 'area': return <TrendingUp className="h-4 w-4" />;
      case 'scatter': return <ScatterChart className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const hasErrors = (field: string) => {
    return validationErrors[field] && validationErrors[field].length > 0;
  };

  const getErrorMessage = (field: string) => {
    return hasErrors(field) ? validationErrors[field][0] : '';
  };

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Charts
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Chart</h1>
          <p className="text-muted-foreground">
            Set up the basic properties for your new chart
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Chart Information</CardTitle>
              <CardDescription>
                Provide basic details about your chart
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Chart Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateFormData({ title: e.target.value })}
                  placeholder="Enter a descriptive title for your chart..."
                  className={hasErrors('title') ? 'border-destructive' : ''}
                />
                {hasErrors('title') && (
                  <p className="text-sm text-destructive">{getErrorMessage('title')}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  placeholder="Optional description to help others understand your chart..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Chart Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getChartTypeIcon(formData.config.chartType)}
                Chart Settings
              </CardTitle>
              <CardDescription>
                Configure the default appearance of your chart
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Chart Type</Label>
                  <Select
                    value={formData.config.chartType}
                    onValueChange={(value) => updateConfig({ chartType: value as ChartType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="line">
                        <div className="flex items-center gap-2">
                          <LineChart className="h-4 w-4" />
                          Line Chart
                        </div>
                      </SelectItem>
                      <SelectItem value="bar">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Bar Chart
                        </div>
                      </SelectItem>
                      <SelectItem value="area">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Area Chart
                        </div>
                      </SelectItem>
                      <SelectItem value="scatter">
                        <div className="flex items-center gap-2">
                          <ScatterChart className="h-4 w-4" />
                          Scatter Chart
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Default Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={formData.config.color}
                      onChange={(e) => updateConfig({ color: e.target.value })}
                      className="w-20 h-10 p-1 border rounded"
                    />
                    <Input
                      value={formData.config.color}
                      onChange={(e) => updateConfig({ color: e.target.value })}
                      placeholder="#8884d8"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview & Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center space-y-3">
                {getChartTypeIcon(formData.config.chartType)}
                <div>
                  <p className="font-medium">
                    {formData.title || 'Untitled Chart'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formData.config.chartType} chart
                  </p>
                </div>
                <div
                  className="w-8 h-8 rounded mx-auto border"
                  style={{ backgroundColor: formData.config.color }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>After creating your chart, you'll be able to:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Add data series with custom filters</li>
                <li>Configure chart-specific settings</li>
                <li>Preview your chart with live data</li>
                <li>Share and export your visualization</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancel
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isLoading ? 'Creating...' : 'Create Chart'}
        </Button>
      </div>
    </div>
  );
}
