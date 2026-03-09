import type { SpotifyHistoryItem } from "@/types";

type InMessage = {
  type: "AGGREGATE";
  payload: SpotifyHistoryItem[];
};

type OutMessage = {
  type: "AGGREGATED";
  aggregated: SpotifyHistoryItem[];
};

self.onmessage = (e: MessageEvent<InMessage>) => {
  const { type, payload } = e.data;
  if (type !== "AGGREGATE") return;

  const map = new Map<string, SpotifyHistoryItem>();
  for (const item of payload) {
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

  const response: OutMessage = {
    type: "AGGREGATED",
    aggregated: Array.from(map.values()),
  };
  self.postMessage(response);
};
