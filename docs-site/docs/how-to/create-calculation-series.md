---
id: create-calculation-series
title: How to build a ratio with a calculation series
---

Goal: Compute a derived metric (e.g., Education spending / Total expenses) as its own series.

Steps
1) Open an existing chart (or create a new one).
2) Add series → choose "Aggregated Series Calculation".
3) Set operation to Divide.
4) Add operand A: select an existing series (e.g., Education spend).
5) Add operand B: select an existing series (e.g., Total expenses).
6) Save; the evaluation aligns years and computes A/B per year.

Notes
- Cycles are prevented automatically if a series references itself indirectly.
- Use Numbers as operands for scale factors (e.g., multiply by 100 for percentage).

Screenshot placeholders
- [screenshot: Calculation series editor]
- [screenshot: chart with calculated ratio]
