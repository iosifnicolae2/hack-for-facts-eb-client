import { EntityDetailsData } from '@/lib/api/entities';
import { ExternalLink, Info } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme/theme-provider';

type Props = {
    entity?: EntityDetailsData | null | undefined;
};

export function ContractsView({ entity }: Props) {
    const { theme } = useTheme();

    if (!entity) {
        return null;
    }

    // Determine the effective theme for the embed
    const getEffectiveTheme = (): 'dark' | 'light' => {
        if (theme === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return theme;
    };

    const effectiveTheme = getEffectiveTheme();
    const sicapUrl = `https://sicap.ai/autoritate/${entity.cui}`;
    const sicapEmbedUrl = `https://sicap.ai/embed?cui=${entity.cui}&theme=${effectiveTheme}`;

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <h3 className="text-lg font-semibold">
                    <Trans>Latest Contracts</Trans>
                </h3>
                <div className="w-full overflow-hidden rounded-lg border bg-background shadow-sm">
                    <iframe
                        src={sicapEmbedUrl}
                        title="SICAP.ai Latest Contracts"
                        className="w-full"
                        style={{ height: '600px' }}
                        loading="lazy"
                    />
                </div>
            </div>

            <div className="space-y-3">
                <h3 className="text-lg font-semibold">
                    <Trans>Full Procurement Portal</Trans>
                </h3>
                <div className="relative w-full overflow-hidden rounded-lg border bg-background shadow-sm">
                    <div className="aspect-16/10 md:aspect-video lg:aspect-21/9 w-full">
                        <iframe
                            src={sicapUrl}
                            title="SICAP.ai Public Contracts Portal"
                            className="absolute inset-0 h-full w-full"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg border bg-muted/50 p-4">
                <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">
                        <Trans>
                            Public procurement data is provided by SICAP.ai, an independent platform that aggregates and analyzes public contracts from Romania's Electronic Public Procurement System (SEAP).
                        </Trans>
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    asChild
                >
                    <a href={sicapUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        <Trans>Open in SICAP.ai</Trans>
                    </a>
                </Button>
            </div>
        </div>
    );
}
