// import apiClient from './axiosConfig';

// export const orderService = {
//   // Create order without shipping
//   createOrder: (orderData) => apiClient.post('/order', orderData),
  
//   // Create order with shipping - CORRECTED
//   createOrderWithShipping: (orderData, shippingData, shippingType = 'standard') => {
//     // The backend expects the order data directly in the body
//     // NOT nested under "order_data"
//     return apiClient.post(`/order?shipping_type=${shippingType}`, orderData);
//   },
  
//   // Get all orders
//   getAllOrders: () => apiClient.get('/view-orders'),
  
//   // Delete an order (admin)
//   deleteOrder: (orderId) => apiClient.delete(`/delete-an-order?order_id=${orderId}`),
  
//   // Delete all orders (admin)
//   deleteAllOrders: () => apiClient.delete('/delete-all-orders'),

//   // Calculate weight for an order
//   calculateWeight: (orderId) => apiClient.post('/weight', null, {
//     params: { order_id: orderId }
//   }),
// };

import apiClient from './axiosConfig';

export const orderService = {
  // Create order without shipping
  createOrder: (orderData) => apiClient.post('/order', orderData),
  
  // Create order with shipping - CORRECTED
  createOrderWithShipping: (orderData, shippingData, shippingType = 'standard') => {
    // The backend expects the order data directly in the body
    // NOT nested under "order_data"
    return apiClient.post(`/order?shipping_type=${shippingType}`, orderData);
  },
  
  // Get all orders
  getAllOrders: () => apiClient.get('/view-orders'),
  
  // Delete an order (admin) - using path parameter instead of query parameter
  deleteOrder: (orderId) => apiClient.delete(`/delete-an-order`, {
    params: { order_id: orderId }
  }),
  
  // Delete all orders (admin)
  deleteAllOrders: () => apiClient.delete('/delete-all-orders'),

  // Calculate weight for an order
  calculateWeight: (orderId) => apiClient.post('/weight', null, {
    params: { order_id: orderId }
  }),

  // Update order status (uses the send-order-update endpoint which sets status to shipped)
  updateOrderStatus: (orderId) => apiClient.post(`/send-order-update/${orderId}`),
};