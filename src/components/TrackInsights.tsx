import React from 'react';
import { useTrackAnalytics } from '../hooks/useTrackAnalytics';
import { LifetimeCurvePanel } from './LifetimeCurvePanel';

interface Props {
  trackUri: string | null;
}

export const TrackInsights: React.FC<Props> = ({ trackUri }) => {
  const analytics = useTrackAnalytics(trackUri);
  if (!analytics) return null;

  return (
    <div className="track-insights">
      <LifetimeCurvePanel
        data={analytics.lifetime}
        totalPlays={analytics.skip.totalPlays}
        skipRate={analytics.skip.skipRate}
      />
    </div>
  );
};
