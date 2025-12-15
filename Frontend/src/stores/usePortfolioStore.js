import { create } from 'zustand';
import { portfolioService } from '../api/portfolioService';

const usePortfolioStore = create((set) => ({
  // State
  portfolios: [],
  selectedPortfolio: null,
  loading: false,
  error: null,

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

  // Fetch single portfolio by ID
  fetchPortfolioById: async (portfolioId) => {
    set({ loading: true, error: null });
    try {
      const response = await portfolioService.getPortfolioById(portfolioId);
      set({ selectedPortfolio: response.data, loading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch portfolio',
        loading: false 
      });
    }
  },

  clearSelectedPortfolio: () => set({ selectedPortfolio: null }),
  clearError: () => set({ error: null }),
}));

export default usePortfolioStore;