import React, { useState } from 'react';
import type { SpotifyHistoryItem } from '../types';

interface FileUploadProps {
    onDataLoaded: (data: SpotifyHistoryItem[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setError(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const json = JSON.parse(text);

                // Basic validation - check if it's an array
                if (!Array.isArray(json)) {
                    throw new Error('File content is not an array');
                }

                // You might want to add more robust validation here to check if items match the schema
                // For now, we assume the user uploads the correct format as per the prompt

                onDataLoaded(json as SpotifyHistoryItem[]);
            } catch (err) {
                setError('Failed to parse JSON file. Please ensure it is a valid Spotify History file.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        reader.onerror = () => {
            setError('Error reading file');
            setIsLoading(false);
        };

        reader.readAsText(file);
    };

    return (
        <div className="file-upload-container">
            <label htmlFor="file-upload" className="file-upload-label">
                {isLoading ? 'Parsing...' : 'Upload Spotify History JSON'}
            </label>
            <input
                id="file-upload"
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="file-upload-input"
            />
            {error && <div className="error-message">{error}</div>}
        </div>
    );
};
