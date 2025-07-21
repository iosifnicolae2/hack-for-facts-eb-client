import React from 'react';
import { GroupedChapter, GroupedFunctional, GroupedEconomic } from '@/schemas/interfaces';
import { ExecutionLineItem } from '@/lib/api/entities';
import classifications from '@/assets/functional-classificatinos-general.json';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';
import { match } from '@/components/entities/highlight-utils';

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

const filterGroups = (groups: GroupedChapter[], term: string): GroupedChapter[] => {
    const query = term.trim();
    if (!query) return groups;

    const filteredChapters: { [prefix: string]: GroupedChapter } = {};

    groups.forEach(chapter => {
      const chapterText = `${chapter.description} ${chapter.prefix}`;
      if (match(chapterText, query).length > 0) {
        if (!filteredChapters[chapter.prefix]) {
          filteredChapters[chapter.prefix] = { ...chapter, functionals: chapter.functionals };
        }
        return;
      }

      const matchingFunctionals: GroupedFunctional[] = [];
      chapter.functionals.forEach((func: GroupedFunctional) => {
        const funcText = `${func.name} fn:${func.code}`;
        const matchingEconomics: GroupedEconomic[] = [];
        let funcMatches = match(funcText, query).length > 0;

        func.economics.forEach((eco: GroupedEconomic) => {
          const ecoText = `${eco.name} ec:${eco.code}`;
          if (match(ecoText, query).length > 0) {
            matchingEconomics.push(eco);
            funcMatches = true;
          }
        });

        if (funcMatches) {
          matchingFunctionals.push({
            ...func,
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
};

export const useFinancialData = (lineItems: ExecutionLineItem[], totalIncome: number | null, totalExpenses: number | null, initialExpenseSearchTerm: string, initialIncomeSearchTerm: string) => {
    const [expenseSearchTerm, setExpenseSearchTerm] = React.useState(initialExpenseSearchTerm);
    const [incomeSearchTerm, setIncomeSearchTerm] = React.useState(initialIncomeSearchTerm);
    const [expenseSearchActive, setExpenseSearchActive] = React.useState(!!initialExpenseSearchTerm);
    const [incomeSearchActive, setIncomeSearchActive] = React.useState(!!initialIncomeSearchTerm);

    React.useEffect(() => {
        setExpenseSearchTerm(initialExpenseSearchTerm);
        setExpenseSearchActive(!!initialExpenseSearchTerm);
    }, [initialExpenseSearchTerm]);

    React.useEffect(() => {
        setIncomeSearchTerm(initialIncomeSearchTerm);
        setIncomeSearchActive(!!initialIncomeSearchTerm);
    }, [initialIncomeSearchTerm]);
    
    const debouncedExpenseSearchTerm = useDebouncedValue(expenseSearchTerm, 300);
    const debouncedIncomeSearchTerm = useDebouncedValue(incomeSearchTerm, 300);

    const expenses = React.useMemo(() => lineItems.filter((li) => li.account_category === "ch"), [lineItems]);
    const incomes = React.useMemo(() => lineItems.filter((li) => li.account_category === "vn"), [lineItems]);

    const expenseGroups = React.useMemo(() => groupByFunctional(expenses), [expenses]);
    const incomeGroups = React.useMemo(() => groupByFunctional(incomes), [incomes]);

    const filteredExpenseGroups = React.useMemo(() => filterGroups(expenseGroups, debouncedExpenseSearchTerm), [expenseGroups, debouncedExpenseSearchTerm]);
    const filteredIncomeGroups = React.useMemo(() => filterGroups(incomeGroups, debouncedIncomeSearchTerm), [incomeGroups, debouncedIncomeSearchTerm]);

    const expenseBase = React.useMemo(() => totalExpenses ?? expenseGroups.reduce((sum, ch) => sum + ch.totalAmount, 0), [totalExpenses, expenseGroups]);
    const incomeBase = React.useMemo(() => totalIncome ?? incomeGroups.reduce((sum, ch) => sum + ch.totalAmount, 0), [totalIncome, incomeGroups]);

    return {
        expenseSearchTerm,
        onExpenseSearchChange: setExpenseSearchTerm,
        expenseSearchActive,
        onExpenseSearchToggle: setExpenseSearchActive,
        debouncedExpenseSearchTerm,
        filteredExpenseGroups,
        expenseBase,
        incomeSearchTerm,
        onIncomeSearchChange: setIncomeSearchTerm,
        incomeSearchActive,
        onIncomeSearchToggle: setIncomeSearchActive,
        debouncedIncomeSearchTerm,
        filteredIncomeGroups,
        incomeBase
    };
} 