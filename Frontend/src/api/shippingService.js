// import apiClient from './axiosConfig';

// export const shippingService = {
//   // Add shipping/tracking information for an order
//   addShippingInfo: (orderId, shippingData) => 
//     apiClient.post(`/input-shipping-info/${orderId}`, shippingData),
  
//   // Calculate weight for shipping
//   calculateWeight: (orderId) => apiClient.post('/weight', null, {
//     params: { order_id: orderId }
//   }),
// };
import apiClient from './axiosConfig';

export const shippingService = {
  // Add shipping/tracking information for an order
  addShippingInfo: (orderId, shippingData) => 
    apiClient.post(`/input-shipping-info/${orderId}`, shippingData),
  
  // Calculate weight for shipping
  calculateWeight: (orderId) => apiClient.post('/weight', null, {
    params: { order_id: orderId }
  }),

  // Get shipping record for an order (address details)
  getShippingByOrderId: (orderId) => 
    apiClient.get(`/view-a-shipping-record/${orderId}`, {
      params: { order_id: orderId }
    }),

  // Get shipping info (tracking) for an order
  getShippingInfoByOrderId: (orderId) => 
    apiClient.get(`/view-shipping-info-table/${orderId}`, {
      params: { order_id: orderId }
    }),

  // Get all shipping records
  getAllShippingRecords: () => apiClient.get('/view-shipping-table'),

  // Get all shipping info
  getAllShippingInfo: () => apiClient.get('/view-shipping-info-table'),
};