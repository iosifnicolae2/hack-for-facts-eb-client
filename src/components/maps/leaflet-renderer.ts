const IOS_DEVICE_USER_AGENT_PATTERN = /iPad|iPhone|iPod/i;

/**
 * Leaflet's Canvas renderer can hit teardown races on iOS WebKit-based browsers
 * when route transitions happen quickly. Prefer SVG there for stability.
 */
export function shouldUseCanvasRenderer(): boolean {
  if (typeof navigator === 'undefined') {
    return true;
  }

  const userAgent = navigator.userAgent ?? '';
  const isClassicIosDevice = IOS_DEVICE_USER_AGENT_PATTERN.test(userAgent);
  const isIpadOsDesktopMode =
    navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;

  return !(isClassicIosDevice || isIpadOsDesktopMode);
}
