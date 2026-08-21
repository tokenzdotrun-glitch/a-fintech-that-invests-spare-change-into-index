import { FUNDS, FUND_MAP, RISK_PROFILES } from './portfolios';
import type {
  AppState,
  Fund,
  InvestmentEvent,
  RiskProfileId,
  Settings,
  Transaction,
} from './types';

const MS_DAY = 86_400_000;
/** Reference date for the price simulator. basePrice ≈ price at this date. */
const PRICE_REF = Date.UTC(2024, 0, 1);

/* -------------------------------------------------------------------------- */
/* Deterministic randomness                                                    */
/* -------------------------------------------------------------------------- */

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

export function hashStr(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/* -------------------------------------------------------------------------- */
/* Price simulation                                                            */
/* -------------------------------------------------------------------------- */

interface WiggleComponent {
  freq: number;
  amp: number;
  phase: number;
}

const WIGGLE: Record<string, WiggleComponent[]> = {};
for (const fund of FUNDS) {
  const rng = mulberry32(hashStr(fund.id));
  const comps: WiggleComponent[] = [];
  const freqs = [0.5, 1.1, 2.7, 6.3, 13.0, 27.0];
  let ampSum = 0;
  for (let i = 0; i < freqs.length; i++) {
    const amp = (1 / (i + 1)) * (0.7 + rng() * 0.6);
    ampSum += amp;
    comps.push({
      freq: freqs[i] * (0.85 + rng() * 0.3),
      amp,
      phase: rng() * Math.PI * 2,
    });
  }
  // normalise so the wiggle stays in roughly [-1, 1]
  for (const c of comps) c.amp /= ampSum;
  WIGGLE[fund.id] = comps;
}

function wiggle(fundId: string, t: number): number {
  let v = 0;
  for (const c of WIGGLE[fundId]) {
    v += c.amp * Math.sin(c.freq * t * Math.PI * 2 + c.phase);
  }
  return v;
}

function toTime(date: string | number | Date): number {
  if (date instanceof Date) return date.getTime();
  if (typeof date === 'number') return date;
  return new Date(date).getTime();
}

/** Deterministic simulated price for a fund on a given date. */
export function priceAt(fundId: string, date: string | number | Date): number {
  const fund = FUND_MAP[fundId];
  if (!fund) return 0;
  const t = (toTime(date) - PRICE_REF) / (365 * MS_DAY);
  return fund.basePrice * Math.exp(fund.drift * t + fund.vol * wiggle(fundId, t));
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

/** Split a dollar amount across funds per allocation and return shares bought. */
export function buySharesForAmount(
  amount: number,
  profileId: RiskProfileId,
  date: string | number | Date
): Record<string, number> {
  const allocation = RISK_PROFILES[profileId].allocation;
  const byFund: Record<string, number> = {};
  for (const [fundId, weight] of Object.entries(allocation)) {
    if (weight <= 0) continue;
    const dollars = amount * weight;
    byFund[fundId] = dollars / priceAt(fundId, date);
  }
  return byFund;
}

/* -------------------------------------------------------------------------- */
/* Valuation                                                                   */
/* -------------------------------------------------------------------------- */

export function sharesHeldAt(
  investments: InvestmentEvent[],
  date: string | number | Date
): Record<string, number> {
  const cutoff = toTime(date);
  const held: Record<string, number> = {};
  for (const ev of investments) {
    if (toTime(ev.date) > cutoff) continue;
    for (const [fundId, shares] of Object.entries(ev.byFund)) {
      held[fundId] = (held[fundId] ?? 0) + shares;
    }
  }
  return held;
}

export function portfolioValueAt(
  investments: InvestmentEvent[],
  date: string | number | Date
): number {
  const held = sharesHeldAt(investments, date);
  let total = 0;
  for (const [fundId, shares] of Object.entries(held)) {
    total += shares * priceAt(fundId, date);
  }
  return total;
}

export function totalInvested(investments: InvestmentEvent[]): number {
  return investments.reduce((sum, ev) => sum + ev.amount, 0);
}

export interface FundHolding {
  fund: Fund;
  shares: number;
  value: number;
  weight: number;
}

export function holdingsBreakdown(
  investments: InvestmentEvent[],
  date: string | number | Date = Date.now()
): FundHolding[] {
  const held = sharesHeldAt(investments, date);
  const rows: FundHolding[] = [];
  let total = 0;
  for (const fund of FUNDS) {
    const shares = held[fund.id] ?? 0;
    const value = shares * priceAt(fund.id, date);
    total += value;
    rows.push({ fund, shares, value, weight: 0 });
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
/* Merchants & transaction generation                                          */
/* -------------------------------------------------------------------------- */

interface MerchantSpec {
  name: string;
  category: string;
  min: number;
  max: number;
  /** relative frequency weight */
  weight: number;
}

export const MERCHANTS: MerchantSpec[] = [
  { name: 'Blue Bottle Coffee', category: 'Coffee', min: 4.25, max: 7.8, weight: 5 },
  { name: 'Starbucks', category: 'Coffee', min: 3.75, max: 9.4, weight: 6 },
  { name: 'Whole Foods Market', category: 'Groceries', min: 18, max: 124, weight: 4 },
  { name: "Trader Joe's", category: 'Groceries', min: 12, max: 71, weight: 4 },
  { name: 'Chipotle', category: 'Dining', min: 9.2, max: 24.6, weight: 4 },
  { name: 'Sweetgreen', category: 'Dining', min: 11.5, max: 19.2, weight: 3 },
  { name: 'Shake Shack', category: 'Dining', min: 10.8, max: 28.9, weight: 2 },
  { name: 'Uber', category: 'Transport', min: 7.6, max: 37.4, weight: 4 },
  { name: 'Lyft', category: 'Transport', min: 6.9, max: 31.5, weight: 2 },
  { name: 'Shell', category: 'Gas', min: 27.5, max: 68.3, weight: 3 },
  { name: 'Amazon', category: 'Shopping', min: 5.99, max: 96.4, weight: 5 },
  { name: 'Target', category: 'Shopping', min: 11.4, max: 138.7, weight: 3 },
  { name: 'Apple', category: 'Shopping', min: 0.99, max: 129, weight: 1 },
  { name: 'CVS Pharmacy', category: 'Health', min: 4.8, max: 43.6, weight: 2 },
  { name: 'Netflix', category: 'Subscriptions', min: 15.49, max: 15.49, weight: 1 },
  { name: 'Spotify', category: 'Subscriptions', min: 11.99, max: 11.99, weight: 1 },
  { name: 'The Home Depot', category: 'Home', min: 8.4, max: 187.2, weight: 2 },
  { name: 'Delta Air Lines', category: 'Travel', min: 129, max: 486, weight: 1 },
];

const MERCHANT_TOTAL_WEIGHT = MERCHANTS.reduce((s, m) => s + m.weight, 0);

function pickMerchant(r: number): MerchantSpec {
  let acc = r * MERCHANT_TOTAL_WEIGHT;
  for (const m of MERCHANTS) {
    acc -= m.weight;
    if (acc <= 0) return m;
  }
  return MERCHANTS[0];
}

let idCounter = 0;
export function uid(prefix = 'id'): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter}_${Math.floor(
    Math.random() * 1e6
  ).toString(36)}`;
}

export function makeTransaction(
  rng: () => number,
  date: Date,
  settings: Settings
): Transaction {
  const merchant = pickMerchant(rng());
  const raw = merchant.min + rng() * (merchant.max - merchant.min);
  const amount = Math.round(raw * 100) / 100;
  const roundUp = computeRoundUp(amount, settings.roundTo, settings.roundUpMultiplier);
  return {
    id: uid('tx'),
    merchant: merchant.name,
    category: merchant.category,
    amount,
    date: date.toISOString(),
    roundUp,
    status: 'pending',
  };
}

/* -------------------------------------------------------------------------- */
/* Initial state generation                                                     */
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
 * Builds a believable starter account: ~110 days of purchases with round-ups
 * that have been swept into the portfolio over time, plus weekly recurring
 * contributions, leaving a few recent purchases pending in the wallet.
 */
export function generateInitialState(name = 'Alex Rivera'): AppState {
  const settings = { ...DEFAULT_SETTINGS };
  const rng = mulberry32(20240517);
  const now = new Date();
  const daysBack = 112;

  const transactions: Transaction[] = [];
  const investments: InvestmentEvent[] = [];

  let walletCents = 0;
  let pending: Transaction[] = [];
  let lastRecurring = new Date(now.getTime() - daysBack * MS_DAY);

  for (let d = daysBack; d >= 0; d--) {
    const dayDate = new Date(now.getTime() - d * MS_DAY);
    // 0–3 purchases per day
    const roll = rng();
    const count = roll < 0.22 ? 0 : roll < 0.6 ? 1 : roll < 0.87 ? 2 : 3;

    for (let i = 0; i < count; i++) {
      const ts = new Date(dayDate);
      ts.setHours(7 + Math.floor(rng() * 15), Math.floor(rng() * 60), 0, 0);
      if (ts.getTime() > now.getTime()) continue;
      const tx = makeTransaction(rng, ts, settings);
      transactions.push(tx);
      pending.push(tx);
      walletCents += Math.round(tx.roundUp * 100);
    }

    // weekly recurring boost
    if (dayDate.getTime() - lastRecurring.getTime() >= 7 * MS_DAY && settings.weeklyRecurring > 0) {
      lastRecurring = dayDate;
      // only sweep recurring for days at least a couple days in the past
      if (d > 1) {
        investments.push({
          id: uid('inv'),
          date: dayDate.toISOString(),
          amount: settings.weeklyRecurring,
          source: 'recurring',
          byFund: buySharesForAmount(settings.weeklyRecurring, settings.riskProfile, dayDate),
        });
      }
    }

    // auto-invest sweep once threshold reached, but keep the last ~2 days pending
    if (
      settings.autoInvest &&
      walletCents >= settings.sweepThreshold * 100 &&
      d > 2
    ) {
      const amount = walletCents / 100;
      investments.push({
        id: uid('inv'),
        date: dayDate.toISOString(),
        amount,
        source: 'roundup',
        byFund: buySharesForAmount(amount, settings.riskProfile, dayDate),
      });
      for (const p of pending) p.status = 'invested';
      pending = [];
      walletCents = 0;
    }
  }

  transactions.sort((a, b) => toTime(b.date) - toTime(a.date));

  return {
    createdAt: new Date(now.getTime() - daysBack * MS_DAY).toISOString(),
    name,
    settings,
    transactions,
    investments,
    walletCents,
    lastRecurringDate: lastRecurring.toISOString(),
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

export interface PeriodReturn {
  /** Change in portfolio value over the window (includes new contributions). */
  valueChange: number;
  /** Contributions added during the window. */
  contributions: number;
  /** Gain attributable to the market (value change minus contributions). */
  marketGain: number;
  /** Money-weighted (Modified Dietz) return for the window. */
  pct: number;
}

/**
 * Modified-Dietz money-weighted return over the last `days`, so contributions
 * aren't mistaken for investment performance.
 */
export function periodReturn(
  investments: InvestmentEvent[],
  days: number,
  now = Date.now()
): PeriodReturn {
  const start = now - (days - 1) * MS_DAY;
  const span = now - start || 1;
  const beginValue = portfolioValueAt(investments, start);
  const endValue = portfolioValueAt(investments, now);

  let contributions = 0;
  let weightedFlows = 0;
  for (const ev of investments) {
    const t = toTime(ev.date);
    if (t > start && t <= now) {
      contributions += ev.amount;
      weightedFlows += ev.amount * ((now - t) / span);
    }
  }

  const marketGain = endValue - beginValue - contributions;
  const denom = beginValue + weightedFlows;
  const pct = denom > 0 ? marketGain / denom : 0;

  return {
    valueChange: endValue - beginValue,
    contributions,
    marketGain,
    pct,
  };
}
