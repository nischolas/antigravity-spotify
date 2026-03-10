import type { SpotifyHistoryItem } from "@/types";

export function aggregateTracks(items: SpotifyHistoryItem[]): SpotifyHistoryItem[] {
  // Pass 1: group by URI
  const byUri = new Map<string, SpotifyHistoryItem>();
  for (const item of items) {
    const uri = item.spotify_track_uri;
    if (!uri) continue;
    if (byUri.has(uri)) {
      const existing = byUri.get(uri)!;
      existing.ms_played += item.ms_played;
      existing.count = (existing.count || 1) + 1;
    } else {
      byUri.set(uri, { ...item, count: 1 });
    }
  }

  // Pass 2: group by artist+track name to merge same song with different URIs
  const byName = new Map<string, SpotifyHistoryItem>();
  for (const item of byUri.values()) {
    const artist = item.master_metadata_album_artist_name;
    const track = item.master_metadata_track_name;
    if (!artist || !track) {
      byName.set(item.spotify_track_uri!, item);
      continue;
    }
    const key = `${artist}||${track}`;
    if (byName.has(key)) {
      const existing = byName.get(key)!;
      existing.ms_played += item.ms_played;
      existing.count = (existing.count || 0) + (item.count || 0);
    } else {
      byName.set(key, { ...item });
    }
  }

  return Array.from(byName.values());
}
