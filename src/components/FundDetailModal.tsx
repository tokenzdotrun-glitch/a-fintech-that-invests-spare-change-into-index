import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Star,
  TrendingUp,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { useStore } from '../lib/store';
import { sparklineFor } from '../lib/catalog';
import { contributionsByFund } from '../lib/engine';
import { formatCurrency, formatPercent } from '../lib/format';
import { Button, cn } from './ui';
import { Sparkline } from './Sparkline';
import type { CatalogAsset, RiskLevel } from '../lib/types';

const RISK_LABEL: Record<RiskLevel, { label: string; tone: string }> = {
  low: { label: 'Lower risk', tone: 'text-brand-300 bg-brand-500/15' },
  medium: { label: 'Medium risk', tone: 'text-amber-300 bg-amber-500/15' },
  high: { label: 'Higher risk', tone: 'text-rose-300 bg-rose-500/15' },
};

export function FundDetailModal({
  asset,
  onClose,
}: {
  asset: CatalogAsset | null;
  onClose: () => void;
}) {
  const { walletBalance, investInFund, isWatched, toggleWatch, state } = useStore();
  const [justInvested, setJustInvested] = useState<number | null>(null);

  // reset the success panel whenever a different asset is opened
  useEffect(() => {
    setJustInvested(null);
  }, [asset?.id]);

  return (
    <AnimatePresence>
      {asset && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-ink-100 bg-surface shadow-2xl sm:rounded-3xl"
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Content
              asset={asset}
              onClose={onClose}
              walletBalance={walletBalance}
              investInFund={investInFund}
              watched={isWatched(asset.id)}
              toggleWatch={() => toggleWatch(asset.id)}
              held={contributionsByFund(state.investments, Date.now())[asset.id] ?? 0}
              justInvested={justInvested}
              setJustInvested={setJustInvested}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Content({
  asset,
  onClose,
  walletBalance,
  investInFund,
  watched,
  toggleWatch,
  held,
  justInvested,
  setJustInvested,
}: {
  asset: CatalogAsset;
  onClose: () => void;
  walletBalance: number;
  investInFund: (id: string) => void;
  watched: boolean;
  toggleWatch: () => void;
  held: number;
  justInvested: number | null;
  setJustInvested: (n: number | null) => void;
}) {
  const up = asset.momentum >= 0;
  const risk = RISK_LABEL[asset.riskLevel];
  const series = sparklineFor(asset, 40);
  const canInvest = walletBalance > 0;

  function invest() {
    if (!canInvest) return;
    const amount = walletBalance;
    investInFund(asset.id);
    setJustInvested(amount);
  }

  if (justInvested !== null) {
    return (
      <div className="p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/15 text-brand-300">
          <CheckCircle2 size={30} />
        </div>
        <h3 className="mt-4 text-lg font-bold text-ink-900">Invested!</h3>
        <p className="mt-1 text-sm text-ink-500">
          {formatCurrency(justInvested)} from your round-up wallet went into{' '}
          <span className="font-semibold text-ink-700">
            {asset.ticker} · {asset.name}
          </span>
          .
        </p>
        <Button onClick={onClose} className="mt-6 w-full">
          Done
        </Button>
      </div>
    );
  }

  return (
    <>
      <div
        className="relative p-5 pb-4"
        style={{
          background: `linear-gradient(135deg, ${asset.color}22, transparent 70%)`,
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-base font-extrabold text-white"
              style={{ backgroundColor: asset.color }}
            >
              {asset.ticker.slice(0, 2)}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-ink-900">{asset.ticker}</h3>
                {asset.core && (
                  <span className="rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-300">
                    Core fund
                  </span>
                )}
              </div>
              <p className="text-sm text-ink-500">{asset.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleWatch}
              aria-label={watched ? 'Remove from watchlist' : 'Add to watchlist'}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg transition',
                watched
                  ? 'text-amber-300 hover:bg-amber-500/15'
                  : 'text-ink-400 hover:bg-ink-100 hover:text-ink-700'
              )}
            >
              <Star size={18} fill={watched ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-2xl font-extrabold tabular text-ink-900">
              {formatCurrency(asset.price)}
            </p>
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-sm font-bold tabular',
                up ? 'text-brand-400' : 'text-rose-400'
              )}
            >
              {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {up ? '+' : '−'}
              {formatPercent(Math.abs(asset.momentum))} · 30d
            </span>
          </div>
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-xs font-semibold',
              risk.tone
            )}
          >
            {risk.label}
          </span>
        </div>

        <div className="mt-2 -mx-1">
          <Sparkline data={series} color={asset.color} height={72} strokeWidth={2} />
        </div>
      </div>

      <div className="space-y-5 p-5 pt-1">
        <p className="text-sm leading-relaxed text-ink-600">{asset.description}</p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Avg. return" value={`${formatPercent(asset.expectedReturn)}/yr`} accent />
          <Stat label="Expense ratio" value={formatPercent(asset.expenseRatio, 2)} />
          <Stat label="Category" value={asset.category} />
          <Stat label="Popularity" value={`${asset.popularity}/100`} />
        </div>

        {asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {asset.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-ink-200 px-2.5 py-1 text-xs font-medium text-ink-500"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {held > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-surface-sunken px-4 py-3 text-sm">
            <ShieldCheck size={16} className="text-brand-400" />
            <span className="text-ink-500">You already hold</span>
            <span className="ml-auto font-bold tabular text-ink-900">
              {formatCurrency(held)}
            </span>
          </div>
        )}

        <div className="rounded-2xl border border-ink-100 bg-surface-sunken p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium text-ink-500">
              <Wallet size={15} className="text-brand-400" /> Round-up wallet
            </span>
            <span className="font-bold tabular text-ink-900">
              {formatCurrency(walletBalance)}
            </span>
          </div>
          <Button onClick={invest} disabled={!canInvest} className="w-full">
            <Sparkles size={16} />
            {canInvest
              ? `Invest ${formatCurrency(walletBalance)} into ${asset.ticker}`
              : 'Add round-ups to invest'}
          </Button>
          <p className="mt-2 text-center text-xs text-ink-400">
            {canInvest
              ? `Moves your available round-up balance into ${asset.name}.`
              : 'Simulate a purchase to build up spare change first.'}
          </p>
        </div>
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl bg-surface-sunken px-3 py-2.5">
      <p className="text-[11px] font-medium text-ink-400">{label}</p>
      <p
        className={cn(
          'mt-0.5 truncate text-sm font-bold tabular',
          accent ? 'text-brand-400' : 'text-ink-900'
        )}
      >
        {value}
      </p>
    </div>
  );
}
