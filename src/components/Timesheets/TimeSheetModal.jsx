import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { CustomSelect } from "../common/CustomSelect";
import { showToast } from "../../utils/toast";
import { useAuth } from "react-oidc-context";
import { externalClientsService } from "../../services/externalClientsService";
import { organizationService } from "../../services/organizationService";
import { commessaService } from "../../services/commessaService";
import {
  Building,
  Users,
  MapPin,
  Settings,
  Activity,
  Calendar,
  Clock,
  X
} from "lucide-react";

export const TimeSheetModal = ({
  isOpen,
  onClose,
  timeEntry,
  onChange,
  onSave,
  mode = "create",
  projects = [],
  activities = [],
}) => {
  const auth = useAuth();

  const [formData, setFormData] = useState({
    organizationId: "",
    customerId: "",
    workLocation: "Organization Location",
    processId: "",
    activityId: "",
    date: new Date().toISOString().split('T')[0],
    startTime: "08:25",
    endTime: "09:25",
    description: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API data states
  const [organizations, setOrganizations] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [processOptions, setProcessOptions] = useState([]);
  const [loadingOrganizations, setLoadingOrganizations] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingProcesses, setLoadingProcesses] = useState(false);
  const [organizationsLoaded, setOrganizationsLoaded] = useState(false);

  // Cache for customers and processes by organization
  const [customerCache, setCustomerCache] = useState({});
  const [processCache, setProcessCache] = useState({});

  const processActivities = [
    { id: "", name: "Select a process first..." },
    { id: "1", name: "Frontend Development" },
    { id: "2", name: "Backend Development" },
    { id: "3", name: "Code Review" }
  ];

  // Load organizations only once when modal opens for the first time
  useEffect(() => {
    if (isOpen && !organizationsLoaded) {
      loadOrganizations();
    }
    if (isOpen) {
      initializeFormData();
      setErrors({});
    }
  }, [isOpen, timeEntry, organizationsLoaded]);

  // Load customers and processes when organization changes (with caching)
  useEffect(() => {
    if (formData.organizationId && formData.organizationId !== "") {
      // Check cache first for customers
      if (customerCache[formData.organizationId]) {
        console.log(`Loading customers from cache for org: ${formData.organizationId}`);
        setCustomerOptions(customerCache[formData.organizationId]);
      } else {
        console.log(`Loading customers from API for org: ${formData.organizationId}`);
        loadCustomers(formData.organizationId);
      }

      // Check cache first for processes
      if (processCache[formData.organizationId]) {
        console.log(`Loading processes from cache for org: ${formData.organizationId}`);
        setProcessOptions(processCache[formData.organizationId]);
      } else {
        console.log(`Loading processes from API for org: ${formData.organizationId}`);
        loadProcesses(formData.organizationId);
      }
    } else {
      setCustomerOptions([]);
      setProcessOptions([]);
    }
  }, [formData.organizationId, customerCache, processCache]);

  const loadOrganizations = async () => {
    try {
      setLoadingOrganizations(true);
      const response = await organizationService.getOrganizations();
      if (response.success) {
        const orgsWithDefault = [
          { id: "", code: "", name: "Select an organization..." },
          ...response.data
        ];
        setOrganizations(orgsWithDefault);
        setOrganizationsLoaded(true);

        // Pre-select first organization if creating new entry and no organization is selected
        if (!timeEntry && response.data.length > 0 && !formData.organizationId) {
          const firstOrg = response.data[0];
          setFormData(prev => ({
            ...prev,
            organizationId: firstOrg.code || firstOrg.id
          }));
        }
      }
    } catch (error) {
      console.error("Error loading organizations:", error);
      showToast.error("Failed to load organizations");
    } finally {
      setLoadingOrganizations(false);
    }
  };

  const loadCustomers = async (organizationCode) => {
    if (!auth.user?.access_token) {
      console.warn("No access token available for loading customers");
      return;
    }

    try {
      setLoadingCustomers(true);
      const response = await externalClientsService.getClientsForOrganization(
        organizationCode,
        auth.user.access_token,
        { limit: 1000 } // Get all customers for dropdown
      );

      if (response.success) {
        const customerOptions = response.data.clients.map(client => ({
          value: client.id,
          label: client.ragsoc || 'Unknown Client',
          name: client.ragsoc || 'Unknown Client'
        }));

        // Cache the results for this organization
        setCustomerCache(prev => ({
          ...prev,
          [organizationCode]: customerOptions
        }));

        setCustomerOptions(customerOptions);
      } else {
        showToast.error(response.error?.message || "Failed to load customers");
        setCustomerOptions([]);
      }
    } catch (error) {
      console.error("Error loading customers:", error);
      showToast.error("Failed to load customers from API");
      setCustomers([{ id: "", name: "Error loading customers" }]);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const loadProcesses = async (organizationCode) => {
    if (!auth.user?.access_token) {
      console.warn("No access token available for loading processes");
      return;
    }

    try {
      setLoadingProcesses(true);
      const response = await commessaService.getCommesseForOrganization(
        organizationCode,
        auth.user.access_token,
        { limit: 1000 } // Get all processes for dropdown
      );

      if (response.success) {
        const processOptions = response.data.commesse.map(commessa => ({
          value: commessa.id,
          label: commessa.descrizione || commessa.codice || 'Unknown Process',
          name: commessa.descrizione || commessa.codice || 'Unknown Process'
        }));

        // Cache the results for this organization
        setProcessCache(prev => ({
          ...prev,
          [organizationCode]: processOptions
        }));

        setProcessOptions(processOptions);
      } else {
        showToast.error(response.error?.message || "Failed to load processes");
        setProcessOptions([]);
      }
    } catch (error) {
      console.error("Error loading processes:", error);
      showToast.error("Failed to load processes from API");
      setProcesses([{ id: "", name: "Error loading processes" }]);
    } finally {
      setLoadingProcesses(false);
    }
  };

  const initializeFormData = () => {
    if (timeEntry) {
      setFormData({
        organizationId: timeEntry.organizationId || "",
        customerId: timeEntry.customerId || "",
        workLocation: timeEntry.workLocation || "Organization Location",
        processId: timeEntry.processId || "",
        activityId: timeEntry.activityId || "",
        date: timeEntry.date || new Date().toISOString().split('T')[0],
        startTime: timeEntry.startTime || "08:25",
        endTime: timeEntry.endTime || "09:25",
        description: timeEntry.description || ""
      });
    } else {
      // Reset to defaults for new entry
      setFormData({
        organizationId: "",
        customerId: "",
        workLocation: "Organization Location",
        processId: "",
        activityId: "",
        date: new Date().toISOString().split('T')[0],
        startTime: "08:25",
        endTime: "09:25",
        description: ""
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };

      // Clear dependent selections when parent changes
      if (field === "organizationId") {
        newData.customerId = "";
        newData.processId = "";
        newData.activityId = "";
      } else if (field === "processId") {
        newData.activityId = "";
      }

      return newData;
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }

    // Notify parent component
    if (onChange) {
      onChange(field, value);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.organizationId) {
      newErrors.organizationId = "Organization is required";
    }
    
    if (!formData.customerId) {
      newErrors.customerId = "Customer is required";
    }
    
    if (!formData.processId) {
      newErrors.processId = "Process is required";
    }
    
    if (!formData.activityId) {
      newErrors.activityId = "Activity is required";
    }
    
    if (!formData.date) {
      newErrors.date = "Date is required";
    }
    
    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }
    
    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }
    
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = "End time must be after start time";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSave(formData);
      onClose();
      showToast.success("Time entry saved successfully!");
    } catch (error) {
      console.error("Error saving time entry:", error);
      showToast.error("Failed to save time entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      organizationId: "",
      customerId: "",
      workLocation: "Organization Location",
      processId: "",
      activityId: "",
      date: new Date().toISOString().split('T')[0],
      startTime: "08:25",
      endTime: "09:25",
      description: ""
    });
    setErrors({});
    onClose();
  };

  const isReadOnly = mode === "view";
  const title = mode === "create" ? "Add Time Entry" : mode === "edit" ? "Edit Time Entry" : "View Time Entry";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title=""
      size="lg"
      className="max-w-2xl"
    >
      <div className="p-6 space-y-6">
        {/* Row 1: Organization, Customer, Work Location */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Building className="w-4 h-4 mr-1" />
              Organization *
            </label>
            <select
              value={formData.organizationId}
              onChange={(e) => handleInputChange("organizationId", e.target.value)}
              disabled={isReadOnly || loadingOrganizations}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.organizationId ? "border-red-300" : "border-gray-300"
              } ${isReadOnly || loadingOrganizations ? "bg-gray-100" : "bg-white"}`}
            >
              {loadingOrganizations ? (
                <option value="">Loading organizations...</option>
              ) : (
                organizations.map((org) => (
                  <option key={org.id || org.code} value={org.code || org.id}>
                    {org.name}
                  </option>
                ))
              )}
            </select>
            {errors.organizationId && (
              <p className="mt-1 text-sm text-red-600">{errors.organizationId}</p>
            )}
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 mr-1" />
              Customer *
            </label>
            <CustomSelect
              value={formData.customerId}
              onChange={(value) => handleInputChange("customerId", value)}
              options={customerOptions}
              placeholder={
                loadingCustomers ? "Loading customers..." :
                !formData.organizationId ? "Select an organization first..." :
                "Search customers..."
              }
              searchable={true}
              clearable={true}
              disabled={isReadOnly || loadingCustomers || !formData.organizationId}
              loading={loadingCustomers}
              error={errors.customerId}
              icon={Users}
              emptyMessage="No customers found"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              Work Location
            </label>
            <select
              value={formData.workLocation}
              onChange={(e) => handleInputChange("workLocation", e.target.value)}
              disabled={isReadOnly}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isReadOnly ? "bg-gray-100" : "bg-white"
              } border-gray-300`}
            >
              <option value="Organization Location">Organization Location</option>
              <option value="Remote">Remote</option>
              <option value="Client Site">Client Site</option>
            </select>
          </div>
        </div>

        {/* Row 2: Process, Activity, Date */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Settings className="w-4 h-4 mr-1" />
              Process *
            </label>
            <CustomSelect
              value={formData.processId}
              onChange={(value) => handleInputChange("processId", value)}
              options={processOptions}
              placeholder={
                loadingProcesses ? "Loading processes..." :
                !formData.organizationId ? "Select an organization first..." :
                "Search processes..."
              }
              searchable={true}
              clearable={true}
              disabled={isReadOnly || loadingProcesses || !formData.organizationId}
              loading={loadingProcesses}
              error={errors.processId}
              icon={Settings}
              emptyMessage="No processes found"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Activity className="w-4 h-4 mr-1" />
              Activity *
            </label>
            <select
              value={formData.activityId}
              onChange={(e) => handleInputChange("activityId", e.target.value)}
              disabled={isReadOnly || !formData.processId}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.activityId ? "border-red-300" : "border-gray-300"
              } ${isReadOnly || !formData.processId ? "bg-gray-100" : "bg-white"}`}
            >
              {!formData.processId ? (
                <option value="">Select a process first...</option>
              ) : (
                processActivities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.name}
                  </option>
                ))
              )}
            </select>
            {errors.activityId && (
              <p className="mt-1 text-sm text-red-600">{errors.activityId}</p>
            )}
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 mr-1" />
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              disabled={isReadOnly}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.date ? "border-red-300" : "border-gray-300"
              } ${isReadOnly ? "bg-gray-100" : "bg-white"}`}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
          </div>
        </div>

        {/* Row 3: Start Time, End Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 mr-1" />
              Start Time *
            </label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => handleInputChange("startTime", e.target.value)}
              disabled={isReadOnly}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.startTime ? "border-red-300" : "border-gray-300"
              } ${isReadOnly ? "bg-gray-100" : "bg-white"}`}
            />
            {errors.startTime && (
              <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
            )}
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 mr-1" />
              End Time *
            </label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => handleInputChange("endTime", e.target.value)}
              disabled={isReadOnly}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.endTime ? "border-red-300" : "border-gray-300"
              } ${isReadOnly ? "bg-gray-100" : "bg-white"}`}
            />
            {errors.endTime && (
              <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
            )}
          </div>
        </div>

        {/* Task Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            disabled={isReadOnly}
            rows={4}
            placeholder="Optional task description"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
              isReadOnly ? "bg-gray-100" : "bg-white"
            } border-gray-300`}
          />
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-4 py-2"
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>

          {!isReadOnly && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </div>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-1" />
                  Create
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
