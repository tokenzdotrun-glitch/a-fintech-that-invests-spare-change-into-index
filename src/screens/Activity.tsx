import { useMemo, useState } from 'react';
import { CreditCard, Filter, Plus, TrendingUp, Zap } from 'lucide-react';
import { CATEGORY_COLOR, CATEGORY_ICON } from '../components/icons';
import { Badge, Button, Card } from '../components/ui';
import { formatCurrency, relativeDay } from '../lib/finance';
import type { InvestmentSource, TxCategory } from '../lib/types';
import { useStore } from '../state/store';

type Tab = 'spending' | 'invested';

const SOURCE_LABEL: Record<InvestmentSource, string> = {
  roundup: 'Round-ups',
  recurring: 'Recurring deposit',
  onetime: 'One-time',
  bonus: 'Bonus',
};

const SOURCE_TONE: Record<InvestmentSource, 'green' | 'blue' | 'amber' | 'neutral'> = {
  roundup: 'green',
  recurring: 'blue',
  onetime: 'neutral',
  bonus: 'amber',
};

export default function Activity() {
  const { state, simulatePurchase, pending, dispatch } = useStore();
  const [tab, setTab] = useState<Tab>('spending');
  const [category, setCategory] = useState<TxCategory | 'all'>('all');

  const categories = useMemo(() => {
    const set = new Set<TxCategory>();
    state.transactions.forEach((t) => set.add(t.category));
    return Array.from(set);
  }, [state.transactions]);

  const filteredTx = useMemo(
    () =>
      category === 'all'
        ? state.transactions
        : state.transactions.filter((t) => t.category === category),
    [state.transactions, category]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Activity</h1>
          <p className="text-sm text-slate-500">Every purchase, round-up and investment.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={simulatePurchase}>
            <Plus className="h-4 w-4" /> Simulate purchase
          </Button>
          <Button onClick={() => dispatch({ type: 'sweepRoundUps' })} disabled={pending <= 0}>
            <Zap className="h-4 w-4" /> Invest {formatCurrency(pending)}
          </Button>
        </div>
      </div>

      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        {(['spending', 'invested'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition ${
              tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t === 'spending' ? 'Spending & round-ups' : 'Investments'}
          </button>
        ))}
      </div>

      {tab === 'spending' && (
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <Filter className="h-4 w-4 shrink-0 text-slate-400" />
            <FilterChip active={category === 'all'} onClick={() => setCategory('all')}>
              All
            </FilterChip>
            {categories.map((c) => (
              <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>
                {c}
              </FilterChip>
            ))}
          </div>

          <div className="divide-y divide-slate-100">
            {filteredTx.map((t) => {
              const Icon = CATEGORY_ICON[t.category];
              return (
                <div key={t.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: `${CATEGORY_COLOR[t.category]}18`,
                        color: CATEGORY_COLOR[t.category],
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{t.merchant}</div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        {relativeDay(t.date)} · {t.category}
                        {t.swept ? (
                          <Badge tone="green" className="scale-90">
                            invested
                          </Badge>
                        ) : (
                          <Badge tone="amber" className="scale-90">
                            pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-700 tabular">
                      {formatCurrency(-t.amount)}
                    </div>
                    <div className="text-xs font-bold text-sprout-600 tabular">
                      +{formatCurrency(t.roundUp)} saved
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredTx.length === 0 && <Empty label="No purchases in this category yet." />}
          </div>
        </Card>
      )}

      {tab === 'invested' && (
        <Card className="p-5">
          <div className="divide-y divide-slate-100">
            {state.investments
              .slice()
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((inv) => (
                <div key={inv.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sprout-100 text-sprout-700">
                      {inv.source === 'roundup' ? (
                        <Zap className="h-5 w-5" />
                      ) : inv.source === 'recurring' ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        <CreditCard className="h-5 w-5" />
                      )}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">
                        {inv.note ?? SOURCE_LABEL[inv.source]}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        {relativeDay(inv.date)}
                        <Badge tone={SOURCE_TONE[inv.source]} className="scale-90">
                          {SOURCE_LABEL[inv.source]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-sprout-600 tabular">
                    +{formatCurrency(inv.amount)}
                  </div>
                </div>
              ))}
            {state.investments.length === 0 && <Empty label="No investments yet." />}
          </div>
        </Card>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition ${
        active ? 'bg-sprout-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {children}
    </button>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="py-10 text-center text-sm text-slate-400">{label}</div>;
}
