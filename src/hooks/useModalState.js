import { useState } from 'react';

export const useModalState = (initialState) => {
  const [modalState, setModalState] = useState(initialState);

  const openModal = (modalType, data = {}) => {
    setModalState(prev => ({
      ...prev,
      [modalType]: {
        ...prev[modalType],
        ...data,
        open: true
      }
    }));
  };

  const closeModal = (modalType) => {
    setModalState(prev => ({
      ...prev,
      [modalType]: {
        ...prev[modalType],
        open: false
      }
    }));
  };

  const updateModalData = (modalType, data) => {
    setModalState(prev => ({
      ...prev,
      [modalType]: {
        ...prev[modalType],
        ...data
      }
    }));
  };

  return {
    modalState,
    openModal,
    closeModal,
    updateModalData
  };
}; 