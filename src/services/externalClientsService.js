// External Clients Service - Using mock data (Cognito disabled)
import { generateMockCustomers, generateMockOrganizations, generateMockPagination } from '../utils/mockData';

class ExternalClientsService {
  constructor() {
    // Use mock data
    this.organizations = generateMockOrganizations();
    this.clients = generateMockCustomers();
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
   * Get all clients for a specific organization with pagination (MOCK)
   */
  async getClientsForOrganization(organizationCode, accessToken, options = {}) {
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

          // Get clients for this organization
          let clients = this.clients.filter(c => 
            c.idT_ORGANIZZAZIONE.toString() === organizationCode
          );

          // Apply search filter
          if (search) {
            const searchLower = search.toLowerCase();
            clients = clients.filter(c => 
              (c.deS_CLIENTE || '').toLowerCase().includes(searchLower) ||
              (c.coD_CLIENTE || '').toLowerCase().includes(searchLower) ||
              (c.partitA_IVA || '').toLowerCase().includes(searchLower) ||
              (c.email || '').toLowerCase().includes(searchLower)
            );
          }

          // Sort by name
          clients.sort((a, b) => 
            (a.deS_CLIENTE || '').localeCompare(b.deS_CLIENTE || '')
          );

          // Apply pagination
          const paginatedResult = generateMockPagination(clients, page, limit);

          // Map to expected API format with ragsoc field
          const mappedClients = paginatedResult.data.map(client => ({
            id: client.idT_CLIENTE_ESTERNO || client.id,
            ragsoc: client.deS_CLIENTE,
            codice: client.coD_CLIENTE,
            piva: client.partitA_IVA,
            email: client.email,
            tel: client.telefono,
            indirizzo: client.indirizzo,
            cap: client.cap,
            citta: client.citta,
            provincia: client.provincia,
            nazione: client.nazione,
            flG_CLIENTE: client.flG_CLIENTE,
            flG_FORNITORE: client.flG_FORNITORE,
            flG_PROSPECT: client.flG_PROSPECT,
            // Keep all original fields
            ...client
          }));

          console.log(`[Mock Clients] Org ${organizationCode}: Found ${mappedClients.length} clients -`,
            mappedClients.map(c => c.ragsoc).slice(0, 3).join(', ') + (mappedClients.length > 3 ? '...' : ''));

          resolve({
            success: true,
            data: {
              clients: mappedClients,
              pagination: paginatedResult.pagination,
              stats: {
                totalClients: clients.length,
                filteredClients: paginatedResult.pagination.totalItems
              }
            }
          });
        } catch (error) {
          console.error('Mock client fetch error:', error);
          resolve({
            success: false,
            error: error.message
          });
        }
      }, 300); // Simulate network delay
    });
  }

  /**
   * Get client statistics (MOCK)
   */
  async getClientStats(organizationCode, accessToken) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const clients = this.clients.filter(c => 
          c.idT_ORGANIZZAZIONE.toString() === organizationCode
        );

        resolve({
          success: true,
          data: {
            totalClients: clients.length,
            activeClients: clients.length,
            recentClients: Math.min(5, clients.length)
          }
        });
      }, 200);
    });
  }

  /**
   * Sync organization data (MOCK - no-op)
   */
  async syncOrganization(organizationCode, accessToken) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('[Mock] Sync organization called for:', organizationCode);
        resolve({
          success: true,
          message: `Mock sync completed for organization ${organizationCode}`,
          data: {
            synced: true,
            timestamp: new Date().toISOString()
          }
        });
      }, 500);
    });
  }
}

// Export singleton instance
export const externalClientsService = new ExternalClientsService();
