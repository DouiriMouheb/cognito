import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { CustomSelect } from "../common/CustomSelect";
import { showToast } from "../../utils/toast";
import { Check } from "lucide-react";

// API Configuration
// Note: This component uses a separate Transportation Cost API endpoint
// configured via VITE_TRANSPORTATION_COST_API environment variable
const API_BASE_URL = import.meta.env.VITE_TRANSPORTATION_COST_API;

// Vehicle class options
const VEHICLE_CLASSES = [
  { id: 'A', label: 'Class A' },
  { id: 'B', label: 'Class B' },
  { id: '3', label: 'Class 3' },
  { id: '4', label: 'Class 4' },
  { id: '5', label: 'Class 5' }
];

export const TransportationCostModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  onChange,
  initialData = null 
}) => {
  const [transportationData, setTransportationData] = useState({
    entryLocation: "",
    entryLocationName: "",
    exitLocation: "",
    exitLocationName: "",
    selectedClass: "",
    cost: 0
  });

  const [allExits, setAllExits] = useState([]);
  const [loadingExits, setLoadingExits] = useState(false);
  const [exitsLoaded, setExitsLoaded] = useState(false);

  const [tollData, setTollData] = useState(null);
  const [loadingToll, setLoadingToll] = useState(false);
  const [transportationError, setTransportationError] = useState("");

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      // If there's initial data, use it. Otherwise, reset to default.
      if (initialData) {
        setTransportationData(initialData);
      } else {
        setTransportationData({
          entryLocation: "",
          entryLocationName: "",
          exitLocation: "",
          exitLocationName: "",
          selectedClass: "",
          cost: 0
        });
      }
      // Always reset toll data and errors
      setTollData(null);
      setTransportationError("");
    }
  }, [isOpen, initialData]);

  // Notify parent on every change
  useEffect(() => {
    if (onChange) onChange(transportationData);
  }, [transportationData, onChange]);

  // Load all exits on modal open
  useEffect(() => {
    if (isOpen && !exitsLoaded) {
      loadAllExits();
    }
  }, [isOpen, exitsLoaded]);

  // Load toll prices when both locations are selected
  useEffect(() => {
    if (
      transportationData.entryLocation &&
      transportationData.exitLocation &&
      transportationData.entryLocation !== transportationData.exitLocation
    ) {
      loadTollPrices(
        transportationData.entryLocationName,
        transportationData.exitLocationName
      );
    } else if (
      transportationData.entryLocation &&
      transportationData.exitLocation &&
      transportationData.entryLocation === transportationData.exitLocation
    ) {
      setTransportationError("Entry and exit locations must be different");
      setTollData(null);
    }
  }, [transportationData.entryLocation, transportationData.exitLocation]);

  const loadAllExits = useCallback(async () => {
    const controller = new AbortController();
    try {
      setLoadingExits(true);
      const url = `${API_BASE_URL}/api/exits`;

      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error('Failed to fetch exits');
      }

      const data = await response.json();

      const options = data.map(exit => ({
        value: exit._id || exit.name,
        label: exit.name,
        name: exit.name,
        code: exit.code,
        _id: exit._id
      }));

      setAllExits(options);
      setExitsLoaded(true);
    } catch (error) {
      if (error.name === 'AbortError') return;
      console.error("Error loading exits:", error);
      showToast.error("Failed to load exit locations");
      setAllExits([]);
    } finally {
      setLoadingExits(false);
    }
    return () => controller.abort();
  }, []);

  const loadTollPrices = useCallback(async (fromLocation, toLocation) => {
    const controller = new AbortController();
    try {
      setLoadingToll(true);
      setTransportationError("");
      const url = `${API_BASE_URL}/api/toll?from=${encodeURIComponent(fromLocation)}&to=${encodeURIComponent(toLocation)}`;

      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to fetch toll prices');
      }

      const data = await response.json();
      setTollData(data);
    } catch (error) {
      if (error.name === 'AbortError') return;
      console.error("Error loading toll prices:", error);
      setTransportationError(error.message || "Failed to load toll prices");
      setTollData(null);
    } finally {
      setLoadingToll(false);
    }
    return () => controller.abort();
  }, []);

  const handleLocationChange = useCallback((field, option) => {
    if (option) {
      setTransportationData(prev => ({
        ...prev,
        [field]: option.value, // id
        [`${field}Name`]: option.label // name
      }));
    } else {
      setTransportationData(prev => ({
        ...prev,
        [field]: "",
        [`${field}Name`]: ""
      }));
    }
  }, []);

  const handleClassSelection = useCallback((vehicleClass) => {
    if (tollData?.prices) {
      const selectedPrice = tollData.prices.find(
        price => price.class === vehicleClass
      );
      if (selectedPrice) {
        setTransportationData(prev => ({
          ...prev,
          selectedClass: vehicleClass,
          cost: selectedPrice.price
        }));
      }
    }
  }, [tollData]);

  const handleSave = useCallback(() => {
    if (!transportationData.selectedClass) {
      showToast.error("Please select a vehicle class");
      return;
    }
    onSave(transportationData);
    onClose();
  }, [transportationData, onSave, onClose]);

  const handleCancel = useCallback(() => {
    setTollData(null);
    setTransportationError("");
    onClose();
  }, [onClose]);

  const isSaveDisabled = useMemo(() => 
    !transportationData.entryLocation || 
    !transportationData.exitLocation || 
    !transportationData.selectedClass ||
    loadingToll,
    [transportationData, loadingToll]
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Transportation Costs"
      size="lg"
    >
      <div className="space-y-4">
        {/* Entry Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Entry Location
          </label>
          <CustomSelect
            key="entry-location-select"
            value={transportationData.entryLocation}
            onChange={(value, option) => handleLocationChange("entryLocation", option)}
            options={allExits}
            placeholder={loadingExits ? "Loading locations..." : "Search and select entry location..."}
            disabled={loadingExits}
            searchable
            clearable
          />
        </div>

        {/* Exit Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Exit Location
          </label>
          <CustomSelect
            key="exit-location-select"
            value={transportationData.exitLocation}
            onChange={(value, option) => handleLocationChange("exitLocation", option)}
            options={allExits}
            placeholder={loadingExits ? "Loading locations..." : "Search and select exit location..."}
            disabled={loadingExits}
            searchable
            clearable
          />
        </div>

        {/* Loading State */}
        {loadingToll && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Loading toll prices...</p>
          </div>
        )}

        {/* Error State */}
        {transportationError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {transportationError}
          </div>
        )}

        {/* Vehicle Class Selection */}
        {tollData?.prices && !loadingToll && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Vehicle Class
            </label>
            <div className="grid grid-cols-5 gap-2">
              {VEHICLE_CLASSES.map(({ id, label }) => {
                const priceInfo = tollData.prices.find(p => p.class === id);
                const isSelected = transportationData.selectedClass === id;
                
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleClassSelection(id)}
                    disabled={!priceInfo}
                    className={`
                      relative p-3 rounded-lg border-2 transition-all
                      ${isSelected 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-300 hover:border-blue-400 bg-white'
                      }
                      ${!priceInfo ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {isSelected && (
                      <div className="absolute top-1 right-1">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                    )}
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{label}</div>
                      {priceInfo && (
                        <div className="text-sm text-gray-600 mt-1">
                          €{priceInfo.price.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Cost Display */}
        {transportationData.selectedClass && transportationData.cost > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Selected Transportation Cost:
              </span>
              <span className="text-lg font-bold text-blue-600">
                €{transportationData.cost.toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Class {transportationData.selectedClass} • {transportationData.entryLocationName} → {transportationData.exitLocationName}
            </div>
          </div>
        )}
      </div>

      {/* Modal Footer */}
      <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
        <Button
          onClick={handleCancel}
          variant="secondary"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="primary"
          disabled={isSaveDisabled}
        >
          Save
        </Button>
      </div>
    </Modal>
  );
};
