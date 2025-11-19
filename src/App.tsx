import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { DataTable } from './components/DataTable';
import type { SpotifyHistoryItem } from './types';
import './App.css'; // We'll leave this but rely mostly on index.css

function App() {
  const [historyData, setHistoryData] = useState<SpotifyHistoryItem[]>([]);

  const handleDataLoaded = (data: SpotifyHistoryItem[]) => {
    setHistoryData(data);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Spotify History Visualizer</h1>
        <p className="subtitle">Explore your extended streaming history</p>
      </header>

      <main>
        {historyData.length === 0 ? (
          <div className="upload-section">
            <FileUpload onDataLoaded={handleDataLoaded} />
            <p className="hint">Upload your <code>Streaming_History_Audio_*.json</code> file</p>
          </div>
        ) : (
          <div className="data-section">
            <div className="actions">
              <button onClick={() => setHistoryData([])} className="reset-btn">
                Upload Different File
              </button>
            </div>
            <DataTable data={historyData} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
