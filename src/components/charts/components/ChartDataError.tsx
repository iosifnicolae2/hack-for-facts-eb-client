import { AlertTriangle, Info, X } from 'lucide-react';
import { ValidationResult } from '@/lib/chart-data-validation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface ChartDataErrorProps {
  validationResult: ValidationResult;
  onDismiss?: () => void;
  showDetails?: boolean;
}

export function ChartDataError({ validationResult, onDismiss, showDetails = false }: ChartDataErrorProps) {
  const [isExpanded, setIsExpanded] = useState(showDetails);
  
  if (validationResult.isValid && validationResult.warnings.length === 0) {
    return null;
  }

  const hasErrors = validationResult.errors.length > 0;
  const hasWarnings = validationResult.warnings.length > 0;

  return (
    <Card className={`border-l-4 ${hasErrors ? 'border-l-red-500 bg-red-50' : 'border-l-yellow-500 bg-yellow-50'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {hasErrors ? (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            ) : (
              <Info className="h-5 w-5 text-yellow-500" />
            )}
            <div>
              <CardTitle className="text-base">
                {hasErrors ? 'Chart Data Error' : 'Chart Data Warning'}
              </CardTitle>
              <CardDescription>
                {hasErrors 
                  ? 'Invalid data detected in chart series' 
                  : 'Some data issues were automatically resolved'
                }
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={hasErrors ? 'destructive' : 'secondary'}>
              {validationResult.errors.length + validationResult.warnings.length} issue{(validationResult.errors.length + validationResult.warnings.length) !== 1 ? 's' : ''}
            </Badge>
            {onDismiss && (
              <Button variant="ghost" size="sm" onClick={onDismiss}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      {(isExpanded || hasErrors) && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {validationResult.errors.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-red-700 mb-2">Errors:</h4>
                <ul className="text-sm space-y-1">
                  {validationResult.errors.map((error, index) => (
                    <li key={index} className="text-red-600">
                      <span className="font-medium">{error.seriesId}:</span> {error.message}
                      {error.value !== undefined && (
                        <code className="ml-1 px-1 py-0.5 bg-red-100 rounded text-xs">
                          {JSON.stringify(error.value)}
                        </code>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {validationResult.warnings.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-yellow-700 mb-2">Warnings:</h4>
                <ul className="text-sm space-y-1">
                  {validationResult.warnings.map((warning, index) => (
                    <li key={index} className="text-yellow-600">
                      <span className="font-medium">{warning.seriesId}:</span> {warning.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hasWarnings && !hasErrors && (
              <div className="text-sm text-yellow-700">
                These issues have been automatically resolved by filtering invalid data points.
              </div>
            )}

            {hasWarnings && !isExpanded && (
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => setIsExpanded(true)}
                className="p-0 text-yellow-600 hover:text-yellow-700"
              >
                Show details
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}