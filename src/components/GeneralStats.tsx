import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSpotifyStore } from "../store/useSpotifyStore";
import { formatDurationDDHHMM } from "../utils/formatTime";

export const GeneralStats = () => {
  const { aggregatedData } = useSpotifyStore();
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
    };
  }, [aggregatedData]);

  if (aggregatedData.length === 0) return null;

  return (
    <div className="general-stats">
      <div className="stat-card">
        <span className="stat-label">{t("generalStats.totalTime")}</span>
        <span className="stat-value time-value">{stats.totalTime}</span>
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
