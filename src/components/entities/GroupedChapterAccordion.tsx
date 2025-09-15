import React from 'react';
import { AccordionItem, AccordionContent, AccordionTrigger } from '@/components/ui/accordion';
import { GroupedChapter, GroupedFunctional, GroupedSubchapter } from '@/schemas/financial';
import GroupedFunctionalAccordion from './GroupedFunctionalAccordion';
import GroupedSubchapterAccordion from './GroupedSubchapterAccordion';
import { highlightText } from './highlight-utils.tsx';
import { formatCurrency, formatNumber, getNormalizationUnit } from '@/lib/utils';

interface GroupedChapterAccordionProps {
  ch: GroupedChapter;
  baseTotal: number;
  searchTerm: string;
  normalization?: 'total' | 'total_euro' | 'per_capita' | 'per_capita_euro';
}

const GroupedChapterAccordion: React.FC<GroupedChapterAccordionProps> = ({ ch, baseTotal, searchTerm, normalization }) => {
  const unit = getNormalizationUnit(normalization ?? 'total');
  const currencyCode = unit.includes('EUR') ? 'EUR' : 'RON'; // Unit can also be 'RON/capita' or 'EUR/capita', for currency we only need 'RON' or 'EUR'
  return (
    <AccordionItem key={ch.prefix} value={ch.prefix}>
      <AccordionTrigger className="flex justify-between items-center py-2 px-4 hover:bg-slate-100 dark:hover:bg-slate-700 [&[data-state=open]]:bg-slate-100 dark:[&[data-state=open]]:bg-slate-700 transition-colors">
        <div className='grid grid-cols-[1fr_auto] w-full items-center gap-4'>
          <div className="flex items-center overflow-hidden">
            <span className="text-base font-medium text-slate-800 dark:text-slate-200">{highlightText(ch.description, searchTerm)}</span>
          </div>
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 text-right mr-4">
            <p className="flex justify-end items-center gap-1.5">
              {formatCurrency(ch.totalAmount, "compact", currencyCode)}
              <span className="text-xs text-muted-foreground w-12 text-left">{`(${formatNumber(ch.totalAmount / baseTotal * 100)}%)`}</span>
            </p>
            <p className="text-xs text-muted-foreground font-normal">{formatCurrency(ch.totalAmount, "standard", currencyCode)}</p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className='border-x-2 border-b-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800/50'>
        <div className="space-y-2 px-4 py-2">
          {ch.subchapters && ch.subchapters.length > 0 && (
            <div className="space-y-2">
              {ch.subchapters.map((sub: GroupedSubchapter) => (
                <GroupedSubchapterAccordion
                  key={sub.code}
                  sub={sub}
                  baseTotal={baseTotal}
                  searchTerm={searchTerm}
                />
              ))}
            </div>
          )}
          {ch.functionals.map((func: GroupedFunctional) => (
            <GroupedFunctionalAccordion
              key={func.code}
              func={func}
              baseTotal={baseTotal}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default GroupedChapterAccordion; 