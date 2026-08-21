import { PiggyBank, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/format';
import { Button, Card, cn } from './ui';

export function RoundUpWallet({ compact = false }: { compact?: boolean }) {
  const { walletBalance, pendingTransactions, investNow, state } = useStore();
  const threshold = state.settings.sweepThreshold;
  const progress = Math.min(walletBalance / threshold, 1);
  const canInvest = walletBalance > 0;

  return (
    <Card className="overflow-hidden">
      <div className="relative bg-gradient-to-br from-brand-600 to-brand-700 p-5 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-brand-50">
            <PiggyBank size={18} />
            <span className="text-sm font-semibold">Round-up wallet</span>
          </div>
          {state.settings.autoInvest && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-[11px] font-semibold">
              <Zap size={11} /> Auto-invest on
            </span>
          )}
        </div>
        <div className="mt-3 flex items-end gap-2">
          <motion.span
            key={walletBalance}
            initial={{ scale: 0.96, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-extrabold tabular tracking-tight"
          >
            {formatCurrency(walletBalance)}
          </motion.span>
        </div>
        <p className="mt-1 text-sm text-brand-100">
          {pendingTransactions.length} pending round-up
          {pendingTransactions.length === 1 ? '' : 's'} ready to invest
        </p>

        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-xs text-brand-100">
            <span>Next auto-invest at {formatCurrency(threshold, { cents: false })}</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/20">
            <motion.div
              className="h-full rounded-full bg-white"
              initial={false}
              animate={{ width: `${progress * 100}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 26 }}
            />
          </div>
        </div>
      </div>

      {!compact && (
        <div className="p-5">
          <Button
            onClick={investNow}
            disabled={!canInvest}
            className={cn('w-full')}
          >
            Invest {formatCurrency(walletBalance)} now
          </Button>
          <p className="mt-2.5 text-center text-xs text-ink-400">
            Invested into your {state.settings.riskProfile} index portfolio
          </p>
        </div>
      )}
    </Card>
  );
}
