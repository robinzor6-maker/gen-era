import { create } from 'zustand';
import { Product } from '@/lib/types';

interface TempleStore {
  selectedProduct: Product | null;
  isPanelOpen: boolean;
  isChamberOpen: boolean;
  focusPedestalPos: [number, number, number] | null;

  isCeremonyActive: boolean;
  ceremonyProductName: string;
  ceremonyAccent: string;

  openProduct: (product: Product, pedestalPos: [number, number, number]) => void;
  closeProduct: () => void;
  openChamber: () => void;
  closeChamber: () => void;

  startCeremony: (productName: string, accent: string) => void;
  endCeremony: () => void;
}

export const useTempleStore = create<TempleStore>((set) => ({
  selectedProduct: null,
  isPanelOpen: false,
  isChamberOpen: false,
  focusPedestalPos: null,

  isCeremonyActive: false,
  ceremonyProductName: '',
  ceremonyAccent: '#d4a853',

  openProduct: (product, pedestalPos) =>
    set({ selectedProduct: product, isPanelOpen: true, focusPedestalPos: pedestalPos, isChamberOpen: false }),

  closeProduct: () =>
    set({ selectedProduct: null, isPanelOpen: false, focusPedestalPos: null, isChamberOpen: false }),

  openChamber: () => set({ isChamberOpen: true }),
  closeChamber: () => set({ isChamberOpen: false }),

  startCeremony: (productName, accent) =>
    set({ isCeremonyActive: true, ceremonyProductName: productName, ceremonyAccent: accent }),

  endCeremony: () =>
    set({ isCeremonyActive: false }),
}));
