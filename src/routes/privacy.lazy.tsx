import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/privacy')({
  component: PrivacyPage,
})

function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <h1 className="text-2xl font-semibold mb-3">Privacy Policy</h1>
      <p className="text-muted-foreground">This is a placeholder. Add your detailed privacy policy content here.</p>
    </div>
  )
}


