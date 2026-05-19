import { useState } from 'react';

const initialFilters = {
  connection: ["Disconnected", "Connected", "Offline"],
  health: ["Critical", "Healthy", "Needs attention"],
  batteryLow: false,
  grublock: ["Unlocked", "Locked", "No lock available"],
};

export const useGrubPacsFilters = () => {
  const [filters, setFilters] = useState(initialFilters);

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const updateFilter = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  return {
    filters,
    setFilters,
    resetFilters,
    updateFilter
  };
}; 