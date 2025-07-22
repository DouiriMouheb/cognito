const TokensDisplay = ({ user }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
        <h2 className="text-xl font-semibold text-white">Authentication Tokens</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">ID Token</p>
            <p className="text-xs text-gray-900 bg-gray-50 p-3 rounded-md font-mono break-all">
              {user?.id_token ? `${user.id_token.substring(0, 100)}...` : 'Not available'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Access Token</p>
            <p className="text-xs text-gray-900 bg-gray-50 p-3 rounded-md font-mono break-all">
              {user?.access_token ? `${user.access_token.substring(0, 100)}...` : 'Not available'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Refresh Token</p>
            <p className="text-xs text-gray-900 bg-gray-50 p-3 rounded-md font-mono break-all">
              {user?.refresh_token ? `${user.refresh_token.substring(0, 100)}...` : 'Not available'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokensDisplay;
