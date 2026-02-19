import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "./Modal";
import { PrivacyText } from "./PrivacyText";

export const Footer: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [showMoreModal, setShowMoreModal] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <>
      <footer className="app-footer">
        <div className="footer-content">
          <div className="language-selector">
            <button className={`lang-btn ${i18n.language === "en" ? "active" : ""}`} onClick={() => changeLanguage("en")} aria-label="Switch to English">
              🇬🇧 English
            </button>
            <button className={`lang-btn ${i18n.language === "de" ? "active" : ""}`} onClick={() => changeLanguage("de")} aria-label="Zu Deutsch wechseln">
              🇩🇪 Deutsch
            </button>
          </div>

          <p>{t("footer.privacy")}</p>

          <div style={{ textAlign: "center" }}>
            <span>{t("footer.by")}</span>{" "}
            <a href="https://nicholas-mathi.eu" target="_blank" rel="noopener noreferrer">
              Nicholas Mathieu
            </a>
            <br />
            <a href="https://nicholas-mathi.eu/impressum" target="_blank" rel="noopener noreferrer">
              {t("footer.legal")}
            </a>
            &nbsp;/&nbsp;
            <a onClick={() => setShowMoreModal(true)} target="_blank" rel="noopener noreferrer">
              {t("privacy.title")}
            </a>
            &nbsp;/&nbsp;
            <a href="https://github.com/nischolas/antigravity-spotify" target="_blank" rel="noopener noreferrer">
              Source
            </a>
          </div>
        </div>
      </footer>
      <Modal isOpen={showMoreModal} onClose={() => setShowMoreModal(false)}>
        <PrivacyText />
      </Modal>
    </>
  );
};
