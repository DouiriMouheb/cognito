# Cognito User Data Retrieval Guide & API Reference

## Overview
This guide explains how to retrieve user data from your backend API using the Cognito User ID, including the complete API implementation pattern used in the project.

## Authentication Flow Summary

```
1. User authenticates with AWS Cognito
2. Extract Cognito User ID (sub claim) from JWT token
3. Get OAuth2 access token for backend API
4. Call backend API with Cognito User ID
5. Receive internal user data mapped to Cognito ID
6. Cache user data for performance
```

## API Configuration

### Base Configuration
```javascript
const config = {
  baseUrl: 'https://api.sinergia.cloud/api',
  tokenUrl: 'https://api.sinergia.cloud/oauth/token',
  clientId: process.env.VITE_SINERGIA_CLIENT_ID,
  clientSecret: process.env.VITE_SINERGIA_CLIENT_SECRET
};
```

### Environment Variables Required
```bash
# Backend API Configuration
VITE_SINERGIA_CLIENT_ID=your_backend_api_client_id
VITE_SINERGIA_CLIENT_SECRET=your_backend_api_client_secret
VITE_SINERGIA_TOKEN_URL=https://api.sinergia.cloud/oauth/token

# Cognito Configuration
VITE_COGNITO_CLIENT_ID=your_cognito_client_id
VITE_COGNITO_CLIENT_SECRET=your_cognito_client_secret
```

## Step 1: OAuth2 Token Acquisition

### API Call: Get Backend Access Token
```http
POST https://api.sinergia.cloud/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET
```

### Implementation
```javascript
async getAccessToken() {
  const response = await fetch('https://api.sinergia.cloud/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
    }),
  });

  const data = await response.json();
  return data.access_token;
}
```

### Response Format
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

## Step 2: User Data Retrieval by Cognito ID

### API Call: Get User by Cognito ID
```http
GET https://api.sinergia.cloud/api/users/cognito/{cognitoId}
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Implementation
```javascript
async getUserByCognitoId(cognitoId, accessToken = null) {
  // Get access token if not provided
  const token = accessToken || await this.getAccessToken();
  
  // Make API call to get user by Cognito ID
  const endpoint = `/users/cognito/${cognitoId}`;
  const response = await this.makeAuthenticatedRequest(endpoint, token);
  
  return {
    success: true,
    data: response,
    message: `Successfully retrieved user for Cognito ID: ${cognitoId}`
  };
}
```

### Complete HTTP Request Example
```javascript
const cognitoId = "123e4567-e89b-12d3-a456-426614174000"; // From auth.user.profile.sub
const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

const response = await fetch(
  `https://api.sinergia.cloud/api/users/cognito/${cognitoId}`,
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }
  }
);

const userData = await response.json();
```

## Step 3: API Response Format

### Successful Response
```json
{
  "data": {
    "id": 12345,                           // Internal system user ID
    "cognitoId": "123e4567-e89b-...",     // Original Cognito User ID
    "email": "user@example.com",
    "deS_NOME": "John",                   // First name
    "deS_COGNOME": "Doe",                 // Last name
    "phone": "+1234567890",
    "department": "Engineering",
    "role": "Developer",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-08-05T15:45:00Z",
    "status": "active"
  }
}
```

### Error Response
```json
{
  "error": "User not found",
  "message": "No user found with Cognito ID: 123e4567-e89b-12d3-a456-426614174000",
  "code": "USER_NOT_FOUND",
  "timestamp": "2024-08-05T15:45:00Z"
}
```

## Step 4: Complete Implementation Example

### UserService Class Implementation
```javascript
class UserService {
  constructor() {
    this.baseUrl = 'https://api.sinergia.cloud/api';
    this.tokenUrl = 'https://api.sinergia.cloud/oauth/token';
    this.clientId = process.env.VITE_SINERGIA_CLIENT_ID;
    this.clientSecret = process.env.VITE_SINERGIA_CLIENT_SECRET;
  }

  // Step 1: Get OAuth2 access token
  async getAccessToken() {
    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  // Step 2: Make authenticated API request
  async makeAuthenticatedRequest(endpoint, accessToken, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  // Step 3: Get user by Cognito ID
  async getUserByCognitoId(cognitoId, accessToken = null) {
    try {
      const token = accessToken || await this.getAccessToken();
      const endpoint = `/users/cognito/${cognitoId}`;
      const response = await this.makeAuthenticatedRequest(endpoint, token);

      // Cache the user data
      if (response?.data?.id) {
        this.setCacheData(response.data.id, response);
      }

      return {
        success: true,
        data: response,
        message: `Successfully retrieved user for Cognito ID: ${cognitoId}`
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'USER_API_ERROR',
          message: `Failed to fetch user: ${error.message}`,
          cognitoId
        }
      };
    }
  }

  // Step 4: Get current user from Cognito context
  async getCurrentUser(cognitoUser) {
    if (!cognitoUser?.profile?.sub) {
      throw new Error('Invalid Cognito user context');
    }

    const cognitoId = cognitoUser.profile.sub;
    const accessToken = cognitoUser.access_token;

    return await this.getUserByCognitoId(cognitoId, accessToken);
  }
}
```

## Step 5: React Hook Implementation

### useSinergiaUser Hook
```javascript
import { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { userService } from '../services/userService';

export const useSinergiaUser = () => {
  const auth = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCurrentUser = async () => {
    if (!auth.user) return;

    setLoading(true);
    setError(null);

    try {
      const result = await userService.getCurrentUser(auth.user);
      
      if (result.success) {
        setUserData(result.data);
      } else {
        setError(result.error?.message || 'Failed to fetch user data');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-load user data when authenticated
  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      getCurrentUser();
    }
  }, [auth.isAuthenticated, auth.user]);

  return {
    userData,
    loading,
    error,
    getCurrentUser,
    cognitoId: auth.user?.profile?.sub,
    internalUserId: userData?.data?.id
  };
};
```

## Step 6: Usage in Components

### Component Implementation Example
```javascript
import { useAuth } from 'react-oidc-context';
import { useSinergiaUser } from '../hooks/useApi';

const UserProfile = () => {
  const auth = useAuth();
  const { userData, loading, error } = useSinergiaUser();

  // Extract data
  const cognitoData = auth.user?.profile || {};
  const internalData = userData?.data || {};

  // Display combined data with fallbacks
  const displayName = internalData.deS_NOME && internalData.deS_COGNOME 
    ? `${internalData.deS_NOME} ${internalData.deS_COGNOME}`
    : cognitoData.name || 'Unknown User';

  const email = internalData.email || cognitoData.email;
  const cognitoId = cognitoData.sub;
  const internalId = internalData.id;

  if (loading) return <div>Loading user data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>{displayName}</h2>
      <p>Email: {email}</p>
      <p>Cognito ID: {cognitoId}</p>
      <p>Internal ID: {internalId}</p>
    </div>
  );
};
```

## Backend API Requirements

### Database Schema Example
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,                    -- Internal user ID
  cognito_id VARCHAR(255) UNIQUE NOT NULL, -- Cognito User ID (sub claim)
  email VARCHAR(255) UNIQUE NOT NULL,
  deS_NOME VARCHAR(255),                   -- First name
  deS_COGNOME VARCHAR(255),                -- Last name
  phone VARCHAR(50),
  department VARCHAR(100),
  role VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast Cognito ID lookups
CREATE INDEX idx_users_cognito_id ON users(cognito_id);
```

### Backend Endpoint Implementation (Express.js Example)
```javascript
// GET /api/users/cognito/:cognitoId
app.get('/api/users/cognito/:cognitoId', authenticateToken, async (req, res) => {
  try {
    const { cognitoId } = req.params;
    
    // Query database for user by Cognito ID
    const user = await User.findOne({ 
      where: { cognito_id: cognitoId } 
    });
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: `No user found with Cognito ID: ${cognitoId}`,
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Return user data
    res.json({
      data: {
        id: user.id,
        cognitoId: user.cognito_id,
        email: user.email,
        deS_NOME: user.first_name,
        deS_COGNOME: user.last_name,
        phone: user.phone,
        department: user.department,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
    
  } catch (error) {
    console.error('Error fetching user by Cognito ID:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});
```

## Caching Strategy

### Cache Implementation
```javascript
// Cache configuration (1 hour expiry)
setCacheData(userId, userData) {
  const timestamp = Date.now();
  localStorage.setItem('internal_user_id', userId.toString());
  localStorage.setItem('user_data', JSON.stringify(userData));
  localStorage.setItem('cache_timestamp', timestamp.toString());
}

getCachedUserId() {
  const userId = localStorage.getItem('internal_user_id');
  const timestamp = localStorage.getItem('cache_timestamp');
  
  if (!userId || !timestamp) return null;
  
  // Check cache expiry (1 hour)
  const cacheAge = Date.now() - parseInt(timestamp);
  const maxAge = 60 * 60 * 1000; // 1 hour
  
  if (cacheAge > maxAge) {
    this.clearCache();
    return null;
  }
  
  return userId;
}
```

## Error Handling

### Common Error Scenarios
1. **Invalid Cognito ID**: User not found in backend database
2. **Authentication Failure**: OAuth2 token request fails
3. **Network Errors**: API request timeout or connection issues
4. **Token Expiry**: Access token expired during request
5. **Permission Errors**: User lacks required permissions

### Error Handling Implementation
```javascript
try {
  const result = await userService.getUserByCognitoId(cognitoId);
  
  if (result.success) {
    // Handle successful response
    setUserData(result.data);
  } else {
    // Handle API error
    setError(result.error.message);
  }
} catch (networkError) {
  // Handle network/connection errors
  setError('Unable to connect to server. Please try again.');
}
```

## Summary

This API pattern provides:
- **Secure authentication** using OAuth2 client credentials
- **Cognito ID to Internal ID mapping** for seamless integration
- **Caching** for improved performance
- **Error handling** for robust user experience
- **Fallback mechanisms** when data is unavailable

The key API endpoint is:
**`GET /api/users/cognito/{cognitoId}`** with Bearer token authentication.
