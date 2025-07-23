// Mock Activity Service
class ActivityService {
  constructor() {
    // Mock activities related to processes
    this.activities = [
      {
        id: 1,
        name: 'Frontend Development',
        description: 'React, Vue, Angular development',
        processId: 1,
        code: 'FE_DEV',
        isActive: true,
        hourlyRate: 80.00,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        name: 'Backend Development',
        description: 'API and server-side development',
        processId: 1,
        code: 'BE_DEV',
        isActive: true,
        hourlyRate: 85.00,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 3,
        name: 'Business Analysis',
        description: 'Requirements gathering and analysis',
        processId: 2,
        code: 'BIZ_ANAL',
        isActive: true,
        hourlyRate: 100.00,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 4,
        name: 'Strategic Consulting',
        description: 'High-level business strategy',
        processId: 2,
        code: 'STRAT_CONS',
        isActive: true,
        hourlyRate: 150.00,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 5,
        name: 'Unit Testing',
        description: 'Writing and executing unit tests',
        processId: 3,
        code: 'UNIT_TEST',
        isActive: true,
        hourlyRate: 70.00,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 6,
        name: 'Integration Testing',
        description: 'System integration testing',
        processId: 3,
        code: 'INT_TEST',
        isActive: true,
        hourlyRate: 75.00,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 7,
        name: 'Project Planning',
        description: 'Project scope and timeline planning',
        processId: 4,
        code: 'PROJ_PLAN',
        isActive: true,
        hourlyRate: 95.00,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 8,
        name: 'Team Coordination',
        description: 'Team meetings and coordination',
        processId: 4,
        code: 'TEAM_COORD',
        isActive: true,
        hourlyRate: 90.00,
        createdAt: '2024-01-01T00:00:00Z'
      }
    ];

    this.nextId = 9;
  }

  // Get all activities
  async getActivities(filters = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredActivities = [...this.activities];

        // Apply filters
        if (filters.processId) {
          filteredActivities = filteredActivities.filter(a => a.processId === parseInt(filters.processId));
        }
        if (filters.isActive !== undefined) {
          filteredActivities = filteredActivities.filter(a => a.isActive === filters.isActive);
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredActivities = filteredActivities.filter(a => 
            a.name.toLowerCase().includes(searchLower) ||
            a.description.toLowerCase().includes(searchLower) ||
            a.code.toLowerCase().includes(searchLower)
          );
        }

        // Sort by name
        filteredActivities.sort((a, b) => a.name.localeCompare(b.name));

        resolve({
          success: true,
          data: filteredActivities,
          total: filteredActivities.length
        });
      }, 200);
    });
  }

  // Get activity by ID
  async getActivityById(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const activity = this.activities.find(a => a.id === parseInt(id));
        if (activity) {
          resolve({
            success: true,
            data: activity
          });
        } else {
          resolve({
            success: false,
            error: 'Activity not found'
          });
        }
      }, 150);
    });
  }

  // Get activities by process ID
  async getActivitiesByProcess(processId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const activities = this.activities.filter(a => 
          a.processId === parseInt(processId) && a.isActive
        );
        activities.sort((a, b) => a.name.localeCompare(b.name));

        resolve({
          success: true,
          data: activities,
          total: activities.length
        });
      }, 150);
    });
  }

  // Get active activities only (commonly used for dropdowns)
  async getActiveActivities() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const activeActivities = this.activities.filter(a => a.isActive);
        activeActivities.sort((a, b) => a.name.localeCompare(b.name));

        resolve({
          success: true,
          data: activeActivities,
          total: activeActivities.length
        });
      }, 150);
    });
  }

  // Create new activity
  async createActivity(activityData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newActivity = {
          id: this.nextId++,
          ...activityData,
          isActive: true,
          createdAt: new Date().toISOString()
        };

        this.activities.push(newActivity);

        resolve({
          success: true,
          data: newActivity,
          message: 'Activity created successfully'
        });
      }, 400);
    });
  }

  // Update activity
  async updateActivity(id, activityData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.activities.findIndex(a => a.id === parseInt(id));
        if (index !== -1) {
          this.activities[index] = {
            ...this.activities[index],
            ...activityData,
            updatedAt: new Date().toISOString()
          };

          resolve({
            success: true,
            data: this.activities[index],
            message: 'Activity updated successfully'
          });
        } else {
          resolve({
            success: false,
            error: 'Activity not found'
          });
        }
      }, 300);
    });
  }

  // Delete activity
  async deleteActivity(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.activities.findIndex(a => a.id === parseInt(id));
        if (index !== -1) {
          this.activities.splice(index, 1);
          resolve({
            success: true,
            message: 'Activity deleted successfully'
          });
        } else {
          resolve({
            success: false,
            error: 'Activity not found'
          });
        }
      }, 250);
    });
  }
}

// Export singleton instance
export const activityService = new ActivityService();
