import { t } from '@lingui/core/macro'
import { LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth, AuthSignInButton } from '@/lib/auth'

export function LoginBanner() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded || isSignedIn) {
    return null
  }

  return (
    <div className="mx-auto max-w-3xl px-6 lg:px-10 pt-6 lg:pt-8">
      <div className="relative overflow-hidden rounded-2xl border border-blue-100 dark:border-blue-900/50 bg-gradient-to-r from-blue-50/80 to-white dark:from-blue-950/30 dark:to-zinc-950/30 p-1 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 sm:p-5 relative z-10">
          <div className="flex-1 text-center sm:text-left space-y-1">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              {t`Save your progress`}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
              {t`Sign in to track your learning journey and earn certificates.`}
            </p>
          </div>
          <AuthSignInButton>
            <Button size="sm" className="shrink-0 rounded-xl font-bold shadow-lg shadow-blue-600/20 bg-blue-600 hover:bg-blue-700 text-white border-none">
              <LogIn className="mr-2 h-3.5 w-3.5" />
              {t`Sign In`}
            </Button>
          </AuthSignInButton>
        </div>

        {/* Decorative background */}
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl" />
        <div className="absolute -left-6 -bottom-6 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl" />
      </div>
    </div>
  )
}
