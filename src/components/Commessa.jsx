import { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { commessaService } from '../services/commessaService';
import { showToast } from '../utils/toast';

const Commessa = () => {
  const auth = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [commesse, setCommesse] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingOrganizations, setLoadingOrganizations] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPreviousPage: false
  });

  // Load organizations on component mount
  useEffect(() => {
    loadOrganizations();
  }, []);

  // Load commesse when organization is selected
  useEffect(() => {
    if (selectedOrganization) {
      loadCommesse();
    } else {
      setCommesse([]);
      setStats(null);
    }
  }, [selectedOrganization]);

  const loadOrganizations = async () => {
    try {
      setLoadingOrganizations(true);
      const response = commessaService.getOrganizations();
      setOrganizations(response.data.organizations);
    } catch (error) {
      console.error("Error loading organizations:", error);
      showToast.error("Failed to load organizations");
    } finally {
      setLoadingOrganizations(false);
    }
  };

  const loadCommesse = async (page = 1) => {
    if (!selectedOrganization || !auth.user?.access_token) return;

    try {
      setLoading(true);
      const response = await commessaService.getCommesseForOrganization(
        selectedOrganization,
        auth.user.access_token,
        {
          page: page,
          limit: 10,
          search: searchTerm
        }
      );

      if (response.success) {
        setCommesse(response.data.commesse || []);
        setPagination(response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPreviousPage: false
        });

        if (response.message) {
          showToast.success(response.message);
        }

        // Load statistics
        loadStats();
      } else {
        showToast.error(response.error?.message || "Failed to load commesse");
        setCommesse([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPreviousPage: false
        });
      }
    } catch (error) {
      console.error("Error loading commesse:", error);
      showToast.error("Failed to load commesse from external API");
      setCommesse([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPreviousPage: false
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!selectedOrganization || !auth.user?.access_token) return;

    try {
      const response = await commessaService.getCommessaStats(
        selectedOrganization,
        auth.user.access_token
      );

      if (response.success) {
        setStats(response.data.statistics);
      }
    } catch (error) {
      console.error("Error loading commessa statistics:", error);
      // Don't show error toast for stats as it's not critical
    }
  };

  const handleOrganizationChange = (e) => {
    const orgCode = e.target.value;
    setSelectedOrganization(orgCode);
    setSearchTerm(""); // Clear search when changing organization
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (selectedOrganization) {
      loadCommesse(1); // Reset to first page when searching
    }
  };

  const handleRefresh = () => {
    if (selectedOrganization) {
      loadCommesse(pagination.currentPage);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadCommesse(newPage);
    }
  };

  

  const selectedOrgData = organizations.find(org => org.code === selectedOrganization);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Commessa</h3>
            <p className="text-gray-600">Manage project orders and work assignments</p>
          </div>
        </div>
      </div>

      {/* Organization Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
              Select Organization
            </label>
            <select
              id="organization"
              value={selectedOrganization}
              onChange={handleOrganizationChange}
              disabled={loadingOrganizations}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">
                {loadingOrganizations ? "Loading organizations..." : "Choose an organization"}
              </option>
              {organizations.map((org) => (
                <option key={org.code} value={org.code}>
                  {org.code} - {org.name}
                </option>
              ))}
            </select>
          </div>

          {selectedOrganization && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                disabled={loading || syncing}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>

              
            </div>
          )}
        </div>

        {selectedOrgData && (
          <div className="mt-4 p-4 bg-purple-50 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="font-medium text-purple-900">
                  Selected: {selectedOrgData.name} (Code: {selectedOrgData.code})
                </span>
              </div>

              {syncStatus && (
                <div className="flex items-center space-x-2 text-sm">
                  {syncing && (
                    <svg className="w-4 h-4 animate-spin text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  <span className={syncing ? "text-green-700" : "text-gray-700"}>
                    {syncStatus}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search and Stats */}
      {selectedOrganization && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <form onSubmit={handleSearch} className="flex items-center space-x-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search commesse..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              >
                Search
              </button>
            </form>

            {stats && (
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>Total: {stats.totalCommesse}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>In Progress: {stats.inCorso || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Completed: {stats.completate || 0}</span>
                </div>
                {stats.sospese > 0 && (
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span>Suspended: {stats.sospese}</span>
                  </div>
                )}
                {stats.pianificate > 0 && (
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    <span>Planned: {stats.pianificate}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Commesse Table */}
      {selectedOrganization && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Commesse {searchTerm && `matching "${searchTerm}"`}
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="w-8 h-8 animate-spin text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="ml-2 text-gray-600">Loading commesse...</span>
            </div>
          ) : commesse.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p className="text-gray-600 text-center">
                {searchTerm ? "No commesse found matching your search" : "No commesse found for this organization"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {commesse.map((commessa) => (
                      <tr key={commessa.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {commessa.codice}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {commessa.descrizione}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {commessa.cliente}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            commessa.stato === 'In Corso'
                              ? 'bg-green-100 text-green-800'
                              : commessa.stato === 'Completato'
                              ? 'bg-blue-100 text-blue-800'
                              : commessa.stato === 'Sospeso'
                              ? 'bg-red-100 text-red-800'
                              : commessa.stato === 'Pianificato'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {commessa.stato}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button className="text-purple-600 hover:text-purple-900 font-medium">
                            Select for Timesheet
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPreviousPage || loading}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>Previous</span>
                    </button>

                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.currentPage >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            disabled={loading}
                            className={`px-3 py-1 border rounded-md text-sm font-medium ${
                              pageNum === pagination.currentPage
                                ? "bg-purple-600 text-white border-purple-600"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage || loading}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      <span>Next</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  <div className="text-sm text-gray-600">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Commessa;
