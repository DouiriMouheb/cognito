import React from "react";
import { CustomSelect } from "../common/CustomSelect";
import { Building, Users, Settings, ClipboardList } from "lucide-react";

export function TimeSheetSelectors({
  formData,
  errors,
  organizations,
  customerOptions,
  processOptions,
  activityOptions, // Added activityOptions
  loadingOrganizations,
  loadingCustomers,
  loadingProcesses,
  onInputChange,
  isReadOnly
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <CustomSelect
        label="Organization"
        value={formData.organizationId}
        onChange={value => onInputChange("organizationId", value)}
        options={organizations}
        placeholder={loadingOrganizations ? "Loading..." : "Select Organization"}
        disabled={isReadOnly || loadingOrganizations}
        error={errors.organizationId}
        icon={Building}
      />
      <CustomSelect
        label="Customer"
        value={formData.customerId}
        onChange={value => onInputChange("customerId", value)}
        options={customerOptions}
        placeholder={loadingCustomers ? "Loading..." : "Select Customer"}
        disabled={isReadOnly || loadingCustomers || !formData.organizationId}
        error={errors.customerId}
        icon={Users}
      />
      <CustomSelect
        label="Process"
        value={formData.processId}
        onChange={value => onInputChange("processId", value)}
        options={processOptions}
        placeholder={loadingProcesses ? "Loading..." : "Select Process"}
        disabled={isReadOnly || loadingProcesses || !formData.organizationId}
        error={errors.processId}
        icon={Settings}
      />
      <CustomSelect
        label="Activity"
        value={formData.activityId}
        onChange={value => onInputChange("activityId", value)}
        options={activityOptions}
        placeholder={!formData.processId ? "Select Process First" : "Select Activity"}
        disabled={isReadOnly || !formData.processId}
        error={errors.activityId}
        icon={ClipboardList}
      />
    </div>
  );
}
