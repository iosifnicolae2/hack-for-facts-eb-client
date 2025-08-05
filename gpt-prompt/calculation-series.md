# Feature Specification: Calculation Series

  1. High-Level Overview

  The Calculation Series (internally known as aggregated-series-calculation) is a powerful feature
  that allows users to create new, dynamic chart series by performing mathematical operations on
  other existing series. Instead of representing raw data from a single source, a Calculation Series
  derives its data from a formula defined by the user.

  This is essential for financial analysis, enabling users to compute meaningful metrics, ratios, and
  differences directly within the charting interface without needing to export data to an external
  tool.

  Key Use Cases:

* Calculating Net Values: (e.g., Total Revenue - Total Expenses = Net Income).
* Aggregating Disparate Sources: (e.g., EU Funding + National Funding = Total Project Funding).
* Calculating Ratios and Percentages: (e.g., (Healthcare Spending / Total Budget) * 100).
* Performing "What If" Scenarios: (e.g., Projected Revenue * 1.15 to model a 15% increase).

  2. Core Concepts

  The system is designed as a recursive tree structure, allowing for simple or complex nested
  formulas.

* Calculation: The core object representing a formula. It consists of an operation and an array of
     args (operands).
* Operation: The mathematical function to apply. Supported operations are:
  * sum
  * subtract
  * multiply
  * divide
* Operand: The items that the operation is performed on. An operand can be one of three types:
       1. A Series ID (string): A reference to another series on the same chart.
       2. A Number (number): A constant numerical value.
       3. A Nested Calculation (Calculation): Another complete calculation object, allowing for complex,
          nested formulas (e.g., for order of operations).

  3. Technical Implementation Details

## 3.1. Data Structure (Schema)

  The data structures are defined in src/schemas/charts.ts.

* `SeriesGroupConfigurationSchema`: This is the main schema for a Calculation Series. It contains a
     calculation property.
* `CalculationSchema`: Defines the recursive structure of a calculation with an op (the operation)
     and args (the operands).
* `OperandSchema`: A Zod union that defines the three possible types for an operand: a
     SeriesIdSchema (string), a CalculationSchema (object), or a z.number().

    1 // src/schemas/charts.ts
    2
    3 // The type alias for clarity
    4 export type Operand = string | Calculation | number;
    5
    6 // The Zod schema for validation
    7 const OperandSchema: z.ZodType<Operand> = z.lazy(() =>
    8   z.union([SeriesIdSchema, CalculationSchema, z.number()])
    9 );
   10
   11 const CalculationSchema: z.ZodType<Calculation> = z.lazy(() =>
   12   z.object({
   13     op: z.enum(['sum', 'subtract', 'multiply', 'divide']),
   14     args: z.array(OperandSchema),
   15   })
   16 );
   17
   18 export const SeriesGroupConfigurationSchema = BaseSeriesConfigurationSchema.extend({
   19   type: z.literal('aggregated-series-calculation'),
   20   calculation: CalculationSchema.default({ op: 'sum', args: [] }),
   21 });

## 3.2. User Interface (`CalculationConfig.tsx`)

  The UI for building these calculations is handled by the CalculationConfig and RecursiveCalculation
  components.

* The user interface mirrors the tree structure of the calculation.
* Users can select an operation (+, -, *, /) for each calculation level.
* Buttons allow the user to add operands of different types:
  * "Add Series": Opens a popover to select from other series on the chart.
  * "Add Calculation": Adds a new, nested RecursiveCalculation component, allowing for complex
         formulas.
  * "Add Number": Adds a NumberOperand component with a numeric input field.
* The UI provides controls to re-order and remove operands.

## 3.3. Evaluation Logic (`chart-calculation-utils.ts`)

  The actual computation is handled by the evaluateCalculation function.

   1. Recursive Traversal: The function traverses the calculation tree.
   2. Operand Resolution: For each operand, it resolves the value:
       * If the operand is a Series ID, it looks up the corresponding data from the seriesData map.
       * If the operand is a Number, it creates a synthetic data series where the value is that constant
         number for all years.
       * If the operand is a nested Calculation, it calls evaluateCalculation recursively to resolve its
         value first.
   3. Data Alignment: It collects all unique years from all resolved operands.
   4. Year-by-Year Calculation: It iterates through each year and applies the specified operation to the
      data points for that year. If an operand doesn't have a value for a specific year, it defaults to
      0.
   5. Result: The function returns a new array of YearlyTrendPoint objects representing the calculated
      series.

## 3.4. Cycle Detection

  To prevent infinite loops (e.g., Series A depends on B, and B depends on A), the
  hasCalculationCycle utility is used. Before any change to a calculation is saved, this function
  builds a dependency graph of all series and performs a Depth-First Search (DFS) to ensure the
  change doesn't introduce a circular reference.

  4. Example Use Case: "GDP per Capita"

  Let's say a user wants to calculate "GDP per Capita". They have two series already on the chart:

   1. A StaticSeries named "National GDP" (ID: series-gdp).
   2. A StaticSeries named "Total Population" (ID: series-pop).

  The formula is National GDP / Total Population.

  The user would:

   1. Create a new series and select the type "Aggregated Series Calculation".
   2. Set the operation to "Divide".
   3. Add two operands:
       * Operand 1: Select the "National GDP" series from the list.
       * Operand 2: Select the "Total Population" series from the list.

  The resulting calculation object in the schema would look like this:

   1 {
   2   "op": "divide",
   3   "args": [
   4     "series-gdp",
   5     "series-pop"
   6   ]
   7 }

  The evaluateCalculation function would then fetch the data for series-gdp and series-pop, and for
  each year, divide the GDP amount by the population amount to produce the new "GDP per Capita"
  series.
