import { Star, TrendingUp, TrendingDown } from 'lucide-react';
import { useStore } from '../lib/store';
import { sparklineFor } from '../lib/catalog';
import { formatPercent } from '../lib/format';
import { Sparkline } from './Sparkline';
import { cn } from './ui';
import type { CatalogAsset } from '../lib/types';

export function FundCard({
  asset,
  held = false,
  onOpen,
}: {
  asset: CatalogAsset;
  held?: boolean;
  onOpen: () => void;
}) {
  const { isWatched, toggleWatch } = useStore();
  const watched = isWatched(asset.id);
  const up = asset.momentum >= 0;
  const series = sparklineFor(asset);

  return (
    <button
      onClick={onOpen}
      className="group flex w-full flex-col rounded-2xl border border-ink-100 bg-surface p-4 text-left shadow-card transition hover:border-ink-200 hover:shadow-soft"
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white"
          style={{ backgroundColor: asset.color }}
        >
          {asset.ticker.slice(0, 2)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate font-bold text-ink-900">{asset.ticker}</p>
            {(asset.core || held) && (
              <span className="shrink-0 rounded-full bg-brand-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-300">
                {asset.core ? 'Core' : 'Owned'}
              </span>
            )}
          </div>
          <p className="truncate text-xs text-ink-400">{asset.name}</p>
        </div>
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            toggleWatch(asset.id);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              toggleWatch(asset.id);
            }
          }}
          aria-label={watched ? 'Remove from watchlist' : 'Add to watchlist'}
          className={cn(
            '-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition',
            watched
              ? 'text-amber-300 hover:bg-amber-500/15'
              : 'text-ink-400 hover:bg-ink-100 hover:text-ink-600'
          )}
        >
          <Star size={16} fill={watched ? 'currentColor' : 'none'} />
        </span>
      </div>

      <div className="mt-3 -mx-1">
        <Sparkline data={series} color={asset.color} height={44} />
      </div>

      <div className="mt-2 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-medium text-ink-400">Category</p>
          <p className="text-xs font-semibold text-ink-600">{asset.category}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-medium text-ink-400">30-day</p>
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-sm font-bold tabular',
              up ? 'text-brand-400' : 'text-rose-400'
            )}
          >
            {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {up ? '+' : '−'}
            {formatPercent(Math.abs(asset.momentum))}
          </span>
        </div>
      </div>
    </button>
  );
}
