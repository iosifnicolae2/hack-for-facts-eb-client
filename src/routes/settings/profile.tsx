import { createFileRoute } from '@tanstack/react-router';
import { useAuth, AuthSignInButton, AuthSignOutButton } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export const Route = createFileRoute('/settings/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <div className="container mx-auto p-4 max-w-xl flex flex-col items-center justify-center">
      <LoadingSpinner />
      <p className="text-muted-foreground">Loading authentication...</p>
      <p className="text-muted-foreground">If this takes too long, please refresh the page.</p>
    </div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Optional auth: manage your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {isSignedIn && user && (
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarFallback>{(user.firstName?.[0] ?? 'U').toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium">
                  {user.firstName ?? 'User'} {user.lastName ?? ''}
                </div>
                <div className="text-sm text-muted-foreground">{user.email ?? '—'}</div>
              </div>
              <AuthSignOutButton>
                <Button variant="outline">Sign out</Button>
              </AuthSignOutButton>
            </div>
          )}
          {!isSignedIn && (
            <div className="space-y-3">
              <AuthSignInButton>
                <Button>Sign in</Button>
              </AuthSignInButton>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}