# Cognito Authentication - DISABLED

## ⚠️ Status: Authentication Temporarily Disabled

The AWS Cognito authentication has been **commented out** to allow the application to run without login requirements.

## Changes Made

### 1. Main Entry Point (`src/main.jsx`)
- ✅ Commented out `AuthProvider` from `react-oidc-context`
- ✅ Commented out Cognito configuration
- ✅ App now runs without authentication wrapper

### 2. App Component (`src/App.jsx`)
- ✅ Commented out `useAuth` import
- ✅ Created mock auth object with `isAuthenticated: true`
- ✅ Removed all authentication checks and redirects
- ✅ All routes are now publicly accessible

### 3. Mock Auth Hook (`src/hooks/useMockAuth.js`)
- ✅ **NEW FILE** - Provides fake auth object to prevent component breakage
- ✅ Returns mock user data
- ✅ All auth methods are no-ops (console.log only)

### 4. API Hooks (`src/hooks/useApi.js`)
- ✅ Replaced `useAuth` from `react-oidc-context` with `useMockAuth`
- ✅ All hooks now use mock authentication

### 5. Secure Auth Hook (`src/hooks/useSecureAuth.js`)
- ✅ Replaced `useAuth` from `react-oidc-context` with `useMockAuth`

### 6. Protected Route (`src/components/ProtectedRoute.jsx`)
- ✅ Commented out all authentication checks
- ✅ Always renders children (no protection)

### 7. Login Screen (`src/components/LoginScreen.jsx`)
- ✅ Always redirects to home (no login UI shown)
- ✅ Commented out Cognito sign-in functionality

### 8. Sidebar (`src/components/Sidebar.jsx`)
- ✅ Uses mock auth
- ✅ Sign Out button is disabled (console.log only)

## How to Use

The application now works **WITHOUT any login**:

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173`

3. You will be **automatically logged in** (no authentication required)

4. All features are accessible without credentials

## Mock User Data

When Cognito is disabled, the following mock user is used:

```javascript
{
  profile: {
    sub: 'mock-user-id',
    email: 'demo@example.com',
    name: 'Demo User',
    email_verified: true,
    scope: 'openid email profile'
  },
  access_token: 'mock-access-token',
  id_token: 'mock-id-token'
}
```

## Re-enabling Cognito Authentication

To restore Cognito authentication:

### Step 1: Restore `src/main.jsx`
```javascript
// Uncomment these lines:
import { AuthProvider } from "react-oidc-context";

// Uncomment the cognitoAuthConfig object

// Restore AuthProvider wrapper:
root.render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
```

### Step 2: Restore `src/App.jsx`
```javascript
// Uncomment:
import { useAuth } from "react-oidc-context";

// Remove mock auth object and uncomment the original code
const auth = useAuth();
```

### Step 3: Restore Hooks
In `src/hooks/useApi.js` and `src/hooks/useSecureAuth.js`:
```javascript
// Change back to:
import { useAuth } from 'react-oidc-context';

// Remove:
const useAuth = useMockAuth;
```

### Step 4: Restore Components
- Restore `src/components/ProtectedRoute.jsx` - uncomment authentication checks
- Restore `src/components/LoginScreen.jsx` - uncomment sign-in UI
- Restore `src/components/Sidebar.jsx` - uncomment logout functionality

### Step 5: Delete Mock Auth (Optional)
```bash
rm src/hooks/useMockAuth.js
```

## Environment Variables

These are **NOT REQUIRED** when Cognito is disabled:
- `VITE_COGNITO_CLIENT_ID`
- `VITE_COGNITO_CLIENT_SECRET`
- `VITE_COGNITO_AUTHORITY`
- `VITE_COGNITO_REDIRECT_URI`
- `VITE_COGNITO_POST_LOGOUT_REDIRECT_URI`
- `VITE_COGNITO_HOSTED_UI_DOMAIN`

## Notes

⚠️ **This is for development/testing only**  
- Do NOT deploy to production without authentication
- All API calls that require real user tokens will fail
- Security features are bypassed

✅ **Benefits of this approach:**
- Faster development iteration
- No need for Cognito setup during initial development
- Can work offline
- Easy to switch back to Cognito when needed

## Files Modified

1. ✏️ `src/main.jsx`
2. ✏️ `src/App.jsx`
3. ✏️ `src/hooks/useApi.js`
4. ✏️ `src/hooks/useSecureAuth.js`
5. ✏️ `src/components/ProtectedRoute.jsx`
6. ✏️ `src/components/LoginScreen.jsx`
7. ✏️ `src/components/Sidebar.jsx`
8. ✏️ `src/components/UserInfoModal.jsx`
9. ✏️ `src/components/UserAPI.jsx`
10. ✏️ `src/components/ErrorScreen.jsx`
11. ✏️ `src/components/LogoutButtons.jsx`
12. ✏️ `src/components/ExternalClients.jsx`
13. ✏️ `src/components/Commessa.jsx`
14. ✏️ `src/components/Timesheets/TimeSheetList.jsx`
15. ✏️ `src/components/Timesheets/TimeSheetModal.jsx`
16. ➕ `src/hooks/useMockAuth.js` (NEW)

**Total: 16 files modified/created**

---

**Last Updated:** November 10, 2025  
**Status:** Cognito Authentication DISABLED
