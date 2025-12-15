import React, { useMemo, useState } from "react";
import { useSpotifyStore } from "../store/useSpotifyStore";
import { useTranslation } from "react-i18next";
import type { SpotifyHistoryItem } from "../types";
import { Modal } from "./Modal";

export type ReasonStartType =
  | "trackdone"
  | "fwdbtn"
  | "clickrow"
  | "appload"
  | "backbtn"
  | "playbtn"
  | "remote"
  | "popup"
  | "unknown"
  | "trackerror"
  | "persisted"
  | "reconnect"
  | "switched-to-audio"
  | "clickside"
  | "click-row";

interface ReasonStartTracksProps {
  reason_start: ReasonStartType;
  limit?: number;
  isModal?: boolean;
}

export const ReasonStartTracks: React.FC<ReasonStartTracksProps> = ({ reason_start, limit = 10, isModal = false }) => {
  const { rawData, startDate, endDate } = useSpotifyStore();
  const { t } = useTranslation();
  const [showMoreModal, setShowMoreModal] = useState(false);

  const title = t(`reasonStartTracks.title.${reason_start}`);
  const subtitle = t(`reasonStartTracks.subtitle.${reason_start}`);

  // Filter raw data based on date range first
  const dateFilteredData = useMemo(() => {
    return rawData.filter((item) => {
      const itemDate = new Date(item.ts);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && itemDate < start) return false;
      if (end && itemDate > end) return false;
      return true;
    });
  }, [rawData, startDate, endDate]);

  const sortedData = useMemo(() => {
    const trackCounts = new Map<
      string,
      {
        count: number;
        track: SpotifyHistoryItem;
      }
    >();

    dateFilteredData.forEach((item) => {
      // Apply reason filter for counting
      if (item.reason_start !== reason_start) return;

      const uri = item.spotify_track_uri;
      if (!uri) return;

      if (trackCounts.has(uri)) {
        const existing = trackCounts.get(uri)!;
        existing.count += 1;
      } else {
        trackCounts.set(uri, {
          count: 1,
          track: item,
        });
      }
    });

    return Array.from(trackCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }, [dateFilteredData, reason_start, limit]);

  return (
    <>
      <div className="table-container">
        <div className="header-row">
          <div className="title">
            <h3>{title}</h3>
            <p>{subtitle}</p>
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
              {/* <th style={{ textAlign: "right" }}>{t("table.headerPlayCount")}</th> */}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => {
              const url = item.track.spotify_track_uri ? `https://open.spotify.com/track/${item.track.spotify_track_uri.replace("spotify:track:", "")}` : "#";

              return (
                <tr
                  key={index}
                  onClick={() => item.track.spotify_track_uri && window.open(url, "_blank")}
                  style={{
                    cursor: item.track.spotify_track_uri ? "pointer" : "default",
                  }}
                  title={t("common.openInSpotify")}
                >
                  <td>{index + 1}</td>
                  <td>{item.track.master_metadata_track_name || <em>{t("reasonStartTracks.unknownTrack")}</em>}</td>
                  <td>{item.track.master_metadata_album_artist_name || <em>{t("reasonStartTracks.unknownArtist")}</em>}</td>
                  {/* <td className="monospace">{item.count}</td> */}
                </tr>
              );
            })}
            {sortedData.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>
                  {t("reasonStartTracks.noData")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showMoreModal} onClose={() => setShowMoreModal(false)}>
        <ReasonStartTracks reason_start={reason_start} limit={100} isModal={true} />
      </Modal>
    </>
  );
};
