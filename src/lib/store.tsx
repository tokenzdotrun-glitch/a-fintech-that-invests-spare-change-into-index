import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import {
  computeRoundUp,
  DEFAULT_SETTINGS,
  generateInitialState,
  splitByAllocation,
  uid,
} from './engine';
import type { AppState, InvestmentEvent, Settings, Transaction } from './types';

const STORAGE_KEY = 'acol.state.v2';

type Action =
  | { type: 'ADD_TX'; tx: Transaction }
  | { type: 'INVEST_NOW' }
  | { type: 'INVEST_IN_FUND'; fundId: string }
  | { type: 'TOGGLE_WATCH'; fundId: string }
  | { type: 'UPDATE_SETTINGS'; patch: Partial<Settings> }
  | { type: 'RESET' }
  | { type: 'LOAD'; state: AppState };

function toTime(d: string): number {
  return new Date(d).getTime();
}

function sweepWallet(
  state: AppState,
  source: InvestmentEvent['source'] = 'roundup',
  byFundOverride?: Record<string, number>
): AppState {
  if (state.walletCents <= 0) return state;
  const amount = state.walletCents / 100;
  const now = new Date().toISOString();
  const investment: InvestmentEvent = {
    id: uid('inv'),
    date: now,
    amount,
    source,
    byFund: byFundOverride ?? splitByAllocation(amount, state.settings.riskProfile),
  };
  return {
    ...state,
    walletCents: 0,
    transactions: state.transactions.map((t) =>
      t.status === 'pending' ? { ...t, status: 'invested' as const } : t
    ),
    investments: [...state.investments, investment],
  };
}

function recomputePending(state: AppState, settings: Settings): AppState {
  let walletCents = 0;
  const transactions = state.transactions.map((t) => {
    if (t.status !== 'pending') return t;
    const roundUp = computeRoundUp(t.amount, settings.roundTo, settings.roundUpMultiplier);
    walletCents += Math.round(roundUp * 100);
    return { ...t, roundUp };
  });
  return { ...state, settings, transactions, walletCents };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD':
      return action.state;

    case 'RESET':
      return generateInitialState(state.name);

    case 'ADD_TX':
      return applyNewTx(state, action.tx);

    case 'INVEST_NOW':
      return sweepWallet(state);

    case 'INVEST_IN_FUND': {
      const amount = state.walletCents / 100;
      if (amount <= 0) return state;
      return sweepWallet(state, 'boost', { [action.fundId]: amount });
    }

    case 'TOGGLE_WATCH': {
      const watching = state.watchlist.includes(action.fundId);
      return {
        ...state,
        watchlist: watching
          ? state.watchlist.filter((id) => id !== action.fundId)
          : [action.fundId, ...state.watchlist],
      };
    }

    case 'UPDATE_SETTINGS': {
      const settings = { ...state.settings, ...action.patch };
      const affectsRoundUp =
        action.patch.roundUpMultiplier !== undefined ||
        action.patch.roundTo !== undefined;
      const next = affectsRoundUp
        ? recomputePending(state, settings)
        : { ...state, settings };
      return next;
    }

    default:
      return state;
  }
}

function applyNewTx(state: AppState, tx: Transaction): AppState {
  const walletCents = state.walletCents + Math.round(tx.roundUp * 100);
  let next: AppState = {
    ...state,
    transactions: [tx, ...state.transactions].sort(
      (a, b) => toTime(b.date) - toTime(a.date)
    ),
    walletCents,
  };
  if (
    next.settings.autoInvest &&
    next.walletCents >= next.settings.sweepThreshold * 100
  ) {
    next = sweepWallet(next);
  }
  return next;
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed && parsed.transactions && parsed.settings) {
        return withDefaults(parsed);
      }
    }
  } catch {
    /* ignore corrupt state */
  }
  return generateInitialState();
}

// keep forward-compatible defaults for any newly-added state keys
function withDefaults(parsed: AppState): AppState {
  return {
    ...parsed,
    watchlist: parsed.watchlist ?? [],
    settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
  };
}

interface StoreValue {
  state: AppState;
  addTransaction: (input: {
    merchant: string;
    amount: number;
    category: string;
  }) => void;
  investNow: () => void;
  investInFund: (fundId: string) => void;
  toggleWatch: (fundId: string) => void;
  isWatched: (fundId: string) => boolean;
  updateSettings: (patch: Partial<Settings>) => void;
  reset: () => void;
  pendingTransactions: Transaction[];
  walletBalance: number;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage might be unavailable */
    }
  }, [state]);

  const value = useMemo<StoreValue>(() => {
    const pendingTransactions = state.transactions.filter(
      (t) => t.status === 'pending'
    );
    return {
      state,
      addTransaction: (input) => {
        const roundUp = computeRoundUp(
          input.amount,
          state.settings.roundTo,
          state.settings.roundUpMultiplier
        );
        dispatch({
          type: 'ADD_TX',
          tx: {
            id: uid('tx'),
            merchant: input.merchant,
            category: input.category,
            amount: input.amount,
            date: new Date().toISOString(),
            roundUp,
            status: 'pending',
          },
        });
      },
      investNow: () => dispatch({ type: 'INVEST_NOW' }),
      investInFund: (fundId) => dispatch({ type: 'INVEST_IN_FUND', fundId }),
      toggleWatch: (fundId) => dispatch({ type: 'TOGGLE_WATCH', fundId }),
      isWatched: (fundId) => state.watchlist.includes(fundId),
      updateSettings: (patch) => dispatch({ type: 'UPDATE_SETTINGS', patch }),
      reset: () => dispatch({ type: 'RESET' }),
      pendingTransactions,
      walletBalance: state.walletCents / 100,
    };
  }, [state]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within a StoreProvider');
  return ctx;
}
