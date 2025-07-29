// Commessa API Service
class CommessaService {
  constructor() {
    this.baseUrl = 'https://api.sinergia.cloud/api';
    
    // Predefined organizations (same as External Clients)
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
   * Map API stato to display format
   */
  mapStato(apiStato) {
    if (!apiStato) return 'Unknown';

    const statoMap = {
      'APERTA': 'In Corso',
      'CHIUSA': 'Completato',
      'SOSPESA': 'Sospeso',
      'PIANIFICATA': 'Pianificato',
      'A': 'In Corso',
      'C': 'Completato',
      'S': 'Sospeso',
      'P': 'Pianificato'
    };

    return statoMap[apiStato.toUpperCase()] || apiStato;
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

   

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
    
      
      return data;
    } catch (error) {
      console.error('Commessa API request failed:', error);
      throw error;
    }
  }

  /**
   * Get all commesse for a specific organization with pagination
   */
  async getCommesseForOrganization(organizationCode, accessToken, options = {}) {
    const { page = 1, limit = 10, search = '' } = options;
    
    try {
      // Validate organization code
      const organization = this.getOrganizationByCode(organizationCode);
      if (!organization) {
        throw new Error(`Invalid organization code: ${organizationCode}`);
      }

   

      // Make API call to external service
      const endpoint = `/commesse/getallcommesse/${organizationCode}/0`;
      const response = await this.makeAuthenticatedRequest(endpoint, accessToken);



      // Handle the API response structure: { success: true, data: [...], message: "" }
      let rawCommesse = [];
      if (response && response.success && Array.isArray(response.data)) {
        rawCommesse = response.data;
      } else if (Array.isArray(response)) {
        // Fallback if response is directly an array
        rawCommesse = response;
      } else {
        console.warn('Unexpected Commessa API response structure:', {
          organizationCode,
          responseStructure: {
            success: response?.success,
            dataType: typeof response?.data,
            isValid: response?.isValid
          }
        });
        // Set empty array as fallback
        rawCommesse = [];
      }

      // Map API response to component-expected format
      const commesse = rawCommesse.map(item => ({
        id: item.id,
        codice: item.coD_COMMESSA || item.sigla || `COM-${item.id}`,
        descrizione: item.desC_BREVE || item.desC_LUNGA || 'No description',
        cliente: item.cliente || 'Unknown Client',
        stato: this.mapStato(item.deS_STATO || item.stato),
        // Additional fields for potential future use
        responsabile: item.deS_RESPONSABILE,
        dataInizio: item.deS_AVVIO_ATTIVITA,
        dataFine: item.deS_FINE_ATTIVITA,
        importo: item.importo,
        lineaProdotto: item.deS_LINEA_PRODOTTO,
        rawData: item // Keep original data for reference
      }));

      // Apply search filter if provided
      let filteredCommesse = commesse;
      if (search && search.trim()) {
        const searchLower = search.toLowerCase();
        filteredCommesse = commesse.filter(commessa => {
          return (
            (commessa.codice && commessa.codice.toString().toLowerCase().includes(searchLower)) ||
            (commessa.descrizione && commessa.descrizione.toLowerCase().includes(searchLower)) ||
            (commessa.cliente && commessa.cliente.toLowerCase().includes(searchLower)) ||
            (commessa.responsabile && commessa.responsabile.toLowerCase().includes(searchLower)) ||
            (commessa.id && commessa.id.toString().includes(search.trim()))
          );
        });
      }

      // Apply pagination
      const totalCount = filteredCommesse.length;
      const totalPages = Math.ceil(totalCount / limit);
      const offset = (page - 1) * limit;
      const paginatedCommesse = filteredCommesse.slice(offset, offset + limit);


      return {
        success: true,
        data: {
          organization: organization,
          commesse: paginatedCommesse,
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
        message: `Successfully loaded ${paginatedCommesse.length} commesse`
      };

    } catch (error) {
      console.error('Failed to fetch commesse for organization:', {
        organizationCode,
        error: error.message,
        stack: error.stack
      });

      return {
        success: false,
        error: {
          code: 'EXTERNAL_API_ERROR',
          message: `Failed to fetch commesse: ${error.message}`,
          organizationCode
        }
      };
    }
  }

  /**
   * Get commessa statistics for an organization
   */
  async getCommessaStats(organizationCode, accessToken) {
    try {
      // Get all commesse (not paginated) for accurate stats
      const endpoint = `/commesse/getallcommesse/${organizationCode}/0`;
      const response = await this.makeAuthenticatedRequest(endpoint, accessToken);
      
      let rawCommesse = [];
      if (response && response.success && Array.isArray(response.data)) {
        rawCommesse = response.data;
      } else if (Array.isArray(response)) {
        rawCommesse = response;
      }

      // Map the data for statistics (same as main function)
      const mappedCommesse = rawCommesse.map(item => ({
        stato: this.mapStato(item.deS_STATO || item.stato),
        descrizione: item.desC_BREVE || item.desC_LUNGA,
        cliente: item.cliente,
        responsabile: item.deS_RESPONSABILE,
        importo: item.importo || 0
      }));

      // Calculate statistics based on mapped data
      const stats = {
        totalCommesse: mappedCommesse.length,
        inCorso: mappedCommesse.filter(c => c.stato === 'In Corso').length,
        completate: mappedCommesse.filter(c => c.stato === 'Completato').length,
        sospese: mappedCommesse.filter(c => c.stato === 'Sospeso').length,
        pianificate: mappedCommesse.filter(c => c.stato === 'Pianificato').length,
        withDescription: mappedCommesse.filter(c => c.descrizione && c.descrizione.trim()).length,
        withClient: mappedCommesse.filter(c => c.cliente && c.cliente.trim()).length,
        withResponsabile: mappedCommesse.filter(c => c.responsabile && c.responsabile.trim()).length,
        totalImporto: mappedCommesse.reduce((sum, c) => sum + c.importo, 0)
      };

      return {
        success: true,
        data: {
          organization: this.getOrganizationByCode(organizationCode),
          statistics: stats
        }
      };

    } catch (error) {
      console.error('Failed to get commessa statistics:', {
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
      
      const result = await this.getCommesseForOrganization(organizationCode, accessToken, { limit: 1000 });
      
      if (result.success) {
        return {
          success: true,
          message: `Successfully synced commesse for organization ${organizationCode}`,
          data: {
            synced: result.data.commesse.length,
            updated: Math.floor(result.data.commesse.length * 0.4) // Mock 40% updated
          }
        };
      } else {
        throw new Error('Failed to fetch commesse for sync');
      }
    } catch (error) {
      return {
        success: false,
        message: `Commessa sync failed: ${error.message}`
      };
    }
  }
}

// Export singleton instance
export const commessaService = new CommessaService();
