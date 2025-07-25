import { useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserProfile } from '../hooks/useApi';
import UserInfoModal from './UserInfoModal';

const Sidebar = ({ isOpen, onToggle }) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // const { profile } = useUserProfile();
  // const [showUserModal, setShowUserModal] = useState(false);

  const handleSignOut = async () => {
    try {
      // Set logout flag to prevent UI flickering
      localStorage.setItem('logout_in_progress', 'true');

      // Clear local user data first
      await auth.removeUser();

      // Clear browser storage (but keep logout flag)
      sessionStorage.clear();

      // Clear auth-related cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Clear other localStorage items but keep logout flag
      const logoutFlag = localStorage.getItem('logout_in_progress');
      localStorage.clear();
      localStorage.setItem('logout_in_progress', logoutFlag);

      // Redirect to Cognito logout with proper hosted UI domain
      const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
      const logoutUri = import.meta.env.VITE_COGNITO_POST_LOGOUT_REDIRECT_URI;

      // Use the hosted UI domain (not the OIDC issuer)
      const hostedUIDomain = import.meta.env.VITE_COGNITO_HOSTED_UI_DOMAIN || "https://sinergiaiam.auth.eu-south-1.amazoncognito.com";
      const logoutUrl = `${hostedUIDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;

      // Redirect to Cognito logout
      window.location.href = logoutUrl;

    } catch (error) {
      console.error("Logout error:", error);
      // Fallback to local logout if anything fails
      localStorage.removeItem('logout_in_progress');
      sessionStorage.clear();
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        w-80 lg:w-72
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <p className="text-sm text-gray-500">Navigation</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Info removed from Sidebar */}

        {/* Navigation Menu */}
        <nav className="flex-1 p-6">
          <div className="space-y-2">
                            {/* APIs Link - Disabled */}
                            {/*
                            <button
                              onClick={() => {
                                navigate('/apis');
                                onToggle();
                              }}
                              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                                location.pathname === '/apis'
                                  ? 'text-green-700 bg-green-50'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                              }`}
                            >
                              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              APIs
                            </button>
                            */}

            {/* Timesheets Link */}
            <button
              onClick={() => {
                navigate('/timesheets');
                onToggle();
              }}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === '/timesheets'
                  ? 'text-green-700 bg-green-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Timesheets
            </button>
          </div>
        </nav>

        {/* Footer with Sign Out */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>

      {/* UserInfoModal removed from Sidebar */}
    </>
  );
};

export default Sidebar;
