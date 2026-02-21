import { useMemo } from 'react';
import { useSpotifyStore } from '../store/useSpotifyStore';
import { getTrackEntries, computeSkipProfile, computeContextProfile, computeLifetimeCurve } from '../utils/trackAnalytics';

export function useTrackAnalytics(trackUri: string | null) {
  const rawData = useSpotifyStore(s => s.rawData);
  return useMemo(() => {
    if (!trackUri || rawData.length === 0) return null;
    const entries = getTrackEntries(rawData, trackUri);
    if (entries.length === 0) return null;
    return {
      skip: computeSkipProfile(entries),
      context: computeContextProfile(entries),
      lifetime: computeLifetimeCurve(entries),
      entries,
    };
  }, [trackUri, rawData]);
}
