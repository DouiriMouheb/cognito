// Application Constants

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
};

// Cognito Configuration
export const COGNITO_CONFIG = {
  AUTHORITY: import.meta.env.VITE_COGNITO_AUTHORITY,
  HOSTED_UI_DOMAIN: import.meta.env.VITE_COGNITO_HOSTED_UI_DOMAIN,
  CLIENT_ID: import.meta.env.VITE_COGNITO_CLIENT_ID,
  CLIENT_SECRET: import.meta.env.VITE_COGNITO_CLIENT_SECRET,
  REDIRECT_URI: import.meta.env.VITE_COGNITO_REDIRECT_URI,
  POST_LOGOUT_REDIRECT_URI: import.meta.env.VITE_COGNITO_POST_LOGOUT_REDIRECT_URI,
};

// Application Routes
export const ROUTES = {
  HOME: '/',
  SIGNIN_CALLBACK: '/signin-oidc',
  SIGNOUT_CALLBACK: '/signout-oidc',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
};

// UI Constants
export const UI_CONFIG = {
  LOADING_DELAY: 300, // ms
  TOAST_DURATION: 5000, // ms
  ANIMATION_DURATION: 200, // ms
};

// Security Constants
export const SECURITY_CONFIG = {
  TOKEN_REFRESH_BUFFER: 300, // 5 minutes in seconds
  SESSION_CHECK_INTERVAL: 30000, // 30 seconds
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 900000, // 15 minutes in ms
};

// User Scopes
export const USER_SCOPES = {
  ADMIN: 'https://web.sinergia.cloud/insideep',
  READ_ALL: 'https://web.sinergia.cloud/read.all',
  WRITE_ALL: 'https://web.sinergia.cloud/write.all',
  CHANGE_PASSWORD: 'https://web.sinergia.cloud/change-password',
  RT: 'https://web.sinergia.cloud/rt',
  EMAIL: 'email',
  PROFILE: 'profile',
  PHONE: 'phone',
  OPENID: 'openid',
  COGNITO_ADMIN: 'aws.cognito.signin.user.admin',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_FAILED: 'Authentication failed. Please try again.',
  TOKEN_EXPIRED: 'Your session has expired. Please sign in again.',
  ACCESS_DENIED: 'You don\'t have permission to access this resource.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
  LOGOUT_FAILED: 'Logout failed. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully signed in!',
  LOGOUT_SUCCESS: 'Successfully signed out!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_ATTEMPTS: 'auth_attempts',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Theme Configuration
export const THEME_CONFIG = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

export default {
  API_CONFIG,
  COGNITO_CONFIG,
  ROUTES,
  UI_CONFIG,
  SECURITY_CONFIG,
  USER_SCOPES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS,
  THEME_CONFIG,
};
