// API Service for making authenticated requests with Cognito tokens
import { SecurityValidator, SecurityLogger } from '../utils/security';
import logger from '../utils/logger';

class ApiService {
  constructor(baseURL = import.meta.env.VITE_API_BASE_URL || 'https://api.example.com') {
    this.baseURL = baseURL;
  }

  // Get the current user's access token
  getAccessToken() {
    // Get the user from OIDC context (you'll need to pass this in)
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

  // Create headers with authentication and security headers
  createHeaders(additionalHeaders = {}) {
    const accessToken = this.getAccessToken();

    // Silent token validation
    if (accessToken) {
      const tokenValidation = SecurityValidator.validateToken(accessToken);
      if (!tokenValidation.valid) {
        // Silent handling - just throw error without logging details
        throw new Error('Authentication required');
      }
    }

    const headers = {
      'Content-Type': 'application/json',
      // Basic security headers
      'X-Requested-With': 'XMLHttpRequest',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      ...additionalHeaders
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return headers;
  }

  // Generic request method with enhanced security
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // Log API request for security monitoring
    SecurityLogger.log('api_request', {
      endpoint,
      method: options.method || 'GET',
      timestamp: new Date().toISOString()
    });

    const config = {
      headers: this.createHeaders(options.headers),
      ...options
    };

    try {
      const startTime = Date.now();
      const response = await fetch(url, config);
      const responseTime = Date.now() - startTime;

      // Log response for monitoring
      SecurityLogger.log('api_response', {
        endpoint,
        status: response.status,
        responseTime,
        success: response.ok
      });

      // Handle token expiration
      if (response.status === 401) {
        SecurityLogger.log('token_expired', { endpoint });
        throw new Error('Authentication failed - token may be expired');
      }

      // Handle forbidden access
      if (response.status === 403) {
        SecurityLogger.log('access_forbidden', { endpoint });
        throw new Error('Access forbidden - insufficient permissions');
      }

      if (!response.ok) {
        SecurityLogger.log('api_error', {
          endpoint,
          status: response.status,
          statusText: response.statusText
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle different content types
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();

        // Sanitize response data if it contains user input
        if (data && typeof data === 'object') {
          return this.sanitizeResponseData(data);
        }

        return data;
      }

      return await response.text();
    } catch (error) {
      SecurityLogger.log('api_request_failed', {
        endpoint,
        error: error.message,
        stack: error.stack
      });
      logger.error('API request failed', { endpoint, error: error.message });
      throw error;
    }
  }

  // Sanitize response data to prevent XSS
  sanitizeResponseData(data) {
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeResponseData(item));
    }

    if (data && typeof data === 'object') {
      const sanitized = {};
      Object.keys(data).forEach(key => {
        if (typeof data[key] === 'string') {
          sanitized[key] = SecurityValidator.sanitizeInput(data[key]);
        } else if (typeof data[key] === 'object') {
          sanitized[key] = this.sanitizeResponseData(data[key]);
        } else {
          sanitized[key] = data[key];
        }
      });
      return sanitized;
    }

    return data;
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET'
    });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  // PATCH request
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // Upload file with authentication
  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add additional form data
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
        'Authorization': `Bearer ${this.getAccessToken()}`
      }
    });
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
