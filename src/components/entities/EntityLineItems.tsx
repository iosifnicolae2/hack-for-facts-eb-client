import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ExecutionLineItem, EntityDetailsData } from '@/lib/api/entities';
import { formatCurrency } from '@/lib/utils';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { SearchToggleInput } from './SearchToggleInput';
import Fuse from 'fuse.js';
import classifications from '@/assets/functional-classificatinos-general.json';

interface EntityTopItemsProps {
  lineItems: EntityDetailsData['executionLineItems'];
  currentYear: number;
  totalIncome?: number | null;
  totalExpenses?: number | null;
}

interface GroupedEconomic {
  code: string;
  name: string;
  amount: number;
}

interface GroupedFunctional {
  code: string;
  name: string;
  totalAmount: number;
  economics: GroupedEconomic[];
}

interface GroupedChapter {
  prefix: string;
  description: string;
  totalAmount: number;
  functionals: GroupedFunctional[];
}

export const EntityLineItems: React.FC<EntityTopItemsProps> = ({ lineItems, currentYear, totalIncome, totalExpenses }) => {
  const expenses = lineItems?.nodes.filter(li => li.account_category === 'ch') || [];
  const incomes = lineItems?.nodes.filter(li => li.account_category === 'vn') || [];

  // Create chapter map: prefix -> description
  const chapterMap = new Map<string, string>();
  classifications.groups.forEach(group => {
    group.chapters.forEach(ch => {
      if (ch.code) {
        const prefix = ch.code.slice(0, 2);
        chapterMap.set(prefix, ch.description);
      } else if (ch.codes) {
        ch.codes.forEach(c => {
          const prefix = c.slice(0, 2);
          chapterMap.set(prefix, ch.description);
        });
      }
    });
  });

  const groupByFunctional = (items: ExecutionLineItem[]): GroupedChapter[] => {
    const chapterGroups = new Map<string, { functionals: Map<string, { economics: Map<string, { name: string; amount: number }>; total: number; name: string }>; total: number }>();

    items.forEach(item => {
      if (!item.functionalClassification?.functional_code) return;
      const prefix = item.functionalClassification.functional_code.slice(0, 2);
      if (!chapterMap.has(prefix)) return;

      let chapter = chapterGroups.get(prefix);
      if (!chapter) {
        chapter = { functionals: new Map(), total: 0 };
        chapterGroups.set(prefix, chapter);
      }

      const funcCode = item.functionalClassification.functional_code;
      const funcName = item.functionalClassification.functional_name || 'Unknown';

      if (!funcCode || funcCode === '00.00.00') return;

      let functional = chapter.functionals.get(funcCode);
      if (!functional) {
        functional = { economics: new Map(), total: 0, name: funcName };
        chapter.functionals.set(funcCode, functional);
      }

      const amount = item.amount || 0;
      functional.total += amount;
      chapter.total += amount;

      if (item.economicClassification?.economic_code && item.economicClassification.economic_code !== '0') {
        const ecoCode = item.economicClassification.economic_code;
        const ecoName = item.economicClassification.economic_name || 'Unknown';

        if (!ecoCode || ecoCode === '00.00.00') return;

        let eco = functional.economics.get(ecoCode);
        if (!eco) {
          eco = { name: ecoName, amount: 0 };
          functional.economics.set(ecoCode, eco);
        }
        eco.amount += amount;
      }
    });

    const chapters: GroupedChapter[] = [];
    chapterGroups.forEach((ch, prefix) => {
      const description = chapterMap.get(prefix) || 'Unknown';
      const functionals: GroupedFunctional[] = [];
      ch.functionals.forEach((f, code) => {
        const economics: GroupedEconomic[] = Array.from(f.economics, ([ecoCode, eco]) => ({ code: ecoCode, name: eco.name, amount: eco.amount }))
          .sort((a, b) => b.amount - a.amount);
        functionals.push({ code, name: f.name, totalAmount: f.total, economics });
      });
      functionals.sort((a, b) => b.totalAmount - a.totalAmount);
      chapters.push({ prefix, description, totalAmount: ch.total, functionals });
    });
    chapters.sort((a, b) => b.totalAmount - a.totalAmount);
    return chapters;
  };

  const expenseGroups = groupByFunctional(expenses);
  const incomeGroups = groupByFunctional(incomes);

  // ------ Search state ------
  const [expenseSearchActive, setExpenseSearchActive] = React.useState(false);
  const [expenseSearchTerm, setExpenseSearchTerm] = React.useState('');

  const [incomeSearchActive, setIncomeSearchActive] = React.useState(false);
  const [incomeSearchTerm, setIncomeSearchTerm] = React.useState('');

  // ------ Helper: filter groups with Fuse.js ------
  interface SearchItem {
    level: 'chapter' | 'functional' | 'economic';
    code: string;
    name: string;
    chapterPrefix: string;
    functionalCode?: string;
  }

  const filterGroups = React.useCallback((groups: GroupedChapter[], term: string): GroupedChapter[] => {
    const query = term.trim();
    if (!query) return groups;

    // Build search data
    const searchData: SearchItem[] = [];
    groups.forEach(ch => {
      searchData.push({ level: 'chapter', code: ch.prefix, name: ch.description, chapterPrefix: ch.prefix });
      ch.functionals.forEach(func => {
        searchData.push({ level: 'functional', code: func.code, name: func.name, chapterPrefix: ch.prefix, functionalCode: func.code });
        func.economics.forEach(eco => {
          searchData.push({ level: 'economic', code: eco.code, name: eco.name, chapterPrefix: ch.prefix, functionalCode: func.code });
        });
      });
    });

    const fuse = new Fuse(searchData, {
      keys: ['name', 'code'],
      threshold: 0.35,
    });

    const results = fuse.search(query).map(r => r.item);

    const matchedChapters = new Set<string>();
    const matchedFunctionals = new Set<string>();
    const matchedEconomics = new Set<string>();

    results.forEach(item => {
      matchedChapters.add(item.chapterPrefix);
      if (item.functionalCode) matchedFunctionals.add(item.functionalCode);
      if (item.level === 'economic') matchedEconomics.add(item.code);
      if (item.level === 'functional') matchedFunctionals.add(item.code);
    });

    return groups
      .filter(ch => matchedChapters.has(ch.prefix))
      .map(ch => {
        const functionals = ch.functionals
          .filter(func => matchedFunctionals.has(func.code) || func.economics.some(e => matchedEconomics.has(e.code)) || matchedChapters.has(ch.prefix))
          .map(func => {
            if (matchedFunctionals.has(func.code)) return func;

            const economics = func.economics.filter(e => matchedEconomics.has(e.code));
            const totalAmount = economics.reduce((sum, e) => sum + e.amount, 0);
            return { ...func, economics, totalAmount };
          });

        const totalAmount = functionals.reduce((sum, f) => sum + f.totalAmount, 0);
        return { ...ch, functionals, totalAmount };
      });
  }, []);

  const filteredExpenseGroups = React.useMemo(() => filterGroups(expenseGroups, expenseSearchTerm), [expenseGroups, expenseSearchTerm, filterGroups]);
  const filteredIncomeGroups = React.useMemo(() => filterGroups(incomeGroups, incomeSearchTerm), [incomeGroups, incomeSearchTerm, filterGroups]);

  // Utility: highlight matched text
  const highlightText = React.useCallback((text: string, query: string) => {
    if (!query) return text;
    const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const safe = escapeRegExp(query);
    const regex = new RegExp(`(${safe})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, idx) =>
      regex.test(part) ? <mark key={idx} className="bg-yellow-300 text-black">{part}</mark> : part
    );
  }, []);

  // Base totals for percentage calculations
  const expenseBase = totalExpenses ?? expenseGroups.reduce((sum, ch) => sum + ch.totalAmount, 0);
  const incomeBase = totalIncome ?? incomeGroups.reduce((sum, ch) => sum + ch.totalAmount, 0);

  const renderGroups = (
    groups: GroupedChapter[],
    icon: React.ElementType,
    iconColor: string,
    title: string,
    baseTotal: number,
    searchTerm: string
  ) => {
    if (groups.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4">
          {React.createElement(icon, { className: `h-12 w-12 mb-3 ${iconColor} opacity-50` })}
          <p className="text-sm text-center text-slate-500 dark:text-slate-400">No data available for {title.toLowerCase()} in {currentYear}.</p>
        </div>
      );
    }

    // Determine open chapters when searching
    const openChapters = searchTerm ? groups.map(ch => ch.prefix) : [];

    return (
      <Accordion type="multiple" className="w-full" {...(searchTerm ? { value: openChapters } : {})}>
        {groups.map(ch => (
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
                {ch.functionals.map(func => (
                  func.economics.length > 0 ? (
                    <Accordion key={func.code} type="single" collapsible {...(searchTerm ? { value: func.code } : {})}>
                      <AccordionItem value={func.code}>
                        <AccordionTrigger className="flex justify-between items-center py-2 px-4 hover:bg-slate-100 dark:hover:bg-slate-700 [&[data-state=open]]:bg-slate-100 dark:[&[data-state=open]]:bg-slate-700 transition-colors">
                          <div className='flex justify-between w-full'>
                            <div className="flex items-center">
                              <span className="font-mono text-xs text-muted-foreground mr-2">fn:{highlightText(func.code, searchTerm)}</span>
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
                            {func.economics.map(eco => (
                              <li key={eco.code} className="flex justify-between items-center py-1">
                                <div className="flex items-center">
                                  <span className="font-mono text-xs text-muted-foreground mr-2">ec:{highlightText(eco.code, searchTerm)}</span>
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
                  ) : (
                    <div key={func.code} className="flex justify-between items-center py-2 px-4 border-b">
                      <div className="flex items-center">
                        <span className="font-mono text-xs text-muted-foreground mr-2">fn:{func.code}</span>
                        <span className="text-sm text-slate-700 dark:text-slate-300">{func.name}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100 flex-shrink-0 text-right">
                        {formatCurrency(func.totalAmount)}
                        <span className="text-xs text-muted-foreground ml-1">{((func.totalAmount / baseTotal) * 100).toFixed(1)}%</span>
                      </span>
                    </div>
                  )
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Card className="shadow-lg dark:bg-slate-800 h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center">
            <ArrowDownCircle className="h-6 w-6 mr-2 text-red-500 dark:text-red-400" />
            <h3 className="text-lg font-semibold">Expenses ({currentYear})</h3>
          </div>
          <SearchToggleInput
            active={expenseSearchActive}
            searchTerm={expenseSearchTerm}
            onToggle={setExpenseSearchActive}
            onChange={setExpenseSearchTerm}
          />
        </CardHeader>
        <CardContent className="flex-grow">
          {renderGroups(filteredExpenseGroups, ArrowDownCircle, 'text-red-500 dark:text-red-400', 'Expenses', expenseBase, expenseSearchTerm)}
        </CardContent>
      </Card>
      <Card className="shadow-lg dark:bg-slate-800 h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center">
            <ArrowUpCircle className="h-6 w-6 mr-2 text-green-500 dark:text-green-400" />
            <h3 className="text-lg font-semibold">Incomes ({currentYear})</h3>
          </div>
          <SearchToggleInput
            active={incomeSearchActive}
            searchTerm={incomeSearchTerm}
            onToggle={setIncomeSearchActive}
            onChange={setIncomeSearchTerm}
          />
        </CardHeader>
        <CardContent className="flex-grow">
          {renderGroups(filteredIncomeGroups, ArrowUpCircle, 'text-green-500 dark:text-green-400', 'Incomes', incomeBase, incomeSearchTerm)}
        </CardContent>
      </Card>
    </section>
  );
}; 