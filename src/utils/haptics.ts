/**
 * Utility helper for web haptic feedback and vibrations
 */
export type HapticType = 'light' | 'medium' | 'success' | 'save' | 'warning' | 'error';

export const triggerHaptic = (type: HapticType = 'save') => {
  if (
    typeof window !== 'undefined' &&
    'navigator' in window &&
    typeof window.navigator.vibrate === 'function'
  ) {
    try {
      switch (type) {
        case 'light':
          window.navigator.vibrate(15);
          break;
        case 'medium':
          window.navigator.vibrate(30);
          break;
        case 'save':
        case 'success':
          // Subtle double-pulse confirmation pattern
          window.navigator.vibrate([25, 35, 30]);
          break;
        case 'warning':
        case 'error':
          // Quick triple-buzz for validation error or alert
          window.navigator.vibrate([50, 40, 50, 40, 50]);
          break;
      }
    } catch {
      // Ignore vibration errors if blocked by browser policies
    }
  }
};
