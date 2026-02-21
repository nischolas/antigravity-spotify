import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useSpotifyEmbedPlayer } from "../hooks/useSpotifyEmbedPlayer";
import { TrackInsights } from "./TrackInsights";

interface PreviewPlayerDrawerProps {
  trackUri: string | null;
  onClose: () => void;
}

export const PreviewPlayerDrawer: React.FC<PreviewPlayerDrawerProps> = ({ trackUri, onClose }) => {
  const { t } = useTranslation();
  const [hasConsented, setHasConsented] = useState<boolean>(() => document.cookie.includes("spotify_preview_consent=1"));
  const containerRef = useRef<HTMLDivElement>(null);
  useSpotifyEmbedPlayer(containerRef, { uri: hasConsented ? trackUri : null, autoplay: true });

  const handleConsent = () => {
    document.cookie = "spotify_preview_consent=1; max-age=31536000; path=/; SameSite=Lax";
    setHasConsented(true);
  };

  useEffect(() => {
    if (!trackUri) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [trackUri, onClose]);

  if (!trackUri) return null;

  const trackId = trackUri.replace("spotify:track:", "");
  const openUrl = `https://open.spotify.com/track/${trackId}`;

  return createPortal(
    <div className="preview-drawer">
      <div className="title-bar">
        {t("miniplayer.title")}
        <div className="title-bar-controls">
          <a className="preview-drawer-link" href={openUrl} target="_blank" rel="noopener noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>{" "}
            {t("common.openInSpotify", "Open in Spotify")}
          </a>
          <span>&nbsp;&nbsp;</span>
          <button className="preview-drawer-link" onClick={onClose} aria-label="Close player">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>{" "}
            {t("common.close")}
          </button>
        </div>
      </div>
      <TrackInsights trackUri={trackUri} />
      <div className="iframe-wrapper">
        {hasConsented ? (
          <div ref={containerRef} />
        ) : (
          <div className="consent-gate">
            <p>{t("miniplayer.consentText")}</p>
            <button className="lang-btn active" onClick={handleConsent}>
              {t("miniplayer.consentButton")}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.querySelector(".app-container") || document.body,
  );
};
