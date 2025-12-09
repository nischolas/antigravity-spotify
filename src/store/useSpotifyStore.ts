import { create } from 'zustand';
import type { SpotifyHistoryItem } from '../types';

interface SpotifyStore {
  // Raw data - all individual streaming events
  rawData: SpotifyHistoryItem[];
  
  // Aggregated data - tracks grouped by URI with summed playtime
  aggregatedData: SpotifyHistoryItem[];
  
  // Date range filter
  startDate: string | null;
  endDate: string | null;
  
  // Loading state
  isLoading: boolean;
  
  // Error state
  error: string | null;
  
  // Actions
  setRawData: (data: SpotifyHistoryItem[]) => void;
  setAggregatedData: (data: SpotifyHistoryItem[]) => void;
  setDateRange: (startDate: string | null, endDate: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  
  // Combined action to load and process data
  loadData: (rawItems: SpotifyHistoryItem[]) => void;
}

const initialState = {
  rawData: [],
  aggregatedData: [],
  startDate: null,
  endDate: null,
  isLoading: false,
  error: null,
};

export const useSpotifyStore = create<SpotifyStore>((set) => ({
  ...initialState,
  
  setRawData: (data) => set({ rawData: data }),
  
  setAggregatedData: (data) => set({ aggregatedData: data }),
  
  setDateRange: (startDate, endDate) => set((state) => {
    // Re-aggregate data with new date range
    const filteredRaw = state.rawData.filter(item => {
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
      } else {
        aggregatedMap.set(uri, {
          ...item,
          ms_played: item.ms_played
        });
      }
    }
    
    return {
      startDate,
      endDate,
      aggregatedData: Array.from(aggregatedMap.values())
    };
  }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  reset: () => set(initialState),
  
  loadData: (rawItems) => {
    set({ rawData: rawItems, isLoading: true, error: null });
    
    // Aggregate data by track URI
    const aggregatedMap = new Map<string, SpotifyHistoryItem>();
    
    for (const item of rawItems) {
      const uri = item.spotify_track_uri;
      if (!uri) continue;
      
      if (aggregatedMap.has(uri)) {
        const existing = aggregatedMap.get(uri)!;
        existing.ms_played += item.ms_played;
      } else {
        aggregatedMap.set(uri, {
          ...item,
          ms_played: item.ms_played
        });
      }
    }
    
    const aggregatedResult = Array.from(aggregatedMap.values());
    
    set({ 
      aggregatedData: aggregatedResult,
      isLoading: false,
      error: aggregatedResult.length === 0 
        ? 'No valid track data found to aggregate (missing spotify_track_uri).' 
        : null
    });
  },
}));
