# Feature Specification: Unified Map Page

## 1. Overview

The Unified Map Page provides a seamless and interactive experience for visualizing public spending data across Romania. This feature consolidates multiple geographical views into a single, cohesive interface, allowing users to effortlessly switch between different levels of data aggregation, such as UAT (Unitate Administrativ-Teritorială) and County (Județ). The page is designed to be intuitive, responsive, and performant, offering a powerful tool for data exploration and analysis.

## 2. Key Features

### 2.1. Dynamic View Switching

Users can dynamically switch between two primary map views:

-   **UAT View:** Displays detailed spending data for each individual municipality, town, and commune in Romania. This is the default view and offers the most granular level of insight.
-   **County View:** Aggregates spending data at the county level, providing a broader overview of regional spending patterns.

A dedicated control in the filter panel allows for easy switching between these views, triggering an automatic refresh of all a single, cohesive interface, allowing users to effortlessly switch between different levels of data aggregation, such as UAT (Unitate Administrativ-Teritorială) and County (Județ). The page is designed to be intuitive, responsive, and performant, offering a powerful tool for data exploration and analysis.

## 2. Key Features

### 2.1. Dynamic View Switching

Users can dynamically switch between two primary map views:

-   **UAT View:** Displays detailed spending data for each individual municipality, town, and commune in Romania. This is the default view and offers the most granular level of insight.
-   **County View:** Aggregates spending data at the county level, providing a broader overview of regional spending patterns.

A dedicated control in the filter panel allows for easy switching between these views, triggering an automatic refresh of all associated data visualizations.

### 2.2. Interactive Heatmap

The core of the Unified Map Page is an interactive heatmap that visually represents financial data on a map of Romania. The color intensity of each region corresponds to the filtered financial amount, providing an at-a-glance understanding of spending distribution. The heatmap is fully dynamic and updates in real-time as filters are applied or the map view is changed.

### 2.3. Multi-Faceted Data Exploration

The page offers three distinct ways to explore the data, each presented in a separate tab:

1.  **Map View:** The primary interactive map, where users can hover over a region to see a detailed tooltip or click on a UAT to navigate to its dedicated entity page.
2.  **Table View:** A comprehensive, paginated, and sortable data table that presents the raw heatmap data in a structured format. The table columns are dynamically adjusted to match the selected view (UAT or County).
3.  **Chart View:** A collection of responsive charts that provide additional visual insights into the data. These charts adapt to the selected view, displaying relevant aggregations and comparisons.

### 2.4. Unified Filtering

A single, persistent set of filters is used across all views and data aggregation levels. This ensures a consistent user experience and allows for seamless data exploration without the need to re-apply filters when switching between views.

## 3. How It Works

The Unified Map Page is powered by a robust and efficient data-fetching and state management system. When a user changes the map view or applies a filter, the following sequence of events is triggered:

1.  The central state management store is updated with the new view type or filter parameters.
2.  Custom hooks for data fetching are automatically re-triggered, which then request the appropriate data from the backend (either UAT or County level).
3.  GeoJSON data for the selected map view is also fetched.
4.  Once the data is retrieved, all components on the page—including the map, table, and charts—are re-rendered to reflect the new data and view type.

This architecture ensures that the page is always in sync with the user's selections and that the data is fetched and displayed in the most efficient way possible.
.

### 2.2. Interactive Heatmap

The core of the Unified Map Page is an interactive heatmap that visually represents financial data on a map of Romania. The color intensity of each region corresponds to the filtered financial amount, providing an at-a-glance understanding of spending distribution. The heatmap is fully dynamic and updates in real-time as filters are applied or the map view is changed.

### 2.3. Multi-Faceted Data Exploration

The page offers three distinct ways to explore the data, each presented in a separate tab:

1.  **Map View:** The primary interactive map, where users can hover over a region to see a detailed tooltip or click on a UAT to navigate to its dedicated entity page.
2.  **Table View:** A comprehensive, paginated, and sortable data table that presents the raw heatmap data in a structured format. The table columns are dynamically adjusted to match the selected view (UAT or County).
3.  **Chart View:** A collection of responsive charts that provide additional visual insights into the data. These charts adapt to the selected view, displaying relevant aggregations and comparisons.

### 2.4. Unified Filtering

A single, persistent set of filters is used across all views and data aggregation levels. This ensures a consistent user experience and allows for seamless data exploration without the need to re-apply filters when switching between views.

## 3. How It Works

The Unified Map Page is powered by a robust and efficient data-fetching and state management system. When a user changes the map view or applies a filter, the following sequence of events is triggered:

1.  The central state management store is updated with the new view type or filter parameters.
2.  Custom hooks for data fetching are automatically re-triggered, which then request the appropriate data from the backend (either UAT or County level).
3.  GeoJSON data for the selected map view is also fetched.
4.  Once the data is retrieved, all components on the page—including the map, table, and charts—are re-rendered to reflect the new data and view type.

This architecture ensures that the page is always in sync with the user's selections and that the data is fetched and displayed in the most efficient way possible.
