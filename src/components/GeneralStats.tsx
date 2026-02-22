import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSpotifyStore } from "../store/useSpotifyStore";
import { formatDurationDDHHMM } from "../utils/formatTime";

export const GeneralStats = () => {
  const { aggregatedData, rawData, startDate, endDate } = useSpotifyStore();
  const { t } = useTranslation();

  const stats = useMemo(() => {
    let totalTime = 0;
    const uniqueArtists = new Set<string>();

    aggregatedData.forEach((track) => {
      totalTime += track.ms_played;
      if (track.master_metadata_album_artist_name) {
        uniqueArtists.add(track.master_metadata_album_artist_name);
      }
    });

    const filteredRawCount = rawData.filter((item) => {
      const d = new Date(item.ts);
      if (startDate && d < new Date(startDate)) return false;
      if (endDate && d > new Date(endDate)) return false;
      return true;
    }).length;

    return {
      totalTime: formatDurationDDHHMM(totalTime),
      uniqueArtists: uniqueArtists.size,
      uniqueSongs: aggregatedData.length,
      filteredRawCount,
    };
  }, [aggregatedData, rawData, startDate, endDate]);

  if (aggregatedData.length === 0) return null;

  return (
    <div className="general-stats">
      <div className="stat-card">
        <span className="stat-label">{t("generalStats.totalTime")}</span>
        <span className="stat-value time-value">
          {stats.totalTime.days}
          <span style={{ fontSize: "0.7em", color: "#0e7a34" }}>d</span> {stats.totalTime.hours}
          <span style={{ fontSize: "0.7em", color: "#0e7a34" }}>h</span> {stats.totalTime.minutes}
          <span style={{ fontSize: "0.7em", color: "#0e7a34" }}>m</span>
        </span>
      </div>
      <div className="stat-card">
        <span className="stat-label">{t("generalStats.rawDataLength")}</span>
        <span className="stat-value time-value">{stats.filteredRawCount.toLocaleString()}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">{t("generalStats.uniqueSongs")}</span>
        <span className="stat-value">{stats.uniqueSongs.toLocaleString()}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">{t("generalStats.uniqueArtists")}</span>
        <span className="stat-value">{stats.uniqueArtists.toLocaleString()}</span>
      </div>
    </div>
  );
};
