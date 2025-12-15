// import { create } from 'zustand';
// import { orderService } from '../api/orderService';
// import { emailService } from '../api/emailService';

// const useAdminOrderStore = create((set) => ({
//   // State
//   orders: [],
//   selectedOrder: null,
//   loading: false,
//   error: null,
//   successMessage: null,

//   // Fetch all orders
//   fetchAllOrders: async () => {
//     set({ loading: true, error: null });
//     try {
//       const response = await orderService.getAllOrders();
      
//       // Debug: Log raw response
//       console.log('🔍 Raw orders response:', response.data);
      
//       // Ensure orders have proper structure
//       const processedOrders = response.data.map(order => {
//         // Log each order for debugging
//         console.log(`📦 Processing order ${order.id}:`, {
//           hasItems: !!order.items,
//           itemsType: typeof order.items,
//           isArray: Array.isArray(order.items),
//           itemCount: order.items?.length || 0
//         });
        
//         return {
//           ...order,
//           // Ensure items is always an array
//           items: Array.isArray(order.items) ? order.items : []
//         };
//       });
      
//       set({ orders: processedOrders, loading: false });
//     } catch (error) {
//       console.error('❌ Error fetching orders:', error);
//       set({ 
//         error: error.response?.data?.detail || 'Failed to fetch orders',
//         loading: false 
//       });
//     }
//   },

//   // Fetch single order by ID
//   fetchOrderById: async (orderId) => {
//     set({ loading: true, error: null });
//     try {
//       const orders = await orderService.getAllOrders();
//       const order = orders.data.find(o => o.id === orderId);
      
//       if (order) {
//         // Ensure items is an array
//         order.items = Array.isArray(order.items) ? order.items : [];
//       }
      
//       set({ selectedOrder: order, loading: false });
//     } catch (error) {
//       set({ 
//         error: error.response?.data?.detail || 'Failed to fetch order',
//         loading: false 
//       });
//     }
//   },

//   // Delete an order
//   deleteOrder: async (orderId) => {
//     set({ loading: true, error: null, successMessage: null });
//     try {
//       const response = await orderService.deleteOrder(orderId);
//       set({ 
//         successMessage: `Order #${orderId} deleted successfully!`,
//         loading: false 
//       });
//       return response.data;
//     } catch (error) {
//       set({ 
//         error: error.response?.data?.detail || 'Failed to delete order',
//         loading: false 
//       });
//       throw error;
//     }
//   },

//   // Delete all orders (DANGEROUS!)
//   deleteAllOrders: async () => {
//     set({ loading: true, error: null, successMessage: null });
//     try {
//       const response = await orderService.deleteAllOrders();
//       set({ 
//         successMessage: 'All orders deleted!',
//         orders: [],
//         loading: false 
//       });
//       return response.data;
//     } catch (error) {
//       set({ 
//         error: error.response?.data?.detail || 'Failed to delete orders',
//         loading: false 
//       });
//       throw error;
//     }
//   },

//   // Send order confirmation email
//   sendOrderConfirmation: async (orderId) => {
//     set({ loading: true, error: null, successMessage: null });
//     try {
//       const response = await emailService.sendOrderConfirmation(orderId);
//       set({ 
//         successMessage: `Confirmation email sent for Order #${orderId}!`,
//         loading: false 
//       });
//       return response.data;
//     } catch (error) {
//       set({ 
//         error: error.response?.data?.detail || 'Failed to send confirmation email',
//         loading: false 
//       });
//       throw error;
//     }
//   },

//   // Send order update email
//   sendOrderUpdate: async (orderId) => {
//     set({ loading: true, error: null, successMessage: null });
//     try {
//       const response = await emailService.sendOrderUpdate(orderId);
//       set({ 
//         successMessage: `Update email sent for Order #${orderId}!`,
//         loading: false 
//       });
//       return response.data;
//     } catch (error) {
//       set({ 
//         error: error.response?.data?.detail || 'Failed to send update email',
//         loading: false 
//       });
//       throw error;
//     }
//   },

//   clearMessages: () => set({ error: null, successMessage: null }),
//   clearSelectedOrder: () => set({ selectedOrder: null }),
// }));

// export default useAdminOrderStore;


import { create } from 'zustand';
import { orderService } from '../api/orderService';
import { emailService } from '../api/emailService';

const useAdminOrderStore = create((set, get) => ({
  // State
  orders: [],
  selectedOrder: null,
  loading: false,
  error: null,
  successMessage: null,

  // Fetch all orders
  fetchAllOrders: async () => {
    set({ loading: true, error: null });
    try {
      const response = await orderService.getAllOrders();
      
      // Debug: Log raw response
      console.log('🔍 Raw orders response:', response.data);
      
      // Ensure orders have proper structure
      const processedOrders = response.data.map(order => {
        // Log each order for debugging
        console.log(`📦 Processing order ${order.id}:`, {
          hasItems: !!order.items,
          itemsType: typeof order.items,
          isArray: Array.isArray(order.items),
          itemCount: order.items?.length || 0
        });
        
        return {
          ...order,
          // Ensure items is always an array
          items: Array.isArray(order.items) ? order.items : []
        };
      });
      
      set({ orders: processedOrders, loading: false });
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch orders',
        loading: false 
      });
    }
  },

  // Fetch single order by ID
  fetchOrderById: async (orderId) => {
    set({ loading: true, error: null });
    try {
      const orders = await orderService.getAllOrders();
      const order = orders.data.find(o => o.id === orderId);
      
      if (order) {
        // Ensure items is an array
        order.items = Array.isArray(order.items) ? order.items : [];
      }
      
      set({ selectedOrder: order, loading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch order',
        loading: false 
      });
    }
  },

  // Update order status locally in the store (updates both orders list and reflects in all pages)
  updateOrderStatus: (orderId, newStatus) => {
    const { orders } = get();
    const updatedOrders = orders.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus }
        : order
    );
    set({ orders: updatedOrders });
    console.log(`✅ Order #${orderId} status updated to: ${newStatus}`);
  },

  // Delete an order
  deleteOrder: async (orderId) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const response = await orderService.deleteOrder(orderId);
      set({ 
        successMessage: `Order #${orderId} deleted successfully!`,
        loading: false 
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Failed to delete order',
        loading: false 
      });
      throw error;
    }
  },

  // Delete all orders (DANGEROUS!)
  deleteAllOrders: async () => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const response = await orderService.deleteAllOrders();
      set({ 
        successMessage: 'All orders deleted!',
        orders: [],
        loading: false 
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Failed to delete orders',
        loading: false 
      });
      throw error;
    }
  },

  // Send order confirmation email
  sendOrderConfirmation: async (orderId) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const response = await emailService.sendOrderConfirmation(orderId);
      set({ 
        successMessage: `Confirmation email sent for Order #${orderId}!`,
        loading: false 
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Failed to send confirmation email',
        loading: false 
      });
      throw error;
    }
  },

  // Send order update email
  sendOrderUpdate: async (orderId) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const response = await emailService.sendOrderUpdate(orderId);
      set({ 
        successMessage: `Update email sent for Order #${orderId}!`,
        loading: false 
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Failed to send update email',
        loading: false 
      });
      throw error;
    }
  },

  clearMessages: () => set({ error: null, successMessage: null }),
  clearSelectedOrder: () => set({ selectedOrder: null }),
}));

export default useAdminOrderStore;