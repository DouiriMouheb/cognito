import { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { userService } from '../services/userService';
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
    immediate = true, // Whether to call immediately on mount
    dependencies = [] // Dependencies to trigger re-fetch
  } = options;

  const execute = async (overrideOptions = {}) => {
    if (!auth.isAuthenticated) {
      setError(new Error('User not authenticated'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result;
      const finalOptions = { ...options, ...overrideOptions };

      switch (method.toUpperCase()) {
        case 'GET':
          result = await apiService.get(endpoint, finalOptions.params || params);
          break;
        case 'POST':
          result = await apiService.post(endpoint, finalOptions.body || body);
          break;
        case 'PUT':
          result = await apiService.put(endpoint, finalOptions.body || body);
          break;
        case 'DELETE':
          result = await apiService.delete(endpoint);
          break;
        case 'PATCH':
          result = await apiService.patch(endpoint, finalOptions.body || body);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

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
  }, [auth.isAuthenticated, ...dependencies]);

  return {
    data,
    loading,
    error,
    execute,
    refetch: execute
  };
};

// Hook for user profile data
export const useUserProfile = () => {
  const auth = useAuth();
  
  return {
    user: auth.user,
    profile: auth.user?.profile || {},
    isAuthenticated: auth.isAuthenticated,
    accessToken: auth.user?.access_token,
    idToken: auth.user?.id_token,
    refreshToken: auth.user?.refresh_token,
    // Helper to get user claims
    getClaim: (claimName) => auth.user?.profile?.[claimName],
    // Helper to check if user has specific scope
    hasScope: (scope) => {
      const userScopes = auth.user?.profile?.scope?.split(' ') || [];
      return userScopes.includes(scope);
    }
  };
};

// Hook for Sinergia user API
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
        // Extract and cache user ID
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

  // Get user by Cognito ID
  const getUserByCognitoId = async (cognitoId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await userService.getUserByCognitoId(cognitoId, auth.user?.access_token);

      if (result.success) {
        setUserData(result.data);
        return result.data;
      } else {
        setError(result.error?.message || 'Failed to fetch user data');
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update user data
  const updateUser = async (cognitoId, userData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await userService.updateUser(cognitoId, userData, auth.user?.access_token);

      if (result.success) {
        setUserData(result.data);
        return result.data;
      } else {
        setError(result.error?.message || 'Failed to update user');
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get Sinergia user ID (with caching)
  const getSinergiaUserId = async () => {
    try {
      // Return cached ID if available
      if (sinergiaUserId) {
        return sinergiaUserId;
      }

      // Check service cache first
      const cachedId = userService.getCachedUserId();
      if (cachedId) {
        setSinergiaUserId(cachedId);
        return cachedId;
      }

      // If no cache and no current user context, return null
      if (!auth.user?.profile?.sub) {
        console.warn('No authenticated user available for ID lookup');
        return null;
      }

      // Fetch from API
      const result = await userService.getSinergiaUserId(
        auth.user.profile.sub,
        auth.user.access_token
      );

      if (result.success) {
        setSinergiaUserId(result.userId);
        return result.userId;
      } else {
        console.error('Failed to get Sinergia user ID:', result.error);
        return null;
      }
    } catch (error) {
      console.error('Error in getSinergiaUserId:', error);
      return null;
    }
  };

  // Clear cache on logout
  const clearUserCache = () => {
    userService.clearCache();
    setSinergiaUserId(null);
    setUserData(null);
    setError(null);
  };

  // Auto-load current user when auth changes
  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      getCurrentUser();
      // Also try to load cached user ID
      const cachedId = userService.getCachedUserId();
      if (cachedId) {
        setSinergiaUserId(cachedId);
      }
    } else {
      // Clear cache when user logs out
      clearUserCache();
    }
  }, [auth.isAuthenticated, auth.user]);

  return {
    userData,
    loading,
    error,
    getCurrentUser,
    getUserByCognitoId,
    updateUser,
    getSinergiaUserId,
    clearUserCache,
    // Helper to get Cognito ID from current user
    cognitoId: auth.user?.profile?.sub,
    // Sinergia user ID (cached)
    sinergiaUserId,
    // Helper to check if user data is loaded
    isLoaded: !!userData && !loading,
    // Helper to check if cache is valid
    isCacheValid: userService.isCacheValid()
  };
};

// Hook for making authenticated requests manually
export const useAuthenticatedRequest = () => {
  const auth = useAuth();
  const [loading, setLoading] = useState(false);

  const makeRequest = async (endpoint, options = {}) => {
    if (!auth.isAuthenticated) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    try {
      const result = await apiService.request(endpoint, options);
      return result;
    } finally {
      setLoading(false);
    }
  };

  return {
    makeRequest,
    loading,
    // Convenience methods
    get: (endpoint, params) => makeRequest(endpoint, { method: 'GET', params }),
    post: (endpoint, data) => makeRequest(endpoint, { method: 'POST', body: JSON.stringify(data) }),
    put: (endpoint, data) => makeRequest(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (endpoint) => makeRequest(endpoint, { method: 'DELETE' }),
  };
};
