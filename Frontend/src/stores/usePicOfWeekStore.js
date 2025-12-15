import { create } from 'zustand';
import { picOfWeekService } from '../api/picOfWeekService';

const usePicOfWeekStore = create((set) => ({
  // State
  pics: [],
  selectedPic: null,
  loading: false,
  error: null,

  // Fetch all pics of the week
  fetchAllPics: async () => {
    set({ loading: true, error: null });
    try {
      const response = await picOfWeekService.getAllPicsOfWeek();
      set({ pics: response.data, loading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch pics',
        loading: false 
      });
    }
  },

  // Fetch single pic by ID
  fetchPicById: async (picId) => {
    set({ loading: true, error: null });
    try {
      const response = await picOfWeekService.getPicOfWeekById(picId);
      set({ selectedPic: response.data, loading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch pic',
        loading: false 
      });
    }
  },

  clearSelectedPic: () => set({ selectedPic: null }),
  clearError: () => set({ error: null }),
}));

export default usePicOfWeekStore;