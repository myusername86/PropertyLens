import { create } from 'zustand';

/**
 * Client-side UI state only. Server data lives in React Query —
 * never duplicate it here.
 */
interface UiState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  /** Navbar search — filters the deal pipeline by address/city. */
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
