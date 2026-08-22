import type { Fund, RiskProfile, RiskProfileId } from './types';
import { ASSET_MAP, CATALOG } from './catalog';

/** The four low-cost building blocks used by risk-profile allocations. */
export const FUNDS: Fund[] = CATALOG.filter((a) => a.core);

/** Lookup across the entire investable universe (core + discoverable). */
export const FUND_MAP: Record<string, Fund> = ASSET_MAP;

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
