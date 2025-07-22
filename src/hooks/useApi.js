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
