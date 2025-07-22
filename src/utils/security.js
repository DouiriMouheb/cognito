// Frontend Security Utilities
import { jwtDecode } from 'jwt-decode';

/**
 * Enhanced token validation for frontend security
 */
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
      
      // Validate issuer (should match your Cognito User Pool)
      const expectedIssuer = `https://cognito-idp.eu-south-1.amazonaws.com/eu-south-1_gKX37NHrI`;
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
    
    // Check if user object has required properties
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
    
    // Check if developer tools are open (basic detection)
    const devtools = {
      open: false,
      orientation: null
    };
    
    const threshold = 160;
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          console.warn('🔒 Security Notice: Developer tools detected');
          checks.push({ type: 'devtools', timestamp: Date.now() });
        }
      } else {
        devtools.open = false;
      }
    }, 500);
    
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
    // Clear any cached sensitive data
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
  
  /**
   * Generate Content Security Policy for inline styles
   */
  static generateCSPNonce() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

/**
 * Silent security event logger (no user-visible output)
 */
export class SecurityLogger {
  static log(event, details = {}) {
    // Only log in development mode
    if (import.meta.env.DEV) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        event,
        details: {
          ...details,
          // Remove sensitive data from logs
          userAgent: navigator.userAgent.substring(0, 50) + '...',
          url: window.location.pathname // Don't log full URL with params
        }
      };

      // Silent console logging (only in dev)
      console.debug('Security Event:', logEntry);
    }

    // In production, send to logging service silently
    // this.sendToLoggingService(event, details);
  }

  static logAuthEvent(type, success, details = {}) {
    // Only log failures and important events
    if (!success || ['signin', 'signout'].includes(type)) {
      this.log(`auth_${type}`, { success, ...details });
    }
  }

  static logSuspiciousActivity(activity) {
    // Silent monitoring - no user notification
    this.log('security_check', activity);
  }
}

export default SecurityValidator;
