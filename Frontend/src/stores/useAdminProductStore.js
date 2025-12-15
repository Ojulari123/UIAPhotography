import { create } from 'zustand';
import { productService } from '../api/productService';

const useAdminProductStore = create((set) => ({
  // State
  products: [],
  selectedProduct: null,
  loading: false,
  error: null,
  successMessage: null,

  // Fetch all products
  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await productService.getAllProducts();
      set({ products: response.data, loading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch products',
        loading: false 
      });
    }
  },

  // Add product by URL
  addProductByUrl: async (productData) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const response = await productService.addProductByUrl(productData);
      set({ 
        successMessage: `Product "${response.data.title}" added successfully!`,
        loading: false 
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Failed to add product',
        loading: false 
      });
      throw error;
    }
  },

  // Add product by file upload
  addProductByFile: async (formData) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const response = await productService.addProductByFile(formData);
      set({ 
        successMessage: `Product "${response.data.title}" added successfully!`,
        loading: false 
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Failed to upload product',
        loading: false 
      });
      throw error;
    }
  },

  // Add product metafield
  addProductMetafield: async (productId, metafieldData) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const response = await productService.addProductMetafield(productId, metafieldData);
      set({ 
        successMessage: 'Product metafield updated successfully!',
        loading: false 
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Failed to update metafield',
        loading: false 
      });
      throw error;
    }
  },

  // Edit product
  editProduct: async (productId, productData) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const response = await productService.editProduct(productId, productData);
      set({ 
        successMessage: `Product "${response.data.title}" updated successfully!`,
        loading: false 
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Failed to update product',
        loading: false 
      });
      throw error;
    }
  },

  // Delete product
  deleteProduct: async (productId) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const response = await productService.deleteProduct(productId);
      set({ 
        successMessage: `Product deleted successfully!`,
        loading: false 
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Failed to delete product',
        loading: false 
      });
      throw error;
    }
  },

  // Delete all products (DANGEROUS!)
  deleteAllProducts: async () => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const response = await productService.deleteAllProducts();
      set({ 
        successMessage: 'All products deleted!',
        products: [],
        loading: false 
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Failed to delete products',
        loading: false 
      });
      throw error;
    }
  },

  clearMessages: () => set({ error: null, successMessage: null }),
}));

export default useAdminProductStore;