import type { SpotifyHistoryItem } from "@/types";
import { aggregateTracks } from "@/utils/aggregateTracks";

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

  const response: OutMessage = {
    type: "AGGREGATED",
    aggregated: aggregateTracks(payload),
  };
  self.postMessage(response);
};
