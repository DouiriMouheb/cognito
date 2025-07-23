// Customer Service - wrapper around existing clients
import { externalClientsService } from './externalClientsService';

class CustomerService {
  constructor() {
    // Mock customers based on existing client structure
    this.customers = [
      {
        id: 1,
        name: 'ABC Company Ltd',
        code: 'ABC001',
        organizationId: '41',
        organizationName: 'Sinergia Consulenze',
        email: 'contact@abccompany.com',
        phone: '+1-555-0123',
        address: '123 Business St, City, State 12345',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        name: 'XYZ Corporation',
        code: 'XYZ002',
        organizationId: '410',
        organizationName: 'Sinergia EPC',
        email: 'info@xyzcorp.com',
        phone: '+1-555-0456',
        address: '456 Corporate Ave, City, State 12345',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 3,
        name: 'Tech Solutions Inc',
        code: 'TECH003',
        organizationId: '41',
        organizationName: 'Sinergia Consulenze',
        email: 'hello@techsolutions.com',
        phone: '+1-555-0789',
        address: '789 Innovation Blvd, City, State 12345',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 4,
        name: 'Digital Services LLC',
        code: 'DIG004',
        organizationId: '411',
        organizationName: 'Impronta',
        email: 'contact@digitalservices.com',
        phone: '+1-555-0321',
        address: '321 Digital Way, City, State 12345',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 5,
        name: 'Innovation Partners',
        code: 'INN005',
        organizationId: '412',
        organizationName: 'Deep Reality',
        email: 'partners@innovation.com',
        phone: '+1-555-0654',
        address: '654 Future Lane, City, State 12345',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z'
      }
    ];

    this.nextId = 6;
  }

  // Get all customers
  async getCustomers(filters = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredCustomers = [...this.customers];

        // Apply filters
        if (filters.organizationId) {
          filteredCustomers = filteredCustomers.filter(c => c.organizationId === filters.organizationId);
        }
        if (filters.isActive !== undefined) {
          filteredCustomers = filteredCustomers.filter(c => c.isActive === filters.isActive);
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredCustomers = filteredCustomers.filter(c => 
            c.name.toLowerCase().includes(searchLower) ||
            c.code.toLowerCase().includes(searchLower) ||
            c.email.toLowerCase().includes(searchLower)
          );
        }

        // Sort by name
        filteredCustomers.sort((a, b) => a.name.localeCompare(b.name));

        resolve({
          success: true,
          data: filteredCustomers,
          total: filteredCustomers.length
        });
      }, 300);
    });
  }

  // Get customer by ID
  async getCustomerById(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const customer = this.customers.find(c => c.id === parseInt(id));
        if (customer) {
          resolve({
            success: true,
            data: customer
          });
        } else {
          resolve({
            success: false,
            error: 'Customer not found'
          });
        }
      }, 200);
    });
  }

  // Get customers by organization
  async getCustomersByOrganization(organizationId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const customers = this.customers.filter(c => c.organizationId === organizationId && c.isActive);
        customers.sort((a, b) => a.name.localeCompare(b.name));

        resolve({
          success: true,
          data: customers,
          total: customers.length
        });
      }, 200);
    });
  }

  // Get active customers only (commonly used for dropdowns)
  async getActiveCustomers() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const activeCustomers = this.customers.filter(c => c.isActive);
        activeCustomers.sort((a, b) => a.name.localeCompare(b.name));

        resolve({
          success: true,
          data: activeCustomers,
          total: activeCustomers.length
        });
      }, 200);
    });
  }

  // Create new customer
  async createCustomer(customerData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newCustomer = {
          id: this.nextId++,
          ...customerData,
          isActive: true,
          createdAt: new Date().toISOString()
        };

        this.customers.push(newCustomer);

        resolve({
          success: true,
          data: newCustomer,
          message: 'Customer created successfully'
        });
      }, 500);
    });
  }

  // Update customer
  async updateCustomer(id, customerData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.customers.findIndex(c => c.id === parseInt(id));
        if (index !== -1) {
          this.customers[index] = {
            ...this.customers[index],
            ...customerData,
            updatedAt: new Date().toISOString()
          };

          resolve({
            success: true,
            data: this.customers[index],
            message: 'Customer updated successfully'
          });
        } else {
          resolve({
            success: false,
            error: 'Customer not found'
          });
        }
      }, 400);
    });
  }

  // Delete customer
  async deleteCustomer(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.customers.findIndex(c => c.id === parseInt(id));
        if (index !== -1) {
          this.customers.splice(index, 1);
          resolve({
            success: true,
            message: 'Customer deleted successfully'
          });
        } else {
          resolve({
            success: false,
            error: 'Customer not found'
          });
        }
      }, 300);
    });
  }

  // Get customer statistics
  async getCustomerStats() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stats = {
          totalCustomers: this.customers.length,
          activeCustomers: this.customers.filter(c => c.isActive).length,
          inactiveCustomers: this.customers.filter(c => !c.isActive).length,
          organizationBreakdown: this.customers.reduce((acc, c) => {
            const orgName = c.organizationName;
            acc[orgName] = (acc[orgName] || 0) + 1;
            return acc;
          }, {})
        };

        resolve({
          success: true,
          data: stats
        });
      }, 300);
    });
  }

  // Sync with external clients (integration with existing service)
  async syncWithExternalClients(organizationCode, accessToken) {
    try {
      const response = await externalClientsService.getClientsForOrganization(
        organizationCode,
        accessToken,
        { limit: 1000 }
      );

      if (response.success) {
        // Convert external clients to customer format
        const externalClients = response.data.clients.map(client => ({
          id: `ext_${client.id}`,
          name: client.ragsoc || 'Unknown Client',
          code: `EXT_${client.id}`,
          organizationId: organizationCode,
          organizationName: response.data.organization.name,
          email: client.emaiL_ISTITUZIONALE || '',
          phone: client.tel || '',
          address: '',
          isActive: true,
          isExternal: true,
          externalId: client.id,
          createdAt: new Date().toISOString()
        }));

        return {
          success: true,
          data: externalClients,
          message: `Synced ${externalClients.length} external clients`
        };
      } else {
        return response;
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const customerService = new CustomerService();
