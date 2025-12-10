# Data Architecture Documentation

## Overview

The Spotify History Visualizer now uses a centralized data management system powered by **Zustand**, making it easy to add multiple data views and visualizations.

## Architecture

### Central Data Store

**Location**: `src/store/useSpotifyStore.ts`

The Zustand store serves as the single source of truth for all Spotify streaming data. It maintains:

- **`rawData`**: All individual streaming events from uploaded files
- **`aggregatedData`**: Tracks grouped by URI with summed playtime (used by DataTable)
- **`isLoading`**: Loading state during file processing
- **`error`**: Error messages if data loading fails

### Data Flow

```
User uploads files
       ↓
FileUpload component
       ↓
Store.loadData(rawItems)
       ↓
Store processes & aggregates data
       ↓
View components read from store
```

### Store Actions

```typescript
// Load raw data and automatically aggregate it
loadData(rawItems: SpotifyHistoryItem[]): void

// Manual setters (if needed)
setRawData(data: SpotifyHistoryItem[]): void
setAggregatedData(data: SpotifyHistoryItem[]): void
setLoading(loading: boolean): void
setError(error: string | null): void

// Reset all data
reset(): void
```

## Data Structure

Each streaming event contains:

```typescript
interface SpotifyHistoryItem {
  ts: string; // ISO 8601 timestamp
  platform?: string; // e.g., "WebPlayer", "iOS"
  ms_played: number; // Milliseconds played
  conn_country?: string; // Country code
  ip_addr?: string; // IP address
  master_metadata_track_name: string | null; // Track name
  master_metadata_album_artist_name: string | null; // Artist name
  master_metadata_album_album_name?: string | null; // Album name
  spotify_track_uri: string | null; // Spotify URI
  reason_start?: string; // Why playback started
  reason_end?: string; // Why playback ended
  shuffle?: boolean; // Shuffle mode
  skipped?: boolean; // Was track skipped
  offline?: boolean; // Offline playback
  incognito_mode?: boolean; // Private session
  // ... plus episode and audiobook fields
}
```

## Creating New Views

To add a new visualization component:

1. **Create the component** in `src/components/`
2. **Import the store**:
   ```typescript
   import { useSpotifyStore } from "../store/useSpotifyStore";
   ```
3. **Access the data**:
   ```typescript
   const { rawData, aggregatedData } = useSpotifyStore();
   ```
4. **Filter/transform as needed** within the component
5. **Add to App.tsx** or create a new view container

### Example: Time-based View

```typescript
import { useSpotifyStore } from "../store/useSpotifyStore";
import { useMemo } from "react";

export const TimelineView = () => {
  const { rawData } = useSpotifyStore();

  // Group by day
  const dailyData = useMemo(() => {
    const grouped = new Map<string, number>();

    rawData.forEach((item) => {
      const day = item.ts.split("T")[0]; // Extract date
      const current = grouped.get(day) || 0;
      grouped.set(day, current + item.ms_played);
    });

    return Array.from(grouped.entries()).map(([date, ms]) => ({
      date,
      minutes: ms / 60000,
    }));
  }, [rawData]);

  return <div>{/* Render your chart here */}</div>;
};
```

## Planned Visualizations

### 1. Listening Behavior Over Time

- **Line chart**: Minutes per day/week/month
- **Heatmap**: Hours (X-axis) × Weekdays (Y-axis)
- **Calendar heatmap**: GitHub-style contribution map

### 2. Top Artists, Songs, Genres

- **Bar charts**: Most played artists/songs
- **Treemap**: Genre/artist distribution
- **Pareto chart**: 80/20 analysis

### 3. Skip Behavior Analysis

- **Scatter plot**: `ms_played` vs `skipped`
- **Percentage chart**: Skip rate per artist/album
- **Session length**: Continuous listening sessions

### 4. Platform Analysis

- **Donut chart**: iOS vs Desktop vs Web
- **Stacked bar**: Listening minutes per platform over time

### 5. Mood/Tempo Analysis (requires Spotify API)

- **Radar charts**: Average track features
- **Temporal charts**: Mood changes over time

### 6. Geographic Analysis

- **Map**: Listening locations
- **Roaming heatmap**: Travel patterns

## Benefits of This Architecture

✅ **Single source of truth** - No prop drilling  
✅ **Easy to extend** - Add new views without refactoring  
✅ **Performance** - Memoized computations in views  
✅ **Separation of concerns** - Data logic separate from UI  
✅ **Type safety** - Full TypeScript support

## Current Implementation

- ✅ Central Zustand store
- ✅ Raw data storage
- ✅ Aggregated data (by track URI)
- ✅ DataTable as first view component
- ⏳ Additional visualizations (planned)
