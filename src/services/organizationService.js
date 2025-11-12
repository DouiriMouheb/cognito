// Organization Service - Using mock data generator (Cognito disabled)
import { generateMockOrganizations } from '../utils/mockData';

class OrganizationService {
  constructor() {
    // Use mock data generator
    this.organizations = generateMockOrganizations();
  }

  // Get all organizations
  async getOrganizations(filters = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredOrganizations = [...this.organizations];

        // Apply filters
        if (filters.isActive !== undefined) {
          filteredOrganizations = filteredOrganizations.filter(o => o.isActive === filters.isActive);
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredOrganizations = filteredOrganizations.filter(o => 
            (o.deS_ORGANIZZAZIONE || '').toLowerCase().includes(searchLower) ||
            (o.coD_ORGANIZZAZIONE || '').toLowerCase().includes(searchLower)
          );
        }

        // Sort by name
        filteredOrganizations.sort((a, b) => 
          (a.deS_ORGANIZZAZIONE || '').localeCompare(b.deS_ORGANIZZAZIONE || '')
        );

        // Map to expected format for UI components
        const mappedOrganizations = filteredOrganizations.map(org => ({
          id: org.idT_ORGANIZZAZIONE,
          code: org.idT_ORGANIZZAZIONE.toString(),
          name: org.deS_ORGANIZZAZIONE,
          isActive: org.isActive !== undefined ? org.isActive : true,
          // Keep original fields for backward compatibility
          ...org
        }));

        console.log('[Mock] Returning', mappedOrganizations.length, 'organizations:', 
          mappedOrganizations.map(o => `${o.code}: ${o.name}`).join(', '));

        resolve({
          success: true,
          data: mappedOrganizations,
          total: mappedOrganizations.length
        });
      }, 200);
    });
  }

  // Get organization by ID
  async getOrganizationById(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const organization = this.organizations.find(o => o.id === id || o.code === id);
        if (organization) {
          resolve({
            success: true,
            data: organization
          });
        } else {
          resolve({
            success: false,
            error: 'Organization not found'
          });
        }
      }, 100);
    });
  }

  // Get organization by code
  async getOrganizationByCode(code) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const organization = this.organizations.find(o => o.code === code);
        if (organization) {
          resolve({
            success: true,
            data: organization
          });
        } else {
          resolve({
            success: false,
            error: 'Organization not found'
          });
        }
      }, 100);
    });
  }

  // Get active organizations only (commonly used for dropdowns)
  async getActiveOrganizations() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const activeOrganizations = this.organizations.filter(o => o.isActive !== false);
        activeOrganizations.sort((a, b) => 
          (a.deS_ORGANIZZAZIONE || '').localeCompare(b.deS_ORGANIZZAZIONE || '')
        );

        // Map to expected format for UI components
        const mappedOrganizations = activeOrganizations.map(org => ({
          id: org.idT_ORGANIZZAZIONE,
          code: org.idT_ORGANIZZAZIONE.toString(),
          name: org.deS_ORGANIZZAZIONE,
          isActive: true,
          // Keep original fields
          ...org
        }));

        resolve({
          success: true,
          data: mappedOrganizations,
          total: mappedOrganizations.length
        });
      }, 150);
    });
  }

  // Create new organization
  async createOrganization(organizationData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newOrganization = {
          id: organizationData.code || `org_${Date.now()}`,
          ...organizationData,
          isActive: true,
          createdAt: new Date().toISOString()
        };

        this.organizations.push(newOrganization);

        resolve({
          success: true,
          data: newOrganization,
          message: 'Organization created successfully'
        });
      }, 400);
    });
  }

  // Update organization
  async updateOrganization(id, organizationData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.organizations.findIndex(o => o.id === id || o.code === id);
        if (index !== -1) {
          this.organizations[index] = {
            ...this.organizations[index],
            ...organizationData,
            updatedAt: new Date().toISOString()
          };

          resolve({
            success: true,
            data: this.organizations[index],
            message: 'Organization updated successfully'
          });
        } else {
          resolve({
            success: false,
            error: 'Organization not found'
          });
        }
      }, 300);
    });
  }

  // Delete organization
  async deleteOrganization(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.organizations.findIndex(o => o.id === id || o.code === id);
        if (index !== -1) {
          this.organizations.splice(index, 1);
          resolve({
            success: true,
            message: 'Organization deleted successfully'
          });
        } else {
          resolve({
            success: false,
            error: 'Organization not found'
          });
        }
      }, 250);
    });
  }

  // Get organization statistics
  async getOrganizationStats() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stats = {
          totalOrganizations: this.organizations.length,
          activeOrganizations: this.organizations.filter(o => o.isActive).length,
          inactiveOrganizations: this.organizations.filter(o => !o.isActive).length
        };

        resolve({
          success: true,
          data: stats
        });
      }, 200);
    });
  }
}

// Export singleton instance
export const organizationService = new OrganizationService();
