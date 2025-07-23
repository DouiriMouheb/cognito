// Mock Process Service
class ProcessService {
  constructor() {
    // Mock business processes
    this.processes = [
      {
        id: 1,
        name: 'Development',
        description: 'Software development activities',
        code: 'DEV',
        category: 'Technical',
        isActive: true,
        hourlyRate: 75.00,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        name: 'Consulting',
        description: 'Business consulting and advisory services',
        code: 'CONS',
        category: 'Business',
        isActive: true,
        hourlyRate: 120.00,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 3,
        name: 'Testing',
        description: 'Quality assurance and testing activities',
        code: 'TEST',
        category: 'Technical',
        isActive: true,
        hourlyRate: 65.00,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 4,
        name: 'Project Management',
        description: 'Project planning and management activities',
        code: 'PM',
        category: 'Management',
        isActive: true,
        hourlyRate: 95.00,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 5,
        name: 'Documentation',
        description: 'Technical and user documentation',
        code: 'DOC',
        category: 'Technical',
        isActive: true,
        hourlyRate: 55.00,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 6,
        name: 'Training',
        description: 'User training and knowledge transfer',
        code: 'TRAIN',
        category: 'Education',
        isActive: true,
        hourlyRate: 85.00,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 7,
        name: 'Support',
        description: 'Technical support and maintenance',
        code: 'SUP',
        category: 'Technical',
        isActive: true,
        hourlyRate: 70.00,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 8,
        name: 'Analysis',
        description: 'Business and technical analysis',
        code: 'ANAL',
        category: 'Business',
        isActive: true,
        hourlyRate: 90.00,
        createdAt: '2024-01-01T00:00:00Z'
      }
    ];

    this.nextId = 9;
  }

  // Get all processes
  async getProcesses(filters = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredProcesses = [...this.processes];

        // Apply filters
        if (filters.category) {
          filteredProcesses = filteredProcesses.filter(p => p.category === filters.category);
        }
        if (filters.isActive !== undefined) {
          filteredProcesses = filteredProcesses.filter(p => p.isActive === filters.isActive);
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredProcesses = filteredProcesses.filter(p => 
            p.name.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower) ||
            p.code.toLowerCase().includes(searchLower)
          );
        }

        // Sort by name
        filteredProcesses.sort((a, b) => a.name.localeCompare(b.name));

        resolve({
          success: true,
          data: filteredProcesses,
          total: filteredProcesses.length
        });
      }, 300);
    });
  }

  // Get process by ID
  async getProcessById(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const process = this.processes.find(p => p.id === parseInt(id));
        if (process) {
          resolve({
            success: true,
            data: process
          });
        } else {
          resolve({
            success: false,
            error: 'Process not found'
          });
        }
      }, 200);
    });
  }

  // Get active processes only (commonly used for dropdowns)
  async getActiveProcesses() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const activeProcesses = this.processes.filter(p => p.isActive);
        activeProcesses.sort((a, b) => a.name.localeCompare(b.name));

        resolve({
          success: true,
          data: activeProcesses,
          total: activeProcesses.length
        });
      }, 200);
    });
  }

  // Get process categories
  async getProcessCategories() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const categories = [...new Set(this.processes.map(p => p.category))].sort();
        
        resolve({
          success: true,
          data: categories
        });
      }, 100);
    });
  }

  // Create new process
  async createProcess(processData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newProcess = {
          id: this.nextId++,
          ...processData,
          createdAt: new Date().toISOString()
        };

        this.processes.push(newProcess);

        resolve({
          success: true,
          data: newProcess,
          message: 'Process created successfully'
        });
      }, 500);
    });
  }

  // Update process
  async updateProcess(id, processData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.processes.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
          this.processes[index] = {
            ...this.processes[index],
            ...processData,
            updatedAt: new Date().toISOString()
          };

          resolve({
            success: true,
            data: this.processes[index],
            message: 'Process updated successfully'
          });
        } else {
          resolve({
            success: false,
            error: 'Process not found'
          });
        }
      }, 400);
    });
  }

  // Delete process
  async deleteProcess(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.processes.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
          this.processes.splice(index, 1);
          resolve({
            success: true,
            message: 'Process deleted successfully'
          });
        } else {
          resolve({
            success: false,
            error: 'Process not found'
          });
        }
      }, 300);
    });
  }

  // Get process statistics
  async getProcessStats() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stats = {
          totalProcesses: this.processes.length,
          activeProcesses: this.processes.filter(p => p.isActive).length,
          inactiveProcesses: this.processes.filter(p => !p.isActive).length,
          categoriesCount: new Set(this.processes.map(p => p.category)).size,
          averageHourlyRate: this.processes.reduce((sum, p) => sum + p.hourlyRate, 0) / this.processes.length,
          categoryBreakdown: this.processes.reduce((acc, p) => {
            acc[p.category] = (acc[p.category] || 0) + 1;
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
}

// Export singleton instance
export const processService = new ProcessService();
