import { create } from 'zustand';
import { shippingService } from '../api/shippingService';

const useAdminShippingStore = create((set) => ({
  // State
  shippingInfo: null,
  loading: false,
  error: null,
  successMessage: null,

  // Add shipping/tracking info to an order
  addShippingInfo: async (orderId, shippingData) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const response = await shippingService.addShippingInfo(orderId, shippingData);
      set({ 
        shippingInfo: response.data,
        successMessage: `Shipping info added for Order #${orderId}!`,
        loading: false 
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Failed to add shipping info',
        loading: false 
      });
      throw error;
    }
  },

  // Calculate weight for shipping
  calculateWeight: async (orderId) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const response = await shippingService.calculateWeight(orderId);
      set({ 
        successMessage: `Weight calculated: ${response.data.total_weight_g}g`,
        loading: false 
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Failed to calculate weight',
        loading: false 
      });
      throw error;
    }
  },

  clearMessages: () => set({ error: null, successMessage: null }),
  clearShippingInfo: () => set({ shippingInfo: null }),
}));

export default useAdminShippingStore;