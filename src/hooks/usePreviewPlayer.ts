import { create } from "zustand";

interface PreviewPlayerStore {
  trackUri: string | null;
  trackName: string | null;
  artistName: string | null;
  openPlayer: (uri: string, name: string, artist: string) => void;
  closePlayer: () => void;
}

export const usePreviewPlayer = create<PreviewPlayerStore>((set) => ({
  trackUri: null,
  trackName: null,
  artistName: null,
  openPlayer: (uri: string, name: string, artist: string) => set({ trackUri: uri, trackName: name, artistName: artist }),
  closePlayer: () => set({ trackUri: null, trackName: null, artistName: null }),
}));
