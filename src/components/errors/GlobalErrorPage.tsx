import { Button } from "@/components/ui/button";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import { useEffect, useMemo } from "react";
import { classifyError, getTechnicalMessage } from "@/lib/errors-utils";
import { env } from "@/config/env";

type GlobalErrorPageProps = {
    readonly error: unknown;
};

// --- Action Handlers ---
// These functions perform a "hard" navigation, which is crucial for resolving
// chunk load errors by fetching the latest HTML and asset bundle. They do not
// depend on component state, so they can live outside the component body.

/** Forces a full reload of the current page. */
const hardReloadPage = () => window.location.reload();

/** Forces a full navigation to the homepage. */
const navigateHomeAndReload = () => window.location.assign("/");

export function GlobalErrorPage({ error }: GlobalErrorPageProps) {
    // Classify the error to get user-friendly, translatable messages
    const classifiedError = useMemo(() => classifyError(error), [error]);
    const technicalMessage = useMemo(() => getTechnicalMessage(error), [error]);

    useEffect(() => {
        if (env.NODE_ENV === "development") {
            console.error("A global error was caught:", error);
        }
    }, [error]);

    return (
        <main
            className="min-h-screen w-full flex items-center justify-center bg-background p-6"
            role="alert"
            aria-labelledby="error-title"
        >
            <div className="w-full max-w-xl text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>

                <h1 id="error-title" className="text-3xl font-bold tracking-tight">
                    {t(classifiedError.title)}
                </h1>

                <p className="mt-4 text-lg text-muted-foreground">
                    {t(classifiedError.friendlyMessage)}
                </p>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button onClick={hardReloadPage} size="lg" className="w-full sm:w-auto">
                        <RefreshCcw className="mr-2 h-5 w-5" />
                        <Trans>Reload Page</Trans>
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={navigateHomeAndReload}
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        <Home className="mr-2 h-5 w-5" />
                        <Trans>Go to Homepage</Trans>
                    </Button>
                </div>

                {technicalMessage && (
                    <details className="mt-8 text-left">
                        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                            <Trans>Show Technical Details</Trans>
                        </summary>
                        <pre className="mt-2 overflow-auto rounded-md bg-muted p-4 text-xs text-muted-foreground">
                            <code>{technicalMessage}</code>
                        </pre>
                    </details>
                )}
            </div>
        </main>
    );
}

export default GlobalErrorPage;