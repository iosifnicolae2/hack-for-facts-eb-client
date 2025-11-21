import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Accordion } from '@/components/ui/accordion';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { SearchToggleInput } from './SearchToggleInput';
import GroupedChapterAccordion from "./GroupedChapterAccordion";
import { GroupedChapter, GroupedFunctional, GroupedEconomic } from '@/schemas/financial';
import { formatCurrency, formatNumber, getNormalizationUnit } from '@/lib/utils';
import { Trans } from '@lingui/react/macro';
import { TMonth, TQuarter } from '@/schemas/reporting';
import { getYearLabel } from './utils';
import { ClassificationInfoLink } from '@/components/common/classification-info-link';

interface GroupedItemsDisplayProps {
  groups: GroupedChapter[];
  title: string;
  baseTotal: number;
  searchTerm: string;
  currentYear: number;
  showTotalValueHeader?: boolean;
  month?: TMonth;
  quarter?: TQuarter;
  normalization?: 'total' | 'total_euro' | 'per_capita' | 'per_capita_euro';
  subchapterCodePrefix?: 'fn' | 'ec';
}

export const GroupedItemsDisplay: React.FC<GroupedItemsDisplayProps> = React.memo(
  ({ groups, title, baseTotal, searchTerm, currentYear, showTotalValueHeader = false, month, quarter, normalization, subchapterCodePrefix = 'fn' }) => {

    const dateLabel = getYearLabel(currentYear, month, quarter);

    const { totalValueFiltered, totalPercentageFiltered } = React.useMemo(() => {
      const sumFunctionalList = (funcs: GroupedFunctional[]): number =>
        funcs.reduce((funcSum: number, func: GroupedFunctional) => {
          if (func.economics.length > 0) {
            return funcSum + func.economics.reduce((ecoSum: number, eco: GroupedEconomic) => ecoSum + eco.amount, 0);
          }
          return funcSum + func.totalAmount;
        }, 0);

      const totalValue = groups.reduce((sum, ch) => {
        const fromFunctionals = sumFunctionalList(ch.functionals);
        const fromSubchapters = (ch.subchapters ?? []).reduce(
          (s, sub) => s + sumFunctionalList(sub.functionals),
          0
        );
        return sum + fromFunctionals + fromSubchapters;
      }, 0);

      const percentage = baseTotal > 0 ? (totalValue / baseTotal) * 100 : 0;
      return { totalValueFiltered: totalValue, totalPercentageFiltered: percentage };
    }, [groups, baseTotal]);

    if (groups.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4">
          <p className="text-sm text-center text-slate-500 dark:text-slate-400">
            {searchTerm
              ? <span>No results for "{searchTerm}"</span>
              : <span>No data available for {title} in {dateLabel}.</span>
            }
          </p>
        </div>
      );
    }

    const openChapters = searchTerm ? groups.map((ch) => ch.prefix) : [];

    const unit = getNormalizationUnit(normalization ?? 'total');
    const currencyCode = unit.includes('EUR') ? 'EUR' : 'RON'; // Unit can also be 'RON/capita' or 'EUR/capita', for currency we only need 'RON' or 'EUR'

    const TotalValueComponent = () => (
      <div className="flex flex-col">
        <p className='flex justify-end items-center m-4 mb-0 font-semibold'>
          <Trans>Total:</Trans>{" "}
          {formatCurrency(totalValueFiltered, "standard", currencyCode)}
          {totalPercentageFiltered > 0 && totalPercentageFiltered <= 99.99 && (
            <span className="pl-2 text-sm text-muted-foreground">
              ({formatNumber(totalPercentageFiltered)}%)
            </span>
          )}
        </p>
        <p className="text-sm text-muted-foreground text-right m-4 mt-0">
          {formatCurrency(totalValueFiltered, "compact", currencyCode)}
        </p>
      </div>
    )

    return (
      <Accordion
        type="multiple"
        className="w-full"
        {...(searchTerm ? { value: openChapters } : {})}
      >
        {showTotalValueHeader && <TotalValueComponent />}
        {groups.map((ch) => (
          <GroupedChapterAccordion
            key={ch.prefix}
            ch={ch}
            baseTotal={baseTotal}
            searchTerm={searchTerm}
            normalization={normalization}
            codePrefixForSubchapters={subchapterCodePrefix}
          />
        ))}
        <TotalValueComponent />
      </Accordion>
    );
  }
);

GroupedItemsDisplay.displayName = "GroupedItemsDisplay";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Info } from 'lucide-react';

interface FinancialDataCardProps {
  title: string;
  subtitle?: string;
  iconType: 'income' | 'expense';
  currentYear: number;
  month?: TMonth;
  quarter?: TQuarter;
  years: number[];
  onYearChange: (year: number) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  searchActive: boolean;
  onSearchToggle: (active: boolean) => void;
  groups: GroupedChapter[];
  baseTotal: number;
  searchFocusKey?: string;
  normalization?: 'total' | 'total_euro' | 'per_capita' | 'per_capita_euro';
  onPrefetchYear?: (year: number) => void;
  transferFilter?: 'all' | 'no-transfers' | 'transfers-only';
  onTransferFilterChange?: (filter: 'all' | 'no-transfers' | 'transfers-only') => void;
}

export const FinancialDataCard: React.FC<FinancialDataCardProps> = ({
  title,
  subtitle = '',
  iconType,
  currentYear,
  month,
  quarter,
  years,
  onYearChange,
  searchTerm,
  onSearchChange,
  searchActive,
  onSearchToggle,
  groups,
  baseTotal,
  searchFocusKey,
  normalization,
  onPrefetchYear,
  transferFilter = 'no-transfers',
  onTransferFilterChange,
}) => {
  const Icon = iconType === 'income' ? ArrowUpCircle : ArrowDownCircle;
  const iconColor = iconType === 'income' ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';
  const dateLabel = getYearLabel(currentYear, month, quarter);

  const filteredGroups = useMemo(() => {
    if (transferFilter === 'all') return groups;

    const isTransfer = (code: string) => code.startsWith('51') || code.startsWith('55');

    const filterEconomics = (economics: GroupedEconomic[]) => {
      return economics.filter(eco => {
        const isTrans = isTransfer(eco.code);
        return transferFilter === 'transfers-only' ? isTrans : !isTrans;
      });
    };

    const filterFunctionals = (functionals: GroupedFunctional[]): GroupedFunctional[] => {
      return functionals.map(func => {
        const hasEconomics = func.economics.length > 0;
        const filteredEco = filterEconomics(func.economics);
        const newTotal = filteredEco.reduce((sum, eco) => sum + eco.amount, 0);

        return {
          ...func,
          economics: filteredEco,
          // If we had economics originally, we must use the new total (which might be 0 if all filtered out).
          // If we didn't have economics, we keep the original total (as we can't filter what we don't see).
          totalAmount: hasEconomics ? newTotal : func.totalAmount
        };
      }).filter(func => func.totalAmount > 0 || (func.economics.length > 0 && func.economics.some(e => e.amount > 0)));
    };

    return groups.map(chapter => {
      const filteredFunctionals = filterFunctionals(chapter.functionals);
      const filteredSubchapters = (chapter.subchapters ?? []).map(sub => ({
        ...sub,
        functionals: filterFunctionals(sub.functionals),
      })).map(sub => ({
        ...sub,
        totalAmount: sub.functionals.reduce((sum, f) => sum + f.totalAmount, 0)
      })).filter(sub => sub.totalAmount > 0);

      const newTotal = filteredFunctionals.reduce((sum, f) => sum + f.totalAmount, 0) +
        filteredSubchapters.reduce((sum, s) => sum + s.totalAmount, 0);

      return {
        ...chapter,
        functionals: filteredFunctionals,
        subchapters: filteredSubchapters,
        totalAmount: newTotal
      };
    }).filter(chapter => chapter.totalAmount > 0);

  }, [groups, transferFilter]);

  return (
    <Card className="shadow-lg dark:bg-slate-800 h-full flex flex-col">
      <CardHeader className="group flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Icon className={`h-6 w-6 mr-2 ${iconColor}`} />
            <Select
              value={currentYear.toString()}
              onValueChange={(val) => onYearChange(parseInt(val, 10))}
            >
              <SelectTrigger className="w-auto border-0 shadow-none bg-transparent focus:ring-0">
                <h3 className="text-lg font-semibold">
                  {title} ({dateLabel})
                </h3>
              </SelectTrigger>

              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()} onMouseEnter={() => onPrefetchYear?.(year)}>
                    {getYearLabel(year, month, quarter)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ClassificationInfoLink type="functional" />
          </div>

          <SearchToggleInput
            key={iconType}
            active={searchActive}
            initialSearchTerm={searchTerm}
            onToggle={onSearchToggle}
            onChange={onSearchChange}
            focusKey={searchFocusKey}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {subtitle && <span className="text-sm text-muted-foreground">{subtitle}</span>}
        </div>

        {iconType === 'expense' && onTransferFilterChange && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Tabs value={transferFilter} onValueChange={(v) => onTransferFilterChange(v as any)} className="w-full sm:w-auto">
              <TabsList className="flex w-full justify-start overflow-x-auto sm:w-auto sm:overflow-visible no-scrollbar">
                <TabsTrigger value="no-transfers" className="flex-shrink-0"><Trans>Without Transfers</Trans></TabsTrigger>
                <TabsTrigger value="all" className="flex-shrink-0"><Trans>All</Trans></TabsTrigger>
                <TabsTrigger value="transfers-only" className="flex-shrink-0"><Trans>Transfers Only</Trans></TabsTrigger>
              </TabsList>
            </Tabs>
            <Popover>
              <PopoverTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" />
              </PopoverTrigger>
              <PopoverContent className="w-96">
                <div className="space-y-3">
                  <h4 className="font-medium leading-none"><Trans>Filter Transfers</Trans></h4>
                  <p className="text-sm text-muted-foreground">
                    <Trans>
                      Public institutions often transfer funds between each other (e.g., from the state budget to local budgets). These transfers can double-count spending if not filtered.
                    </Trans>
                  </p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li><strong><Trans>Without Transfers</Trans>:</strong> <Trans>Shows only direct spending by this entity. Excludes funds moved to other institutions (codes 51 and 55).</Trans></li>
                    <li><strong><Trans>All</Trans>:</strong> <Trans>Shows all spending, including both direct payments and transfers to other institutions.</Trans></li>
                    <li><strong><Trans>Transfers Only</Trans>:</strong> <Trans>Shows only the funds transferred to other public administration units.</Trans></li>
                  </ul>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <GroupedItemsDisplay
          groups={filteredGroups}
          title={title}
          baseTotal={baseTotal}
          searchTerm={searchTerm}
          currentYear={currentYear}
          showTotalValueHeader={!!searchActive}
          month={month}
          quarter={quarter}
          normalization={normalization}
        />
      </CardContent>
    </Card>
  );
};
