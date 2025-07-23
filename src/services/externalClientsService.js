// External Sinergia API Client Service
class ExternalClientsService {
  constructor() {
    this.baseUrl = 'https://api.sinergia.cloud/api';
    
    // Predefined organizations
    this.organizations = [
      { code: '41', name: 'Sinergia Consulenze' },
      { code: '410', name: 'Sinergia EPC' },
      { code: '411', name: 'Impronta' },
      { code: '412', name: 'Deep Reality' }
    ];
  }

  /**
   * Get all available organizations
   */
  getOrganizations() {
    return {
      success: true,
      data: {
        organizations: this.organizations
      }
    };
  }

  /**
   * Get organization by code
   */
  getOrganizationByCode(code) {
    return this.organizations.find(org => org.code === code);
  }

  /**
   * Make authenticated request to Sinergia API
   */
  async makeAuthenticatedRequest(endpoint, accessToken, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    console.log('Making API request:', { url, method: config.method });

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API response received:', { status: response.status, dataType: typeof data });
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Get all clients for a specific organization with pagination
   */
  async getClientsForOrganization(organizationCode, accessToken, options = {}) {
    const { page = 1, limit = 10, search = '' } = options;
    
    try {
      // Validate organization code
      const organization = this.getOrganizationByCode(organizationCode);
      if (!organization) {
        throw new Error(`Invalid organization code: ${organizationCode}`);
      }

      console.log('Fetching clients for organization:', {
        organizationCode,
        organizationName: organization.name
      });

      // Make API call to external service
      const endpoint = `/clientifornitori/getallclienti/${organizationCode}/cli/0`;
      const response = await this.makeAuthenticatedRequest(endpoint, accessToken);

      console.log('Raw API response received:', {
        organizationCode,
        responseType: typeof response,
        hasData: !!response?.data,
        isArray: Array.isArray(response?.data)
      });

      // Handle the API response structure: { success: true, data: [...], message: "" }
      let clients = [];
      if (response && response.success && Array.isArray(response.data)) {
        clients = response.data;
      } else if (Array.isArray(response)) {
        // Fallback if response is directly an array
        clients = response;
      } else {
        console.warn('Unexpected API response structure:', {
          organizationCode,
          responseStructure: {
            success: response?.success,
            dataType: typeof response?.data,
            isValid: response?.isValid
          }
        });
        // Set empty array as fallback
        clients = [];
      }

      // Apply search filter if provided
      let filteredClients = clients;
      if (search && search.trim()) {
        const searchLower = search.toLowerCase();
        filteredClients = clients.filter(client => {
          return (
            (client.ragsoc && client.ragsoc.toLowerCase().includes(searchLower)) ||
            (client.id && client.id.toString().includes(search.trim()))
          );
        });
      }

      // Apply pagination
      const totalCount = filteredClients.length;
      const totalPages = Math.ceil(totalCount / limit);
      const offset = (page - 1) * limit;
      const paginatedClients = filteredClients.slice(offset, offset + limit);

      console.log('Successfully processed clients with pagination:', {
        organizationCode,
        totalClients: clients.length,
        filteredCount: filteredClients.length,
        page,
        limit,
        totalPages,
        searchTerm: search
      });

      return {
        success: true,
        data: {
          organization: organization,
          clients: paginatedClients,
          pagination: {
            currentPage: parseInt(page),
            totalPages: totalPages,
            totalItems: totalCount,
            itemsPerPage: parseInt(limit),
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
          },
          searchTerm: search || null
        },
        message: `Successfully loaded ${paginatedClients.length} clients`
      };

    } catch (error) {
      console.error('Failed to fetch clients for organization:', {
        organizationCode,
        error: error.message,
        stack: error.stack
      });

      return {
        success: false,
        error: {
          code: 'EXTERNAL_API_ERROR',
          message: `Failed to fetch clients: ${error.message}`,
          organizationCode
        }
      };
    }
  }

  /**
   * Get client statistics for an organization
   */
  async getClientStats(organizationCode, accessToken) {
    try {
      const result = await this.getClientsForOrganization(organizationCode, accessToken, { limit: 1000 }); // Get all clients for stats

      if (!result.success) {
        return result;
      }

      // Get all clients (not paginated) for accurate stats
      const endpoint = `/clientifornitori/getallclienti/${organizationCode}/cli/0`;
      const response = await this.makeAuthenticatedRequest(endpoint, accessToken);
      
      let allClients = [];
      if (response && response.success && Array.isArray(response.data)) {
        allClients = response.data;
      } else if (Array.isArray(response)) {
        allClients = response;
      }

      const stats = {
        totalClients: allClients.length,
        clientsWithPiva: allClients.filter(c => c.piva && c.piva.trim()).length,
        clientsWithEmail: allClients.filter(c => c.emaiL_ISTITUZIONALE && c.emaiL_ISTITUZIONALE.trim()).length,
        clientsWithPhone: allClients.filter(c => c.tel && c.tel.trim()).length,
        clientsOnly: allClients.filter(c => c.flG_CLIENTE === true).length,
        suppliersOnly: allClients.filter(c => c.flG_FORNITORE === true).length,
        prospects: allClients.filter(c => c.flG_PROSPECT === true).length
      };

      return {
        success: true,
        data: {
          organization: result.data.organization,
          statistics: stats
        }
      };

    } catch (error) {
      console.error('Failed to get client statistics:', {
        organizationCode,
        error: error.message,
        stack: error.stack
      });

      return {
        success: false,
        error: {
          code: 'STATS_ERROR',
          message: `Failed to get statistics: ${error.message}`,
          organizationCode
        }
      };
    }
  }

  /**
   * Mock sync functionality (placeholder for future implementation)
   */
  async syncOrganization(organizationCode, accessToken) {
    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = await this.getClientsForOrganization(organizationCode, accessToken, { limit: 1000 });
      
      if (result.success) {
        return {
          success: true,
          message: `Successfully synced organization ${organizationCode}`,
          data: {
            synced: result.data.clients.length,
            updated: Math.floor(result.data.clients.length * 0.3) // Mock 30% updated
          }
        };
      } else {
        throw new Error('Failed to fetch clients for sync');
      }
    } catch (error) {
      return {
        success: false,
        message: `Sync failed: ${error.message}`
      };
    }
  }
}

// Export singleton instance
export const externalClientsService = new ExternalClientsService();
