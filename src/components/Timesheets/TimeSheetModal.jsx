import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { showToast } from "../../utils/toast";
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
  
  // Mock data - replace with actual API calls
  const organizations = [
    { id: "", name: "Select an organization..." },
    { id: "1", name: "Acme Corp" },
    { id: "2", name: "Tech Solutions Inc" }
  ];
  
  const customers = [
    { id: "", name: "Select an organization first..." },
    { id: "1", name: "Client A" },
    { id: "2", name: "Client B" }
  ];
  
  const processes = [
    { id: "", name: "Select a process..." },
    { id: "1", name: "Development" },
    { id: "2", name: "Testing" },
    { id: "3", name: "Documentation" }
  ];
  
  const processActivities = [
    { id: "", name: "Select a process first..." },
    { id: "1", name: "Frontend Development" },
    { id: "2", name: "Backend Development" },
    { id: "3", name: "Code Review" }
  ];

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
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
      setErrors({});
    }
  }, [isOpen, timeEntry]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
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
              disabled={isReadOnly}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.organizationId ? "border-red-300" : "border-gray-300"
              } ${isReadOnly ? "bg-gray-100" : "bg-white"}`}
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
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
            <select
              value={formData.customerId}
              onChange={(e) => handleInputChange("customerId", e.target.value)}
              disabled={isReadOnly}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.customerId ? "border-red-300" : "border-gray-300"
              } ${isReadOnly ? "bg-gray-100" : "bg-white"}`}
            >
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>
            )}
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
            <select
              value={formData.processId}
              onChange={(e) => handleInputChange("processId", e.target.value)}
              disabled={isReadOnly}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.processId ? "border-red-300" : "border-gray-300"
              } ${isReadOnly ? "bg-gray-100" : "bg-white"}`}
            >
              {processes.map((process) => (
                <option key={process.id} value={process.id}>
                  {process.name}
                </option>
              ))}
            </select>
            {errors.processId && (
              <p className="mt-1 text-sm text-red-600">{errors.processId}</p>
            )}
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Activity className="w-4 h-4 mr-1" />
              Activity *
            </label>
            <select
              value={formData.activityId}
              onChange={(e) => handleInputChange("activityId", e.target.value)}
              disabled={isReadOnly}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.activityId ? "border-red-300" : "border-gray-300"
              } ${isReadOnly ? "bg-gray-100" : "bg-white"}`}
            >
              {processActivities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.name}
                </option>
              ))}
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
