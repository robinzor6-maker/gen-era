import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, User } from '@/lib/types';

interface CartStore {
  items: CartItem[];
  cartCount: number;
  cartTotal: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number, selectedSize?: string, selectedColor?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()((set, get) => ({
  items: [],
  cartCount: 0,
  cartTotal: 0,
  isOpen: false,
  setIsOpen: (open) => set({ isOpen: open }),

  addToCart: async (product: Product, quantity = 1, selectedSize?: string, selectedColor?: string) => {
    try {
      await api.post('/cart', { productId: product._id, quantity, selectedSize, selectedColor });
      // Refresh cart from server
      const res = await api.get<{ success: boolean; items: any[] }>('/cart');
      const newItems = (res.items || []).map((it: any) => ({
        productId: it.productId,
        slug: it.product?.slug || product.slug,
        name: it.product?.name || product.name,
        price: it.product?.price ?? product.price,
        image: it.product?.image ?? product.image,
        quantity: it.quantity,
        selectedSize: it.selectedSize,
        selectedColor: it.selectedColor,
      }));

      const cartCount = newItems.reduce((sum, i) => sum + i.quantity, 0);
      const cartTotal = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      set({ items: newItems, cartCount, cartTotal, isOpen: true });
    } catch (err) {
      console.error('Failed to add to cart', err);
    }
  },

  removeFromCart: async (productId: string) => {
    try {
      await api.delete(`/cart?productId=${encodeURIComponent(productId)}`);
      const res = await api.get<{ success: boolean; items: any[] }>('/cart');
      const newItems = (res.items || []).map((it: any) => ({
        productId: it.productId,
        slug: it.product?.slug || '',
        name: it.product?.name || '',
        price: it.product?.price ?? 0,
        image: it.product?.image ?? '',
        quantity: it.quantity,
        selectedSize: it.selectedSize,
        selectedColor: it.selectedColor,
      }));
      const cartCount = newItems.reduce((sum, i) => sum + i.quantity, 0);
      const cartTotal = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      set({ items: newItems, cartCount, cartTotal });
    } catch (err) {
      console.error('Failed to remove from cart', err);
    }
  },

  updateQuantity: async (productId: string, quantity: number) => {
    if (quantity < 1) {
      get().removeFromCart(productId);
      return;
    }
    try {
      await api.post('/cart', { productId, quantity });
      const res = await api.get<{ success: boolean; items: any[] }>('/cart');
      const newItems = (res.items || []).map((it: any) => ({
        productId: it.productId,
        slug: it.product?.slug || '',
        name: it.product?.name || '',
        price: it.product?.price ?? 0,
        image: it.product?.image ?? '',
        quantity: it.quantity,
        selectedSize: it.selectedSize,
        selectedColor: it.selectedColor,
      }));
      const cartCount = newItems.reduce((sum, i) => sum + i.quantity, 0);
      const cartTotal = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      set({ items: newItems, cartCount, cartTotal });
    } catch (err) {
      console.error('Failed to update cart quantity', err);
    }
  },

  clearCart: async () => {
    try {
      // No bulk clear endpoint yet; remove each
      const items = get().items.slice();
      for (const it of items) {
        await api.delete(`/cart?productId=${encodeURIComponent(it.productId)}`);
      }
      set({ items: [], cartCount: 0, cartTotal: 0 });
    } catch (err) {
      console.error('Failed to clear cart', err);
    }
  },
}));

// Load cart on client
if (typeof window !== 'undefined') {
  (async () => {
    try {
      const res = await api.get<{ success: boolean; items: any[] }>('/cart');
      if (res && Array.isArray(res.items)) {
        const loaded = res.items.map((it: any) => ({
          productId: it.productId,
          slug: it.product?.slug || '',
          name: it.product?.name || '',
          price: it.product?.price ?? 0,
          image: it.product?.image ?? '',
          quantity: it.quantity,
          selectedSize: it.selectedSize,
          selectedColor: it.selectedColor,
        }));
        const cartCount = loaded.reduce((sum, i) => sum + i.quantity, 0);
        const cartTotal = loaded.reduce((sum, i) => sum + i.price * i.quantity, 0);
        // We can't call set directly here (outside store), so get store and set
        const store = (await import('./store')).useCartStore as any;
        // If store is available, set state
        try { store.setState({ items: loaded, cartCount, cartTotal }); } catch (e) { /* ignore */ }
      }
    } catch (err) {
      // ignore — user may be anonymous
    }
  })();
}

// ─── Wishlist Store ────────────────────────────────────────────────────────
interface WishlistStore {
  items: string[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isInWishlist: (productId: string) => get().items.includes(productId),
      toggleWishlist: (productId: string) => {
        const { items } = get();
        if (items.includes(productId)) {
          set({ items: items.filter((id) => id !== productId) });
        } else {
          set({ items: [...items, productId] });
        }
      },
      addToWishlist: (productId: string) => {
        const { items } = get();
        if (!items.includes(productId)) {
          set({ items: [...items, productId] });
        }
      },
      removeFromWishlist: (productId: string) => {
        set({ items: get().items.filter((id) => id !== productId) });
      },
      clearWishlist: () => set({ items: [] }),
    }),
    { name: 'gen-era-wishlist' }
  )
);

// ─── App / Auth Store ──────────────────────────────────────────────────────
interface AppStore {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  currentScene: string;
  cameraPosition: number[];
  setCurrentScene: (scene: string) => void;
  setCameraPosition: (pos: number[]) => void;
  hudOpen: boolean;
  setHudOpen: (open: boolean) => void;
  sceneLoaded: boolean;
  setSceneLoaded: (loaded: boolean) => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => {
        set({ user: null, token: null });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('genEraToken');
        }
      },
      currentScene: 'main',
      cameraPosition: [0, 4, 14],
      setCurrentScene: (scene) => set({ currentScene: scene }),
      setCameraPosition: (pos) => set({ cameraPosition: pos }),
      hudOpen: false,
      setHudOpen: (open) => set({ hudOpen: open }),
      sceneLoaded: false,
      setSceneLoaded: (loaded) => set({ sceneLoaded: loaded }),
    }),
    {
      name: 'gen-era-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export type StoreState = AppStore;
