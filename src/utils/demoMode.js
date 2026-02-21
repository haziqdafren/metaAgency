/**
 * Demo Mode Utilities
 * Detects if the user is in demo mode and prevents data modifications
 */

const DEMO_ADMIN_EMAIL = 'admin@metaagency.id';

/**
 * Check if the current user is the demo admin
 * @param {Object} profile - User profile from authStore
 * @returns {boolean}
 */
export const isDemoMode = (profile) => {
  if (!profile) return false;
  return profile.email === DEMO_ADMIN_EMAIL && profile.role === 'admin';
};

/**
 * Get a user-friendly message for demo mode restrictions
 * @returns {string}
 */
export const getDemoModeMessage = () => {
  return '🎨 Demo Mode: Data modifications are disabled in this preview. This is a read-only demonstration.';
};

/**
 * Show demo mode notification (to be used with a toast/notification system)
 * @param {Function} showToast - Toast notification function
 */
export const showDemoRestriction = (showToast) => {
  if (showToast) {
    showToast({
      type: 'info',
      message: getDemoModeMessage(),
      duration: 4000
    });
  } else {
    alert(getDemoModeMessage());
  }
};

/**
 * Wrapper function to prevent action in demo mode
 * @param {boolean} isDemo - Whether in demo mode
 * @param {Function} action - Action to execute if not in demo mode
 * @param {Function} onRestricted - Callback when action is restricted
 */
export const withDemoCheck = (isDemo, action, onRestricted) => {
  if (isDemo) {
    if (onRestricted) onRestricted();
    return false;
  }
  if (action) action();
  return true;
};
