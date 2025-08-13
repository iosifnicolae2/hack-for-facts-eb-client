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
        'charts-detail',
      ],
    },
    {
      type: 'category',
      label: 'How‑to (Tasks)',
      items: [
        'how-to/compare-two-cities',
        'how-to/find-top-spenders',
        'how-to/share-a-reproducible-chart',
        'how-to/use-prefix-filters',
      ],
    },
    {
      type: 'category',
      label: 'Developers (API)',
      items: [
        'api/api-index',
        'api/api-getting-started',
        'api/api-graphql-queries',
        'api/api-graphql-schema-and-types',
        'api/api-filters-pagination-sorting',
        'api/analytics-uat-county-entity',
        'api/api-cookbook',
        'api/api-rest-endpoints',
        'api/api-errors-and-rate-limits',
      ],
    },
  ],
};

module.exports = sidebars;


