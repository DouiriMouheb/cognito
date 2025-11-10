

## Project Overview

This guide is based on a production-ready React application that implements AWS Cognito authentication using the OIDC (OpenID Connect) protocol. The application demonstrates:

- **Secure OAuth 2.0 authentication** with AWS Cognito User Pools
- **Cognito User ID to Internal User ID mapping** for backend integration
- **Enhanced security features** including token validation and suspicious activity monitoring
- **Comprehensive logout handling** with proper token cleanup
- **Caching mechanisms** for improved performance
- **Error handling and user feedback**

## Architecture & Authentication Flow

### Authentication Flow
```
1. User visits protected route → Redirected to /login
2. User clicks "Sign In" → Redirected to AWS Cognito Hosted UI
3. User authenticates → Cognito redirects back with authorization code
4. react-oidc-context exchanges code for tokens
5. Application validates tokens and user session
6. User ID mapping: Cognito Sub → Internal User ID
7. User gains access to protected routes
```

### Key Components
- **AuthProvider**: Wraps the entire app with OIDC context
- **LoginScreen**: Handles sign-in initiation
- **LogoutButtons**: Manages sign-out process
- **ProtectedRoute**: Route protection middleware
- **UserService**: Handles Cognito to Internal ID mapping
- **SecurityValidator**: Token validation and security monitoring

## Prerequisites & AWS Setup

### AWS Cognito Configuration

1. **Create a User Pool**:
   - Go to AWS Cognito → User Pools → Create User Pool
   - Configure sign-in options (email, username, etc.)
   - Set password policies and MFA requirements

2. **Configure App Client**:
   ```
   App client name: your-app-client
   App client type: Confidential client
   Authentication flows: 
     ✓ Authorization code grant
     ✓ Allow refresh token auth flow
   ```

3. **Hosted UI Configuration**:
   ```
   Allowed callback URLs:
     - http://localhost:5173/signin-oidc (development)
     - https://yourdomain.com/signin-oidc (production)
   
   Allowed sign-out URLs:
     - http://localhost:5173/signout-oidc (development)
     - https://yourdomain.com/signout-oidc (production)
   
   OAuth 2.0 grant types:
     ✓ Authorization code grant
   
   OpenID Connect scopes:
     ✓ openid
     ✓ email
     ✓ profile
     ✓ Custom scopes (if needed)
   ```

4. **Custom Scopes** (Optional):
   ```
   - https://web.yourdomain.com/read.all
   - https://web.yourdomain.com/write.all
   - https://web.yourdomain.com/change-password
   ```

## Project Setup & Dependencies

### Install Required Dependencies

```bash
npm install react-oidc-context oidc-client-ts react-router-dom react-hot-toast lucide-react
npm install -D tailwindcss @tailwindcss/vite
```

### Package.json Configuration

```json
{
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-oidc-context": "^3.3.0",
    "oidc-client-ts": "^3.3.0",
    "react-router-dom": "^7.7.0",
    "react-hot-toast": "^2.5.2",
    "lucide-react": "^0.525.0"
  }
}
```

## Core Authentication Implementation

### 1. Main Entry Point (main.jsx)

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";
import "./index.css";

const cognitoAuthConfig = {
  authority: import.meta.env.VITE_COGNITO_AUTHORITY,
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
  client_secret: import.meta.env.VITE_COGNITO_CLIENT_SECRET,
  redirect_uri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
  post_logout_redirect_uri: import.meta.env.VITE_COGNITO_POST_LOGOUT_REDIRECT_URI,
  response_type: "code",
  scope: "aws.cognito.signin.user.admin email openid phone profile", // Add your custom scopes
  
  // Enhanced configuration for proper logout handling
  automaticSilentRenew: false, // Disable to prevent logout conflicts
  loadUserInfo: false,
  monitorSession: false, // Disable to prevent logout issues
  filterProtocolClaims: true,
  response_mode: "query",
  revokeTokensOnSignout: true, // Ensures tokens are revoked on signout
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

### 2. App Component with Route Protection

```jsx
import { useAuth } from "react-oidc-context";
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
  const auth = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Silent security initialization
  useEffect(() => {
    SecurityValidator.checkSuspiciousActivity();
    SecurityValidator.clearSensitiveData();
  }, []);

  // Detect logout process
  useEffect(() => {
    const isLogoutInProgress = localStorage.getItem('logout_in_progress');
    if (isLogoutInProgress) {
      setIsLoggingOut(true);
    }

    if (!auth.isLoading && auth.isAuthenticated && isLoggingOut) {
      localStorage.removeItem('logout_in_progress');
      setIsLoggingOut(false);
    }

    if (!auth.isLoading && !auth.isAuthenticated && isLoggingOut) {
      localStorage.removeItem('logout_in_progress');
      setIsLoggingOut(false);
    }
  }, [auth.isLoading, auth.isAuthenticated, isLoggingOut]);

  // Handle logout callback route
  if (window.location.pathname === "/signout-oidc") {
    if (window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    return <LogoutSuccess />;
  }

  // Redirect authenticated users from login page
  if (auth.isAuthenticated && window.location.pathname === '/login') {
    window.location.replace('/dashboard');
    return null;
  }

  // Show loading screen
  if ((auth.isLoading && !isLoggingOut) || isLoggingOut) {
    const message = isLoggingOut ? "Signing out..." : "Loading...";
    const subtitle = isLoggingOut ? "Please wait while we sign you out" : "Authenticating with AWS Cognito";
    return <LoadingScreen message={message} subtitle={subtitle} />;
  }

  if (auth.error) {
    console.error("Authentication error:", auth.error);
    return <ErrorScreen error={auth.error} />;
  }

  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={
            auth.isAuthenticated ? <Navigate to="/" replace /> : <LoginScreen />
          } />
          <Route path="/*" element={
            auth.isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
          } />
        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;
```

### 3. Enhanced Authentication Hook (useSecureAuth.js)

```javascript
import { useAuth } from 'react-oidc-context';
import { useEffect, useState } from 'react';
import { SecurityValidator, SecurityLogger } from '../utils/security';

export const useSecureAuth = () => {
  const auth = useAuth();
  const [securityStatus, setSecurityStatus] = useState({
    isSecure: false,
    validationErrors: [],
    suspiciousActivity: []
  });

  useEffect(() => {
    if (auth.user) {
      // Validate session integrity
      const sessionValidation = SecurityValidator.validateSession(auth.user);
      
      if (!sessionValidation.valid) {
        SecurityLogger.logAuthEvent('session_validation_failed', false, {
          reason: sessionValidation.reason
        });
        
        setSecurityStatus(prev => ({
          ...prev,
          isSecure: false,
          validationErrors: [...prev.validationErrors, sessionValidation.reason]
        }));
        
        auth.signoutRedirect();
        return;
      }

      // Check for suspicious activity
      const suspiciousChecks = SecurityValidator.checkSuspiciousActivity();
      if (suspiciousChecks.length > 0) {
        SecurityLogger.logSuspiciousActivity(suspiciousChecks);
        setSecurityStatus(prev => ({
          ...prev,
          suspiciousActivity: suspiciousChecks
        }));
      }

      setSecurityStatus(prev => ({
        ...prev,
        isSecure: true,
        validationErrors: []
      }));
    }
  }, [auth.user, auth]);

  // Enhanced sign-in with security logging
  const secureSignIn = async () => {
    try {
      SecurityValidator.logAuthAttempt();
      SecurityLogger.logAuthEvent('signin_attempt', true);
      await auth.signinRedirect();
    } catch (error) {
      SecurityLogger.logAuthEvent('signin_attempt', false, { error: error.message });
      throw error;
    }
  };

  // Enhanced sign-out with cleanup
  const secureSignOut = async () => {
    try {
      SecurityLogger.logAuthEvent('signout_attempt', true);
      SecurityValidator.clearSensitiveData();
      await auth.signoutRedirect();
    } catch (error) {
      SecurityLogger.logAuthEvent('signout_attempt', false, { error: error.message });
      throw error;
    }
  };

  // Check if user has specific scopes
  const hasSecureScope = (requiredScopes) => {
    if (!auth.user?.profile?.scope) return false;
    
    const userScopes = auth.user.profile.scope.split(' ');
    return SecurityValidator.hasRequiredScopes(userScopes, requiredScopes);
  };

  // Get sanitized user profile
  const getSanitizedProfile = () => {
    if (!auth.user?.profile) return null;
    
    const profile = { ...auth.user.profile };
    
    Object.keys(profile).forEach(key => {
      if (typeof profile[key] === 'string') {
        profile[key] = SecurityValidator.sanitizeInput(profile[key]);
      }
    });
    
    return profile;
  };

  return {
    ...auth,
    secureSignIn,
    secureSignOut,
    hasSecureScope,
    getSanitizedProfile,
    securityStatus,
    isSecurelyAuthenticated: auth.isAuthenticated && securityStatus.isSecure,
  };
};
```

## User ID Mapping (Cognito to Internal)

### Core Concept
AWS Cognito provides a unique identifier called `sub` (subject) for each user. However, your backend system likely has its own internal user IDs. This implementation provides a seamless mapping between the two.

### UserService Implementation

```javascript
class UserService {
  constructor() {
    this.baseUrl = 'https://api.yourdomain.com/api';
    this.tokenUrl = 'https://api.yourdomain.com/oauth/token';
    this.clientId = import.meta.env.VITE_API_CLIENT_ID;
    this.clientSecret = import.meta.env.VITE_API_CLIENT_SECRET;

    // Cache configuration
    this.cacheKeys = {
      userId: 'internal_user_id',
      userData: 'user_data',
      timestamp: 'cache_timestamp'
    };
    this.cacheExpiryHours = 1;
  }

  /**
   * Get user information by Cognito ID
   * This is the core method that maps Cognito Sub to Internal User ID
   */
  async getUserByCognitoId(cognitoId, accessToken = null) {
    try {
      const token = accessToken || await this.getAccessToken();
      
      // API endpoint that accepts Cognito ID and returns internal user data
      const endpoint = `/users/cognito/${cognitoId}`;
      const response = await this.makeAuthenticatedRequest(endpoint, token);

      // Cache the user data if successful
      if (response && response.data && response.data.id) {
        this.setCacheData(response.data.id, response);
      }

      return {
        success: true,
        data: response,
        message: `Successfully retrieved user for Cognito ID: ${cognitoId}`
      };

    } catch (error) {
      console.error('Failed to fetch user by Cognito ID:', error);
      return {
        success: false,
        error: {
          code: 'USER_API_ERROR',
          message: `Failed to fetch user: ${error.message}`,
          cognitoId
        }
      };
    }
  }

  /**
   * Get internal user ID with caching
   * Returns the internal system's user ID for the given Cognito user
   */
  async getSinergiaUserId(cognitoId, accessToken = null) {
    try {
      // First, try to get from cache
      const cachedUserId = this.getCachedUserId();
      if (cachedUserId) {
        return {
          success: true,
          userId: cachedUserId,
          fromCache: true
        };
      }

      // If not in cache, fetch from API
      const result = await this.getUserByCognitoId(cognitoId, accessToken);

      if (result.success && result.data?.data?.id) {
        return {
          success: true,
          userId: result.data.data.id.toString(),
          fromCache: false
        };
      } else {
        return {
          success: false,
          error: 'Failed to get user ID from API'
        };
      }
    } catch (error) {
      console.error('Failed to get internal user ID:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get current user using Cognito context
   */
  async getCurrentUser(cognitoUser) {
    try {
      if (!cognitoUser || !cognitoUser.profile || !cognitoUser.profile.sub) {
        throw new Error('Invalid Cognito user context');
      }

      const cognitoId = cognitoUser.profile.sub; // This is the Cognito User ID
      const accessToken = cognitoUser.access_token;

      return await this.getUserByCognitoId(cognitoId, accessToken);

    } catch (error) {
      console.error('Failed to get current user:', error);
      return {
        success: false,
        error: {
          code: 'CURRENT_USER_ERROR',
          message: `Failed to get current user: ${error.message}`
        }
      };
    }
  }

  // Cache management methods
  setCacheData(userId, userData) {
    try {
      const timestamp = Date.now();
      localStorage.setItem(this.cacheKeys.userId, userId.toString());
      localStorage.setItem(this.cacheKeys.userData, JSON.stringify(userData));
      localStorage.setItem(this.cacheKeys.timestamp, timestamp.toString());
    } catch (error) {
      console.warn('Failed to cache user data:', error);
    }
  }

  getCachedUserId() {
    try {
      const userId = localStorage.getItem(this.cacheKeys.userId);
      const timestamp = localStorage.getItem(this.cacheKeys.timestamp);

      if (!userId || !timestamp) return null;

      const cacheAge = Date.now() - parseInt(timestamp);
      const maxAge = this.cacheExpiryHours * 60 * 60 * 1000;

      if (cacheAge > maxAge) {
        this.clearCache();
        return null;
      }

      return userId;
    } catch (error) {
      console.warn('Failed to get cached user ID:', error);
      return null;
    }
  }

  clearCache() {
    try {
      Object.values(this.cacheKeys).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('Failed to clear user cache:', error);
    }
  }

  // OAuth2 token management for backend API
  async getAccessToken() {
    try {
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Failed to get access token:', error);
      throw error;
    }
  }

  async makeAuthenticatedRequest(endpoint, accessToken, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
```

### React Hook for User Management

```javascript
import { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { userService } from '../services/userService';

export const useSinergiaUser = () => {
  const auth = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sinergiaUserId, setSinergiaUserId] = useState(null);

  // Get current user data
  const getCurrentUser = async () => {
    if (!auth.user) {
      setError('No authenticated user');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await userService.getCurrentUser(auth.user);

      if (result.success) {
        setUserData(result.data);
        if (result.data?.data?.id) {
          setSinergiaUserId(result.data.data.id.toString());
        }
      } else {
        setError(result.error?.message || 'Failed to fetch user data');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get internal user ID
  const getSinergiaUserId = async () => {
    try {
      if (sinergiaUserId) return sinergiaUserId;

      const cachedId = userService.getCachedUserId();
      if (cachedId) {
        setSinergiaUserId(cachedId);
        return cachedId;
      }

      if (!auth.user?.profile?.sub) {
        console.warn('No authenticated user available for ID lookup');
        return null;
      }

      const result = await userService.getSinergiaUserId(
        auth.user.profile.sub,
        auth.user.access_token
      );

      if (result.success) {
        setSinergiaUserId(result.userId);
        return result.userId;
      } else {
        console.error('Failed to get internal user ID:', result.error);
        return null;
      }
    } catch (error) {
      console.error('Error in getSinergiaUserId:', error);
      return null;
    }
  };

  // Auto-load current user when auth changes
  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      getCurrentUser();
      const cachedId = userService.getCachedUserId();
      if (cachedId) {
        setSinergiaUserId(cachedId);
      }
    } else {
      userService.clearCache();
      setSinergiaUserId(null);
      setUserData(null);
      setError(null);
    }
  }, [auth.isAuthenticated, auth.user]);

  return {
    userData,
    loading,
    error,
    getCurrentUser,
    getSinergiaUserId,
    // Helper to get Cognito ID from current user
    cognitoId: auth.user?.profile?.sub,
    // Internal user ID (cached)
    sinergiaUserId,
    isLoaded: !!userData && !loading,
    isCacheValid: userService.isCacheValid()
  };
};
```

## Security Implementation

### Token Validation and Security Monitoring

```javascript
import { jwtDecode } from 'jwt-decode';

export class SecurityValidator {
  
  /**
   * Validate JWT token structure and claims
   */
  static validateToken(token) {
    if (!token) return { valid: false, reason: 'No token provided' };
    
    try {
      const decoded = jwtDecode(token);
      
      // Check token expiration with buffer
      const now = Math.floor(Date.now() / 1000);
      const buffer = 60; // 1 minute buffer
      
      if (decoded.exp && decoded.exp < (now + buffer)) {
        return { valid: false, reason: 'Token expired or expiring soon' };
      }
      
      // Check required claims
      const requiredClaims = ['sub', 'aud', 'iss', 'token_use'];
      for (const claim of requiredClaims) {
        if (!decoded[claim]) {
          return { valid: false, reason: `Missing required claim: ${claim}` };
        }
      }
      
      // Validate issuer (replace with your Cognito User Pool)
      const expectedIssuer = `https://cognito-idp.your-region.amazonaws.com/your-user-pool-id`;
      if (decoded.iss !== expectedIssuer) {
        return { valid: false, reason: 'Invalid token issuer' };
      }
      
      // Validate audience (should match your client ID)
      const expectedAudience = import.meta.env.VITE_COGNITO_CLIENT_ID;
      if (decoded.aud !== expectedAudience) {
        return { valid: false, reason: 'Invalid token audience' };
      }
      
      return { valid: true, decoded };
      
    } catch (error) {
      return { valid: false, reason: `Token decode error: ${error.message}` };
    }
  }
  
  /**
   * Check if user has required scopes
   */
  static hasRequiredScopes(userScopes, requiredScopes) {
    if (!requiredScopes || requiredScopes.length === 0) return true;
    if (!userScopes) return false;
    
    const scopeArray = Array.isArray(userScopes) 
      ? userScopes 
      : userScopes.split(' ');
      
    return requiredScopes.every(scope => scopeArray.includes(scope));
  }
  
  /**
   * Sanitize user input to prevent XSS
   */
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  
  /**
   * Validate session integrity
   */
  static validateSession(user) {
    if (!user) return { valid: false, reason: 'No user session' };
    
    const requiredProps = ['access_token', 'id_token', 'profile'];
    for (const prop of requiredProps) {
      if (!user[prop]) {
        return { valid: false, reason: `Missing user property: ${prop}` };
      }
    }
    
    // Validate tokens
    const accessTokenValidation = this.validateToken(user.access_token);
    if (!accessTokenValidation.valid) {
      return { valid: false, reason: `Access token invalid: ${accessTokenValidation.reason}` };
    }
    
    const idTokenValidation = this.validateToken(user.id_token);
    if (!idTokenValidation.valid) {
      return { valid: false, reason: `ID token invalid: ${idTokenValidation.reason}` };
    }
    
    return { valid: true };
  }
  
  /**
   * Check for suspicious activity patterns
   */
  static checkSuspiciousActivity() {
    const checks = [];
    
    // Check for multiple rapid authentication attempts
    const authAttempts = JSON.parse(localStorage.getItem('auth_attempts') || '[]');
    const recentAttempts = authAttempts.filter(attempt => 
      Date.now() - attempt < 5 * 60 * 1000 // 5 minutes
    );
    
    if (recentAttempts.length > 5) {
      checks.push({ type: 'rapid_auth_attempts', count: recentAttempts.length });
    }
    
    return checks;
  }
  
  /**
   * Log authentication attempt
   */
  static logAuthAttempt() {
    const attempts = JSON.parse(localStorage.getItem('auth_attempts') || '[]');
    attempts.push(Date.now());
    
    // Keep only last 10 attempts
    const recentAttempts = attempts.slice(-10);
    localStorage.setItem('auth_attempts', JSON.stringify(recentAttempts));
  }
  
  /**
   * Clear sensitive data from memory/storage
   */
  static clearSensitiveData() {
    const sensitiveKeys = [
      'auth_attempts',
      'temp_tokens',
      'user_cache'
    ];
    
    sensitiveKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  }
}

export class SecurityLogger {
  static log(event, details = {}) {
    if (import.meta.env.DEV) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        event,
        details: {
          ...details,
          userAgent: navigator.userAgent.substring(0, 50) + '...',
          url: window.location.pathname
        }
      };

      console.debug('Security Event:', logEntry);
    }
  }

  static logAuthEvent(type, success, details = {}) {
    if (!success || ['signin', 'signout'].includes(type)) {
      this.log(`auth_${type}`, { success, ...details });
    }
  }

  static logSuspiciousActivity(activity) {
    this.log('security_check', activity);
  }
}
```

## Login & Logout Management

### Login Component

```jsx
import { useAuth } from "react-oidc-context";
import { Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const LoginScreen = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [auth.isAuthenticated, navigate]);

  const handleSignIn = async () => {
    try {
      await auth.signinRedirect();
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Header */}
          <div className="text-center">
            <div className="mx-auto h-20 w-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6">
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Your App</h2>
          </div>

          {/* Sign In Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <button
                  onClick={handleSignIn}
                  className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 transform hover:scale-105"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-4">
                    <svg className="h-6 w-6 text-blue-200 group-hover:text-blue-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </span>
                  Sign in with AWS Cognito
                </button>

                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    You will be redirected to AWS Cognito for secure authentication
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Features */}
          <div className="grid grid-cols-1 gap-4 mt-8">
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mb-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.5-1.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-8.1a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                </svg>
              </div>
              <h4 className="text-sm font-medium text-gray-900">Secure & Reliable</h4>
              <p className="text-xs text-gray-500 mt-1">Enterprise-grade security with AWS Cognito</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
```

### Logout Component

```jsx
import { useAuth } from "react-oidc-context";
import { useState } from "react";

const LogoutButtons = () => {
  const auth = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      // Set logout flag to track logout process
      localStorage.setItem('logout_in_progress', 'true');

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
      const hostedUIDomain = import.meta.env.VITE_COGNITO_HOSTED_UI_DOMAIN;
      const logoutUrl = `${hostedUIDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;

      // Redirect to Cognito logout
      window.location.href = logoutUrl;

    } catch (error) {
      console.error("Logout error:", error);
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
```

### Logout Success Handler

```jsx
import { useEffect } from "react";

const LogoutSuccess = () => {
  useEffect(() => {
    // Clean up any remaining logout flags
    localStorage.removeItem('logout_in_progress');
    
    // Redirect to login page after a brief delay
    const timer = setTimeout(() => {
      window.location.replace('/login');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Successfully Logged Out</h2>
        <p className="text-gray-600">Redirecting to login page...</p>
      </div>
    </div>
  );
};

export default LogoutSuccess;
```

## Environment Configuration

### .env.example

```bash
# Cognito Configuration
# Copy this file to .env and fill in your actual values

# The Cognito User Pool authority URL (replace with your region and user pool ID)
VITE_COGNITO_AUTHORITY=https://cognito-idp.your-region.amazonaws.com/your-user-pool-id

# The Cognito Hosted UI domain (replace with your domain)
VITE_COGNITO_HOSTED_UI_DOMAIN=https://your-domain.auth.your-region.amazoncognito.com

# Your Cognito App Client ID
VITE_COGNITO_CLIENT_ID=your-client-id

# Your Cognito App Client Secret (for confidential clients)
VITE_COGNITO_CLIENT_SECRET=your-client-secret

# OAuth redirect URIs (adjust for your domain)
VITE_COGNITO_REDIRECT_URI=http://localhost:5173/signin-oidc
VITE_COGNITO_POST_LOGOUT_REDIRECT_URI=http://localhost:5173/signout-oidc

# For production:
# VITE_COGNITO_REDIRECT_URI=https://yourdomain.com/signin-oidc
# VITE_COGNITO_POST_LOGOUT_REDIRECT_URI=https://yourdomain.com/signout-oidc

# Backend API Configuration (for user mapping)
VITE_API_CLIENT_ID=your-backend-client-id
VITE_API_CLIENT_SECRET=your-backend-client-secret
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_API_TOKEN_URL=https://api.yourdomain.com/oauth/token
```

### Production Environment Variables

For production, make sure to:

1. **Update redirect URIs** to use your production domain
2. **Use HTTPS** for all URLs
3. **Store secrets securely** (not in client-side code for public clients)
4. **Enable CORS** on your backend API for your domain

## API Integration

### Backend API Endpoint Example

Your backend should provide an endpoint that maps Cognito User IDs to internal user IDs:

```javascript
// Example Express.js endpoint
app.get('/api/users/cognito/:cognitoId', authenticateToken, async (req, res) => {
  try {
    const { cognitoId } = req.params;
    
    // Query your database to find user by Cognito ID
    const user = await User.findOne({ cognitoId: cognitoId });
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        cognitoId: cognitoId
      });
    }
    
    // Return user data with internal ID
    res.json({
      data: {
        id: user.internalId, // Your internal user ID
        cognitoId: user.cognitoId,
        email: user.email,
        name: user.name,
        // ... other user data
      }
    });
    
  } catch (error) {
    console.error('Error fetching user by Cognito ID:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});
```

### Database Schema Example

```sql
-- Example user table with Cognito integration
CREATE TABLE users (
  internal_id SERIAL PRIMARY KEY,
  cognito_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookups
CREATE INDEX idx_users_cognito_id ON users(cognito_id);
```

## Best Practices

### 1. Security Best Practices

- **Always validate tokens** on both frontend and backend
- **Use HTTPS** in production
- **Implement proper CORS** policies
- **Store sensitive data securely** (never in localStorage for long-term storage)
- **Implement session timeout** and automatic logout
- **Monitor for suspicious activity**

### 2. Performance Best Practices

- **Cache user data** with appropriate expiration
- **Use efficient token validation** (avoid unnecessary API calls)
- **Implement proper loading states**
- **Handle network failures gracefully**

### 3. User Experience Best Practices

- **Provide clear feedback** during authentication
- **Handle errors gracefully** with user-friendly messages
- **Implement proper redirects** after login/logout
- **Show loading states** during authentication

### 4. Development Best Practices

- **Use environment variables** for configuration
- **Implement comprehensive error handling**
- **Add proper logging** for debugging
- **Write reusable components** and hooks
- **Document your authentication flow**

## Error Handling & Loading States

### Error Screen Component

```jsx
import { RefreshCw } from 'lucide-react';

const ErrorScreen = ({ error, onRetry }) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-6">
            {error?.message || 'An error occurred during authentication. Please try again.'}
          </p>
          
          <button
            onClick={handleRetry}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-200"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorScreen;
```

### Loading Screen Component

```jsx
const LoadingScreen = ({ message = "Loading...", subtitle = "Please wait" }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <svg className="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{message}</h2>
        <p className="text-gray-600">{subtitle}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Infinite Redirect Loop
**Problem**: User gets stuck in a redirect loop between login and protected routes.

**Solution**:
- Check that your redirect URIs match exactly in Cognito and your app
- Ensure proper route handling in your App component
- Verify that `window.location.replace()` is used instead of `navigate()` in critical redirects

#### 2. Token Validation Failures
**Problem**: Valid tokens are being rejected.

**Solution**:
- Verify the issuer URL matches your Cognito User Pool
- Check that the audience matches your App Client ID
- Ensure proper token expiration handling

#### 3. CORS Issues
**Problem**: API calls to your backend are failing with CORS errors.

**Solution**:
- Configure CORS on your backend to allow your frontend domain
- Include proper headers in your API requests
- Use credentials properly if needed

#### 4. Logout Not Working Properly
**Problem**: User appears logged out but tokens remain valid.

**Solution**:
- Implement proper token revocation
- Clear all storage (localStorage, sessionStorage, cookies)
- Use the Cognito logout endpoint with proper parameters

#### 5. User ID Mapping Issues
**Problem**: Cannot map Cognito User ID to internal user ID.

**Solution**:
- Verify your backend API endpoint is working
- Check that the Cognito `sub` claim is being passed correctly
- Ensure proper error handling in the mapping service

### Debug Checklist

1. **Check browser console** for authentication errors
2. **Verify environment variables** are properly set
3. **Check network tab** for failed API requests
4. **Verify Cognito configuration** in AWS console
5. **Test token validation** manually
6. **Check redirect URIs** match exactly
7. **Verify backend API** is accessible and responding

## Conclusion

This comprehensive guide provides a production-ready implementation of AWS Cognito authentication with React. The key features include:

- **Secure OIDC authentication** with AWS Cognito
- **Cognito User ID to Internal User ID mapping** for backend integration
- **Enhanced security features** including token validation and monitoring
- **Proper logout handling** with token cleanup
- **Caching mechanisms** for performance
- **Comprehensive error handling** and user feedback

The implementation follows security best practices and provides a robust foundation for authentication in React applications. The modular architecture makes it easy to adapt to different backend systems and requirements.

For any questions or issues, refer to the troubleshooting section or consult the AWS Cognito documentation for the latest updates and best practices.
