import { create } from 'zustand';

const useSidebarStore = create((set) => ({
  isOpen: true, // Default to open
  toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen})),
}));

export default useSidebarStore; 