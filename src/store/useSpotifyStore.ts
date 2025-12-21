import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import { get as getKey, set as setKey, del as delKey } from "idb-keyval";
import type { SpotifyHistoryItem } from "../types";

interface SpotifyStore {
  // Raw data - all individual streaming events
  rawData: SpotifyHistoryItem[];

  // Aggregated data - tracks grouped by URI with summed playtime
  aggregatedData: SpotifyHistoryItem[];

  // Date range filter
  startDate: string | null;
  endDate: string | null;

  isLoading: boolean;

  error: string | null;

  // Check if existing data is found but not yet loaded
  hasData: boolean;
  hasFoundData: boolean;

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
  loadData: (rawItems: SpotifyHistoryItem[]) => void;
  initialize: () => Promise<void>;
}

const initialState = {
  rawData: [],
  aggregatedData: [],
  startDate: null,
  endDate: null,
  isLoading: false,
  error: null,
  hasData: false,
  hasFoundData: false,
};

// Custom storage adapter for idb-keyval
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
        set({ rawData: data, hasData: data.length > 0 });
        setKey("spotify-raw-data", data).catch((err) => console.error("Failed to save raw data", err));
      },

      setAggregatedData: (data) => set({ aggregatedData: data }),

      setDateRange: (startDate, endDate) =>
        set((state) => {
          // Re-aggregate data with new date range
          const filteredRaw = state.rawData.filter((item) => {
            const itemDate = new Date(item.ts);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            if (start && itemDate < start) return false;
            if (end && itemDate > end) return false;
            return true;
          });

          // Aggregate filtered data
          const aggregatedMap = new Map<string, SpotifyHistoryItem>();

          for (const item of filteredRaw) {
            const uri = item.spotify_track_uri;
            if (!uri) continue;

            if (aggregatedMap.has(uri)) {
              const existing = aggregatedMap.get(uri)!;
              existing.ms_played += item.ms_played;
              existing.count = (existing.count || 1) + 1;
            } else {
              aggregatedMap.set(uri, {
                ...item,
                ms_played: item.ms_played,
                count: 1,
              });
            }
          }

          return {
            startDate,
            endDate,
            aggregatedData: Array.from(aggregatedMap.values()),
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
            set({ rawData: storedRaw, hasData: true, hasFoundData: false });

            const aggregatedMap = new Map<string, SpotifyHistoryItem>();
            for (const item of storedRaw) {
              const uri = item.spotify_track_uri;
              if (!uri) continue;

              if (aggregatedMap.has(uri)) {
                const existing = aggregatedMap.get(uri)!;
                existing.ms_played += item.ms_played;
                existing.count = (existing.count || 1) + 1;
              } else {
                aggregatedMap.set(uri, {
                  ...item,
                  ms_played: item.ms_played,
                  count: 1,
                });
              }
            }
            const aggregatedResult = Array.from(aggregatedMap.values());
            set({ aggregatedData: aggregatedResult });
          } else {
            set({ hasData: false, hasFoundData: false });
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
        set({ hasFoundData: false });
      },

      loadData: (rawItems) => {
        set({ rawData: rawItems, isLoading: true, error: null });

        // Save raw data to indexedDB manually
        setKey("spotify-raw-data", rawItems).catch((err) => console.error("Failed to save raw data:", err));

        // Aggregate data by track URI
        const aggregatedMap = new Map<string, SpotifyHistoryItem>();

        for (const item of rawItems) {
          const uri = item.spotify_track_uri;
          if (!uri) continue;

          if (aggregatedMap.has(uri)) {
            const existing = aggregatedMap.get(uri)!;
            existing.ms_played += item.ms_played;
            existing.count = (existing.count || 1) + 1;
          } else {
            aggregatedMap.set(uri, {
              ...item,
              ms_played: item.ms_played,
              count: 1,
            });
          }
        }

        const aggregatedResult = Array.from(aggregatedMap.values());

        set({
          aggregatedData: aggregatedResult,
          isLoading: false,
          hasData: rawItems.length > 0,
          error: aggregatedResult.length === 0 ? "No valid track data found to aggregate (missing spotify_track_uri)." : null,
        });
      },

      initialize: async () => {
        set({ isLoading: true });
        try {
          const storedRaw = await getKey("spotify-raw-data");
          const hasStoredRaw = storedRaw && Array.isArray(storedRaw) && storedRaw.length > 0;

          if (get().hasData) return;

          if (hasStoredRaw) {
            set({ hasFoundData: true, hasData: false });
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
        // rawData and hasData are handling manually via IDB
        aggregatedData: state.aggregatedData,
        startDate: state.startDate,
        endDate: state.endDate,
      }),
    }
  )
);
