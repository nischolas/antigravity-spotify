import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSpotifyStore } from "../store/useSpotifyStore";

export const DataRecoveryPopup: React.FC = () => {
  const { t } = useTranslation();
  const { hasFoundData, restoreSession, discardSession, hasData, isLoading } = useSpotifyStore();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && hasFoundData && !hasData) {
        discardSession();
      }
    };

    if (hasFoundData && !hasData) {
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [hasFoundData, hasData, discardSession]);

  if (!hasFoundData || hasData) {
    return null;
  }

  return (
    <div className="popup-overlay" onClick={discardSession}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <h2>{t("popup.recoveryTitle")}</h2>
        <p>{t("popup.recoveryMessage")}</p>
        <div className="popup-actions">
          <button disabled={isLoading} className={isLoading ? "primary-btn disabled" : "primary-btn"} onClick={restoreSession}>
            {isLoading ? t("fileImport.processing") : t("popup.loadBtn")}
          </button>
          <button disabled={isLoading} className={isLoading ? "secondary-btn disabled" : "secondary-btn"} onClick={discardSession}>
            {t("popup.discardBtn")}
          </button>
        </div>
      </div>
    </div>
  );
};
