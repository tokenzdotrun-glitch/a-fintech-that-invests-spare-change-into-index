export type FundId =
  | 'VTI'
  | 'VXUS'
  | 'BND'
  | 'BNDX'
  | 'VNQ'
  | 'VUG'
  | 'VTV';

export interface Fund {
  id: FundId;
  name: string;
  ticker: string;
  category: string;
  expenseRatio: number;
  /** expected long-run annual return (nominal) */
  expectedReturn: number;
  /** annualized volatility */
  volatility: number;
  color: string;
  description: string;
}

export type PortfolioId =
  | 'conservative'
  | 'moderate'
  | 'aggressive'
  | 'sustainable';

export interface Allocation {
  fundId: FundId;
  weight: number; // 0..1
}

export interface Portfolio {
  id: PortfolioId;
  name: string;
  tagline: string;
  description: string;
  risk: 'Low' | 'Medium' | 'High';
  expectedReturn: number; // blended annual
  volatility: number; // blended annual
  allocations: Allocation[];
  accent: string;
}

export type TxCategory =
  | 'Coffee'
  | 'Groceries'
  | 'Dining'
  | 'Transport'
  | 'Shopping'
  | 'Entertainment'
  | 'Fuel'
  | 'Bills';

export interface Transaction {
  id: string;
  merchant: string;
  category: TxCategory;
  amount: number;
  roundUp: number;
  date: string; // ISO
  swept: boolean; // has the round-up been invested yet
}

export type InvestmentSource = 'roundup' | 'recurring' | 'onetime' | 'bonus';

export interface Investment {
  id: string;
  source: InvestmentSource;
  amount: number;
  date: string; // ISO
  note?: string;
}

export type RoundUpMultiplier = 1 | 2 | 3 | 5 | 10;

export interface Recurring {
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
}

export interface AppState {
  version: number;
  onboarded: boolean;
  name: string;
  portfolioId: PortfolioId;
  roundUpMultiplier: RoundUpMultiplier;
  autoInvestThreshold: number;
  recurring: Recurring | null;
  transactions: Transaction[];
  investments: Investment[];
  createdAt: string; // ISO — account start (used as chart origin + rng seed)
}
