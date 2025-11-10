// import { useAuth } from "react-oidc-context"; // COGNITO DISABLED
import { useMockAuth } from "../hooks/useMockAuth"; // Mock auth when Cognito is disabled

const ErrorScreen = ({ error }) => {
  const auth = useMockAuth(); // Using mock auth

  const clearAuthState = () => {
    // Clear all authentication state (disabled for mock auth)
    console.log('[Mock] clearAuthState called - Cognito is disabled');
    // auth.removeUser();
    sessionStorage.clear();
    localStorage.clear();
    // Remove URL parameters and reload
    window.history.replaceState({}, document.title, window.location.pathname);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Error</h3>
          <p className="text-sm text-gray-500 mb-4">{error.message}</p>
          
          {/* Common error scenarios */}
          {error.message.includes("No matching state") && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
              <p className="text-xs text-yellow-800">
                This usually happens when the page was refreshed during login or the session expired.
              </p>
            </div>
          )}
          
          {error.message.includes("Failed to fetch") && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
              <p className="text-xs text-yellow-800">
                Network or configuration issue. Check your internet connection and Cognito settings.
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <button
              onClick={clearAuthState}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Clear State & Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Go to Home
            </button>
          </div>
          
          {/* Debug info */}
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
              Show technical details
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
              {JSON.stringify(error, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
};

export default ErrorScreen;
