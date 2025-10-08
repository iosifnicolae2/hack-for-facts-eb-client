import { createFileRoute } from '@tanstack/react-router';
import { NotificationList } from '@/features/notifications/components/NotificationList';
import { useAllNotifications } from '@/features/notifications/hooks/useAllNotifications';
import { useAuth, AuthSignInButton } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { Seo } from '@/lib/seo';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AlertTriangle } from 'lucide-react';

export const Route = createFileRoute('/settings/notifications')({
  component: NotificationsSettingsPage,
});

function NotificationsSettingsPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { data: notifications, isLoading, isError, error, refetch } = useAllNotifications();

  if (!isLoaded) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[400px]">
        <LoadingSpinner />
        <p className="text-muted-foreground mt-4">
          <Trans>Loading...</Trans>
        </p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Seo title={t`Notifications - Sign In Required`} noindex />
        <Card>
          <CardHeader>
            <CardTitle>
              <Trans>Sign in required</Trans>
            </CardTitle>
            <CardDescription>
              <Trans>You need to be signed in to manage notifications</Trans>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <Trans>
                Sign in to receive updates about the entities you care about.
              </Trans>
            </p>
            <AuthSignInButton>
              <Button>
                <Trans>Sign In</Trans>
              </Button>
            </AuthSignInButton>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-6">
      <Seo title={t`Notification Settings`} />
      <div>
        <h1 className="text-3xl font-bold mb-2">
          <Trans>Notifications</Trans>
        </h1>
        <p className="text-muted-foreground">
          <Trans>Manage your newsletter and alert subscriptions</Trans>
        </p>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            <Trans>Error loading notifications</Trans>
          </AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              <Trans>
                There was a problem loading your notifications. Please try again.
              </Trans>
            </p>
            {error && (
              <p className="text-xs font-mono">{error.message}</p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-2"
            >
              <Trans>Try Again</Trans>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {!isError && (
        <NotificationList notifications={notifications ?? []} isLoading={isLoading} />
      )}
    </div>
  );
}
