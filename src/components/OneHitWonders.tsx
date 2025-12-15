import React, { useMemo, useState } from "react";
import { useSpotifyStore } from "../store/useSpotifyStore";

import { useTranslation } from "react-i18next";
import { Modal } from "./Modal";
import type { SpotifyHistoryItem } from "../types";

interface OneHitWondersProps {
  limit?: number;
  isModal?: boolean;
}

export const OneHitWonders: React.FC<OneHitWondersProps> = ({ limit = 10, isModal = false }) => {
  const { aggregatedData } = useSpotifyStore();
  const { t } = useTranslation();
  const [showMoreModal, setShowMoreModal] = useState(false);

  const oneHitWonders = useMemo(() => {
    // 1. Group by artist
    const artistMap = new Map<string, SpotifyHistoryItem[]>();

    for (const item of aggregatedData) {
      const artist = item.master_metadata_album_artist_name;
      if (!artist) continue;

      if (!artistMap.has(artist)) {
        artistMap.set(artist, []);
      }
      artistMap.get(artist)!.push(item);
    }

    // 2. Filter for artists with exactly 1 track
    const oneHitters: SpotifyHistoryItem[] = [];
    for (const [, tracks] of artistMap) {
      if (tracks.length === 1) {
        oneHitters.push(tracks[0]);
      }
    }

    // 3. Sort by total plays (count), tie-break with total playtime (ms_played)
    return oneHitters
      .sort((a, b) => {
        const diffCount = (b.count || 0) - (a.count || 0);
        if (diffCount !== 0) {
          return diffCount;
        }
        return b.ms_played - a.ms_played;
      })
      .slice(0, limit);
  }, [aggregatedData, limit]);

  return (
    <>
      <div className="table-container">
        <div className="header-row">
          <div className="title">
            <h3>{t("oneHitWonders.title")}</h3>
            <p>{t("oneHitWonders.subtitle")}</p>
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
              <th>{t("oneHitWonders.headerTitle")}</th>
              <th>{t("oneHitWonders.headerArtist")}</th>
              <th style={{ textAlign: "right" }}>{t("oneHitWonders.headerPlayCount")}</th>
            </tr>
          </thead>
          <tbody>
            {oneHitWonders.map((item, index) => {
              const url = `https://open.spotify.com/track/${item.spotify_track_uri?.replace("spotify:track:", "")}`;

              return (
                <tr key={index} onClick={() => window.open(url, "_blank")} style={{ cursor: "pointer" }} title={t("topTracks.openInSpotify")}>
                  <td>{index + 1}</td>
                  <td>{item.master_metadata_track_name || <em>{t("topTracks.unknownTrack")}</em>}</td>
                  <td>{item.master_metadata_album_artist_name || <em>{t("topTracks.unknownArtist")}</em>}</td>
                  <td className="monospace">{item.count || 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showMoreModal} onClose={() => setShowMoreModal(false)}>
        <OneHitWonders limit={100} isModal={true} />
      </Modal>
    </>
  );
};
