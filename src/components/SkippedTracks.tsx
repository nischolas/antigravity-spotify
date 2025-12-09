import { useSpotifyStore } from '../store/useSpotifyStore';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const SkippedTracks = () => {
    const { rawData } = useSpotifyStore();
    const { t } = useTranslation();

    const CUTOFF = 10000;

    const skippedTracks = useMemo(() => {
        const skipped = rawData.filter(item => item.ms_played < CUTOFF);

        const grouped = new Map<string, {
            trackName: string;
            artistName: string;
            skipCount: number;
            totalPlays: number;
            uri: string | null;
        }>();

        rawData.forEach(item => {
            const key = item.spotify_track_uri || `${item.master_metadata_track_name}-${item.master_metadata_album_artist_name}`;
            const existing = grouped.get(key);

            if (existing) {
                existing.totalPlays++;
            } else {
                grouped.set(key, {
                    trackName: item.master_metadata_track_name || t('skippedTracks.unknownTrack'),
                    artistName: item.master_metadata_album_artist_name || t('skippedTracks.unknownArtist'),
                    skipCount: 0,
                    totalPlays: 1,
                    uri: item.spotify_track_uri
                });
            }
        });

        skipped.forEach(item => {
            const key = item.spotify_track_uri || `${item.master_metadata_track_name}-${item.master_metadata_album_artist_name}`;
            const existing = grouped.get(key);

            if (existing) {
                existing.skipCount++;
            }
        });

        return Array.from(grouped.values())
            .filter(item => item.skipCount > 0)
            .filter(item => item.trackName !== t('skippedTracks.unknownTrack'))
            .sort((a, b) => b.skipCount - a.skipCount)
            .slice(0, 10);
    }, [rawData, t]);

    const getSpotifyUrl = (uri: string | null) => {
        if (!uri) return null;
        const trackId = uri.split(':')[2];
        return `https://open.spotify.com/track/${trackId}`;
    };

    return (
        <div className="table-container">
            <div className="title">
                <h3>{t('skippedTracks.title')}</h3>
                <p>{t('skippedTracks.subtitle', { seconds: CUTOFF / 1000 })}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>{t('skippedTracks.headerTrack')}</th>
                        <th>{t('skippedTracks.headerArtist')}</th>
                        <th>{t('skippedTracks.headerSkipCount')}</th>
                        <th>{t('skippedTracks.headerTotalPlays')}</th>
                        <th style={{ textAlign: 'right' }}>{t('skippedTracks.headerSkipRate')}</th>
                    </tr>
                </thead>
                <tbody>
                    {skippedTracks.map((track, index) => {
                        const skipRate = ((track.skipCount / track.totalPlays) * 100).toFixed(0);
                        const spotifyUrl = getSpotifyUrl(track.uri);

                        return (
                            <tr key={index}
                                onClick={spotifyUrl ? () => window.open(spotifyUrl, '_blank') : undefined}
                                style={{ cursor: spotifyUrl ? 'pointer' : 'default' }}
                                title={spotifyUrl ? t('skippedTracks.openInSpotify') : undefined}>
                                <td>{index + 1}</td>
                                <td>{track.trackName}</td>
                                <td>{track.artistName}</td>
                                <td>{track.skipCount}</td>
                                <td>{track.totalPlays}</td>
                                <td style={{ textAlign: 'right' }}>{skipRate}<span className="muted">%</span></td>

                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
