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
        blog: {
          path: 'blog',
          routeBasePath: '/blog',
          showReadingTime: true,
          blogSidebarTitle: 'Recent posts',
          blogSidebarCount: 10,
          postsPerPage: 10,
          blogTitle: 'Transparenta.eu Blog',
          blogDescription: 'News, release notes, and deep dives into Transparenta.eu features and data workflows.',
          editUrl: 'https://github.com/ClaudiuBogdan/hack-for-facts-eb-client/edit/dev/docs-site/blog/',
          editLocalizedFiles: true,
          authorsMapPath: '../authors.yml',
          feedOptions: {
            type: 'all',
            copyright: `© ${new Date().getFullYear()} Transparenta.eu`,
            createFeedItems: async (params) => {
              const { blogPosts, defaultCreateFeedItems, ...rest } = params;
              return defaultCreateFeedItems({
                blogPosts: blogPosts.slice(0, 10),
                ...rest,
              });
            },
          },
        },
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
        { type: 'doc', docsPluginId: 'learn', docId: 'intro', label: 'Learn', position: 'left' },
        { to: '/blog', label: 'Blog', position: 'left' },
        { to: '/releases', label: 'Releases', position: 'left' },
        // { to: '/blog/tags', label: 'Tags', position: 'left' },
        // { to: '/blog/archive', label: 'Archive', position: 'left' },
        // { to: '/blog/authors', label: 'Authors', position: 'left' },
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
          title: 'Docs & Updates',
          items: [
            { label: 'Learn', href: '/docs/learn/intro' },
            { label: 'Releases', href: '/docs/releases' },
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
      copyright: `© ${new Date().getFullYear()} Transparenta.eu`,
    },
    breadcrumbs: true,
    prism: {},
  },
  plugins: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        // Use non-hashed filename to satisfy consumers expecting `search-index.json`
        hashed: false,
        indexDocs: true,
        indexBlog: true,
        docsRouteBasePath: ['/', '/learn'],
        blogRouteBasePath: ['/blog', '/releases'],
        language: ['ro', 'en'],
        highlightSearchTermsOnTargetPage: true,
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'learn',
        path: 'learn',
        routeBasePath: 'learn',
        sidebarPath: './sidebars.learn.js',
        editUrl: undefined,
      },
    ],
    [
      '@docusaurus/plugin-content-blog',
      {
        id: 'releases',
        path: 'releases',
        routeBasePath: 'releases',
        showReadingTime: false,
        blogTitle: 'Releases',
        blogDescription: 'Release notes and version history for Transparenta.eu.',
        blogSidebarTitle: 'All Releases',
        blogSidebarCount: 20,
        editUrl: 'https://github.com/ClaudiuBogdan/hack-for-facts-eb-client/edit/dev/docs-site/releases/',
        editLocalizedFiles: true,
        authorsMapPath: '../authors.yml',
        feedOptions: {
          type: 'all',
          copyright: `© ${new Date().getFullYear()} Transparenta.eu`,
          createFeedItems: async (params) => {
            const { blogPosts, defaultCreateFeedItems, ...rest } = params;
            return defaultCreateFeedItems({
              blogPosts: blogPosts.slice(0, 20),
              ...rest,
            });
          },
        },
      },
    ],
  ],
};

module.exports = config;


