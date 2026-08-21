import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Coins,
  CreditCard,
  Plus,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';
import { ValueChart } from '../components/Charts';
import { CATEGORY_COLOR, CATEGORY_ICON } from '../components/icons';
import { Badge, Button, Card } from '../components/ui';
import { formatCurrency, formatPct, relativeDay } from '../lib/finance';
import type { HistoryPoint } from '../lib/finance';
import { useDerivedPortfolio } from '../state/derived';
import { useStore } from '../state/store';

const RANGES = [
  { key: '1W', days: 7 },
  { key: '1M', days: 30 },
  { key: '3M', days: 90 },
  { key: 'ALL', days: Infinity },
] as const;

export default function Dashboard({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { state, simulatePurchase, pending, dispatch } = useStore();
  const d = useDerivedPortfolio();
  const [range, setRange] = useState<(typeof RANGES)[number]['key']>('3M');

  const chartData = useMemo<HistoryPoint[]>(() => {
    const r = RANGES.find((x) => x.key === range)!;
    if (r.days === Infinity) return d.value.history;
    const cutoff = Date.now() - r.days * 86400000;
    const filtered = d.value.history.filter((p) => p.t >= cutoff);
    return filtered.length > 1 ? filtered : d.value.history;
  }, [d.value.history, range]);

  const gainPositive = d.value.gain >= 0;
  const firstName = state.name.split(' ')[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {greeting()}, {firstName} 👋
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Your money</h1>
        </div>
        <Button variant="secondary" size="sm" onClick={simulatePurchase}>
          <CreditCard className="h-4 w-4" /> Simulate purchase
        </Button>
      </div>

      {/* Balance hero */}
      <Card className="overflow-hidden p-0">
        <div className="relative bg-gradient-to-br from-sprout-600 via-sprout-700 to-sprout-800 p-6 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-sprout-100">
                <Wallet className="h-4 w-4" /> Total balance
              </div>
              <div className="mt-1 text-4xl font-extrabold tabular sm:text-5xl">
                {formatCurrency(d.value.currentValue)}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-bold ${
                    gainPositive ? 'bg-white/15 text-white' : 'bg-rose-900/30 text-rose-100'
                  }`}
                >
                  {gainPositive ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {formatCurrency(d.value.gain, { sign: true })} ({formatPct(d.value.gainPct)})
                </span>
                <span className="text-sm text-sprout-100">all time</span>
              </div>
            </div>
            <div className="flex gap-1 rounded-full bg-white/10 p-1 backdrop-blur">
              {RANGES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setRange(r.key)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                    range === r.key ? 'bg-white text-sprout-700' : 'text-sprout-100 hover:text-white'
                  }`}
                >
                  {r.key}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 -mx-2">
            <ValueChartWhite data={chartData} />
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-slate-100">
          <MiniStat
            label="Invested"
            value={formatCurrency(d.value.principal, { cents: false })}
            hint="lifetime"
          />
          <MiniStat
            label="Round-ups"
            value={formatCurrency(d.totalRoundUps)}
            hint={`${state.transactions.length} purchases`}
          />
          <MiniStat
            label="Est. return"
            value={`${(d.portfolio.expectedReturn * 100).toFixed(1)}%`}
            hint="annual"
          />
        </div>
      </Card>

      {/* Pending round-ups CTA */}
      <PendingCard pending={pending} threshold={state.autoInvestThreshold} onInvest={() => dispatch({ type: 'sweepRoundUps' })} onSimulate={simulatePurchase} />

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatTile
          icon={<Coins className="h-5 w-5" />}
          label="Round-ups this week"
          value={formatCurrency(d.roundUpsThisWeek)}
          tone="green"
        />
        <StatTile
          icon={<Zap className="h-5 w-5" />}
          label="Invested this week"
          value={formatCurrency(d.investedThisWeek)}
          tone="blue"
        />
        <StatTile
          icon={<CreditCard className="h-5 w-5" />}
          label="Purchases this week"
          value={String(d.transactionsThisWeek)}
          tone="neutral"
        />
      </div>

      {/* Allocation + recent activity */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Portfolio mix</h3>
            <button
              onClick={() => onNavigate('portfolio')}
              className="inline-flex items-center gap-0.5 text-sm font-semibold text-sprout-700 hover:text-sprout-800"
            >
              Details <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {d.holdings.map((h) => (
              <div key={h.fund.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-semibold text-slate-700">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: h.fund.color }}
                    />
                    {h.fund.ticker}
                    <span className="font-normal text-slate-400">{h.fund.category}</span>
                  </span>
                  <span className="font-semibold text-slate-900 tabular">
                    {(h.weight * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${h.weight * 100}%`, backgroundColor: h.fund.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Recent activity</h3>
            <button
              onClick={() => onNavigate('activity')}
              className="inline-flex items-center gap-0.5 text-sm font-semibold text-sprout-700 hover:text-sprout-800"
            >
              See all <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {state.transactions.slice(0, 6).map((t) => {
              const Icon = CATEGORY_ICON[t.category];
              return (
                <div key={t.id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: `${CATEGORY_COLOR[t.category]}18`,
                        color: CATEGORY_COLOR[t.category],
                      }}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{t.merchant}</div>
                      <div className="text-xs text-slate-400">{relativeDay(t.date)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-700 tabular">
                      {formatCurrency(-t.amount)}
                    </div>
                    <div className="text-xs font-bold text-sprout-600 tabular">
                      +{formatCurrency(t.roundUp)}
                    </div>
                  </div>
                </div>
              );
            })}
            {state.transactions.length === 0 && (
              <div className="py-8 text-center text-sm text-slate-400">
                No purchases yet — simulate one to see round-ups.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ValueChartWhite({ data }: { data: HistoryPoint[] }) {
  return <ValueChart data={data} height={140} showAxes={false} light />;
}

function MiniStat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="px-4 py-3.5">
      <div className="text-xs font-medium text-slate-400">{label}</div>
      <div className="mt-0.5 text-lg font-bold text-slate-900 tabular">{value}</div>
      <div className="text-[11px] text-slate-400">{hint}</div>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: 'green' | 'blue' | 'neutral';
}) {
  const tones = {
    green: 'bg-sprout-100 text-sprout-700',
    blue: 'bg-cyan-100 text-cyan-700',
    neutral: 'bg-slate-100 text-slate-600',
  };
  return (
    <Card className="p-4">
      <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${tones[tone]}`}>
        {icon}
      </span>
      <div className="mt-3 text-xl font-extrabold text-slate-900 tabular">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </Card>
  );
}

function PendingCard({
  pending,
  threshold,
  onInvest,
  onSimulate,
}: {
  pending: number;
  threshold: number;
  onInvest: () => void;
  onSimulate: () => void;
}) {
  const pct = Math.min(100, (pending / threshold) * 100);
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sprout-100 text-sprout-700">
            <Sparkles className="h-6 w-6" />
          </span>
          <div>
            <div className="text-sm text-slate-500">Round-ups ready to invest</div>
            <div className="text-2xl font-extrabold text-slate-900 tabular">
              {formatCurrency(pending)}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onSimulate}>
            <Plus className="h-4 w-4" /> Add spend
          </Button>
          <Button onClick={onInvest} disabled={pending <= 0}>
            <Zap className="h-4 w-4" /> Invest now
          </Button>
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
          <span>Auto-invests at {formatCurrency(threshold, { cents: false })}</span>
          <Badge tone={pending >= threshold ? 'green' : 'neutral'}>
            {pending >= threshold ? 'Ready' : `${formatCurrency(threshold - pending)} to go`}
          </Badge>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sprout-400 to-sprout-600 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </Card>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
