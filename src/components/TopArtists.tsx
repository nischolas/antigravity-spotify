import { useSpotifyStore } from '../store/useSpotifyStore';
import { useMemo } from 'react';
import { formatMs } from '../utils/formatTime';
import { useTranslation } from 'react-i18next';

export const TopArtists = () => {
    const { aggregatedData } = useSpotifyStore();
    const { t } = useTranslation();

    const topArtists = useMemo(() => {
        const grouped = new Map<string, number>();

        aggregatedData.forEach(item => {
            const artist = item.master_metadata_album_artist_name || t('topArtists.unknown');
            const current = grouped.get(artist) || 0;
            grouped.set(artist, current + item.ms_played);
        });

        return Array.from(grouped.entries())
            .map(([artist, ms]) => ({
                artist,
                ms_played: ms
            }))
            .sort((a, b) => b.ms_played - a.ms_played)
            .slice(0, 10);
    }, [aggregatedData, t]);

    return (
        <div className="table-container">
            <div className="title">
                <h3>{t('topArtists.title')}</h3>
                <p>{t('topArtists.subtitle')}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>{t('topArtists.headerArtist')}</th>
                        <th style={{ textAlign: 'right' }}>{t('topArtists.headerTimePlayed')}</th>
                    </tr>
                </thead>
                <tbody>
                    {topArtists.map((artist, index) => (
                        <tr key={index}>
                            <td>{artist.artist}</td>
                            <td className="monospace">{formatMs(artist.ms_played)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};