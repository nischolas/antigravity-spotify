import React, { useMemo, useState } from "react";
import { useSpotifyStore } from "../store/useSpotifyStore";
import { useTranslation } from "react-i18next";
import type { SpotifyHistoryItem } from "../types";
import { Modal } from "./Modal";

interface TopTracksByYearProps {
  groupBy?: "year" | "month";
  isModal?: boolean;
}

export const TopTracksByYear: React.FC<TopTracksByYearProps> = ({ groupBy = "year", isModal = false }) => {
  const { rawData, startDate, endDate } = useSpotifyStore();
  const { t, i18n } = useTranslation();
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);

  const topTracks = useMemo(() => {
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

    // 2. Group by Timeframe
    const groups = new Map<string, SpotifyHistoryItem[]>();

    for (const item of filtered) {
      const date = new Date(item.ts);
      let key: string;

      if (groupBy === "year") {
        key = date.getFullYear().toString();
      } else {
        // Sortable key for months: YYYY-MM
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        key = `${year}-${month}`;
      }

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(item);
    }

    // 3. Find top track for each group
    const result: { groupKey: string; track: SpotifyHistoryItem }[] = [];

    groups.forEach((items, groupKey) => {
      // Aggregate by URI within this group
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
        result.push({ groupKey, track: topItem });
      }
    });

    // 4. Sort by Date Descending
    return result.sort((a, b) => b.groupKey.localeCompare(a.groupKey));
  }, [rawData, startDate, endDate, groupBy]);

  const formatGroupLabel = (key: string) => {
    if (groupBy === "year") return key;

    // For "YYYY-MM", format as "Month Year"
    const [year, month] = key.split("-").map(Number);
    const date = new Date(year, month - 1);
    return date.toLocaleDateString(i18n.language, { month: "short", year: "numeric" });
  };

  if (topTracks.length === 0) {
    return null;
  }

  return (
    <>
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
            <h3>{groupBy === "year" ? t("topTracksByYear.title") : t("topTracksByYear.titleMonth")}</h3>
            <p>{groupBy === "year" ? t("topTracksByYear.subtitle") : t("topTracksByYear.subtitleMonth")}</p>
          </div>
          {!isModal && groupBy === "year" && (
            <button className="reset-btn" onClick={() => setShowMonthlyModal(true)}>
              {t("topTracksByYear.showByMonth")}
            </button>
          )}
        </div>
        <table>
          <thead>
            <tr>
              <th>{groupBy === "year" ? t("topTracksByYear.headerYear") : t("topTracksByYear.headerMonth")}</th>
              <th>{t("topTracksByYear.headerTitle")}</th>
              <th>{t("topTracksByYear.headerArtist")}</th>
            </tr>
          </thead>
          <tbody>
            {topTracks.map(({ groupKey, track }) => {
              const url = `https://open.spotify.com/track/${track.spotify_track_uri?.replace("spotify:track:", "")}`;

              return (
                <tr key={groupKey} onClick={() => window.open(url, "_blank")} style={{ cursor: "pointer" }} title={t("topTracks.openInSpotify")}>
                  <td>{formatGroupLabel(groupKey)}</td>
                  <td>{track.master_metadata_track_name || <em>{t("topTracks.unknownTrack")}</em>}</td>
                  <td>{track.master_metadata_album_artist_name || <em>{t("topTracks.unknownArtist")}</em>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showMonthlyModal} onClose={() => setShowMonthlyModal(false)}>
        <TopTracksByYear groupBy="month" isModal={true} />
      </Modal>
    </>
  );
};
