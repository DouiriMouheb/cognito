import React from "react";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { Calendar, X } from "lucide-react";

export function TimeSheetActions({
  formData,
  errors,
  isSubmitting,
  isReadOnly,
  onCancel,
  onSubmit,
  handleInputChange
}) {
  return (
    <>
      <div>
        <Input
          type="textarea"
          label="Task Description"
          value={formData.description}
          onChange={e => handleInputChange("description", e.target.value)}
          disabled={isReadOnly}
          rows={4}
          placeholder="Optional task description"
        />
      </div>
      <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-4 py-2"
        >
          <X className="w-4 h-4 mr-1" />
          Cancel
        </Button>
        {!isReadOnly && (
          <Button
            onClick={onSubmit}
            disabled={isSubmitting || !!errors.date}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
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
    </>
  );
}
