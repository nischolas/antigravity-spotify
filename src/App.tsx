import { useEffect } from "react";
import { FileUpload } from "./components/FileUpload";
import { FAQ } from "./components/FAQ";
import { TopTracks } from "./components/TopTracks";
import { TopArtists } from "./components/TopArtists";
import { SkippedTracks } from "./components/SkippedTracks";
import { DateRangeFilter } from "./components/DateRangeFilter";
import { ReasonStartTracks } from "./components/ReasonStartTracks";
import { Footer } from "./components/Footer";
import { useSpotifyStore } from "./store/useSpotifyStore";
import { useTranslation } from "react-i18next";

function App() {
  const { aggregatedData, reset } = useSpotifyStore();
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t("app.title");
  }, [t]);

  return (
    <div className="app-container">
      <main>
        {aggregatedData.length === 0 ? (
          <header className="app-header">
            <div>
              <h1>{t("app.title")}</h1>
              <p className="subtitle">{t("app.subtitle")}</p>
              <br />
              <div className="tutorial-section">
                <h3>{t("fileUpload.tutorialTitle")}</h3>
                <ol>
                  <li>
                    {t("fileUpload.tutorialStep1")}{" "}
                    <a href="https://www.spotify.com/account/privacy" target="_blank" rel="noopener noreferrer">
                      {t("fileUpload.tutorialStep1Link")}
                    </a>
                  </li>
                  <li>
                    {t("fileUpload.tutorialStep2")} <strong>{t("fileUpload.tutorialStep2Bold")}</strong>
                  </li>
                  <li>{t("fileUpload.tutorialStep3")}</li>
                  <li>{t("fileUpload.tutorialStep4")}</li>
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
                {t("app.uploadDifferent")}
              </button>
            </div>
            <DateRangeFilter />
            <div className="sections">
              <TopTracks />
              <TopArtists />
              <SkippedTracks />
              <ReasonStartTracks reason_start="clickrow" />
              <ReasonStartTracks reason_start="backbtn" />
            </div>
          </div>
        )}
        <FAQ />
      </main>

      <Footer />
    </div>
  );
}

export default App;
