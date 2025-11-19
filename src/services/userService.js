// User API Service for Sinergia Cloud
import logger from '../utils/logger';

class UserService {
  constructor() {
    this.baseUrl = 'https://api.sinergia.cloud/api';
    this.tokenUrl = import.meta.env.VITE_SINERGIA_TOKEN_URL || 'https://api.sinergia.cloud/oauth/token';
    this.clientId = import.meta.env.VITE_SINERGIA_CLIENT_ID;
    this.clientSecret = import.meta.env.VITE_SINERGIA_CLIENT_SECRET;

    // Cache configuration
    this.cacheKeys = {
      userId: 'sinergia_user_id',
      userData: 'sinergia_user_data',
      timestamp: 'sinergia_cache_timestamp'
    };
    this.cacheExpiryHours = 1; // Cache expires after 1 hour
  }

  /**
   * Cache management utilities
   */
  setCacheData(userId, userData) {
    try {
      const timestamp = Date.now();
      localStorage.setItem(this.cacheKeys.userId, userId.toString());
      localStorage.setItem(this.cacheKeys.userData, JSON.stringify(userData));
      localStorage.setItem(this.cacheKeys.timestamp, timestamp.toString());
    
    } catch (error) {
      logger.warn('Failed to cache user data', { error: error.message });
    }
  }

  getCachedUserId() {
    try {
      const userId = localStorage.getItem(this.cacheKeys.userId);
      const timestamp = localStorage.getItem(this.cacheKeys.timestamp);

      if (!userId || !timestamp) {
        return null;
      }

      // Check if cache is still valid (within expiry time)
      const cacheAge = Date.now() - parseInt(timestamp);
      const maxAge = this.cacheExpiryHours * 60 * 60 * 1000; // Convert hours to milliseconds

      if (cacheAge > maxAge) {
      
        this.clearCache();
        return null;
      }

    
      return userId;
    } catch (error) {
      logger.warn('Failed to get cached user ID', { error: error.message });
      return null;
    }
  }

  getCachedUserData() {
    try {
      const userData = localStorage.getItem(this.cacheKeys.userData);
      const timestamp = localStorage.getItem(this.cacheKeys.timestamp);

      if (!userData || !timestamp) {
        return null;
      }

      // Check if cache is still valid
      const cacheAge = Date.now() - parseInt(timestamp);
      const maxAge = this.cacheExpiryHours * 60 * 60 * 1000;

      if (cacheAge > maxAge) {
        this.clearCache();
        return null;
      }

      return JSON.parse(userData);
    } catch (error) {
      logger.warn('Failed to get cached user data', { error: error.message });
      return null;
    }
  }

  clearCache() {
    try {
      localStorage.removeItem(this.cacheKeys.userId);
      localStorage.removeItem(this.cacheKeys.userData);
      localStorage.removeItem(this.cacheKeys.timestamp);
     
    } catch (error) {
      logger.warn('Failed to clear user cache', { error: error.message });
    }
  }

  isCacheValid() {
    try {
      const timestamp = localStorage.getItem(this.cacheKeys.timestamp);
      if (!timestamp) return false;

      const cacheAge = Date.now() - parseInt(timestamp);
      const maxAge = this.cacheExpiryHours * 60 * 60 * 1000;

      return cacheAge <= maxAge;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get OAuth2 access token for API calls
   */
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
        throw new Error(`Token request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      logger.error('Failed to get access token', { error: error.message });
      throw error;
    }
  }

  /**
   * Make authenticated request to Sinergia API
   */
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

      const data = await response.json();
     
      
      return data;
    } catch (error) {
      logger.error('User API request failed', { endpoint, error: error.message });
      throw error;
    }
  }

  /**
   * Get user information by Cognito ID
   */
  async getUserByCognitoId(cognitoId, accessToken = null) {
    try {
      // Get access token if not provided
      const token = accessToken || await this.getAccessToken();
      
    

      // Make API call to get user by Cognito ID
      const endpoint = `/users/cognito/${cognitoId}`;
      const response = await this.makeAuthenticatedRequest(endpoint, token);

    

      // Cache the user data if successful
      if (response && response.data && response.data.id) {
        this.setCacheData(response.data.id, response);
      }

      // Return the response in a consistent format
      return {
        success: true,
        data: response,
        message: `Successfully retrieved user for Cognito ID: ${cognitoId}`
      };

    } catch (error) {
      console.error('Failed to fetch user by Cognito ID:', {
        cognitoId,
        error: error.message,
        stack: error.stack
      });

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
   * Get Sinergia user ID with caching
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
      console.error('Failed to get Sinergia user ID:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get current user information using Cognito user context
   */
  async getCurrentUser(cognitoUser) {
    try {
      if (!cognitoUser || !cognitoUser.profile || !cognitoUser.profile.sub) {
        throw new Error('Invalid Cognito user context');
      }

      const cognitoId = cognitoUser.profile.sub;
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

  /**
   * Update user information
   */
  async updateUser(cognitoId, userData, accessToken = null) {
    try {
      // Get access token if not provided
      const token = accessToken || await this.getAccessToken();
  

      // Make API call to update user
      const endpoint = `/users/cognito/${cognitoId}`;
      const response = await this.makeAuthenticatedRequest(endpoint, token, {
        method: 'PUT',
        body: JSON.stringify(userData)
      });

      return {
        success: true,
        data: response,
        message: `Successfully updated user: ${cognitoId}`
      };

    } catch (error) {
      console.error('Failed to update user:', {
        cognitoId,
        error: error.message
      });

      return {
        success: false,
        error: {
          code: 'USER_UPDATE_ERROR',
          message: `Failed to update user: ${error.message}`,
          cognitoId
        }
      };
    }
  }

  /**
   * Create new user
   */
  async createUser(userData, accessToken = null) {
    try {
      // Get access token if not provided
      const token = accessToken || await this.getAccessToken();
      
 

      // Make API call to create user
      const endpoint = `/users`;
      const response = await this.makeAuthenticatedRequest(endpoint, token, {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      return {
        success: true,
        data: response,
        message: 'Successfully created user'
      };

    } catch (error) {
      console.error('Failed to create user:', error);

      return {
        success: false,
        error: {
          code: 'USER_CREATE_ERROR',
          message: `Failed to create user: ${error.message}`
        }
      };
    }
  }
}

// Export singleton instance
export const userService = new UserService();
