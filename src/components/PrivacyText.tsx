import React from "react";
import { useTranslation } from "react-i18next";

export const PrivacyText: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section style={{ padding: "1.4rem" }}>
      <h2>{t("privacy.title")}</h2>

      <h3>{t("privacy.controller.title")}</h3>
      <p>
        {t("privacy.controller.name")}
        <br />
        {t("privacy.controller.address")}
        <br />
        {t("privacy.controller.email")}
      </p>

      <hr />

      <h3>{t("privacy.general.title")}</h3>
      <p>{t("privacy.general.localProcessing")}</p>
      <p>{t("privacy.general.hostingData")}</p>
      <p>{t("privacy.general.legalBasis")}</p>

      <hr />

      <h3>{t("privacy.spotify.title")}</h3>
      <p>{t("privacy.spotify.description")}</p>
      <p>{t("privacy.spotify.loadCondition")}</p>
      <p>{t("privacy.spotify.dataTransfer")}</p>
      <p>{t("privacy.spotify.responsibility")}</p>
      <p>
        {t("privacy.spotify.moreInfo")}{" "}
        <a style={{ color: "white" }} href="https://www.spotify.com/legal/privacy-policy/" target="_blank" rel="noopener noreferrer">
          {t("privacy.spotify.privacyLinkLabel")}
        </a>
      </p>
      <p>{t("privacy.spotify.legalBasis")}</p>
      <p>{t("privacy.spotify.thirdCountry")}</p>

      <hr />

      <h3>{t("privacy.rights.title")}</h3>
      <p>{t("privacy.rights.description")}</p>
      <p>{t("privacy.rights.complaint")}</p>
    </section>
  );
};
