import React from 'react';
import type { ExecutionLineItem, FundingSourceOption } from '@/lib/api/entities';
import { t } from '@lingui/core/macro';
import type { TMonth, TQuarter } from '@/schemas/reporting';
import { LineItemsGroupedSection } from './LineItemsGroupedSection';
import { LineItemsBadgeFilters } from './LineItemsBadgeFilters';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export interface EntityLineItemsTabsProps {
  lineItems: readonly ExecutionLineItem[];
  fundingSources?: readonly FundingSourceOption[];
  currentYear: number;
  month?: TMonth;
  quarter?: TQuarter;
  years: number[];
  onYearChange: (year: number) => void;
  initialExpenseSearchTerm: string;
  initialIncomeSearchTerm: string;
  onSearchChange: (type: 'expense' | 'income', term: string) => void;
  isLoading?: boolean;
  normalization?: 'total' | 'total_euro' | 'per_capita' | 'per_capita_euro';
  onPrefetchYear?: (year: number) => void;
  // Shared tab state
  lineItemsTab?: 'functional' | 'funding' | 'expenseType';
  onLineItemsTabChange?: (tab: 'functional' | 'funding' | 'expenseType') => void;
  // Selected keys
  selectedFundingKey?: string;
  selectedExpenseTypeKey?: string;
  onSelectedFundingKeyChange?: (key: string) => void;
  onSelectedExpenseTypeKeyChange?: (key: string) => void;
  types?: readonly ('income' | 'expense')[];
  transferFilter?: 'all' | 'no-transfers' | 'transfers-only';
  onTransferFilterChange?: (filter: 'all' | 'no-transfers' | 'transfers-only') => void;
}

export const EntityLineItemsTabs: React.FC<EntityLineItemsTabsProps> = ({
  lineItems,
  fundingSources = [],
  currentYear,
  month,
  quarter,
  years,
  onYearChange,
  initialExpenseSearchTerm,
  initialIncomeSearchTerm,
  onSearchChange,
  isLoading,
  normalization,
  onPrefetchYear,
  lineItemsTab = 'functional',
  onLineItemsTabChange,
  selectedFundingKey = '',
  selectedExpenseTypeKey = '',
  onSelectedFundingKeyChange,
  onSelectedExpenseTypeKeyChange,
  types,
  transferFilter,
  onTransferFilterChange,
}) => {
  const renderedTypes = (types && types.length > 0 ? [...types] : ['income', 'expense']) as ('income' | 'expense')[];
  const isDualColumn = renderedTypes.length > 1;
  const badgeDisplayMode = isDualColumn ? 'combined' : 'single';
  const badgeAccountCategory = !isDualColumn ? (renderedTypes[0] === 'income' ? 'vn' : 'ch') : undefined;

  const typeConfigs = renderedTypes.map((type) => ({
    type,
    title: type === 'income' ? t`Incomes` : t`Expenses`,
    searchTerm: type === 'income' ? initialIncomeSearchTerm : initialExpenseSearchTerm,
    onSearchTermChange: (term: string) => onSearchChange(type, term),
    iconType: type,
    searchFocusKey: type === 'income' ? 'mod+l' : 'mod+j',
  }));

  const gridClassName = `grid grid-cols-1 gap-6${isDualColumn ? ' lg:grid-cols-2' : ''}`;

  return (
    <section className="space-y-2 mb-2">
      <ToggleGroup
        type="single"
        value={lineItemsTab}
        onValueChange={(value) => {
          if (value) {
            onLineItemsTabChange?.(value as 'functional' | 'funding' | 'expenseType');
          }
        }}
        className="flex gap-2 justify-start"
      >
        <ToggleGroupItem
          value="functional"
          className="data-[state=on]:bg-black data-[state=on]:text-white py-6 sm:py-0"
        >
          {t`By Category`}
        </ToggleGroupItem>
        <ToggleGroupItem
          value="funding"
          className="data-[state=on]:bg-black data-[state=on]:text-white py-6 sm:py-0"
        >
          {t`By Funding Source`}
        </ToggleGroupItem>
        <ToggleGroupItem
          value="expenseType"
          className="data-[state=on]:bg-black data-[state=on]:text-white py-6 sm:py-0"
        >
          {t`By Expense Type`}
        </ToggleGroupItem>
      </ToggleGroup>
      {lineItemsTab === 'functional' && (
        <div className="mt-4">
          <div className={gridClassName}>
            {typeConfigs.map(({ type, title, searchTerm, onSearchTermChange, iconType, searchFocusKey }) => (
              <LineItemsGroupedSection
                key={type}
                items={lineItems}
                fundingSources={fundingSources}
                type={type}
                title={title}
                currentYear={currentYear}
                years={years}
                month={month}
                quarter={quarter}
                normalization={normalization}
                onYearChange={onYearChange}
                onPrefetchYear={onPrefetchYear}
                isLoading={isLoading}
                activeTab="functional"
                initialSearchTerm={searchTerm}
                onInitialSearchChange={onSearchTermChange}
                iconType={iconType}
                searchFocusKey={searchFocusKey}
                transferFilter={transferFilter}
                onTransferFilterChange={onTransferFilterChange}
              />
            ))}
          </div>
        </div>
      )}
      {lineItemsTab === 'funding' && (
        <div className="mt-4">
          <LineItemsBadgeFilters
            items={lineItems}
            fundingSources={fundingSources}
            mode="funding"
            selectedKey={selectedFundingKey}
            onSelectedKeyChange={onSelectedFundingKeyChange || (() => { })}
            normalization={normalization}
            isLoading={isLoading}
            displayMode={badgeDisplayMode}
            accountCategory={badgeAccountCategory}
          />

          <div className={gridClassName}>
            {typeConfigs.map(({ type, title, searchTerm, onSearchTermChange, iconType, searchFocusKey }) => (
              <LineItemsGroupedSection
                key={type}
                items={lineItems}
                fundingSources={fundingSources}
                type={type}
                title={title}
                currentYear={currentYear}
                years={years}
                month={month}
                quarter={quarter}
                normalization={normalization}
                onYearChange={onYearChange}
                onPrefetchYear={onPrefetchYear}
                isLoading={isLoading}
                activeTab="funding"
                selectedFundingKey={selectedFundingKey}
                onSelectedFundingKeyChange={onSelectedFundingKeyChange}
                initialSearchTerm={searchTerm}
                onInitialSearchChange={onSearchTermChange}
                iconType={iconType}
                searchFocusKey={searchFocusKey}
                transferFilter={transferFilter}
                onTransferFilterChange={onTransferFilterChange}
              />
            ))}
          </div>
        </div>
      )}
      {lineItemsTab === 'expenseType' && (
        <div className="mt-4">
          <LineItemsBadgeFilters
            items={lineItems}
            fundingSources={fundingSources}
            mode="expenseType"
            selectedKey={selectedExpenseTypeKey}
            onSelectedKeyChange={onSelectedExpenseTypeKeyChange || (() => { })}
            normalization={normalization}
            isLoading={isLoading}
            displayMode={badgeDisplayMode}
            accountCategory={badgeAccountCategory}
          />

          <div className={gridClassName}>
            {typeConfigs.map(({ type, title, searchTerm, onSearchTermChange, iconType, searchFocusKey }) => (
              <LineItemsGroupedSection
                key={type}
                items={lineItems}
                fundingSources={fundingSources}
                type={type}
                title={title}
                currentYear={currentYear}
                years={years}
                month={month}
                quarter={quarter}
                normalization={normalization}
                onYearChange={onYearChange}
                onPrefetchYear={onPrefetchYear}
                isLoading={isLoading}
                activeTab="expenseType"
                selectedExpenseTypeKey={selectedExpenseTypeKey}
                onSelectedExpenseTypeKeyChange={onSelectedExpenseTypeKeyChange}
                initialSearchTerm={searchTerm}
                onInitialSearchChange={onSearchTermChange}
                iconType={iconType}
                searchFocusKey={searchFocusKey}
                transferFilter={transferFilter}
                onTransferFilterChange={onTransferFilterChange}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
