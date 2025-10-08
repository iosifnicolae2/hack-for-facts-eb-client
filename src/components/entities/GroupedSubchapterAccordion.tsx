import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { GroupedSubchapter, GroupedFunctional } from '@/schemas/financial';
import { highlightText } from './highlight-utils';
import { formatCurrency } from '@/lib/utils';

interface GroupedSubchapterAccordionProps {
    sub: GroupedSubchapter;
    baseTotal: number;
    searchTerm: string;
}

const GroupedSubchapterAccordion: React.FC<GroupedSubchapterAccordionProps> = ({ sub, baseTotal, searchTerm }) => {
    // Example:
    // fn:36.01 - Venituri din aplicarea prescriptiei extinctive -> subchapter
    // fn:36.01.00 - Venituri din aplicarea prescriptiei extinctive -> .00 child from the line items list
    const singleZeroChild = sub.functionals.length === 1 && /^(\d{2})\.(\d{2})\.00$/.test(sub.functionals[0].code);
    // Example:
    // fn:36.01 - Venituri din aplicarea prescriptiei extinctive -> subchapter
    // fn:36.01.01 - Venituri din aplicarea prescriptiei extinctive -> .01 child from the line items list
    const singleSameDescriptionChild = sub.functionals.length === 1 && sub.functionals[0].name === sub.name;

    if (singleZeroChild || singleSameDescriptionChild) {
        // Render as a single non-accordion row to avoid duplicating the same item
        const fnCode = sub.functionals[0].code;
        const fnName = sub.name;
        return (
            <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] items-center gap-1.5 sm:gap-4 py-2 px-3 sm:px-4 border-b">
                <div className="flex min-w-0 items-start sm:items-center gap-1.5">
                    <span className="font-mono text-xs text-muted-foreground flex-shrink-0">{highlightText(`fn:${fnCode}`, searchTerm)}</span>
                    <span className="text-sm text-slate-700 dark:text-slate-300 break-words">{highlightText(fnName, searchTerm)}</span>
                </div>
                <div className="text-right text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                    <p className="flex justify-end items-center gap-1.5">
                        {formatCurrency(sub.totalAmount, 'compact')}
                        { baseTotal > 0 && <span className="hidden sm:inline text-xs text-muted-foreground">{`(${(sub.totalAmount / baseTotal * 100).toFixed(1)}%)`}</span> }
                    </p>
                    <p className="text-xs text-muted-foreground font-normal">{formatCurrency(sub.totalAmount, 'standard')}</p>
                </div>
            </div>
        );
    }

    return (
        <Accordion type="single" collapsible>
            <AccordionItem value={sub.code}>
                <AccordionTrigger className="flex justify-between items-center py-2 px-3 sm:px-4 hover:bg-slate-100 dark:hover:bg-slate-700 [&[data-state=open]]:bg-slate-100 dark:[&[data-state=open]]:bg-slate-700 transition-colors">
                    <div className='grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] w-full items-center gap-1.5 sm:gap-4'>
                        <div className="flex min-w-0 items-start sm:items-center gap-1.5">
                            <span className="font-mono text-xs text-muted-foreground flex-shrink-0">{highlightText(`fn:${sub.code}`, searchTerm)}</span>
                            <span className="text-sm text-slate-700 dark:text-slate-300 break-words">{highlightText(sub.name, searchTerm)}</span>
                        </div>
                        <div className="text-right text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                            <p className="flex justify-end items-center gap-1.5">
                                {formatCurrency(sub.totalAmount, 'compact')}
                                { baseTotal > 0 && <span className="hidden sm:inline text-xs text-muted-foreground">{`(${(sub.totalAmount / baseTotal * 100).toFixed(1)}%)`}</span> }
                            </p>
                            <p className="text-xs text-muted-foreground font-normal">{formatCurrency(sub.totalAmount, 'standard')}</p>
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent className='border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'>
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800 py-1">
                        {sub.functionals.map((func: GroupedFunctional) => (
                            <li key={func.code} className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] items-center gap-1.5 sm:gap-4 py-2 px-3 sm:px-4">
                                <div className="flex min-w-0 items-start sm:items-center gap-1.5">
                                    <span className="font-mono text-xs text-muted-foreground flex-shrink-0">{highlightText(`fn:${func.code}`, searchTerm)}</span>
                                    <span className="text-sm text-slate-700 dark:text-slate-300 break-words">{highlightText(func.name, searchTerm)}</span>
                                </div>
                                <div className="text-right text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    <p className="flex justify-end items-center gap-1.5">
                                        {formatCurrency(func.totalAmount, 'compact')}
                                        { baseTotal > 0 && <span className="hidden sm:inline text-xs text-muted-foreground">{`(${(func.totalAmount / baseTotal * 100).toFixed(1)}%)`}</span> }
                                    </p>
                                    <p className="text-xs text-muted-foreground font-normal">{formatCurrency(func.totalAmount, 'standard')}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export default GroupedSubchapterAccordion;


