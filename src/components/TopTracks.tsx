import React, { useMemo, useState } from "react";
import { useSpotifyStore } from "../store/useSpotifyStore";
import { formatMsPlain } from "../utils/formatTime";
import { useTranslation } from "react-i18next";
import { Modal } from "./Modal";

interface TopTracksProps {
  limit?: number;
  isModal?: boolean;
}

export const TopTracks: React.FC<TopTracksProps> = ({ limit = 10, isModal = false }) => {
  const { aggregatedData } = useSpotifyStore();
  const { t } = useTranslation();
  const [showMoreModal, setShowMoreModal] = useState(false);

  const sortedData = useMemo(() => {
    return [...aggregatedData]
      .sort((a, b) => {
        let aValue: any = a["ms_played"];
        let bValue: any = b["ms_played"];

        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;

        if (aValue < bValue) return 1;
        if (aValue > bValue) return -1;
        return 0;
      })
      .slice(0, limit);
  }, [aggregatedData, limit]);

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
            <h3>{t("topTracks.title")}</h3>
            <p>{t("topTracks.subtitle")}</p>
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
              <th>{t("topTracks.headerTitle")}</th>
              <th>{t("topTracks.headerArtist")}</th>
              <th style={{ textAlign: "right" }}>{t("topTracks.headerTimePlayed")}</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => {
              const url = `https://open.spotify.com/track/${item.spotify_track_uri?.replace("spotify:track:", "")}`;

              const { hours, minutes } = formatMsPlain(item.ms_played);

              return (
                <tr key={index} onClick={() => window.open(url, "_blank")} style={{ cursor: "pointer" }} title={t("topTracks.openInSpotify")}>
                  <td>{index + 1}</td>
                  <td>{item.master_metadata_track_name || <em>{t("topTracks.unknownTrack")}</em>}</td>
                  <td>{item.master_metadata_album_artist_name || <em>{t("topTracks.unknownArtist")}</em>}</td>
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

      <Modal isOpen={showMoreModal} onClose={() => setShowMoreModal(false)} title={t("topTracks.title")}>
        <TopTracks limit={100} isModal={true} />
      </Modal>
    </>
  );
};
