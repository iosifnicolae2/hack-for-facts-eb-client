import React from 'react';
import { GroupedChapter, GroupedFunctional, GroupedEconomic } from '@/schemas/interfaces';
import { ExecutionLineItem } from '@/lib/api/entities';
import classifications from '@/assets/functional-classificatinos-general.json';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';
import { match } from '@/components/entities/highlight-utils';

interface BudgetNode {
  description: string;
  code?: string;
  children?: BudgetNode[];
}

const robustTrim = (s: string | null | undefined) =>
  (s ?? '')
    .replace(/\u00A0/g, ' ')
    .replace(/[\u200B-\u200D\u2060]/g, '')
    .replace(/\uFEFF/g, '')
    .trim();

const twoDigitFromAnyCode = (codeLike: string | number | null | undefined): string | null => {
  if (codeLike == null) return null;
  const raw = robustTrim(String(codeLike)).replace(/\.$/, '');
  const m = raw.match(/^(\d{2})/);
  return m ? m[1] : null;
};

const isIncomeRoot = (s: string) => /VENITURI/i.test(robustTrim(s));
const isExpenseRoot = (s: string) => /CHELTUIELI/i.test(robustTrim(s));

/** Walk a subtree and collect nodes with a 2-digit code as "chapters". */
const collectChapterMap = (roots: BudgetNode[]): Map<string, string> => {
  const map = new Map<string, string>();
  const stack = [...roots];

  while (stack.length) {
    const node = stack.pop()!;
    const code = node.code ? twoDigitFromAnyCode(node.code) : null;

    if (code && /^\d{2}$/.test(code)) {
      const label = robustTrim(node.description) || code;
      if (!map.has(code)) map.set(code, label);
    }
    if (node.children?.length) {
      // depth-first; order doesn’t matter for the map
      for (let i = node.children.length - 1; i >= 0; i--) stack.push(node.children[i]);
    }
  }
  return map;
};

/** Build two maps straight from your JSON tree. */
const buildChapterMaps = (data: BudgetNode[]) => {
  const incomeRoots: BudgetNode[] = [];
  const expenseRoots: BudgetNode[] = [];

  for (const root of data) {
    if (isIncomeRoot(root.description)) incomeRoots.push(root);
    else if (isExpenseRoot(root.description)) expenseRoots.push(root);
  }

  const incomeChapterMap = collectChapterMap(incomeRoots);
  const expenseChapterMap = collectChapterMap(expenseRoots);

  return { incomeChapterMap, expenseChapterMap };
};

const { incomeChapterMap, expenseChapterMap } = buildChapterMaps(classifications as BudgetNode[]);

const groupByFunctional = (
  items: ExecutionLineItem[],
  chapterMap: Map<string, string>
): GroupedChapter[] => {
  type EconAgg = { name: string; amount: number };
  type FuncAgg = { economics: Map<string, EconAgg>; total: number; name: string };
  type ChapterAgg = { functionals: Map<string, FuncAgg>; total: number; description?: string };

  const chapters = new Map<string, ChapterAgg>();

  for (const item of items) {
    const funcCodeRaw = item.functionalClassification?.functional_code;
    if (!funcCodeRaw) continue;

    const funcCode = robustTrim(funcCodeRaw);
    if (!funcCode || funcCode === '00.00.00' || funcCode === '0') continue;

    const prefix = twoDigitFromAnyCode(funcCode);
    if (!prefix) continue;

    // Ensure chapter bucket (use map description if known)
    let chapter = chapters.get(prefix);
    if (!chapter) {
      chapter = {
        functionals: new Map(),
        total: 0,
        description: chapterMap.get(prefix) ?? 'Neclasificat',
      };
      chapters.set(prefix, chapter);
    }

    // Functional bucket
    const funcName = robustTrim(item.functionalClassification?.functional_name) || 'Unknown';
    let functional = chapter.functionals.get(funcCode);
    if (!functional) {
      functional = { economics: new Map(), total: 0, name: funcName };
      chapter.functionals.set(funcCode, functional);
    }

    const amount = item.amount || 0;
    functional.total += amount;
    chapter.total += amount;

    // Economics
    const ecoCodeRaw = item.economicClassification?.economic_code;
    if (ecoCodeRaw && ecoCodeRaw !== '0' && ecoCodeRaw !== '00.00.00') {
      const ecoCode = robustTrim(ecoCodeRaw);
      if (ecoCode) {
        const ecoName = robustTrim(item.economicClassification?.economic_name) || 'Unknown';
        let econ = functional.economics.get(ecoCode);
        if (!econ) {
          econ = { name: ecoName, amount: 0 };
          functional.economics.set(ecoCode, econ);
        }
        econ.amount += amount;
      }
    }
  }

  // Materialize & sort
  const out: GroupedChapter[] = [];
  chapters.forEach((ch, prefix) => {
    const functionals: GroupedFunctional[] = [];
    ch.functionals.forEach((f, code) => {
      const economics: GroupedEconomic[] = Array.from(f.economics, ([ecoCode, eco]) => ({
        code: ecoCode,
        name: eco.name,
        amount: eco.amount,
      })).sort((a, b) => b.amount - a.amount);

      functionals.push({ code, name: f.name, totalAmount: f.total, economics });
    });

    functionals.sort((a, b) => b.totalAmount - a.totalAmount);
    out.push({
      prefix,
      description: ch.description ?? chapterMap.get(prefix) ?? 'Neclasificat',
      totalAmount: ch.total,
      functionals,
    });
  });

  out.sort((a, b) => b.totalAmount - a.totalAmount);
  return out;
};

const filterGroups = (groups: GroupedChapter[], term: string): GroupedChapter[] => {
  const query = term.trim();
  if (!query) return groups;

  const filtered = new Map<string, GroupedChapter>();

  groups.forEach((chapter) => {
    const chapterText = `${chapter.description} ${chapter.prefix}`;
    const chapterMatches = match(chapterText, query).length > 0;

    if (chapterMatches) {
      filtered.set(chapter.prefix, { ...chapter });
      return;
    }

    const matchedFunctionals: GroupedFunctional[] = [];

    chapter.functionals.forEach((func) => {
      const funcText = `${func.name} fn:${func.code}`;
      const funcMatches = match(funcText, query).length > 0;

      if (funcMatches) {
        matchedFunctionals.push({ ...func });
        return;
      }

      const matchedEconomics: GroupedEconomic[] = [];
      func.economics.forEach((eco) => {
        const ecoText = `${eco.name} ec:${eco.code}`;
        if (match(ecoText, query).length > 0) {
          matchedEconomics.push({ ...eco });
        }
      });

      if (matchedEconomics.length > 0) {
        const newTotal = matchedEconomics.reduce((s, e) => s + e.amount, 0);
        matchedFunctionals.push({ ...func, economics: matchedEconomics, totalAmount: newTotal });
      }
    });

    if (matchedFunctionals.length > 0) {
      const newChapterTotal = matchedFunctionals.reduce((s, f) => s + f.totalAmount, 0);
      filtered.set(chapter.prefix, {
        ...chapter,
        functionals: matchedFunctionals.sort((a, b) => b.totalAmount - a.totalAmount),
        totalAmount: newChapterTotal,
      });
    }
  });

  return Array.from(filtered.values()).sort((a, b) => b.totalAmount - a.totalAmount);
};

/** ---------- hook ---------- **/
export const useFinancialData = (
  lineItems: ExecutionLineItem[],
  totalIncome: number | null,
  totalExpenses: number | null,
  initialExpenseSearchTerm?: string,
  initialIncomeSearchTerm?: string
) => {
  const [expenseSearchTerm, setExpenseSearchTerm] = React.useState(initialExpenseSearchTerm ?? '');
  const [incomeSearchTerm, setIncomeSearchTerm] = React.useState(initialIncomeSearchTerm ?? '');
  const [expenseSearchActive, setExpenseSearchActive] = React.useState(!!initialExpenseSearchTerm);
  const [incomeSearchActive, setIncomeSearchActive] = React.useState(!!initialIncomeSearchTerm);

  const debouncedExpenseSearchTerm = useDebouncedValue(expenseSearchTerm, 300);
  const debouncedIncomeSearchTerm = useDebouncedValue(incomeSearchTerm, 300);

  const expenses = React.useMemo(() => lineItems.filter((li) => li.account_category === 'ch'), [lineItems]);
  const incomes = React.useMemo(() => lineItems.filter((li) => li.account_category === 'vn'), [lineItems]);

  // Group with maps built from the new tree
  const expenseGroups = React.useMemo(() => groupByFunctional(expenses, expenseChapterMap), [expenses]);
  const incomeGroups = React.useMemo(() => groupByFunctional(incomes, incomeChapterMap), [incomes]);

  const filteredExpenseGroups = React.useMemo(
    () => filterGroups(expenseGroups, debouncedExpenseSearchTerm),
    [expenseGroups, debouncedExpenseSearchTerm]
  );
  const filteredIncomeGroups = React.useMemo(
    () => filterGroups(incomeGroups, debouncedIncomeSearchTerm),
    [incomeGroups, debouncedIncomeSearchTerm]
  );

  const expenseBase = React.useMemo(
    () => totalExpenses ?? expenseGroups.reduce((sum, ch) => sum + ch.totalAmount, 0),
    [totalExpenses, expenseGroups]
  );
  const incomeBase = React.useMemo(
    () => totalIncome ?? incomeGroups.reduce((sum, ch) => sum + ch.totalAmount, 0),
    [totalIncome, incomeGroups]
  );

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
    incomeBase,
  };
};
