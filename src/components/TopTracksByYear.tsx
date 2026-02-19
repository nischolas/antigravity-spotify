import React, { useMemo, useState } from "react";
import { useSpotifyStore } from "../store/useSpotifyStore";
import { useTranslation } from "react-i18next";
import type { SpotifyHistoryItem } from "../types";
import { Modal } from "./Modal";
import { usePreviewPlayer } from "../hooks/usePreviewPlayer";

interface TopTracksByYearProps {
  groupBy?: "year" | "month";
  isModal?: boolean;
}

export const TopTracksByYear: React.FC<TopTracksByYearProps> = ({ groupBy = "year", isModal = false }) => {
  const { rawData, startDate, endDate } = useSpotifyStore();
  const { t, i18n } = useTranslation();
  const { openPlayer } = usePreviewPlayer();
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

  if (topTracks.length === 0) {
    return null;
  }

  return (
    <>
      <div className="table-container">
        <div className="header-row">
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
              <th>{t("table.headerTitle")}</th>
              <th>{t("table.headerArtist")}</th>
            </tr>
          </thead>
          <tbody>
            {topTracks.map(({ groupKey, track }, index) => {
              // Logic for Year Header in Month View
              let showYearHeader = false;
              let currentYear = "";

              if (groupBy === "month") {
                const [y] = groupKey.split("-");
                currentYear = y;
                const prevKey = index > 0 ? topTracks[index - 1].groupKey : null;
                const prevYear = prevKey ? prevKey.split("-")[0] : null;

                if (currentYear !== prevYear) {
                  showYearHeader = true;
                }
              }

              return (
                <React.Fragment key={groupKey}>
                  {showYearHeader && (
                    <tr className="year-header" style={{ backgroundColor: "var(--bg-secondary)", fontWeight: "bold" }}>
                      <td colSpan={3} style={{ padding: "0.8rem 0.5rem" }}>
                        {currentYear}
                      </td>
                    </tr>
                  )}
                  <tr
                    onClick={() => track.spotify_track_uri && openPlayer(track.spotify_track_uri)}
                    style={{ cursor: "pointer" }}
                    title={t("common.openInSpotify")}
                  >
                    <td>
                      {groupBy === "year"
                        ? groupKey
                        : new Date(Number(groupKey.split("-")[0]), Number(groupKey.split("-")[1]) - 1).toLocaleDateString(i18n.language, { month: "short" })}
                    </td>
                    <td>{track.master_metadata_track_name || <em>{t("topTracks.unknownTrack")}</em>}</td>
                    <td>{track.master_metadata_album_artist_name || <em>{t("topTracks.unknownArtist")}</em>}</td>
                  </tr>
                </React.Fragment>
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
