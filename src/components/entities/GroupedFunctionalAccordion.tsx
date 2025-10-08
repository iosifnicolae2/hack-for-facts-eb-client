import React from 'react';
import { Accordion, AccordionItem, AccordionContent, AccordionTrigger } from '@/components/ui/accordion';
import { GroupedFunctional, GroupedEconomic } from '@/schemas/financial';
import { highlightText } from './highlight-utils';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface GroupedFunctionalAccordionProps {
  func: GroupedFunctional;
  baseTotal: number;
  searchTerm: string;
}

const GroupedFunctionalAccordion: React.FC<GroupedFunctionalAccordionProps> = ({ func, baseTotal, searchTerm }) => {
  if (func.economics.length === 0) {
    return (
      <div key={func.code} className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] items-center gap-1.5 sm:gap-4 py-2 px-3 sm:px-4 border-b">
        <div className="flex min-w-0 items-start sm:items-center gap-1.5">
          <span className="font-mono text-xs text-muted-foreground flex-shrink-0">{highlightText(`fn:${func.code}`, searchTerm)}</span>
          <span className="text-sm text-slate-700 dark:text-slate-300 break-words">{highlightText(func.name, searchTerm)}</span>
        </div>
        <div className="text-right text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
          <p className="flex justify-end items-center gap-1 sm:gap-1.5">
            {formatCurrency(func.totalAmount, "compact")}
            {baseTotal > 0 && (
              <span className="hidden sm:inline text-xs text-muted-foreground">{`(${formatNumber(func.totalAmount / baseTotal * 100)}%)`}</span>
            )}
          </p>
          <p className="text-xs text-muted-foreground font-normal">
            {formatCurrency(func.totalAmount, "standard")}
          </p>
        </div>
      </div>
    );
  }

  // If this is a .00 item and it's the only child (handled at subchapter level), we already render a non-accordion row.
  return (
    <Accordion key={func.code} type="single" collapsible {...(searchTerm ? { defaultValue: func.code } : {})}>
      <AccordionItem value={func.code}>
        <AccordionTrigger className="flex justify-between items-center py-2 px-3 sm:px-4 hover:bg-slate-100 dark:hover:bg-slate-700 [&[data-state=open]]:bg-slate-100 dark:[&[data-state=open]]:bg-slate-700 transition-colors">
          <div className="grid w-full items-center gap-1.5 sm:gap-2 lg:gap-4 grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div className="flex min-w-0 items-start sm:items-center gap-1.5">
              <span className="font-mono text-xs text-muted-foreground flex-shrink-0">{highlightText(`fn:${func.code}`, searchTerm)}</span>
              <span className="text-sm text-slate-700 dark:text-slate-300 break-words">{highlightText(func.name, searchTerm)}</span>
            </div>
            <div className="text-right text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
              <p className="flex justify-end items-center gap-1 sm:gap-1.5">
                {formatCurrency(func.totalAmount, "compact")}
                {baseTotal > 0 && (
                  <span className="hidden sm:inline text-xs text-muted-foreground">{`(${formatNumber(func.totalAmount / baseTotal * 100)}%)`}</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground font-normal">
                {formatCurrency(func.totalAmount, "standard")}
              </p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <ul className="divide-y divide-slate-100 dark:divide-slate-800 py-1 px-3 sm:px-4">
            {func.economics.map((eco: GroupedEconomic) => (
              <li key={eco.code} className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] items-center gap-1.5 sm:gap-4 py-1.5">
                <div className="flex min-w-0 items-start sm:items-center gap-1.5 pl-2">
                  <span className="font-mono text-xs text-muted-foreground flex-shrink-0">{highlightText(`ec:${eco.code}`, searchTerm)}</span>
                  <span className="text-sm text-slate-700 dark:text-slate-300 break-words">{highlightText(eco.name, searchTerm)}</span>
                </div>
                <div className="text-right text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                  <p className="flex justify-end items-center gap-1 sm:gap-1.5">
                    {formatCurrency(eco.amount, "compact")}
                    {baseTotal > 0 && (
                      <span className="hidden sm:inline text-xs text-muted-foreground">{`(${formatNumber(eco.amount / baseTotal * 100)}%)`}</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground font-normal">
                    {formatCurrency(eco.amount, "standard")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default GroupedFunctionalAccordion; 