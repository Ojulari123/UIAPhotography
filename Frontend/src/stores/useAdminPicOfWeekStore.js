import { create } from 'zustand';
import { picOfWeekService } from '../api/picOfWeekService';

const useAdminPicOfWeekStore = create((set) => ({
  // State
  pics: [],
  loading: false,
  error: null,
  successMessage: null,

  // Fetch all pics
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

  // Add new pic & poem
  addPicOfWeek: async (formData) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const response = await picOfWeekService.addPicOfWeek(formData);
      set({ 
        successMessage: 'Pic & Poem of the Week added successfully!',
        loading: false 
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Failed to add pic',
        loading: false 
      });
      throw error;
    }
  },

  // Delete pic of week
  deletePicOfWeek: async (picId) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const response = await picOfWeekService.deletePicOfWeek(picId);
      set({ 
        successMessage: 'Pic of the Week deleted successfully!',
        loading: false 
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Failed to delete pic',
        loading: false 
      });
      throw error;
    }
  },

  // Delete all pics (DANGEROUS!)
  deleteAllPics: async () => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const response = await picOfWeekService.deleteAllPicsOfWeek();
      set({ 
        successMessage: 'All pics deleted!',
        pics: [],
        loading: false 
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Failed to delete pics',
        loading: false 
      });
      throw error;
    }
  },

  clearMessages: () => set({ error: null, successMessage: null }),
}));

export default useAdminPicOfWeekStore;