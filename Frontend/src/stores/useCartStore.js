import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      // State
      cartItems: [],

      // Actions
      addToCart: (product, quantity = 1, productType) => {
        const { cartItems } = get();
        
        // Create unique key based on product id AND product type
        const itemKey = `${product.id}-${productType}`;
        const existingItem = cartItems.find(
          item => item.id === product.id && item.product_type === productType
        );

        const productWithType = {
          ...product,
          product_type: productType, // Required: 'digital' or 'physical'
          itemKey // Unique identifier for cart item
        };

        if (existingItem) {
          set({
            cartItems: cartItems.map(item =>
              item.id === product.id && item.product_type === productType
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({
            cartItems: [...cartItems, { ...productWithType, quantity }],
          });
        }
      },

      removeFromCart: (itemKey) => {
        set({
          cartItems: get().cartItems.filter(item => item.itemKey !== itemKey),
        });
      },

      updateQuantity: (itemKey, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(itemKey);
          return;
        }
        set({
          cartItems: get().cartItems.map(item =>
            item.itemKey === itemKey ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => set({ cartItems: [] }),

      getTotalPrice: () => {
        return get().cartItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getTotalItems: () => {
        return get().cartItems.reduce(
          (total, item) => total + item.quantity,
          0
        );
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

export default useCartStore;