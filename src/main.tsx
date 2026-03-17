import { StrictMode } from "react";

if (import.meta.env.PROD) {
  const s = document.createElement("script");
  s.src = "https://umami.nicholas-mathi.eu/script.js";
  s.dataset.websiteId = "b9e87674-b6ce-4b71-8728-d53ebdaff2d3";
  document.head.appendChild(s);
}
import { createRoot } from "react-dom/client";
import "@/index.scss";
import "@/i18n/i18n";
import App from "@/App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
