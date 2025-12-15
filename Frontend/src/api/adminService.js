import apiClient from './axiosConfig';

export const adminService = {
  // Create a new admin (registration)
  createAdmin: (adminData) => apiClient.post('/create-admin', adminData),
  
  // Login admin - matches backend endpoint POST /admin-login
  loginAdmin: (credentials) => apiClient.post('/admin-login', credentials),
};