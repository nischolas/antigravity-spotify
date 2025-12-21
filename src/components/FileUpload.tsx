import React, { useState } from "react";
import JSZip from "jszip";
import type { SpotifyHistoryItem } from "../types";
import { useSpotifyStore } from "../store/useSpotifyStore";
import { useTranslation } from "react-i18next";
import { isMobile } from "../utils/isMobile";

export const FileUpload: React.FC = () => {
  const { loadData } = useSpotifyStore();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    setError(null);

    // Use a mutable array but be careful with memory.
    // Ideally we process and pass to store, but store needs all of it.
    let allData: SpotifyHistoryItem[] = [];
    const readers: Promise<void>[] = [];
    let ignoredCount = 0;

    const processJsonContent = (content: string, filename: string) => {
      try {
        const json = JSON.parse(content);
        if (Array.isArray(json)) {
          allData.push(...json);
        }
      } catch (err) {
        console.error(`Error parsing file ${filename}:`, err);
      }
    };

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.name.endsWith(".zip")) {
        const zipPromise = new Promise<void>(async (resolve, reject) => {
          try {
            const zip = await JSZip.loadAsync(file);
            const zipFilePromises: Promise<void>[] = [];

            zip.forEach((relativePath, zipEntry) => {
              if (zipEntry.dir) return;
              const filename = relativePath.split("/").pop() || relativePath;

              if (filename.startsWith("Streaming_History_Audio_") && filename.endsWith(".json")) {
                const p = zipEntry.async("string").then((content) => {
                  processJsonContent(content, filename);
                });
                zipFilePromises.push(p);
              } else {
                ignoredCount++;
              }
            });

            await Promise.all(zipFilePromises);
            resolve();
          } catch (err) {
            console.error(`Error reading zip file ${file.name}:`, err);
            reject(err);
          }
        });
        readers.push(zipPromise);
      } else if (file.name.startsWith("Streaming_History_Audio_") && file.name.endsWith(".json")) {
        const readerPromise = new Promise<void>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const text = e.target?.result as string;
            processJsonContent(text, file.name);
            resolve();
          };
          reader.onerror = () => reject(new Error(`Failed to read file ${file.name}`));
          reader.readAsText(file);
        });
        readers.push(readerPromise);
      } else {
        ignoredCount++;
      }
    }

    try {
      await Promise.all(readers);

      if (allData.length === 0) {
        setError(t("fileImport.errorNoData", { count: ignoredCount }));
        setIsLoading(false);
        return;
      }

      loadData(allData);
    } catch (err) {
      setError(t("fileImport.errorProcessing"));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`file-upload-container ${isLoading ? "disabled" : ""}`}>
      <label htmlFor="file-upload" className="file-upload-label">
        {isLoading ? t("fileImport.processing") : t("fileImport.importButton")}
      </label>
      <input disabled={isLoading} id="file-upload" type="file" accept=".json,.zip" multiple onChange={handleFileChange} className="file-upload-input" />
      {error && <div className="error-message">{error}</div>}
      {isMobile && <p className="warning-message">{t("fileImport.mobileWarning")}</p>}
      <p className="hint">{t("fileImport.hint")}</p>
    </div>
  );
};
