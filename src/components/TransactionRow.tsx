import { format, isToday, isYesterday } from 'date-fns';
import type { Transaction } from '../lib/types';
import { categoryStyle } from '../lib/categories';
import { formatCurrency } from '../lib/format';
import { cn } from './ui';

function relativeDay(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d)) return `Today · ${format(d, 'h:mm a')}`;
  if (isYesterday(d)) return `Yesterday · ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d · h:mm a');
}

export function TransactionRow({ tx }: { tx: Transaction }) {
  const style = categoryStyle(tx.category);
  const Icon = style.icon;
  return (
    <div className="flex items-center gap-3 py-3">
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          style.bg,
          style.fg
        )}
      >
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-ink-900">{tx.merchant}</p>
          {tx.status === 'pending' ? (
            <span className="shrink-0 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300">
              Pending
            </span>
          ) : null}
        </div>
        <p className="truncate text-xs text-ink-400">
          {tx.category} · {relativeDay(tx.date)}
        </p>
      </div>
      <div className="text-right">
        <p className="font-semibold tabular text-ink-800">
          {formatCurrency(-tx.amount)}
        </p>
        {tx.roundUp > 0 ? (
          <p className="text-xs font-semibold tabular text-brand-400">
            +{formatCurrency(tx.roundUp)} saved
          </p>
        ) : (
          <p className="text-xs text-ink-400">no round-up</p>
        )}
      </div>
    </div>
  );
}
