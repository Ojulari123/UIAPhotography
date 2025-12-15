import apiClient from './axiosConfig';

export const productService = {
  // Customer-facing endpoints
  getAllProducts: () => apiClient.get('/products/view-photos-table'),
  
  getProductBySlug: (slug) => apiClient.get(`/products/view-photos-table/${slug}`),
  
  // Admin endpoints - Add product by URL
  addProductByUrl: (data) => apiClient.post('/products/add-photos-url', data),
  
  // Admin endpoints - Add product by file upload
  addProductByFile: (formData) => apiClient.post('/products/add-photos-file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Admin endpoints - Add product metafield
  addProductMetafield: (productId, data) => apiClient.post('/products/add-photo-metafield', data, {
    params: { product_id: productId }
  }),
  
  // Admin endpoints - Edit product
  editProduct: (productId, data) => apiClient.post('/products/edit-photos-details', data, {
    params: { product_id: productId }
  }),
  
  // Admin endpoints - Delete product
  deleteProduct: (productId) => apiClient.delete(`/products/delete-a-photo/${productId}`, {
    params: { product_id: productId }
  }),
  
  // Admin endpoints - Delete all products (DANGEROUS!)
  deleteAllProducts: () => apiClient.delete('/products/delete-all-photos'),
};