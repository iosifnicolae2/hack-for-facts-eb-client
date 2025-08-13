import { useMemo, useState } from 'react';
import { useChartStore } from '@/components/charts/hooks/useChartStore';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Analytics } from '@/lib/analytics';
import { collectUniqueFilterValues, countPotentialReplacements, getFilterDisplayName, ReplaceableFilterKey, replaceFilterValue } from '@/lib/chart-filter-utils';
import { ArrowLeftRight, CheckCircle2, RefreshCw } from 'lucide-react';

interface FilterBulkEditProps {
    withCard?: boolean;
}

export function FilterBulkEdit({ withCard = true }: FilterBulkEditProps) {
    const { chart, updateChart } = useChartStore();
    const [bulkField, setBulkField] = useState<ReplaceableFilterKey | ''>('');
    const currentOptions = useMemo(() => bulkField ? collectUniqueFilterValues(chart, bulkField) : [], [chart, bulkField]);
    const [fromValue, setFromValue] = useState<string>('');
    const [toValue, setToValue] = useState<string>('');
    const replacementCount = useMemo(() => (bulkField && fromValue) ? countPotentialReplacements(chart, bulkField, fromValue) : 0, [chart, bulkField, fromValue]);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const Content = (
        <div className="py-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-lg font-semibold">Bulk edit filters</h2>
                    <p className="text-sm text-muted-foreground">Find and replace a filter value across all series.</p>
                </div>
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label>Filter field</Label>
                    <Select value={bulkField} onValueChange={(v) => { setBulkField(v as ReplaceableFilterKey); setFromValue(''); }}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                            {(([
                                'entity_cuis',
                                'entity_types',
                                'uat_ids',
                                'functional_codes',
                                'economic_codes',
                                'budget_sector_ids',
                                'funding_source_ids',
                                'functional_prefixes',
                                'economic_prefixes',
                                'account_category',
                                'report_type',
                                'is_uat',
                            ]) as ReplaceableFilterKey[]).map((key) => (
                                <SelectItem key={key} value={key}>{getFilterDisplayName(key)}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Replace value</Label>
                    <Select value={fromValue} onValueChange={setFromValue} disabled={!bulkField || currentOptions.length === 0}>
                        <SelectTrigger>
                            <SelectValue placeholder={bulkField ? (currentOptions.length ? 'Select current value' : 'No values to replace') : 'Select field first'} />
                        </SelectTrigger>
                        <SelectContent>
                            {currentOptions.map((opt) => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>New value</Label>
                    <Input placeholder="Enter new value" value={toValue} onChange={(e) => setToValue(e.target.value)} disabled={!bulkField || !fromValue} />
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    {replacementCount > 0 ? `${replacementCount} occurrence${replacementCount === 1 ? '' : 's'} found` : 'No matches yet'}
                </div>
                <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <AlertDialogTrigger asChild>
                        <Button
                            disabled={!bulkField || !fromValue || !toValue || replacementCount === 0}
                            className="gap-2"
                            variant="secondary"
                        >
                            <ArrowLeftRight className="h-4 w-4" />
                            Replace
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirm replace</AlertDialogTitle>
                            <AlertDialogDescription>
                                {`Replace "${fromValue}" with "${toValue}" in ${getFilterDisplayName(bulkField || '')} across ${replacementCount} occurrence${replacementCount === 1 ? '' : 's'}?`}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    if (!bulkField) return;
                                    const updated = replaceFilterValue(chart, bulkField, fromValue, toValue);
                                    updateChart(updated);
                                    setConfirmOpen(false);
                                    Analytics.capture(Analytics.EVENTS.ChartUpdated, { action: 'bulk_filter_replace', field: bulkField, from: fromValue, to: toValue, occurrences: replacementCount });
                                    toast.success('Filters updated', { description: `Replaced ${replacementCount} occurrence${replacementCount === 1 ? '' : 's'}.`, icon: <CheckCircle2 className="h-4 w-4 text-green-600" /> });
                                    setFromValue('');
                                    setToValue('');
                                }}
                            >
                                Confirm
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );

    if (withCard) {
        return (
            <Card>
                <CardContent>{Content}</CardContent>
            </Card>
        );
    }
    return Content;
}

export default FilterBulkEdit;


