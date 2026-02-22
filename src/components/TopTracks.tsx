import React, { useMemo, useState } from "react";
import { useSpotifyStore } from "../store/useSpotifyStore";
import { formatMsPlain } from "../utils/formatTime";
import { useTranslation } from "react-i18next";
import { Modal } from "./Modal";
import { usePreviewPlayer } from "../hooks/usePreviewPlayer";

interface TopTracksProps {
  limit?: number;
  isModal?: boolean;
  sortBy?: "time" | "count";
}

export const TopTracks: React.FC<TopTracksProps> = ({ limit = 10, isModal = false, sortBy = "time" }) => {
  const { aggregatedData } = useSpotifyStore();
  const { t } = useTranslation();
  const { openPlayer } = usePreviewPlayer();
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [sortByState, setSortBy] = useState<"time" | "count">(sortBy);

  const sortedData = useMemo(() => {
    return [...aggregatedData]
      .sort((a, b) => {
        if (sortByState === "time") {
          let aValue: any = a["ms_played"];
          let bValue: any = b["ms_played"];

          if (aValue === undefined || aValue === null) return 1;
          if (bValue === undefined || bValue === null) return -1;

          if (aValue < bValue) return 1;
          if (aValue > bValue) return -1;
          return 0;
        } else {
          const aCount = a.count || 0;
          const bCount = b.count || 0;
          return bCount - aCount;
        }
      })
      .slice(0, limit);
  }, [aggregatedData, limit, sortByState]);

  return (
    <>
      <div className="table-container">
        <div className="header-row">
          <div className="title">
            <h3>{t("topTracks.title")}</h3>
            <p>
              {t("topTracks.subtitle")}{" "}
              <span className="sort-toggle">
                <button className={`toggle-btn ${sortByState === "time" ? "active" : ""}`} onClick={() => setSortBy("time")}>
                  {t("topTracks.sortByTime")}
                </button>
                <span>&nbsp;{t("common.or")}&nbsp;</span>
                <button className={`toggle-btn ${sortByState === "count" ? "active" : ""}`} onClick={() => setSortBy("count")}>
                  {t("topTracks.sortByCount")}
                </button>
              </span>
            </p>
          </div>
          {!isModal && (
            <button className="reset-btn" onClick={() => setShowMoreModal(true)}>
              {t("common.showMore")}
            </button>
          )}
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>{t("table.headerTitle")}</th>
              <th>{t("table.headerArtist")}</th>
              <th style={{ textAlign: "right" }}>{sortByState === "time" ? t("table.headerTimePlayed") : t("table.headerPlayCount")}</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => {
              const { hours, minutes } = formatMsPlain(item.ms_played);

              return (
                <tr
                  key={index}
                  onClick={() =>
                    item.spotify_track_uri &&
                    openPlayer(item.spotify_track_uri, item.master_metadata_track_name || "", item.master_metadata_album_artist_name || "")
                  }
                  style={{ cursor: "pointer" }}
                  title={t("table.statsAndPreview")}
                >
                  <td>{index + 1}</td>
                  <td>{item.master_metadata_track_name || <em>{t("topTracks.unknownTrack")}</em>}</td>
                  <td>{item.master_metadata_album_artist_name || <em>{t("topTracks.unknownArtist")}</em>}</td>
                  <td className="monospace">
                    {sortByState === "time" ? (
                      <>
                        {hours}
                        <span className="muted">h</span> {minutes.toString().padStart(2, "0")}
                        <span className="muted">m</span>
                      </>
                    ) : (
                      <>{item.count || 0}</>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showMoreModal} onClose={() => setShowMoreModal(false)}>
        <TopTracks limit={100} isModal={true} sortBy={sortByState} />
      </Modal>
    </>
  );
};
