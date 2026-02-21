import { useSpotifyStore } from "../store/useSpotifyStore";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "./Modal";
import { usePreviewPlayer } from "../hooks/usePreviewPlayer";

interface SkippedTracksProps {
  limit?: number;
  isModal?: boolean;
}

export const SkippedTracks: React.FC<SkippedTracksProps> = ({ limit = 10, isModal = false }) => {
  const { rawData } = useSpotifyStore();
  const { t } = useTranslation();
  const { openPlayer } = usePreviewPlayer();
  const [showMoreModal, setShowMoreModal] = useState(false);

  const CUTOFF = 10000;

  const skippedTracks = useMemo(() => {
    const skipped = rawData.filter((item) => item.ms_played < CUTOFF);

    const grouped = new Map<
      string,
      {
        trackName: string;
        artistName: string;
        skipCount: number;
        totalPlays: number;
        uri: string | null;
      }
    >();

    rawData.forEach((item) => {
      const key = item.spotify_track_uri || `${item.master_metadata_track_name}-${item.master_metadata_album_artist_name}`;
      const existing = grouped.get(key);

      if (existing) {
        existing.totalPlays++;
      } else {
        grouped.set(key, {
          trackName: item.master_metadata_track_name || t("skippedTracks.unknownTrack"),
          artistName: item.master_metadata_album_artist_name || t("skippedTracks.unknownArtist"),
          skipCount: 0,
          totalPlays: 1,
          uri: item.spotify_track_uri,
        });
      }
    });

    skipped.forEach((item) => {
      const key = item.spotify_track_uri || `${item.master_metadata_track_name}-${item.master_metadata_album_artist_name}`;
      const existing = grouped.get(key);

      if (existing) {
        existing.skipCount++;
      }
    });

    return Array.from(grouped.values())
      .filter((item) => item.skipCount > 0)
      .filter((item) => item.trackName !== t("skippedTracks.unknownTrack"))
      .sort((a, b) => b.skipCount - a.skipCount)
      .slice(0, limit);
  }, [rawData, t, limit]);

  return (
    <>
      <div className="table-container">
        <div className="header-row">
          <div className="title">
            <h3>{t("skippedTracks.title")}</h3>
            <p>{t("skippedTracks.subtitle", { seconds: CUTOFF / 1000 })}</p>
          </div>
          {!isModal && (
            <button className="reset-btn" onClick={() => setShowMoreModal(true)}>
              {t("common.showMore", "Show More")}
            </button>
          )}
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>{t("table.headerTitle")}</th>
              <th>{t("table.headerArtist")}</th>
              <th style={{ textAlign: "right" }}>{t("table.skipRate")}</th>
            </tr>
          </thead>
          <tbody>
            {skippedTracks.map((track, index) => {
              const skipRate = ((track.skipCount / track.totalPlays) * 100).toFixed(0);

              return (
                <tr
                  key={index}
                  onClick={() => track.uri && openPlayer(track.uri, track.trackName || "", track.artistName || "")}
                  style={{ cursor: "pointer" }}
                  title={t("common.openInSpotify")}
                >
                  <td>{index + 1}</td>
                  <td>{track.trackName}</td>
                  <td>{track.artistName}</td>
                  <td style={{ textAlign: "right" }}>
                    {skipRate}
                    <span className="muted">
                      % ({track.skipCount}/{track.totalPlays})
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showMoreModal} onClose={() => setShowMoreModal(false)}>
        <SkippedTracks limit={100} isModal={true} />
      </Modal>
    </>
  );
};
