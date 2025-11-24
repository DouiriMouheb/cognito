import React, { useCallback, useState, useEffect, useMemo } from "react";
import { TimeSheetSelectors } from "./TimeSheetSelectors";
import { Modal } from "../common/Modal";
import { useMockAuth } from "../../hooks/useMockAuth";
import { TimeSheetDetails } from "./TimeSheetDetails";
import { MapPin } from "lucide-react";
import { TimeSheetActions } from "./TimeSheetActions";
import { TransportationCostModal } from "./TransportationCostModal";
import { showToast } from "../../utils/toast";

export const TimeSheetModal = ({
  isOpen,
  onClose,
  timeEntry,
  onChange,
  onSave,
  mode = "create",
  organizations = [],
  customers = [],
  projects = [],
  activities = [],
}) => {
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const auth = useMockAuth();

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

  useEffect(() => {
    if (isOpen) {
      initializeFormData();
      setErrors({});
    }
  }, [isOpen, timeEntry]);

  const toHHMM = (val) => {
    if (!val) return "";
    if (/^\d{2}:\d{2}$/.test(val)) return val;
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return d.toISOString().substr(11, 5);
    }
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
      setFormData({
        ...DEFAULT_FORM_DATA,
        date: today
      });
    }
  }, [timeEntry, today]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === "organizationId") {
        newData.customerId = "";
        newData.processId = "";
        newData.activityId = "";
      } else if (field === "processId") {
        newData.activityId = "";
      }
      return newData;
    });
    setErrors(prev => ({ ...prev, [field]: "" }));
    if (onChange) {
      onChange(field, value);
    }
  }, [onChange]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.organizationId) newErrors.organizationId = "Organization is required";
    if (!formData.customerId) newErrors.customerId = "Customer is required";
    if (!formData.processId) newErrors.processId = "Process is required";
    if (!formData.activityId) newErrors.activityId = "Activity is required";
    if (!formData.date) newErrors.date = "Date is required";
    else if (formData.date > today) newErrors.date = "Date cannot be in the future";
    if (!formData.startTime) newErrors.startTime = "Start time is required";
    if (!formData.endTime) newErrors.endTime = "End time is required";
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = "End time must be after start time";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, today]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;
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
  }, [validateForm, onSave, formData, onClose]);

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
    if (!transportationData.selectedClass) {
      setHasTransportationCosts(false);
      setTransportationData(DEFAULT_TRANSPORTATION_DATA);
    }
  }, [transportationData.selectedClass]);

  const handleCancel = useCallback(() => {
    setFormData({ ...DEFAULT_FORM_DATA, date: today });
    setErrors({});
    setHasTransportationCosts(false);
    setTransportationData(DEFAULT_TRANSPORTATION_DATA);
    onClose();
  }, [onClose, today]);

  const isReadOnly = mode === "view";

  const organizationOptions = useMemo(() =>
    organizations.map(org => ({
      value: org.id || org._id,
      label: org.name,
    })), [organizations]
  );

  const customerOptions = useMemo(() => {
    if (!formData.organizationId) return [];
    return customers
      .map(c => ({ value: c.id || c._id, label: c.name }));
  }, [customers, formData.organizationId]);

  const processOptions = useMemo(() => {
    if (!formData.organizationId) return [];
     return projects
      .map(p => ({ value: p.id || p._id, label: p.name }));
  }, [projects, formData.organizationId]);

  const activityOptions = useMemo(() => {
    if (!formData.processId) return [];
    const process = projects.find(p => (p.id || p._id) === formData.processId);
    return process?.activities?.map(a => ({ value: a.id || a._id, label: a.name })) || [];
  }, [activities, formData.processId, projects]);


  return (
    <>
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      size="2xl"
    >
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Row 1: Organization, Customer, Process Selectors */}
        <TimeSheetSelectors
          formData={formData}
          errors={errors}
          organizations={organizationOptions}
          customerOptions={customerOptions}
          processOptions={processOptions}
          activityOptions={activityOptions}
          loadingOrganizations={false} // Now controlled by parent
          loadingCustomers={false} // Now controlled by parent
          loadingProcesses={false} // Now controlled by parent
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
