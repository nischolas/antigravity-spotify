import { create } from "zustand";

interface PreviewPlayerStore {
  trackUri: string | null;
  openPlayer: (uri: string) => void;
  closePlayer: () => void;
}

export const usePreviewPlayer = create<PreviewPlayerStore>((set) => ({
  trackUri: null,
  openPlayer: (uri) => set({ trackUri: uri }),
  closePlayer: () => set({ trackUri: null }),
}));
