import React, { useMemo } from 'react';
import { useSpotifyStore } from '../store/useSpotifyStore';
import { formatMs } from '../utils/formatTime';

export const DataTable: React.FC = () => {
    const { aggregatedData } = useSpotifyStore();

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
            .slice(0, 5);
    }, [aggregatedData]);

    return (
        <div className="table-container">
            <div className="title">
                <h3>Top Tracks</h3>
                <p>by accumulated playtime</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Artist</th>
                        <th>Time Played</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((item, index) => {
                        const url = `https://open.spotify.com/track/${item.spotify_track_uri?.replace('spotify:track:', '')}`;

                        return (
                            <tr
                                key={index}
                                onClick={() => window.open(url, '_blank')}
                                style={{ cursor: 'pointer' }}
                                title="Open in Spotify"
                            >
                                <td>{item.master_metadata_track_name || <em>Unknown Track</em>}</td>
                                <td>{item.master_metadata_album_artist_name || <em>Unknown Artist</em>}</td>
                                <td>{formatMs(item.ms_played)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
