import { MERCHANTS } from './data';
import { computeRoundUp, mulberry32, round2, seedFrom } from './finance';
import type {
  AppState,
  Investment,
  PortfolioId,
  Recurring,
  RoundUpMultiplier,
  Transaction,
  TxCategory,
} from './types';

const DAY = 86400000;

let counter = 0;
export function uid(prefix = 'id'): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}_${Math.floor(
    Math.random() * 1e6
  ).toString(36)}`;
}

function weightedPick<T extends { weight: number }>(items: T[], rng: () => number): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = rng() * total;
  for (const it of items) {
    r -= it.weight;
    if (r <= 0) return it;
  }
  return items[items.length - 1];
}

export interface SeedOptions {
  name: string;
  portfolioId: PortfolioId;
  roundUpMultiplier: RoundUpMultiplier;
  recurring: Recurring | null;
  days?: number;
}

/**
 * Generates a believable back-history so a new account immediately shows an
 * active, growing portfolio: purchases with round-ups (auto-swept at the
 * threshold), plus any recurring deposits.
 */
export function generateSeededAccount(opts: SeedOptions): AppState {
  const days = opts.days ?? 118;
  const now = Date.now();
  const createdAt = new Date(now - days * DAY).toISOString();
  const rng = mulberry32(seedFrom(opts.name + opts.portfolioId + days));

  const transactions: Transaction[] = [];
  const investments: Investment[] = [];
  const threshold = 5;
  let pending = 0;

  for (let d = days; d >= 0; d--) {
    const dayStart = now - d * DAY;
    // 0-4 purchases a day, front-weighted toward 1-2.
    const roll = rng();
    const count = roll < 0.12 ? 0 : roll < 0.55 ? 1 : roll < 0.85 ? 2 : roll < 0.96 ? 3 : 4;

    for (let i = 0; i < count; i++) {
      const seed = weightedPick(MERCHANTS, rng);
      const amount = round2(seed.min + rng() * (seed.max - seed.min));
      const roundUp = computeRoundUp(amount, opts.roundUpMultiplier);
      const ts = dayStart + Math.floor(rng() * DAY);
      const tx: Transaction = {
        id: uid('tx'),
        merchant: seed.merchant,
        category: seed.category as TxCategory,
        amount,
        roundUp,
        date: new Date(ts).toISOString(),
        swept: false,
      };
      transactions.push(tx);

      pending = round2(pending + roundUp);
      if (pending >= threshold) {
        investments.push({
          id: uid('inv'),
          source: 'roundup',
          amount: round2(pending),
          date: new Date(ts + 3600000).toISOString(),
          note: 'Round-Ups auto-invested',
        });
        // mark the round-ups accumulated so far as swept
        for (const t of transactions) if (!t.swept) t.swept = true;
        pending = 0;
      }
    }

    // Recurring deposits.
    if (opts.recurring) {
      const dt = new Date(dayStart);
      const freq = opts.recurring.frequency;
      const trigger =
        (freq === 'daily') ||
        (freq === 'weekly' && dt.getDay() === 1) ||
        (freq === 'monthly' && dt.getDate() === 1);
      if (trigger) {
        investments.push({
          id: uid('inv'),
          source: 'recurring',
          amount: opts.recurring.amount,
          date: new Date(dayStart + 9 * 3600000).toISOString(),
          note: `${freq[0].toUpperCase()}${freq.slice(1)} deposit`,
        });
      }
    }
  }

  // Welcome bonus on day one.
  investments.push({
    id: uid('inv'),
    source: 'bonus',
    amount: 5,
    date: createdAt,
    note: 'Welcome bonus \u{1F389}',
  });

  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    version: 1,
    onboarded: true,
    name: opts.name,
    portfolioId: opts.portfolioId,
    roundUpMultiplier: opts.roundUpMultiplier,
    autoInvestThreshold: threshold,
    recurring: opts.recurring,
    transactions,
    investments,
    createdAt,
  };
}

export function emptyState(): AppState {
  return {
    version: 1,
    onboarded: false,
    name: '',
    portfolioId: 'moderate',
    roundUpMultiplier: 1,
    autoInvestThreshold: 5,
    recurring: null,
    transactions: [],
    investments: [],
    createdAt: new Date().toISOString(),
  };
}
