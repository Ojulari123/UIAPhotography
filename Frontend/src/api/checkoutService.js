import apiClient from './axiosConfig';

export const checkoutService = {
  // Calculate checkout total for an existing order
  calculateTotal: (orderId) => apiClient.get('/calculate-total', {
    params: { order_id: orderId }
  }),
  
  // Create payment intent with Stripe (main checkout method)
  createPaymentIntent: (paymentData) => apiClient.post('/payment/create-intent', paymentData),
};