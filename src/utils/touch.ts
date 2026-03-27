/**
 * Touch Device Detection Utility
 * Detects mobile and tablet devices using multiple signals
 */

/**
 * Check if the device supports touch events
 */
export const hasTouchEvents = (): boolean => {
  return "ontouchstart" in window || "ontouchend" in document
}

/**
 * Check if the device supports pointer events with touch/pen
 */
export const hasPointerEvents = (): boolean => {
  return window.PointerEvent !== undefined && navigator.maxTouchPoints > 0
}

/**
 * Check via user agent string (mobile/tablet patterns)
 */
export const isMobileUserAgent = (): boolean => {
  const mobileRegex =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i
  return mobileRegex.test(navigator.userAgent)
}

/**
 * Check if device is in a typical mobile/tablet screen size range
 */
export const isMobileScreenSize = (maxWidth = 1024): boolean => {
  return window.matchMedia(`(max-width: ${maxWidth}px)`).matches
}

/**
 * Check for coarse pointer (finger/stylus vs. precise mouse)
 */
export const hasCoarsePointer = (): boolean => {
  return window.matchMedia("(pointer: coarse)").matches
}

/**
 * Comprehensive check — returns true if the device is likely a touch device
 * (mobile or tablet), using multiple heuristics.
 */
export const isTouchDevice = (): boolean => {
  return hasTouchEvents() || hasPointerEvents() || hasCoarsePointer()
}

/**
 * Returns a detailed breakdown of all detection signals.
 */
export const getTouchDeviceInfo = (): {
  isTouchDevice: boolean
  hasTouchEvents: boolean
  hasPointerEvents: boolean
  isMobileUserAgent: boolean
  isMobileScreenSize: boolean
  hasCoarsePointer: boolean
  maxTouchPoints: number
} => {
  return {
    isTouchDevice: isTouchDevice(),
    hasTouchEvents: hasTouchEvents(),
    hasPointerEvents: hasPointerEvents(),
    isMobileUserAgent: isMobileUserAgent(),
    isMobileScreenSize: isMobileScreenSize(),
    hasCoarsePointer: hasCoarsePointer(),
    maxTouchPoints: navigator.maxTouchPoints ?? 0,
  }
}
