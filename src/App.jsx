
// import { useAuth } from "react-oidc-context"; // COGNITO DISABLED
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import LoadingScreen from "./components/LoadingScreen";
import ErrorScreen from "./components/ErrorScreen";
import LoginScreen from "./components/LoginScreen";
import Dashboard from "./components/Dashboard";
import LogoutSuccess from "./components/LogoutSuccess";
import { SecurityValidator } from "./utils/security";

function App() {
  // COGNITO AUTHENTICATION DISABLED - Mock auth for development
  const auth = {
    isLoading: false,
    isAuthenticated: true, // Always authenticated when Cognito is disabled
    user: null,
    error: null
  };

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /* COGNITO CODE COMMENTED OUT
  const auth = useAuth();

  // Silent security initialization
  useEffect(() => {
    // Initialize security monitoring silently
    SecurityValidator.checkSuspiciousActivity();

    // Clear any old sensitive data on app start
    SecurityValidator.clearSensitiveData();
  }, []);

  // Detect logout process
  useEffect(() => {
    // Check if we're in the middle of a logout process
    const isLogoutInProgress = localStorage.getItem('logout_in_progress');
    if (isLogoutInProgress) {
      setIsLoggingOut(true);
    }

    // If user is authenticated, always reset isLoggingOut and clear flag
    if (!auth.isLoading && auth.isAuthenticated && isLoggingOut) {
      localStorage.removeItem('logout_in_progress');
      setIsLoggingOut(false);
    }

    // Listen for authentication state changes
    if (!auth.isLoading && !auth.isAuthenticated && isLoggingOut) {
      // Logout completed, clear the flag
      localStorage.removeItem('logout_in_progress');
      setIsLoggingOut(false);
    }
  }, [auth.isLoading, auth.isAuthenticated, isLoggingOut]);

  // Handle logout callback route
  if (window.location.pathname === "/signout-oidc") {
    // Clear URL parameters to prevent issues
    if (window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    return <LogoutSuccess />;
  }



  // Never show loading screen if authenticated
  if (auth.isAuthenticated) {
    // If on /login, redirect to /timesheets
    if (window.location.pathname === '/login') {
      window.location.replace('/timesheets');
      return null;
    }
  } else {
    if ((auth.isLoading && !isLoggingOut) || isLoggingOut) {
      const message = isLoggingOut ? "Signing out..." : "Loading...";
      const subtitle = isLoggingOut ? "Please wait while we sign you out" : "Authenticating with AWS Cognito";
      return <LoadingScreen message={message} subtitle={subtitle} />;
    }
  }

  if (auth.error) {
    console.error("Authentication error:", auth.error);
    return <ErrorScreen error={auth.error} />;
  }
  */



  return (
    <>
      <Router>
        <Routes>
          {/* NO LOGIN REQUIRED - Direct access to dashboard */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/*" element={<Dashboard />} />
        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;
