import { create } from 'zustand';
import { Product } from '@/lib/types';

interface TempleStore {
  selectedProduct: Product | null;
  isPanelOpen: boolean;
  isChamberOpen: boolean;
  focusPedestalPos: [number, number, number] | null;

  openProduct: (product: Product, pedestalPos: [number, number, number]) => void;
  closeProduct: () => void;
  openChamber: () => void;
  closeChamber: () => void;
}

export const useTempleStore = create<TempleStore>((set) => ({
  selectedProduct: null,
  isPanelOpen: false,
  isChamberOpen: false,
  focusPedestalPos: null,

  openProduct: (product, pedestalPos) =>
    set({ selectedProduct: product, isPanelOpen: true, focusPedestalPos: pedestalPos, isChamberOpen: false }),

  closeProduct: () =>
    set({ selectedProduct: null, isPanelOpen: false, focusPedestalPos: null, isChamberOpen: false }),

  openChamber: () => set({ isChamberOpen: true }),
  closeChamber: () => set({ isChamberOpen: false }),
}));
