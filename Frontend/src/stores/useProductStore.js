import { create } from 'zustand';
import { productService } from '../api/productService';

const useProductStore = create((set) => ({
  // State
  products: [],
  selectedProduct: null,
  loading: false,
  error: null,

  // Actions
  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await productService.getAllProducts();
      set({ products: response.data, loading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch products',
        loading: false 
      });
    }
  },

  fetchProductBySlug: async (slug) => {
    set({ loading: true, error: null });
    try {
      const response = await productService.getProductBySlug(slug);
      set({ selectedProduct: response.data, loading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch product',
        loading: false 
      });
    }
  },

  clearSelectedProduct: () => set({ selectedProduct: null }),
  
  clearError: () => set({ error: null }),
}));

export default useProductStore;