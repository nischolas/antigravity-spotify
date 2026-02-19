import { useEffect, useRef } from "react";

interface SpotifyController {
  loadUri: (uri: string) => void;
  play: () => void;
  pause: () => void;
  destroy: () => void;
}

interface SpotifyIframeApi {
  createController: (
    element: HTMLElement,
    options: { uri: string; width: string | number; height: string | number },
    callback: (controller: SpotifyController) => void,
  ) => void;
}

declare global {
  interface Window {
    SpotifyIframeApi?: SpotifyIframeApi;
    onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
  }
}

let apiPromise: Promise<SpotifyIframeApi> | null = null;

function loadSpotifyIframeApi(): Promise<SpotifyIframeApi> {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    window.onSpotifyIframeApiReady = (api) => resolve(api);
    const script = document.createElement("script");
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    document.head.appendChild(script);
  });
  return apiPromise;
}

export function useSpotifyEmbedPlayer(
  containerRef: React.RefObject<HTMLDivElement | null>,
  { uri, autoplay }: { uri: string | null; autoplay: boolean },
) {
  const controllerRef = useRef<SpotifyController | null>(null);

  useEffect(() => {
    if (!uri || !containerRef.current) {
      if (!uri) {
        controllerRef.current?.destroy();
        controllerRef.current = null;
      }
      return;
    }
    let cancelled = false;

    const container = containerRef.current;

    if (controllerRef.current) {
      controllerRef.current.loadUri(uri);
      if (autoplay) controllerRef.current.play();
      return;
    }

    loadSpotifyIframeApi().then((api) => {
      if (cancelled || !container) return;
      api.createController(container, { uri, width: "100%", height: 152 }, (controller) => {
        if (cancelled) {
          controller.destroy();
          return;
        }
        controllerRef.current = controller;
        if (autoplay) controller.play();
      });
    });

    return () => {
      cancelled = true;
    };
  }, [uri, autoplay, containerRef]);

  useEffect(() => {
    return () => {
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, []);

  return {
    play: () => controllerRef.current?.play(),
    pause: () => controllerRef.current?.pause(),
    load: (newUri: string) => controllerRef.current?.loadUri(newUri),
  };
}
