import React, { useState } from 'react';
import JSZip from 'jszip';
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
        let ignoredCount = 0;

        const processJsonContent = (content: string, filename: string) => {
            try {
                const json = JSON.parse(content);
                if (Array.isArray(json)) {
                    allData.push(...json);
                }
            } catch (err) {
                console.error(`Error parsing file ${filename}:`, err);
            }
        };

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (file.name.endsWith('.zip')) {
                const zipPromise = new Promise<void>(async (resolve, reject) => {
                    try {
                        const zip = await JSZip.loadAsync(file);
                        const zipFilePromises: Promise<void>[] = [];

                        zip.forEach((relativePath, zipEntry) => {
                            if (zipEntry.dir) return;
                            const filename = relativePath.split('/').pop() || relativePath;

                            if (filename.startsWith('Streaming_History_Audio_') && filename.endsWith('.json')) {
                                const p = zipEntry.async('string').then((content) => {
                                    processJsonContent(content, filename);
                                });
                                zipFilePromises.push(p);
                            } else {
                                ignoredCount++;
                            }
                        });

                        await Promise.all(zipFilePromises);
                        resolve();
                    } catch (err) {
                        console.error(`Error reading zip file ${file.name}:`, err);
                        reject(err);
                    }
                });
                readers.push(zipPromise);
            } else if (file.name.startsWith('Streaming_History_Audio_') && file.name.endsWith('.json')) {
                const readerPromise = new Promise<void>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const text = e.target?.result as string;
                        processJsonContent(text, file.name);
                        resolve();
                    };
                    reader.onerror = () => reject(new Error(`Failed to read file ${file.name}`));
                    reader.readAsText(file);
                });
                readers.push(readerPromise);
            } else {
                ignoredCount++;
            }
        }

        try {
            await Promise.all(readers);

            if (allData.length === 0) {
                setError(`No valid data found. Uploaded files must be JSON files starting with "Streaming_History_Audio_" or ZIP archives containing them. Ignored ${ignoredCount} file(s)/entry(s).`);
                setIsLoading(false);
                return;
            }

            const aggregatedMap = new Map<string, SpotifyHistoryItem>();

            for (const item of allData) {
                const uri = item.spotify_track_uri;
                if (!uri) continue;

                if (aggregatedMap.has(uri)) {
                    const existing = aggregatedMap.get(uri)!;
                    existing.ms_played += item.ms_played;
                } else {
                    aggregatedMap.set(uri, {
                        ...item,
                        ms_played: item.ms_played
                    });
                }
            }

            const aggregatedResult = Array.from(aggregatedMap.values());

            if (aggregatedResult.length === 0) {
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
                {isLoading ? 'Processing...' : 'Upload Spotify History (JSON or ZIP)'}
            </label>
            <input
                id="file-upload"
                type="file"
                accept=".json,.zip"
                multiple
                onChange={handleFileChange}
                className="file-upload-input"
            />
            {error && <div className="error-message">{error}</div>}
            <p className="hint" style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                Select multiple JSON files or ZIP archives. Only JSON files starting with <code>Streaming_History_Audio_</code> are accepted.
            </p>
            <hr />
            <div style={{ marginBottom: '2rem', textAlign: 'left', maxWidth: '600px' }}>
                <h3 style={{ marginBottom: '1rem', color: '#fff' }}>How to Get Your Spotify Data</h3>
                <ol style={{ color: '#b3b3b3', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
                    <li>Go to <a href="https://www.spotify.com/account/privacy/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)' }}>Spotify Privacy Settings</a></li>
                    <li>Request your <strong>Extended Streaming History</strong></li>
                    <li>Wait for Spotify to email you (can take up to 30 days, but it's usually much faster)</li>
                    <li>Download the ZIP file from the email</li>
                </ol>
            </div>

        </div>
    );
};
