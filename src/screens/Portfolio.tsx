import { useState } from 'react';
import { Check, Info, Shuffle, TrendingUp } from 'lucide-react';
import { AllocationDonut } from '../components/Charts';
import { Badge, Button, Card, Modal, SectionTitle } from '../components/ui';
import { PORTFOLIO_LIST } from '../lib/data';
import { formatCurrency, formatPct } from '../lib/finance';
import type { PortfolioId } from '../lib/types';
import { useDerivedPortfolio } from '../state/derived';
import { useStore } from '../state/store';

export default function Portfolio() {
  const { state, dispatch } = useStore();
  const d = useDerivedPortfolio();
  const [switching, setSwitching] = useState(false);

  const blendedExpense =
    d.holdings.reduce((s, h) => s + h.weight * h.fund.expenseRatio, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Portfolio</h1>
          <p className="text-sm text-slate-500">
            {d.portfolio.name} · {d.portfolio.tagline}
          </p>
        </div>
        <Button variant="secondary" onClick={() => setSwitching(true)}>
          <Shuffle className="h-4 w-4" /> Change plan
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-2">
          <SectionTitle title="Allocation" subtitle="Target weights by fund" />
          <div className="relative">
            <AllocationDonut holdings={d.holdings} size={220} />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-slate-400">Value</span>
              <span className="text-xl font-extrabold text-slate-900 tabular">
                {formatCurrency(d.value.currentValue, { cents: false })}
              </span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <MetricPill label="Risk" value={d.portfolio.risk} />
            <MetricPill label="Est. return" value={`${(d.portfolio.expectedReturn * 100).toFixed(1)}%`} />
            <MetricPill label="Avg. fee" value={`${(blendedExpense * 100).toFixed(2)}%`} />
          </div>
        </Card>

        <Card className="p-5 lg:col-span-3">
          <SectionTitle title="Holdings" subtitle="Your money across index funds" />
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-2.5">Fund</th>
                  <th className="px-4 py-2.5 text-right">Target</th>
                  <th className="px-4 py-2.5 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {d.holdings.map((h) => (
                  <tr key={h.fund.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-8 w-1.5 rounded-full"
                          style={{ backgroundColor: h.fund.color }}
                        />
                        <div>
                          <div className="font-semibold text-slate-800">
                            {h.fund.ticker}{' '}
                            <span className="font-normal text-slate-400">· {h.fund.name}</span>
                          </div>
                          <div className="text-xs text-slate-400">
                            {h.fund.category} · {(h.fund.expenseRatio * 100).toFixed(2)}% fee
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-700 tabular">
                      {(h.weight * 100).toFixed(0)}%
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900 tabular">
                      {formatCurrency(h.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <span>
              Sprout automatically rebalances your holdings toward these targets as you invest.
              Values shown are illustrative simulations, not investment advice.
            </span>
          </div>
        </Card>
      </div>

      {/* Fund detail cards */}
      <div>
        <SectionTitle title="Inside your funds" subtitle="What each index fund holds" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {d.holdings.map((h) => {
            const gain = h.fund.expectedReturn;
            return (
              <Card key={h.fund.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
                      style={{ backgroundColor: h.fund.color }}
                    >
                      <TrendingUp className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <div className="font-bold text-slate-900">{h.fund.ticker}</div>
                      <div className="text-xs text-slate-400">{h.fund.category}</div>
                    </div>
                  </div>
                  <Badge tone="green">{formatPct(gain, 1)}/yr</Badge>
                </div>
                <p className="mt-3 text-sm text-slate-600">{h.fund.description}</p>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <span>{(h.weight * 100).toFixed(0)}% of portfolio</span>
                  <span className="font-semibold text-slate-700 tabular">
                    {formatCurrency(h.value)}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <SwitchModal
        open={switching}
        current={state.portfolioId}
        onClose={() => setSwitching(false)}
        onSelect={(id) => {
          dispatch({ type: 'setPortfolio', payload: id });
          setSwitching(false);
        }}
      />
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-2 py-2">
      <div className="text-[11px] text-slate-400">{label}</div>
      <div className="text-sm font-bold text-slate-900">{value}</div>
    </div>
  );
}

function SwitchModal({
  open,
  current,
  onClose,
  onSelect,
}: {
  open: boolean;
  current: PortfolioId;
  onClose: () => void;
  onSelect: (id: PortfolioId) => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Choose your plan">
      <div className="space-y-3">
        {PORTFOLIO_LIST.map((p) => {
          const selected = p.id === current;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={`w-full rounded-2xl border p-4 text-left transition ${
                selected
                  ? 'border-sprout-500 bg-sprout-50/60 ring-2 ring-sprout-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    {p.name}
                    {selected && <Check className="h-4 w-4 text-sprout-600" />}
                  </div>
                  <div className="text-xs text-slate-500">{p.tagline}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-sprout-700">
                    {(p.expectedReturn * 100).toFixed(1)}%
                  </div>
                  <div className="text-[11px] text-slate-400">{p.risk} risk</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
