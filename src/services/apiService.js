// API Service for making authenticated requests with Cognito tokens

class ApiService {
  constructor(baseURL = import.meta.env.VITE_API_BASE_URL || 'https://api.example.com') {
    this.baseURL = baseURL;
  }

  // Get the current user's access token
  getAccessToken() {
    // Get the user from OIDC context (you'll need to pass this in)
    const userStr = localStorage.getItem(`oidc.user:${import.meta.env.VITE_COGNITO_AUTHORITY}:${import.meta.env.VITE_COGNITO_CLIENT_ID}`);
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.access_token;
    }
    return null;
  }

  // Get the current user's ID token
  getIdToken() {
    const userStr = localStorage.getItem(`oidc.user:${import.meta.env.VITE_COGNITO_AUTHORITY}:${import.meta.env.VITE_COGNITO_CLIENT_ID}`);
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id_token;
    }
    return null;
  }

  // Create headers with authentication
  createHeaders(additionalHeaders = {}) {
    const accessToken = this.getAccessToken();
    const headers = {
      'Content-Type': 'application/json',
      ...additionalHeaders
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.createHeaders(options.headers),
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      // Handle token expiration
      if (response.status === 401) {
        // Token might be expired, you could trigger a refresh here
        throw new Error('Authentication failed - token may be expired');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle different content types
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET'
    });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  // PATCH request
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // Upload file with authentication
  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add additional form data
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
        'Authorization': `Bearer ${this.getAccessToken()}`
      }
    });
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
