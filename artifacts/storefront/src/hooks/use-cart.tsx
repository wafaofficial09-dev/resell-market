import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: number;
  name: string;
  image: string | null;
  price: number;
  offerPrice: number;
  quantity: number;
  hasDeliveryCharge?: boolean;
  deliveryCharge?: number | null;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getDeliveryTotal: () => number;
  getGrandTotal: () => number;
  getCartCount: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find((i) => i.productId === item.productId);
        if (existingItem) {
          set({
            items: items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                : i
            )
          });
        } else {
          set({ items: [...items, { ...item, quantity: item.quantity || 1 }] });
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          )
        });
      },
      clearCart: () => set({ items: [] }),
      getCartTotal: () => {
        return get().items.reduce((total, item) => total + (item.offerPrice * item.quantity), 0);
      },
      getDeliveryTotal: () => {
        const chargedProducts = new Set<number>();
        return get().items.reduce((total, item) => {
          if (item.hasDeliveryCharge && !chargedProducts.has(item.productId)) {
            chargedProducts.add(item.productId);
            return total + (item.deliveryCharge || 50);
          }
          return total;
        }, 0);
      },
      getGrandTotal: () => {
        const store = get();
        return store.getCartTotal() + store.getDeliveryTotal();
      },
      getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    {
      name: 'shopeasy-cart',
    }
  )
);
