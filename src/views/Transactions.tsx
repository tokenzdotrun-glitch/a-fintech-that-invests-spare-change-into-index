import { useMemo, useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/format';
import { Button, Card, cn } from '../components/ui';
import { TransactionRow } from '../components/TransactionRow';
import { RoundUpWallet } from '../components/RoundUpWallet';
import { CATEGORIES } from '../lib/categories';
import { format } from 'date-fns';

type StatusFilter = 'all' | 'pending' | 'invested';

export function Transactions({ onSimulate }: { onSimulate: () => void }) {
  const { state } = useStore();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [category, setCategory] = useState<string>('all');

  const filtered = useMemo(() => {
    return state.transactions.filter((t) => {
      if (status !== 'all' && t.status !== status) return false;
      if (category !== 'all' && t.category !== category) return false;
      if (query && !t.merchant.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    });
  }, [state.transactions, status, category, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const tx of filtered) {
      const key = format(new Date(tx.date), 'EEEE, MMM d');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(tx);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const totalRoundUps = state.transactions.reduce((s, t) => s + t.roundUp, 0);
  const totalSpend = state.transactions.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <div className="flex flex-col gap-4 p-5">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search merchants…"
                  className="w-full rounded-xl border border-ink-200 bg-surface-sunken py-2.5 pl-9 pr-3 text-sm text-ink-800 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25"
                />
              </div>
              <Button onClick={onSimulate} className="shrink-0">
                <Plus size={16} /> Purchase
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(['all', 'pending', 'invested'] as StatusFilter[]).map((s) => (
                <FilterChip
                  key={s}
                  active={status === s}
                  onClick={() => setStatus(s)}
                >
                  {s === 'all' ? 'All' : s === 'pending' ? 'Pending' : 'Invested'}
                </FilterChip>
              ))}
              <span className="mx-1 h-5 w-px bg-ink-200" />
              <FilterChip
                active={category === 'all'}
                onClick={() => setCategory('all')}
              >
                All categories
              </FilterChip>
              {CATEGORIES.map((c) => (
                <FilterChip
                  key={c}
                  active={category === c}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </FilterChip>
              ))}
            </div>
          </div>
        </Card>

        {grouped.length === 0 ? (
          <Card className="p-10 text-center text-sm text-ink-400">
            No transactions match your filters.
          </Card>
        ) : (
          <div className="space-y-5">
            {grouped.map(([day, txs]) => (
              <div key={day}>
                <div className="mb-1 flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-ink-400">
                    {day}
                  </h3>
                  <span className="text-xs font-semibold text-brand-400">
                    +{formatCurrency(txs.reduce((s, t) => s + t.roundUp, 0))}
                  </span>
                </div>
                <Card>
                  <div className="divide-y divide-ink-100 px-5">
                    {txs.map((tx) => (
                      <TransactionRow key={tx.id} tx={tx} />
                    ))}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <RoundUpWallet />
        <Card className="p-5">
          <h3 className="mb-4 font-bold text-ink-900">Lifetime round-ups</h3>
          <div className="space-y-3">
            <SummaryRow label="Total spare change" value={formatCurrency(totalRoundUps)} accent />
            <SummaryRow label="Purchases tracked" value={String(state.transactions.length)} />
            <SummaryRow label="Total spend rounded" value={formatCurrency(totalSpend)} />
            <SummaryRow
              label="Avg. round-up / purchase"
              value={formatCurrency(
                state.transactions.length
                  ? totalRoundUps / state.transactions.length
                  : 0
              )}
            />
          </div>
        </Card>
      </div>
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
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
        active
          ? 'border-brand-500/60 bg-brand-500/15 text-brand-300'
          : 'border-ink-200 text-ink-500 hover:bg-ink-100 hover:text-ink-700'
      )}
    >
      {children}
    </button>
  );
}

function SummaryRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-ink-500">{label}</span>
      <span
        className={cn(
          'font-bold tabular',
          accent ? 'text-lg text-brand-400' : 'text-ink-800'
        )}
      >
        {value}
      </span>
    </div>
  );
}
