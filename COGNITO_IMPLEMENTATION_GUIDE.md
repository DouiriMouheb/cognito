# AWS Cognito Implementation Guide

This guide explains how to implement the same AWS Cognito authentication system used in this project for other React applications.

## Overview

This implementation uses:
- **AWS Cognito User Pool** for user management
- **react-oidc-context** library for OIDC/OAuth2 authentication
- **React + Vite** for the frontend framework
- **Tailwind CSS** for styling

## Prerequisites

### AWS Setup
1. **AWS Cognito User Pool** configured with:
   - Hosted UI enabled
   - OAuth 2.0 flows configured
   - Custom scopes (if needed)
   - Callback and logout URLs configured

2. **Required AWS Cognito Configuration:**
   - User Pool ID
   - App Client ID
   - App Client Secret (if using confidential client)
   - Cognito Domain
   - Allowed OAuth flows: Authorization code grant
   - Allowed OAuth scopes: openid, email, profile, and custom scopes

## Step-by-Step Implementation

### 1. Project Setup

#### Install Dependencies
```bash
npm install react-oidc-context oidc-client-ts
npm install -D tailwindcss @tailwindcss/vite
```

#### Package.json Dependencies
```json
{
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-oidc-context": "^3.3.0",
    "oidc-client-ts": "^3.3.0",
    "@tailwindcss/vite": "^4.1.11",
    "tailwindcss": "^4.1.11"
  }
}
```

### 2. Environment Configuration

#### Create `.env` file:
```env
# Cognito Configuration
VITE_COGNITO_CLIENT_ID=your-cognito-app-client-id
VITE_COGNITO_CLIENT_SECRET=your-cognito-app-client-secret
VITE_COGNITO_REDIRECT_URI=http://localhost:5173/signin-oidc
VITE_COGNITO_POST_LOGOUT_REDIRECT_URI=http://localhost:5173/signout-oidc
VITE_API_BASE_URL=https://your-api-domain.com
```

#### Create `.env.example` file:
```env
# Cognito Configuration
# Copy this file to .env and fill in your actual values

VITE_COGNITO_CLIENT_ID=your-client-id
VITE_COGNITO_CLIENT_SECRET=your-client-secret
VITE_COGNITO_REDIRECT_URI=http://localhost:5173/signin-oidc
VITE_COGNITO_POST_LOGOUT_REDIRECT_URI=http://localhost:5173/signout-oidc
VITE_API_BASE_URL=https://api.example.com
```

### 3. Vite Configuration

#### vite.config.js:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### 4. Tailwind CSS Setup

#### tailwind.config.js:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Nunito", "sans-serif"],
      },
    },
  },
  plugins: [],
};
```

#### src/index.css:
```css
@import "tailwindcss";

/* Custom styles */
body {
  font-family: "Comfortaa", sans-serif;
  font-weight: 300;
  background-color: #ffffff;
  color: #1f2937;
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

### 5. Main Application Setup

#### src/main.jsx:
```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";
import "./index.css";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.YOUR-REGION.amazonaws.com/YOUR-USER-POOL-ID",
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
  client_secret: import.meta.env.VITE_COGNITO_CLIENT_SECRET,
  redirect_uri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
  post_logout_redirect_uri: import.meta.env.VITE_COGNITO_POST_LOGOUT_REDIRECT_URI,
  response_type: "code",
  scope: "openid email profile aws.cognito.signin.user.admin",
  
  // Configuration for proper logout handling
  automaticSilentRenew: false,
  loadUserInfo: false,
  monitorSession: false,
  filterProtocolClaims: true,
  response_mode: "query",
  revokeTokensOnSignout: true,
};

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
```

### 6. Core Application Component

#### src/App.jsx:
```jsx
import { useAuth } from "react-oidc-context";
import LoadingScreen from "./components/LoadingScreen";
import ErrorScreen from "./components/ErrorScreen";
import LoginScreen from "./components/LoginScreen";
import Dashboard from "./components/Dashboard";
import LogoutSuccess from "./components/LogoutSuccess";

function App() {
  const auth = useAuth();

  // Handle logout callback route
  if (window.location.pathname === "/signout-oidc") {
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

  return <LoginScreen />;
}

export default App;

### 7. Essential Components

#### src/components/LoginScreen.jsx:
```jsx
import { useAuth } from "react-oidc-context";

const LoginScreen = () => {
  const auth = useAuth();

  const handleSignIn = async () => {
    try {
      await auth.signinRedirect();
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account using AWS Cognito
          </p>
        </div>
        <div>
          <button
            onClick={handleSignIn}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign In with Cognito
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
```

#### src/components/LoadingScreen.jsx:
```jsx
const LoadingScreen = ({ message = "Loading...", subtitle = "" }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{message}</h2>
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
      </div>
    </div>
  );
};

export default LoadingScreen;
```

#### src/components/ErrorScreen.jsx:
```jsx
const ErrorScreen = ({ error }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {error?.message || "An error occurred during authentication"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorScreen;
```

#### src/components/LogoutSuccess.jsx:
```jsx
const LogoutSuccess = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 text-green-600 mb-4">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Logged Out Successfully</h2>
        <p className="text-gray-600 mb-4">You have been signed out of your account.</p>
        <a
          href="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
        >
          Sign In Again
        </a>
      </div>
    </div>
  );
};

export default LogoutSuccess;

### 8. Dashboard and User Management

#### src/components/Dashboard.jsx:
```jsx
import { useAuth } from "react-oidc-context";
import UserProfile from "./UserProfile";
import LogoutButtons from "./LogoutButtons";

const Dashboard = ({ user }) => {
  const auth = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
          <p className="text-gray-600">Successfully authenticated with AWS Cognito</p>
        </div>

        {/* User Profile */}
        <UserProfile profile={user?.profile} />

        {/* Logout Section */}
        <div className="text-center mt-8">
          <LogoutButtons />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
```

#### src/components/UserProfile.jsx:
```jsx
const UserProfile = ({ profile }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <h2 className="text-xl font-semibold text-white">User Information</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile?.email && (
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-sm text-gray-900">{profile.email}</p>
              </div>
            </div>
          )}
          {profile?.name && (
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-sm text-gray-900">{profile.name}</p>
              </div>
            </div>
          )}
          {profile?.sub && (
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">User ID</p>
                <p className="text-sm text-gray-900 font-mono">{profile.sub}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

#### src/components/LogoutButtons.jsx:
```jsx
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

    // Direct logout with Cognito hosted UI
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
    const logoutUri = import.meta.env.VITE_COGNITO_POST_LOGOUT_REDIRECT_URI;
    const cognitoDomain = import.meta.env.VITE_COGNITO_AUTHORITY;

    // Redirect to Cognito logout URL with proper parameters
    const logoutUrl = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}&response_type=code`;

    window.location.href = logoutUrl;
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleSignOut}
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Sign Out
      </button>
    </div>
  );
};

export default LogoutButtons;
```

### 9. Protected Routes Component

#### src/components/ProtectedRoute.jsx:
```jsx
import { useAuth } from "react-oidc-context";
import LoadingScreen from "./LoadingScreen";
import LoginScreen from "./LoginScreen";

const ProtectedRoute = ({ children, requiredScopes = [] }) => {
  const auth = useAuth();

  // Show loading while checking authentication
  if (auth.isLoading) {
    return <LoadingScreen message="Checking authentication..." subtitle="Please wait" />;
  }

  // If not authenticated, show login screen
  if (!auth.isAuthenticated) {
    return <LoginScreen />;
  }

  // Check if user has required scopes (optional)
  if (requiredScopes.length > 0) {
    const userScopes = auth.user?.profile?.scope?.split(' ') || [];
    const hasRequiredScopes = requiredScopes.every(scope => userScopes.includes(scope));

    if (!hasRequiredScopes) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have the required permissions to access this page.</p>
          </div>
        </div>
      );
    }
  }

  // User is authenticated and has required scopes
  return children;
};

export default ProtectedRoute;

### 10. API Integration

#### src/services/apiService.js:
```javascript
class ApiService {
  constructor(baseURL = import.meta.env.VITE_API_BASE_URL || 'https://api.example.com') {
    this.baseURL = baseURL;
  }

  // Get the current user's access token
  getAccessToken() {
    const userStr = localStorage.getItem(`oidc.user:${import.meta.env.VITE_COGNITO_AUTHORITY}:${import.meta.env.VITE_COGNITO_CLIENT_ID}`);
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.access_token;
    }
    return null;
  }

  // Get the current user's ID token
  getIdToken() {
    const userStr = localStorage.getItem(`oidc.user:${import.meta.env.VITE_COGNITO_AUTHORITY}:${import.meta.env.VITE_COGNITO_CLIENT_ID}`);
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id_token;
    }
    return null;
  }

  // Make authenticated API request
  async makeRequest(endpoint, options = {}) {
    const accessToken = this.getAccessToken();

    if (!accessToken) {
      throw new Error('No access token available');
    }

    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Convenience methods
  async get(endpoint, options = {}) {
    return this.makeRequest(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    return this.makeRequest(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data, options = {}) {
    return this.makeRequest(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint, options = {}) {
    return this.makeRequest(endpoint, { ...options, method: 'DELETE' });
  }
}

const apiService = new ApiService();
export default apiService;
```

#### src/hooks/useApi.js:
```javascript
import { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import apiService from '../services/apiService';

// Custom hook for making API calls with authentication
export const useApi = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const auth = useAuth();

  const {
    method = 'GET',
    body = null,
    params = {},
    immediate = true,
    dependencies = []
  } = options;

  const execute = async (overrideOptions = {}) => {
    if (!auth.isAuthenticated) {
      setError(new Error('User not authenticated'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiService.makeRequest(endpoint, {
        method,
        body: body ? JSON.stringify(body) : undefined,
        ...overrideOptions
      });
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (immediate && auth.isAuthenticated) {
      execute();
    }
  }, [endpoint, immediate, auth.isAuthenticated, ...dependencies]);

  return { data, loading, error, execute };
};

// Hook for making authenticated requests manually
export const useAuthenticatedRequest = () => {
  const [loading, setLoading] = useState(false);
  const auth = useAuth();

  const makeRequest = async (endpoint, options = {}) => {
    if (!auth.isAuthenticated) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    try {
      const result = await apiService.makeRequest(endpoint, options);
      return result;
    } finally {
      setLoading(false);
    }
  };

  return { makeRequest, loading };
};

// Hook to get user profile and tokens
export const useUserProfile = () => {
  const auth = useAuth();

  return {
    user: auth.user,
    profile: auth.user?.profile,
    accessToken: auth.user?.access_token,
    idToken: auth.user?.id_token,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading
  };
};
```

### 11. AWS Cognito Configuration

#### Required AWS Cognito Settings:

1. **User Pool Configuration:**
   - Enable "Hosted UI"
   - Configure OAuth 2.0 flows: Authorization code grant
   - Set callback URLs: `http://localhost:5173/signin-oidc` (development), `https://yourdomain.com/signin-oidc` (production)
   - Set sign-out URLs: `http://localhost:5173/signout-oidc` (development), `https://yourdomain.com/signout-oidc` (production)

2. **App Client Settings:**
   - Enable "Authorization code grant" flow
   - Enable "Implicit grant" flow (if needed)
   - Configure OAuth scopes: `openid`, `email`, `profile`, `aws.cognito.signin.user.admin`
   - Add custom scopes if needed

3. **Domain Configuration:**
   - Set up a Cognito domain (either custom or Amazon Cognito domain)
   - Note the domain URL for the authority configuration

### 12. Environment-Specific Configuration

#### Development (.env):
```env
VITE_COGNITO_CLIENT_ID=your-dev-client-id
VITE_COGNITO_CLIENT_SECRET=your-dev-client-secret
VITE_COGNITO_REDIRECT_URI=http://localhost:5173/signin-oidc
VITE_COGNITO_POST_LOGOUT_REDIRECT_URI=http://localhost:5173/signout-oidc
VITE_API_BASE_URL=http://localhost:3000
```

#### Production (.env.production):
```env
VITE_COGNITO_CLIENT_ID=your-prod-client-id
VITE_COGNITO_CLIENT_SECRET=your-prod-client-secret
VITE_COGNITO_REDIRECT_URI=https://yourdomain.com/signin-oidc
VITE_COGNITO_POST_LOGOUT_REDIRECT_URI=https://yourdomain.com/signout-oidc
VITE_API_BASE_URL=https://api.yourdomain.com
```

### 13. Usage Examples

#### Basic Authentication Check:
```jsx
import { useAuth } from "react-oidc-context";

function MyComponent() {
  const auth = useAuth();

  if (auth.isLoading) return <div>Loading...</div>;
  if (auth.error) return <div>Error: {auth.error.message}</div>;
  if (!auth.isAuthenticated) return <div>Please log in</div>;

  return <div>Welcome, {auth.user.profile.email}!</div>;
}
```

#### Protected Route Usage:
```jsx
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <ProtectedRoute requiredScopes={['read.all', 'write.all']}>
      <AdminPanel />
    </ProtectedRoute>
  );
}
```

#### API Call with Authentication:
```jsx
import { useApi } from "./hooks/useApi";

function UserData() {
  const { data, loading, error } = useApi('/api/user/profile');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>User: {data?.name}</div>;
}
```

### 14. Deployment Considerations

1. **Environment Variables:**
   - Ensure all VITE_ prefixed environment variables are set in your deployment environment
   - Use different Cognito app clients for different environments (dev, staging, prod)

2. **HTTPS Requirements:**
   - Production deployments must use HTTPS
   - Update Cognito callback URLs to use HTTPS

3. **CORS Configuration:**
   - Configure your API to accept requests from your frontend domain
   - Include proper CORS headers for authentication

4. **Security Best Practices:**
   - Use client secrets in production
   - Implement proper token refresh logic
   - Set appropriate token expiration times
   - Use secure cookie settings if storing tokens in cookies

### 15. Troubleshooting

#### Common Issues:

1. **"Invalid redirect URI" error:**
   - Verify callback URLs in Cognito match your environment variables
   - Ensure URLs include the correct protocol (http/https)

2. **"Access denied" error:**
   - Check OAuth scopes configuration
   - Verify user has required permissions

3. **Token refresh issues:**
   - Implement proper token refresh logic
   - Check token expiration settings

4. **CORS errors:**
   - Configure API CORS settings
   - Verify domain whitelist

#### Debug Tips:
- Enable browser developer tools to inspect network requests
- Check localStorage for OIDC tokens
- Verify environment variables are loaded correctly
- Test with Cognito hosted UI directly

## Conclusion

This implementation provides a complete, production-ready AWS Cognito authentication system for React applications. The modular structure allows for easy customization and extension based on specific project requirements.

Key benefits:
- ✅ Secure OIDC/OAuth2 implementation
- ✅ Automatic token management
- ✅ Protected routes with scope-based access control
- ✅ API integration with automatic token injection
- ✅ Comprehensive error handling
- ✅ Clean logout with proper session cleanup
- ✅ Responsive UI components with Tailwind CSS
```
```
```
```
