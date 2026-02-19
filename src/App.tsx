import { useEffect } from "react";
import { FileUpload } from "./components/FileUpload";
import { FAQ } from "./components/FAQ";
import { TopTracks } from "./components/TopTracks";
import { TopTracksByYear } from "./components/TopTracksByYear";
import { TopArtists } from "./components/TopArtists";
import { SkippedTracks } from "./components/SkippedTracks";
import { DateRangeFilter } from "./components/DateRangeFilter";
import { ReasonStartTracks } from "./components/ReasonStartTracks";
import { Footer } from "./components/Footer";
import { useSpotifyStore } from "./store/useSpotifyStore";
import { useTranslation } from "react-i18next";
import { GeneralStats } from "./components/GeneralStats";
import { OneHitWonders } from "./components/OneHitWonders";
import { DataRecoveryPopup } from "./components/DataRecoveryPopup";
import { PreviewPlayerDrawer } from "./components/PreviewPlayerDrawer";
import { usePreviewPlayer } from "./hooks/usePreviewPlayer.ts";

function App() {
  const { hasData, reset, initialize } = useSpotifyStore();
  const { trackUri, closePlayer } = usePreviewPlayer();
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t("app.title");
  }, [t]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="app-container">
      <DataRecoveryPopup />
      <main>
        {!hasData ? (
          <header className="app-header">
            <div>
              <h1>{t("app.title")}</h1>
              <p className="subtitle">{t("app.subtitle")}</p>
              <br />
              <div className="tutorial-section">
                <h3>{t("fileImport.tutorialTitle")}</h3>
                <ol>
                  <li>
                    {t("fileImport.tutorialStep1")}{" "}
                    <a href="https://www.spotify.com/account/privacy" target="_blank" rel="noopener noreferrer">
                      {t("fileImport.tutorialStep1Link")}
                    </a>
                  </li>
                  <li>
                    {t("fileImport.tutorialStep2")} <strong>{t("fileImport.tutorialStep2Bold")}</strong> <br /> {t("fileImport.tutorialStep2End")}
                  </li>
                  <li>{t("fileImport.tutorialStep3")}</li>
                  <li>{t("fileImport.tutorialStep4")}</li>
                </ol>
              </div>
            </div>
            <div className="upload-section">
              <FileUpload />
            </div>
          </header>
        ) : (
          <div className="data-section">
            <div className="actions">
              <h1>{t("app.title")}</h1>
              <button onClick={reset} className="reset-btn">
                {t("app.importDifferent")}
              </button>
            </div>
            <DateRangeFilter />
            <div className="sections">
              <GeneralStats />
              <TopTracks />
              <TopTracksByYear />
              <TopArtists />
              <SkippedTracks />
              <ReasonStartTracks reason_start="clickrow" />
              <ReasonStartTracks reason_start="backbtn" />
              <OneHitWonders />
            </div>
          </div>
        )}
        <FAQ />
      </main>

      <PreviewPlayerDrawer trackUri={trackUri} onClose={closePlayer} />
      <Footer />
    </div>
  );
}

export default App;
