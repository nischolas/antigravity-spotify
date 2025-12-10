# Quick Reference: Creating New Data Views

## Basic Template

```typescript
import { useSpotifyStore } from "../store/useSpotifyStore";
import { useMemo } from "react";

export const MyNewView = () => {
  // Get data from the store
  const { rawData, aggregatedData } = useSpotifyStore();

  // Transform data for your view (memoized for performance)
  const viewData = useMemo(() => {
    // Your transformation logic here
    return rawData.map((item) => ({
      // ... transform as needed
    }));
  }, [rawData]);

  return <div className="my-view">{/* Your visualization here */}</div>;
};
```

## Common Data Transformations

### Group by Date

```typescript
const dailyListening = useMemo(() => {
  const grouped = new Map<string, number>();

  rawData.forEach((item) => {
    const date = item.ts.split("T")[0]; // YYYY-MM-DD
    const current = grouped.get(date) || 0;
    grouped.set(date, current + item.ms_played);
  });

  return Array.from(grouped.entries()).map(([date, ms]) => ({
    date,
    minutes: Math.round(ms / 60000),
  }));
}, [rawData]);
```

### Group by Artist

```typescript
const topArtists = useMemo(() => {
  const grouped = new Map<string, number>();

  aggregatedData.forEach((item) => {
    const artist = item.master_metadata_album_artist_name || "Unknown";
    const current = grouped.get(artist) || 0;
    grouped.set(artist, current + item.ms_played);
  });

  return Array.from(grouped.entries())
    .map(([artist, ms]) => ({
      artist,
      minutes: Math.round(ms / 60000),
    }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 20); // Top 20
}, [aggregatedData]);
```

### Group by Hour of Day

```typescript
const hourlyPattern = useMemo(() => {
  const hours = new Array(24).fill(0);

  rawData.forEach((item) => {
    const hour = new Date(item.ts).getHours();
    hours[hour] += item.ms_played;
  });

  return hours.map((ms, hour) => ({
    hour,
    minutes: Math.round(ms / 60000),
  }));
}, [rawData]);
```

### Group by Day of Week

```typescript
const weekdayPattern = useMemo(() => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const totals = new Array(7).fill(0);

  rawData.forEach((item) => {
    const day = new Date(item.ts).getDay();
    totals[day] += item.ms_played;
  });

  return totals.map((ms, index) => ({
    day: days[index],
    minutes: Math.round(ms / 60000),
  }));
}, [rawData]);
```

### Skip Rate Analysis

```typescript
const skipAnalysis = useMemo(() => {
  const artistStats = new Map<string, { total: number; skipped: number }>();

  rawData.forEach((item) => {
    const artist = item.master_metadata_album_artist_name || "Unknown";
    const stats = artistStats.get(artist) || { total: 0, skipped: 0 };

    stats.total++;
    if (item.skipped) stats.skipped++;

    artistStats.set(artist, stats);
  });

  return Array.from(artistStats.entries())
    .map(([artist, stats]) => ({
      artist,
      skipRate: (stats.skipped / stats.total) * 100,
      total: stats.total,
    }))
    .filter((item) => item.total >= 10) // Only artists with 10+ plays
    .sort((a, b) => b.skipRate - a.skipRate);
}, [rawData]);
```

### Platform Distribution

```typescript
const platformStats = useMemo(() => {
  const platforms = new Map<string, number>();

  rawData.forEach((item) => {
    const platform = item.platform || "Unknown";
    const current = platforms.get(platform) || 0;
    platforms.set(platform, current + item.ms_played);
  });

  return Array.from(platforms.entries()).map(([platform, ms]) => ({
    platform,
    minutes: Math.round(ms / 60000),
  }));
}, [rawData]);
```

## Utility Functions

### Convert Milliseconds

```typescript
const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
};
```

### Parse Date

```typescript
const parseDate = (ts: string) => {
  const date = new Date(ts);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    dayOfWeek: date.getDay(),
    weekNumber: getWeekNumber(date),
  };
};

const getWeekNumber = (date: Date) => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};
```

## Adding Your View to the App

1. Create your component in `src/components/`
2. Import it in `App.tsx`:
   ```typescript
   import { MyNewView } from "./components/MyNewView";
   ```
3. Add it to the UI:
   ```typescript
   <div className="data-section">
     <DataTable />
     <MyNewView />
   </div>
   ```

## Tips

- **Use `useMemo`** for expensive transformations
- **Filter in the component** rather than in the store
- **Keep transformations simple** - break complex logic into smaller functions
- **Test with the example.json** file first
- **Handle null/undefined** values gracefully
