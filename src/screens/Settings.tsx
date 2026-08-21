import { useState } from 'react';
import { LogOut, RefreshCw, Repeat, ShieldCheck, Trash2, Zap } from 'lucide-react';
import { Button, Card, Modal, SectionTitle } from '../components/ui';
import { formatCurrency } from '../lib/finance';
import type { Recurring, RoundUpMultiplier } from '../lib/types';
import { useStore } from '../state/store';

const MULTIPLIERS: RoundUpMultiplier[] = [1, 2, 3, 5, 10];

export default function Settings() {
  const { state, dispatch } = useStore();
  const [confirmReset, setConfirmReset] = useState(false);
  const [recurringOn, setRecurringOn] = useState(!!state.recurring);
  const [recurring, setRecurring] = useState<Recurring>(
    state.recurring ?? { amount: 15, frequency: 'weekly' }
  );

  const saveRecurring = (next: Recurring | null) => {
    dispatch({ type: 'setRecurring', payload: next });
  };

  const regenerate = () => {
    dispatch({
      type: 'onboard',
      payload: {
        name: state.name,
        portfolioId: state.portfolioId,
        roundUpMultiplier: state.roundUpMultiplier,
        recurring: state.recurring,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Tune how Sprout invests your spare change.</p>
      </div>

      <Card className="p-5">
        <SectionTitle title="Profile" />
        <label className="mb-1 block text-sm font-medium text-slate-600">Display name</label>
        <input
          value={state.name}
          onChange={(e) =>
            dispatch({
              type: 'hydrate',
              payload: { ...state, name: e.target.value },
            })
          }
          className="w-full rounded-xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-sprout-500 focus:ring-4 focus:ring-sprout-500/15"
        />
      </Card>

      <Card className="p-5">
        <SectionTitle title="Round-ups" subtitle="Multiply the spare change you invest" />
        <div className="grid grid-cols-5 gap-2">
          {MULTIPLIERS.map((m) => (
            <button
              key={m}
              onClick={() => dispatch({ type: 'setMultiplier', payload: m })}
              className={`rounded-xl border py-3 text-sm font-bold transition ${
                state.roundUpMultiplier === m
                  ? 'border-sprout-500 bg-sprout-600 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              {m}×
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-500">
          <Zap className="h-4 w-4 text-sprout-600" />
          Round-ups auto-invest once they reach{' '}
          <span className="font-semibold text-slate-700">
            {formatCurrency(state.autoInvestThreshold, { cents: false })}
          </span>
          .
        </div>
      </Card>

      <Card className="p-5">
        <SectionTitle title="Recurring deposit" subtitle="Add a steady boost on a schedule" />
        <label className="flex cursor-pointer items-center justify-between">
          <span className="flex items-center gap-2 font-semibold text-slate-800">
            <Repeat className="h-4 w-4 text-sprout-600" /> Enable recurring deposit
          </span>
          <span
            onClick={() => {
              const next = !recurringOn;
              setRecurringOn(next);
              saveRecurring(next ? recurring : null);
            }}
            className={`relative h-6 w-11 rounded-full transition ${
              recurringOn ? 'bg-sprout-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                recurringOn ? 'left-[22px]' : 'left-0.5'
              }`}
            />
          </span>
        </label>
        {recurringOn && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Amount</label>
              <div className="flex items-center rounded-xl border border-slate-200 px-3">
                <span className="text-slate-400">$</span>
                <input
                  type="number"
                  min={1}
                  value={recurring.amount}
                  onChange={(e) => {
                    const next = { ...recurring, amount: Math.max(1, Number(e.target.value) || 0) };
                    setRecurring(next);
                    saveRecurring(next);
                  }}
                  className="w-full bg-transparent py-2.5 pl-1 font-semibold outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Frequency</label>
              <select
                value={recurring.frequency}
                onChange={(e) => {
                  const next = {
                    ...recurring,
                    frequency: e.target.value as Recurring['frequency'],
                  };
                  setRecurring(next);
                  saveRecurring(next);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 font-semibold outline-none"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <SectionTitle title="Demo data" subtitle="Sprout is a simulation — no real money moves" />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary" onClick={regenerate} full>
            <RefreshCw className="h-4 w-4" /> Regenerate sample history
          </Button>
          <Button variant="danger" onClick={() => setConfirmReset(true)} full>
            <Trash2 className="h-4 w-4" /> Reset account
          </Button>
        </div>
      </Card>

      <div className="flex items-center justify-center gap-2 pb-4 text-xs text-slate-400">
        <ShieldCheck className="h-4 w-4" />
        Sprout is a demo. All figures are simulated and not investment advice.
      </div>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset your account?">
        <p className="text-sm text-slate-600">
          This clears all simulated purchases, investments and settings, and returns you to the
          welcome screen. This can’t be undone.
        </p>
        <div className="mt-5 flex gap-3">
          <Button variant="secondary" full onClick={() => setConfirmReset(false)}>
            Cancel
          </Button>
          <Button variant="danger" full onClick={() => dispatch({ type: 'reset' })}>
            <LogOut className="h-4 w-4" /> Reset
          </Button>
        </div>
      </Modal>
    </div>
  );
}
