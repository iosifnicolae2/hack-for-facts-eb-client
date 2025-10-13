import { useCallback, useEffect, useState, type ReactElement } from "react";
import { Bell } from "lucide-react";
import { Trans } from "@lingui/react/macro";
import { usePersistedState } from "@/lib/hooks/usePersistedState";

interface Props {
  onOpenNotifications: () => void;
}

/**
 * EntityNotificationAnnouncement
 *
 * A one-time announcement banner that informs users about the new notification feature.
 * Displays once per user and provides a quick way to enable notifications.
 */
export function EntityNotificationAnnouncement({ onOpenNotifications }: Props): ReactElement | null {
  const [hasSeenAnnouncement, setHasSeenAnnouncement] = usePersistedState<boolean>(
    'entity-notification-announcement-seen',
    false
  );
  const [isBannerVisible, setBannerVisible] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Only show if user hasn't seen it before
    if (hasSeenAnnouncement) return;

    // Delay showing the banner to avoid disrupting initial page load
    const timer = setTimeout(() => {
      setBannerVisible(true);
      // Trigger entrance animation after a brief delay
      setTimeout(() => setIsEntering(true), 50);
    }, 3000); // 3 second delay (after cookie banner if present)

    return () => clearTimeout(timer);
  }, [hasSeenAnnouncement]);

  const handleDismiss = useCallback(() => {
    setIsEntering(false);
    setIsExiting(true);
    setHasSeenAnnouncement(true);
    // Hide banner after the exit animation completes
    setTimeout(() => setBannerVisible(false), 500);
  }, [setHasSeenAnnouncement]);

  const handleEnableNotifications = useCallback(() => {
    handleDismiss();
    // Small delay to let the banner start exiting before opening the dialog
    setTimeout(() => onOpenNotifications(), 300);
  }, [handleDismiss, onOpenNotifications]);

  if (!isBannerVisible) return null;

  return (
    <div
      className={`fixed bottom-0 left-1/2 -translate-x-1/2 z-40 p-3 md:p-6 max-w-4xl w-full transition-transform duration-500 ease-in-out ${
        isExiting ? "translate-y-full" : isEntering ? "translate-y-0" : "translate-y-full"
      }`}
      role="dialog"
      aria-live="polite"
      aria-label="New feature announcement"
    >
      <div className="rounded-2xl border border-slate-200/30 bg-white/80 shadow-2xl backdrop-blur-lg supports-[backdrop-filter]:bg-white/80">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold md:text-xl text-gray-900">
              <Trans>Monitor this institution</Trans>
            </h2>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            <Trans>
              Get monthly email updates about this institution. Receive alerts when new reports are published, budget changes occur, or important financial data is updated.
            </Trans>
          </p>

          <div className="mt-5 flex flex-col sm:flex-row sm:justify-end gap-3">
            <button
              onClick={handleDismiss}
              className="w-full sm:w-auto rounded-lg py-2 px-5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Trans>Maybe Later</Trans>
            </button>
            <button
              onClick={handleEnableNotifications}
              className="w-full sm:w-auto rounded-lg bg-blue-600 py-2 px-5 text-sm font-medium text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Trans>Subscribe to Updates</Trans>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
