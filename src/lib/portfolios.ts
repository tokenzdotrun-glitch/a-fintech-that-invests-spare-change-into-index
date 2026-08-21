import type { Fund, RiskProfile, RiskProfileId } from './types';

export const FUNDS: Fund[] = [
  {
    id: 'VTI',
    ticker: 'VTI',
    name: 'US Total Market',
    category: 'US Equity',
    basePrice: 271.4,
    drift: 0.092,
    vol: 0.16,
    color: '#10b981',
    expenseRatio: 0.03,
  },
  {
    id: 'VXUS',
    ticker: 'VXUS',
    name: 'International Equity',
    category: 'Intl Equity',
    basePrice: 63.8,
    drift: 0.071,
    vol: 0.17,
    color: '#3b82f6',
    expenseRatio: 0.07,
  },
  {
    id: 'BND',
    ticker: 'BND',
    name: 'US Total Bond',
    category: 'Bonds',
    basePrice: 73.2,
    drift: 0.036,
    vol: 0.055,
    color: '#f59e0b',
    expenseRatio: 0.03,
  },
  {
    id: 'VNQ',
    ticker: 'VNQ',
    name: 'Real Estate',
    category: 'Real Estate',
    basePrice: 89.6,
    drift: 0.058,
    vol: 0.19,
    color: '#a855f7',
    expenseRatio: 0.13,
  },
];

export const FUND_MAP: Record<string, Fund> = Object.fromEntries(
  FUNDS.map((f) => [f.id, f])
);

export const RISK_PROFILES: Record<RiskProfileId, RiskProfile> = {
  conservative: {
    id: 'conservative',
    name: 'Conservative',
    blurb: 'Lower ups and downs. Weighted toward bonds to protect your balance.',
    expectedReturn: 0.052,
    allocation: { VTI: 0.3, VXUS: 0.1, BND: 0.55, VNQ: 0.05 },
  },
  moderate: {
    id: 'moderate',
    name: 'Moderate',
    blurb: 'A balanced blend of stocks and bonds for steady long-term growth.',
    expectedReturn: 0.072,
    allocation: { VTI: 0.45, VXUS: 0.2, BND: 0.25, VNQ: 0.1 },
  },
  aggressive: {
    id: 'aggressive',
    name: 'Aggressive',
    blurb: 'Maximum growth potential. Almost entirely diversified equities.',
    expectedReturn: 0.091,
    allocation: { VTI: 0.6, VXUS: 0.3, BND: 0.02, VNQ: 0.08 },
  },
};

export const RISK_ORDER: RiskProfileId[] = ['conservative', 'moderate', 'aggressive'];
