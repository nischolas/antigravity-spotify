import { useSpotifyStore } from '../store/useSpotifyStore';
import { useMemo } from 'react';

export const TopArtists = () => {
    const { aggregatedData } = useSpotifyStore();

    const topArtists = useMemo(() => {
        const grouped = new Map<string, number>();

        aggregatedData.forEach(item => {
            const artist = item.master_metadata_album_artist_name || 'Unknown';
            const current = grouped.get(artist) || 0;
            grouped.set(artist, current + item.ms_played);
        });

        return Array.from(grouped.entries())
            .map(([artist, ms]) => ({
                artist,
                minutes: Math.round(ms / 60000)
            }))
            .sort((a, b) => b.minutes - a.minutes)
            .slice(0, 5);
    }, [aggregatedData]);

    return (
        <div className="table-container">
            <div className="title">
                <h3>Top Artists</h3>
                <p>by accumulated playtime</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Artist</th>
                        <th>Minutes</th>
                    </tr>
                </thead>
                <tbody>
                    {topArtists.map((artist, index) => (
                        <tr key={index}>
                            <td>{artist.artist}</td>
                            <td>{artist.minutes}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};