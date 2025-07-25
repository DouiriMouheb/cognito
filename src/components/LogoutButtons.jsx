import { useAuth } from "react-oidc-context";
import { useState } from "react";

const LogoutButtons = () => {
  const auth = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      // Clear local user data first
      await auth.removeUser();

      // Clear browser storage
      sessionStorage.clear();
      localStorage.clear();

      // Clear auth-related cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Redirect to Cognito logout with proper hosted UI domain
      const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
      const logoutUri = import.meta.env.VITE_COGNITO_POST_LOGOUT_REDIRECT_URI;
      const hostedUIDomain = import.meta.env.VITE_COGNITO_HOSTED_UI_DOMAIN || "https://sinergiaiam.auth.eu-south-1.amazoncognito.com";
      const logoutUrl = `${hostedUIDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;

      // Redirect to Cognito logout
      window.location.href = logoutUrl;

      // After redirect, Cognito should send user back to login screen (logoutUri)
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback to local logout if anything fails
      handleLocalSignOut();
    } finally {
      setLoading(false);
    }
  };

  const handleLocalSignOut = () => {
    try {
      sessionStorage.clear();
      localStorage.clear();
      window.location.reload();
    } catch (error) {
      console.error("Local logout error:", error);
      window.location.reload();
    }
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
