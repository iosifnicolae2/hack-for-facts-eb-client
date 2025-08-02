---
description: Apply these standards when working with charts that display series
  with different units on multiple Y-axes
alwaysApply: false
---

When implementing multi-axis chart functionality:
1. Group series by their unit property to determine the number of Y-axes needed
2. Alternate Y-axes between left and right orientations for better readability
3. Use distinct colors for each Y-axis and match them with the axis label color
4. Display the unit as the Y-axis label at a -90 degree angle
5. Format values according to their unit type (%, RON, or custom units)
6. Ensure tooltips display values with their appropriate units
7. Default to 'RON' unit when no unit is specified
8. Support unit customization in series configuration UI