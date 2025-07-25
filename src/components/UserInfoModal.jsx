import React from 'react';
import { useAuth } from 'react-oidc-context';
import { useSinergiaUser } from '../hooks/useApi';
import { Modal } from './common/Modal';
import { Button } from './common/Button';
import { 
  User, 
  Mail, 
  Phone, 
  Hash, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Loader,
  X 
} from 'lucide-react';

const UserInfoModal = ({ isOpen, onClose }) => {
  const auth = useAuth();
  const { userData, loading, error, getCurrentUser, cognitoId, isLoaded } = useSinergiaUser();

  // Handle refresh user data
  const handleRefresh = async () => {
    await getCurrentUser();
  };

  // Extract user information from API response
  const sinergiaUser = userData?.data || {};
  const cognitoUser = auth.user?.profile || {};

  // Combine first and last name
  const fullName = sinergiaUser.deS_NOME && sinergiaUser.deS_COGNOME 
    ? `${sinergiaUser.deS_NOME} ${sinergiaUser.deS_COGNOME}`
    : cognitoUser.name || 'Unknown User';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Profile">
      <div className="space-y-6">
        {/* Header with User Avatar and Name */}
        <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{fullName}</h3>
            <p className="text-sm text-gray-600">
              {sinergiaUser.email || cognitoUser.email || 'No email available'}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-blue-600 mr-3" />
            <span className="text-gray-600">Loading user information...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-800">Unable to load Sinergia data</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <p className="text-xs text-red-600 mt-2">Showing Cognito information only</p>
              </div>
            </div>
          </div>
        )}

        {/* Simple User Info Only: ID, Name, Email, Phone */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Hash className="w-4 h-4 text-gray-600" />
            <span className="text-gray-800 font-medium">ID:</span>
            <span className="text-gray-900 font-mono text-xs">{sinergiaUser.id || cognitoId || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-600" />
            <span className="text-gray-800 font-medium">Name:</span>
            <span className="text-gray-900">{(sinergiaUser.deS_NOME && sinergiaUser.deS_COGNOME) ? `${sinergiaUser.deS_NOME} ${sinergiaUser.deS_COGNOME}` : cognitoUser.name || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-gray-600" />
            <span className="text-gray-800 font-medium">Email:</span>
            <span className="text-gray-900">{sinergiaUser.email || cognitoUser.email || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-gray-600" />
            <span className="text-gray-800 font-medium">Phone:</span>
            <span className="text-gray-900">{sinergiaUser.telefono || 'N/A'}</span>
          </div>
        </div>

        {/* 
        
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            
             <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </Button>
           
         
          
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div> */}
      </div>
    </Modal>
  );
};

export default UserInfoModal;
