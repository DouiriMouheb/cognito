// src/store/timesheetStore.js
import { create } from 'zustand';
import { timesheetService } from '../services/timesheetService';
import { processService } from '../services/processService';
import { organizationService } from '../services/organizationService';
import { customerService } from '../services/customerService';
import { showToast } from '../utils/toast';

export const useTimesheetStore = create((set, get) => ({
  timeEntries: [],
  processes: [],
  activities: [],
  organizations: [],
  customers: [],
  loading: true,
  error: null,
  currentDate: new Date(),
  viewMode: 'list',

  // Actions
  setViewMode: (viewMode) => set({ viewMode }),
  setCurrentDate: (currentDate) => set({ currentDate }),

  loadInitialData: async () => {
    try {
      await Promise.all([
        get().loadOrganizations(),
        get().loadProcesses(),
        get().loadCustomers(),
      ]);
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  },

  loadOrganizations: async () => {
    try {
      const response = await organizationService.getActiveOrganizations();
      if (response.success) {
        set({ organizations: response.data || [] });
      } else {
        showToast.error("Failed to load organizations");
      }
    } catch (error) {
      showToast.error(`Error loading organizations: ${error.message}`);
    }
  },

  loadProcesses: async () => {
    try {
      const response = await processService.getProcesses();
      if (response.success) {
        const processesData = response.data?.processes || response.data || [];
        set({ processes: processesData });

        const allActivities = [];
        processesData.forEach((process) => {
          if (process.activities && Array.isArray(process.activities)) {
            process.activities.forEach((activity) => {
              allActivities.push({
                ...activity,
                processId: process.id,
                processName: process.name,
              });
            });
          }
        });
        set({ activities: allActivities });
      } else {
        showToast.error("Failed to load processes");
      }
    } catch (error) {
      showToast.error(`Error loading processes: ${error.message}`);
    }
  },

  loadCustomers: async () => {
    try {
      const response = await customerService.getCustomers();
      if (response.success) {
        set({ customers: response.data || [] });
      } else {
        showToast.error("Failed to load customers");
      }
    } catch (error) {
      showToast.error(`Error loading customers: ${error.message}`);
    }
  },

  loadTimeEntries: async () => {
    set({ loading: true, error: null });
    try {
      const { viewMode, currentDate } = get();
      const dateRange = get().getDateRangeForView(viewMode, currentDate);
      
      let queryParams = {};
      if (viewMode === 'list' || viewMode === 'card' || viewMode === 'timeline') {
        const date = new Date(currentDate);
        queryParams.startDate = date.toISOString().split('T')[0];
        queryParams.endDate = date.toISOString().split('T')[0];
      } else {
        queryParams.startDate = dateRange.start;
        queryParams.endDate = dateRange.end;
      }

      const response = await timesheetService.getTimeEntries(queryParams);
      if (response.success) {
        set({ timeEntries: response.data || [] });
      } else {
        set({ error: response.error || 'Failed to load time entries' });
      }
    } catch (err) {
      const errorMessage = err.message || "Failed to load time entries";
      set({ error: errorMessage });
      showToast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  addTimeEntry: (entry) => {
    set((state) => ({ timeEntries: [entry, ...state.timeEntries] }));
    get().loadTimeEntries();
  },

  updateTimeEntry: (updatedEntry) => {
    set((state) => ({
      timeEntries: state.timeEntries.map((entry) =>
        (entry.id || entry._id) === (updatedEntry.id || updatedEntry._id) ? updatedEntry : entry
      ),
    }));
    get().loadTimeEntries();
  },

  deleteTimeEntry: async (entryId) => {
    try {
      await timesheetService.deleteTimeEntry(entryId);
      set((state) => ({
        timeEntries: state.timeEntries.filter((entry) => (entry.id || entry._id) !== entryId),
      }));
      showToast.success("Time entry deleted successfully");
      get().loadTimeEntries();
    } catch (err) {
      showToast.error("Failed to delete time entry");
    }
  },

  getDateRangeForView: (viewMode, currentDate) => {
    const date = new Date(currentDate);
    switch (viewMode) {
      case "daily":
      case "timeline":
        return {
          start: date.toISOString().split("T")[0],
          end: date.toISOString().split("T")[0],
        };
      case "weekly":
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return {
          start: startOfWeek.toISOString().split("T")[0],
          end: endOfWeek.toISOString().split("T")[0],
        };
      case "monthly":
      case "calendar":
      case "calendarLand":
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        return {
          start: startOfMonth.toISOString().split("T")[0],
          end: endOfMonth.toISOString().split("T")[0],
        };
      default:
        return {
          start: date.toISOString().split("T")[0],
          end: date.toISOString().split("T")[0],
        };
    }
  },
}));
