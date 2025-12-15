import apiClient from './axiosConfig';

export const portfolioService = {
  // Get all portfolios
  getAllPortfolios: () => apiClient.get('/view-all-portfolios'),
  
  // Get single portfolio by ID
  getPortfolioById: (portfolioId) => apiClient.get(`/view-a-portfolio/${portfolioId}`),
  
  // Admin: Add new portfolio with images
  addPortfolio: (formData) => apiClient.post('/add-portfolio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Admin: Delete portfolio
  deletePortfolio: (portfolioId) => apiClient.delete(`/delete-portfolio/${portfolioId}`),
  
  // Admin: Delete all portfolios
  deleteAllPortfolios: () => apiClient.delete('/delete-all-portfolios'),
};