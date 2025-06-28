import { create } from 'zustand';

const useSidebarStore = create((set) => ({
  isOpen: false, // Default to closed (icons only)
  toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen})),
}));

export default useSidebarStore; 