# Specification: Entity Analytics - Aggregated Line Items

**Version:** 2.0
**Date:** August 12, 2025

---

### **1. Executive Summary: Bridging High-Level Analytics with Detailed Financials**

This document outlines the "Aggregated Line Items" feature, a significant enhancement to the Entity Analytics page. Previously, the page provided a high-level table of entity data. This new feature introduces a detailed, interactive financial breakdown, transforming the page into a powerful tool for in-depth analysis.

The core value of this feature is its ability to bridge the gap between aggregated analytics and granular financial details. Users can now seamlessly pivot from a high-level entity comparison to a detailed, interactive view of income and expenses, and then to a historical trend analysis—all within a single, cohesive interface. This empowers users to not only see *what* an entity is spending on but also to understand the *context* and *trends* behind those numbers.

---

### **2. Feature Value & Business Logic**

#### **2.1. From "What" to "Why": Deep Financial Insights**

*   **Business Value:** This feature moves beyond simple data presentation to provide actionable insights. By allowing users to explore the detailed composition of an entity's budget, it facilitates a deeper understanding of financial priorities and operational focus.
*   **Functionality:** Users can toggle between a high-level data table and a detailed line items view. Within the line items view, they can switch between "Income" and "Expenses" and use an intuitive accordion interface to drill down from broad functional categories (e.g., "Education," "Healthcare") into specific economic line items.

#### **2.2. Consistency and User Trust**

*   **Key Decision:** A critical decision was to reuse the existing `useFinancialData` hook from the "Entity Details" page.
*   **Business Value:** This ensures that the grouping, naming, and structure of financial categories are **identical** across the entire application. This consistency is crucial for user trust; users can be confident that "Healthcare" on the analytics page represents the same data as "Healthcare" on an entity's detailed profile. It eliminates ambiguity and makes the data more reliable for analysis.

#### **2.3. From Static Data to Dynamic Exploration: Trend Analysis**

*   **Business Value:** The "View Chart" functionality transforms static, single-year data into a dynamic, multi-year trend analysis. This is a powerful tool for identifying patterns, anomalies, and long-term shifts in an entity's financial strategy.
*   **Functionality:** With a single click, users can generate a new, pre-configured chart that visualizes the historical performance of the most significant financial categories (those constituting 90% of the total). This seamless transition encourages exploratory analysis and allows users to answer deeper questions about financial trends over time.

---

### **3. Key Technical Decisions & Performance Strategy**

While the focus is on business value, several key technical decisions were made to ensure the feature is performant, scalable, and provides a smooth user experience.

#### **3.1. Performance-First Data Fetching**

*   **Conditional Loading:** The application is intelligent about data fetching. It only requests data for the view that is currently active ("Table" or "Line Items"), preventing unnecessary API calls and reducing server load.
*   **Intelligent Caching:**
    *   Filters are hashed to create a stable `queryKey`, ensuring that data is only re-fetched when the user's criteria genuinely change.
    *   Data is cached for up to 3 days, providing an instantaneous experience for users who return to the same analysis within a session or even across multiple days.
*   **Request Cancellation:** The system automatically cancels outdated data requests when filters are changed, preventing race conditions and ensuring the UI always reflects the latest selection.

#### **3.2. A Refined User Experience**

*   **Integrated UI Controls:** The "View" toggle was moved directly into the filter panel, creating a more intuitive and centralized control area for users.
*   **Skeleton Loading:** The loading experience was significantly improved by replacing a simple "Loading..." text with a detailed skeleton screen that mimics the final layout. This provides a clear visual cue that data is being prepared and improves perceived performance.

---

### **4. Summary of Value**

The "Aggregated Line Items" feature is more than just a new view; it's a strategic enhancement that:

*   **Deepens Analytical Capabilities:** By providing a detailed financial breakdown.
*   **Builds User Trust:** Through consistent data presentation.
*   **Encourages Exploration:** By seamlessly connecting aggregated data to historical trends.
*   **Ensures a High-Quality User Experience:** Through a focus on performance and thoughtful UI design.
