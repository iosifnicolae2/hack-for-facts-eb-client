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
      <div key={func.code} className="flex justify-between items-center py-2 px-4 border-b">
        <div className="flex items-center">
          <span className="font-mono text-xs text-muted-foreground mr-2">{highlightText(`fn:${func.code}`, searchTerm)}</span>
          <span className="text-sm text-slate-700 dark:text-slate-300">{highlightText(func.name, searchTerm)}</span>
        </div>
        <span className="text-sm font-medium text-slate-900 dark:text-slate-100 flex-shrink-0 text-right">
          {formatCurrency(func.totalAmount)}
          <span className="text-xs text-muted-foreground ml-1">{((func.totalAmount / baseTotal) * 100).toFixed(1)}%</span>
        </span>
      </div>
    );
  }

  return (
    <Accordion key={func.code} type="single" collapsible {...(searchTerm ? { value: func.code } : {})}>
      <AccordionItem value={func.code}>
        <AccordionTrigger className="flex justify-between items-center py-2 px-4 hover:bg-slate-100 dark:hover:bg-slate-700 [&[data-state=open]]:bg-slate-100 dark:[&[data-state=open]]:bg-slate-700 transition-colors">
          <div className='flex justify-between w-full'>
            <div className="flex items-center">
              <span className="font-mono text-xs text-muted-foreground mr-2">{highlightText(`fn:${func.code}`, searchTerm)}</span>
              <span className="text-sm text-slate-700 dark:text-slate-300">{highlightText(func.name, searchTerm)}</span>
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex-shrink-0 text-right">
              {formatCurrency(func.totalAmount)}
              <span className="text-xs text-muted-foreground ml-1">{((func.totalAmount / baseTotal) * 100).toFixed(1)}%</span>
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className='border-slate-200 border-2'>
          <ul className="space-y-1 px-4">
            {func.economics.map((eco: GroupedEconomic) => (
              <li key={eco.code} className="flex justify-between items-center py-1">
                <div className="flex items-center">
                  <span className="font-mono text-xs text-muted-foreground mr-2">{highlightText(`ec:${eco.code}`, searchTerm)}</span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">{highlightText(eco.name, searchTerm)}</span>
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100 flex-shrink-0 text-right">
                  {formatCurrency(eco.amount)}
                  <span className="text-xs text-muted-foreground ml-1">{((eco.amount / baseTotal) * 100).toFixed(1)}%</span>
                </span>
              </li>
            ))}
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default GroupedFunctionalAccordion; 