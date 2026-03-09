import { useSpotifyStore } from "@/store/useSpotifyStore";
import { useMemo, useState } from "react";
import { formatMsPlain } from "@/utils/formatTime";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/Modal";
import { TopTracks } from "@/components/TopTracks";

interface TopArtistsProps {
  limit?: number;
  isModal?: boolean;
}

export const TopArtists: React.FC<TopArtistsProps> = ({ limit = 10, isModal = false }) => {
  const { aggregatedData } = useSpotifyStore();
  const { t } = useTranslation();
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const allArtists = useMemo(() => {
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
      .sort((a, b) => b.ms_played - a.ms_played);
  }, [aggregatedData, t]);

  const topArtists = useMemo(() => {
    const filtered = searchQuery ? allArtists.filter((a) => a.artist.toLowerCase().includes(searchQuery.toLowerCase())) : allArtists;
    return filtered.slice(0, limit);
  }, [allArtists, searchQuery, limit]);

  return (
    <>
      <div className="table-container">
        <div className="header-row">
          <div className="title">
            <h3>{t("topArtists.title")}</h3>
            <p>{t("topArtists.subtitle")}</p>
          </div>
          {isModal ? (
            <input type="search" placeholder={t("topArtists.search")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          ) : (
            <button className="reset-btn" onClick={() => setShowMoreModal(true)}>
              {t("topArtists.searchBtn")}
            </button>
          )}
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>{t("table.headerArtist")}</th>
              <th style={{ textAlign: "right" }}>{t("table.headerTimePlayed")}</th>
            </tr>
          </thead>
          <tbody>
            {topArtists.map((artist, index) => {
              const { hours, minutes } = formatMsPlain(artist.ms_played);

              return (
                <tr key={index} onClick={() => setSelectedArtist(artist.artist)} style={{ cursor: "pointer" }} title={t("topTracks.title")}>
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

      <Modal isOpen={selectedArtist !== null} onClose={() => setSelectedArtist(null)}>
        {selectedArtist && <TopTracks artistFilter={selectedArtist} isModal={true} limit={100} sortBy="time" />}
      </Modal>
    </>
  );
};
