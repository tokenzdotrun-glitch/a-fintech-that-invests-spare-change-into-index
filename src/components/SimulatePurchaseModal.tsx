import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Dice5, Sparkles } from 'lucide-react';
import { CATEGORIES, categoryStyle } from '../lib/categories';
import { computeRoundUp, MERCHANTS } from '../lib/engine';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/format';
import { Button, cn } from './ui';

export function SimulatePurchaseModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { state, addTransaction } = useStore();
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('Coffee');
  const [amount, setAmount] = useState('');

  const numericAmount = parseFloat(amount);
  const valid = merchant.trim().length > 0 && numericAmount > 0;
  const roundUp = valid
    ? computeRoundUp(
        numericAmount,
        state.settings.roundTo,
        state.settings.roundUpMultiplier
      )
    : 0;

  function randomize() {
    const m = MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];
    const raw = m.min + Math.random() * (m.max - m.min);
    setMerchant(m.name);
    setCategory(m.category);
    setAmount((Math.round(raw * 100) / 100).toFixed(2));
  }

  function submit() {
    if (!valid) return;
    addTransaction({
      merchant: merchant.trim(),
      amount: Math.round(numericAmount * 100) / 100,
      category,
    });
    setMerchant('');
    setAmount('');
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md rounded-t-3xl border border-ink-100 bg-surface p-6 shadow-2xl sm:rounded-3xl"
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-ink-900">Simulate a purchase</h3>
                <p className="text-sm text-ink-500">
                  We'll round it up and invest the change.
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Merchant
                </label>
                <input
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder="e.g. Blue Bottle Coffee"
                  className="w-full rounded-xl border border-ink-200 bg-surface-sunken px-3.5 py-2.5 text-sm text-ink-800 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => {
                    const style = categoryStyle(c);
                    const Icon = style.icon;
                    const active = c === category;
                    return (
                      <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                          active
                            ? 'border-brand-500/60 bg-brand-500/15 text-brand-300'
                            : 'border-ink-200 text-ink-500 hover:bg-ink-100 hover:text-ink-700'
                        )}
                      >
                        <Icon size={13} />
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">
                    $
                  </span>
                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    inputMode="decimal"
                    placeholder="0.00"
                    className="w-full rounded-xl border border-ink-200 bg-surface-sunken py-2.5 pl-7 pr-3.5 text-sm tabular text-ink-800 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-brand-500/15 px-4 py-3">
                <span className="text-sm font-medium text-brand-200">
                  Spare change to invest
                </span>
                <span className="text-lg font-bold tabular text-brand-300">
                  {formatCurrency(roundUp)}
                </span>
              </div>

              <div className="flex gap-3 pt-1">
                <Button variant="secondary" onClick={randomize} className="flex-1">
                  <Dice5 size={16} /> Random
                </Button>
                <Button onClick={submit} disabled={!valid} className="flex-[1.4]">
                  <Sparkles size={16} /> Add purchase
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
