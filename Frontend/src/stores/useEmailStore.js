import { create } from 'zustand';
import apiClient from '../api/axiosConfig';

const useEmailStore = create((set) => ({
  // State
  loading: false,
  error: null,

  // Actions
  sendOrderConfirmation: async (orderId) => {
    set({ loading: true, error: null });
    try {
      // POST /send-order-confirmation/{order_id}
      const response = await apiClient.post(`/send-order-confirmation/${orderId}`);
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to send confirmation email',
        loading: false 
      });
      throw error;
    }
  },

  sendOrderUpdate: async (orderId) => {
    set({ loading: true, error: null });
    try {
      // POST /send-order-update/{order_id}
      const response = await apiClient.post(`/send-order-update/${orderId}`);
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to send update email',
        loading: false 
      });
      throw error;
    }
  },
}));

export default useEmailStore;