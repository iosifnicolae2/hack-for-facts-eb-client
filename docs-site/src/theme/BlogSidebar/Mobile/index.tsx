/**
 * Custom override: add a custom menu panel above the default recent posts
 * in the mobile secondary menu.
 */
import React, {memo, type ReactNode} from 'react';
import {
  useVisibleBlogSidebarItems,
  BlogSidebarItemList,
} from '@docusaurus/plugin-content-blog/client';
import {NavbarSecondaryMenuFiller} from '@docusaurus/theme-common';
import BlogSidebarContent from '@theme/BlogSidebar/Content';
import type {Props} from '@theme/BlogSidebar/Mobile';
import type {Props as BlogSidebarContentProps} from '@theme/BlogSidebar/Content';

import styles from './styles.module.css';
import type {BlogMenuItem} from '../../../blogMenu';
import {blogMenu} from '../../../blogMenu';

// Import shared menu items
const customMenu: readonly BlogMenuItem[] = blogMenu;

function CustomMenuList({items}: {items: readonly BlogMenuItem[]}) {
  return (
    <ul className={styles.customMenuList + ' menu__list'}>
      {items.map((item) => (
        <li key={item.label} className="menu__list-item">
          {item.href ? (
            <a className="menu__link" href={item.href}>
              {item.label}
            </a>
          ) : (
            <div className={styles.customMenuGroupTitle + ' menu__link'}>
              {item.label}
            </div>
          )}
          {item.children && item.children.length > 0 && (
            <ul className={styles.customSubmenu + ' menu__list'}>
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
      ulClassName="menu__list"
      liClassName="menu__list-item"
      linkClassName="menu__link"
      linkActiveClassName="menu__link--active"
    />
  );
};

function BlogSidebarMobileSecondaryMenu({sidebar}: Props): ReactNode {
  const items = useVisibleBlogSidebarItems(sidebar.items);
  return (
    <div>
      {/* Custom panel */}
      <div className="margin-bottom--md">
        <div className={styles.customPanelTitle + ' margin-bottom--xs'}>
          Quick links
        </div>
        <CustomMenuList items={customMenu} />
      </div>

      {/* Default recent posts list */}
      <BlogSidebarContent
        items={items}
        ListComponent={ListComponent}
        yearGroupHeadingClassName={styles.yearGroupHeading}
      />
    </div>
  );
}

function BlogSidebarMobile(props: Props): ReactNode {
  return (
    <NavbarSecondaryMenuFiller
      component={BlogSidebarMobileSecondaryMenu}
      props={props}
    />
  );
}

export default memo(BlogSidebarMobile);


