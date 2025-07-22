// Type definitions and interfaces for better development
// These are JSDoc type definitions for better IDE support

/**
 * @typedef {Object} User
 * @property {string} sub - User ID
 * @property {string} email - User email
 * @property {string} name - User name
 * @property {string} phone_number - User phone
 * @property {string} scope - User scopes
 * @property {boolean} email_verified - Email verification status
 * @property {string} aud - Audience
 * @property {string} iss - Issuer
 * @property {number} exp - Expiration time
 * @property {number} iat - Issued at time
 */

/**
 * @typedef {Object} AuthState
 * @property {boolean} isAuthenticated - Authentication status
 * @property {boolean} isLoading - Loading state
 * @property {User|null} user - User object
 * @property {Error|null} error - Error object
 * @property {string|null} access_token - Access token
 * @property {string|null} id_token - ID token
 * @property {string|null} refresh_token - Refresh token
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Request success status
 * @property {any} data - Response data
 * @property {string|null} error - Error message
 * @property {number} status - HTTP status code
 * @property {Object} headers - Response headers
 */

/**
 * @typedef {Object} SecurityValidation
 * @property {boolean} valid - Validation result
 * @property {string|null} reason - Validation failure reason
 * @property {Object|null} decoded - Decoded token data
 */

/**
 * @typedef {Object} ComponentProps
 * @property {React.ReactNode} children - Child components
 * @property {string} className - CSS class name
 * @property {Object} style - Inline styles
 */

/**
 * @typedef {Object} ProtectedRouteProps
 * @property {React.ReactNode} children - Child components
 * @property {string[]} requiredScopes - Required user scopes
 * @property {boolean} enableSecurityValidation - Enable security checks
 */

/**
 * @typedef {Object} LoadingScreenProps
 * @property {string} message - Loading message
 * @property {string} subtitle - Loading subtitle
 */

/**
 * @typedef {Object} ErrorScreenProps
 * @property {Error} error - Error object
 * @property {Function} onRetry - Retry function
 * @property {boolean} showDetails - Show error details
 */

/**
 * @typedef {Object} ApiServiceConfig
 * @property {string} baseURL - API base URL
 * @property {number} timeout - Request timeout
 * @property {Object} headers - Default headers
 * @property {number} retryAttempts - Retry attempts
 */

/**
 * @typedef {Object} SecurityConfig
 * @property {boolean} enableTokenValidation - Enable token validation
 * @property {boolean} enableSessionMonitoring - Enable session monitoring
 * @property {boolean} enableSuspiciousActivityDetection - Enable activity detection
 * @property {number} tokenRefreshBuffer - Token refresh buffer time
 */

/**
 * @typedef {Object} UIConfig
 * @property {string} theme - UI theme
 * @property {string} language - UI language
 * @property {boolean} animations - Enable animations
 * @property {number} toastDuration - Toast duration
 */

/**
 * @typedef {Object} UserPreferences
 * @property {string} theme - User theme preference
 * @property {string} language - User language preference
 * @property {boolean} notifications - Notification preference
 * @property {Object} dashboard - Dashboard preferences
 */

// Export types for JSDoc usage
export const Types = {
  User: 'User',
  AuthState: 'AuthState',
  ApiResponse: 'ApiResponse',
  SecurityValidation: 'SecurityValidation',
  ComponentProps: 'ComponentProps',
  ProtectedRouteProps: 'ProtectedRouteProps',
  LoadingScreenProps: 'LoadingScreenProps',
  ErrorScreenProps: 'ErrorScreenProps',
  ApiServiceConfig: 'ApiServiceConfig',
  SecurityConfig: 'SecurityConfig',
  UIConfig: 'UIConfig',
  UserPreferences: 'UserPreferences',
};

export default Types;
