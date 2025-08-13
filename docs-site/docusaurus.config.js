// @ts-check
/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Transparenta.eu Documentation',
  tagline: 'Explore Romanian public finance data – user guide and developer specs',
  url: 'https://transparenta.eu',
  baseUrl: '/docs/',
  i18n: {
    defaultLocale: 'ro',
    locales: ['ro', 'en'],
    localeConfigs: {
      en: { label: 'English' },
      ro: { label: 'Română' },
    },
  },
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'transparenta',
  projectName: 'docs',
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */ ({
        docs: {
          path: 'docs',
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
          editUrl: undefined,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],
  themeConfig: {
    navbar: {
      title: 'Transparenta.eu',
      items: [
        { type: 'doc', docId: 'index', label: 'Docs', position: 'left' },
        { href: 'https://github.com/ClaudiuBogdan/hack-for-facts-eb-client', label: 'GitHub', position: 'right' },
        { type: 'localeDropdown', position: 'right' },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Product',
          items: [
            { label: 'App', href: 'https://transparenta.eu' },
            { label: 'Charts', href: 'https://transparenta.eu/charts' },
            { label: 'Map', href: 'https://transparenta.eu/map' },
            { label: 'Entity Analytics', href: 'https://transparenta.eu/entity-analytics' },
          ],
        },
        {
          title: 'Legal',
          items: [
            { label: 'Privacy Policy', href: 'https://transparenta.eu/privacy' },
            { label: 'Terms', href: 'https://transparenta.eu/terms' },
            { label: 'Cookies', href: 'https://transparenta.eu/cookies' },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Transparenta.eu` ,
    },
    prism: {},
  },
};

module.exports = config;


