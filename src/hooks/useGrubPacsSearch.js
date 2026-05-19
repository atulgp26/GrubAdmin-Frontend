import { useState, useCallback, useMemo } from 'react';

export const useGrubPacsSearch = (data, searchFields = ['name', 'code']) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    const searchLower = searchTerm.toLowerCase();
    return data.filter((item) =>
      searchFields.some((field) =>
        String(item[field]).toLowerCase().includes(searchLower)
      )
    );
  }, [data, searchTerm, searchFields]);

  return {
    searchTerm,
    handleSearch,
    filteredData,
  };
}; 