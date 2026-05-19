import { useState, useCallback } from 'react';

export const useGrubPacsSelection = (data) => {
  const [selectedItems, setSelectedItems] = useState([]);

  const handleSelectAll = useCallback((checked) => {
    // console.log("handleSelectAll called with:", checked);
    // console.log("data:", data);
    const newSelection = checked ? data.map((item) => item.id) : [];
    // console.log("newSelection:", newSelection);
    setSelectedItems(newSelection);
  }, [data]);

  const handleSelectItem = useCallback((id, checked) => {
    // console.log("handleSelectItem called with:", id, checked);
    setSelectedItems((prev) => {
      const newSelection = checked ? [...prev, id] : prev.filter((item) => item !== id);
      // console.log("newSelection:", newSelection);
      return newSelection;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  return {
    selectedItems,
    handleSelectAll,
    handleSelectItem,
    clearSelection,
  };
}; 