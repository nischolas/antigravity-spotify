import React, { useState, useMemo } from 'react';
import type { SpotifyHistoryItem } from '../types';

interface DataTableProps {
    data: SpotifyHistoryItem[];
}

type SortField = 'master_metadata_track_name' | 'master_metadata_album_artist_name' | 'ms_played';
type SortDirection = 'asc' | 'desc';

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
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
        return data.filter(item => item.ms_played >= minPlaytimeMinutes * 60 * 1000);
    }, [data, minPlaytimeMinutes]);

    const sortedData = useMemo(() => {
        return [...filteredData].sort((a, b) => {
            let aValue: any = a[sortField];
            let bValue: any = b[sortField];

            // Handle undefined/nulls
            if (aValue === undefined || aValue === null) return 1;
            if (bValue === undefined || bValue === null) return -1;

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortField, sortDirection]);

    const formatMs = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const hiddenCount = data.length - filteredData.length;

    return (
        <div className="table-container">
            <div className="table-stats" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <span>Total Records: {data.length}</span>
                    {hiddenCount > 0 && <span style={{ marginLeft: '1rem', color: '#b3b3b3' }}>(Hidden items: {hiddenCount})</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label htmlFor="min-playtime" style={{ fontSize: '0.9rem', color: '#b3b3b3' }}>Min Playtime (min):</label>
                    <input
                        id="min-playtime"
                        type="number"
                        value={minPlaytimeMinutes}
                        onChange={(e) => setMinPlaytimeMinutes(Number(e.target.value))}
                        style={{
                            background: '#2a2a2a',
                            border: '1px solid #333',
                            color: '#fff',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            width: '60px'
                        }}
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
                            <td><a href={`https://open.spotify.com/intl-de/track/${item.spotify_track_uri?.replace('spotify:track:', '')}`} target="_blank">Link</a></td>
                            <td>{formatMs(item.ms_played)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
