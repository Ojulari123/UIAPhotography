import { create } from 'zustand';
import { portfolioService } from '../api/portfolioService';

const useAdminPortfolioStore = create((set) => ({
  // State
  portfolios: [],
  loading: false,
  error: null,
  successMessage: null,

  // Fetch all portfolios
  fetchPortfolios: async () => {
    set({ loading: true, error: null });
    try {
      const response = await portfolioService.getAllPortfolios();
      set({ portfolios: response.data, loading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch portfolios',
        loading: false 
      });
    }
  },

  // Add new portfolio
  addPortfolio: async (formData) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const response = await portfolioService.addPortfolio(formData);
      set({ 
        successMessage: `Portfolio "${response.data.title}" added successfully!`,
        loading: false 
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Failed to add portfolio',
        loading: false 
      });
      throw error;
    }
  },

  // Delete portfolio
  deletePortfolio: async (portfolioId) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const response = await portfolioService.deletePortfolio(portfolioId);
      set({ 
        successMessage: 'Portfolio deleted successfully!',
        loading: false 
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Failed to delete portfolio',
        loading: false 
      });
      throw error;
    }
  },

  // Delete all portfolios (DANGEROUS!)
  deleteAllPortfolios: async () => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const response = await portfolioService.deleteAllPortfolios();
      set({ 
        successMessage: 'All portfolios deleted!',
        portfolios: [],
        loading: false 
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Failed to delete portfolios',
        loading: false 
      });
      throw error;
    }
  },

  clearMessages: () => set({ error: null, successMessage: null }),
}));

export default useAdminPortfolioStore;