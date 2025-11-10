// import { useAuth } from "react-oidc-context"; // COGNITO DISABLED
import { useMockAuth } from "../hooks/useMockAuth"; // Mock auth when Cognito is disabled
import LoadingScreen from "./LoadingScreen";
import LoginScreen from "./LoginScreen";
import { SecurityValidator } from "../utils/security";

const ProtectedRoute = ({ children, requiredScopes = [] }) => {
  // NO AUTHENTICATION - Cognito is disabled, always allow access
  // const auth = useMockAuth();
  
  /* COGNITO PROTECTION CODE COMMENTED OUT
  // Show loading while checking authentication
  if (auth.isLoading) {
    return <LoadingScreen message="Checking authentication..." subtitle="Please wait" />;
  }

  // If not authenticated, show login screen
  if (!auth.isAuthenticated) {
    return <LoginScreen />;
  }

  // Silent token validation (no user notification unless critical)
  if (auth.user) {
    const sessionValidation = SecurityValidator.validateSession(auth.user);
    if (!sessionValidation.valid) {
      // Silently redirect to login if session is invalid
      setTimeout(() => auth.signinRedirect(), 100);
      return <LoadingScreen message="Refreshing session..." subtitle="Please wait" />;
    }
  }

  // Check if user has required scopes
  if (requiredScopes.length > 0) {
    const hasRequiredScopes = SecurityValidator.hasRequiredScopes(
      auth.user?.profile?.scope?.split(' ') || [],
      requiredScopes
    );

    if (!hasRequiredScopes) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-sm text-gray-500 mb-4">
              You don't have the required permissions to access this resource.
            </p>
            <p className="text-xs text-gray-400 mb-4">
              Required scopes: {requiredScopes.join(', ')}
            </p>
            <button
              onClick={() => auth.signoutRedirect()}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      );
    }
  }
  */

  // User is always "authenticated" when Cognito is disabled - just render children
  return children;
};

export default ProtectedRoute;
