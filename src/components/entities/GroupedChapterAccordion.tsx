import React from 'react';
import { AccordionItem, AccordionContent, AccordionTrigger } from '@/components/ui/accordion';
import { GroupedChapter } from './EntityLineItems';
import GroupedFunctionalAccordion from './GroupedFunctionalAccordion';
import { highlightText } from './highlight-utils.tsx';
import { formatCurrency } from '@/lib/utils';

interface GroupedChapterAccordionProps {
  ch: GroupedChapter;
  baseTotal: number;
  searchTerm: string;
}

const GroupedChapterAccordion: React.FC<GroupedChapterAccordionProps> = ({ ch, baseTotal, searchTerm }) => {
  return (
    <AccordionItem key={ch.prefix} value={ch.prefix}>
      <AccordionTrigger className="flex justify-between items-center py-2 px-4 hover:bg-slate-100 dark:hover:bg-slate-700 [&[data-state=open]]:bg-slate-200 dark:[&[data-state=open]]:bg-slate-700 transition-colors">
        <div className='flex justify-between w-full'>
          <span className="text-base font-medium text-slate-800 dark:text-slate-200">{highlightText(ch.description, searchTerm)}</span>
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex-shrink-0 text-right">
            {formatCurrency(ch.totalAmount)}
            <span className="text-xs text-muted-foreground ml-1">{((ch.totalAmount / baseTotal) * 100).toFixed(1)}%</span>
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className='border-slate-200 border-2'>
        <div className="space-y-2 px-2 py-2">
          {ch.functionals.map((func) => (
            <GroupedFunctionalAccordion key={func.code} func={func} baseTotal={baseTotal} searchTerm={searchTerm} />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default GroupedChapterAccordion; 