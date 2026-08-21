import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { MERCHANTS } from '../lib/data';
import { computeRoundUp, mulberry32, round2, seedFrom } from '../lib/finance';
import { emptyState, generateSeededAccount, uid, type SeedOptions } from '../lib/seed';
import type {
  AppState,
  PortfolioId,
  Recurring,
  RoundUpMultiplier,
  Transaction,
  TxCategory,
} from '../lib/types';

const STORAGE_KEY = 'sprout.state.v1';

type Action =
  | { type: 'onboard'; payload: SeedOptions }
  | { type: 'addTransaction'; payload: { merchant: string; category: TxCategory; amount: number } }
  | { type: 'sweepRoundUps' }
  | { type: 'oneTimeInvest'; payload: { amount: number } }
  | { type: 'setPortfolio'; payload: PortfolioId }
  | { type: 'setMultiplier'; payload: RoundUpMultiplier }
  | { type: 'setRecurring'; payload: Recurring | null }
  | { type: 'reset' }
  | { type: 'hydrate'; payload: AppState };

function pendingRoundUps(txs: Transaction[]): number {
  return round2(txs.filter((t) => !t.swept).reduce((s, t) => s + t.roundUp, 0));
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'hydrate':
      return action.payload;

    case 'onboard':
      return generateSeededAccount(action.payload);

    case 'addTransaction': {
      const { merchant, category, amount } = action.payload;
      const roundUp = computeRoundUp(amount, state.roundUpMultiplier);
      const tx: Transaction = {
        id: uid('tx'),
        merchant,
        category,
        amount: round2(amount),
        roundUp,
        date: new Date().toISOString(),
        swept: false,
      };
      let next: AppState = { ...state, transactions: [tx, ...state.transactions] };

      // Auto-invest when accumulated round-ups cross the threshold.
      const pending = pendingRoundUps(next.transactions);
      if (pending >= state.autoInvestThreshold) {
        next = {
          ...next,
          transactions: next.transactions.map((t) => (t.swept ? t : { ...t, swept: true })),
          investments: [
            {
              id: uid('inv'),
              source: 'roundup',
              amount: pending,
              date: new Date().toISOString(),
              note: 'Round-Ups auto-invested',
            },
            ...next.investments,
          ],
        };
      }
      return next;
    }

    case 'sweepRoundUps': {
      const pending = pendingRoundUps(state.transactions);
      if (pending <= 0) return state;
      return {
        ...state,
        transactions: state.transactions.map((t) => (t.swept ? t : { ...t, swept: true })),
        investments: [
          {
            id: uid('inv'),
            source: 'roundup',
            amount: pending,
            date: new Date().toISOString(),
            note: 'Round-Ups invested manually',
          },
          ...state.investments,
        ],
      };
    }

    case 'oneTimeInvest': {
      const amount = round2(action.payload.amount);
      if (amount <= 0) return state;
      return {
        ...state,
        investments: [
          {
            id: uid('inv'),
            source: 'onetime',
            amount,
            date: new Date().toISOString(),
            note: 'One-time investment',
          },
          ...state.investments,
        ],
      };
    }

    case 'setPortfolio':
      return { ...state, portfolioId: action.payload };

    case 'setMultiplier':
      return { ...state, roundUpMultiplier: action.payload };

    case 'setRecurring':
      return { ...state, recurring: action.payload };

    case 'reset':
      return emptyState();

    default:
      return state;
  }
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as AppState;
    if (parsed && parsed.version === 1) return parsed;
    return emptyState();
  } catch {
    return emptyState();
  }
}

interface StoreValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  /** Simulate a random purchase (uses the merchant catalog). */
  simulatePurchase: () => void;
  pending: number;
}

const StoreContext = createContext<StoreValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota errors */
    }
  }, [state]);

  const value = useMemo<StoreValue>(() => {
    const simulatePurchase = () => {
      const rng = mulberry32(seedFrom(uid('sim')));
      const total = MERCHANTS.reduce((s, m) => s + m.weight, 0);
      let r = rng() * total;
      let pick = MERCHANTS[0];
      for (const m of MERCHANTS) {
        r -= m.weight;
        if (r <= 0) {
          pick = m;
          break;
        }
      }
      const amount = round2(pick.min + rng() * (pick.max - pick.min));
      dispatch({
        type: 'addTransaction',
        payload: { merchant: pick.merchant, category: pick.category as TxCategory, amount },
      });
    };

    return {
      state,
      dispatch,
      simulatePurchase,
      pending: pendingRoundUps(state.transactions),
    };
  }, [state]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within AppStateProvider');
  return ctx;
}
