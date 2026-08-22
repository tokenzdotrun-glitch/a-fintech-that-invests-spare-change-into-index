import { useMemo, useState } from 'react';
import { Search, Compass, Flame, Wallet, Star, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { CATALOG, ASSET_CATEGORIES } from '../lib/catalog';
import { contributionsByFund } from '../lib/engine';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/format';
import { Card, cn } from '../components/ui';
import { FundCard } from '../components/FundCard';
import { FundDetailModal } from '../components/FundDetailModal';
import type { CatalogAsset } from '../lib/types';

type SortKey = 'trending' | 'popular' | 'return' | 'fee' | 'az';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'trending', label: 'Trending' },
  { key: 'popular', label: 'Most popular' },
  { key: 'return', label: 'Highest return' },
  { key: 'fee', label: 'Lowest fee' },
  { key: 'az', label: 'A–Z' },
];

export function Explore() {
  const { state, walletBalance } = useStore();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [sort, setSort] = useState<SortKey>('trending');
  const [selected, setSelected] = useState<CatalogAsset | null>(null);

  const heldSet = useMemo(() => {
    const held = contributionsByFund(state.investments, Date.now());
    return new Set(Object.keys(held).filter((id) => (held[id] ?? 0) > 0));
  }, [state.investments]);

  const trending = useMemo(
    () => [...CATALOG].sort((a, b) => b.momentum - a.momentum).slice(0, 6),
    []
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = CATALOG.filter((a) => {
      if (category === 'watchlist' && !state.watchlist.includes(a.id)) return false;
      if (category !== 'all' && category !== 'watchlist' && a.category !== category)
        return false;
      if (q) {
        const hay = `${a.ticker} ${a.name} ${a.category} ${a.tags.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    list = list.sort((a, b) => {
      switch (sort) {
        case 'popular':
          return b.popularity - a.popularity;
        case 'return':
          return b.expectedReturn - a.expectedReturn;
        case 'fee':
          return a.expenseRatio - b.expenseRatio;
        case 'az':
          return a.ticker.localeCompare(b.ticker);
        case 'trending':
        default:
          return b.momentum - a.momentum;
      }
    });
    return list;
  }, [query, category, sort, state.watchlist]);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="overflow-hidden">
        <div className="relative bg-gradient-to-br from-brand-600 to-brand-700 p-6 text-white">
          <div className="flex items-center gap-2 text-brand-50">
            <Compass size={18} />
            <span className="text-sm font-semibold">Explore</span>
          </div>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight">
            Discover new funds to invest in
          </h2>
          <p className="mt-1 max-w-xl text-sm text-brand-50/90">
            Browse {CATALOG.length} low-cost index funds & ETFs across every asset class.
            Star what you like and put your spare change to work with a tap.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold">
            <Wallet size={15} />
            {formatCurrency(walletBalance)} ready to invest
          </div>
        </div>
      </Card>

      {/* Trending strip */}
      <div>
        <div className="mb-3 flex items-center gap-2 px-1">
          <Flame size={17} className="text-amber-400" />
          <h3 className="font-bold text-ink-900">Trending this week</h3>
        </div>
        <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {trending.map((asset) => (
            <div key={asset.id} className="w-64 shrink-0">
              <FundCard
                asset={asset}
                held={heldSet.has(asset.id)}
                onOpen={() => setSelected(asset)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search funds, tickers or themes…"
                className="w-full rounded-xl border border-ink-200 bg-surface-sunken py-2.5 pl-9 pr-3 text-sm text-ink-800 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25"
              />
            </div>
            <div className="relative shrink-0">
              <SlidersHorizontal
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
              />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="w-full appearance-none rounded-xl border border-ink-200 bg-surface-sunken py-2.5 pl-9 pr-8 text-sm font-semibold text-ink-700 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 sm:w-52"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FilterChip active={category === 'all'} onClick={() => setCategory('all')}>
              All
            </FilterChip>
            <FilterChip
              active={category === 'watchlist'}
              onClick={() => setCategory('watchlist')}
            >
              <Star size={12} className="mr-1 inline" fill="currentColor" />
              Watchlist
              {state.watchlist.length > 0 ? ` · ${state.watchlist.length}` : ''}
            </FilterChip>
            <span className="mx-1 h-5 w-px bg-ink-200" />
            {ASSET_CATEGORIES.map((c) => (
              <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>
                {c}
              </FilterChip>
            ))}
          </div>
        </div>
      </Card>

      {/* Results */}
      {results.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-sm text-ink-400">
            {category === 'watchlist'
              ? 'Your watchlist is empty. Tap the star on any fund to save it here.'
              : 'No funds match your search. Try a different term or category.'}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((asset) => (
            <FundCard
              key={asset.id}
              asset={asset}
              held={heldSet.has(asset.id)}
              onOpen={() => setSelected(asset)}
            />
          ))}
        </div>
      )}

      <FundDetailModal asset={selected} onClose={() => setSelected(null)} />
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
        'inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition',
        active
          ? 'border-brand-500/60 bg-brand-500/15 text-brand-300'
          : 'border-ink-200 text-ink-500 hover:bg-ink-100 hover:text-ink-700'
      )}
    >
      {children}
    </button>
  );
}
