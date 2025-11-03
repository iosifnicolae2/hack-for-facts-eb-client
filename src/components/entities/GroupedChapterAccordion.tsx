import React from 'react';
import { AccordionItem, AccordionContent, AccordionTrigger } from '@/components/ui/accordion';
import { GroupedChapter, GroupedFunctional, GroupedSubchapter } from '@/schemas/financial';
import GroupedFunctionalAccordion from './GroupedFunctionalAccordion';
import GroupedSubchapterAccordion from './GroupedSubchapterAccordion';
import { highlightText } from './highlight-utils';
import { formatCurrency, formatNumber, getNormalizationUnit } from '@/lib/utils';
import { ClassificationInfoLink } from '@/components/common/classification-info-link';

interface GroupedChapterAccordionProps {
  ch: GroupedChapter;
  baseTotal: number;
  searchTerm: string;
  normalization?: 'total' | 'total_euro' | 'per_capita' | 'per_capita_euro';
  codePrefixForSubchapters?: 'fn' | 'ec';
}

const GroupedChapterAccordion: React.FC<GroupedChapterAccordionProps> = ({ ch, baseTotal, searchTerm, normalization, codePrefixForSubchapters = 'fn' }) => {
  const unit = getNormalizationUnit(normalization ?? 'total');
  const currencyCode = unit.includes('EUR') ? 'EUR' : 'RON'; // Unit can also be 'RON/capita' or 'EUR/capita', for currency we only need 'RON' or 'EUR'
  // Merge subchapters and functionals and sort by total amount descending
  const mergedSortedItems = React.useMemo(() => {
    const subs = (ch.subchapters ?? []).map((s) => ({ kind: 'sub' as const, amount: s.totalAmount, data: s }));
    const funcs = ch.functionals.map((f) => ({ kind: 'func' as const, amount: f.totalAmount, data: f }));
    return [...subs, ...funcs].sort((a, b) => b.amount - a.amount);
  }, [ch.subchapters, ch.functionals]);

  return (
    <AccordionItem key={ch.prefix} value={ch.prefix}>
      <AccordionTrigger className="group flex justify-between items-center py-2 px-3 sm:px-4 hover:bg-slate-100 dark:hover:bg-slate-700 [&[data-state=open]]:bg-slate-100 dark:[&[data-state=open]]:bg-slate-700 transition-colors">
        <div className="grid w-full items-center gap-1.5 sm:gap-2 lg:gap-4 grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="flex min-w-0 flex-row sm:items-center sm:gap-2">
            <span className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200 break-words">
              {highlightText(ch.description, searchTerm)}
            </span>
            <ClassificationInfoLink type="functional" code={ch.prefix} />
          </div>
          <div className="text-right text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
            <p className="flex justify-end items-center gap-1 sm:gap-1.5">
              {formatCurrency(ch.totalAmount, "compact", currencyCode)}
              {baseTotal > 0 && (
                <span className="hidden sm:inline text-xs text-muted-foreground">{`(${formatNumber(ch.totalAmount / baseTotal * 100)}%)`}</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground font-normal">
              {formatCurrency(ch.totalAmount, "standard", currencyCode)}
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="border-x-2 border-b-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="space-y-2 px-3 sm:px-4 py-2">
          <div className="space-y-2">
            {mergedSortedItems.map((entry) => (
              entry.kind === 'sub' ? (
                <GroupedSubchapterAccordion
                  key={(entry.data as GroupedSubchapter).code}
                  sub={entry.data as GroupedSubchapter}
                  baseTotal={baseTotal}
                  searchTerm={searchTerm}
                  normalization={normalization}
                  codePrefix={codePrefixForSubchapters}
                />
              ) : (
                <GroupedFunctionalAccordion
                  key={(entry.data as GroupedFunctional).code}
                  func={entry.data as GroupedFunctional}
                  baseTotal={baseTotal}
                  searchTerm={searchTerm}
                  normalization={normalization}
                />
              )
            ))}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default GroupedChapterAccordion; 
