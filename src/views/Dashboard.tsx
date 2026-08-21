import { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, Coins, Wallet, PiggyBank, ArrowRight } from 'lucide-react';
import {
  buildValueSeries,
  holdingsBreakdown,
  periodReturn,
  portfolioValueAt,
  totalInvested,
} from '../lib/engine';
import { useStore } from '../lib/store';
import {
  formatCurrency,
  formatSignedPercent,
} from '../lib/format';
import { Card, cn } from '../components/ui';
import { PerformanceChart } from '../components/PerformanceChart';
import { RoundUpWallet } from '../components/RoundUpWallet';
import { TransactionRow } from '../components/TransactionRow';
import { AllocationDonut } from '../components/AllocationDonut';
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

  const now = Date.now();
  const value = useMemo(
    () => portfolioValueAt(state.investments, now),
    [state.investments, now]
  );
  const invested = useMemo(
    () => totalInvested(state.investments),
    [state.investments]
  );
  const gain = value - invested;
  const gainPct = invested > 0 ? gain / invested : 0;

  const allDays = useMemo(() => {
    const created = new Date(state.createdAt).getTime();
    return Math.max(30, Math.ceil((now - created) / 86_400_000) + 1);
  }, [state.createdAt, now]);

  const days = tf === 'ALL' ? allDays : TIMEFRAMES.find((t) => t.key === tf)!.days;
  const series = useMemo(
    () => buildValueSeries(state.investments, days, now),
    [state.investments, days, now]
  );

  const period = useMemo(
    () => periodReturn(state.investments, days, now),
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

  const recent = state.transactions.slice(0, 6);
  const periodPositive = period.marketGain >= 0;

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
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-bold',
                    gain >= 0
                      ? 'bg-brand-100 text-brand-700'
                      : 'bg-rose-100 text-rose-700'
                  )}
                >
                  {gain >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {formatSignedPercent(gainPct)}
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-500">
                <span
                  className={cn(
                    'font-semibold',
                    gain >= 0 ? 'text-brand-600' : 'text-rose-600'
                  )}
                >
                  {formatCurrency(gain, { sign: true })}
                </span>{' '}
                all-time · {formatCurrency(invested)} invested
              </p>
            </div>

            <div className="flex rounded-xl bg-ink-100 p-1">
              {TIMEFRAMES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTf(t.key)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-bold transition',
                    tf === t.key
                      ? 'bg-white text-ink-900 shadow-soft'
                      : 'text-ink-500 hover:text-ink-700'
                  )}
                >
                  {t.key}
                </button>
              ))}
            </div>
          </div>

          <div className="px-2 pb-2 pt-3">
            <PerformanceChart data={series} height={260} />
          </div>

          <div className="flex items-center justify-between border-t border-ink-100 px-5 py-3 text-sm">
            <span className="text-ink-500">
              {tf === 'ALL' ? 'Market return since you joined' : `Market return · past ${tf}`}
            </span>
            <span
              className={cn(
                'font-semibold tabular',
                periodPositive ? 'text-brand-600' : 'text-rose-600'
              )}
            >
              {formatCurrency(period.marketGain, { sign: true })} (
              {formatSignedPercent(period.pct)})
            </span>
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
          icon={gain >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
          label="All-time gain"
          value={formatCurrency(gain, { sign: true })}
          tone={gain >= 0 ? 'positive' : 'negative'}
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
      </div>

      {/* Lower grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between p-5 pb-2">
            <h3 className="font-bold text-ink-900">Recent activity</h3>
            <button
              onClick={() => onNavigate('transactions')}
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>
          <div className="divide-y divide-ink-100 px-5 pb-2">
            {recent.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between p-5 pb-2">
            <h3 className="font-bold text-ink-900">Allocation</h3>
            <button
              onClick={() => onNavigate('portfolio')}
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Details <ArrowRight size={14} />
            </button>
          </div>
          <div className="p-5 pt-0">
            <AllocationDonut holdings={holdings} total={value} />
          </div>
        </Card>
      </div>
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
    brand: 'bg-brand-100 text-brand-700',
    positive: 'bg-brand-100 text-brand-700',
    negative: 'bg-rose-100 text-rose-700',
    neutral: 'bg-ink-100 text-ink-600',
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
