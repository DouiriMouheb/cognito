import { useAuth } from "react-oidc-context";
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import LoadingScreen from "./components/LoadingScreen";
import ErrorScreen from "./components/ErrorScreen";
import LoginScreen from "./components/LoginScreen";
import Dashboard from "./components/Dashboard";
import LogoutSuccess from "./components/LogoutSuccess";
import { SecurityValidator } from "./utils/security";

function App() {
  const auth = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  // Authentication state handling
  if (auth.isLoading || isLoggingOut) {
    const message = isLoggingOut ? "Signing out..." : "Loading...";
    const subtitle = isLoggingOut ? "Please wait while we sign you out" : "Authenticating with AWS Cognito";
    return <LoadingScreen message={message} subtitle={subtitle} />;
  }

  if (auth.error) {
    console.error("Authentication error:", auth.error);
    return <ErrorScreen error={auth.error} />;
  }

  if (auth.isAuthenticated) {
    return (
      <>
        <Router>
          <Routes>
            <Route path="/*" element={<Dashboard />} />
          </Routes>
        </Router>
        <Toaster />
      </>
    );
  }

  // Not authenticated - show login screen
  return (
    <>
      <LoginScreen />
      <Toaster />
    </>
  );
}

export default App;
