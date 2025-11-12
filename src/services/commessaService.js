// Commessa Service - Using mock data (Cognito disabled)
import { generateMockCommessa, generateMockOrganizations, generateMockCustomers, generateMockPagination } from '../utils/mockData';

class CommessaService {
  constructor() {
    // Use mock data
    this.organizations = generateMockOrganizations();
    this.commesse = generateMockCommessa();
    this.customers = generateMockCustomers(); // Need customers to get client names
  }

  /**
   * Get all available organizations
   */
  getOrganizations() {
    return {
      success: true,
      data: {
        organizations: this.organizations.map(org => ({
          code: org.idT_ORGANIZZAZIONE.toString(),
          name: org.deS_ORGANIZZAZIONE
        }))
      }
    };
  }

  /**
   * Get organization by code
   */
  getOrganizationByCode(code) {
    const org = this.organizations.find(o => o.idT_ORGANIZZAZIONE.toString() === code);
    if (org) {
      return {
        code: org.idT_ORGANIZZAZIONE.toString(),
        name: org.deS_ORGANIZZAZIONE
      };
    }
    return null;
  }

  /**
   * Get all commesse for a specific organization with pagination (MOCK)
   */
  async getCommesseForOrganization(organizationCode, accessToken, options = {}) {
    const { page = 1, limit = 10, search = '' } = options;
    
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          // Validate organization code
          const organization = this.getOrganizationByCode(organizationCode);
          if (!organization) {
            resolve({
              success: false,
              error: `Invalid organization code: ${organizationCode}`
            });
            return;
          }

          // Get commesse for this organization
          let commesse = this.commesse.filter(c => 
            c.idT_ORGANIZZAZIONE.toString() === organizationCode
          );

          // Map commesse to include client names and proper field mapping
          commesse = commesse.map(c => {
            const customer = this.customers.find(cust => cust.idT_CLIENTE_ESTERNO === c.idT_CLIENTE_ESTERNO);
            return {
              id: c.id,
              codice: c.coD_COMMESSA,
              descrizione: c.desC_BREVE || c.deS_COMMESSA || 'No description',
              cliente: customer ? customer.deS_CLIENTE : 'Unknown Client',
              stato: c.deS_STATO || c.stato || 'Unknown',
              responsabile: c.deS_RESPONSABILE || '',
              dataInizio: c.deS_AVVIO_ATTIVITA || c.datA_INIZIO || '',
              dataFine: c.deS_FINE_ATTIVITA || c.datA_FINE || '',
              importo: c.numimportO_TOTALE || c.budget || 0,
              lineaProdotto: c.deS_LINEA_PRODOTTO || '',
              // Keep original data
              rawData: c
            };
          });

          // Apply search filter
          if (search && search.trim()) {
            const searchLower = search.toLowerCase();
            commesse = commesse.filter(c => 
              (c.codice || '').toLowerCase().includes(searchLower) ||
              (c.descrizione || '').toLowerCase().includes(searchLower) ||
              (c.cliente || '').toLowerCase().includes(searchLower) ||
              (c.responsabile || '').toLowerCase().includes(searchLower)
            );
          }

          // Sort by code
          commesse.sort((a, b) => 
            (a.codice || '').localeCompare(b.codice || '')
          );

          // Apply pagination
          const paginatedResult = generateMockPagination(commesse, page, limit);

          resolve({
            success: true,
            data: {
              organization: organization,
              commesse: paginatedResult.data,
              pagination: paginatedResult.pagination,
              searchTerm: search || null
            },
            message: `Successfully loaded ${paginatedResult.data.length} commesse`
          });
        } catch (error) {
          console.error('Mock commessa fetch error:', error);
          resolve({
            success: false,
            error: {
              code: 'MOCK_ERROR',
              message: error.message,
              organizationCode
            }
          });
        }
      }, 350); // Simulate network delay
    });
  }

  /**
   * Get commessa statistics for an organization (MOCK)
   */
  async getCommessaStats(organizationCode, accessToken) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const commesse = this.commesse.filter(c => 
          c.idT_ORGANIZZAZIONE.toString() === organizationCode
        );

        const stats = {
          totalCommesse: commesse.length,
          inCorso: commesse.filter(c => (c.deS_STATO || c.stato || '').toLowerCase().includes('progress')).length,
          completate: commesse.filter(c => (c.deS_STATO || c.stato || '').toLowerCase().includes('complet')).length,
          sospese: commesse.filter(c => (c.deS_STATO || c.stato || '').toLowerCase().includes('sosp')).length,
          pianificate: commesse.filter(c => (c.deS_STATO || c.stato || '').toLowerCase().includes('plan')).length,
          withDescription: commesse.filter(c => (c.desC_BREVE || c.deS_COMMESSA || '').trim()).length,
          withClient: commesse.filter(c => c.idT_CLIENTE_ESTERNO).length,
          totalImporto: commesse.reduce((sum, c) => sum + (c.numimportO_TOTALE || c.budget || 0), 0)
        };

        resolve({
          success: true,
          data: {
            organization: this.getOrganizationByCode(organizationCode),
            statistics: stats
          }
        });
      }, 250);
    });
  }

  /**
   * Sync organization data (MOCK - no-op)
   */
  async syncOrganization(organizationCode, accessToken) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('[Mock] Sync commesse called for:', organizationCode);
        resolve({
          success: true,
          message: `Mock sync completed for commesse in organization ${organizationCode}`,
          data: {
            synced: true,
            timestamp: new Date().toISOString()
          }
        });
      }, 600);
    });
  }
}

// Export singleton instance
export const commessaService = new CommessaService();
