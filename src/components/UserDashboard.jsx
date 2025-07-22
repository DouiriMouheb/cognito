import { useApi, useUserProfile } from '../hooks/useApi';
import LoadingScreen from './LoadingScreen';

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
    <div className="w-full">
      {/* Welcome Message */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile.name || profile.email}!
        </h2>
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

      {/* Additional Content for Scrolling Demo */}
      <div className="mt-8 space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Analytics Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Total Sessions</p>
              <p className="text-2xl font-bold text-blue-900">1,234</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Active Users</p>
              <p className="text-2xl font-bold text-green-900">567</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Conversion Rate</p>
              <p className="text-2xl font-bold text-purple-900">12.3%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Recent Activity</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-semibold text-sm">{item}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Activity {item}</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
                <div className="text-xs text-gray-400">
                  View Details
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="font-medium text-gray-900">Create New</p>
              <p className="text-sm text-gray-500">Add new item</p>
            </button>
            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="font-medium text-gray-900">Generate Report</p>
              <p className="text-sm text-gray-500">Export data</p>
            </button>
            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="font-medium text-gray-900">Settings</p>
              <p className="text-sm text-gray-500">Configure app</p>
            </button>
            <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition-colors">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-medium text-gray-900">Help & Support</p>
              <p className="text-sm text-gray-500">Get assistance</p>
            </button>
          </div>
        </div>

        {/* Bottom spacing for better scrolling */}
        <div className="h-8"></div>
      </div>
    </div>
  );
};

export default UserDashboard;
