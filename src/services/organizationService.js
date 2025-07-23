// Organization Service - wrapper around existing organization structure
class OrganizationService {
  constructor() {
    // Mock organizations (same as existing structure)
    this.organizations = [
      { 
        id: '41', 
        code: '41', 
        name: 'Sinergia Consulenze',
        description: 'Main consulting division',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z'
      },
      { 
        id: '410', 
        code: '410', 
        name: 'Sinergia EPC',
        description: 'Engineering, Procurement and Construction',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z'
      },
      { 
        id: '411', 
        code: '411', 
        name: 'Impronta',
        description: 'Digital solutions and innovation',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z'
      },
      { 
        id: '412', 
        code: '412', 
        name: 'Deep Reality',
        description: 'Advanced technology and research',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z'
      }
    ];
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
            o.name.toLowerCase().includes(searchLower) ||
            o.code.toLowerCase().includes(searchLower) ||
            o.description.toLowerCase().includes(searchLower)
          );
        }

        // Sort by name
        filteredOrganizations.sort((a, b) => a.name.localeCompare(b.name));

        resolve({
          success: true,
          data: filteredOrganizations,
          total: filteredOrganizations.length
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
        const activeOrganizations = this.organizations.filter(o => o.isActive);
        activeOrganizations.sort((a, b) => a.name.localeCompare(b.name));

        resolve({
          success: true,
          data: activeOrganizations,
          total: activeOrganizations.length
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
