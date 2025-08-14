---
id: storage-and-persistence
title: Storage & Persistence — Keep your work safe and handy
---

A beginner‑friendly guide to how Transparenta.eu stores your charts and preferences on your device, and how to back up or restore them. No technical setup needed.

### Quick Start
1) Open Charts from the homepage.
2) Click Create chart to make your first chart.
3) Your chart saves locally on your device.
4) Back it up from the Charts page when you’re ready.

<!-- ![IMG PLACEHOLDER — Quick tour](./images/PLACEHOLDER-storage-quickstart.png "Create chart and see it saved locally") -->

### Guided Tour

#### Where your charts live
- What you see
  - Charts page shows your saved charts with search and filters.
  - Each chart card has actions (favorite, categories, open).
- How to use
  1) Open Charts from the homepage.
  2) Use Search charts… to find a title or tag (#education).
  3) Switch tabs: All, Favorites, or a Category.
- Example
  - Favorite a chart to find it faster next time.
- Media
  <!-- - [GIF PLACEHOLDER — Browse saved charts](./gifs/PLACEHOLDER-storage-browse.gif) -->

#### Create and autosave
- What you see
  - “Create chart” opens a new chart and a configuration dialog.
  - Your edits are stored locally as you go.
- How to use
  1) Click Create chart.
  2) Add a series (e.g., line‑items aggregated yearly).
  3) Save and close configuration; the chart appears in your list.
- Example
  - Title your chart for easier search later.
- Media
  <!-- - ![IMG PLACEHOLDER — Create chart](./images/PLACEHOLDER-storage-create.png "Create and autosave chart") -->

#### Backup and restore
- What you see
  - “Backup/Restore” controls on the Charts page.
  - Options to export or import your entire chart library.
- How to use
  1) Click Backup/Restore.
  2) Export backup to download a file.
  3) Import backup to load charts on a new device.
- Example
  - Move charts from your laptop to your desktop.
- Media
  <!-- - [GIF PLACEHOLDER — Backup and restore](./gifs/PLACEHOLDER-storage-backup.gif) -->

#### Empty and error states
- Empty list
  - “No charts yet” with a button: Create your first chart.
- No search results
  - “No results. Try a different search term or sorting.”
- Import issues
  - You’ll see a toast if import fails. Try again with a valid backup file.

### Common Tasks (recipes)

#### Back up all charts
- Steps
  1) Open Charts.
  2) Click Backup/Restore.
  3) Choose Export backup and save the file.
- Expected result
  - A backup file is downloaded to your computer.
- Tip
  - Keep the file in cloud storage for safety.
- Link
  - LINK PLACEHOLDER — Backup flow

#### Restore charts on a new device
- Steps
  1) Open Charts.
  2) Click Backup/Restore.
  3) Choose Import backup and select your file.
- Expected result
  - Your charts appear in the list.
- Tip
  - If nothing appears, confirm the backup is recent and valid.
- Link
  - LINK PLACEHOLDER — Restore flow

#### Organize with favorites and categories
- Steps
  1) On the Charts page, mark a chart as Favorite.
  2) Add it to a Category from the tag menu.
  3) Switch to the Favorites tab or the Category tab.
- Expected result
  - Your chart is easy to find by tab or tag.
- Tip
  - Use short, meaningful category names.
- Link
  - LINK PLACEHOLDER — Organize charts

### Understanding the Numbers
- Local‑first
  - Charts and preferences are stored in your browser storage.
- What is backed up
  - Chart data (titles, series, annotations, categories, favorites).
- What is not backed up
  - Live analytics data. It’s fetched when you open a chart.

### Troubleshooting & FAQ
- I don’t see my chart on a different device
  - Charts are local. Use Backup/Restore to move them.
- The backup file doesn’t import
  - Ensure the file is unmodified and created by Transparenta.eu.
- I deleted a chart by mistake
  - There’s no recycle bin. Restore from a recent backup if available.
- I lost my categories
  - Categories are included in backups. Re‑import the latest backup.

### Accessibility & Keyboard tips
- Keyboard
  - Use Tab to navigate lists and buttons.
- Visual
  - Clear empty states and toasts guide you through actions.
- Mobile
  - Actions stay available; some controls may move into menus.

### Privacy & Data
- Your charts live on your device.
- Backups are yours; keep them safe.
- No automatic uploads without action.
- Analytics and enhanced errors only run with your consent.

### Glossary
- Backup
  - A downloadable file with your saved charts.
- Restore
  - Load a backup file into Transparenta.eu.
- Favorites
  - A quick way to pin charts you use often.
- Category
  - A tag that groups charts (e.g., “Education”).

### === SCREENSHOT & MEDIA CHECKLIST ===
- Charts list with Search and tabs (All, Favorites, Category)
- Create chart action and the new chart appearing
- Backup/Restore dialog and export step
- Empty state “No charts yet”
- No results state on search

### === OPEN QUESTIONS FOR MAINTAINERS ===
- Confirm backup file format and size guidance for the docs.
- Is partial restore (select charts) planned? If yes, how will it appear?
