import { useState } from 'react';
import ExternalClients from './ExternalClients';
import Commessa from './Commessa';
import UserAPI from './UserAPI';

const APIs = () => {
  const [activeTab, setActiveTab] = useState('clients');

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">APIs</h2>
        <p className="text-gray-600 mt-2">Manage external data sources and integrations</p>
      </div>

      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('clients')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'clients'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              External Clients
            </button>
            <button
              onClick={() => setActiveTab('commessa')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'commessa'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Commessa
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              User API
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'clients' && <ExternalClients />}
      {activeTab === 'commessa' && <Commessa />}
      {activeTab === 'users' && <UserAPI />}
    </div>
  );
};

export default APIs;
