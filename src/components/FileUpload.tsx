import React, { useState } from 'react';
import type { SpotifyHistoryItem } from '../types';

interface FileUploadProps {
    onDataLoaded: (data: SpotifyHistoryItem[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setIsLoading(true);
        setError(null);

        const allData: SpotifyHistoryItem[] = [];
        const readers: Promise<void>[] = [];

        // Read all files
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const readerPromise = new Promise<void>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const text = e.target?.result as string;
                        const json = JSON.parse(text);
                        if (Array.isArray(json)) {
                            allData.push(...json);
                        }
                        resolve();
                    } catch (err) {
                        console.error(`Error parsing file ${file.name}:`, err);
                        // We continue even if one file fails, but you could reject here
                        resolve();
                    }
                };
                reader.onerror = () => reject(new Error(`Failed to read file ${file.name}`));
                reader.readAsText(file);
            });
            readers.push(readerPromise);
        }

        try {
            await Promise.all(readers);

            // Aggregation Logic
            const aggregatedMap = new Map<string, SpotifyHistoryItem>();

            for (const item of allData) {
                const uri = item.spotify_track_uri;
                if (!uri) continue;

                if (aggregatedMap.has(uri)) {
                    const existing = aggregatedMap.get(uri)!;
                    existing.ms_played += item.ms_played;
                } else {
                    // Create a new object to avoid mutating the original if needed, 
                    // though here we are creating a fresh aggregated list anyway.
                    // We keep the metadata from the first occurrence.
                    aggregatedMap.set(uri, {
                        ...item,
                        ms_played: item.ms_played
                    });
                }
            }

            const aggregatedResult = Array.from(aggregatedMap.values());

            if (aggregatedResult.length === 0 && allData.length > 0) {
                setError('No valid track data found to aggregate (missing spotify_track_uri).');
            } else {
                onDataLoaded(aggregatedResult);
            }

        } catch (err) {
            setError('Error processing files. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="file-upload-container">
            <label htmlFor="file-upload" className="file-upload-label">
                {isLoading ? 'Processing...' : 'Upload Spotify History JSON(s)'}
            </label>
            <input
                id="file-upload"
                type="file"
                accept=".json"
                multiple
                onChange={handleFileChange}
                className="file-upload-input"
            />
            {error && <div className="error-message">{error}</div>}
            <p className="hint" style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                Select multiple files to merge and aggregate play counts.
            </p>
        </div>
    );
};
