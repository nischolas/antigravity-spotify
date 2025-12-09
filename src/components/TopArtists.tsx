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
                ms_played: ms
            }))
            .sort((a, b) => b.ms_played - a.ms_played)
            .slice(0, 5);
    }, [aggregatedData]);

    const formatMs = (ms: number) => {
        const totalMinutes = Math.floor(ms / 1000 / 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        return `${hours.toString().padStart(2, '0')}h ${minutes
            .toString()
            .padStart(2, '0')}m`;
    };


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
                        <th>Time Played</th>
                    </tr>
                </thead>
                <tbody>
                    {topArtists.map((artist, index) => (
                        <tr key={index}>
                            <td>{artist.artist}</td>
                            <td>{formatMs(artist.ms_played)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};