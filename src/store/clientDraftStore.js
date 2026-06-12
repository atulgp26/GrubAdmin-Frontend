import { create } from 'zustand';

export const defaultFormData = {
  fullName: "",
  clientId: "",
  phone: "",
  email: "",
  country: "",
  state: "",
  vertical: "",
  orgName: "",
};

export const useClientDraftStore = create((set) => ({
  draft: null,

  setDraft: (draft) => set({ draft }),

  clearDraft: () => set({ draft: null }),
}));
