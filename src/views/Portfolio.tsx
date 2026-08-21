import { useMemo } from 'react';
import { TrendingDown, TrendingUp, Check } from 'lucide-react';
import { FUNDS, RISK_ORDER, RISK_PROFILES } from '../lib/portfolios';
import { priceAt } from '../lib/engine';
import { useStore } from '../lib/store';
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatSignedPercent,
} from '../lib/format';
import { Card, cn } from '../components/ui';
import { AllocationDonut } from '../components/AllocationDonut';
import { Sparkline } from '../components/Sparkline';
import type { RiskProfileId } from '../lib/types';

const MS_DAY = 86_400_000;

export function Portfolio() {
  const { state, updateSettings } = useStore();
  const now = Date.now();
  const profile = RISK_PROFILES[state.settings.riskProfile];

  const fundRows = useMemo(() => {
    return FUNDS.map((fund) => {
      let shares = 0;
      let basis = 0;
      for (const ev of state.investments) {
        const s = ev.byFund[fund.id] ?? 0;
        if (s > 0) {
          shares += s;
          basis += s * priceAt(fund.id, ev.date);
        }
      }
      const price = priceAt(fund.id, now);
      const prev = priceAt(fund.id, now - MS_DAY);
      const value = shares * price;
      const gain = value - basis;
      const gainPct = basis > 0 ? gain / basis : 0;
      const dayChange = prev > 0 ? (price - prev) / prev : 0;
      const series: number[] = [];
      for (let i = 29; i >= 0; i--) series.push(priceAt(fund.id, now - i * MS_DAY));
      return { fund, shares, value, basis, gain, gainPct, price, dayChange, series };
    });
  }, [state.investments, now]);

  const held = fundRows.filter((r) => r.value > 0);
  const totalValue = held.reduce((s, r) => s + r.value, 0);
  const holdings = held
    .map((r) => ({
      fund: r.fund,
      shares: r.shares,
      value: r.value,
      weight: totalValue > 0 ? r.value / totalValue : 0,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <h3 className="mb-1 font-bold text-ink-900">Current allocation</h3>
          <p className="mb-3 text-sm text-ink-500">How your money is diversified today</p>
          <AllocationDonut holdings={holdings} total={totalValue} />
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-1 font-bold text-ink-900">Choose your portfolio</h3>
          <p className="mb-4 text-sm text-ink-500">
            New round-ups are invested into low-cost index funds matching your risk level.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {RISK_ORDER.map((id) => (
              <ProfileCard
                key={id}
                id={id}
                selected={state.settings.riskProfile === id}
                onSelect={() => updateSettings({ riskProfile: id })}
              />
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-ink-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-ink-700">
                {profile.name} target mix
              </span>
              <span className="text-sm font-semibold text-brand-600">
                ~{formatPercent(profile.expectedReturn)} / yr historical
              </span>
            </div>
            <AllocationBar profileId={profile.id} />
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-5 pb-2">
          <h3 className="font-bold text-ink-900">Your holdings</h3>
        </div>
        {held.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-400">
            You haven't invested yet. Add a purchase to start rounding up.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                  <th className="px-5 py-2.5">Fund</th>
                  <th className="px-3 py-2.5 text-right">Price</th>
                  <th className="px-3 py-2.5 text-right">30-day</th>
                  <th className="px-3 py-2.5 text-right">Shares</th>
                  <th className="px-3 py-2.5 text-right">Value</th>
                  <th className="px-5 py-2.5 text-right">Return</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {held.map((row) => (
                  <tr key={row.fund.id} className="text-sm">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-white"
                          style={{ backgroundColor: row.fund.color }}
                        >
                          {row.fund.ticker.slice(0, 2)}
                        </span>
                        <div>
                          <p className="font-semibold text-ink-900">{row.fund.ticker}</p>
                          <p className="text-xs text-ink-400">{row.fund.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <p className="font-semibold tabular text-ink-800">
                        {formatCurrency(row.price)}
                      </p>
                      <p
                        className={cn(
                          'text-xs font-semibold tabular',
                          row.dayChange >= 0 ? 'text-brand-600' : 'text-rose-600'
                        )}
                      >
                        {formatSignedPercent(row.dayChange)}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end">
                        <Sparkline values={row.series} color={row.fund.color} />
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right tabular text-ink-600">
                      {formatNumber(row.shares, 4)}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold tabular text-ink-900">
                      {formatCurrency(row.value)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 font-semibold tabular',
                          row.gain >= 0 ? 'text-brand-600' : 'text-rose-600'
                        )}
                      >
                        {row.gain >= 0 ? (
                          <TrendingUp size={13} />
                        ) : (
                          <TrendingDown size={13} />
                        )}
                        {formatSignedPercent(row.gainPct)}
                      </span>
                      <p className="text-xs text-ink-400 tabular">
                        {formatCurrency(row.gain, { sign: true })}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function ProfileCard({
  id,
  selected,
  onSelect,
}: {
  id: RiskProfileId;
  selected: boolean;
  onSelect: () => void;
}) {
  const profile = RISK_PROFILES[id];
  return (
    <button
      onClick={onSelect}
      className={cn(
        'relative rounded-xl border p-4 text-left transition',
        selected
          ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100'
          : 'border-ink-200 hover:border-ink-300 hover:bg-ink-50'
      )}
    >
      {selected && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white">
          <Check size={13} />
        </span>
      )}
      <p className="font-bold text-ink-900">{profile.name}</p>
      <p className="mt-1 text-2xl font-extrabold text-brand-600">
        {formatPercent(profile.expectedReturn)}
      </p>
      <p className="text-[11px] font-medium text-ink-400">avg. annual return</p>
      <p className="mt-2 text-xs leading-snug text-ink-500">{profile.blurb}</p>
    </button>
  );
}

function AllocationBar({ profileId }: { profileId: RiskProfileId }) {
  const alloc = RISK_PROFILES[profileId].allocation;
  const segments = FUNDS.filter((f) => (alloc[f.id] ?? 0) > 0);
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full">
        {segments.map((f) => (
          <div
            key={f.id}
            style={{ width: `${(alloc[f.id] ?? 0) * 100}%`, backgroundColor: f.color }}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {segments.map((f) => (
          <div key={f.id} className="flex items-center gap-1.5 text-xs">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: f.color }}
            />
            <span className="font-semibold text-ink-700">{f.ticker}</span>
            <span className="text-ink-400">{formatPercent(alloc[f.id] ?? 0, 0)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
