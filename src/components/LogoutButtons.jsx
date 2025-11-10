// import { useAuth } from "react-oidc-context"; // COGNITO DISABLED
import { useMockAuth } from "../hooks/useMockAuth"; // Mock auth when Cognito is disabled
import { useState } from "react";

const LogoutButtons = () => {
  const auth = useMockAuth(); // Using mock auth
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    // NO LOGOUT FUNCTIONALITY - Cognito is disabled
    console.log('[Mock] Logout disabled - Cognito authentication is not active');
    return;
  };

  const handleLocalSignOut = () => {
    // NO LOGOUT FUNCTIONALITY - Cognito is disabled
    console.log('[Mock] Local logout disabled - Cognito authentication is not active');
  };

  return (
    <div className="text-center">
      <button
        onClick={handleSignOut}
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-200"
        disabled={loading}
      >
        {loading ? (
          <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        ) : (
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        )}
        {loading ? "Logging out..." : "Sign Out"}
      </button>
    </div>
  );
};

export default LogoutButtons;
