import type { Fund, FundId, Portfolio, PortfolioId, TxCategory } from './types';

export const FUNDS: Record<FundId, Fund> = {
  VTI: {
    id: 'VTI',
    ticker: 'VTI',
    name: 'US Total Market',
    category: 'US Stocks',
    expenseRatio: 0.03,
    expectedReturn: 0.098,
    volatility: 0.16,
    color: '#12934f',
    description: 'Every publicly traded US company in one low-cost index fund.',
  },
  VXUS: {
    id: 'VXUS',
    ticker: 'VXUS',
    name: 'International Stocks',
    category: 'Intl Stocks',
    expenseRatio: 0.07,
    expectedReturn: 0.085,
    volatility: 0.18,
    color: '#43cd7f',
    description: 'Developed and emerging markets outside the United States.',
  },
  VUG: {
    id: 'VUG',
    ticker: 'VUG',
    name: 'US Growth',
    category: 'Growth',
    expenseRatio: 0.04,
    expectedReturn: 0.112,
    volatility: 0.2,
    color: '#0e7490',
    description: 'Large-cap US companies with above-average growth.',
  },
  VTV: {
    id: 'VTV',
    ticker: 'VTV',
    name: 'US Value',
    category: 'Value',
    expenseRatio: 0.04,
    expectedReturn: 0.09,
    volatility: 0.14,
    color: '#7fe3aa',
    description: 'Established, dividend-paying US value companies.',
  },
  VNQ: {
    id: 'VNQ',
    ticker: 'VNQ',
    name: 'Real Estate',
    category: 'REITs',
    expenseRatio: 0.13,
    expectedReturn: 0.078,
    volatility: 0.19,
    color: '#f59e0b',
    description: 'Real estate investment trusts across the US property market.',
  },
  BND: {
    id: 'BND',
    ticker: 'BND',
    name: 'US Bonds',
    category: 'Bonds',
    expenseRatio: 0.03,
    expectedReturn: 0.042,
    volatility: 0.05,
    color: '#64748b',
    description: 'Broad exposure to US investment-grade bonds.',
  },
  BNDX: {
    id: 'BNDX',
    ticker: 'BNDX',
    name: 'International Bonds',
    category: 'Bonds',
    expenseRatio: 0.07,
    expectedReturn: 0.038,
    volatility: 0.06,
    color: '#94a3b8',
    description: 'Investment-grade bonds from around the globe, currency hedged.',
  },
};

export const PORTFOLIOS: Record<PortfolioId, Portfolio> = {
  conservative: {
    id: 'conservative',
    name: 'Conservative',
    tagline: 'Steady & sheltered',
    description:
      'A bond-heavy mix that prioritizes stability. Great if you want to keep swings small.',
    risk: 'Low',
    expectedReturn: 0.055,
    volatility: 0.06,
    accent: '#64748b',
    allocations: [
      { fundId: 'VTI', weight: 0.24 },
      { fundId: 'VXUS', weight: 0.16 },
      { fundId: 'BND', weight: 0.44 },
      { fundId: 'BNDX', weight: 0.16 },
    ],
  },
  moderate: {
    id: 'moderate',
    name: 'Moderate',
    tagline: 'Balanced growth',
    description:
      'A classic diversified blend of global stocks and bonds. The everyday all-rounder.',
    risk: 'Medium',
    expectedReturn: 0.076,
    volatility: 0.11,
    accent: '#12934f',
    allocations: [
      { fundId: 'VTI', weight: 0.4 },
      { fundId: 'VXUS', weight: 0.22 },
      { fundId: 'VNQ', weight: 0.08 },
      { fundId: 'BND', weight: 0.22 },
      { fundId: 'BNDX', weight: 0.08 },
    ],
  },
  aggressive: {
    id: 'aggressive',
    name: 'Aggressive',
    tagline: 'Maximum growth',
    description:
      'Almost entirely global stocks. Higher expected returns with bigger short-term swings.',
    risk: 'High',
    expectedReturn: 0.095,
    volatility: 0.16,
    accent: '#0e7490',
    allocations: [
      { fundId: 'VTI', weight: 0.5 },
      { fundId: 'VUG', weight: 0.16 },
      { fundId: 'VXUS', weight: 0.26 },
      { fundId: 'VNQ', weight: 0.08 },
    ],
  },
  sustainable: {
    id: 'sustainable',
    name: 'Sustainable',
    tagline: 'Growth with values',
    description:
      'A growth-tilted, socially-conscious blend leaning into future-forward companies.',
    risk: 'High',
    expectedReturn: 0.092,
    volatility: 0.15,
    accent: '#43cd7f',
    allocations: [
      { fundId: 'VUG', weight: 0.4 },
      { fundId: 'VTI', weight: 0.24 },
      { fundId: 'VXUS', weight: 0.24 },
      { fundId: 'BND', weight: 0.12 },
    ],
  },
};

export const PORTFOLIO_LIST: Portfolio[] = [
  PORTFOLIOS.conservative,
  PORTFOLIOS.moderate,
  PORTFOLIOS.aggressive,
  PORTFOLIOS.sustainable,
];

interface MerchantSeed {
  merchant: string;
  category: TxCategory;
  min: number;
  max: number;
  weight: number;
}

export const MERCHANTS: MerchantSeed[] = [
  { merchant: 'Blue Bottle Coffee', category: 'Coffee', min: 3.4, max: 6.75, weight: 10 },
  { merchant: 'Starbucks', category: 'Coffee', min: 3.15, max: 7.4, weight: 9 },
  { merchant: 'Whole Foods Market', category: 'Groceries', min: 12.2, max: 89.6, weight: 7 },
  { merchant: 'Trader Joe\u2019s', category: 'Groceries', min: 9.1, max: 62.3, weight: 6 },
  { merchant: 'Chipotle', category: 'Dining', min: 9.35, max: 21.8, weight: 8 },
  { merchant: 'Sweetgreen', category: 'Dining', min: 11.4, max: 18.9, weight: 5 },
  { merchant: 'Uber', category: 'Transport', min: 7.6, max: 34.2, weight: 6 },
  { merchant: 'Lyft', category: 'Transport', min: 6.9, max: 28.4, weight: 4 },
  { merchant: 'Amazon', category: 'Shopping', min: 6.5, max: 74.9, weight: 8 },
  { merchant: 'Target', category: 'Shopping', min: 8.2, max: 68.5, weight: 6 },
  { merchant: 'Apple', category: 'Shopping', min: 0.99, max: 19.99, weight: 3 },
  { merchant: 'Netflix', category: 'Entertainment', min: 15.49, max: 22.99, weight: 2 },
  { merchant: 'Spotify', category: 'Entertainment', min: 11.99, max: 16.99, weight: 2 },
  { merchant: 'AMC Theatres', category: 'Entertainment', min: 13.5, max: 41.2, weight: 3 },
  { merchant: 'Shell', category: 'Fuel', min: 28.3, max: 71.9, weight: 4 },
  { merchant: 'Chevron', category: 'Fuel', min: 31.2, max: 66.4, weight: 3 },
  { merchant: 'AT&T', category: 'Bills', min: 45.0, max: 95.0, weight: 2 },
  { merchant: 'PG&E', category: 'Bills', min: 38.0, max: 140.0, weight: 2 },
];
