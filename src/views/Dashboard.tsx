import { useMemo, useState } from 'react';
import { Coins, Wallet, PiggyBank, Receipt, ArrowRight, Compass } from 'lucide-react';
import {
  buildValueSeries,
  contributionsByFund,
  holdingsBreakdown,
  portfolioValueAt,
  totalInvested,
} from '../lib/engine';
import { CATALOG } from '../lib/catalog';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/format';
import { Card, cn } from '../components/ui';
import { PerformanceChart } from '../components/PerformanceChart';
import { RoundUpWallet } from '../components/RoundUpWallet';
import { TransactionRow } from '../components/TransactionRow';
import { AllocationDonut } from '../components/AllocationDonut';
import { FundCard } from '../components/FundCard';
import { FundDetailModal } from '../components/FundDetailModal';
import type { CatalogAsset } from '../lib/types';
import type { View } from '../App';

const TIMEFRAMES = [
  { key: '1W', days: 7 },
  { key: '1M', days: 30 },
  { key: '3M', days: 90 },
  { key: 'ALL', days: 0 },
] as const;

export function Dashboard({ onNavigate }: { onNavigate: (v: View) => void }) {
  const { state } = useStore();
  const [tf, setTf] = useState<(typeof TIMEFRAMES)[number]['key']>('3M');
  const [selectedFund, setSelectedFund] = useState<CatalogAsset | null>(null);

  const now = Date.now();
  const value = useMemo(
    () => portfolioValueAt(state.investments, now),
    [state.investments, now]
  );
  const invested = useMemo(
    () => totalInvested(state.investments),
    [state.investments]
  );

  const allDays = useMemo(() => {
    const created = new Date(state.createdAt).getTime();
    return Math.max(30, Math.ceil((now - created) / 86_400_000) + 1);
  }, [state.createdAt, now]);

  const days = tf === 'ALL' ? allDays : TIMEFRAMES.find((t) => t.key === tf)!.days;
  const series = useMemo(
    () => buildValueSeries(state.investments, days, now),
    [state.investments, days, now]
  );

  const roundUpsThisMonth = useMemo(() => {
    const cutoff = now - 30 * 86_400_000;
    return state.transactions
      .filter((t) => new Date(t.date).getTime() >= cutoff)
      .reduce((s, t) => s + t.roundUp, 0);
  }, [state.transactions, now]);

  const holdings = useMemo(
    () => holdingsBreakdown(state.investments, now).filter((h) => h.value > 0),
    [state.investments, now]
  );

  const trending = useMemo(
    () => [...CATALOG].sort((a, b) => b.momentum - a.momentum).slice(0, 4),
    []
  );
  const heldSet = useMemo(() => {
    const held = contributionsByFund(state.investments, now);
    return new Set(Object.keys(held).filter((id) => (held[id] ?? 0) > 0));
  }, [state.investments, now]);

  const recent = state.transactions.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4 p-5 pb-0">
            <div>
              <p className="text-sm font-medium text-ink-500">Portfolio value</p>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="text-4xl font-extrabold tracking-tight text-ink-900 tabular">
                  {formatCurrency(value)}
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-500">
                {formatCurrency(invested)} invested so far
              </p>
            </div>

            <div className="flex rounded-xl bg-surface-sunken p-1">
              {TIMEFRAMES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTf(t.key)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-bold transition',
                    tf === t.key
                      ? 'bg-surface-raised text-ink-900 shadow-soft'
                      : 'text-ink-500 hover:text-ink-700'
                  )}
                >
                  {t.key}
                </button>
              ))}
            </div>
          </div>

          <div className="px-2 pb-2 pt-3">
            <PerformanceChart data={series} height={260} showInvested={false} />
          </div>
        </Card>

        <RoundUpWallet />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Coins size={18} />}
          label="Total invested"
          value={formatCurrency(invested)}
          tone="brand"
        />
        <StatCard
          icon={<PiggyBank size={18} />}
          label="Round-ups (30d)"
          value={formatCurrency(roundUpsThisMonth)}
          tone="neutral"
        />
        <StatCard
          icon={<Wallet size={18} />}
          label="Ready to invest"
          value={formatCurrency(state.walletCents / 100)}
          tone="neutral"
        />
        <StatCard
          icon={<Receipt size={18} />}
          label="Purchases tracked"
          value={String(state.transactions.length)}
          tone="neutral"
        />
      </div>

      {/* Discover */}
      <div>
        <div className="mb-3 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Compass size={17} className="text-brand-400" />
            <h3 className="font-bold text-ink-900">Discover funds</h3>
            <span className="hidden text-sm text-ink-400 sm:inline">
              · trending across the app
            </span>
          </div>
          <button
            onClick={() => onNavigate('explore')}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-400 hover:text-brand-300"
          >
            Explore all <ArrowRight size={14} />
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trending.map((asset) => (
            <FundCard
              key={asset.id}
              asset={asset}
              held={heldSet.has(asset.id)}
              onOpen={() => setSelectedFund(asset)}
            />
          ))}
        </div>
      </div>

      {/* Lower grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between p-5 pb-2">
            <h3 className="font-bold text-ink-900">Recent activity</h3>
            <button
              onClick={() => onNavigate('transactions')}
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-400 hover:text-brand-300"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>
          {recent.length === 0 ? (
            <div className="px-5 pb-8 pt-4 text-center text-sm text-ink-400">
              No purchases yet. Add one to start rounding up.
            </div>
          ) : (
            <div className="divide-y divide-ink-100 px-5 pb-2">
              {recent.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between p-5 pb-2">
            <h3 className="font-bold text-ink-900">Allocation</h3>
            <button
              onClick={() => onNavigate('portfolio')}
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-400 hover:text-brand-300"
            >
              Details <ArrowRight size={14} />
            </button>
          </div>
          <div className="p-5 pt-0">
            <AllocationDonut holdings={holdings} total={value} />
          </div>
        </Card>
      </div>

      <FundDetailModal asset={selectedFund} onClose={() => setSelectedFund(null)} />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: 'brand' | 'positive' | 'negative' | 'neutral';
}) {
  const tones: Record<string, string> = {
    brand: 'bg-brand-500/15 text-brand-300',
    positive: 'bg-brand-500/15 text-brand-300',
    negative: 'bg-rose-500/15 text-rose-300',
    neutral: 'bg-ink-100 text-ink-500',
  };
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl',
            tones[tone]
          )}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-ink-500">{label}</p>
          <p className="truncate text-lg font-bold tabular text-ink-900">{value}</p>
        </div>
      </div>
    </Card>
  );
}
