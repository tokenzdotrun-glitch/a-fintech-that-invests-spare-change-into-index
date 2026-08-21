import type { Investment, Portfolio, RoundUpMultiplier } from './types';

/* ---------------------------------- RNG ---------------------------------- */

/** Deterministic 32-bit PRNG so charts stay stable across reloads. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedFrom(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Box-Muller transform for a standard normal draw. */
function gaussian(rng: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/* ------------------------------- Round-ups ------------------------------- */

/** Round a purchase up to the next dollar, times the multiplier. */
export function computeRoundUp(amount: number, multiplier: RoundUpMultiplier): number {
  const cents = Math.round(amount * 100) % 100;
  if (cents === 0) return multiplier; // whole-dollar purchase still rounds up by $1 * mult
  const base = (100 - cents) / 100;
  return round2(base * multiplier);
}

/* -------------------------------- Numbers -------------------------------- */

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/* ---------------------------- Value simulation ---------------------------- */

export interface HistoryPoint {
  t: number; // ms timestamp
  value: number; // market value
  principal: number; // contributed principal to date
}

export interface PortfolioValue {
  history: HistoryPoint[];
  currentValue: number;
  principal: number;
  gain: number;
  gainPct: number;
}

const DAY = 86400000;

/**
 * Builds a daily market-value series by compounding a seeded return stream and
 * layering each contribution in on its date. Deterministic for a given seed.
 */
export function buildPortfolioValue(
  investments: Investment[],
  portfolio: Portfolio,
  seed: number,
  now: number = Date.now()
): PortfolioValue {
  const contribs = [...investments].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (contribs.length === 0) {
    return { history: [], currentValue: 0, principal: 0, gain: 0, gainPct: 0 };
  }

  const start = new Date(contribs[0].date).getTime();
  const startDay = Math.floor(start / DAY) * DAY;
  const endDay = Math.floor(now / DAY) * DAY;
  const days = Math.max(1, Math.round((endDay - startDay) / DAY));

  // Pre-bucket contributions by day index.
  const byDay = new Map<number, number>();
  let principalTotal = 0;
  for (const c of contribs) {
    const di = Math.round((Math.floor(new Date(c.date).getTime() / DAY) * DAY - startDay) / DAY);
    byDay.set(di, round2((byDay.get(di) ?? 0) + c.amount));
    principalTotal = round2(principalTotal + c.amount);
  }

  const rng = mulberry32(seed);
  const dailyDrift = portfolio.expectedReturn / 365;
  const dailyVol = portfolio.volatility / Math.sqrt(365);

  const history: HistoryPoint[] = [];
  let value = 0;
  let principal = 0;

  for (let i = 0; i <= days; i++) {
    const contribution = byDay.get(i) ?? 0;
    if (contribution) {
      value = round2(value + contribution);
      principal = round2(principal + contribution);
    }
    if (value > 0) {
      const shock = gaussian(rng) * dailyVol;
      const ret = dailyDrift - 0.5 * dailyVol * dailyVol + shock;
      value = value * Math.exp(ret);
    }
    history.push({ t: startDay + i * DAY, value: round2(value), principal });
  }

  const currentValue = round2(value);
  const gain = round2(currentValue - principalTotal);
  const gainPct = principalTotal > 0 ? gain / principalTotal : 0;

  return { history, currentValue, principal: principalTotal, gain, gainPct };
}

/* ------------------------------ Projections ------------------------------ */

export interface ProjectionPoint {
  year: number;
  invested: number;
  expected: number;
  low: number;
  high: number;
}

/**
 * Projects future value assuming a steady monthly contribution and the
 * portfolio's expected return. Low/high bands use +/- one volatility band.
 */
export function projectGrowth(
  startingValue: number,
  monthlyContribution: number,
  portfolio: Portfolio,
  years: number
): ProjectionPoint[] {
  const points: ProjectionPoint[] = [];
  const rates = {
    expected: portfolio.expectedReturn,
    low: Math.max(0.005, portfolio.expectedReturn - portfolio.volatility * 0.75),
    high: portfolio.expectedReturn + portfolio.volatility * 0.75,
  };

  const fv = (rate: number, y: number): number => {
    const r = rate / 12;
    const n = y * 12;
    const growthOfStart = startingValue * Math.pow(1 + r, n);
    const growthOfContrib =
      r === 0 ? monthlyContribution * n : monthlyContribution * ((Math.pow(1 + r, n) - 1) / r);
    return growthOfStart + growthOfContrib;
  };

  for (let y = 0; y <= years; y++) {
    points.push({
      year: y,
      invested: round2(startingValue + monthlyContribution * 12 * y),
      expected: round2(fv(rates.expected, y)),
      low: round2(fv(rates.low, y)),
      high: round2(fv(rates.high, y)),
    });
  }
  return points;
}

/* ------------------------------ Formatting ------------------------------- */

export function formatCurrency(n: number, opts?: { cents?: boolean; sign?: boolean }): string {
  const cents = opts?.cents ?? true;
  const s = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  }).format(Math.abs(n));
  if (opts?.sign) return `${n >= 0 ? '+' : '\u2212'}${s}`;
  return n < 0 ? `\u2212${s}` : s;
}

export function formatCompact(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n);
}

export function formatPct(n: number, digits = 1): string {
  return `${n >= 0 ? '+' : '\u2212'}${Math.abs(n * 100).toFixed(digits)}%`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function relativeDay(iso: string, now = Date.now()): string {
  const d = new Date(iso).getTime();
  const diff = Math.floor((now - d) / DAY);
  if (diff <= 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return formatDate(iso);
}
