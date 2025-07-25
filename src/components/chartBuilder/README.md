# Chart Builder System

A comprehensive, modular chart builder for creating powerful visualizations of public spending data with custom filters and multiple data series.

## Route Structure

The chart builder system uses a page-based routing structure instead of modal-based interactions:

### Routes

1. **Chart List Page** (`/charts`)
   - Main dashboard showing all created charts
   - Provides navigation to create new charts
   - Chart management (view, edit, delete) with confirmation dialogs

2. **Create New Chart** (`/charts/new`)
   - Form-based chart creation interface
   - Persistent form state (survives page reloads)
   - Validation and error handling
   - Redirects to chart detail page upon successful creation

3. **Chart Detail Page** (`/charts/:chartId`)
   - Display the created chart with live data visualization
   - Chart information and metadata
   - Navigation to configuration page
   - Shows placeholder when no data series are configured

4. **Chart Configuration** (`/charts/:chartId/config`)
   - Full chart builder interface for modifying settings
   - Add/edit/delete data series
   - Real-time preview
   - Validation and error handling

### Navigation Flow

```
/charts → /charts/new → /charts/:chartId → /charts/:chartId/config
   ↑         ↓             ↑                      ↓
   ←─────────────────────────←──────────────────────
```

1. User visits chart list page (`/charts`)
2. Clicks "Create New Chart" → navigates to `/charts/new`
3. Fills form and submits → automatically redirects to `/charts/:chartId`
4. Clicks "Configure" → navigates to `/charts/:chartId/config`
5. Makes changes and saves → returns to `/charts/:chartId`

## State Management

### Form State Persistence

**Chart Creation Form (`/charts/new`)**
- Form state is automatically saved to localStorage on every change
- Survives page reloads, browser crashes, and navigation
- Cleared automatically upon successful chart creation
- Storage key: `'chart-creation-form'`

**Chart Configuration**
- Uses the existing `useChartBuilder` hook for state management
- Tracks unsaved changes with visual indicators
- Warns users before navigating away with unsaved changes

### localStorage Schema

#### Chart Creation Form
```typescript
// Key: 'chart-creation-form'
interface ChartFormData {
  title: string;
  description: string;
  config: ChartConfig;
}
```

#### Saved Charts
```typescript
// Key: 'savedCharts'
Chart[] // Array of complete chart objects
```

### Chart Storage Structure
```typescript
interface Chart {
  id: string;                    // UUID
  title: string;                 // User-defined title
  description?: string;          // Optional description
  config: ChartConfig;           // Global chart configuration
  series: SeriesConfiguration[]; // Data series with filters
  annotations: Annotation[];     // Chart annotations (future)
  createdAt: Date;              // Creation timestamp
  updatedAt: Date;              // Last modification timestamp
  isPublic: boolean;            // Sharing setting
  tags: string[];               // Organization tags
}

interface ChartConfig {
  chartType: 'line' | 'bar' | 'area' | 'scatter' | 'pie';
  color: string;                // Default hex color
  strokeWidth: number;          // Line thickness
  fillOpacity: number;          // Fill transparency
  showDataLabels: boolean;      // Show data point labels
  showGridLines: boolean;       // Display grid
  showLegend: boolean;          // Display legend
  animationEnabled: boolean;    // Enable animations
  stacked: boolean;             // Stack series (for applicable types)
}

interface SeriesConfiguration {
  id: string;                   // UUID
  label: string;                // Display name
  filter: AnalyticsFilter;      // Data filter configuration
  config: SeriesConfig;         // Series-specific overrides
  createdAt: Date;
  updatedAt: Date;
}
```

## API Integration

### Mock API Implementation

The system implements a mock API layer that simulates real backend operations:

#### Chart Management
```typescript
// Save chart to localStorage
await saveChart(chart: Chart): Promise<void>

// Load all saved charts
await loadSavedCharts(): Promise<Chart[]>

// Delete chart by ID
await deleteChart(chartId: string): Promise<void>
```

#### Data Fetching
```typescript
// Fetch analytics data for chart rendering
await getChartAnalytics(inputs: AnalyticsInput[]): Promise<AnalyticsDataPoint[]>
```

### Loading States

All API operations implement proper loading states:

- **Loading**: Shows spinner with descriptive text
- **Success**: Automatically handles navigation and state updates
- **Error**: Displays user-friendly error messages with retry options

#### Example Loading Implementation
```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string>('');

const handleSubmit = async () => {
  setIsLoading(true);
  setError('');
  
  try {
    await saveChart(chartData);
    navigate({ to: `/charts/${chartData.id}` });
  } catch (error) {
    setError('Failed to save chart. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
```

## Component Architecture

### Reusable Components

The system reuses existing chart builder components:

- **ChartBuilderOverview**: Main configuration interface
- **SeriesDetailView**: Individual series configuration
- **ChartPreview**: Live chart preview with data
- **useChartBuilder**: State management hook

### Page Components

Each route has a dedicated page component:

- **ChartsListPage**: Chart list and management
- **NewChartPage**: Chart creation form
- **ChartDetailPage**: Chart display and navigation
- **ChartConfigPage**: Full configuration interface

## Validation & Error Handling

### Form Validation
- Uses Zod schemas for runtime validation
- Real-time validation feedback
- Prevents submission with invalid data
- Clear error messages for users

### Error States
- Network errors with retry options
- Validation errors with specific field feedback
- Chart not found errors with navigation back
- Loading failures with descriptive messages

## Key Features

### User Experience
- **Persistent State**: Form data survives page reloads
- **Visual Feedback**: Loading states, unsaved changes indicators
- **Intuitive Navigation**: Clear breadcrumbs and back buttons
- **Responsive Design**: Works on desktop and mobile

### Data Management
- **Automatic Saving**: Charts saved to localStorage immediately
- **Conflict Resolution**: Timestamps track last modifications
- **Data Integrity**: Full validation on all operations

### Chart Visualization
- **Live Preview**: Real-time chart updates during configuration
- **Multiple Chart Types**: Line, bar, area, scatter, pie charts
- **Data Series Management**: Add, edit, delete with confirmations
- **Filter Integration**: Reuses existing filter system

## Implementation Notes

### Route Generation
Routes are automatically generated by TanStack Router based on file structure:
```
src/routes/
├── charts/
│   ├── index.lazy.tsx          # /charts
│   ├── new.lazy.tsx            # /charts/new  
│   └── $chartId/
│       ├── index.lazy.tsx      # /charts/:chartId
│       └── config.lazy.tsx     # /charts/:chartId/config
```

### Type Safety
- Full TypeScript integration
- Zod validation schemas
- Typed route parameters
- Type-safe navigation

### Performance
- Lazy loading for all route components  
- Efficient localStorage operations
- Debounced form state saving
- Query caching for chart data

## Future Enhancements

1. **Backend Integration**: Replace localStorage with real API
2. **Chart Sharing**: Public chart URLs and embedding
3. **Advanced Annotations**: visx-style annotations system
4. **Export Features**: PNG, SVG, PDF export options
5. **Collaboration**: Multi-user chart editing
6. **Templates**: Pre-built chart templates
7. **Advanced Analytics**: Computed series and metrics
