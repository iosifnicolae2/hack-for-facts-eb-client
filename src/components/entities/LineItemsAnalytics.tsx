import React, { useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { EntityDetailsData } from '@/lib/api/entities';
import { formatCurrency } from '@/lib/utils';
import { PieChartIcon, BarChartIcon } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";
import { processDataForAnalyticsChart } from '@/lib/analytics-utils';
import { LineItemsAnalyticsSkeleton } from './LineItemsAnalyticsSkeleton';
import { applyAlpha } from '../charts/components/chart-renderer/utils';
import { Trans } from '@lingui/react/macro';
import { TMonth, TQuarter } from '@/schemas/reporting';
import { getYearLabel } from './utils';

interface AnalyticsProps {
    lineItems?: EntityDetailsData['executionLineItems'];
    analyticsYear: number;
    month?: TMonth;
    quarter?: TQuarter;
    years: number[];
    onYearChange: (year: number) => void;
    chartType: ChartType;
    onChartTypeChange: (type: ChartType) => void;
    dataType: DataType;
    onDataTypeChange: (type: DataType) => void;
    isLoading?: boolean;
}

type ChartType = 'bar' | 'pie';
type DataType = 'income' | 'expense';

const COLORS = ['#16a34a', '#3b82f6', '#f97316', '#fde047', '#a855f7', '#ec4899', '#78716c'];

export const LineItemsAnalytics: React.FC<AnalyticsProps> = ({
    lineItems,
    analyticsYear,
    month,
    quarter,
    years,
    onYearChange,
    chartType,
    onChartTypeChange,
    dataType,
    onDataTypeChange,
    isLoading,
}) => {
    const expenses = useMemo(() => lineItems?.nodes.filter(li => li.account_category === 'ch') || [], [lineItems]);
    const incomes = useMemo(() => lineItems?.nodes.filter(li => li.account_category === 'vn') || [], [lineItems]);

    const incomeData = useMemo(() => processDataForAnalyticsChart(incomes), [incomes]);
    const expenseData = useMemo(() => processDataForAnalyticsChart(expenses), [expenses]);

    const activeData = dataType === 'income' ? incomeData : expenseData;

    const totalActiveAmount = useMemo(() => activeData.reduce((sum, d) => sum + d.value, 0), [activeData]);

    type BarLabelProps = {
        x?: number | string;
        y?: number | string;
        width?: number | string;
        value?: number | string;
    };

    const renderBarLabel = (props: BarLabelProps) => {
        const { x = 0, y = 0, width = 0, value = 0 } = props;
        const numericValue = Number(value);
        const percent = totalActiveAmount ? (numericValue / totalActiveAmount) * 100 : 0;
        return (
            <text
                x={Number(x) + Number(width) / 2}
                y={Number(y) - 6}
                fill="#334155"
                textAnchor="middle"
                fontSize="12px"
            >
                {`${percent.toFixed(0)}%`}
            </text>
        );
    };

    if (isLoading) {
        return <LineItemsAnalyticsSkeleton />;
    }

    return (
        <Card className="shadow-lg dark:bg-slate-800">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <Select
                            value={analyticsYear.toString()}
                            onValueChange={(val) => onYearChange(parseInt(val, 10))}
                        >
                            <SelectTrigger className="w-auto border-0 shadow-none bg-transparent focus:ring-0">
                                <CardTitle><Trans>Main Categories</Trans> {getYearLabel(analyticsYear, month, quarter)}</CardTitle>
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {getYearLabel(year, month, quarter)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <ToggleGroup type="single" variant="outline" size="sm" value={dataType} onValueChange={(value: DataType) => value && onDataTypeChange(value)}>
                            <ToggleGroupItem value="income" aria-label="Income">Income</ToggleGroupItem>
                            <ToggleGroupItem value="expense" aria-label="Expenses">Expenses</ToggleGroupItem>
                        </ToggleGroup>
                        <ToggleGroup type="single" variant="outline" size="sm" value={chartType} onValueChange={(value: ChartType) => value && onChartTypeChange(value)}>
                            <ToggleGroupItem value="bar" aria-label="Bar chart">
                                <BarChartIcon className="h-4 w-4" />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="pie" aria-label="Pie chart">
                                <PieChartIcon className="h-4 w-4" />
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div style={{ width: '100%', height: 480 }}>
                    <ResponsiveContainer>
                        {chartType === 'bar' ? (
                            <BarChart data={activeData} margin={{ top: 40, right: 30, left: 100, bottom: 80 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" interval={0} height={100} />
                                <YAxis tickFormatter={(value) => formatCurrency(value, "compact")} />
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Bar dataKey="value" fill={dataType === 'income' ? applyAlpha('#4ade80', 0.8) : applyAlpha('#f87171', 0.8)}>
                                    <LabelList content={renderBarLabel} />
                                </Bar>
                            </BarChart>
                        ) : (
                            <PieChart>
                                <Pie
                                    data={activeData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    animationBegin={0}
                                    animationDuration={300}
                                    outerRadius={160}
                                    labelLine={true}
                                    label={({ name, percent }) => `${name.slice(0, 30)} (${((percent || 0) * 100).toFixed(0)}%)`}
                                >
                                    {activeData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Legend verticalAlign="bottom" height={50} wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
