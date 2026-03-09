import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import { get as getKey, set as setKey, del as delKey } from "idb-keyval";
import type { SpotifyHistoryItem } from "@/types";
import { aggregateTracks } from "@/utils/aggregateTracks";

interface SpotifyStore {
  // Raw data - all individual streaming events
  rawData: SpotifyHistoryItem[];

  // Aggregated data - tracks grouped by URI with summed playtime
  aggregatedData: SpotifyHistoryItem[];

  // Raw data filtered by current date range (derived, not persisted)
  filteredRawData: SpotifyHistoryItem[];

  // Date range filter
  startDate: string | null;
  endDate: string | null;

  isLoading: boolean;

  error: string | null;

  // Check if existing data is found but not yet loaded
  isDataLoaded: boolean;
  isDataLoadedInIDB: boolean;

  // Actions
  setRawData: (data: SpotifyHistoryItem[]) => void;
  setAggregatedData: (data: SpotifyHistoryItem[]) => void;
  setDateRange: (startDate: string | null, endDate: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;

  // Recovery actions
  restoreSession: () => void;
  discardSession: () => void;

  // Combined action to load and process data
  loadData: (rawItems: SpotifyHistoryItem[]) => Promise<void>;
  initialize: () => Promise<void>;
}

const initialState = {
  rawData: [],
  aggregatedData: [],
  filteredRawData: [],
  startDate: null,
  endDate: null,
  isLoading: false,
  error: null,
  isDataLoaded: false,
  isDataLoadedInIDB: false,
};

function filterByDateRange(items: SpotifyHistoryItem[], startDate: string | null, endDate: string | null): SpotifyHistoryItem[] {
  if (!startDate && !endDate) return items;
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  return items.filter((item) => {
    const d = new Date(item.ts);
    if (start && d < start) return false;
    if (end && d > end) return false;
    return true;
  });
}

function aggregateInWorker(items: SpotifyHistoryItem[]): Promise<SpotifyHistoryItem[]> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("../workers/dataProcessor.worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (e) => {
      resolve(e.data.aggregated);
      worker.terminate();
    };
    worker.onerror = (err) => {
      reject(err);
      worker.terminate();
    };
    worker.postMessage({ type: "AGGREGATE", payload: items });
  });
}

const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await getKey(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await setKey(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await delKey(name);
  },
};

export const useSpotifyStore = create<SpotifyStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setRawData: (data) => {
        set({ rawData: data, isDataLoaded: data.length > 0 });
        setKey("spotify-raw-data", data).catch((err) => console.error("Failed to save raw data", err));
      },

      setAggregatedData: (data) => set({ aggregatedData: data }),

      setDateRange: (startDate, endDate) =>
        set((state) => {
          const filteredRaw = filterByDateRange(state.rawData, startDate, endDate);

          return {
            startDate,
            endDate,
            filteredRawData: filteredRaw,
            aggregatedData: aggregateTracks(filteredRaw),
          };
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      reset: () => {
        set(initialState);
        delKey("spotify-raw-data").catch(console.error);
      },

      restoreSession: async () => {
        set({ isLoading: true });
        try {
          const storedRaw = await getKey("spotify-raw-data");
          if (storedRaw && Array.isArray(storedRaw) && storedRaw.length > 0) {
            const { startDate, endDate } = get();
            const filteredRaw = filterByDateRange(storedRaw, startDate, endDate);
            set({ rawData: storedRaw, filteredRawData: filteredRaw, isDataLoaded: true, isDataLoadedInIDB: false });
            const aggregated = await aggregateInWorker(storedRaw);
            set({ aggregatedData: aggregated });
          } else {
            set({ isDataLoaded: false, isDataLoadedInIDB: false });
          }
        } catch (err) {
          console.error("Failed to restore raw data:", err);
          set({ error: "Failed to restore data" });
        } finally {
          set({ isLoading: false });
        }
      },

      discardSession: () => {
        get().reset();
        set({ isDataLoadedInIDB: false });
      },

      loadData: async (rawItems) => {
        const { startDate, endDate } = get();
        const filteredRaw = filterByDateRange(rawItems, startDate, endDate);
        set({ rawData: rawItems, filteredRawData: filteredRaw, isLoading: true, error: null });

        // Save raw data to indexedDB manually
        setKey("spotify-raw-data", rawItems).catch((err) => console.error("Failed to save raw data:", err));

        try {
          const aggregated = await aggregateInWorker(rawItems);
          set({
            aggregatedData: aggregated,
            isLoading: false,
            isDataLoaded: rawItems.length > 0,
            error: aggregated.length === 0 ? "No valid track data found to aggregate (missing spotify_track_uri)." : null,
          });
        } catch (err) {
          console.error("Failed to aggregate data:", err);
          set({ isLoading: false, error: "Failed to process data." });
        }
      },

      initialize: async () => {
        set({ isLoading: true });
        try {
          const storedRaw = await getKey("spotify-raw-data");
          const hasStoredRaw = storedRaw && Array.isArray(storedRaw) && storedRaw.length > 0;

          if (get().isDataLoaded) return;

          if (hasStoredRaw) {
            set({ isDataLoadedInIDB: true, isDataLoaded: false });
          }
        } catch (err) {
          console.error("Failed to check for existing data:", err);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "spotify-storage",
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        aggregatedData: state.aggregatedData,
        startDate: state.startDate,
        endDate: state.endDate,
      }),
    },
  ),
);
