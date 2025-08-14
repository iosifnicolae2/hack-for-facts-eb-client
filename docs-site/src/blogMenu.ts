export type BlogMenuItem = {
  readonly label: string;
  readonly href?: string;
  readonly children?: readonly BlogMenuItem[];
};

export const blogMenu: readonly BlogMenuItem[] = [
  {
    label: 'Featured insights',
    children: [
      { label: 'Welcome post', href: '/blog/welcome' },
      { label: 'All announcements', href: '/blog/tags/announcement' },
    ],
  },
  {
    label: 'By topic',
    children: [
      { label: 'Charts', href: '/blog/tags/charts' },
      { label: 'Map', href: '/blog/tags/map' },
      { label: 'Analytics', href: '/blog/tags/analytics' },
    ],
  },
];


