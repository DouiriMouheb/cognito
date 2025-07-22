import UserProfile from './UserProfile';
import TokensDisplay from './TokensDisplay';
import LogoutButtons from './LogoutButtons';

const Dashboard = ({ user }) => {
  const profile = user?.profile || {};

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

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <UserProfile profile={profile} />
          <TokensDisplay user={user} />
          <LogoutButtons />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
