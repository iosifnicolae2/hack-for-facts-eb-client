import { Series, Calculation, Operation, AnalyticsDataPoint, YearlyTrendPoint } from '@/schemas/charts';

// ============================================================================
// CYCLE DETECTION
// ============================================================================

/**
 * Detects if adding a series to a calculation would create a cycle
 * @param seriesId - The ID of the series being modified/checked
 * @param calculation - The calculation to check
 * @param allSeries - All series in the chart
 * @returns true if a cycle is detected, false otherwise
 */
export function hasCalculationCycle(
  seriesId: string,
  calculation: Calculation,
  allSeries: Series[]
): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  // Build adjacency list for all calculation series
  const adjacencyList = new Map<string, Set<string>>();
  
  // Add the current series being checked
  adjacencyList.set(seriesId, new Set());
  addCalculationDependencies(calculation, adjacencyList.get(seriesId)!);
  
  // Add all existing calculation series
  for (const series of allSeries) {
    if (series.type === 'aggregated-series-calculation' && series.id !== seriesId) {
      const dependencies = new Set<string>();
      addCalculationDependencies(series.calculation, dependencies);
      adjacencyList.set(series.id, dependencies);
    }
  }
  
  // Check for cycles using DFS
  function hasCycleDFS(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    
    const dependencies = adjacencyList.get(nodeId);
    if (dependencies) {
      for (const depId of dependencies) {
        if (!visited.has(depId)) {
          if (hasCycleDFS(depId)) {
            return true;
          }
        } else if (recursionStack.has(depId)) {
          // Found a back edge - cycle detected
          return true;
        }
      }
    }
    
    recursionStack.delete(nodeId);
    return false;
  }
  
  // Start DFS from the series being checked
  return hasCycleDFS(seriesId);
}

/**
 * Helper function to extract all series IDs referenced in a calculation
 */
function addCalculationDependencies(calculation: Calculation, dependencies: Set<string>): void {
  for (const arg of calculation.args) {
    if (typeof arg === 'string') {
      dependencies.add(arg);
    } else {
      // Recursive calculation
      addCalculationDependencies(arg, dependencies);
    }
  }
}

// ============================================================================
// CALCULATION EVALUATION
// ============================================================================

/**
 * Evaluates a calculation series and returns its data points
 * @param calculation - The calculation to evaluate
 * @param seriesData - Map of series ID to their data points
 * @param allSeries - All series definitions (for recursive calculations)
 * @returns The calculated data points
 */
export function evaluateCalculation(
  calculation: Calculation,
  seriesData: Map<string, AnalyticsDataPoint>,
  allSeries: Series[]
): YearlyTrendPoint[] {
  const operandResults: YearlyTrendPoint[][] = [];
  
  // Evaluate each operand
  for (const operand of calculation.args) {
    if (typeof operand === 'string') {
      // Direct series reference
      const data = seriesData.get(operand);
      if (data) {
        operandResults.push(data.yearlyTrend);
      } else {
        // Check if it's a calculation series that needs evaluation
        const series = allSeries.find(s => s.id === operand);
        if (series && series.type === 'aggregated-series-calculation') {
          const result = evaluateCalculation(series.calculation, seriesData, allSeries);
          operandResults.push(result);
        } else {
          // Series not found or no data - use empty array
          operandResults.push([]);
        }
      }
    } else {
      // Nested calculation
      const result = evaluateCalculation(operand, seriesData, allSeries);
      operandResults.push(result);
    }
  }
  
  // Perform the operation
  return performOperation(calculation.op, operandResults);
}

/**
 * Performs the specified operation on the operand results
 */
function performOperation(
  operation: Operation,
  operands: YearlyTrendPoint[][]
): YearlyTrendPoint[] {
  if (operands.length === 0) {
    return [];
  }
  
  // Get all unique years across all operands
  const allYears = new Set<number>();
  for (const operand of operands) {
    for (const point of operand) {
      allYears.add(point.year);
    }
  }
  
  // Sort years
  const sortedYears = Array.from(allYears).sort((a, b) => a - b);
  
  // Create maps for quick lookup
  const operandMaps = operands.map(operand => {
    const map = new Map<number, number>();
    for (const point of operand) {
      map.set(point.year, point.totalAmount);
    }
    return map;
  });
  
  // Calculate result for each year
  const result: YearlyTrendPoint[] = [];
  
  for (const year of sortedYears) {
    let value: number | null = null;
    
    switch (operation) {
      case 'sum':
        value = 0;
        for (const operandMap of operandMaps) {
          value += operandMap.get(year) || 0;
        }
        break;
        
      case 'subtract':
        if (operandMaps.length > 0) {
          value = operandMaps[0].get(year) || 0;
          for (let i = 1; i < operandMaps.length; i++) {
            value -= operandMaps[i].get(year) || 0;
          }
        }
        break;
        
      case 'multiply':
        if (operandMaps.length > 0) {
          value = 1;
          let hasValue = false;
          for (const operandMap of operandMaps) {
            const operandValue = operandMap.get(year);
            if (operandValue !== undefined) {
              value *= operandValue;
              hasValue = true;
            }
          }
          // Only include if at least one operand had a value for this year
          if (!hasValue) {
            value = null;
          }
        }
        break;
        
      case 'divide':
        if (operandMaps.length >= 2) {
          const numerator = operandMaps[0].get(year);
          const denominator = operandMaps[1].get(year);
          
          if (numerator !== undefined && denominator !== undefined && denominator !== 0) {
            value = numerator / denominator;
            
            // Handle additional divisors if any
            for (let i = 2; i < operandMaps.length; i++) {
              const divisor = operandMaps[i].get(year);
              if (divisor !== undefined && divisor !== 0) {
                value /= divisor;
              } else if (divisor === 0) {
                value = null; // Division by zero
                break;
              }
            }
          }
        }
        break;
    }
    
    if (value !== null) {
      result.push({ year, totalAmount: value });
    }
  }
  
  return result;
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example: Validate before adding a new calculation series
 */
export function validateNewCalculationSeries(
  seriesId: string,
  calculation: Calculation,
  existingSeries: Series[]
): { valid: boolean; error?: string } {
  // Check for cycles
  if (hasCalculationCycle(seriesId, calculation, existingSeries)) {
    return {
      valid: false,
      error: 'This calculation would create a circular dependency'
    };
  }
  
  // Additional validation: check if all referenced series exist
  const allSeriesIds = new Set(existingSeries.map(s => s.id));
  allSeriesIds.add(seriesId); // Include the new series itself
  
  const referencedIds = new Set<string>();
  addCalculationDependencies(calculation, referencedIds);
  
  for (const refId of referencedIds) {
    if (!allSeriesIds.has(refId)) {
      return {
        valid: false,
        error: `Referenced series "${refId}" does not exist`
      };
    }
  }
  
  return { valid: true };
}

/**
 * Example: Calculate all series data including calculations
 */
export function calculateAllSeriesData(
  series: Series[],
  baseSeriesData: Map<string, AnalyticsDataPoint>
): Map<string, AnalyticsDataPoint> {
  const result = new Map(baseSeriesData);
  
  // Sort series by dependency order (topological sort)
  const sortedSeries = topologicalSortSeries(series);
  
  // Calculate each calculation series in order
  for (const s of sortedSeries) {
    if (s.type === 'aggregated-series-calculation' && s.enabled) {
      const yearlyTrend = evaluateCalculation(s.calculation, result, series);
      result.set(s.id, {
        seriesId: s.id,
        yearlyTrend,
      });
    }
    if (s.type === 'custom-series' && s.enabled) {
      result.set(s.id, {
        seriesId: s.id,
        yearlyTrend: s.data.map(d => ({ year: d.year, totalAmount: d.value })),
      });
    }
  }
  
  return result;
}

/**
 * Topological sort of series based on dependencies
 */
function topologicalSortSeries(series: Series[]): Series[] {
  const adjacencyList = new Map<string, Set<string>>();
  const inDegree = new Map<string, number>();
  
  // Initialize
  for (const s of series) {
    adjacencyList.set(s.id, new Set());
    inDegree.set(s.id, 0);
  }
  
  // Build graph
  for (const s of series) {
    if (s.type === 'aggregated-series-calculation') {
      const dependencies = new Set<string>();
      addCalculationDependencies(s.calculation, dependencies);
      
      for (const dep of dependencies) {
        if (adjacencyList.has(dep)) {
          adjacencyList.get(dep)!.add(s.id);
          inDegree.set(s.id, (inDegree.get(s.id) || 0) + 1);
        }
      }
    }
  }
  
  // Kahn's algorithm
  const queue: string[] = [];
  const sorted: Series[] = [];
  
  // Find all nodes with no incoming edges
  for (const [id, degree] of inDegree) {
    if (degree === 0) {
      queue.push(id);
    }
  }
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentSeries = series.find(s => s.id === current);
    if (currentSeries) {
      sorted.push(currentSeries);
    }
    
    // Remove edges from current
    for (const neighbor of adjacencyList.get(current) || []) {
      const newDegree = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDegree);
      
      if (newDegree === 0) {
        queue.push(neighbor);
      }
    }
  }
  
  return sorted;
}
