# AWS Cognito Authentication Implementation Summary

## Overview
Implementation of AWS Cognito authentication in React applications using OIDC protocol with user ID mapping between Cognito and internal systems.

## Project File Structure

```
project-root/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── main.jsx                    # Entry point with AuthProvider
│   ├── App.jsx                     # Main app with route protection
│   ├── index.css                   # Global styles
│   ├── components/
│   │   ├── LoginScreen.jsx         # Login page component
│   │   ├── LogoutButtons.jsx       # Logout functionality
│   │   ├── LogoutSuccess.jsx       # Post-logout redirect handler
│   │   ├── LoadingScreen.jsx       # Authentication loading state
│   │   ├── ErrorScreen.jsx         # Authentication error display
│   │   ├── Dashboard.jsx           # Protected main application
│   │   └── ProtectedRoute.jsx      # Route protection wrapper
│   ├── hooks/
│   │   ├── useSecureAuth.js        # Enhanced auth hook with security
│   │   └── useApi.js               # API hooks with user management
│   ├── services/
│   │   ├── userService.js          # Cognito to Internal ID mapping
│   │   └── apiService.js           # General API service
│   ├── utils/
│   │   ├── security.js             # Security validation & monitoring
│   │   └── toast.js                # User notification utilities
│   └── context/
│       └── AppContext.jsx          # Application state context
├── package.json                    # Dependencies configuration
├── vite.config.js                  # Vite build configuration
├── .env.example                    # Environment variables template
└── .env                           # Actual environment variables (gitignored)
```

### Core File Responsibilities

#### **Entry & Configuration Files**
- `main.jsx`: AuthProvider setup with Cognito configuration
- `App.jsx`: Authentication state management and route protection
- `vite.config.js`: Build configuration
- `.env`: Environment variables for Cognito and API settings

#### **Authentication Components**
- `LoginScreen.jsx`: Initiates Cognito authentication flow
- `LogoutButtons.jsx`: Complete logout with cleanup
- `LogoutSuccess.jsx`: Handles post-logout redirect
- `LoadingScreen.jsx`: Shows during authentication process
- `ErrorScreen.jsx`: Displays authentication errors

#### **Business Logic**
- `useSecureAuth.js`: Enhanced authentication with security validation
- `userService.js`: Maps Cognito User ID to Internal User ID
- `security.js`: JWT validation and security monitoring
- `useApi.js`: API integration hooks with user context

#### **Protected Application**
- `Dashboard.jsx`: Main application (requires authentication)
- `ProtectedRoute.jsx`: Route-level authentication guard

## Core Architecture

### Authentication Flow
1. User accesses protected route → Redirect to login page
2. Login page initiates Cognito Hosted UI redirect
3. User authenticates with Cognito → Returns authorization code
4. Application exchanges code for JWT tokens (access_token, id_token)
5. Extract Cognito User ID from token (sub claim)
6. Map Cognito ID to internal system User ID via API call
7. Cache internal User ID for performance
8. Grant access to protected routes

### Key Components Structure
- **main.jsx**: AuthProvider wrapper with Cognito configuration
- **App.jsx**: Route protection and authentication state management
- **LoginScreen.jsx**: Initiates Cognito authentication flow
- **LogoutButtons.jsx**: Handles complete logout with cleanup
- **useSecureAuth.js**: Enhanced authentication hook with security
- **userService.js**: Cognito to Internal ID mapping service
- **security.js**: JWT validation and security monitoring

## Implementation Pattern

### 1. Cognito Configuration (main.jsx)
```javascript
const cognitoAuthConfig = {
  authority: "https://cognito-idp.REGION.amazonaws.com/USER_POOL_ID",
  client_id: "COGNITO_CLIENT_ID", 
  client_secret: "COGNITO_CLIENT_SECRET",
  redirect_uri: "http://localhost:5173/signin-oidc",
  post_logout_redirect_uri: "http://localhost:5173/signout-oidc",
  response_type: "code",
  scope: "openid email profile aws.cognito.signin.user.admin",
  automaticSilentRenew: false,
  revokeTokensOnSignout: true
};
```

### 2. Authentication State Management (App.jsx)
- Use `useAuth()` hook from react-oidc-context
- Handle loading states during authentication
- Manage logout process tracking
- Route protection based on `auth.isAuthenticated`
- Handle authentication errors with error screens

### 3. User ID Mapping Pattern (userService.js)
```javascript
// Core mapping function
async getUserByCognitoId(cognitoId, accessToken) {
  // Call backend API: GET /users/cognito/{cognitoId}
  // Returns: { data: { id: INTERNAL_USER_ID, ...userData } }
  // Cache the internal user ID for 1 hour
}

// Usage pattern
const cognitoId = auth.user.profile.sub; // Cognito User ID
const result = await userService.getUserByCognitoId(cognitoId);
const internalUserId = result.data.data.id; // Internal system User ID
```

### 4. Security Implementation
- JWT token validation (issuer, audience, expiration)
- Session integrity checks
- Input sanitization for XSS prevention
- Suspicious activity monitoring
- Secure logout with complete cleanup

### 5. Login Implementation
```javascript
const handleSignIn = async () => {
  await auth.signinRedirect(); // Redirects to Cognito Hosted UI
};
```

### 6. Logout Implementation
```javascript
const handleSignOut = async () => {
  localStorage.setItem('logout_in_progress', 'true');
  await auth.removeUser();
  sessionStorage.clear();
  localStorage.clear();
  // Redirect to Cognito logout URL
  window.location.href = `${COGNITO_DOMAIN}/logout?client_id=${CLIENT_ID}&logout_uri=${LOGOUT_URI}`;
};
```

## Required Environment Variables
```
VITE_COGNITO_AUTHORITY=https://cognito-idp.REGION.amazonaws.com/USER_POOL_ID
VITE_COGNITO_CLIENT_ID=your_client_id
VITE_COGNITO_CLIENT_SECRET=your_client_secret
VITE_COGNITO_REDIRECT_URI=http://localhost:5173/signin-oidc
VITE_COGNITO_POST_LOGOUT_REDIRECT_URI=http://localhost:5173/signout-oidc
VITE_COGNITO_HOSTED_UI_DOMAIN=https://your-domain.auth.REGION.amazoncognito.com
```

## File Implementation Priority

### Phase 1: Core Setup
1. **package.json** - Install required dependencies
2. **.env** - Configure environment variables
3. **main.jsx** - Set up AuthProvider with Cognito config
4. **App.jsx** - Basic authentication state management

### Phase 2: Authentication Flow
5. **LoginScreen.jsx** - User authentication entry point
6. **LoadingScreen.jsx** - Authentication loading state
7. **ErrorScreen.jsx** - Authentication error handling
8. **LogoutSuccess.jsx** - Post-logout redirect handler

### Phase 3: Security & Services
9. **security.js** - JWT validation and security utilities
10. **userService.js** - Cognito to Internal ID mapping
11. **useSecureAuth.js** - Enhanced authentication hook
12. **LogoutButtons.jsx** - Complete logout implementation

### Phase 4: Application Logic
13. **Dashboard.jsx** - Protected main application
14. **useApi.js** - API integration with user context
15. **ProtectedRoute.jsx** - Route-level protection
16. **AppContext.jsx** - Application state management

## Minimal Working Implementation Files

For a basic working implementation, you need these essential files:

### Essential Files (Minimum Viable Product)
```
src/
├── main.jsx           # AuthProvider setup
├── App.jsx            # Authentication state + routing
├── components/
│   ├── LoginScreen.jsx    # Login page
│   ├── LoadingScreen.jsx  # Loading state
│   └── Dashboard.jsx      # Protected content
├── services/
│   └── userService.js     # User ID mapping
└── utils/
    └── security.js        # Token validation
```

### Enhanced Files (Production Ready)
Add these for production-ready implementation:
```
├── components/
│   ├── LogoutButtons.jsx   # Complete logout
│   ├── ErrorScreen.jsx     # Error handling
│   └── LogoutSuccess.jsx   # Logout redirect
├── hooks/
│   ├── useSecureAuth.js    # Enhanced auth hook
│   └── useApi.js           # API integration
└── context/
    └── AppContext.jsx      # App state
```

## Dependencies Required
```json
{
  "react-oidc-context": "^3.3.0",
  "oidc-client-ts": "^3.3.0", 
  "react-router-dom": "^7.7.0",
  "react-hot-toast": "^2.5.2"
}
```

## AWS Cognito Setup Requirements
1. Create User Pool with Hosted UI enabled
2. Configure App Client with Authorization Code Grant flow
3. Set callback URLs: `/signin-oidc` and `/signout-oidc`
4. Enable required OAuth scopes: openid, email, profile
5. Configure custom scopes if needed for API access

## Backend API Requirements
- Endpoint: `GET /users/cognito/{cognitoId}`
- Authentication: OAuth2 Bearer token
- Response: `{ data: { id: internal_user_id, ...user_data } }`
- Database: Table mapping cognito_id to internal_user_id

## Key Features
- Automatic token refresh handling
- Secure logout with complete cleanup
- User ID caching for performance (1 hour expiry)
- Comprehensive error handling
- Loading states for better UX
- Security monitoring and validation
- Route protection middleware
- Session persistence across page refreshes

## Security Best Practices Implemented
- JWT token validation with issuer/audience checks
- XSS protection through input sanitization
- Secure storage practices (no long-term sensitive data in localStorage)
- Complete logout cleanup (tokens, storage, cookies)
- Session monitoring and suspicious activity detection
- CSRF protection through OIDC state parameter

This pattern provides enterprise-grade authentication with seamless integration between AWS Cognito and internal user management systems, suitable for production React applications.
