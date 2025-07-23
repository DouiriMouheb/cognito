import { useState } from 'react';
import ExternalClients from './ExternalClients';
import Commessa from './Commessa';

const APIs = () => {
  const [activeTab, setActiveTab] = useState('clients');

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">APIs</h2>
        <p className="text-gray-600 mt-2">Manage external data sources and integrations</p>
      </div>

      {/* Tab Navigation */}
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
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {/* External Clients Tab */}
      {activeTab === 'clients' && (
        <ExternalClients />
      )}

      {/* Commessa Tab */}
      {activeTab === 'commessa' && (
        <Commessa />
      )}
    </div>
  );
};

export default APIs;
