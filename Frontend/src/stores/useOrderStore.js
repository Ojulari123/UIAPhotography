import { create } from 'zustand';
import apiClient from '../api/axiosConfig';

const useOrderStore = create((set, get) => ({
  // State
  currentOrder: null,
  orders: [],
  checkoutInfo: null,
  paymentIntent: null,
  loading: false,
  error: null,

  // Create Stripe payment intent (this also creates the order on the backend)
  createPaymentIntent: async (paymentData) => {
    set({ loading: true, error: null });
    try {
      console.log('💳 Sending payment intent request:', paymentData);
      const response = await apiClient.post('/payment/create-intent', paymentData);
      console.log('✅ Payment intent response:', response.data);
      set({ 
        paymentIntent: response.data,
        loading: false 
      });
      return response.data;
    } catch (error) {
      console.error('❌ Payment intent error:', error);
      set({ 
        error: error.response?.data?.detail || 'Failed to create payment intent',
        loading: false 
      });
      throw error;
    }
  },

  // Calculate checkout total for existing order (admin use)
  calculateCheckoutTotal: async (orderId) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/calculate-total', {
        params: { order_id: orderId }
      });
      set({ 
        checkoutInfo: response.data,
        loading: false 
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Failed to calculate total',
        loading: false 
      });
      throw error;
    }
  },

  // Fetch all orders (for display purposes)
  fetchAllOrders: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/view-orders');
      set({ 
        orders: response.data, 
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch orders',
        loading: false 
      });
    }
  },

  clearCurrentOrder: () => set({ currentOrder: null, checkoutInfo: null, paymentIntent: null }),
  clearError: () => set({ error: null }),
}));

export default useOrderStore;