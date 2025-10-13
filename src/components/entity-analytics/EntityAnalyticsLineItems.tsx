import React, { useMemo, useState } from "react";
import type { AnalyticsFilterType } from "@/schemas/charts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SearchToggleInput } from "../entities/SearchToggleInput";
import { GroupedItemsDisplay } from "../entities/FinancialDataCard";
import { useFinancialData, MinimalExecutionLineItem } from "@/hooks/useFinancialData";
import { EntityAnalyticsLineItemsSkeleton } from "./EntityAnalyticsLineItemsSkeleton";
import { Button } from "@/components/ui/button";
import { BarChart2Icon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { generateChartFromTopGroups } from "@/lib/chart-generation-utils";
import { Trans } from "@lingui/react/macro";
import type { AggregatedLineItemConnection } from "@/schemas/entity-analytics";
import { generateHash } from "@/lib/utils";

interface EntityAnalyticsLineItemsProps {
  filter: AnalyticsFilterType;
  title: string;
  data?: AggregatedLineItemConnection;
  isLoading?: boolean;
  error?: Error | null;
}

export const EntityAnalyticsLineItems: React.FC<
  EntityAnalyticsLineItemsProps
> = ({ filter, title, data, isLoading, error }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const executionLineItems: MinimalExecutionLineItem[] = useMemo(() => {
    if (!data?.nodes) return [];
    return data.nodes.map((item) => ({
      account_category: filter.account_category, // Assuming filter.account_category is 'ch' or 'vn'
      amount: item.amount,
      economicClassification: {
        economic_code: item.ec_c,
        economic_name: item.ec_n,
      },
      functionalClassification: {
        functional_code: item.fn_c,
        functional_name: item.fn_n,
      },
    }));
  }, [data, filter.account_category]);

  const {
    expenseSearchTerm,
    onExpenseSearchChange,
    expenseSearchActive,
    onExpenseSearchToggle,
    filteredExpenseGroups,
    expenseBase,
    incomeSearchTerm,
    onIncomeSearchChange,
    incomeSearchActive,
    onIncomeSearchToggle,
    filteredIncomeGroups,
    incomeBase,
  } = useFinancialData(
    executionLineItems,
    filter.account_category === 'vn' ? executionLineItems.reduce((sum, item) => sum + item.amount, 0) : null,
    filter.account_category === 'ch' ? executionLineItems.reduce((sum, item) => sum + item.amount, 0) : null,
    filter.account_category === 'ch' ? searchTerm : '',
    filter.account_category === 'vn' ? searchTerm : '',
  );

  const handleSearchChange = (term: string) => {
    if (filter.account_category === 'ch') {
      onExpenseSearchChange(term);
    } else {
      onIncomeSearchChange(term);
    }
    setSearchTerm(term);
  };

  const handleSearchToggle = (active: boolean) => {
    if (filter.account_category === 'ch') {
      onExpenseSearchToggle(active);
    } else {
      onIncomeSearchToggle(active);
    }
  };

  const navigate = useNavigate();

  const handleViewChart = () => {
    const filterHash = generateHash(JSON.stringify(filter));
    const newChart = generateChartFromTopGroups(
      groupsToDisplay,
      baseTotalToDisplay,
      filter,
      title,
      filterHash
    );
    navigate({ to: `/charts/${newChart.id}`, search: { chart: newChart, view: 'overview' } });
  };

  const groupsToDisplay = filter.account_category === 'vn' ? filteredIncomeGroups : filteredExpenseGroups;
  const baseTotalToDisplay = filter.account_category === 'vn' ? incomeBase : expenseBase;
  const currentSearchTerm = filter.account_category === 'vn' ? incomeSearchTerm : expenseSearchTerm;
  const currentSearchActive = filter.account_category === 'vn' ? incomeSearchActive : expenseSearchActive;

  return (
    <Card className="shadow-lg dark:bg-slate-800 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button variant="outline" size="sm" onClick={handleViewChart}>
            <BarChart2Icon className="w-4 h-4" />
            <Trans>View Chart</Trans>
          </Button>
        </div>
        <SearchToggleInput
          active={currentSearchActive}
          initialSearchTerm={currentSearchTerm}
          onToggle={handleSearchToggle}
          onChange={handleSearchChange}
        />
      </CardHeader>
      <CardContent className="flex-grow">
        {isLoading ? (
          <EntityAnalyticsLineItemsSkeleton itemCount={10} />
        ) : error ? (
          <p><Trans>Error loading data</Trans></p>
        ) : (
          <GroupedItemsDisplay
            groups={groupsToDisplay}
            title={title}
            baseTotal={baseTotalToDisplay}
            searchTerm={currentSearchTerm}
            currentYear={0} // Year is not applicable here
            showTotalValueHeader={!!currentSearchActive}
            normalization={filter.normalization}
          />
        )}
      </CardContent>
    </Card>
  );
};
