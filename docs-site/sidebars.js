/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'index',
        'quickstart',
        'workflow',
      ],
    },
    {
      type: 'category',
      label: 'Use the App',
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
      label: 'How‑to (Tasks)',
      items: [
        'how-to/compare-two-cities',
        'how-to/find-top-spenders',
        'how-to/create-calculation-series',
        'how-to/share-a-reproducible-chart',
        'how-to/use-prefix-filters',
      ],
    },
    {
      type: 'category',
      label: 'Developers (API)',
      items: [
        'api/index',
        'api/getting-started',
        'api/graphql-queries',
        'api/graphql-schema-and-types',
        'api/filters-pagination-sorting',
        'api/analytics-uat-county-entity',
        'api/cookbook',
        'api/rest-endpoints',
        'api/errors-and-rate-limits',
      ],
    },
  ],
};

module.exports = sidebars;


