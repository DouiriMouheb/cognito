import { useApi, useUserProfile } from '../hooks/useApi';
import LoadingScreen from './LoadingScreen';
import LogoutButtons from './LogoutButtons';

const UserDashboard = () => {
  const { profile, hasScope, getClaim } = useUserProfile();
  
  // Example API calls
  const { data: userData, loading: userLoading, error: userError } = useApi('/api/user/profile');
  const { data: ordersData, loading: ordersLoading } = useApi('/api/user/orders', {
    immediate: true,
    dependencies: [profile.sub] // Re-fetch when user changes
  });

  if (userLoading) {
    return <LoadingScreen message="Loading dashboard..." subtitle="Fetching your data" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile.name || profile.email}!
          </h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your account</p>
        </div>

        {/* User Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Email:</span> {profile.email}</p>
              <p><span className="font-medium">User ID:</span> {profile.sub}</p>
              {profile.phone_number && (
                <p><span className="font-medium">Phone:</span> {profile.phone_number}</p>
              )}
            </div>
          </div>

          {/* Permissions Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${hasScope('read.all') ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-sm">Read Access</span>
              </div>
              <div className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${hasScope('write.all') ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-sm">Write Access</span>
              </div>
              <div className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${hasScope('https://web.sinergia.cloud/insideep') ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-sm">Insideep Access</span>
              </div>
            </div>
          </div>

          {/* API Data Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">API Data</h3>
            {userError ? (
              <p className="text-red-600 text-sm">Error loading data</p>
            ) : userData ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Data loaded successfully</p>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-20">
                  {JSON.stringify(userData, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No API data configured</p>
            )}
          </div>
        </div>

        {/* Orders Section (if user has access) */}
        {hasScope('read.all') && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            </div>
            <div className="p-6">
              {ordersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading orders...</span>
                </div>
              ) : ordersData ? (
                <div className="space-y-4">
                  {ordersData.length > 0 ? (
                    ordersData.map((order, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <p className="font-medium">Order #{order.id || index + 1}</p>
                        <p className="text-sm text-gray-600">{order.description || 'No description'}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No orders found</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Orders API not configured</p>
              )}
            </div>
          </div>
        )}

        {/* Admin Section (only for users with admin scope) */}
        {hasScope('https://web.sinergia.cloud/insideep') && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">🔐 Admin Access</h3>
            <p className="text-yellow-700">You have administrative privileges and can access advanced features.</p>
          </div>
        )}

        {/* Logout Section */}
        <div className="mt-8 text-center">
          <LogoutButtons />
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
