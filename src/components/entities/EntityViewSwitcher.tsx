import React, { useEffect, useRef } from 'react';
import { EntityView } from '@/hooks/useEntityViews';
import { cn } from '@/lib/utils';
import { Link, useParams, useSearch } from '@tanstack/react-router';

interface EntityViewSwitcherProps {
  views: EntityView[];
  activeView: string;
}

export const EntityViewSwitcher: React.FC<EntityViewSwitcherProps> = ({ views, activeView }) => {
  const { cui } = useParams({ from: '/entities/$cui' });
  const search = useSearch({ from: '/entities/$cui' });
  const activeTabRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeView]);

  return (
    <div className="overflow-x-auto whitespace-nowrap py-2 scrollbar-hide">
      {views.map((view) => (
        <Link
          key={view.id}
          ref={activeView === view.id ? activeTabRef : null}
          to="/entities/$cui"
          params={{ cui }}
          search={{ ...search, view: view.id }}
          preload="intent"
          className={cn(
            'inline-block border-1 px-3 py-1.5 mr-2 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer',
            {
              'bg-black sm:hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-100': activeView === view.id,
              'bg-slate-50/20 sm:hover:bg-slate-200/50 dark:bg-slate-800 dark:hover:bg-slate-700 text-black dark:text-white': activeView !== view.id,
            }
          )}
        >
          <div className="flex items-center">
            {view.icon}
            <span className="ml-2">
              {view.label}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};