import React from 'react';
import { EntityView } from '@/hooks/useEntityViews';
import { cn } from '@/lib/utils';

interface EntityViewSwitcherProps {
  views: EntityView[];
  activeView: string;
  onViewChange: (viewId: string) => void;
  className?: string;
}

export const EntityViewSwitcher: React.FC<EntityViewSwitcherProps> = ({ views, activeView, onViewChange, className }) => {
  return (
    <div className={cn("relative", className)}>
      <div className="overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
        {views.map((view) => (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={cn(
              'inline-block border-1 px-3 py-1.5 mr-2 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer',
              {
                'bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-100': activeView === view.id,
                'bg-slate-50/20 hover:bg-slate-100/20 dark:bg-slate-800 dark:hover:bg-slate-700 text-black dark:text-white': activeView !== view.id,
              }
            )}
          >
            <div className="flex items-center">
              {view.icon}
              <span className="ml-2">
                {view.label}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};