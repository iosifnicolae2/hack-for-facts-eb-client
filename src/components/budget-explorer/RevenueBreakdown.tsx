import { Trans } from '@lingui/react/macro'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { yValueFormatter } from '@/components/charts/components/chart-renderer/utils'
import { getNormalizationUnit } from '@/lib/utils'
import { Info } from 'lucide-react'
import type { AggregatedNode } from './budget-transform'
import { getClassificationName } from '@/lib/classifications'

type Props = {
    readonly nodes: readonly AggregatedNode[] | undefined
    readonly normalization?: 'total' | 'total_euro' | 'per_capita' | 'per_capita_euro'
}

const normalizeFn = (code?: string | null) => (code ?? '').replace(/[^0-9.]/g, '')
const matchPrefix = (code: string, prefix: string) => code === prefix || code.startsWith(prefix + '.') || code.startsWith(prefix)

export function RevenueBreakdown({ nodes, normalization }: Props) {
    const unit = getNormalizationUnit(normalization ?? 'total')
    const currencyCode: 'RON' | 'EUR' = unit.includes('EUR') ? 'EUR' : 'RON'

    const list = nodes ?? []

    const totalRevenue = list.reduce((sum, n) => sum + (n.amount ?? 0), 0)

    const sumByFnPrefix = (prefix: string) => list.reduce((sum, n) => {
        const fn = normalizeFn(n.fn_c)
        return matchPrefix(fn, prefix) ? sum + (n.amount ?? 0) : sum
    }, 0)

    const sharesFromIncomeTax = sumByFnPrefix('04')
    const sharesFromVAT = sumByFnPrefix('11')
    const financialOps40 = sumByFnPrefix('40')
    const financialOps41 = sumByFnPrefix('41')
    const subsidies42 = sumByFnPrefix('42')
    const subsidiesFromOtherAdm43 = sumByFnPrefix('43')
    const pendingDistribution47 = sumByFnPrefix('47')
    const institutionalRemittances3605 = sumByFnPrefix('36.05')

    const interBudgetTransfers = sharesFromIncomeTax + sharesFromVAT + subsidies42 + subsidiesFromOtherAdm43 + pendingDistribution47 + institutionalRemittances3605
    const financialOps = financialOps40 + financialOps41

    // effectiveRevenue computed below after applying additional deductions

    type Row = { key: string; label: React.ReactNode; subtitle: React.ReactNode; badge: string; amount: number }

    const interBudgetRows: Row[] = [
        { key: '04', label: <Trans>Shares and amounts split from income tax</Trans>, subtitle: <Trans>Inter-budget transfers</Trans>, badge: 'fn:04.*', amount: sharesFromIncomeTax },
        { key: '11', label: <Trans>Shares from VAT</Trans>, subtitle: <Trans>Inter-budget transfers</Trans>, badge: 'fn:11.*', amount: sharesFromVAT },
        { key: '42', label: <Trans>Subsidies</Trans>, subtitle: <Trans>Treated as inter-budget flows</Trans>, badge: 'fn:42.*', amount: subsidies42 },
        { key: '43', label: <Trans>Subsidies from other administrations</Trans>, subtitle: <Trans>Inter-budget transfers</Trans>, badge: 'fn:43.*', amount: subsidiesFromOtherAdm43 },
        { key: '47', label: <Trans>Sums pending distribution</Trans>, subtitle: <Trans>Clearing accounts</Trans>, badge: 'fn:47.*', amount: pendingDistribution47 },
        { key: '36.05', label: <Trans>Institutional remittances</Trans>, subtitle: <Trans>Internal flow, inter-budget</Trans>, badge: 'fn:36.05', amount: institutionalRemittances3605 },
    ]

    const sortedInterBudget = interBudgetRows
        .filter(r => Math.abs(r.amount) > 0)
        .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))

    const interBudgetPrefixes = ['04', '11'] as const
    const providedSeScadCodesPrefix = [
        '01.03',
        '02.49',
        '03.19',
        '10.02',
        '10.04',
    ] as const
    const seScadCodes = providedSeScadCodesPrefix
        .map(code => normalizeFn(code))
        .filter(code => code.length > 0)
        .filter(code => !interBudgetPrefixes.some(prefix => matchPrefix(code, prefix)))

    const seScadAdjustments = Array.from(new Set(seScadCodes))
        .map((code) => ({
            code,
            label: getClassificationName(code) ?? code,
            amount: sumByFnPrefix(code),
        }))
        .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))

    const seScadDeduction = Math.abs(seScadAdjustments.reduce((sum, item) => sum + item.amount, 0))
    const seScadBadge = seScadAdjustments.length > 0 ? `fn:${seScadAdjustments.map(item => item.code).join(' + ')}` : ''

    const effectiveRevenue = totalRevenue - interBudgetTransfers - financialOps - seScadDeduction

    return (
        <Card className="shadow-sm border-l-4 border-l-primary/20">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold"><Trans>Consolidated Revenue Calculation</Trans></h3>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                    <Trans>How we compute true consolidated revenues (excluding inter-budget flows and financial operations)</Trans>
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Calculation breakdown */}
                <div className="bg-muted/30 rounded-lg p-5 space-y-1 lg:px-[8rem] ">
                    {/* Total revenue */}
                    <div className="flex items-center justify-between gap-6">
                        <div className="flex-1">
                            <div className="text-sm font-medium text-foreground">
                                <Trans>Total Revenues</Trans>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                <Trans>All recorded revenue inflows</Trans>
                            </div>
                        </div>
                        <div className="text-right min-w-[180px]">
                            <div className="font-mono text-lg font-semibold text-foreground">
                                {yValueFormatter(totalRevenue, currencyCode, 'compact')}
                            </div>
                            <div className="font-mono text-xs text-muted-foreground">
                                {yValueFormatter(totalRevenue, currencyCode, 'standard')}
                                {unit.includes('capita') && <span className="ml-1 font-sans">/ capita</span>}
                            </div>
                        </div>
                    </div>

                    {/* Minus sign */}
                    <div className="flex items-center justify-center py-1">
                        <div className="w-full border-t border-dashed border-border" />
                        <span className="px-3 text-lg font-bold text-muted-foreground">−</span>
                        <div className="w-full border-t border-dashed border-border" />
                    </div>

                    {/* Inter-budget transfers (sorted) */}
                    {sortedInterBudget.map((d) => (
                        <div className="flex items-center justify-between gap-6" key={d.key}>
                            <div className="flex-1">
                                <div className="text-sm font-medium text-foreground">
                                    {d.label}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {d.subtitle} <span className="font-mono text-[10px] bg-muted px-1 py-0.5 rounded">{d.badge}</span>
                                </div>
                            </div>
                            <div className="text-right min-w-[180px]">
                                <div className="font-mono text-lg font-semibold text-foreground">
                                    {yValueFormatter(d.amount, currencyCode, 'compact')}
                                </div>
                                <div className="font-mono text-xs text-muted-foreground">
                                    {yValueFormatter(d.amount, currencyCode, 'standard')}
                                    {unit.includes('capita') && <span className="ml-1 font-sans">/ capita</span>}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Minus sign */}
                    <div className="flex items-center justify-center py-1">
                        <div className="w-full border-t border-dashed border-border" />
                        <span className="px-3 text-lg font-bold text-muted-foreground">−</span>
                        <div className="w-full border-t border-dashed border-border" />
                    </div>

                    {/* Other "se scad" adjustments (non-inter-budget) */}
                    {seScadDeduction > 0 && (
                        <>
                            <div className="flex items-center justify-between gap-6">
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-foreground">
                                        <Trans>Adjustments marked as "se scad"</Trans>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        <Trans>Tax deductions outside inter-budget transfers</Trans>
                                        {seScadBadge && (
                                            <>
                                                {' '}
                                                <span className="font-mono text-[10px] bg-muted px-1 py-0.5 rounded">{seScadBadge}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right min-w-[180px]">
                                    <div className="font-mono text-lg font-semibold text-foreground">
                                        {yValueFormatter(seScadDeduction, currencyCode, 'compact')}
                                    </div>
                                    <div className="font-mono text-xs text-muted-foreground">
                                        {yValueFormatter(seScadDeduction, currencyCode, 'standard')}
                                        {unit.includes('capita') && <span className="ml-1 font-sans">/ capita</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Breakdown */}
                            {seScadAdjustments.length > 0 && (
                                <div className="mt-1 pl-3 border-l border-dashed border-border">
                                    <p className="text-[11px] text-muted-foreground leading-snug mb-1">
                                        <Trans>Lines marked as "se scad" inside other tax chapters are deducted here to adjust the tax bases. They are shown separately from inter-budget transfers (04.* and 11.*).</Trans>
                                    </p>
                                    <div className="grid gap-1">
                                        {seScadAdjustments.map((it) => (
                                            <div key={it.code} className="flex items-center justify-between">
                                                <div className="text-xs text-muted-foreground">
                                                    <span className="font-mono text-[10px] bg-muted px-1 py-0.5 rounded mr-2">fn:{it.code}</span>
                                                    {it.label}
                                                </div>
                                                <div className="font-mono text-xs text-muted-foreground">
                                                    {yValueFormatter(it.amount, currencyCode, 'standard')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Minus sign */}
                            <div className="flex items-center justify-center py-1">
                                <div className="w-full border-t border-dashed border-border" />
                                <span className="px-3 text-lg font-bold text-muted-foreground">−</span>
                                <div className="w-full border-t border-dashed border-border" />
                            </div>
                        </>
                    )}

                    {/* Financial operations */}
                    <div className="flex items-center justify-between gap-6">
                        <div className="flex-1">
                            <div className="text-sm font-medium text-foreground">
                                <Trans>Financial operations</Trans>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                <Trans>Loan repayments and other operations</Trans> <span className="font-mono text-[10px] bg-muted px-1 py-0.5 rounded">fn:40.* + 41.*</span>
                            </div>
                        </div>
                        <div className="text-right min-w-[180px]">
                            <div className="font-mono text-lg font-semibold text-foreground">
                                {yValueFormatter(financialOps, currencyCode, 'compact')}
                            </div>
                            <div className="font-mono text-xs text-muted-foreground">
                                {yValueFormatter(financialOps, currencyCode, 'standard')}
                                {unit.includes('capita') && <span className="ml-1 font-sans">/ capita</span>}
                            </div>
                        </div>
                    </div>

                    {/* Equals sign */}
                    <div className="flex items-center justify-center py-1">
                        <div className="w-full border-t-2 border-primary/30" />
                        <span className="px-3 text-lg font-bold text-primary">=</span>
                        <div className="w-full border-t-2 border-primary/30" />
                    </div>

                    {/* Effective revenue */}
                    <div className="flex items-center justify-between gap-6 bg-primary/5 rounded-md p-3 -mx-1">
                        <div className="flex-1">
                            <div className="text-base font-semibold text-foreground">
                                <Trans>True Consolidated Revenues</Trans>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                <Trans>Excluding inter-budget flows and financial operations</Trans>
                            </div>
                        </div>
                        <div className="text-right min-w-[180px]">
                            <div className="font-mono text-xl font-bold text-primary">
                                {yValueFormatter(effectiveRevenue, currencyCode, 'compact')}
                            </div>
                            <div className="font-mono text-xs text-muted-foreground">
                                {yValueFormatter(effectiveRevenue, currencyCode, 'standard')}
                                {unit.includes('capita') && <span className="ml-1 font-sans">/ capita</span>}
                            </div>
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    )
}
