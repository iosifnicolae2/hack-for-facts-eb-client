/**
 * Custom override: add a custom menu panel above the default "Recent posts" sidebar
 */
import React, {memo} from 'react';
import clsx from 'clsx';
import {translate} from '@docusaurus/Translate';
import {
  useVisibleBlogSidebarItems,
  BlogSidebarItemList,
} from '@docusaurus/plugin-content-blog/client';
import BlogSidebarContent from '@theme/BlogSidebar/Content';
import type {Props as BlogSidebarContentProps} from '@theme/BlogSidebar/Content';
import type {Props} from '@theme/BlogSidebar/Desktop';

import styles from './styles.module.css';
import type {BlogMenuItem} from '../../../blogMenu';
import {blogMenu} from '../../../blogMenu';

// Import shared menu items
const customMenu: readonly BlogMenuItem[] = blogMenu;

function CustomMenuList({items}: {items: readonly BlogMenuItem[]}) {
  return (
    <ul className={clsx('menu__list', styles.customMenuList)}>
      {items.map((item) => (
        <li key={item.label} className="menu__list-item">
          {item.href ? (
            <a className="menu__link" href={item.href}>
              {item.label}
            </a>
          ) : (
            <div className={clsx('menu__link', styles.customMenuGroupTitle)}>
              {item.label}
            </div>
          )}
          {item.children && item.children.length > 0 && (
            <ul className={clsx('menu__list', styles.customSubmenu)}>
              {item.children.map((child) => (
                <li key={child.label} className="menu__list-item">
                  <a className="menu__link" href={child.href}>
                    {child.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

const ListComponent: BlogSidebarContentProps['ListComponent'] = ({items}) => {
  return (
    <BlogSidebarItemList
      items={items}
      ulClassName={clsx(styles.sidebarItemList, 'clean-list')}
      liClassName={styles.sidebarItem}
      linkClassName={styles.sidebarItemLink}
      linkActiveClassName={styles.sidebarItemLinkActive}
    />
  );
};

function BlogSidebarDesktop({sidebar}: Props) {
  const items = useVisibleBlogSidebarItems(sidebar.items);
  return (
    <aside className="col col--3">
      <nav
        className={clsx(styles.sidebar, 'thin-scrollbar')}
        aria-label={translate({
          id: 'theme.blog.sidebar.navAriaLabel',
          message: 'Blog recent posts navigation',
          description: 'The ARIA label for recent posts in the blog sidebar',
        })}>
        {/* Custom panel */}
        <div className={clsx(styles.customPanel, 'margin-bottom--lg')}>
          <div className={clsx(styles.customPanelTitle, 'margin-bottom--sm')}>
            Quick links
          </div>
          <CustomMenuList items={customMenu} />
        </div>

        {/* Default recent posts list */}
        <div className={clsx(styles.sidebarItemTitle, 'margin-bottom--md')}>
          {sidebar.title}
        </div>
        <BlogSidebarContent
          items={items}
          ListComponent={ListComponent}
          yearGroupHeadingClassName={styles.yearGroupHeading}
        />
      </nav>
    </aside>
  );
}

export default memo(BlogSidebarDesktop);


