// import { useAuth } from 'react-oidc-context'; // COGNITO DISABLED
import { useMockAuth } from './useMockAuth'; // Mock auth when Cognito is disabled
import { useEffect, useState } from 'react';
import { SecurityValidator, SecurityLogger } from '../utils/security';

// Use mock auth instead of real Cognito auth
const useAuth = useMockAuth;

/**
 * Enhanced authentication hook with security validation
 */
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
        
        // Force re-authentication if session is invalid
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

  // Check if user has specific scopes with validation
  const hasSecureScope = (requiredScopes) => {
    if (!auth.user?.profile?.scope) return false;
    
    const userScopes = auth.user.profile.scope.split(' ');
    return SecurityValidator.hasRequiredScopes(userScopes, requiredScopes);
  };

  // Get sanitized user profile
  const getSanitizedProfile = () => {
    if (!auth.user?.profile) return null;
    
    const profile = { ...auth.user.profile };
    
    // Sanitize string fields
    Object.keys(profile).forEach(key => {
      if (typeof profile[key] === 'string') {
        profile[key] = SecurityValidator.sanitizeInput(profile[key]);
      }
    });
    
    return profile;
  };

  return {
    // Original auth properties
    ...auth,
    
    // Enhanced methods
    secureSignIn,
    secureSignOut,
    hasSecureScope,
    getSanitizedProfile,
    
    // Security status
    securityStatus,
    isSecurelyAuthenticated: auth.isAuthenticated && securityStatus.isSecure,
  };
};

export default useSecureAuth;
