import { create } from 'zustand';

interface PaletteState {
  isOpen: boolean;
}

interface PaletteActions {
  openPalette: () => void;
  closePalette: () => void;
  togglePalette: () => void;
}

const store = create<PaletteState & PaletteActions>((set) => ({
  isOpen: false,
  openPalette: () => set({ isOpen: true }),
  closePalette: () => set({ isOpen: false }),
  togglePalette: () => set((state) => ({ isOpen: !state.isOpen })),
}));

export const usePalette = store;

export const openPalette = store.getState().openPalette;
export const closePalette = store.getState().closePalette;
export const togglePalette = store.getState().togglePalette;
