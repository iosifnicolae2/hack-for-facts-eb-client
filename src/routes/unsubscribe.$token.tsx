import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUnsubscribe } from '@/features/notifications/hooks/useUnsubscribe';
import { Trans } from '@lingui/react/macro';
// import { t } from '@lingui/core/macro';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { getSiteUrl } from '@/config/env';

export const Route = createFileRoute('/unsubscribe/$token')({
  component: UnsubscribePage,
});

function UnsubscribePage() {
  const { token } = Route.useParams();
  const unsubscribeMutation = useUnsubscribe();

  const handleUnsubscribe = () => {
    unsubscribeMutation.mutate(token);
  };

  if (unsubscribeMutation.isSuccess) {
    return (
      <div className="container max-w-2xl mx-auto py-16 px-4">
        {/* Head handled by Route.head */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">
              <Trans>Successfully unsubscribed</Trans>
            </CardTitle>
            <CardDescription>
              <Trans>
                You will no longer receive notifications via email.
              </Trans>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/settings/notifications">
              <Button variant="outline" className="w-full sm:w-auto">
                <Trans>Manage notifications</Trans>
              </Button>
            </Link>
            <Link to="/">
              <Button className="w-full sm:w-auto">
                <Trans>Go to homepage</Trans>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (unsubscribeMutation.isError) {
    return (
      <div className="container max-w-2xl mx-auto py-16 px-4">
        {/* Head handled by Route.head */}
        <Card className="border-destructive">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">
              <Trans>Unsubscribe error</Trans>
            </CardTitle>
            <CardDescription>
              <Trans>
                There was an error processing your request. The link may be expired or invalid.
              </Trans>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleUnsubscribe} variant="outline" className="w-full sm:w-auto">
              <Trans>Try again</Trans>
            </Button>
            <Link to="/">
              <Button className="w-full sm:w-auto">
                <Trans>Go to homepage</Trans>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-16 px-4">
      {/* Head handled by Route.head */}
      <Card>
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl">
            <Trans>Unsubscribe from notifications</Trans>
          </CardTitle>
          <CardDescription>
            <Trans>Are you sure you want to unsubscribe from this notification?</Trans>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            <Trans>
              If you unsubscribe, you will no longer receive emails for this notification. You can
              always resubscribe later from your account settings.
            </Trans>
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/" className="flex-1">
              <Button variant="outline" className="w-full">
                <Trans>Cancel</Trans>
              </Button>
            </Link>
            <Button
              onClick={handleUnsubscribe}
              disabled={unsubscribeMutation.isPending}
              variant="destructive"
              className="flex-1"
            >
              {unsubscribeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <Trans>Processing...</Trans>
                </>
              ) : (
                <Trans>Confirm unsubscribe</Trans>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function buildUnsubscribeHead() {
  const site = getSiteUrl()
  const canonical = `${site}/unsubscribe`
  const title = 'Unsubscribe from notifications'
  return {
    meta: [
      { title },
      { name: 'robots', content: 'noindex,follow' },
      { name: 'canonical', content: canonical },
    ],
  }
}

export function head() {
  return buildUnsubscribeHead()
}
