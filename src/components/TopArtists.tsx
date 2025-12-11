import { useSpotifyStore } from "../store/useSpotifyStore";
import { useMemo, useState } from "react";
import { formatMsPlain } from "../utils/formatTime";
import { useTranslation } from "react-i18next";
import { Modal } from "./Modal";

interface TopArtistsProps {
  limit?: number;
  isModal?: boolean;
}

export const TopArtists: React.FC<TopArtistsProps> = ({ limit = 10, isModal = false }) => {
  const { aggregatedData } = useSpotifyStore();
  const { t } = useTranslation();
  const [showMoreModal, setShowMoreModal] = useState(false);

  const topArtists = useMemo(() => {
    const grouped = new Map<string, number>();

    aggregatedData.forEach((item) => {
      const artist = item.master_metadata_album_artist_name || t("topArtists.unknown");
      const current = grouped.get(artist) || 0;
      grouped.set(artist, current + item.ms_played);
    });

    return Array.from(grouped.entries())
      .map(([artist, ms]) => ({
        artist,
        ms_played: ms,
      }))
      .sort((a, b) => b.ms_played - a.ms_played)
      .slice(0, limit);
  }, [aggregatedData, t, limit]);

  return (
    <>
      <div className="table-container">
        <div className="header-row">
          <div className="title">
            <h3>{t("topArtists.title")}</h3>
            <p>{t("topArtists.subtitle")}</p>
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
              <th>{t("topArtists.headerArtist")}</th>
              <th style={{ textAlign: "right" }}>{t("topArtists.headerTimePlayed")}</th>
            </tr>
          </thead>
          <tbody>
            {topArtists.map((artist, index) => {
              const { hours, minutes } = formatMsPlain(artist.ms_played);

              return (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{artist.artist}</td>
                  <td className="monospace">
                    {hours}
                    <span className="muted">h</span> {minutes.toString().padStart(2, "0")}
                    <span className="muted">m</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showMoreModal} onClose={() => setShowMoreModal(false)}>
        <TopArtists limit={100} isModal={true} />
      </Modal>
    </>
  );
};
