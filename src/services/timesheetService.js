// Mock Timesheet Service
class TimesheetService {
  constructor() {
    // Get today's date for mock data
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Mock timesheet entries with proper date/time formats
    this.timesheets = [
      // Today's entries
      {
        id: 1,
        date: todayStr,
        startTime: `${todayStr}T08:25:00.000Z`,
        endTime: `${todayStr}T09:25:00.000Z`,
        totalHours: 1.0,
        description: 'Description for time sheet',
        organizationId: '41',
        customerId: 1,
        processId: 1,
        activityId: 1,
        workLocation: 'Office',
        workPlaceType: 'office',
        notes: 'activity',
        status: 'approved',
        isManual: true,
        createdAt: `${todayStr}T08:25:00.000Z`,
        updatedAt: `${todayStr}T09:25:00.000Z`
      },
      {
        id: 2,
        date: todayStr,
        startTime: `${todayStr}T10:25:00.000Z`,
        endTime: `${todayStr}T11:25:00.000Z`,
        totalHours: 1.0,
        description: 'description 2.0',
        organizationId: '41',
        customerId: 1,
        processId: 1,
        activityId: 2,
        workLocation: 'Office',
        workPlaceType: 'office',
        notes: 'Activity 2.0',
        status: 'pending',
        isManual: true,
        createdAt: `${todayStr}T10:25:00.000Z`,
        updatedAt: `${todayStr}T11:25:00.000Z`
      },
      // Yesterday's entries
      {
        id: 3,
        date: yesterdayStr,
        startTime: `${yesterdayStr}T09:00:00.000Z`,
        endTime: `${yesterdayStr}T17:30:00.000Z`,
        totalHours: 7.5,
        description: 'Web development project',
        organizationId: '41',
        customerId: 1,
        processId: 1,
        activityId: 1,
        workLocation: 'Office',
        workPlaceType: 'office',
        notes: 'Working on React components',
        status: 'approved',
        isManual: true,
        createdAt: `${yesterdayStr}T09:00:00.000Z`,
        updatedAt: `${yesterdayStr}T17:30:00.000Z`
      },
      {
        id: 4,
        date: yesterdayStr,
        startTime: `${yesterdayStr}T08:30:00.000Z`,
        endTime: `${yesterdayStr}T16:00:00.000Z`,
        totalHours: 7.5,
        description: 'Client meeting and documentation',
        organizationId: '410',
        customerId: 2,
        processId: 2,
        activityId: 2,
        workLocation: 'Client Site',
        workPlaceType: 'client_site',
        notes: 'Requirements gathering session',
        status: 'pending',
        isManual: true,
        createdAt: `${yesterdayStr}T08:30:00.000Z`,
        updatedAt: `${yesterdayStr}T16:00:00.000Z`
      }
    ];

    this.nextId = 6;
  }

  // Helper method to calculate total hours between start and end time
  calculateTotalHours(startTime, endTime) {
    if (!startTime || !endTime) return 0;

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    return Math.round(diffHours * 100) / 100; // Round to 2 decimal places
  }

  // Helper method to format date for consistency
  formatDate(date) {
    if (!date) return null;

    if (typeof date === 'string') {
      // If it's already in YYYY-MM-DD format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
      }
      // If it's an ISO string, extract the date part
      if (date.includes('T')) {
        return date.split('T')[0];
      }
    }

    // If it's a Date object, format it
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }

    return date;
  }

  // Helper method to format time for consistency
  formatTime(dateTime) {
    if (!dateTime) return null;

    // If it's already a full ISO string, return as is
    if (typeof dateTime === 'string' && dateTime.includes('T') && dateTime.includes('Z')) {
      return dateTime;
    }

    // If it's just a time (HH:MM), combine with date
    if (typeof dateTime === 'string' && /^\d{2}:\d{2}$/.test(dateTime)) {
      const today = new Date().toISOString().split('T')[0];
      return `${today}T${dateTime}:00.000Z`;
    }

    // If it's a Date object, convert to ISO string
    if (dateTime instanceof Date) {
      return dateTime.toISOString();
    }

    return dateTime;
  }

  // Get all timesheets with optional filters
  async getTimesheets(filters = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredTimesheets = [...this.timesheets];

        // Apply filters
        if (filters.startDate) {
          filteredTimesheets = filteredTimesheets.filter(t => t.date >= filters.startDate);
        }
        if (filters.endDate) {
          filteredTimesheets = filteredTimesheets.filter(t => t.date <= filters.endDate);
        }
        if (filters.organizationId) {
          filteredTimesheets = filteredTimesheets.filter(t => t.organizationId === filters.organizationId);
        }
        if (filters.customerId) {
          filteredTimesheets = filteredTimesheets.filter(t => t.customerId === filters.customerId);
        }
        if (filters.status) {
          filteredTimesheets = filteredTimesheets.filter(t => t.status === filters.status);
        }

        // Sort by date (newest first)
        filteredTimesheets.sort((a, b) => new Date(b.date) - new Date(a.date));

        resolve({
          success: true,
          data: filteredTimesheets,
          total: filteredTimesheets.length
        });
      }, 500);
    });
  }

  // Get timesheet by ID
  async getTimesheetById(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const timesheet = this.timesheets.find(t => t.id === parseInt(id));
        if (timesheet) {
          resolve({
            success: true,
            data: timesheet
          });
        } else {
          resolve({
            success: false,
            error: 'Timesheet not found'
          });
        }
      }, 300);
    });
  }

  // Create new timesheet
  async createTimesheet(timesheetData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Format dates and times for consistency
        const formattedData = {
          ...timesheetData,
          date: this.formatDate(timesheetData.date),
          startTime: this.formatTime(timesheetData.startTime),
          endTime: this.formatTime(timesheetData.endTime)
        };

        // Calculate total hours if not provided
        if (!formattedData.totalHours && formattedData.startTime && formattedData.endTime) {
          formattedData.totalHours = this.calculateTotalHours(
            formattedData.startTime,
            formattedData.endTime
          );
        }

        const newTimesheet = {
          id: this.nextId++,
          ...formattedData,
          status: formattedData.status || 'draft',
          isManual: formattedData.isManual !== undefined ? formattedData.isManual : true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        this.timesheets.push(newTimesheet);

        resolve({
          success: true,
          data: newTimesheet,
          message: 'Timesheet created successfully'
        });
      }, 800);
    });
  }

  // Update timesheet
  async updateTimesheet(id, timesheetData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.timesheets.findIndex(t => t.id === parseInt(id));
        if (index !== -1) {
          // Format dates and times for consistency
          const formattedData = {
            ...timesheetData
          };

          if (timesheetData.date) {
            formattedData.date = this.formatDate(timesheetData.date);
          }
          if (timesheetData.startTime) {
            formattedData.startTime = this.formatTime(timesheetData.startTime);
          }
          if (timesheetData.endTime) {
            formattedData.endTime = this.formatTime(timesheetData.endTime);
          }

          // Recalculate total hours if start or end time changed
          const updatedEntry = { ...this.timesheets[index], ...formattedData };
          if ((timesheetData.startTime || timesheetData.endTime) && !timesheetData.totalHours) {
            updatedEntry.totalHours = this.calculateTotalHours(
              updatedEntry.startTime,
              updatedEntry.endTime
            );
          }

          this.timesheets[index] = {
            ...updatedEntry,
            updatedAt: new Date().toISOString()
          };

          resolve({
            success: true,
            data: this.timesheets[index],
            message: 'Timesheet updated successfully'
          });
        } else {
          resolve({
            success: false,
            error: 'Timesheet not found'
          });
        }
      }, 600);
    });
  }

  // Delete timesheet
  async deleteTimesheet(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.timesheets.findIndex(t => t.id === parseInt(id));
        if (index !== -1) {
          this.timesheets.splice(index, 1);
          resolve({
            success: true,
            message: 'Timesheet deleted successfully'
          });
        } else {
          resolve({
            success: false,
            error: 'Timesheet not found'
          });
        }
      }, 400);
    });
  }

  // Get timesheet statistics
  async getTimesheetStats(filters = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredTimesheets = [...this.timesheets];

        // Apply same filters as getTimesheets
        if (filters.startDate) {
          filteredTimesheets = filteredTimesheets.filter(t => t.date >= filters.startDate);
        }
        if (filters.endDate) {
          filteredTimesheets = filteredTimesheets.filter(t => t.date <= filters.endDate);
        }

        const stats = {
          totalEntries: filteredTimesheets.length,
          totalHours: filteredTimesheets.reduce((sum, t) => sum + t.totalHours, 0),
          averageHours: filteredTimesheets.length > 0 
            ? filteredTimesheets.reduce((sum, t) => sum + t.totalHours, 0) / filteredTimesheets.length 
            : 0,
          statusBreakdown: {
            draft: filteredTimesheets.filter(t => t.status === 'draft').length,
            pending: filteredTimesheets.filter(t => t.status === 'pending').length,
            approved: filteredTimesheets.filter(t => t.status === 'approved').length,
            rejected: filteredTimesheets.filter(t => t.status === 'rejected').length
          }
        };

        resolve({
          success: true,
          data: stats
        });
      }, 400);
    });
  }

  // Bulk update timesheet status
  async bulkUpdateStatus(ids, status) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedCount = ids.reduce((count, id) => {
          const index = this.timesheets.findIndex(t => t.id === parseInt(id));
          if (index !== -1) {
            this.timesheets[index].status = status;
            this.timesheets[index].updatedAt = new Date().toISOString();
            return count + 1;
          }
          return count;
        }, 0);

        resolve({
          success: true,
          message: `${updatedCount} timesheets updated successfully`,
          updatedCount
        });
      }, 700);
    });
  }

  // Get time entries (alias for getTimesheets for compatibility)
  async getTimeEntries(filters = {}) {
    return this.getTimesheets(filters);
  }

  // Create time entry (alias for createTimesheet for compatibility)
  async createTimeEntry(entryData) {
    return this.createTimesheet(entryData);
  }

  // Update time entry (alias for updateTimesheet for compatibility)
  async updateTimeEntry(id, entryData) {
    return this.updateTimesheet(id, entryData);
  }

  // Delete time entry (alias for deleteTimesheet for compatibility)
  async deleteTimeEntry(id) {
    return this.deleteTimesheet(id);
  }
}

// Export singleton instance
export const timesheetService = new TimesheetService();
