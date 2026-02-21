import type { SpotifyHistoryItem } from '../types';

export function getTrackEntries(rawData: SpotifyHistoryItem[], trackUri: string): SpotifyHistoryItem[] {
  return rawData.filter(e => e.spotify_track_uri === trackUri);
}

export interface SkipProfile {
  totalPlays: number;
  skipCount: number;
  skipRate: number;
  avgMsSkipped: number;
  avgMsNotSkipped: number;
  reasonEndBreakdown: { reason: string; count: number }[];
  skipRateByYear: { year: string; skipRate: number; total: number }[];
}

const SKIP_CUTOFF = 10000;

export function computeSkipProfile(entries: SpotifyHistoryItem[]): SkipProfile {
  const totalPlays = entries.length;
  const skipped = entries.filter(e => e.ms_played < SKIP_CUTOFF);
  const notSkipped = entries.filter(e => e.ms_played >= SKIP_CUTOFF);
  const skipCount = skipped.length;
  const skipRate = totalPlays > 0 ? skipCount / totalPlays : 0;
  const avgMsSkipped = skipped.length > 0 ? skipped.reduce((s, e) => s + e.ms_played, 0) / skipped.length : 0;
  const avgMsNotSkipped = notSkipped.length > 0 ? notSkipped.reduce((s, e) => s + e.ms_played, 0) / notSkipped.length : 0;

  const reasonMap = new Map<string, number>();
  for (const e of entries) {
    const r = e.reason_end || 'unknown';
    reasonMap.set(r, (reasonMap.get(r) || 0) + 1);
  }
  const reasonEndBreakdown = Array.from(reasonMap.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);

  const yearMap = new Map<string, { skip: number; total: number }>();
  for (const e of entries) {
    const year = new Date(e.ts).getFullYear().toString();
    const prev = yearMap.get(year) || { skip: 0, total: 0 };
    yearMap.set(year, { skip: prev.skip + (e.ms_played < SKIP_CUTOFF ? 1 : 0), total: prev.total + 1 });
  }
  const skipRateByYear = Array.from(yearMap.entries())
    .map(([year, { skip, total }]) => ({ year, skipRate: total > 0 ? skip / total : 0, total }))
    .sort((a, b) => a.year.localeCompare(b.year));

  return { totalPlays, skipCount, skipRate, avgMsSkipped, avgMsNotSkipped, reasonEndBreakdown, skipRateByYear };
}

export interface ContextProfile {
  shuffleRatio: number;
  reasonStartBreakdown: { reason: string; count: number }[];
  platformBreakdown: { platform: string; count: number }[];
  manualRatio: number;
  manualVsAutoByYear: { year: string; manual: number; auto: number }[];
}

const MANUAL_REASONS = ['clickrow', 'playbtn'];

export function computeContextProfile(entries: SpotifyHistoryItem[]): ContextProfile {
  const total = entries.length;
  const shuffleCount = entries.filter(e => e.shuffle === true).length;
  const shuffleRatio = total > 0 ? shuffleCount / total : 0;
  const manualCount = entries.filter(e => MANUAL_REASONS.includes(e.reason_start || '')).length;
  const manualRatio = total > 0 ? manualCount / total : 0;

  const rsMap = new Map<string, number>();
  for (const e of entries) {
    const r = e.reason_start || 'unknown';
    rsMap.set(r, (rsMap.get(r) || 0) + 1);
  }
  const reasonStartBreakdown = Array.from(rsMap.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);

  const platMap = new Map<string, number>();
  for (const e of entries) {
    const p = e.platform || 'unknown';
    platMap.set(p, (platMap.get(p) || 0) + 1);
  }
  const platformBreakdown = Array.from(platMap.entries())
    .map(([platform, count]) => ({ platform, count }))
    .sort((a, b) => b.count - a.count);

  const yearMap = new Map<string, { manual: number; auto: number }>();
  for (const e of entries) {
    const year = new Date(e.ts).getFullYear().toString();
    const prev = yearMap.get(year) || { manual: 0, auto: 0 };
    const isManual = MANUAL_REASONS.includes(e.reason_start || '');
    yearMap.set(year, { manual: prev.manual + (isManual ? 1 : 0), auto: prev.auto + (isManual ? 0 : 1) });
  }
  const manualVsAutoByYear = Array.from(yearMap.entries())
    .map(([year, { manual, auto }]) => ({ year, manual, auto }))
    .sort((a, b) => a.year.localeCompare(b.year));

  return { shuffleRatio, reasonStartBreakdown, platformBreakdown, manualRatio, manualVsAutoByYear };
}

export interface LifetimeCurve {
  curve: { date: string; cumulativeHours: number }[];
  milestones: { p25: string | null; p50: string | null; p75: string | null };
  firstPlay: string | null;
  lastPlay: string | null;
  peakYear: string | null;
  totalHours: number;
}

export function computeLifetimeCurve(entries: SpotifyHistoryItem[]): LifetimeCurve {
  if (entries.length === 0) {
    return { curve: [], milestones: { p25: null, p50: null, p75: null }, firstPlay: null, lastPlay: null, peakYear: null, totalHours: 0 };
  }

  const sorted = [...entries].sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());

  // Aggregate by month for a smooth curve
  const monthMs = new Map<string, number>();
  for (const e of sorted) {
    const month = e.ts.slice(0, 7);
    monthMs.set(month, (monthMs.get(month) || 0) + e.ms_played);
  }

  let cumMs = 0;
  const curve = Array.from(monthMs.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, ms]) => {
      cumMs += ms;
      return { date, cumulativeHours: cumMs / 3_600_000 };
    });

  const totalHours = cumMs / 3_600_000;
  const findMilestone = (frac: number) => {
    const target = totalHours * frac;
    return curve.find(p => p.cumulativeHours >= target)?.date ?? null;
  };

  const yearMs = new Map<string, number>();
  for (const e of entries) {
    const y = new Date(e.ts).getFullYear().toString();
    yearMs.set(y, (yearMs.get(y) || 0) + e.ms_played);
  }
  let peakYear: string | null = null;
  let peakMsVal = 0;
  for (const [y, ms] of yearMs.entries()) {
    if (ms > peakMsVal) { peakMsVal = ms; peakYear = y; }
  }

  return {
    curve,
    milestones: { p25: findMilestone(0.25), p50: findMilestone(0.5), p75: findMilestone(0.75) },
    firstPlay: sorted[0].ts.slice(0, 10),
    lastPlay: sorted[sorted.length - 1].ts.slice(0, 10),
    peakYear,
    totalHours,
  };
}
