import React from 'react';
import { Accordion, AccordionItem, AccordionContent, AccordionTrigger } from '@/components/ui/accordion';
import { GroupedFunctional, GroupedEconomic } from './EntityLineItems';
import { highlightText } from './highlight-utils';
import { formatCurrency } from '@/lib/utils';

interface GroupedFunctionalAccordionProps {
  func: GroupedFunctional;
  baseTotal: number;
  searchTerm: string;
}

const GroupedFunctionalAccordion: React.FC<GroupedFunctionalAccordionProps> = ({ func, baseTotal, searchTerm }) => {
  if (func.economics.length === 0) {
    return (
      <div key={func.code} className="grid grid-cols-[1fr_auto] items-center gap-4 py-2 px-4 border-b">
        <div className="flex items-center overflow-hidden">
          <span className="font-mono text-xs text-muted-foreground mr-2">{highlightText(`fn:${func.code}`, searchTerm)}</span>
          <span className="text-sm text-slate-700 dark:text-slate-300">{highlightText(func.name, searchTerm)}</span>
        </div>
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 text-right">
          <p className="flex justify-end items-center gap-1.5">
            {formatCurrency(func.totalAmount, "compact")}
            <span className="text-xs text-muted-foreground w-12 text-left">{`(${(func.totalAmount / baseTotal * 100).toFixed(1)}%)`}</span>
          </p>
          <p className="text-xs text-muted-foreground">{formatCurrency(func.totalAmount, "standard")}</p>
        </div>
      </div>
    );
  }

  return (
    <Accordion key={func.code} type="single" collapsible {...(searchTerm ? { defaultValue: func.code } : {})}>
      <AccordionItem value={func.code}>
        <AccordionTrigger className="flex justify-between items-center py-2 px-4 hover:bg-slate-100 dark:hover:bg-slate-700 [&[data-state=open]]:bg-slate-100 dark:[&[data-state=open]]:bg-slate-700 transition-colors">
          <div className='grid grid-cols-[1fr_auto] w-full items-center gap-4'>
            <div className="flex items-center overflow-hidden">
              <span className="font-mono text-xs text-muted-foreground mr-2">{highlightText(`fn:${func.code}`, searchTerm)}</span>
              <span className="text-sm text-slate-700 dark:text-slate-300">{highlightText(func.name, searchTerm)}</span>
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 text-right">
              <p className="flex justify-end items-center gap-1.5">
                {formatCurrency(func.totalAmount, "compact")}
                <span className="text-xs text-muted-foreground w-12 text-left">{`(${(func.totalAmount / baseTotal * 100).toFixed(1)}%)`}</span>
              </p>
              <p className="text-xs text-muted-foreground">{formatCurrency(func.totalAmount, "standard")}</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className='border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'>
          <ul className="py-1 px-4 divide-y divide-slate-100 dark:divide-slate-800">
            {func.economics.map((eco: GroupedEconomic) => (
              <li key={eco.code} className="grid grid-cols-[1fr_auto] items-center gap-4 py-1.5">
                <div className="flex items-center overflow-hidden pl-2">
                  <span className="font-mono text-xs text-muted-foreground mr-2">{highlightText(`ec:${eco.code}`, searchTerm)}</span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">{highlightText(eco.name, searchTerm)}</span>
                </div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 text-right">
                  <p className="flex justify-end items-center gap-1.5">
                    {formatCurrency(eco.amount, "compact")}
                    <span className="text-xs text-muted-foreground w-12 text-left">{`(${(eco.amount / baseTotal * 100).toFixed(1)}%)`}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(eco.amount, "standard")}</p>
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