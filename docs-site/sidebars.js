/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Overview',
      collapsed: false,
      items: [
        'overview',
        'workflow',
        'global-search-and-navigation',
        'app-shell-and-navigation',
      ],
    },
    {
      type: 'category',
      label: 'Main Pages',
      items: [
        'entity-details',
        'map',
        'entity-analytics',
        'charts-list',
        'charts-create',
        'charts-detail',
      ],
    },
    {
      type: 'category',
      label: 'System & Utilities',
      items: [
        'filters-system',
        'storage-and-persistence',
        'data-and-analytics-utilities',
        'performance-and-routing',
        'error-and-telemetry',
        'cookies-and-policies',
        'deeplinks-and-python-tools',
      ],
    },
  ],
};

module.exports = sidebars;


