import { create } from 'zustand';
import { shippingService } from '../api/shippingService';

const useShippingStore = create((set) => ({
  // State
  shippingInfo: null,
  loading: false,
  error: null,

  // Actions
  addShippingInfo: async (orderId, shippingData) => {
    set({ loading: true, error: null });
    try {
      const response = await shippingService.addShippingInfo(orderId, shippingData);
      set({ 
        shippingInfo: response.data, 
        loading: false 
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to add shipping info',
        loading: false 
      });
      throw error;
    }
  },

  calculateWeight: async (weightData) => {
    set({ loading: true, error: null });
    try {
      const response = await shippingService.calculateWeight(weightData);
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to calculate weight',
        loading: false 
      });
      throw error;
    }
  },

  clearShippingInfo: () => set({ shippingInfo: null }),
  
  clearError: () => set({ error: null }),
}));

export default useShippingStore;