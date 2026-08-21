import { RotateCcw, Zap, Repeat, Coins, ShieldCheck } from 'lucide-react';
import { useStore } from '../lib/store';
import { RISK_ORDER, RISK_PROFILES } from '../lib/portfolios';
import { formatCurrency, formatPercent } from '../lib/format';
import { Button, Card, cn } from '../components/ui';

const MULTIPLIERS = [1, 2, 3, 10] as const;
const THRESHOLDS = [5, 10, 25, 50];
const RECURRING = [0, 5, 10, 25, 50];

export function Settings() {
  const { state, updateSettings, reset } = useStore();
  const s = state.settings;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <SettingHeader
          icon={<Coins size={18} />}
          title="Round-up multiplier"
          desc="Multiply the spare change from every purchase to invest faster."
        />
        <div className="flex flex-wrap gap-2 p-5 pt-0">
          {MULTIPLIERS.map((m) => (
            <button
              key={m}
              onClick={() => updateSettings({ roundUpMultiplier: m })}
              className={cn(
                'flex-1 rounded-xl border px-4 py-3 text-center font-bold transition',
                s.roundUpMultiplier === m
                  ? 'border-brand-500/60 bg-brand-500/15 text-brand-300'
                  : 'border-ink-200 text-ink-500 hover:bg-ink-100 hover:text-ink-700'
              )}
            >
              {m}×
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <SettingHeader
          icon={<Zap size={18} />}
          title="Automatic investing"
          desc="Sweep your round-up wallet into index funds automatically."
        />
        <div className="space-y-5 p-5 pt-0">
          <div className="flex items-center justify-between rounded-xl bg-surface-sunken px-4 py-3">
            <div>
              <p className="font-semibold text-ink-800">Auto-invest</p>
              <p className="text-xs text-ink-500">
                Invest once your wallet reaches the threshold below.
              </p>
            </div>
            <Toggle
              on={s.autoInvest}
              onChange={(v) => updateSettings({ autoInvest: v })}
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-ink-700">Invest threshold</p>
            <div className="flex flex-wrap gap-2">
              {THRESHOLDS.map((t) => (
                <button
                  key={t}
                  onClick={() => updateSettings({ sweepThreshold: t })}
                  disabled={!s.autoInvest}
                  className={cn(
                    'flex-1 rounded-xl border px-3 py-2.5 text-center text-sm font-semibold transition disabled:opacity-40',
                    s.sweepThreshold === t
                      ? 'border-brand-500/60 bg-brand-500/15 text-brand-300'
                      : 'border-ink-200 text-ink-500 hover:bg-ink-100 hover:text-ink-700'
                  )}
                >
                  {formatCurrency(t, { cents: false })}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <SettingHeader
          icon={<Repeat size={18} />}
          title="Recurring boost"
          desc="Add a fixed weekly amount on top of your round-ups."
        />
        <div className="flex flex-wrap gap-2 p-5 pt-0">
          {RECURRING.map((r) => (
            <button
              key={r}
              onClick={() => updateSettings({ weeklyRecurring: r })}
              className={cn(
                'flex-1 rounded-xl border px-3 py-2.5 text-center text-sm font-semibold transition',
                s.weeklyRecurring === r
                  ? 'border-brand-500/60 bg-brand-500/15 text-brand-300'
                  : 'border-ink-200 text-ink-500 hover:bg-ink-100 hover:text-ink-700'
              )}
            >
              {r === 0 ? 'Off' : `${formatCurrency(r, { cents: false })}/wk`}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <SettingHeader
          icon={<ShieldCheck size={18} />}
          title="Risk profile"
          desc="Sets the index-fund mix for new investments."
        />
        <div className="grid gap-3 p-5 pt-0 sm:grid-cols-3">
          {RISK_ORDER.map((id) => {
            const p = RISK_PROFILES[id];
            const active = s.riskProfile === id;
            return (
              <button
                key={id}
                onClick={() => updateSettings({ riskProfile: id })}
                className={cn(
                  'rounded-xl border p-4 text-left transition',
                  active
                    ? 'border-brand-500/60 bg-brand-500/15 ring-2 ring-brand-500/25'
                    : 'border-ink-200 hover:bg-ink-100'
                )}
              >
                <p className="font-bold text-ink-900">{p.name}</p>
                <p className="text-sm font-semibold text-brand-400">
                  {formatPercent(p.expectedReturn)}/yr
                </p>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="border-rose-500/30">
        <SettingHeader
          icon={<RotateCcw size={18} />}
          title="Reset demo"
          desc="Wipe this account and generate a fresh set of sample data."
        />
        <div className="p-5 pt-0">
          <Button
            variant="danger"
            onClick={() => {
              if (
                confirm(
                  'Reset all data and generate a new sample account? This cannot be undone.'
                )
              ) {
                reset();
              }
            }}
          >
            <RotateCcw size={16} /> Reset account data
          </Button>
        </div>
      </Card>

      <p className="pb-4 text-center text-xs text-ink-400">
        Acol is a product demo. Balances, prices, and returns are simulated for
        illustration only and are not investment advice.
      </p>
    </div>
  );
}

function SettingHeader({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3 p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-ink-900">{title}</h3>
        <p className="text-sm text-ink-500">{desc}</p>
      </div>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors',
        on ? 'bg-brand-500' : 'bg-ink-300'
      )}
      role="switch"
      aria-checked={on}
    >
      <span
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
          on ? 'left-[22px]' : 'left-0.5'
        )}
      />
    </button>
  );
}
