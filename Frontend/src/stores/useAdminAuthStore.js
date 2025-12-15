import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { adminService } from '../api/adminService';

const useAdminAuthStore = create(
  persist(
    (set, get) => ({
      // State
      isAuthenticated: false,
      admin: null,
      loading: false,
      error: null,

      // Login action
      login: async (username, password) => {
        set({ loading: true, error: null });
        try {
          const response = await adminService.loginAdmin({ username, password });
          
          set({
            isAuthenticated: true,
            admin: {
              username: username,
              // Add any other admin info from response
              ...response.data
            },
            loading: false,
            error: null
          });
          
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.detail || 'Login failed. Please check your credentials.';
          set({
            isAuthenticated: false,
            admin: null,
            loading: false,
            error: errorMessage
          });
          return { success: false, error: errorMessage };
        }
      },

      // Logout action
      logout: () => {
        set({
          isAuthenticated: false,
          admin: null,
          error: null
        });
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Check if authenticated
      checkAuth: () => {
        const { isAuthenticated } = get();
        return isAuthenticated;
      },
    }),
    {
      name: 'admin-auth-storage', // localStorage key
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        admin: state.admin,
      }),
    }
  )
);

export default useAdminAuthStore;