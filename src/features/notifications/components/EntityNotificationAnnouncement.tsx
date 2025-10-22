import { useCallback, useEffect, useState, type ReactElement } from "react";
import { Bell } from "lucide-react";
import { Trans } from "@lingui/react/macro";
import { usePersistedState } from "@/lib/hooks/usePersistedState";
import { useNotificationModal } from "../hooks/useNotificationModal";

/**
 * EntityNotificationAnnouncement
 *
 * A one-time announcement banner that informs users about the new notification feature.
 * Displays once per user and provides a quick way to enable notifications.
 */
export function EntityNotificationAnnouncement(): ReactElement | null {
  const [hasSeenAnnouncement, setHasSeenAnnouncement] = usePersistedState<boolean>(
    'entity-notification-announcement-seen',
    false
  );
  const [isBannerVisible, setBannerVisible] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const { openModal, isOpen } = useNotificationModal();

  useEffect(() => {
    // If the notifications modal is already open via query (?notificationModal=open),
    // mark the announcement as seen and do not show the banner.
    if (!hasSeenAnnouncement && isOpen) {
      setHasSeenAnnouncement(true);
      setBannerVisible(false);
      return;
    }

    // Only show if user hasn't seen it before
    if (hasSeenAnnouncement) return;

    // Delay showing the banner to avoid disrupting initial page load
    const timer = setTimeout(() => {
      // Check if cookie consent has been set (banner closed)
      const hasCookieConsent = typeof window !== 'undefined' && !!window.localStorage.getItem('cookie-consent');

      if (hasCookieConsent) {
        setBannerVisible(true);
        // Trigger entrance animation after a brief delay
        setTimeout(() => setIsEntering(true), 50);
      }
    }, 3000); // 3 second delay

    return () => clearTimeout(timer);
  }, [hasSeenAnnouncement, isOpen, setHasSeenAnnouncement]);

  const handleDismiss = useCallback(() => {
    setIsEntering(false);
    setIsExiting(true);
    setHasSeenAnnouncement(true);
    // Hide banner after the exit animation completes
    setTimeout(() => setBannerVisible(false), 500);
  }, [setHasSeenAnnouncement]);

  const handleEnableNotifications = useCallback(() => {
    handleDismiss();
    openModal();
  }, [handleDismiss, openModal]);

  if (!isBannerVisible) return null;

  return (
    <>
      <style>{`
        @keyframes gentle-ring {
          0% { transform: rotate(0); }
          10% { transform: rotate(10deg); }
          20% { transform: rotate(-10deg); }
          30% { transform: rotate(10deg); }
          40% { transform: rotate(-10deg); }
          50% { transform: rotate(0); }
          100% { transform: rotate(0); }
        }
        .animate-gentle-ring {
          animation: gentle-ring 2.5s ease-in-out;
          transform-origin: top center;
          animation-delay: 0.5s;
        }
      `}</style>
      <div
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 p-3 md:p-6 max-w-4xl w-full transition-transform duration-500 ease-in-out z-50 ${isExiting ? "translate-y-full" : isEntering ? "translate-y-0" : "translate-y-full"
          }`}
        role="dialog"
        aria-live="polite"
        aria-label="New feature announcement"
      >
        <div className="rounded-2xl border border-slate-200/30 bg-white/80 shadow-2xl backdrop-blur-lg supports-[backdrop-filter]:bg-white/80">
          <div className="p-6">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-blue-600 animate-gentle-ring" />
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
    </>
  );
}
