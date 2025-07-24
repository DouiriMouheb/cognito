import { useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useSinergiaUser } from '../hooks/useApi';
import { showToast } from '../utils/toast';
import { User, RefreshCw, Search, AlertCircle, CheckCircle, Loader } from 'lucide-react';

const UserAPI = () => {
  const auth = useAuth();
  const {
    userData,
    loading,
    error,
    getCurrentUser,
    getUserByCognitoId,
    getSinergiaUserId,
    cognitoId,
    sinergiaUserId,
    isLoaded,
    isCacheValid
  } = useSinergiaUser();
  const [searchCognitoId, setSearchCognitoId] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [userIdDemo, setUserIdDemo] = useState('');
  const [userIdLoading, setUserIdLoading] = useState(false);

  // Handle search for user by Cognito ID
  const handleSearch = async () => {
    if (!searchCognitoId.trim()) {
      showToast.error('Please enter a Cognito ID');
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      const result = await getUserByCognitoId(searchCognitoId.trim());
      if (result) {
        setSearchResult(result);
        showToast.success('User found successfully');
      } else {
        setSearchError('User not found or API error');
        showToast.error('User not found');
      }
    } catch (err) {
      setSearchError(err.message);
      showToast.error('Search failed');
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle refresh current user
  const handleRefresh = async () => {
    try {
      await getCurrentUser();
      showToast.success('User data refreshed');
    } catch (err) {
      showToast.error('Failed to refresh user data');
    }
  };

  // Handle get user ID demo
  const handleGetUserId = async () => {
    setUserIdLoading(true);
    try {
      const userId = await getSinergiaUserId();
      if (userId) {
        setUserIdDemo(userId);
        showToast.success(`User ID retrieved: ${userId}`);
      } else {
        setUserIdDemo('Failed to get user ID');
        showToast.error('Failed to get user ID');
      }
    } catch (err) {
      setUserIdDemo('Error occurred');
      showToast.error('Error getting user ID');
    } finally {
      setUserIdLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">User API</h3>
            <p className="text-sm text-gray-600">
              Fetch user information from Sinergia Cloud API using Cognito ID
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">API Endpoint:</p>
              <code className="bg-blue-100 px-2 py-1 rounded text-xs">
                GET https://api.sinergia.cloud/api/users/cognito/{'{cognito_id}'}
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Current User Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900">Current User</h4>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Current User Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Cognito ID:</span>
              <p className="text-gray-900 font-mono text-xs mt-1">{cognitoId || 'Not available'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Email:</span>
              <p className="text-gray-900 mt-1">{auth.user?.profile?.email || 'Not available'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Name:</span>
              <p className="text-gray-900 mt-1">{auth.user?.profile?.name || 'Not available'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Sinergia User ID:</span>
              <p className="text-gray-900 mt-1 font-mono text-sm">
                {sinergiaUserId || 'Not loaded'}
                {sinergiaUserId && (
                  <span className="ml-2 text-xs text-green-600">
                    (Cached: {isCacheValid ? 'Valid' : 'Expired'})
                  </span>
                )}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Status:</span>
              <div className="flex items-center mt-1">
                {loading ? (
                  <><Loader className="w-4 h-4 animate-spin text-blue-600 mr-2" /> Loading...</>
                ) : error ? (
                  <><AlertCircle className="w-4 h-4 text-red-600 mr-2" /> Error</>
                ) : isLoaded ? (
                  <><CheckCircle className="w-4 h-4 text-green-600 mr-2" /> Loaded</>
                ) : (
                  <><AlertCircle className="w-4 h-4 text-gray-400 mr-2" /> Not loaded</>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Current User API Response */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-blue-600 mr-3" />
            <span className="text-gray-600">Loading user data...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-medium text-red-800">Error</h5>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {userData && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-medium text-green-800">API Response</h5>
                <p className="text-sm text-green-700">User data retrieved successfully</p>
              </div>
            </div>
            <pre className="bg-white border border-green-200 rounded p-3 text-xs overflow-x-auto">
              {JSON.stringify(userData, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* User ID Demo Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Get Sinergia User ID (Cached)</h4>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">For Future API Calls:</p>
              <p>Use <code className="bg-yellow-100 px-1 rounded">getSinergiaUserId()</code> to get the cached user ID for API requests. This ID is automatically cached and persists across browser sessions.</p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mb-4">
          <button
            onClick={handleGetUserId}
            disabled={userIdLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            <User className={`w-4 h-4 mr-2 ${userIdLoading ? 'animate-spin' : ''}`} />
            Get User ID
          </button>

          {userIdDemo && (
            <div className="flex items-center px-3 py-2 bg-gray-100 rounded-md">
              <span className="text-sm text-gray-700 mr-2">ID:</span>
              <code className="text-sm font-mono text-gray-900">{userIdDemo}</code>
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-2">Usage Example:</h5>
          <pre className="text-xs text-gray-700 overflow-x-auto">
{`// In your component:
const { getSinergiaUserId } = useSinergiaUser();

// For API calls:
const userId = await getSinergiaUserId();
if (userId) {
  const response = await fetch(\`/api/endpoint/\${userId}\`);
  // ... handle response
}`}
          </pre>
        </div>
      </div>

      {/* Search User Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Search User by Cognito ID</h4>
        
        <div className="flex space-x-3 mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchCognitoId}
              onChange={(e) => setSearchCognitoId(e.target.value)}
              placeholder="Enter Cognito ID (e.g., 12345678-1234-1234-1234-123456789012)"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searchLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Search className={`w-4 h-4 mr-2 ${searchLoading ? 'animate-spin' : ''}`} />
            Search
          </button>
        </div>

        {/* Search Results */}
        {searchLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-blue-600 mr-3" />
            <span className="text-gray-600">Searching...</span>
          </div>
        )}

        {searchError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-medium text-red-800">Search Error</h5>
                <p className="text-sm text-red-700 mt-1">{searchError}</p>
              </div>
            </div>
          </div>
        )}

        {searchResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-medium text-green-800">User Found</h5>
                <p className="text-sm text-green-700">Search completed successfully</p>
              </div>
            </div>
            <pre className="bg-white border border-green-200 rounded p-3 text-xs overflow-x-auto">
              {JSON.stringify(searchResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAPI;
