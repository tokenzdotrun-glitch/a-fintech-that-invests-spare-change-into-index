export type RiskProfileId = 'conservative' | 'moderate' | 'aggressive';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface Fund {
  id: string;
  ticker: string;
  name: string;
  category: string;
  color: string;
  expenseRatio: number;
}

/** A discoverable investable asset in the Explore catalog. */
export interface CatalogAsset extends Fund {
  /** Short marketing description shown in discovery surfaces. */
  description: string;
  /** Assumed long-term annual return, for discovery copy & projections. */
  expectedReturn: number;
  riskLevel: RiskLevel;
  /** Discovery tags. */
  tags: string[];
  /** 0..100 popularity score among users. */
  popularity: number;
  /** Trailing ~1 month price change (fraction, may be negative). */
  momentum: number;
  /** Latest indicative price per share. */
  price: number;
  /** True for the four core building-block funds used by risk profiles. */
  core?: boolean;
}

export interface RiskProfile {
  id: RiskProfileId;
  name: string;
  blurb: string;
  /** Historical-ish expected annual return, for projections & copy. */
  expectedReturn: number;
  /** fundId -> weight (0..1), sums to 1. */
  allocation: Record<string, number>;
}

export type TxStatus = 'pending' | 'invested';

export interface Transaction {
  id: string;
  merchant: string;
  category: string;
  /** Purchase amount in dollars. */
  amount: number;
  /** ISO date string. */
  date: string;
  /** Spare change rounded up (after multiplier). */
  roundUp: number;
  status: TxStatus;
}

export interface InvestmentEvent {
  id: string;
  date: string;
  /** Total dollars swept into the portfolio. */
  amount: number;
  /** Where it came from. */
  source: 'roundup' | 'recurring' | 'boost';
  /** fundId -> dollars contributed (cost basis). */
  byFund: Record<string, number>;
}

export interface Settings {
  roundUpMultiplier: 1 | 2 | 3 | 10;
  /** Automatically invest pending round-ups once the threshold is reached. */
  autoInvest: boolean;
  /** Dollar threshold that triggers an auto-sweep. */
  sweepThreshold: number;
  /** Recurring weekly contribution (a "boost"). */
  weeklyRecurring: number;
  riskProfile: RiskProfileId;
  /** Round-to-nearest base (usually 1 dollar). */
  roundTo: number;
}

export interface AppState {
  createdAt: string;
  name: string;
  settings: Settings;
  transactions: Transaction[];
  investments: InvestmentEvent[];
  /** Cash sitting in the round-up wallet not yet invested (in cents to avoid fp drift). */
  walletCents: number;
  /** Fund ids the user has starred to watch. */
  watchlist: string[];
  /** Last date we simulated recurring contributions through (ISO). */
  lastRecurringDate: string;
}
