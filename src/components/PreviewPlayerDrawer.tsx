import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

interface PreviewPlayerDrawerProps {
  trackUri: string | null;
  onClose: () => void;
}

export const PreviewPlayerDrawer: React.FC<PreviewPlayerDrawerProps> = ({ trackUri, onClose }) => {
  const { t } = useTranslation();

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
  const embedUrl = `https://open.spotify.com/embed/track/${trackId}`;
  const openUrl = `https://open.spotify.com/track/${trackId}`;

  return createPortal(
    <div className="preview-drawer">
      <div className="title-bar">
        {t("miniplayer.title")}
        <div className="title-bar-controls">
          <a className="preview-drawer-link" href={openUrl} target="_blank" rel="noopener noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>

            {t("common.openInSpotify", "Open in Spotify")}
          </a>
          <span className="preview-drawer-link">&nbsp;&nbsp;&nbsp;</span>
          <button className="preview-drawer-link" onClick={onClose} aria-label="Close player">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
            {t("common.close")}
          </button>
        </div>
      </div>
      <div className="iframe-wrapper">
        <iframe
          className="preview-drawer-iframe"
          src={embedUrl}
          width="100%"
          height="152"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </div>
    </div>,
    document.querySelector(".app-container") || document.body,
  );
};
