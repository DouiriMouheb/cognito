# 🔧 Logout Error Troubleshooting

## Error Details
```
{"code":"BadRequest","message":"The server did not understand the operation that was requested.","type":"client"}
```

## ✅ **Fixes Applied**

### 1. **Reverted Problematic Settings**
- Disabled `automaticSilentRenew` (was causing conflicts)
- Disabled `monitorSession` (was interfering with logout)
- Removed `checkSessionInterval` (was causing background requests)

### 2. **Fixed Logout Method**
- Changed from custom logout URL to standard `auth.signoutRedirect()`
- Added proper error handling with fallback

### 3. **Environment Configuration**
- Verified `VITE_COGNITO_AUTHORITY` is correct
- Ensured all redirect URIs are properly set

## 🔍 **Current Configuration**

### **main.jsx (Fixed)**
```javascript
const cognitoAuthConfig = {
  authority: import.meta.env.VITE_COGNITO_AUTHORITY || "https://cognito-idp.eu-south-1.amazonaws.com/eu-south-1_gKX37NHrI",
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
  client_secret: import.meta.env.VITE_COGNITO_CLIENT_SECRET,
  redirect_uri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
  post_logout_redirect_uri: import.meta.env.VITE_COGNITO_POST_LOGOUT_REDIRECT_URI,
  response_type: "code",
  scope: "aws.cognito.signin.user.admin email https://web.sinergia.cloud/change-password https://web.sinergia.cloud/insideep https://web.sinergia.cloud/read.all https://web.sinergia.cloud/rt https://web.sinergia.cloud/write.all openid phone profile",

  // Stable configuration for logout
  automaticSilentRenew: false,
  loadUserInfo: false,
  monitorSession: false,
  filterProtocolClaims: true,
  response_mode: "query",
  revokeTokensOnSignout: true,
};
```

### **LogoutButtons.jsx (Fixed)**
```javascript
const handleSignOut = async () => {
  try {
    // Use standard OIDC logout
    await auth.signoutRedirect();
  } catch (error) {
    console.error("Logout error:", error);
    // Fallback to local logout
    handleLocalSignOut();
  }
};
```

## 🚨 **If Error Persists**

### **Check AWS Cognito Settings:**

1. **App Client Settings:**
   - ✅ Callback URLs: `http://localhost:5173/signin-oidc`
   - ✅ Sign out URLs: `http://localhost:5173/signout-oidc`
   - ✅ OAuth flows: Authorization code grant
   - ✅ OAuth scopes: Match your scope string

2. **Hosted UI Domain:**
   - Verify your Cognito domain is active
   - Check if custom domain is configured correctly

### **Debug Steps:**

1. **Check Browser Network Tab:**
   - Look for the logout request
   - Check the exact URL being called
   - Verify response details

2. **Test Simple Logout:**
   ```javascript
   // Try this in browser console
   window.location.href = 'http://localhost:5173/signout-oidc';
   ```

3. **Verify Environment Variables:**
   ```bash
   # Check if all variables are loaded
   console.log(import.meta.env.VITE_COGNITO_AUTHORITY);
   console.log(import.meta.env.VITE_COGNITO_POST_LOGOUT_REDIRECT_URI);
   ```

### **Alternative Logout Methods:**

#### **Method 1: Direct Cognito Logout**
```javascript
const handleDirectLogout = () => {
  const domain = "https://sinergiaiam.auth.eu-south-1.amazoncognito.com";
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
  const logoutUri = import.meta.env.VITE_COGNITO_POST_LOGOUT_REDIRECT_URI;
  
  window.location.href = `${domain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
};
```

#### **Method 2: Local Only Logout**
```javascript
const handleLocalLogout = async () => {
  await auth.removeUser();
  sessionStorage.clear();
  localStorage.clear();
  window.location.reload();
};
```

## 🔧 **Quick Fix Options**

### **Option 1: Use Local Logout Only**
If the error persists, you can temporarily use only local logout:

```javascript
// In LogoutButtons.jsx
const handleSignOut = () => {
  handleLocalSignOut(); // Skip OIDC logout for now
};
```

### **Option 2: Add More Error Handling**
```javascript
const handleSignOut = async () => {
  try {
    await auth.signoutRedirect();
  } catch (error) {
    console.error("OIDC logout failed:", error);
    
    // Try direct Cognito logout
    try {
      const domain = "https://sinergiaiam.auth.eu-south-1.amazoncognito.com";
      const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
      const logoutUri = import.meta.env.VITE_COGNITO_POST_LOGOUT_REDIRECT_URI;
      
      window.location.href = `${domain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    } catch (directError) {
      console.error("Direct logout failed:", directError);
      handleLocalSignOut();
    }
  }
};
```

## ✅ **Test the Fix**

1. **Restart your development server**
2. **Clear browser cache and cookies**
3. **Try logging out again**
4. **Check browser console for any new errors**

The logout should now work properly with the standard OIDC method!
