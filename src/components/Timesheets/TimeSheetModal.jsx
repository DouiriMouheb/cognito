

import React, { useCallback, useState, useEffect, useMemo } from "react";
import { TimeSheetSelectors } from "./TimeSheetSelectors";
import { Modal } from "../common/Modal";
import { useMockAuth } from "../../hooks/useMockAuth";
import { TimeSheetDetails } from "./TimeSheetDetails";
import { MapPin } from "lucide-react";
import { TimeSheetActions } from "./TimeSheetActions";
import { TransportationCostModal } from "./TransportationCostModal";

import { organizationService } from "../../services/organizationService";
import { showToast } from "../../utils/toast";
import { commessaService } from "@/services/commessaService";
import { externalClientsService } from "@/services/externalClientsService";

// ...existing code...

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
  // Load organizations for dropdown
  const loadOrganizations = useCallback(async () => {
    try {
      setLoadingOrganizations(true);
      // Replace with your actual service call
      const response = await organizationService.getOrganizations();
      if (response.success) {
        setOrganizations(response.data.organizations || []);
        setOrganizationsLoaded(true);
      } else {
        showToast.error(response.error?.message || "Failed to load organizations");
        setOrganizations([]);
      }
    } catch (error) {
      console.error("Error loading organizations:", error);
      showToast.error("Failed to load organizations from API");
      setOrganizations([]);
    } finally {
      setLoadingOrganizations(false);
    }
  }, []);
  // Memoize current date to avoid recalculation
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const auth = useMockAuth(); // Using mock auth

  // API Configuration
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Default form data
  const DEFAULT_FORM_DATA = {
    organizationId: "",
    customerId: "",
    workLocation: "Organization Location",
    processId: "",
    activityId: "",
    date: "",
    startTime: "08:25",
    endTime: "09:25",
    description: ""
  };

  const DEFAULT_TRANSPORTATION_DATA = {
    entryLocation: "",
    entryLocationName: "",
    exitLocation: "",
    exitLocationName: "",
    selectedClass: "",
    cost: 0
  };

  const [formData, setFormData] = useState({
    ...DEFAULT_FORM_DATA,
    date: today
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasTransportationCosts, setHasTransportationCosts] = useState(false);
  const [showTransportationModal, setShowTransportationModal] = useState(false);
  const [transportationData, setTransportationData] = useState(DEFAULT_TRANSPORTATION_DATA);
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

  // Load customers for an organization
  const loadCustomers = useCallback(async (organizationCode) => {
    if (!auth.user?.access_token) {
      console.warn("No access token available for loading customers");
      return;
    }
    try {
      setLoadingCustomers(true);
      const response = await externalClientsService.getClientsForOrganization(
        organizationCode,
        auth.user.access_token,
        { limit: 1000 }
      );
      if (response.success) {
        const customerOptions = response.data.clients.map(client => ({
          value: client.id,
          label: client.ragsoc || 'Unknown Client',
          name: client.ragsoc || 'Unknown Client'
        }));
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
      setCustomerOptions([]);
    } finally {
      setLoadingCustomers(false);
    }
  }, [auth.user?.access_token]);

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


  const loadProcesses = useCallback(async (organizationCode) => {
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
      setProcessOptions([]);
    } finally {
      setLoadingProcesses(false);
    }
  }, [auth.user?.access_token]);

  // Load customers and processes when organization changes (with caching)
  useEffect(() => {
    if (formData.organizationId && formData.organizationId !== "") {
      // Check cache first for customers
      if (customerCache[formData.organizationId]) {
        setCustomerOptions(customerCache[formData.organizationId]);
      } else {
        loadCustomers(formData.organizationId);
      }
      // Check cache first for processes
      if (processCache[formData.organizationId]) {
        setProcessOptions(processCache[formData.organizationId]);
      } else {
        loadProcesses(formData.organizationId);
      }
    } else {
      setCustomerOptions([]);
      setProcessOptions([]);
    }
  }, [formData.organizationId, customerCache, processCache, loadCustomers, loadProcesses]);

  // Helper to extract HH:mm from ISO or valid string
  const toHHMM = (val) => {
    if (!val) return "";
    if (/^\d{2}:\d{2}$/.test(val)) return val;
    // Try to parse ISO or other formats
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return d.toISOString().substr(11, 5);
    }
    // fallback: try splitting
    if (val.includes('T')) {
      return val.split('T')[1]?.substr(0,5) || "";
    }
    return "";
  };

  const initializeFormData = useCallback(() => {
    if (timeEntry) {
      setFormData({
        organizationId: timeEntry.organizationId || "",
        customerId: timeEntry.customerId || "",
        workLocation: timeEntry.workLocation || "Organization Location",
        processId: timeEntry.processId || "",
        activityId: timeEntry.activityId || "",
        date: timeEntry.date || today,
        startTime: toHHMM(timeEntry.startTime) || "08:25",
        endTime: toHHMM(timeEntry.endTime) || "09:25",
        description: timeEntry.description || ""
      });
    } else {
      // Reset to defaults for new entry
      setFormData({
        ...DEFAULT_FORM_DATA,
        date: today
      });
    }
  }, [timeEntry, today]);

  const handleInputChange = useCallback((field, value) => {
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
    setErrors(prev => {
      if (prev[field]) {
        return { ...prev, [field]: "" };
      }
      return prev;
    });

    // Notify parent component
    if (onChange) {
      onChange(field, value);
    }
  }, [onChange]);

  const validateForm = useCallback(() => {
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
    } else if (formData.date > today) {
      newErrors.date = "Date cannot be in the future";
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
  }, [formData, today]);

  const handleSubmit = useCallback(async () => {
    // Compose the body to be sent
    const body = {
      ...formData,
      transportation: hasTransportationCosts ? transportationData : undefined
    };
    // Log the body for debug
    console.log("[TimeSheet Create] Body to send:", body);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave(formData); // keep original behavior
      onClose();
      showToast.success("Time entry saved successfully!");
    } catch (error) {
      console.error("Error saving time entry:", error);
      showToast.error("Failed to save time entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, onSave, formData, onClose, hasTransportationCosts, transportationData]);

  const handleTransportationToggle = useCallback(() => {
    const newValue = !hasTransportationCosts;
    setHasTransportationCosts(newValue);
    if (newValue) {
      setShowTransportationModal(true);
    } else {
      setTransportationData(DEFAULT_TRANSPORTATION_DATA);
    }
  }, [hasTransportationCosts]);

  const handleTransportationSave = useCallback((data) => {
    setTransportationData(data);
    setShowTransportationModal(false);
  }, []);

  const handleTransportationCancel = useCallback(() => {
    setShowTransportationModal(false);
    // Reset if nothing was selected
    if (!transportationData.selectedClass) {
      setHasTransportationCosts(false);
      setTransportationData(DEFAULT_TRANSPORTATION_DATA);
    }
  }, [transportationData.selectedClass]);


  const handleCancel = useCallback(() => {
    setFormData({
      ...DEFAULT_FORM_DATA,
      date: today
    });
    setErrors({});
    setHasTransportationCosts(false);
    setTransportationData(DEFAULT_TRANSPORTATION_DATA);
    onClose();
  }, [onClose, today]);

  const isReadOnly = mode === "view";

  // Memoize organization options
  const organizationOptions = useMemo(() => 
    organizations.map(org => ({
      value: org.code || org.id,
      label: org.name,
      name: org.name
    })), [organizations]
  );

  return (
    <>
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title=""
      size="lg"
      className="max-w-2xl mx-4 sm:mx-auto w-full sm:max-w-2xl"
    >
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Row 1: Organization, Customer, Process Selectors */}
        <TimeSheetSelectors
          formData={formData}
          errors={errors}
          organizations={organizationOptions}
          customerOptions={customerOptions}
          processOptions={processOptions}
          loadingOrganizations={loadingOrganizations}
          loadingCustomers={loadingCustomers}
          loadingProcesses={loadingProcesses}
          onInputChange={handleInputChange}
          isReadOnly={isReadOnly}
        />

        {/* Row 2: Date, Work Location, Time Inputs */}
        <TimeSheetDetails
          formData={formData}
          errors={errors}
          onInputChange={handleInputChange}
          isReadOnly={isReadOnly}
        />

        {/* Row 3: Start Time, End Time */}
     

        {/* Transportation Costs Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Transportation Costs</span>
            {hasTransportationCosts && transportationData.cost > 0 && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                €{transportationData.cost.toFixed(2)} (Class {transportationData.selectedClass})
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleTransportationToggle}
            disabled={isReadOnly}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              hasTransportationCosts ? 'bg-blue-600' : 'bg-gray-300'
            } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                hasTransportationCosts ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Task Description and Footer Actions */}
        <TimeSheetActions
          formData={formData}
          errors={errors}
          isSubmitting={isSubmitting}
          isReadOnly={isReadOnly}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          handleInputChange={handleInputChange}
        />
      </div>
    </Modal>

    {/* Transportation Costs Modal */}
    <TransportationCostModal
      isOpen={showTransportationModal}
      onClose={handleTransportationCancel}
      onSave={handleTransportationSave}
      onChange={setTransportationData}
      initialData={transportationData}
    />
    </>
  );
};
