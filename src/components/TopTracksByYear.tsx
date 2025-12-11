import React, { useMemo } from "react";
import { useSpotifyStore } from "../store/useSpotifyStore";
import { useTranslation } from "react-i18next";
import type { SpotifyHistoryItem } from "../types";

export const TopTracksByYear: React.FC = () => {
  const { rawData, startDate, endDate } = useSpotifyStore();
  const { t } = useTranslation();

  const yearlyTopTracks = useMemo(() => {
    // 1. Filter by date range
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const filtered = rawData.filter((item) => {
      if (!item.spotify_track_uri) return false;
      const itemDate = new Date(item.ts);
      if (start && itemDate < start) return false;
      if (end && itemDate > end) return false;
      return true;
    });

    // 2. Group by Year
    const byYear = new Map<number, SpotifyHistoryItem[]>();
    for (const item of filtered) {
      const year = new Date(item.ts).getFullYear();
      if (!byYear.has(year)) {
        byYear.set(year, []);
      }
      byYear.get(year)!.push(item);
    }

    // 3. Find top track for each year
    const result: { year: number; track: SpotifyHistoryItem }[] = [];

    byYear.forEach((items, year) => {
      // Aggregate by URI within this year
      const trackMap = new Map<string, { totalMs: number; item: SpotifyHistoryItem }>();

      for (const item of items) {
        const uri = item.spotify_track_uri!;
        if (!trackMap.has(uri)) {
          trackMap.set(uri, { totalMs: 0, item });
        }
        trackMap.get(uri)!.totalMs += item.ms_played;
      }

      // Find max
      let maxMs = -1;
      let topItem: SpotifyHistoryItem | null = null;

      trackMap.forEach(({ totalMs, item }) => {
        if (totalMs > maxMs) {
          maxMs = totalMs;
          topItem = item;
        }
      });

      if (topItem) {
        result.push({ year, track: topItem });
      }
    });

    // 4. Sort by Year Descending
    return result.sort((a, b) => b.year - a.year);
  }, [rawData, startDate, endDate]);

  if (yearlyTopTracks.length === 0) {
    return null;
  }

  return (
    <div className="table-container">
      <div
        className="header-row"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginRight: "1.2rem",
        }}
      >
        <div className="title">
          <h3>{t("topTracksByYear.title")}</h3>
          <p>{t("topTracksByYear.subtitle")}</p>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>{t("topTracksByYear.headerYear")}</th>
            <th>{t("topTracksByYear.headerTitle")}</th>
            <th>{t("topTracksByYear.headerArtist")}</th>
          </tr>
        </thead>
        <tbody>
          {yearlyTopTracks.map(({ year, track }) => {
            const url = `https://open.spotify.com/track/${track.spotify_track_uri?.replace("spotify:track:", "")}`;

            return (
              <tr key={year} onClick={() => window.open(url, "_blank")} style={{ cursor: "pointer" }} title={t("topTracks.openInSpotify")}>
                <td>{year}</td>
                <td>{track.master_metadata_track_name || <em>{t("topTracks.unknownTrack")}</em>}</td>
                <td>{track.master_metadata_album_artist_name || <em>{t("topTracks.unknownArtist")}</em>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
