import { FUNDS, RISK_PROFILES } from './portfolios';
import { ASSET_MAP } from './catalog';
import type {
  AppState,
  Fund,
  InvestmentEvent,
  RiskProfileId,
  Settings,
} from './types';

const MS_DAY = 86_400_000;

function toTime(date: string | number | Date): number {
  if (date instanceof Date) return date.getTime();
  if (typeof date === 'number') return date;
  return new Date(date).getTime();
}

let idCounter = 0;
export function uid(prefix = 'id'): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter}_${Math.floor(
    Math.random() * 1e6
  ).toString(36)}`;
}

/* -------------------------------------------------------------------------- */
/* Round-ups & investing                                                       */
/* -------------------------------------------------------------------------- */

export function computeRoundUp(
  amount: number,
  roundTo: number,
  multiplier: number
): number {
  const rem = Math.round((amount % roundTo) * 100) / 100;
  const base = rem === 0 ? 0 : roundTo - rem;
  return Math.round(base * multiplier * 100) / 100;
}

/** Split a dollar amount across funds per the profile allocation. */
export function splitByAllocation(
  amount: number,
  profileId: RiskProfileId
): Record<string, number> {
  const allocation = RISK_PROFILES[profileId].allocation;
  const byFund: Record<string, number> = {};
  for (const [fundId, weight] of Object.entries(allocation)) {
    if (weight <= 0) continue;
    byFund[fundId] = amount * weight;
  }
  return byFund;
}

/* -------------------------------------------------------------------------- */
/* Valuation                                                                   */
/* -------------------------------------------------------------------------- */

/** Dollars contributed to each fund on or before `date`. */
export function contributionsByFund(
  investments: InvestmentEvent[],
  date: string | number | Date
): Record<string, number> {
  const cutoff = toTime(date);
  const held: Record<string, number> = {};
  for (const ev of investments) {
    if (toTime(ev.date) > cutoff) continue;
    for (const [fundId, dollars] of Object.entries(ev.byFund)) {
      held[fundId] = (held[fundId] ?? 0) + dollars;
    }
  }
  return held;
}

/**
 * Portfolio value on a given date. Until a live price source (Supabase) is
 * connected, holdings are valued at the dollars contributed (cost basis).
 */
export function portfolioValueAt(
  investments: InvestmentEvent[],
  date: string | number | Date
): number {
  const cutoff = toTime(date);
  let total = 0;
  for (const ev of investments) {
    if (toTime(ev.date) <= cutoff) total += ev.amount;
  }
  return total;
}

export function totalInvested(investments: InvestmentEvent[]): number {
  return investments.reduce((sum, ev) => sum + ev.amount, 0);
}

export interface FundHolding {
  fund: Fund;
  value: number;
  weight: number;
}

export function holdingsBreakdown(
  investments: InvestmentEvent[],
  date: string | number | Date = Date.now()
): FundHolding[] {
  const held = contributionsByFund(investments, date);
  // Always surface the core building blocks, plus any directly-invested funds.
  const ids = new Set<string>(FUNDS.map((f) => f.id));
  for (const id of Object.keys(held)) ids.add(id);

  const rows: FundHolding[] = [];
  let total = 0;
  for (const id of ids) {
    const fund = ASSET_MAP[id];
    if (!fund) continue;
    const value = held[id] ?? 0;
    total += value;
    rows.push({ fund, value, weight: 0 });
  }
  for (const row of rows) row.weight = total > 0 ? row.value / total : 0;
  return rows.sort((a, b) => b.value - a.value);
}

export interface SeriesPoint {
  date: string;
  value: number;
  invested: number;
}

/** Portfolio value + cumulative invested for each of the last `days` days. */
export function buildValueSeries(
  investments: InvestmentEvent[],
  days: number,
  now = Date.now()
): SeriesPoint[] {
  const points: SeriesPoint[] = [];
  const startTime = now - (days - 1) * MS_DAY;
  for (let i = 0; i < days; i++) {
    const t = startTime + i * MS_DAY;
    let invested = 0;
    for (const ev of investments) {
      if (toTime(ev.date) <= t) invested += ev.amount;
    }
    points.push({
      date: new Date(t).toISOString(),
      value: portfolioValueAt(investments, t),
      invested,
    });
  }
  return points;
}

/* -------------------------------------------------------------------------- */
/* Initial state                                                               */
/* -------------------------------------------------------------------------- */

export const DEFAULT_SETTINGS: Settings = {
  roundUpMultiplier: 2,
  autoInvest: true,
  sweepThreshold: 5,
  weeklyRecurring: 10,
  riskProfile: 'moderate',
  roundTo: 1,
};

/**
 * Builds a fresh, empty account: no transactions, no investments, and an empty
 * round-up wallet. All balances start at zero and populate as the user adds
 * purchases.
 */
export function generateInitialState(name = ''): AppState {
  const settings = { ...DEFAULT_SETTINGS };
  const now = new Date();

  return {
    createdAt: now.toISOString(),
    name,
    settings,
    transactions: [],
    investments: [],
    walletCents: 0,
    watchlist: [],
    lastRecurringDate: now.toISOString(),
  };
}

/* -------------------------------------------------------------------------- */
/* Projections                                                                 */
/* -------------------------------------------------------------------------- */

export interface ProjectionPoint {
  year: number;
  contributions: number;
  low: number;
  expected: number;
  high: number;
}

/**
 * Compound-growth projection given a starting balance and monthly contribution.
 */
export function projectGrowth(
  startingBalance: number,
  monthlyContribution: number,
  years: number,
  expectedReturn: number
): ProjectionPoint[] {
  const scenarios = {
    low: expectedReturn - 0.035,
    expected: expectedReturn,
    high: expectedReturn + 0.035,
  };
  const points: ProjectionPoint[] = [];
  for (let year = 0; year <= years; year++) {
    const months = year * 12;
    const contributions = startingBalance + monthlyContribution * months;
    const balances: Record<string, number> = {};
    for (const [key, rate] of Object.entries(scenarios)) {
      const monthlyRate = Math.pow(1 + rate, 1 / 12) - 1;
      let balance = startingBalance;
      for (let m = 0; m < months; m++) {
        balance = balance * (1 + monthlyRate) + monthlyContribution;
      }
      balances[key] = balance;
    }
    points.push({
      year,
      contributions,
      low: balances.low,
      expected: balances.expected,
      high: balances.high,
    });
  }
  return points;
}

/** Average monthly round-up + recurring contribution over recent history. */
export function estimateMonthlyContribution(state: AppState): number {
  const now = Date.now();
  const windowDays = 90;
  const cutoff = now - windowDays * MS_DAY;
  const recent = state.investments.filter((ev) => toTime(ev.date) >= cutoff);
  const contributed = recent.reduce((s, ev) => s + ev.amount, 0);
  const perMonth = (contributed / windowDays) * 30;
  return Math.max(perMonth, 0);
}
