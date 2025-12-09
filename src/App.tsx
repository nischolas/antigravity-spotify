import { FileUpload } from './components/FileUpload';
import { TopTracks } from './components/TopTracks';
import { TopArtists } from './components/TopArtists';
import { SkippedTracks } from './components/SkippedTracks';
import { DateRangeFilter } from './components/DateRangeFilter';
import { Footer } from './components/Footer';
import { useSpotifyStore } from './store/useSpotifyStore';
import { useTranslation } from 'react-i18next';

function App() {
  const { aggregatedData, reset } = useSpotifyStore();
  const { t } = useTranslation();

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>{t('app.title')}</h1>
        <p className="subtitle">{t('app.subtitle')}</p>
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
                {t('app.uploadDifferent')}
              </button>
            </div>
            <DateRangeFilter />
            <div className="sections">
              <TopTracks />
              <TopArtists />
              <SkippedTracks />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;

