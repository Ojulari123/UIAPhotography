import apiClient from './axiosConfig';

export const emailService = {
  // Send order confirmation email with longer timeout
  sendOrderConfirmation: (orderId) => 
    apiClient.post(`/send-order-confirmation/${orderId}`, null, {
      timeout: 120000 // 2 minutes
    }),
  
  // Send order status update email with longer timeout
  sendOrderUpdate: (orderId) => 
    apiClient.post(`/send-order-update/${orderId}`, null, {
      timeout: 120000 // 2 minutes
    }),
};