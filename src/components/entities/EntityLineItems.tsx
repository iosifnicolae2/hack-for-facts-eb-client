import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Accordion } from '@/components/ui/accordion';
import { ExecutionLineItem, EntityDetailsData } from '@/lib/api/entities';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { SearchToggleInput } from './SearchToggleInput';
import classifications from '@/assets/functional-classificatinos-general.json';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import GroupedChapterAccordion from "./GroupedChapterAccordion";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { match } from "./highlight-utils";

export interface EntityTopItemsProps {
  lineItems: EntityDetailsData["executionLineItems"];
  currentYear: number;
  totalIncome?: number | null;
  totalExpenses?: number | null;
  years: number[];
  onYearChange: (year: number) => void;
  expenseSearchTerm: string;
  onExpenseSearchChange: (term: string) => void;
  incomeSearchTerm: string;
  onIncomeSearchChange: (term: string) => void;
}

export interface GroupedEconomic {
  code: string;
  name: string;
  amount: number;
}

export interface GroupedFunctional {
  code: string;
  name: string;
  totalAmount: number;
  economics: GroupedEconomic[];
}

export interface GroupedChapter {
  prefix: string;
  description: string;
  totalAmount: number;
  functionals: GroupedFunctional[];
}

export const EntityLineItems: React.FC<EntityTopItemsProps> = ({
  lineItems,
  currentYear,
  totalIncome,
  totalExpenses,
  years,
  onYearChange,
  expenseSearchTerm,
  onExpenseSearchChange,
  incomeSearchTerm,
  onIncomeSearchChange,
}) => {
  const expenses =
    lineItems?.nodes.filter((li) => li.account_category === "ch") || [];
  const incomes =
    lineItems?.nodes.filter((li) => li.account_category === "vn") || [];

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
  const [expenseSearchActive, setExpenseSearchActive] = React.useState(
    !!expenseSearchTerm
  );
  const debouncedExpenseSearchTerm = useDebouncedValue(expenseSearchTerm, 300);

  const [incomeSearchActive, setIncomeSearchActive] = React.useState(
    !!incomeSearchTerm
  );
  const debouncedIncomeSearchTerm = useDebouncedValue(incomeSearchTerm, 300);

  // ------ Helper: filter groups with Fuse.js ------
  const filterGroups = React.useCallback(
    (groups: GroupedChapter[], term: string): GroupedChapter[] => {
      const query = term.trim();
      if (!query) return groups;

      const filteredChapters: { [prefix: string]: GroupedChapter } = {};

      groups.forEach(chapter => {
        const chapterText = `${chapter.description} ${chapter.prefix}`;
        if (match(chapterText, query).length > 0) {
          if (!filteredChapters[chapter.prefix]) {
            filteredChapters[chapter.prefix] = { ...chapter, functionals: chapter.functionals };
          }
          // If chapter matches, we don't need to check children
          return;
        }

        const matchingFunctionals: GroupedFunctional[] = [];
        chapter.functionals.forEach(func => {
          const funcText = `${func.name} fn:${func.code}`;
          const matchingEconomics: GroupedEconomic[] = [];
          let funcMatches = match(funcText, query).length > 0;

          func.economics.forEach(eco => {
            const ecoText = `${eco.name} ec:${eco.code}`;
            if (match(ecoText, query).length > 0) {
              matchingEconomics.push(eco);
              // If an economic child matches, the parent functional should be included
              funcMatches = true;
            }
          });

          if (funcMatches) {
            matchingFunctionals.push({
              ...func,
              // If the functional itself matched, include all economics, otherwise only matching ones
              economics: match(funcText, query).length > 0 ? func.economics : matchingEconomics,
            });
          }
        });

        if (matchingFunctionals.length > 0) {
          if (!filteredChapters[chapter.prefix]) {
            filteredChapters[chapter.prefix] = { ...chapter, functionals: [] };
          }
          filteredChapters[chapter.prefix].functionals.push(...matchingFunctionals);
        }
      });

      return Object.values(filteredChapters).sort((a, b) => b.totalAmount - a.totalAmount);
    },
    []
  );

  const filteredExpenseGroups = React.useMemo(
    () => filterGroups(expenseGroups, debouncedExpenseSearchTerm),
    [expenseGroups, debouncedExpenseSearchTerm, filterGroups]
  );
  const filteredIncomeGroups = React.useMemo(
    () => filterGroups(incomeGroups, debouncedIncomeSearchTerm),
    [incomeGroups, debouncedIncomeSearchTerm, filterGroups]
  );

  const expenseBase =
    totalExpenses ?? expenseGroups.reduce((sum, ch) => sum + ch.totalAmount, 0);
  const incomeBase =
    totalIncome ?? incomeGroups.reduce((sum, ch) => sum + ch.totalAmount, 0);

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
          <p className="text-sm text-center text-slate-500 dark:text-slate-400">
            {searchTerm
              ? `No results for "${searchTerm}"`
              : `No data available for ${title.toLowerCase()} in ${currentYear}.`}
          </p>
        </div>
      );
    }

    const openChapters = searchTerm ? groups.map(ch => ch.prefix) : [];

    return (
      <Accordion type="multiple" className="w-full" {...(searchTerm ? { value: openChapters } : {})}>
        {groups.map(ch => (
          <GroupedChapterAccordion key={ch.prefix} ch={ch} baseTotal={baseTotal} searchTerm={searchTerm} />
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
            <Select
              value={currentYear.toString()}
              onValueChange={(val) => onYearChange(parseInt(val, 10))}
            >
              <SelectTrigger className="w-auto border-0 shadow-none bg-transparent focus:ring-0">
                <h3 className="text-lg font-semibold">
                  Expenses ({currentYear})
                </h3>
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <SearchToggleInput
            active={expenseSearchActive}
            searchTerm={expenseSearchTerm}
            onToggle={setExpenseSearchActive}
            onChange={onExpenseSearchChange}
          />
        </CardHeader>
        <CardContent className="flex-grow">
          {renderGroups(
            filteredExpenseGroups,
            ArrowDownCircle,
            "text-red-500 dark:text-red-400",
            "Expenses",
            expenseBase,
            debouncedExpenseSearchTerm
          )}
        </CardContent>
      </Card>
      <Card className="shadow-lg dark:bg-slate-800 h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center">
            <ArrowUpCircle className="h-6 w-6 mr-2 text-green-500 dark:text-green-400" />
            <Select
              value={currentYear.toString()}
              onValueChange={(val) => onYearChange(parseInt(val, 10))}
            >
              <SelectTrigger className="w-auto border-0 shadow-none bg-transparent focus:ring-0">
                <h3 className="text-lg font-semibold">
                  Incomes ({currentYear})
                </h3>
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <SearchToggleInput
            active={incomeSearchActive}
            searchTerm={incomeSearchTerm}
            onToggle={setIncomeSearchActive}
            onChange={onIncomeSearchChange}
          />
        </CardHeader>
        <CardContent className="flex-grow">
          {renderGroups(
            filteredIncomeGroups,
            ArrowUpCircle,
            "text-green-500 dark:text-green-400",
            "Incomes",
            incomeBase,
            debouncedIncomeSearchTerm
          )}
        </CardContent>
      </Card>
    </section>
  );
}; 