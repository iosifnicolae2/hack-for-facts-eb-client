import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Accordion } from '@/components/ui/accordion';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { SearchToggleInput } from './SearchToggleInput';
import GroupedChapterAccordion from "./GroupedChapterAccordion";
import { GroupedChapter, GroupedFunctional, GroupedEconomic } from '@/schemas/financial';
import { formatCurrency, formatNumberRO } from '@/lib/utils';

interface GroupedItemsDisplayProps {
  groups: GroupedChapter[];
  title: string;
  baseTotal: number;
  searchTerm: string;
  currentYear: number;
  showTotalValueHeader?: boolean;
}

const GroupedItemsDisplay: React.FC<GroupedItemsDisplayProps> = React.memo(
  ({ groups, title, baseTotal, searchTerm, currentYear, showTotalValueHeader = false }) => {

    const { totalValueFiltered, totalPercentageFiltered } = React.useMemo(() => {
      const totalValue = groups.reduce(
        (sum, ch) =>
          sum +
          ch.functionals.reduce((funcSum: number, func: GroupedFunctional) => {
            if (func.economics.length > 0) {
              return (
                funcSum +
                func.economics.reduce((ecoSum: number, eco: GroupedEconomic) => ecoSum + eco.amount, 0)
              );
            }
            return funcSum + func.totalAmount;
          }, 0),
        0
      );

      const percentage = baseTotal > 0 ? (totalValue / baseTotal) * 100 : 0;
      return { totalValueFiltered: totalValue, totalPercentageFiltered: percentage };
    }, [groups, baseTotal]);

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

    const openChapters = searchTerm ? groups.map((ch) => ch.prefix) : [];

    const TotalValueComponent = () => (
      <div className="flex flex-col">
        <p className='flex justify-end items-center m-4 mb-0 font-semibold'>
          Total:{" "}
          {formatCurrency(totalValueFiltered, "standard")}
          {totalPercentageFiltered > 0 && totalPercentageFiltered <= 99.99 && (
            <span className="pl-2 text-sm text-muted-foreground">
              ({formatNumberRO(totalPercentageFiltered)}%)
            </span>
          )}
        </p>
        <p className="text-sm text-muted-foreground text-right m-4 mt-0">
          {formatCurrency(totalValueFiltered, "compact")}
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
          />
        ))}
        <TotalValueComponent />
      </Accordion>
    );
  }
);

GroupedItemsDisplay.displayName = "GroupedItemsDisplay";

interface FinancialDataCardProps {
  title: string;
  iconType: 'income' | 'expense';
  currentYear: number;
  years: number[];
  onYearChange: (year: number) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  searchActive: boolean;
  onSearchToggle: (active: boolean) => void;
  groups: GroupedChapter[];
  baseTotal: number;
  searchFocusKey?: string;
}

export const FinancialDataCard: React.FC<FinancialDataCardProps> = ({
  title,
  iconType,
  currentYear,
  years,
  onYearChange,
  searchTerm,
  onSearchChange,
  searchActive,
  onSearchToggle,
  groups,
  baseTotal,
  searchFocusKey,
}) => {
  const Icon = iconType === 'income' ? ArrowUpCircle : ArrowDownCircle;
  const iconColor = iconType === 'income' ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';

  return (
    <Card className="shadow-lg dark:bg-slate-800 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center">
          <Icon className={`h-6 w-6 mr-2 ${iconColor}`} />
          <Select
            value={currentYear.toString()}
            onValueChange={(val) => onYearChange(parseInt(val, 10))}
          >
            <SelectTrigger className="w-auto border-0 shadow-none bg-transparent focus:ring-0">
              <h3 className="text-lg font-semibold">
                {title} ({currentYear})
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
          active={searchActive}
          initialSearchTerm={searchTerm}
          onToggle={onSearchToggle}
          onChange={onSearchChange}
          focusKey={searchFocusKey}
        />
      </CardHeader>
      <CardContent className="flex-grow">
        <GroupedItemsDisplay
          groups={groups}
          title={title}
          baseTotal={baseTotal}
          searchTerm={searchTerm}
          currentYear={currentYear}
          showTotalValueHeader={!!searchActive}
        />
      </CardContent>
    </Card>
  );
}; 