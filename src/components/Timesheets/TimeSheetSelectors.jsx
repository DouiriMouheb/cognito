import React from "react";
import { CustomSelect } from "../common/CustomSelect";
import { Building, Users, Settings } from "lucide-react";

export function TimeSheetSelectors({
  formData,
  errors,
  organizations,
  customerOptions,
  processOptions,
  loadingOrganizations,
  loadingCustomers,
  loadingProcesses,
  onInputChange,
  isReadOnly
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
      <CustomSelect
        label="Organization"
        value={formData.organizationId}
        onChange={value => onInputChange("organizationId", value)}
        options={organizations}
        placeholder={loadingOrganizations ? "Loading organizations..." : "Select an organization..."}
        disabled={isReadOnly || loadingOrganizations}
        error={errors.organizationId}
        icon={Building}
      />
      <CustomSelect
        label="Customer"
        value={formData.customerId}
        onChange={value => onInputChange("customerId", value)}
        options={customerOptions}
        placeholder={loadingCustomers ? "Loading customers..." : "Select a customer..."}
        disabled={isReadOnly || loadingCustomers || !formData.organizationId}
        error={errors.customerId}
        icon={Users}
      />
      <CustomSelect
        label="Commessa"
        value={formData.processId}
        onChange={value => onInputChange("processId", value)}
        options={processOptions}
        placeholder={loadingProcesses ? "Loading processes..." : "Select an organization first..."}
        disabled={isReadOnly || loadingProcesses || !formData.organizationId}
        error={errors.processId}
        icon={Settings}
      />
    </div>
  );
}
