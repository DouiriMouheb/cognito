import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// import { AuthProvider } from "react-oidc-context";
import "./index.css";

// COGNITO AUTHENTICATION DISABLED - Commented out for development without login
/*
const cognitoAuthConfig = {
  authority: import.meta.env.VITE_COGNITO_AUTHORITY || "https://cognito-idp.eu-south-1.amazonaws.com/eu-south-1_gKX37NHrI",
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
  client_secret: import.meta.env.VITE_COGNITO_CLIENT_SECRET,
  redirect_uri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
  post_logout_redirect_uri: import.meta.env.VITE_COGNITO_POST_LOGOUT_REDIRECT_URI,
  response_type: "code",
  scope: "aws.cognito.signin.user.admin email https://web.sinergia.cloud/change-password https://web.sinergia.cloud/insideep https://web.sinergia.cloud/read.all https://web.sinergia.cloud/rt https://web.sinergia.cloud/write.all openid phone profile",

  // Configuration for proper logout handling
  automaticSilentRenew: false, // Disable to prevent logout conflicts
  loadUserInfo: false,
  monitorSession: false, // Disable to prevent logout issues
  filterProtocolClaims: true,
  response_mode: "query",
  revokeTokensOnSignout: true, // Ensures tokens are revoked on signout
};
*/


const root = ReactDOM.createRoot(document.getElementById("root"));

// Render app without AuthProvider (NO LOGIN REQUIRED)
root.render(
  <React.StrictMode>
    {/* <AuthProvider {...cognitoAuthConfig}> */}
      <App />
    {/* </AuthProvider> */}
  </React.StrictMode>
);
