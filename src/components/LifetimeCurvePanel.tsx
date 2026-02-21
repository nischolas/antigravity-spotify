import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { LifetimeCurve } from '../utils/trackAnalytics';

const PRIMARY = '#1db954';
const TEXT_SECONDARY = '#b3b3b3';
const BORDER = '#333333';

interface Props {
  data: LifetimeCurve;
  totalPlays: number;
  skipRate: number;
}

export const LifetimeCurvePanel: React.FC<Props> = ({ data, totalPlays, skipRate }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);

  const { curve, milestones, firstPlay, lastPlay, peakYear, totalHours } = data;

  if (curve.length === 0) return null;

  const fmtHours = (h: number) => h >= 1 ? `${h.toFixed(1)}h` : `${Math.round(h * 60)}m`;

  // Thin out the curve for performance if very long
  const displayCurve = curve.length > 200
    ? curve.filter((_, i) => i % Math.ceil(curve.length / 200) === 0 || i === curve.length - 1)
    : curve;

  return (
    <div className="insight-panel">
      <button className="insight-panel-header" onClick={() => setOpen(o => !o)}>
        <span>{t('trackInsights.lifetime.title')}</span>
        <span className={`chevron ${open ? 'open' : ''}`}>›</span>
      </button>
      {open && (
        <div className="insight-panel-body">
          <div className="kpi-cards">
            <div className="kpi-card">
              <div className="kpi-value">{totalPlays}</div>
              <div className="kpi-label">{t('trackInsights.skipBehavior.totalPlays')}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value" style={{ color: skipRate > 0.5 ? '#e25c5c' : PRIMARY }}>
                {Math.round(skipRate * 100)}%
              </div>
              <div className="kpi-label">{t('trackInsights.skipBehavior.skipRate')}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value">{fmtHours(totalHours)}</div>
              <div className="kpi-label">{t('trackInsights.lifetime.totalHours')}</div>
            </div>
            {firstPlay && (
              <div className="kpi-card">
                <div className="kpi-value">{firstPlay}</div>
                <div className="kpi-label">{t('trackInsights.lifetime.firstPlay')}</div>
              </div>
            )}
            {lastPlay && (
              <div className="kpi-card">
                <div className="kpi-value">{lastPlay}</div>
                <div className="kpi-label">{t('trackInsights.lifetime.lastPlay')}</div>
              </div>
            )}
            {peakYear && (
              <div className="kpi-card">
                <div className="kpi-value">{peakYear}</div>
                <div className="kpi-label">{t('trackInsights.lifetime.peakYear')}</div>
              </div>
            )}
          </div>

          <div className="chart-block">
            <div className="chart-label">{t('trackInsights.lifetime.cumulativeHours')}</div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={displayCurve} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
                <XAxis
                  dataKey="date"
                  tick={{ fill: TEXT_SECONDARY, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  tickFormatter={v => v.slice(0, 7)}
                />
                <YAxis
                  tick={{ fill: TEXT_SECONDARY, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={fmtHours}
                />
                <Tooltip
                  formatter={(v: number | undefined) => [fmtHours(v ?? 0), t('trackInsights.lifetime.cumulativeHours')]}
                  contentStyle={{ background: '#1e1e1e', border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 12 }}
                  labelStyle={{ color: TEXT_SECONDARY }}
                />
                {milestones.p25 && (
                  <ReferenceLine x={milestones.p25} stroke="#535353" strokeDasharray="3 3" label={{ value: '25%', fill: TEXT_SECONDARY, fontSize: 10 }} />
                )}
                {milestones.p50 && (
                  <ReferenceLine x={milestones.p50} stroke="#888" strokeDasharray="3 3" label={{ value: '50%', fill: TEXT_SECONDARY, fontSize: 10 }} />
                )}
                {milestones.p75 && (
                  <ReferenceLine x={milestones.p75} stroke="#aaa" strokeDasharray="3 3" label={{ value: '75%', fill: TEXT_SECONDARY, fontSize: 10 }} />
                )}
                <Line
                  type="monotone"
                  dataKey="cumulativeHours"
                  stroke={PRIMARY}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: PRIMARY }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
