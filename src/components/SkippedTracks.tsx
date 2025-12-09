import { useSpotifyStore } from '../store/useSpotifyStore';
import { useMemo } from 'react';

export const SkippedTracks = () => {
    const { rawData } = useSpotifyStore();

    const skippedTracks = useMemo(() => {
        // Filter tracks that were played for less than 10 seconds (10000ms)
        const skipped = rawData.filter(item => item.ms_played < 10000);

        // Group by track to count skip occurrences
        const grouped = new Map<string, {
            trackName: string;
            artistName: string;
            skipCount: number;
            totalPlays: number;
            uri: string | null;
        }>();

        // Count total plays for each track
        rawData.forEach(item => {
            const key = item.spotify_track_uri || `${item.master_metadata_track_name}-${item.master_metadata_album_artist_name}`;
            const existing = grouped.get(key);

            if (existing) {
                existing.totalPlays++;
            } else {
                grouped.set(key, {
                    trackName: item.master_metadata_track_name || 'Unknown Track',
                    artistName: item.master_metadata_album_artist_name || 'Unknown Artist',
                    skipCount: 0,
                    totalPlays: 1,
                    uri: item.spotify_track_uri
                });
            }
        });

        // Count skips for each track
        skipped.forEach(item => {
            const key = item.spotify_track_uri || `${item.master_metadata_track_name}-${item.master_metadata_album_artist_name}`;
            const existing = grouped.get(key);

            if (existing) {
                existing.skipCount++;
            }
        });

        // Convert to array and sort by skip count
        return Array.from(grouped.values())
            .filter(item => item.skipCount > 0) // Only include tracks that were actually skipped
            .filter(item => item.trackName !== 'Unknown Track') // Exclude unknown tracks
            .sort((a, b) => b.skipCount - a.skipCount)
            .slice(0, 5); // Top 5 most skipped
    }, [rawData]);

    const getSpotifyUrl = (uri: string | null) => {
        if (!uri) return null;
        const trackId = uri.split(':')[2];
        return `https://open.spotify.com/track/${trackId}`;
    };

    return (
        <div className="table-container">
            <div className="title">
                <h3>Most Skipped Tracks</h3>
                <p>skipped before playing for 10 seconds</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Track</th>
                        <th>Artist</th>
                        <th>Skip Count</th>
                        <th>Total Plays</th>
                        <th>Skip Rate</th>
                    </tr>
                </thead>
                <tbody>
                    {skippedTracks.map((track, index) => {
                        const skipRate = ((track.skipCount / track.totalPlays) * 100).toFixed(1);
                        const spotifyUrl = getSpotifyUrl(track.uri);

                        return (
                            <tr key={index}
                                onClick={spotifyUrl ? () => window.open(spotifyUrl, '_blank') : undefined}
                                style={{ cursor: spotifyUrl ? 'pointer' : 'default' }}
                                title={spotifyUrl ? "Open in Spotify" : undefined}>
                                <td>{track.trackName}</td>
                                <td>{track.artistName}</td>
                                <td>{track.skipCount}</td>
                                <td>{track.totalPlays}</td>
                                <td>{skipRate}%</td>

                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
