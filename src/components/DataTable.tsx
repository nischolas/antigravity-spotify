import React, { useState, useMemo } from 'react';
import type { SpotifyHistoryItem } from '../types';

interface DataTableProps {
    data: SpotifyHistoryItem[];
}

type SortField = 'ts' | 'master_metadata_track_name' | 'master_metadata_album_artist_name' | 'ms_played';
type SortDirection = 'asc' | 'desc';

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
    const [sortField, setSortField] = useState<SortField>('ts');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc'); // Default to desc for new field (often better for dates/numbers)
        }
    };

    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => {
            let aValue: any = a[sortField];
            let bValue: any = b[sortField];

            // Handle nulls
            if (aValue === null) return 1;
            if (bValue === null) return -1;

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, sortField, sortDirection]);

    const formatMs = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const formatDate = (ts: string) => {
        return new Date(ts).toLocaleString();
    };

    return (
        <div className="table-container">
            <div className="table-stats">
                Total Records: {data.length}
            </div>
            <table>
                <thead>
                    <tr>
                        <th onClick={() => handleSort('ts')} className={sortField === 'ts' ? `sorted-${sortDirection}` : ''}>
                            Timestamp
                        </th>
                        <th onClick={() => handleSort('master_metadata_track_name')} className={sortField === 'master_metadata_track_name' ? `sorted-${sortDirection}` : ''}>
                            Track Name
                        </th>
                        <th onClick={() => handleSort('master_metadata_album_artist_name')} className={sortField === 'master_metadata_album_artist_name' ? `sorted-${sortDirection}` : ''}>
                            Artist
                        </th>
                        <th onClick={() => handleSort('ms_played')} className={sortField === 'ms_played' ? `sorted-${sortDirection}` : ''}>
                            Time Played
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((item, index) => (
                        <tr key={index}>
                            <td>{formatDate(item.ts)}</td>
                            <td>{item.master_metadata_track_name || <em>Unknown Track</em>}</td>
                            <td>{item.master_metadata_album_artist_name || <em>Unknown Artist</em>}</td>
                            <td>{formatMs(item.ms_played)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
