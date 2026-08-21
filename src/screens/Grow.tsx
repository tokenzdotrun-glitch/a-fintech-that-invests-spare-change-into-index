import { useMemo, useState } from 'react';
import { Plus, Rocket, Sparkles, TrendingUp } from 'lucide-react';
import { ProjectionChart } from '../components/Charts';
import { Button, Card, SectionTitle } from '../components/ui';
import { formatCurrency, projectGrowth, round2 } from '../lib/finance';
import { useDerivedPortfolio } from '../state/derived';
import { useStore } from '../state/store';

const QUICK = [25, 50, 100, 250];

export default function Grow() {
  const { state, dispatch } = useStore();
  const d = useDerivedPortfolio();

  // Estimate monthly contribution from recent round-up pace + recurring.
  const estimatedMonthly = useMemo(() => {
    const roundupMonthly = d.roundUpsThisWeek * 4.33;
    let recurringMonthly = 0;
    if (state.recurring) {
      const per =
        state.recurring.frequency === 'daily'
          ? 30
          : state.recurring.frequency === 'weekly'
          ? 4.33
          : 1;
      recurringMonthly = state.recurring.amount * per;
    }
    return Math.max(10, Math.round(roundupMonthly + recurringMonthly));
  }, [d.roundUpsThisWeek, state.recurring]);

  const [monthly, setMonthly] = useState(estimatedMonthly);
  const [years, setYears] = useState(20);
  const [amount, setAmount] = useState(50);
  const [flash, setFlash] = useState(false);

  const projection = useMemo(
    () => projectGrowth(d.value.currentValue, monthly, d.portfolio, years),
    [d.value.currentValue, monthly, d.portfolio, years]
  );

  const final = projection[projection.length - 1];
  const totalGain = round2(final.expected - final.invested);

  const invest = () => {
    if (amount <= 0) return;
    dispatch({ type: 'oneTimeInvest', payload: { amount } });
    setFlash(true);
    setTimeout(() => setFlash(false), 1400);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Grow</h1>
        <p className="text-sm text-slate-500">
          See where consistent investing could take you — and add a boost anytime.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <SectionTitle
            title="Growth projection"
            subtitle={`${d.portfolio.name} plan · ${(d.portfolio.expectedReturn * 100).toFixed(1)}% est. annual return`}
          />
          <ProjectionChart data={projection} height={280} />
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            <Legend color="#12934f" label="Projected value" />
            <Legend color="#94a3b8" label="Money you invested" dashed />
            <Legend color="#43cd7f" label="Likely range" band />
          </div>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card className="p-5">
            <SectionTitle title="Assumptions" />
            <SliderRow
              label="Monthly contribution"
              value={`${formatCurrency(monthly, { cents: false })}/mo`}
            >
              <input
                type="range"
                min={10}
                max={1000}
                step={5}
                value={monthly}
                onChange={(e) => setMonthly(Number(e.target.value))}
                className="sprout-range"
              />
            </SliderRow>
            <SliderRow label="Time horizon" value={`${years} years`}>
              <input
                type="range"
                min={1}
                max={40}
                step={1}
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="sprout-range"
              />
            </SliderRow>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Outcome label="Projected value" value={formatCurrency(final.expected, { cents: false })} big />
              <Outcome label="You invested" value={formatCurrency(final.invested, { cents: false })} />
              <Outcome
                label="Potential growth"
                value={formatCurrency(totalGain, { cents: false })}
                tone="green"
              />
              <Outcome
                label="Range"
                value={`${formatCurrency(final.low, { cents: false })}–${formatCurrency(final.high, {
                  cents: false,
                })}`}
                small
              />
            </div>
          </Card>

          <Card className={`p-5 transition ${flash ? 'ring-2 ring-sprout-500' : ''}`}>
            <SectionTitle title="Add a one-time boost" />
            <div className="flex items-center rounded-xl border border-slate-200 px-4 focus-within:border-sprout-500 focus-within:ring-4 focus-within:ring-sprout-500/15">
              <span className="text-lg font-semibold text-slate-400">$</span>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
                className="w-full bg-transparent py-3 pl-1 text-lg font-bold outline-none tabular"
              />
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {QUICK.map((q) => (
                <button
                  key={q}
                  onClick={() => setAmount(q)}
                  className={`rounded-lg border py-2 text-sm font-semibold transition ${
                    amount === q
                      ? 'border-sprout-500 bg-sprout-50 text-sprout-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  ${q}
                </button>
              ))}
            </div>
            <Button full className="mt-4" onClick={invest} disabled={amount <= 0}>
              {flash ? (
                <>
                  <Sparkles className="h-4 w-4" /> Invested {formatCurrency(amount)}!
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Invest {formatCurrency(amount)} now
                </>
              )}
            </Button>
            <p className="mt-2 text-center text-xs text-slate-400">
              Instantly added to your {d.portfolio.name} portfolio.
            </p>
          </Card>
        </div>
      </div>

      {/* Coaching cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Coach
          icon={<Rocket className="h-5 w-5" />}
          title="Power of consistency"
          body={`Investing ${formatCurrency(monthly, { cents: false })}/mo for ${years} years could grow to ${formatCurrency(
            final.expected,
            { cents: false }
          )}.`}
        />
        <Coach
          icon={<TrendingUp className="h-5 w-5" />}
          title="Compounding works"
          body={`About ${formatCurrency(totalGain, { cents: false })} of that is projected growth — money your money made.`}
        />
        <Coach
          icon={<Sparkles className="h-5 w-5" />}
          title="Every dollar counts"
          body="Boosting your round-up multiplier or recurring deposit meaningfully bends the curve upward."
        />
      </div>

      <style>{`
        .sprout-range { -webkit-appearance:none; width:100%; height:6px; border-radius:9999px; background:#e2e8f0; outline:none; }
        .sprout-range::-webkit-slider-thumb { -webkit-appearance:none; height:20px; width:20px; border-radius:9999px; background:#12934f; cursor:pointer; box-shadow:0 1px 4px rgba(0,0,0,.2); border:3px solid #fff; }
        .sprout-range::-moz-range-thumb { height:20px; width:20px; border-radius:9999px; background:#12934f; cursor:pointer; border:3px solid #fff; }
      `}</style>
    </div>
  );
}

function SliderRow({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">{label}</span>
        <span className="text-sm font-bold text-slate-900 tabular">{value}</span>
      </div>
      {children}
    </div>
  );
}

function Outcome({
  label,
  value,
  tone = 'neutral',
  big = false,
  small = false,
}: {
  label: string;
  value: string;
  tone?: 'neutral' | 'green';
  big?: boolean;
  small?: boolean;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="text-[11px] font-medium text-slate-400">{label}</div>
      <div
        className={`mt-0.5 font-extrabold tabular ${
          tone === 'green' ? 'text-sprout-700' : 'text-slate-900'
        } ${big ? 'text-2xl' : small ? 'text-sm' : 'text-lg'}`}
      >
        {value}
      </div>
    </div>
  );
}

function Legend({
  color,
  label,
  dashed,
  band,
}: {
  color: string;
  label: string;
  dashed?: boolean;
  band?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-slate-500">
      {band ? (
        <span className="h-3 w-4 rounded" style={{ backgroundColor: `${color}44` }} />
      ) : (
        <span
          className="h-0.5 w-4"
          style={{
            backgroundColor: color,
            borderTop: dashed ? `2px dashed ${color}` : undefined,
            height: dashed ? 0 : 2,
          }}
        />
      )}
      {label}
    </span>
  );
}

function Coach({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Card className="p-4">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-sprout-100 text-sprout-700">
        {icon}
      </span>
      <div className="mt-3 font-bold text-slate-900">{title}</div>
      <p className="mt-1 text-sm text-slate-500">{body}</p>
    </Card>
  );
}
