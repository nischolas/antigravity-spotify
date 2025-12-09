import { FileUpload } from './components/FileUpload';
import { TopTracks } from './components/TopTracks';
import { TopArtists } from './components/TopArtists';
import { SkippedTracks } from './components/SkippedTracks';
import { useSpotifyStore } from './store/useSpotifyStore';

function App() {
  const { aggregatedData, reset } = useSpotifyStore();

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Your streaming history visualized</h1>
        <p className="subtitle">Everything stays in your browser, no data is sent to a server.</p>
      </header>

      <main>
        {aggregatedData.length === 0 ? (
          <div className="upload-section">
            <FileUpload />
          </div>
        ) : (
          <div className="data-section">
            <div className="actions">
              <button onClick={reset} className="reset-btn">
                Upload Different File
              </button>
            </div>
            <div className="sections">
              <TopTracks />
              <TopArtists />
              <SkippedTracks />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
