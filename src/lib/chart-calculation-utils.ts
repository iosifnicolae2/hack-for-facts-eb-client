import { Series, Calculation, Operation, AnalyticsSeries, Chart, defaultYearRange } from '@/schemas/charts';
import type { DataValidationError } from '@/lib/chart-data-validation';

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
function addCalculationDependencies(
  calculation: Calculation,
  dependencies: Set<string>,
  visited: WeakSet<Calculation> = new WeakSet()
): void {
  if (visited.has(calculation)) return;
  visited.add(calculation);

  for (const arg of calculation.args) {
    if (typeof arg === 'string') {
      dependencies.add(arg);
    } else if (arg && typeof arg === 'object') {
      // Recursive calculation; guard against circular calculation objects.
      addCalculationDependencies(arg, dependencies, visited);
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
  seriesData: Map<string, AnalyticsSeries>,
  allSeries: Series[],
  seriesIdForWarnings: string
): { points: { x: string; y: number }[]; warnings: DataValidationError[] } {
  const operandResults: { x: string; y: number }[][] = [];
  const warnings: DataValidationError[] = [];

  // Evaluate each operand
  for (const operand of calculation.args) {
    if (typeof operand === 'number') {
      // Number operand
      const years = Array.from({ length: defaultYearRange.end - defaultYearRange.start + 1 }, (_, i) => i + defaultYearRange.start);
      operandResults.push(years.map(year => ({ x: String(year), y: operand })));
    } else if (typeof operand === 'string') {
      // Direct series reference
      const data = seriesData.get(operand);
      if (data) {
        operandResults.push(data.data);
      } else {
        // Check if it's a calculation series that needs evaluation
        const series = allSeries.find(s => s.id === operand);
        if (series && series.type === 'aggregated-series-calculation') {
          const result = evaluateCalculation(series.calculation, seriesData, allSeries, series.id);
          operandResults.push(result.points);
          warnings.push(...result.warnings);
        } else {
          // Series not found or no data - use empty array
          operandResults.push([]);
        }
      }
    } else {
      // Nested calculation
      const result = evaluateCalculation(operand, seriesData, allSeries, seriesIdForWarnings);
      operandResults.push(result.points);
      warnings.push(...result.warnings);
    }
  }

  // Perform the operation
  const opResult = performOperation(calculation.op, operandResults, seriesIdForWarnings);
  return { points: opResult.points, warnings: warnings.concat(opResult.warnings) };
}

/**
 * Performs the specified operation on the operand results
 */
function performOperation(
  operation: Operation,
  operands: { x: string; y: number }[][],
  seriesIdForWarnings: string
): { points: { x: string; y: number }[]; warnings: DataValidationError[] } {
  if (operands.length === 0) {
    return { points: [], warnings: [] };
  }

  // Get all unique years across all operands
  const allYears = new Set<string>();
  for (const operand of operands) {
    for (const point of operand) {
      allYears.add(point.x);
    }
  }

  // Sort years
  const sortedYears = Array.from(allYears).sort((a, b) => Number(a) - Number(b));

  // Create maps for quick lookup
  const operandMaps = operands.map(operand => {
    const map = new Map<string, number>();
    for (const point of operand) {
      map.set(point.x, point.y);
    }
    return map;
  });

  // Calculate result for each year
  const result: { x: string; y: number }[] = [];
  const warnings: DataValidationError[] = [];

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
          // Multiplication requires all operands to be present
          // If any operand is missing, the result is undefined (null)
          let allPresent = true;
          let tempValue = 1;
          
          for (const operandMap of operandMaps) {
            const operandValue = operandMap.get(year);
            if (operandValue === undefined) {
              allPresent = false;
              break;
            }
            tempValue *= operandValue;
          }
          
          if (allPresent) {
            value = tempValue;
          } else {
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
                warnings.push({
                  type: 'auto_adjusted_value',
                  seriesId: seriesIdForWarnings,
                  message: `Division by zero at year ${year} (auto-removed)`,
                  value: { numerator, denominator: divisor },
                });
                break;
              } else if (divisor === undefined) {
                value = null; // Missing divisor
                break;
              }
            }
          } else if (denominator === 0) {
            value = null;
            warnings.push({
              type: 'auto_adjusted_value',
              seriesId: seriesIdForWarnings,
              message: `Division by zero at year ${year} (auto-removed)`,
              value: { numerator, denominator },
            });
          }
        }
        break;
    }

    if (value !== null) {
      result.push({ x: year, y: value });
    }
  }

  return { points: result, warnings };
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
 * Example: Calculate all series data including calculations and update the dataSeriesMap.
 */
export function calculateAllSeriesData(
  series: Series[],
  dataSeriesMap: Map<string, AnalyticsSeries>
): { dataSeriesMap: Map<string, AnalyticsSeries>; warnings: DataValidationError[] } {
  // Sort series by dependency order (topological sort)
  const sortedSeries = topologicalSortSeries(series);

  const defaultYears = Array.from({ length: defaultYearRange.end - defaultYearRange.start + 1 }, (_, index) => index + defaultYearRange.start);

  const warnings: DataValidationError[] = [];

  // Set custom series and custom value series data. Used by calculation series.
  for (const s of series) {
    if (s.type === 'custom-series') {
      dataSeriesMap.set(s.id, {
        seriesId: s.id,
        xAxis: { name: 'Year', type: 'INTEGER', unit: '' },
        yAxis: { name: 'Amount', type: 'FLOAT', unit: s.unit || '' },
        data: s.data.map(d => ({ x: String(d.year), y: d.value })),
      });
    }
    if (s.type === 'custom-series-value') {
      dataSeriesMap.set(s.id, {
        seriesId: s.id,
        xAxis: { name: 'Year', type: 'INTEGER', unit: '' },
        yAxis: { name: 'Amount', type: 'FLOAT', unit: s.unit || '' },
        data: defaultYears.map(year => ({ x: String(year), y: s.value })),
      });
    }
  }

  // Calculate each calculation series in order
  for (const s of sortedSeries) {
    if (s.type === 'aggregated-series-calculation') {
      const { points, warnings: calcWarnings } = evaluateCalculation(s.calculation, dataSeriesMap, series, s.id);
      warnings.push(...calcWarnings);
      dataSeriesMap.set(s.id, {
        seriesId: s.id,
        xAxis: { name: 'Year', type: 'INTEGER', unit: '' },
        yAxis: { name: 'Amount', type: 'FLOAT', unit: s.unit || '' },
        data: points,
      });
    }
  }

  return { dataSeriesMap, warnings };
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

/**
 * Get the dependencies of a calculation
 * @param calculation - The calculation to get the dependencies of
 * @param series - The series to get the dependencies of
 * @returns The dependencies of the calculation
 */
export function getCalculationDependencies(calculation: Calculation, series: Series[]): string[] {
  const dependencies = new Set<string>();
  addCalculationDependencies(calculation, dependencies);
  return Array.from(dependencies).filter(id => series.find(s => s.id === id));
}

/**
 * Get all dependencies of a series
 * @param series - The series to get the dependencies of
 * @param chart - The chart to get the dependencies of 
 * @returns All dependencies of the series
 */
export function getAllDependencies(series: Series, chart: Chart): Series[] {
  const seriesCalculation = series.calculation as Calculation;
  if (!seriesCalculation) return [series];

  const visited = new Set<string>([series.id]);
  const collected: Series[] = [];
  const stack: Series[] = [];

  const seedIds = getCalculationDependencies(seriesCalculation, chart.series)
    .filter((id) => id !== series.id);
  for (const id of seedIds) {
    const dep = chart.series.find(s => s.id === id);
    if (!dep || visited.has(dep.id)) continue;
    visited.add(dep.id);
    collected.push(dep);
    if (dep.calculation) stack.push(dep);
  }

  while (stack.length > 0) {
    const current = stack.pop()!;
    const currentCalculation = current.calculation as Calculation | undefined;
    if (!currentCalculation) continue;

    const depIds = getCalculationDependencies(currentCalculation, chart.series)
      .filter((id) => id !== current.id);
    for (const id of depIds) {
      if (visited.has(id)) continue;
      const dep = chart.series.find(s => s.id === id);
      if (!dep) continue;
      visited.add(dep.id);
      collected.push(dep);
      if (dep.calculation) stack.push(dep);
    }
  }

  return collected;
}
