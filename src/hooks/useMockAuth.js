// Mock Auth Hook - Used when Cognito authentication is disabled
// This provides a fake auth object so components don't break

export const useMockAuth = () => {
  return {
    // Authentication state
    isLoading: false,
    isAuthenticated: true,
    
    // User data (mock)
    user: {
      profile: {
        sub: 'mock-user-id',
        email: 'demo@example.com',
        name: 'Demo User',
        email_verified: true,
        scope: 'openid email profile'
      },
      access_token: 'mock-access-token',
      id_token: 'mock-id-token',
      refresh_token: 'mock-refresh-token',
      token_type: 'Bearer',
      expires_at: Date.now() + 3600000
    },
    
    // Methods (no-op for mock)
    signinRedirect: async () => {
      console.log('[Mock Auth] signinRedirect called - Cognito is disabled');
    },
    signoutRedirect: async () => {
      console.log('[Mock Auth] signoutRedirect called - Cognito is disabled');
    },
    removeUser: async () => {
      console.log('[Mock Auth] removeUser called - Cognito is disabled');
    },
    signinSilent: async () => {
      console.log('[Mock Auth] signinSilent called - Cognito is disabled');
    },
    
    // Error state
    error: null,
    
    // Active navigator
    activeNavigator: null
  };
};

export default useMockAuth;
