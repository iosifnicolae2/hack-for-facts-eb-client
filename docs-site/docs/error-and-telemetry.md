---
id: error-and-telemetry
title: Error Handling & Telemetry — Beginner Guide
---

Transparenta.eu is designed to fail safely and respect your privacy. If something goes wrong, you’ll see a clear message and suggestions to recover. Optional analytics and enhanced error reporting only run with your consent.

**Who it’s for**: Anyone who wants a stable app and clear privacy choices

**Outcomes**: Know what happens on errors, how to retry, and how telemetry uses your consent

### Quick Start
1) On first visit, choose cookie preferences: “Essential only” or “Accept all”.
2) Browse normally — all data tools work with either choice.
3) If an error appears, read the message and click Retry or go Back.
4) If you opted‑in, enhanced error reports help us fix issues faster.
5) You can change your choice anytime from Cookie Settings.

<!-- ![IMG PLACEHOLDER — Error & telemetry quickstart](./images/PLACEHOLDER-eryror-quickstart.png "Cookie banner, error message with retry") -->

### Guided Tour

#### Cookie banner (consent)
- What you see
  - Banner with “Essential only”, “Accept all”, and “Cookie Settings”.
- How to use
  1) Pick “Essential only” to keep analytics off.
  2) Or “Accept all” to enable analytics and enhanced errors.
  3) Open “Cookie Settings” later to change.
- Example
  - Start with Essential only; turn analytics on later.
- Media
  <!-- - [GIF PLACEHOLDER — Cookie consent](./gifs/PLACEHOLDER-error-cookies.gif) -->

#### Error boundaries (safe failure)
- What you see
  - A friendly error message if a component fails.
  - Options like Retry or navigation back to safety.
- How to use
  1) Click Retry if available.
  2) Use Back or return to Home.
  3) If the issue persists, try a different year or remove filters.
- Example
  - Network hiccup while loading a chart → Retry succeeds.
- Media
  <!-- - ![IMG PLACEHOLDER — Error UI](./images/PLACEHOLDER-error-ui.png "Error message with retry and guidance") -->

#### Enhanced error reports (opt‑in)
- What you see
  - With consent, the app may send non‑sensitive diagnostics.
- How to use
  1) Opt‑in via “Accept all” or Cookie Settings.
  2) Use the app normally; failures include anonymous context.
  3) Turn it off anytime.
- Example
  - A rare UI crash is reported (without personal content) to help fix it.
- Media
  <!-- - [GIF PLACEHOLDER — Toggle enhanced errors](./gifs/PLACEHOLDER-error-toggle.gif) -->

#### Network and data errors
- What you see
  - Messages like “No data found”, “Request failed”, or “Timed out”.
- How to use
  1) Switch to Total or broaden filters.
  2) Try another year.
  3) Retry after a few seconds.
- Example
  - A slow connection causes a timeout; Retry works.
- Media
  <!-- - ![IMG PLACEHOLDER — Network error](./images/PLACEHOLDER-error-network.png "Retry and guidance for data errors") -->

### Common Tasks (recipes)

#### Change cookie settings later
- Steps
  1) Open Cookie Settings.
  2) Choose “Essential only” or “Accept all”.
- Expected result
  - Preferences apply immediately.
- Tip
  - You can keep analytics off and still use all features.
- Link
  - LINK PLACEHOLDER — Cookie Settings

#### Recover from an error
- Steps
  1) Read the error message.
  2) Click Retry or go Back.
  3) Adjust filters (prefixes, year) if needed.
- Expected result
  - Page loads successfully.
- Tip
  - For charts, try re‑opening from the Charts list.
- Link
  - LINK PLACEHOLDER — Error recovery

#### Report an issue (with consent)
- Steps
  1) Enable enhanced errors (Cookie Settings → Accept all), optional.
  2) Reproduce the issue.
  3) Share steps and the time of occurrence when contacting support.
- Expected result
  - Faster diagnosis and fix.
- Tip
  - If you prefer, keep Essential only; the app works the same.
- Link
  - LINK PLACEHOLDER — Contact support

### Understanding the Numbers & Data
- Consent‑aware telemetry
  - Analytics and enhanced errors only run with your opt‑in.
- What is never included
  - Your private content; budget data you view is public.
- What might be collected (when enabled)
  - Anonymous device/browser info, screen of failure, and error stack.
- Core data access
  - Your ability to search, filter, export, and share is not tied to consent.

### Troubleshooting & FAQ
- The cookie banner reappeared
  - Your browser cleared storage; choose again.
- I see “No data found”
  - Switch to Total; try a broader prefix or a different year.
- A chart keeps failing
  - Reopen from Charts; remove series to isolate the issue.
- How do I turn telemetry off?
  - Open Cookie Settings and select “Essential only”.

### Accessibility & Keyboard tips
- Cookie banner
  - Fully keyboard accessible (Tab/Enter to navigate and select).
- Focus search
  - Press ⌘/Ctrl+K from any page.
- Retry and navigation
  - Use Tab to reach Retry links or buttons.

### Privacy & Data
- Your choice respected
  - No analytics or enhanced error reports without consent.
- Storage
  - Consent is stored locally in your browser.
- Data sources
  - Based on official budget execution data.

### Glossary (short)
- Error boundary
  - UI that contains failures and offers recovery.
- Enhanced error reporting
  - Extra, anonymous diagnostics when you opt‑in.
- Analytics
  - Anonymous usage patterns used to improve the product.

### See also
- Cookies & Policies: [cookies-and-policies](./cookies-and-policies.md)
- Global Search & Navigation: [global-search-and-navigation](./global-search-and-navigation.md)

### === SCREENSHOT & MEDIA CHECKLIST ===
- Cookie banner with options
- Error UI with Retry
- Cookie Settings page toggle
- Network error message with guidance

### === OPEN QUESTIONS FOR MAINTAINERS ===
- Confirm exact error UI (Retry/back actions) we should depict.
- Any internal error codes or reference IDs surfaced to users?
