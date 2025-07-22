import { useAuth } from "react-oidc-context";
import { useEffect } from "react";
import LoadingScreen from "./components/LoadingScreen";
import ErrorScreen from "./components/ErrorScreen";
import LoginScreen from "./components/LoginScreen";
import Dashboard from "./components/Dashboard";
import LogoutSuccess from "./components/LogoutSuccess";
import { SecurityValidator } from "./utils/security";

function App() {
  const auth = useAuth();

  // Silent security initialization
  useEffect(() => {
    // Initialize security monitoring silently
    SecurityValidator.checkSuspiciousActivity();

    // Clear any old sensitive data on app start
    SecurityValidator.clearSensitiveData();
  }, []);

  // Handle logout callback route
  if (window.location.pathname === "/signout-oidc") {
    // Clear URL parameters to prevent issues
    if (window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    return <LogoutSuccess />;
  }

  // Authentication state handling
  if (auth.isLoading) {
    return <LoadingScreen message="Loading..." subtitle="Authenticating with AWS Cognito" />;
  }

  if (auth.error) {
    console.error("Authentication error:", auth.error);
    return <ErrorScreen error={auth.error} />;
  }

  if (auth.isAuthenticated) {
    return <Dashboard user={auth.user} />;
  }

  // Not authenticated - show login screen
  return <LoginScreen />;
}

export default App;
