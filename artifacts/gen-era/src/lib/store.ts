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

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartCount: 0,
      cartTotal: 0,
      isOpen: false,
      setIsOpen: (open) => set({ isOpen: open }),

      addToCart: (product: Product, quantity = 1, selectedSize?: string, selectedColor?: string) => {
        const { items } = get();
        const existing = items.find((item) => item.productId === product._id);

        let newItems: CartItem[];
        if (existing) {
          newItems = items.map((item) =>
            item.productId === product._id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          const newItem: CartItem = {
            productId: product._id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity,
            selectedSize,
            selectedColor,
          };
          newItems = [...items, newItem];
        }

        const cartCount = newItems.reduce((sum, i) => sum + i.quantity, 0);
        const cartTotal = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

        set({ items: newItems, cartCount, cartTotal, isOpen: true });
      },

      removeFromCart: (productId: string) => {
        const newItems = get().items.filter((item) => item.productId !== productId);
        const cartCount = newItems.reduce((sum, i) => sum + i.quantity, 0);
        const cartTotal = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
        set({ items: newItems, cartCount, cartTotal });
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity < 1) {
          get().removeFromCart(productId);
          return;
        }
        const newItems = get().items.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        );
        const cartCount = newItems.reduce((sum, i) => sum + i.quantity, 0);
        const cartTotal = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
        set({ items: newItems, cartCount, cartTotal });
      },

      clearCart: () => set({ items: [], cartCount: 0, cartTotal: 0 }),
    }),
    {
      name: 'gen-era-cart',
    }
  )
);

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
