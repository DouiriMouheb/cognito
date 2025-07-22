import { useAuth } from "react-oidc-context";
import { useEffect } from "react";

function App() {
  const auth = useAuth();

  useEffect(() => {
    console.log("Auth state:", {
      isLoading: auth.isLoading,
      isAuthenticated: auth.isAuthenticated,
      error: auth.error,
      user: auth.user ? 'User exists' : 'No user',
      pathname: window.location.pathname
    });
  }, [auth.isLoading, auth.isAuthenticated, auth.error, auth.user]);

  const signOutRedirect = () => {
    const clientId = "4iuqfcq2ch647elek55lir09uo";
    const logoutUri = "http://localhost:5173/signout-oidc";
    const cognitoDomain = "https://sinergiaiam.auth.eu-south-1.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  // Show loading during authentication
  if (auth.isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Loading...</div>
        <div>Current path: {window.location.pathname}</div>
        <div>Processing authentication...</div>
      </div>
    );
  }

  if (auth.error) {
    console.error("Auth error:", auth.error);

    const clearAuthState = () => {
      // Clear session storage
      sessionStorage.clear();
      localStorage.clear();
      // Redirect to home
      window.location.href = '/';
    };

    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ backgroundColor: '#ffebee', padding: '20px', borderRadius: '8px', border: '1px solid #f44336' }}>
          <h2 style={{ color: '#d32f2f' }}>Authentication Error</h2>
          <p><strong>Error:</strong> {auth.error.message}</p>

          {auth.error.message === "No matching state found in storage" && (
            <div style={{ backgroundColor: '#fff3e0', padding: '15px', borderRadius: '5px', margin: '10px 0' }}>
              <p><strong>This usually happens when:</strong></p>
              <ul>
                <li>The browser session was interrupted</li>
                <li>You refreshed the page during login</li>
                <li>Multiple login attempts were made</li>
              </ul>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button
              onClick={clearAuthState}
              style={{
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Clear State & Retry
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
          </div>

          <details style={{ marginTop: '15px' }}>
            <summary style={{ cursor: 'pointer', color: '#666' }}>Show Error Details</summary>
            <pre style={{ fontSize: '12px', overflow: 'auto', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '3px' }}>
              {JSON.stringify(auth.error, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  if (auth.isAuthenticated) {
    const user = auth.user;
    const profile = user?.profile || {};

    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ backgroundColor: '#f0f8ff', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h1 style={{ color: '#2c3e50', marginBottom: '20px' }}>Welcome! 🎉</h1>

          <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
            <h3 style={{ color: '#34495e', marginBottom: '10px' }}>User Information</h3>
            <div style={{ display: 'grid', gap: '8px' }}>
              {profile.email && (
                <div><strong>Email:</strong> {profile.email}</div>
              )}
              {profile.name && (
                <div><strong>Name:</strong> {profile.name}</div>
              )}
              {profile.given_name && (
                <div><strong>First Name:</strong> {profile.given_name}</div>
              )}
              {profile.family_name && (
                <div><strong>Last Name:</strong> {profile.family_name}</div>
              )}
              {profile.phone_number && (
                <div><strong>Phone:</strong> {profile.phone_number}</div>
              )}
              {profile.sub && (
                <div><strong>User ID:</strong> {profile.sub}</div>
              )}
              {profile.username && (
                <div><strong>Username:</strong> {profile.username}</div>
              )}
              {profile.preferred_username && (
                <div><strong>Preferred Username:</strong> {profile.preferred_username}</div>
              )}
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
            <h3 style={{ color: '#34495e', marginBottom: '10px' }}>Session Information</h3>
            <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
              <div><strong>Login Time:</strong> {new Date(profile.auth_time * 1000).toLocaleString()}</div>
              <div><strong>Token Expires:</strong> {new Date(profile.exp * 1000).toLocaleString()}</div>
              <div><strong>Issuer:</strong> {profile.iss}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={() => auth.removeUser()}
              style={{
                backgroundColor: '#e74c3c',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Sign Out
            </button>

            <button
              onClick={() => signOutRedirect()}
              style={{
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Sign Out (Redirect)
            </button>
          </div>
        </div>

        {/* Debug section - can be removed in production */}
        <details style={{ marginTop: '20px' }}>
          <summary style={{ cursor: 'pointer', color: '#7f8c8d' }}>Debug Information (Click to expand)</summary>
          <div style={{ backgroundColor: '#ecf0f1', padding: '15px', borderRadius: '5px', marginTop: '10px' }}>
            <h4>Full Profile Object:</h4>
            <pre style={{ fontSize: '12px', overflow: 'auto' }}>
              {JSON.stringify(profile, null, 2)}
            </pre>

            <h4 style={{ marginTop: '15px' }}>Tokens:</h4>
            <div style={{ fontSize: '12px' }}>
              <div><strong>ID Token:</strong> {user?.id_token ? `${user.id_token.substring(0, 50)}...` : 'Not available'}</div>
              <div><strong>Access Token:</strong> {user?.access_token ? `${user.access_token.substring(0, 50)}...` : 'Not available'}</div>
              <div><strong>Refresh Token:</strong> {user?.refresh_token ? `${user.refresh_token.substring(0, 50)}...` : 'Not available'}</div>
            </div>
          </div>
        </details>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => auth.signinRedirect()}>Sign in</button>
      <button onClick={() => signOutRedirect()}>Sign out</button>
    </div>
  );
}

export default App;
