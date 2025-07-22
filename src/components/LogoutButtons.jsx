import { useAuth } from "react-oidc-context";

const LogoutButtons = () => {
  const auth = useAuth();

  const handleSignOut = () => {

    auth.removeUser();
    sessionStorage.clear();
    localStorage.clear();
    
    // Clear any auth-related cookies if they exist
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Direct logout with Cognito hosted UI (more reliable)
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
    const logoutUri = import.meta.env.VITE_COGNITO_POST_LOGOUT_REDIRECT_URI;
    const cognitoDomain = import.meta.env.VITE_COGNITO_AUTHORITY;
    
   
    
    // Redirect to Cognito logout URL with proper parameters
    const logoutUrl = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}&response_type=code`;

    window.location.href = logoutUrl;
  };

  const handleLocalSignOut = () => {
    
    auth.removeUser();
    sessionStorage.clear();
    localStorage.clear();
    // Clear cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    // Force page reload to reset state
    window.location.reload();
  };

  return (
    <div className="text-center space-y-3">
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={handleSignOut}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Full Sign Out
        </button>
        <button
          onClick={handleLocalSignOut}
          className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear Local Data
        </button>
      </div>
      <div className="text-xs text-gray-500 space-y-1">
        <p><strong>Full Sign Out:</strong> Clears local data + signs out from AWS Cognito</p>
        <p><strong>Clear Local Data:</strong> Only clears browser data (faster)</p>
      </div>
    </div>
  );
};

export default LogoutButtons;
