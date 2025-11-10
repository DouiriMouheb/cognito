import { useState, useEffect } from 'react';
// import { useAuth } from 'react-oidc-context'; // COGNITO DISABLED
import { useMockAuth } from './useMockAuth'; // Mock auth when Cognito is disabled
import { userService } from '../services/userService';
import apiService from '../services/apiService';

// Use mock auth instead of real Cognito auth
const useAuth = useMockAuth;

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
    // DISABLED: Don't make real API calls with mock auth
    console.log('[Mock Auth] getCurrentUser called - returning mock data instead of API call');
    return {
      success: true,
      data: {
        data: {
          id: 1,
          cognitoId: 'mock-user-id',
          email: 'demo@example.com',
          deS_NOME: 'Demo',
          deS_COGNOME: 'User',
          telefono: '+1234567890'
        }
      }
    };
    
    /* COGNITO API CALL DISABLED
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
    */
  };

  // Get user by Cognito ID
  const getUserByCognitoId = async (cognitoId) => {
    // DISABLED: Don't make real API calls with mock auth
    console.log('[Mock Auth] getUserByCognitoId called - returning mock data instead of API call');
    return {
      success: true,
      data: {
        data: {
          id: 1,
          cognitoId: cognitoId || 'mock-user-id',
          email: 'demo@example.com',
          deS_NOME: 'Demo',
          deS_COGNOME: 'User',
          telefono: '+1234567890'
        }
      }
    };
    
    /* COGNITO API CALL DISABLED
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
    */
  };

  // Update user data
  const updateUser = async (cognitoId, userData) => {
    // DISABLED: Don't make real API calls with mock auth
    console.log('[Mock Auth] updateUser called - returning mock data instead of API call');
    return {
      success: true,
      data: {
        id: 1,
        cognitoId: cognitoId || 'mock-user-id',
        ...userData
      }
    };
    
    /* COGNITO API CALL DISABLED
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
    */
  };

  // Get Sinergia user ID (with caching)
  const getSinergiaUserId = async () => {
    // DISABLED: Don't make real API calls with mock auth
    console.log('[Mock Auth] getSinergiaUserId called - returning mock ID');
    return '1'; // Mock user ID
  };

  // Clear cache on logout
  const clearUserCache = () => {
    // DISABLED: No cache to clear with mock auth
    console.log('[Mock Auth] clearUserCache called - no action needed');
  };

  // Auto-load current user when auth changes
  useEffect(() => {
    // DISABLED: Don't make API calls with mock auth
    console.log('[Mock Auth] Skipping Sinergia user API call - using mock data');
    
    // Set mock user data to prevent errors
    setUserData({
      data: {
        id: 1,
        cognitoId: 'mock-user-id',
        email: 'demo@example.com',
        deS_NOME: 'Demo',
        deS_COGNOME: 'User',
        telefono: '+1234567890'
      }
    });
    setSinergiaUserId('1');
    setLoading(false);
    
    /* COGNITO USER API CALL DISABLED
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
    */
  }, []); // Empty dependency array - only run once on mount

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
