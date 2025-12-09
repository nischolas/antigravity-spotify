import React, { useState, useMemo } from 'react';
import { useSpotifyStore } from '../store/useSpotifyStore';

type SortField = 'master_metadata_track_name' | 'master_metadata_album_artist_name' | 'ms_played';
type SortDirection = 'asc' | 'desc';

export const DataTable: React.FC = () => {
    const { aggregatedData } = useSpotifyStore();
    console.log(aggregatedData);
    const [sortField, setSortField] = useState<SortField>('ms_played');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [minPlaytimeMinutes, setMinPlaytimeMinutes] = useState<number>(10);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const filteredData = useMemo(() => {
        return aggregatedData.filter(item => item.ms_played >= minPlaytimeMinutes * 60 * 1000);
    }, [aggregatedData, minPlaytimeMinutes]);

    const sortedData = useMemo(() => {
        return [...filteredData].sort((a, b) => {
            let aValue: any = a[sortField];
            let bValue: any = b[sortField];

            if (aValue === undefined || aValue === null) return 1;
            if (bValue === undefined || bValue === null) return -1;

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        }).slice(0, 5);
    }, [filteredData, sortField, sortDirection]);

    const formatMs = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const hiddenCount = aggregatedData.length - filteredData.length;

    return (
        <div className="table-container">
            <div className="table-stats">
                <div>
                    <span>Total Records: {aggregatedData.length}</span>
                    {hiddenCount > 0 && <span className="hidden-count">(Hidden by filter: {hiddenCount})</span>}
                </div>
                <div className="filter-controls">
                    <label htmlFor="min-playtime">Filter by min playtime (minutes):</label>
                    <input
                        id="min-playtime"
                        type="number"
                        value={minPlaytimeMinutes}
                        onChange={(e) => setMinPlaytimeMinutes(Number(e.target.value))}
                        className="filter-input"
                    />
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th onClick={() => handleSort('master_metadata_track_name')} className={sortField === 'master_metadata_track_name' ? `sorted-${sortDirection}` : ''}>
                            Track Name
                        </th>
                        <th onClick={() => handleSort('master_metadata_album_artist_name')} className={sortField === 'master_metadata_album_artist_name' ? `sorted-${sortDirection}` : ''}>
                            Artist
                        </th>
                        <th>

                        </th>
                        <th onClick={() => handleSort('ms_played')} className={sortField === 'ms_played' ? `sorted-${sortDirection}` : ''}>
                            Time Played
                        </th>

                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((item, index) => (
                        <tr key={index}>
                            <td>{item.master_metadata_track_name || <em>Unknown Track</em>}</td>
                            <td>{item.master_metadata_album_artist_name || <em>Unknown Artist</em>}</td>
                            <td>
                                {item.spotify_track_uri && (
                                    <a
                                        href={`https://open.spotify.com/track/${item.spotify_track_uri.replace('spotify:track:', '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="spotify-link"
                                        title="Open in Spotify"
                                    >
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                            <polyline points="15 3 21 3 21 9"></polyline>
                                            <line x1="10" y1="14" x2="21" y2="3"></line>
                                        </svg>
                                    </a>
                                )}
                            </td>
                            <td>{formatMs(item.ms_played)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
