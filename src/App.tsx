import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { DataTable } from './components/DataTable';
import type { SpotifyHistoryItem } from './types';
import './App.css';

function App() {
  const [historyData, setHistoryData] = useState<SpotifyHistoryItem[]>([]);

  const handleDataLoaded = (data: SpotifyHistoryItem[]) => {
    setHistoryData(data);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Spotify Streaming History</h1>
        <p className="subtitle">List your most listened songs <b><i>ever</i></b>. Everything stays in your browser, no data is sent to a server.</p>
      </header>

      <main>
        {historyData.length === 0 ? (
          <div className="upload-section">
            <FileUpload onDataLoaded={handleDataLoaded} />
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
