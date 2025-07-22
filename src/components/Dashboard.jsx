import { useState } from 'react';
import UserProfile from './UserProfile';
import TokensDisplay from './TokensDisplay';
import LogoutButtons from './LogoutButtons';
import UserDashboard from './UserDashboard';

const Dashboard = ({ user }) => {
  const profile = user?.profile || {};
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'dashboard', name: 'User Dashboard', icon: '🏠' },
    { id: 'tokens', name: 'Tokens', icon: '🎫' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <UserProfile profile={profile} />
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 What's Next?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">Protected Routes</h4>
                  <p className="text-sm text-blue-700 mt-1">Use ProtectedRoute component to secure your pages</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900">API Integration</h4>
                  <p className="text-sm text-green-700 mt-1">Make authenticated API calls with useApi hook</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900">User Dashboard</h4>
                  <p className="text-sm text-purple-700 mt-1">Check the User Dashboard tab for examples</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-900">Token Management</h4>
                  <p className="text-sm text-orange-700 mt-1">View and manage your authentication tokens</p>
                </div>
              </div>
            </div>
            <LogoutButtons />
          </div>
        );
      case 'dashboard':
        return <UserDashboard />;
      case 'tokens':
        return (
          <div className="space-y-6">
            <TokensDisplay user={user} />
            <LogoutButtons />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
          <p className="text-gray-600">Successfully authenticated with AWS Cognito</p>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-lg shadow-lg p-2">
            <nav className="flex space-x-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
