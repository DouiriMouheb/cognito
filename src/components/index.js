// Component exports for better organization

// Individual component exports (for backward compatibility)
export { default as LoadingScreen } from './LoadingScreen';
export { default as ErrorScreen } from './ErrorScreen';
export { default as LoginScreen } from './LoginScreen';
export { default as Dashboard } from './Dashboard';
export { default as LogoutSuccess } from './LogoutSuccess';
export { default as UserProfile } from './UserProfile';
export { default as LogoutButtons } from './LogoutButtons';
export { default as ProtectedRoute } from './ProtectedRoute';
export { default as UserDashboard } from './UserDashboard';

// Organized category exports
export * from './auth';
export * from './ui';
export * from './layout';
