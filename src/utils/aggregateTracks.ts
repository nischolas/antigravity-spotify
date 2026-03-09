import type { SpotifyHistoryItem } from "@/types";

export function aggregateTracks(items: SpotifyHistoryItem[]): SpotifyHistoryItem[] {
  const map = new Map<string, SpotifyHistoryItem>();
  for (const item of items) {
    const uri = item.spotify_track_uri;
    if (!uri) continue;
    if (map.has(uri)) {
      const existing = map.get(uri)!;
      existing.ms_played += item.ms_played;
      existing.count = (existing.count || 1) + 1;
    } else {
      map.set(uri, { ...item, count: 1 });
    }
  }
  return Array.from(map.values());
}
