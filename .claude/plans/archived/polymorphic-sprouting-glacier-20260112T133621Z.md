# Plan: Remove Unfinished Feature Text & Add Feedback FAB

## Summary
1. Remove certificate text from onboarding/login (keep routes)
2. Remove "AI Assistant" and "Documentation" from ChatFab help menu
3. Add a dedicated floating feedback button (FAB)

---

## Task 1: Remove Certificate Text

### Files to Modify

**`src/features/learning/components/onboarding/LearningOnboarding.tsx:153`**
- Change: `"Personalized paths, interactive lessons, and verified certificates."`
- To: `"Personalized paths and interactive lessons."`

**`src/features/learning/components/layout/LoginBanner.tsx:22`**
- Change: `"Sign in to track your learning journey and earn certificates."`
- To: `"Sign in to track your learning journey."`

### Post-Change
- Run `yarn i18n:extract` to update .po files
- Run `yarn i18n:compile` to compile translations

---

## Task 2: Remove AI Assistant & Documentation from ChatFab

### File to Modify
**`src/components/footer/ChatFab.tsx`**

Remove these menu items from `helpActions` array (lines ~70-81):
```typescript
// REMOVE:
{ type: 'link', label: t`Read Documentation`, icon: BookOpen, href: '/docs' },
{ type: 'link', label: t`Ask AI Assistant`, icon: Bot, href: 'https://chatgpt.com/g/g-688a4179389c8191955464fd497b7c5b-transparenta-eu' },
```

Also remove:
- `BookOpen` and `Bot` from lucide-react imports
- The separator after these items (if any)

---

## Task 3: Add Dedicated Feedback FAB

### Approach
Create a new `FeedbackFab` component - a simple floating action button that directly triggers Sentry feedback dialog on click.

### New Component
**`src/components/feedback/FeedbackFab.tsx`**

```typescript
// Floating feedback button with:
// - Fixed position bottom-right (offset from ChatFab)
// - MessageSquare icon with "Feedback" label
// - Accessible: aria-label, keyboard focusable
// - Uses useSendFeedback() hook
// - Only renders if Sentry consent granted
```

### Design Specifications
- Position: `fixed bottom-20 right-6` (above ChatFab)
- Style: Secondary/outline variant, pill shape with icon + text
- Icon: `MessageSquare` from lucide-react
- Text: "Feedback" (translatable)
- Accessibility: `aria-label`, proper focus states
- Mobile: Same position, responsive sizing

### Integration
**`src/components/app/app-shell.tsx`**
- Import and render `FeedbackFab` alongside `ChatFab`

---

## Files Changed Summary

| File | Change |
|------|--------|
| `src/features/learning/components/onboarding/LearningOnboarding.tsx` | Remove "certificates" from welcome text |
| `src/features/learning/components/layout/LoginBanner.tsx` | Remove "certificates" from login prompt |
| `src/components/footer/ChatFab.tsx` | Remove Doc & AI menu items |
| `src/components/feedback/FeedbackFab.tsx` | **NEW** - Feedback FAB component |
| `src/components/app/app-shell.tsx` | Add FeedbackFab to layout |

---

## Verification

1. Run `yarn typecheck` - ensure no type errors
2. Run `yarn i18n:extract && yarn i18n:compile` - update translations
3. Manual testing:
   - Visit learning onboarding page - confirm no certificate text
   - Check login banner - confirm no certificate text
   - Open ChatFab menu - confirm only 4 items (no AI/Doc)
   - Click Feedback FAB - confirm Sentry dialog opens
   - Test keyboard navigation on Feedback FAB
