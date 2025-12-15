import apiClient from './axiosConfig';

export const picOfWeekService = {
  // Get all pics of the week
  getAllPicsOfWeek: () => apiClient.get('/pic-of-the-week'),
  
  // Get single pic of the week by ID
  getPicOfWeekById: (picId) => apiClient.get(`/pic-of-the-week/${picId}`),
  
  // Admin: Add new pic & poem of the week
  addPicOfWeek: (formData) => apiClient.post('/add-pic-and-poem-of-the-week', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Admin: Delete pic of the week
  deletePicOfWeek: (picId) => apiClient.delete(`/delete-pic-of-the-week/${picId}`),
  
  // Admin: Delete all pics of the week
  deleteAllPicsOfWeek: () => apiClient.delete('/delete-all-pic-of-the-week'),
};