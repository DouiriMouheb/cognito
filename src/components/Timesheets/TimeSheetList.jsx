// src/components/Timesheets/TimeSheetList.jsx - Main container with calendar views
import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import {
  Plus,
  RefreshCw,
  AlertCircle,
  Calendar,
  List,
  ChevronLeft,
  ChevronRight,
  Play,
  Clock,
  CalendarDays,
  BarChart3,
} from "lucide-react";
import { useMockAuth } from "../../hooks/useMockAuth"; // Mock auth when Cognito is disabled
import { Button } from "../common/Button";
import { showToast } from "../../utils/toast";
import logger from "../../utils/logger";
import LoadingScreen from "../LoadingScreen";
import { useTimesheetStore } from "../../store/timesheetStore"; // Import the Zustand store

const ConfirmationModal = lazy(() => import("../common/ConfirmationModal").then(module => ({ default: module.ConfirmationModal })));
const EnhancedTimeSheetTable = lazy(() => import("./EnhancedTimesheetTable").then(module => ({ default: module.EnhancedTimeSheetTable })));
const TimeSheetModal = lazy(() => import("./TimeSheetModal").then(module => ({ default: module.TimeSheetModal })));
const TimesheetCalendarView = lazy(() => import("./TimesheetCalendarView").then(module => ({ default: module.TimesheetCalendarView })));
const TimesheetCalendarLandscapeView = lazy(() => import("./TimesheetCalendarView_Enhanced").then(module => ({ default: module.TimesheetCalendarView })));
const TimesheetTimeline = lazy(() => import("./TimesheetTimeline"));


export const TimeSheetList = () => {
  // Zustand store integration
  const {
    timeEntries,
    loading,
    error,
    processes,
    activities,
    organizations,
    customers,
    viewMode,
    currentDate,
    pagination,
    loadInitialData,
    loadTimeEntries,
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    setViewMode,
    setCurrentDate,
    setError,
  } = useTimesheetStore();


  // Modal states
  const [showTimeEntryModal, setShowTimeEntryModal] = useState(false);
  const [selectedTimeEntry, setSelectedTimeEntry] = useState(null);
  const [modalMode, setModalMode] = useState("create");

  // Delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const auth = useMockAuth(); // Using mock auth
  const { user, isLoading: authLoading } = auth;

  useEffect(() => {
    // Load initial dropdown data from the store
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    // Load time entries based on the current date and view mode from the store
    loadTimeEntries();
  }, [currentDate, viewMode, loadTimeEntries]);


  const openTimeEntryModal = useCallback((mode, entry = null, dateInfo = null) => {
    setModalMode(mode);

    let defaultEntry = {
      organizationId: "",
      customerId: "",
      processId: "",
      activityId: "",
      workLocation: "",
      notes: "",
      startTime: "",
      endTime: "",
      totalHours: 0,
    };

    // If dateInfo is provided (from calendar), use it
    if (dateInfo) {
      defaultEntry = {
        ...defaultEntry,
        startTime: dateInfo.startTime || "",
      };
    }

    setSelectedTimeEntry(entry || defaultEntry);
    setShowTimeEntryModal(true);
  }, []);



  const handleTimeEntrySave = useCallback(async (entryData) => {
    // The modal now handles the API call and state update via the store
    // This function can be used for any post-save logic if needed, but for now, it's just for consistency.
    // The modal will call the store's addTimeEntry or updateTimeEntry.
  }, []);

  const handleDeleteRequest = useCallback((entryId) => {
    const entry = timeEntries.find((e) => (e.id || e._id) === entryId);
    if (entry) {
      setEntryToDelete(entry);
      setShowDeleteModal(true);
    }
  }, [timeEntries]);

  const confirmDelete = async () => {
    if (!entryToDelete) return;

    setIsDeleting(true);

    try {
      const entryId = entryToDelete.id || entryToDelete._id;
      await deleteTimeEntry(entryId); // Call store action

      showToast.success("Time entry deleted successfully");
      setShowDeleteModal(false);
      setEntryToDelete(null);
    } catch (err) {
      // The store handles showing the error toast
      logger.error("Failed to delete time entry from component", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    if (!isDeleting) {
      setShowDeleteModal(false);
      setEntryToDelete(null);
    }
  };

  if (loading && timeEntries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading timesheet...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        {/* Header */}
        <div className="mb-6">
          {/* Controls Section */}
          <div className="flex flex-col lg:flex-row lg:justify-start lg:items-start space-y-4 lg:space-y-0">
            {" "}
            {/* View Mode Selector */}
            <div className="flex flex-row items-center gap-2 w-full max-w-xs mb-2">
              {/* Refresh Button */}
              <Button
                onClick={loadTimeEntries}
                variant="secondary"
                disabled={loading}
                className="px-2 py-1"
                aria-label="Refresh"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
              {/* Add Time Entry Button */}
              <Button
                onClick={() => openTimeEntryModal("create")}
                className="px-2 py-1"
                aria-label="New Entry"
              >
                <Plus className="h-4 w-4" />
              </Button>
              {/* Table View Toggle */}
              <Button
                variant={viewMode === "list" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={
                  viewMode === "list" ? "bg-blue-100 text-blue-700" : ""
                }
                title="Table View"
              >
                <List className="h-4 w-4" />
              </Button>
              {/* Card View Toggle */}
              <Button
                variant={viewMode === "card" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("card")}
                className={
                  viewMode === "card" ? "bg-blue-100 text-blue-700" : ""
                }
                title="Card View"
              >
                <Clock className="h-4 w-4" />
              </Button>
              {/* Calendar Landscape View Toggle */}
              <Button
                variant={viewMode === "calendarLand" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("calendarLand")}
                className={
                  viewMode === "calendarLand" ? "bg-blue-100 text-blue-700" : ""
                }
                title="Calendar Landscape View"
              >
                <CalendarDays className="h-4 w-4" />
              </Button>
              {/* Timeline View Toggle */}
              <Button
                variant={viewMode === "timeline" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("timeline")}
                className={
                  viewMode === "timeline" ? "bg-blue-100 text-blue-700" : ""
                }
                title="Timeline View"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <div className="text-red-700">{error}</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Time Entries View - All views mounted, only one visible for smooth transitions */}
        <Suspense fallback={<LoadingScreen />}>
          <div style={{ position: "relative" }}>
            <div style={{ display: viewMode === "calendar" ? "block" : "none" }}>
              <TimesheetCalendarView
                timeEntries={timeEntries}
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                onAddEntry={(dateInfo) =>
                  openTimeEntryModal("create", null, dateInfo)
                }
                onEditEntry={(entry) => openTimeEntryModal("edit", entry)}
                onDeleteEntry={handleDeleteRequest}
                projects={processes}
                activities={activities}
                customers={customers}
                loading={loading}
                onStartTimer={() => {}}
                activeTimer={null}
              />
          </div>
          <div
            style={{ display: viewMode === "calendarLand" ? "block" : "none" }}
          >
            <TimesheetCalendarLandscapeView
              timeEntries={timeEntries}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onAddEntry={(dateInfo) =>
                openTimeEntryModal("create", null, dateInfo)
              }
              onEditEntry={(entry) => openTimeEntryModal("edit", entry)}
              onDeleteEntry={handleDeleteRequest}
              projects={processes}
              activities={activities}
              customers={customers}
              loading={loading}
              onStartTimer={() => {}}
              activeTimer={null}
            />
          </div>
          <div style={{ display: viewMode === "timeline" ? "block" : "none" }}>
            <TimesheetTimeline
              entries={timeEntries}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onEdit={(entry) => openTimeEntryModal("edit", entry)}
              canEdit={() => true}
              getCustomerName={(customerId) => {
                const customer = customers.find(
                  (c) => (c.id || c._id) === customerId
                );
                return customer ? customer.name : "Unknown Customer";
              }}
              getOrganizationName={(organizationId) => {
                const organization = organizations.find(
                  (o) => (o.id || o._id) === organizationId
                );
                return organization
                  ? organization.name
                  : "Unknown Organization";
              }}
              getActivityName={(activityId) => {
                const activity = activities.find(
                  (a) => (a.id || a._id) === activityId
                );
                return activity ? activity.name : "Unknown Activity";
              }}
              formatTime={(timeString) => {
                if (!timeString) return "";
                const date = new Date(timeString);
                return date.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                });
              }}
              containerHeight={600}
            />
          </div>
          <div
            style={{
              display:
                viewMode !== "calendar" &&
                viewMode !== "calendarLand" &&
                viewMode !== "timeline"
                  ? "block"
                  : "none",
            }}
          >
            <EnhancedTimeSheetTable
              timeEntries={timeEntries}
              onEdit={(entry) => openTimeEntryModal("edit", entry)}
              onDelete={handleDeleteRequest}
              processes={processes}
              activities={activities}
              organizations={organizations}
              customers={customers}
              loading={loading}
              viewMode={viewMode === "card" ? "card" : "table"}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
            />
          </div>
        </div>

        {/* Time Entry Modal */}
        <TimeSheetModal
          isOpen={showTimeEntryModal}
          onClose={() => setShowTimeEntryModal(false)}
          timeEntry={selectedTimeEntry}
          onChange={(field, value) => {
            setSelectedTimeEntry(prev => ({
              ...prev,
              [field]: value
            }));
          }}
          onSave={handleTimeEntrySave}
          mode={modalMode}
          organizations={organizations} // Pass organizations from the store
          customers={customers} // Pass customers from the store
          projects={processes}
          activities={activities}
        />          {/* Delete Confirmation Modal */}
          <ConfirmationModal
            isOpen={showDeleteModal}
            onClose={cancelDelete}
            onConfirm={confirmDelete}
            title="Delete Time Entry"
            message="Are you sure you want to delete this time entry? This action cannot be undone."
            confirmText="Delete Entry"
            cancelText="Cancel"
            type="delete"
            isLoading={isDeleting}
            itemName={entryToDelete ? "Time Entry" : null}
          />
        </Suspense>
      </div>
    </>
  );
};
