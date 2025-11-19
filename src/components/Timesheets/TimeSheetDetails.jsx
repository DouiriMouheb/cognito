import React from "react";
import { Input } from "../common/Input";
import { CustomSelect } from "../common/CustomSelect";
import { Calendar, MapPin, Clock } from "lucide-react";

export function TimeSheetDetails({
  formData,
  errors,
  onInputChange,
  isReadOnly
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 mr-1" />
            Date *
          </label>
          <Input
            type="date"
            value={formData.date}
            onChange={e => onInputChange("date", e.target.value)}
            disabled={isReadOnly}
            required
            error={errors.date}
            max={new Date().toISOString().split('T')[0]}
            className={errors.date ? 'border-red-500' : ''}
          />
        </div>
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 mr-1" />
            Work Location *
          </label>
          <CustomSelect
            value={formData.workLocation}
            onChange={value => onInputChange("workLocation", value)}
            options={[
              { value: "Organization Location", label: "Office", name: "Organization Location" },
              { value: "Remote", label: "Remote", name: "Remote" },
              { value: "Client Site", label: "Client Site", name: "Client Site" }
            ]}
            placeholder=" "
            disabled={isReadOnly}
            icon={MapPin}
            emptyMessage="No work locations available"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 mr-1" />
            Start Time
          </label>
          <Input
            type="time"
            value={formData.startTime}
            onChange={e => onInputChange("startTime", e.target.value)}
            disabled={isReadOnly}
            required
            error={errors.startTime}
          />
        </div>
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 mr-1" />
            End Time
          </label>
          <Input
            type="time"
            value={formData.endTime}
            onChange={e => onInputChange("endTime", e.target.value)}
            disabled={isReadOnly}
            required
            error={errors.endTime}
          />
        </div>
      </div>
    </div>
  );
}
