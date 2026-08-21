import { useMemo } from 'react';
import { FUNDS, PORTFOLIOS } from '../lib/data';
import {
  buildPortfolioValue,
  round2,
  seedFrom,
  type PortfolioValue,
} from '../lib/finance';
import type { Fund, Portfolio } from '../lib/types';
import { useStore } from './store';

export interface Holding {
  fund: Fund;
  weight: number;
  value: number;
  shares: number;
}

export interface DerivedPortfolio {
  portfolio: Portfolio;
  value: PortfolioValue;
  holdings: Holding[];
  totalRoundUps: number;
  roundUpsThisWeek: number;
  investedThisWeek: number;
  transactionsThisWeek: number;
  lifetimeContributions: number;
}

const WEEK = 7 * 86400000;

export function useDerivedPortfolio(): DerivedPortfolio {
  const { state } = useStore();

  return useMemo(() => {
    const portfolio = PORTFOLIOS[state.portfolioId];
    const seed = seedFrom(state.createdAt + state.portfolioId);
    const value = buildPortfolioValue(state.investments, portfolio, seed);

    const holdings: Holding[] = portfolio.allocations.map((a) => {
      const fund = FUNDS[a.fundId];
      const v = round2(value.currentValue * a.weight);
      // Illustrative share price derived from the fund's expected return.
      const price = 60 + fund.expectedReturn * 800;
      return { fund, weight: a.weight, value: v, shares: round2(v / price) };
    });

    const now = Date.now();
    const roundUpsThisWeek = round2(
      state.transactions
        .filter((t) => now - new Date(t.date).getTime() < WEEK)
        .reduce((s, t) => s + t.roundUp, 0)
    );
    const transactionsThisWeek = state.transactions.filter(
      (t) => now - new Date(t.date).getTime() < WEEK
    ).length;
    const investedThisWeek = round2(
      state.investments
        .filter((i) => now - new Date(i.date).getTime() < WEEK)
        .reduce((s, i) => s + i.amount, 0)
    );

    const totalRoundUps = round2(state.transactions.reduce((s, t) => s + t.roundUp, 0));
    const lifetimeContributions = value.principal;

    return {
      portfolio,
      value,
      holdings,
      totalRoundUps,
      roundUpsThisWeek,
      investedThisWeek,
      transactionsThisWeek,
      lifetimeContributions,
    };
  }, [state]);
}
