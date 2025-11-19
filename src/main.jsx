import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// import { AuthProvider } from "react-oidc-context";
import "./index.css";
import { EnvValidator } from "./utils/envValidator";

// Validate environment variables before starting the app
try {
  const validation = EnvValidator.validate();
  if (import.meta.env.DEV) {
    EnvValidator.printConfig();
  }
} catch (error) {
  console.error('Failed to start application:', error.message);
  // Show error screen if validation fails
  document.getElementById('root').innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f3f4f6; padding: 20px;">
      <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 500px;">
        <h1 style="color: #dc2626; margin-bottom: 16px;">⚠️ Configuration Error</h1>
        <p style="color: #374151; margin-bottom: 16px;">${error.message}</p>
        <p style="color: #6b7280; font-size: 14px;">Please check your .env file and ensure all required environment variables are set.</p>
      </div>
    </div>
  `;
  throw error;
}

/* 
  COGNITO AUTHENTICATION DISABLED
  
  To re-enable AWS Cognito authentication, uncomment the code below and in App.jsx:
  
  import { AuthProvider } from "react-oidc-context";
  
  const cognitoAuthConfig = {
    authority: import.meta.env.VITE_COGNITO_AUTHORITY,
    client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
    client_secret: import.meta.env.VITE_COGNITO_CLIENT_SECRET,
    redirect_uri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
    post_logout_redirect_uri: import.meta.env.VITE_COGNITO_POST_LOGOUT_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile aws.cognito.signin.user.admin",
    automaticSilentRenew: false,
    loadUserInfo: false,
    monitorSession: false,
    filterProtocolClaims: true,
    response_mode: "query",
    revokeTokensOnSignout: true,
  };
  
  Then wrap <App /> with <AuthProvider {...cognitoAuthConfig}>
*/

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
