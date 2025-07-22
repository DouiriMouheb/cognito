import { useState } from 'react';
import { useAuthenticatedRequest, useUserProfile } from '../hooks/useApi';

const ApiTestComponent = () => {
  const { makeRequest, loading } = useAuthenticatedRequest();
  const { accessToken, idToken } = useUserProfile();
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const testApiCall = async (endpoint, method = 'GET', body = null) => {
    try {
      setError(null);
      setResponse(null);
      
      const result = await makeRequest(endpoint, {
        method,
        body: body ? JSON.stringify(body) : undefined
      });
      
      setResponse(result);
    } catch (err) {
      setError(err.message);
    }
  };

  const testEndpoints = [
    { name: 'Get User Profile', endpoint: '/api/user/profile', method: 'GET' },
    { name: 'Get User Orders', endpoint: '/api/user/orders', method: 'GET' },
    { name: 'Update Profile', endpoint: '/api/user/profile', method: 'PUT', body: { name: 'Updated Name' } },
    { name: 'Test Protected Route', endpoint: '/api/protected', method: 'GET' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">API Testing Dashboard</h2>
      
      {/* Token Information */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication Tokens</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Access Token</label>
            <textarea
              className="w-full h-20 p-2 border border-gray-300 rounded-md text-xs font-mono bg-gray-50"
              value={accessToken || 'No access token'}
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ID Token</label>
            <textarea
              className="w-full h-20 p-2 border border-gray-300 rounded-md text-xs font-mono bg-gray-50"
              value={idToken || 'No ID token'}
              readOnly
            />
          </div>
        </div>
      </div>

      {/* API Test Buttons */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Test API Endpoints</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testEndpoints.map((test, index) => (
            <button
              key={index}
              onClick={() => testApiCall(test.endpoint, test.method, test.body)}
              disabled={loading}
              className={`p-4 rounded-lg border-2 border-dashed transition-colors ${
                loading 
                  ? 'border-gray-300 bg-gray-100 cursor-not-allowed' 
                  : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50'
              }`}
            >
              <div className="text-left">
                <div className="font-medium text-gray-900">{test.name}</div>
                <div className="text-sm text-gray-500">{test.method} {test.endpoint}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom API Test */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom API Test</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
              <select 
                id="method"
                className="w-full p-2 border border-gray-300 rounded-md"
                defaultValue="GET"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint</label>
              <input
                type="text"
                id="endpoint"
                placeholder="/api/your-endpoint"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Request Body (JSON)</label>
            <textarea
              id="requestBody"
              placeholder='{"key": "value"}'
              className="w-full h-20 p-2 border border-gray-300 rounded-md font-mono text-sm"
            />
          </div>
          <button
            onClick={() => {
              const method = document.getElementById('method').value;
              const endpoint = document.getElementById('endpoint').value;
              const bodyText = document.getElementById('requestBody').value;
              let body = null;
              
              if (bodyText.trim()) {
                try {
                  body = JSON.parse(bodyText);
                } catch (e) {
                  setError('Invalid JSON in request body');
                  return;
                }
              }
              
              testApiCall(endpoint, method, body);
            }}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {loading ? 'Testing...' : 'Test Custom Endpoint'}
          </button>
        </div>
      </div>

      {/* Response Display */}
      {(response || error) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Response</h3>
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-800 font-medium">Error:</div>
              <div className="text-red-700 mt-1">{error}</div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="text-green-800 font-medium mb-2">Success:</div>
              <pre className="text-sm text-green-700 overflow-auto max-h-64 bg-white p-2 rounded border">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApiTestComponent;
