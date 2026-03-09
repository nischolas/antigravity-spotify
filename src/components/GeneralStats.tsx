import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSpotifyStore } from "../store/useSpotifyStore";
import { formatDurationDDHHMM } from "../utils/formatTime";

export const GeneralStats = () => {
  const { aggregatedData, filteredRawData } = useSpotifyStore();
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

    return {
      totalTime: formatDurationDDHHMM(totalTime),
      uniqueArtists: uniqueArtists.size,
      uniqueSongs: aggregatedData.length,
      filteredRawCount: filteredRawData.length,
    };
  }, [aggregatedData, filteredRawData]);

  if (aggregatedData.length === 0) return null;

  return (
    <div className="general-stats">
      <div className="stat-card">
        <span className="stat-value time-value">
          {stats.totalTime.days}
          <span style={{ fontSize: "0.7em", color: "#0e7a34" }}>{t("generalStats.days")}</span> {stats.totalTime.hours}
          <span style={{ fontSize: "0.7em", color: "#0e7a34" }}>{t("generalStats.hours")}</span> {stats.totalTime.minutes}
          <span style={{ fontSize: "0.7em", color: "#0e7a34" }}>{t("generalStats.minutes")}</span>
        </span>
        <span className="stat-label">{t("generalStats.totalTime")}</span>
      </div>
      <div className="stat-card">
        <span className="stat-value time-value">{stats.filteredRawCount.toLocaleString()}</span>
        <span className="stat-label">{t("generalStats.rawDataLength")}</span>
      </div>
      <div className="stat-card">
        <span className="stat-value">{stats.uniqueSongs.toLocaleString()}</span>
        <span className="stat-label">{t("generalStats.uniqueSongs")}</span>
      </div>
      <div className="stat-card">
        <span className="stat-value">{stats.uniqueArtists.toLocaleString()}</span>
        <span className="stat-label">{t("generalStats.uniqueArtists")}</span>
      </div>
    </div>
  );
};
