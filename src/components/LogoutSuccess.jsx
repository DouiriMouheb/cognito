import { useAuth } from "react-oidc-context";
import { useEffect, useState } from "react";

const LogoutSuccess = () => {
  const auth = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Prevent multiple redirects
    if (redirecting) return;

 

    // Clear any remaining data (just to be sure)
    try {
      auth.removeUser();
    } catch (error) {
      console.log("Error removing user:", error);
    }

    sessionStorage.clear();
    localStorage.clear();

    // Clear any cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Set redirecting state to prevent multiple calls
    setRedirecting(true);

    // Redirect to home after a brief delay
    const timer = setTimeout(() => {

      // Use replace instead of href to avoid history issues
      window.location.replace('/');
    }, 1500);

    return () => clearTimeout(timer);
  }, []); // Remove dependencies to prevent re-runs

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        {/* Success checkmark with bounce animation */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 animate-bounce">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-3">Successfully Signed Out! 🎉</h2>
        <p className="text-gray-600 mb-8">You have been securely logged out from AWS Cognito</p>

        {/* Spinner with redirect message */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="text-gray-700 font-medium text-lg">Redirecting...</span>
          </div>

          {/* Animated dots */}
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1500 ease-out animate-pulse"
               style={{width: '100%'}}></div>
        </div>

        {/* Small help text */}
        <p className="text-sm text-gray-500">
          Taking you back to the home page...
        </p>
      </div>
    </div>
  );
};

export default LogoutSuccess;
