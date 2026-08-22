import type { CatalogAsset } from './types';

/**
 * The universe of index funds & ETFs users can discover and invest in.
 * The four `core: true` funds are the building blocks used by risk-profile
 * allocations; the rest are discoverable single-fund investments.
 */
export const CATALOG: CatalogAsset[] = [
  {
    id: 'VTI',
    ticker: 'VTI',
    name: 'US Total Market',
    category: 'US Equity',
    color: '#10b981',
    expenseRatio: 0.03,
    description:
      'Owns virtually every publicly traded US company in a single fund — the classic one-stop foundation for a long-term portfolio.',
    expectedReturn: 0.082,
    riskLevel: 'medium',
    tags: ['Broad market', 'Foundational', 'Low fee'],
    popularity: 96,
    momentum: 0.031,
    price: 268.4,
    core: true,
  },
  {
    id: 'VOO',
    ticker: 'VOO',
    name: 'S&P 500',
    category: 'US Equity',
    color: '#22c55e',
    expenseRatio: 0.03,
    description:
      'Tracks the 500 largest US companies. The benchmark most professional investors are measured against.',
    expectedReturn: 0.085,
    riskLevel: 'medium',
    tags: ['Blue chip', 'Foundational', 'Low fee'],
    popularity: 98,
    momentum: 0.028,
    price: 512.7,
  },
  {
    id: 'QQQ',
    ticker: 'QQQ',
    name: 'Nasdaq-100',
    category: 'Growth',
    color: '#38bdf8',
    expenseRatio: 0.2,
    description:
      'The 100 largest non-financial companies on the Nasdaq — heavily weighted toward mega-cap technology and innovation leaders.',
    expectedReturn: 0.115,
    riskLevel: 'high',
    tags: ['Tech-heavy', 'Growth', 'Momentum'],
    popularity: 95,
    momentum: 0.052,
    price: 478.9,
  },
  {
    id: 'VUG',
    ticker: 'VUG',
    name: 'US Growth',
    category: 'Growth',
    color: '#818cf8',
    expenseRatio: 0.04,
    description:
      'Large US companies expected to grow faster than the market. Higher upside, higher swings.',
    expectedReturn: 0.098,
    riskLevel: 'high',
    tags: ['Growth', 'Large cap'],
    popularity: 82,
    momentum: 0.041,
    price: 385.2,
  },
  {
    id: 'VTV',
    ticker: 'VTV',
    name: 'US Value',
    category: 'US Equity',
    color: '#2dd4bf',
    expenseRatio: 0.04,
    description:
      'Established, reasonably priced companies. Tends to hold up better when markets get choppy.',
    expectedReturn: 0.072,
    riskLevel: 'medium',
    tags: ['Value', 'Defensive'],
    popularity: 74,
    momentum: 0.012,
    price: 168.3,
  },
  {
    id: 'SCHD',
    ticker: 'SCHD',
    name: 'Dividend Equity',
    category: 'Dividend',
    color: '#f472b6',
    expenseRatio: 0.06,
    description:
      'High-quality US companies with a track record of paying growing dividends — a favorite for income-focused investors.',
    expectedReturn: 0.078,
    riskLevel: 'medium',
    tags: ['Dividends', 'Income', 'Quality'],
    popularity: 88,
    momentum: 0.006,
    price: 82.1,
  },
  {
    id: 'VYM',
    ticker: 'VYM',
    name: 'High Dividend Yield',
    category: 'Dividend',
    color: '#fb7185',
    expenseRatio: 0.06,
    description:
      'Broad basket of US stocks with above-average dividend yields for steady cash payouts.',
    expectedReturn: 0.074,
    riskLevel: 'medium',
    tags: ['Dividends', 'Income'],
    popularity: 79,
    momentum: 0.008,
    price: 128.6,
  },
  {
    id: 'VB',
    ticker: 'VB',
    name: 'US Small-Cap',
    category: 'US Equity',
    color: '#a3e635',
    expenseRatio: 0.05,
    description:
      'Thousands of smaller US companies with room to run. More volatile, historically higher long-run growth.',
    expectedReturn: 0.088,
    riskLevel: 'high',
    tags: ['Small cap', 'Growth'],
    popularity: 66,
    momentum: 0.019,
    price: 235.4,
  },
  {
    id: 'VXUS',
    ticker: 'VXUS',
    name: 'International Equity',
    category: 'Intl Equity',
    color: '#3b82f6',
    expenseRatio: 0.07,
    description:
      'Every major market outside the US in one fund — diversification against a home-country tilt.',
    expectedReturn: 0.076,
    riskLevel: 'medium',
    tags: ['International', 'Diversifier'],
    popularity: 71,
    momentum: 0.015,
    price: 62.4,
    core: true,
  },
  {
    id: 'VEA',
    ticker: 'VEA',
    name: 'Developed Markets',
    category: 'Intl Equity',
    color: '#60a5fa',
    expenseRatio: 0.05,
    description:
      'Established economies outside the US — Europe, Japan, Canada and more.',
    expectedReturn: 0.071,
    riskLevel: 'medium',
    tags: ['International', 'Developed'],
    popularity: 68,
    momentum: 0.011,
    price: 52.7,
  },
  {
    id: 'VWO',
    ticker: 'VWO',
    name: 'Emerging Markets',
    category: 'Intl Equity',
    color: '#0ea5e9',
    expenseRatio: 0.08,
    description:
      'Fast-growing economies like India, China, Brazil and Taiwan. Higher potential, higher volatility.',
    expectedReturn: 0.084,
    riskLevel: 'high',
    tags: ['Emerging', 'Growth'],
    popularity: 63,
    momentum: 0.022,
    price: 45.1,
  },
  {
    id: 'BND',
    ticker: 'BND',
    name: 'US Total Bond',
    category: 'Bonds',
    color: '#f59e0b',
    expenseRatio: 0.03,
    description:
      'The whole US investment-grade bond market. Ballast that steadies a portfolio when stocks fall.',
    expectedReturn: 0.041,
    riskLevel: 'low',
    tags: ['Bonds', 'Stability', 'Income'],
    popularity: 70,
    momentum: -0.004,
    price: 73.2,
    core: true,
  },
  {
    id: 'TIP',
    ticker: 'TIP',
    name: 'Inflation-Protected',
    category: 'Bonds',
    color: '#fbbf24',
    expenseRatio: 0.19,
    description:
      'US Treasury bonds that adjust with inflation, helping preserve purchasing power.',
    expectedReturn: 0.038,
    riskLevel: 'low',
    tags: ['Bonds', 'Inflation hedge'],
    popularity: 52,
    momentum: -0.002,
    price: 108.9,
  },
  {
    id: 'VNQ',
    ticker: 'VNQ',
    name: 'Real Estate',
    category: 'Real Estate',
    color: '#a855f7',
    expenseRatio: 0.13,
    description:
      'Owns a slice of hundreds of real-estate companies (REITs) — property exposure without buying a building.',
    expectedReturn: 0.062,
    riskLevel: 'medium',
    tags: ['Real estate', 'Income', 'Diversifier'],
    popularity: 61,
    momentum: 0.009,
    price: 88.5,
    core: true,
  },
  {
    id: 'VGT',
    ticker: 'VGT',
    name: 'Information Technology',
    category: 'Sector',
    color: '#6366f1',
    expenseRatio: 0.1,
    description:
      'Concentrated bet on the US technology sector — software, semiconductors and hardware leaders.',
    expectedReturn: 0.121,
    riskLevel: 'high',
    tags: ['Technology', 'Sector', 'Growth'],
    popularity: 90,
    momentum: 0.048,
    price: 585.3,
  },
  {
    id: 'SOXX',
    ticker: 'SOXX',
    name: 'Semiconductors',
    category: 'Sector',
    color: '#f97316',
    expenseRatio: 0.35,
    description:
      'The companies designing and building the chips behind AI, phones and modern computing.',
    expectedReturn: 0.135,
    riskLevel: 'high',
    tags: ['Semiconductors', 'AI', 'High risk'],
    popularity: 84,
    momentum: 0.061,
    price: 235.8,
  },
  {
    id: 'XLV',
    ticker: 'XLV',
    name: 'Health Care',
    category: 'Sector',
    color: '#14b8a6',
    expenseRatio: 0.09,
    description:
      'US health-care leaders — pharma, devices and insurers. Historically resilient through downturns.',
    expectedReturn: 0.079,
    riskLevel: 'medium',
    tags: ['Health care', 'Defensive'],
    popularity: 64,
    momentum: 0.007,
    price: 152.4,
  },
  {
    id: 'XLF',
    ticker: 'XLF',
    name: 'Financials',
    category: 'Sector',
    color: '#0891b2',
    expenseRatio: 0.09,
    description:
      'Banks, insurers and payment networks — the plumbing of the US economy.',
    expectedReturn: 0.081,
    riskLevel: 'medium',
    tags: ['Financials', 'Cyclical'],
    popularity: 62,
    momentum: 0.017,
    price: 44.6,
  },
  {
    id: 'XLE',
    ticker: 'XLE',
    name: 'Energy',
    category: 'Sector',
    color: '#eab308',
    expenseRatio: 0.09,
    description:
      'Oil, gas and energy producers. Cyclical exposure that can hedge inflation spikes.',
    expectedReturn: 0.069,
    riskLevel: 'high',
    tags: ['Energy', 'Cyclical'],
    popularity: 58,
    momentum: -0.013,
    price: 92.3,
  },
  {
    id: 'ICLN',
    ticker: 'ICLN',
    name: 'Clean Energy',
    category: 'Thematic',
    color: '#4ade80',
    expenseRatio: 0.41,
    description:
      'Global solar, wind and clean-power companies riding the energy transition.',
    expectedReturn: 0.09,
    riskLevel: 'high',
    tags: ['Clean energy', 'Thematic', 'High risk'],
    popularity: 49,
    momentum: -0.022,
    price: 13.9,
  },
  {
    id: 'ARKK',
    ticker: 'ARKK',
    name: 'Disruptive Innovation',
    category: 'Thematic',
    color: '#ef4444',
    expenseRatio: 0.75,
    description:
      'Actively managed bet on high-growth disruptors across genomics, fintech and AI. Big swings both ways.',
    expectedReturn: 0.1,
    riskLevel: 'high',
    tags: ['Innovation', 'Thematic', 'High risk'],
    popularity: 57,
    momentum: 0.036,
    price: 52.6,
  },
  {
    id: 'GLD',
    ticker: 'GLD',
    name: 'Gold',
    category: 'Commodities',
    color: '#d4af37',
    expenseRatio: 0.4,
    description:
      'Physical-gold-backed fund. A classic safe-haven and diversifier when markets get nervous.',
    expectedReturn: 0.048,
    riskLevel: 'medium',
    tags: ['Gold', 'Safe haven', 'Hedge'],
    popularity: 60,
    momentum: 0.014,
    price: 218.1,
  },
  {
    id: 'IBIT',
    ticker: 'IBIT',
    name: 'Bitcoin Trust',
    category: 'Digital Assets',
    color: '#f7931a',
    expenseRatio: 0.25,
    description:
      'Spot Bitcoin exposure in a regulated ETF wrapper — no wallets or keys to manage. Highly speculative.',
    expectedReturn: 0.15,
    riskLevel: 'high',
    tags: ['Bitcoin', 'Crypto', 'Speculative'],
    popularity: 92,
    momentum: 0.088,
    price: 42.7,
  },
  {
    id: 'BLOK',
    ticker: 'BLOK',
    name: 'Blockchain & Digital Economy',
    category: 'Digital Assets',
    color: '#a78bfa',
    expenseRatio: 0.71,
    description:
      'Companies building the blockchain and digital-asset economy — exchanges, miners and infrastructure.',
    expectedReturn: 0.11,
    riskLevel: 'high',
    tags: ['Blockchain', 'Crypto', 'Thematic'],
    popularity: 55,
    momentum: 0.045,
    price: 48.2,
  },
];

export const ASSET_MAP: Record<string, CatalogAsset> = Object.fromEntries(
  CATALOG.map((a) => [a.id, a])
);

/** Category order used for the Explore filter row. */
export const ASSET_CATEGORIES: string[] = [
  'US Equity',
  'Growth',
  'Dividend',
  'Intl Equity',
  'Sector',
  'Thematic',
  'Digital Assets',
  'Commodities',
  'Bonds',
  'Real Estate',
];

export function getAsset(id: string): CatalogAsset | undefined {
  return ASSET_MAP[id];
}

/* -------------------------------------------------------------------------- */
/* Deterministic sparkline data (stable per ticker across renders)             */
/* -------------------------------------------------------------------------- */

function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A stable, illustrative price path for an asset. Slope follows `momentum`,
 * jitter follows `riskLevel`. Values are relative (start near 100).
 */
export function sparklineFor(asset: CatalogAsset, points = 24): number[] {
  const rand = mulberry32(hashSeed(asset.ticker));
  const drift = asset.momentum / points;
  const vol =
    asset.riskLevel === 'high' ? 0.02 : asset.riskLevel === 'medium' ? 0.011 : 0.005;
  let v = 100;
  const series: number[] = [];
  for (let i = 0; i < points; i++) {
    const shock = (rand() - 0.5) * 2 * vol;
    v = v * (1 + drift + shock);
    series.push(Math.max(v, 1));
  }
  return series;
}
