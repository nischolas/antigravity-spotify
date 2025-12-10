import React, { useMemo } from "react";
import { useSpotifyStore } from "../store/useSpotifyStore";
import { formatMsPlain } from "../utils/formatTime";
import { useTranslation } from "react-i18next";

export const TopTracks: React.FC = () => {
  const { aggregatedData } = useSpotifyStore();
  const { t } = useTranslation();

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
      .slice(0, 10);
  }, [aggregatedData]);

  return (
    <div className="table-container">
      <div className="title">
        <h3>{t("topTracks.title")}</h3>
        <p>{t("topTracks.subtitle")}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>{t("topTracks.headerTitle")}</th>
            <th>{t("topTracks.headerArtist")}</th>
            <th style={{ textAlign: "right" }}>
              {t("topTracks.headerTimePlayed")}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => {
            const url = `https://open.spotify.com/track/${item.spotify_track_uri?.replace(
              "spotify:track:",
              ""
            )}`;

            const { hours, minutes } = formatMsPlain(item.ms_played);

            return (
              <tr
                key={index}
                onClick={() => window.open(url, "_blank")}
                style={{ cursor: "pointer" }}
                title={t("topTracks.openInSpotify")}
              >
                <td>{index + 1}</td>
                <td>
                  {item.master_metadata_track_name || (
                    <em>{t("topTracks.unknownTrack")}</em>
                  )}
                </td>
                <td>
                  {item.master_metadata_album_artist_name || (
                    <em>{t("topTracks.unknownArtist")}</em>
                  )}
                </td>
                <td className="monospace">
                  {hours}
                  <span className="muted">h</span>{" "}
                  {minutes.toString().padStart(2, "0")}
                  <span className="muted">m</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
