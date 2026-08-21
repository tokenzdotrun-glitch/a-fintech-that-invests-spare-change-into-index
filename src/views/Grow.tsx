import { useMemo, useState } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Sprout, TrendingUp, Repeat } from 'lucide-react';
import {
  estimateMonthlyContribution,
  portfolioValueAt,
  projectGrowth,
} from '../lib/engine';
import { RISK_PROFILES } from '../lib/portfolios';
import { useStore } from '../lib/store';
import {
  formatCompactCurrency,
  formatCurrency,
  formatPercent,
} from '../lib/format';
import { Card, cn } from '../components/ui';

function ProjectionTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-xl border border-ink-100 bg-surface/95 px-3.5 py-2.5 shadow-card backdrop-blur">
      <div className="mb-1 text-xs font-medium text-ink-400">Year {label}</div>
      <div className="space-y-0.5 text-sm">
        <Row color="#10b981" label="Projected" value={p.expected} bold />
        <Row color="#a7f3d0" label="Optimistic" value={p.range[1]} />
        <Row color="#a7f3d0" label="Conservative" value={p.range[0]} />
        <Row color="#adb6c7" label="You put in" value={p.contributions} />
      </div>
    </div>
  );
}

function Row({
  color,
  label,
  value,
  bold,
}: {
  color: string;
  label: string;
  value: number;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-ink-500">{label}</span>
      <span
        className={cn('ml-auto tabular text-ink-900', bold ? 'font-bold' : 'font-medium')}
      >
        {formatCurrency(value, { cents: false })}
      </span>
    </div>
  );
}

export function Grow() {
  const { state } = useStore();
  const now = Date.now();
  const startingBalance = useMemo(
    () => portfolioValueAt(state.investments, now),
    [state.investments, now]
  );
  const estimated = useMemo(
    () => Math.round(estimateMonthlyContribution(state)),
    [state]
  );

  const [monthly, setMonthly] = useState(() => Math.max(estimated, 20));
  const [years, setYears] = useState(20);
  const profile = RISK_PROFILES[state.settings.riskProfile];

  const data = useMemo(
    () =>
      projectGrowth(startingBalance, monthly, years, profile.expectedReturn).map(
        (p) => ({
          year: p.year,
          expected: p.expected,
          contributions: p.contributions,
          range: [p.low, p.high] as [number, number],
        })
      ),
    [startingBalance, monthly, years, profile.expectedReturn]
  );

  const final = data[data.length - 1];
  const totalContrib = final.contributions;
  const projectedEarnings = final.expected - totalContrib;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4 p-5 pb-0">
          <div>
            <div className="flex items-center gap-2 text-brand-400">
              <Sprout size={18} />
              <span className="text-sm font-semibold">Growth projection</span>
            </div>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-4xl font-extrabold tracking-tight text-ink-900 tabular">
                {formatCurrency(final.expected, { cents: false })}
              </span>
              <span className="text-sm text-ink-500">in {years} years</span>
            </div>
            <p className="mt-1 text-sm text-ink-500">
              Investing about{' '}
              <span className="font-semibold text-ink-700">
                {formatCurrency(monthly, { cents: false })}/mo
              </span>{' '}
              in your {profile.name.toLowerCase()} portfolio
            </p>
          </div>
        </div>

        <div className="px-2 pb-2 pt-4">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1b2230" vertical={false} />
              <XAxis
                dataKey="year"
                tickFormatter={(v) => (v === 0 ? 'Now' : `${v}y`)}
                tick={{ fill: '#808ea6', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => formatCompactCurrency(v)}
                tick={{ fill: '#808ea6', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={56}
              />
              <Tooltip content={<ProjectionTooltip />} />
              <Area
                dataKey="range"
                stroke="none"
                fill="url(#bandFill)"
                isAnimationActive={false}
              />
              <Line
                dataKey="contributions"
                stroke="#adb6c7"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                isAnimationActive={false}
              />
              <Line
                dataKey="expected"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <h3 className="mb-4 font-bold text-ink-900">Adjust your plan</h3>

          <div className="space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium text-ink-600">
                  <Repeat size={14} /> Monthly investing
                </label>
                <span className="font-bold tabular text-ink-900">
                  {formatCurrency(monthly, { cents: false })}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={500}
                step={5}
                value={monthly}
                onChange={(e) => setMonthly(Number(e.target.value))}
                className="w-full accent-brand-600"
              />
              <p className="mt-1.5 text-xs text-ink-400">
                Your recent round-ups average about{' '}
                {formatCurrency(estimated, { cents: false })}/mo.
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium text-ink-600">
                  <TrendingUp size={14} /> Time horizon
                </label>
                <span className="font-bold tabular text-ink-900">{years} years</span>
              </div>
              <input
                type="range"
                min={1}
                max={40}
                step={1}
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full accent-brand-600"
              />
              <p className="mt-1.5 text-xs text-ink-400">
                Assumes ~{formatPercent(profile.expectedReturn)} average annual return.
                Markets fluctuate.
              </p>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2 lg:grid-rows-1">
          <ResultCard
            label="Projected value"
            value={formatCurrency(final.expected, { cents: false })}
            sub={`in ${years} years`}
            tone="brand"
          />
          <ResultCard
            label="You'll have invested"
            value={formatCurrency(totalContrib, { cents: false })}
            sub="total contributions"
            tone="neutral"
          />
          <ResultCard
            label="Projected earnings"
            value={formatCurrency(projectedEarnings, { cents: false })}
            sub="growth from the market"
            tone="positive"
          />
          <div className="sm:col-span-3">
            <Card className="h-full bg-gradient-to-br from-brand-600 to-brand-700 p-5 text-white">
              <p className="text-sm font-semibold text-brand-50">
                The magic of compounding
              </p>
              <p className="mt-2 text-sm leading-relaxed text-brand-50/90">
                Of your projected{' '}
                <span className="font-bold text-white">
                  {formatCurrency(final.expected, { cents: false })}
                </span>
                , roughly{' '}
                <span className="font-bold text-white">
                  {formatPercent(
                    final.expected > 0 ? projectedEarnings / final.expected : 0,
                    0
                  )}
                </span>{' '}
                comes from investment growth — not from your own pocket. That's spare
                change quietly working for you.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: 'brand' | 'neutral' | 'positive';
}) {
  const tones: Record<string, string> = {
    brand: 'text-brand-400',
    positive: 'text-brand-400',
    neutral: 'text-ink-900',
  };
  return (
    <Card className="p-5">
      <p className="text-xs font-medium text-ink-500">{label}</p>
      <p className={cn('mt-1.5 text-2xl font-extrabold tabular', tones[tone])}>{value}</p>
      <p className="mt-0.5 text-xs text-ink-400">{sub}</p>
    </Card>
  );
}
