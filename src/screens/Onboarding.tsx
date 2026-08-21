import { useState } from 'react';
import {
  ArrowRight,
  Coins,
  PiggyBank,
  Repeat,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { FUNDS, PORTFOLIO_LIST } from '../lib/data';
import { formatPct } from '../lib/finance';
import type { PortfolioId, Recurring, RoundUpMultiplier } from '../lib/types';
import { useStore } from '../state/store';
import { Button, Card } from '../components/ui';
import { Wordmark } from '../components/icons';

const MULTIPLIERS: RoundUpMultiplier[] = [1, 2, 3, 5, 10];

export default function Onboarding() {
  const { dispatch } = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [portfolioId, setPortfolioId] = useState<PortfolioId>('moderate');
  const [multiplier, setMultiplier] = useState<RoundUpMultiplier>(2);
  const [recurringOn, setRecurringOn] = useState(true);
  const [recurring, setRecurring] = useState<Recurring>({ amount: 15, frequency: 'weekly' });

  const finish = () => {
    dispatch({
      type: 'onboard',
      payload: {
        name: name.trim() || 'there',
        portfolioId,
        roundUpMultiplier: multiplier,
        recurring: recurringOn ? recurring : null,
      },
    });
  };

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-6">
        <header className="flex items-center justify-between">
          <Wordmark />
          <div className="hidden items-center gap-1.5 text-sm font-medium text-slate-500 sm:flex">
            <ShieldCheck className="h-4 w-4 text-sprout-600" />
            Bank-level 256-bit security
          </div>
        </header>

        {step === 0 && <Hero onStart={() => setStep(1)} />}

        {step > 0 && (
          <div className="mx-auto mt-8 w-full max-w-lg flex-1">
            <StepDots step={step} total={4} />

            {step === 1 && (
              <StepCard
                title="First, what should we call you?"
                subtitle="We’ll personalize your Sprout dashboard."
              >
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && setStep(2)}
                  placeholder="Your first name"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-lg font-medium outline-none transition focus:border-sprout-500 focus:ring-4 focus:ring-sprout-500/15"
                />
                <NavButtons onNext={() => setStep(2)} nextLabel="Continue" />
              </StepCard>
            )}

            {step === 2 && (
              <StepCard
                title="Pick your investing style"
                subtitle="Every plan is a diversified basket of low-cost index funds. Change it anytime."
              >
                <div className="space-y-3">
                  {PORTFOLIO_LIST.map((p) => {
                    const selected = p.id === portfolioId;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setPortfolioId(p.id)}
                        className={`w-full rounded-2xl border p-4 text-left transition-all ${
                          selected
                            ? 'border-sprout-500 bg-sprout-50/60 ring-2 ring-sprout-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span
                              className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                              style={{ backgroundColor: p.accent }}
                            >
                              <TrendingUp className="h-5 w-5" />
                            </span>
                            <div>
                              <div className="font-bold text-slate-900">{p.name}</div>
                              <div className="text-xs text-slate-500">{p.tagline}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-sprout-700">
                              {(p.expectedReturn * 100).toFixed(1)}%
                            </div>
                            <div className="text-[11px] text-slate-400">est. annual</div>
                          </div>
                        </div>
                        {selected && (
                          <p className="mt-3 text-sm text-slate-600">{p.description}</p>
                        )}
                      </button>
                    );
                  })}
                </div>
                <NavButtons onBack={() => setStep(1)} onNext={() => setStep(3)} />
              </StepCard>
            )}

            {step === 3 && (
              <StepCard
                title="Supercharge your spare change"
                subtitle="Round up every purchase and optionally add a recurring boost."
              >
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Round-up multiplier
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {MULTIPLIERS.map((m) => (
                      <button
                        key={m}
                        onClick={() => setMultiplier(m)}
                        className={`rounded-xl border py-3 text-sm font-bold transition ${
                          multiplier === m
                            ? 'border-sprout-500 bg-sprout-600 text-white'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {m}×
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    A $4.30 coffee invests{' '}
                    <span className="font-semibold text-sprout-700">
                      ${(0.7 * multiplier).toFixed(2)}
                    </span>{' '}
                    at {multiplier}×.
                  </p>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 p-4">
                  <label className="flex cursor-pointer items-center justify-between">
                    <span className="flex items-center gap-2 font-semibold text-slate-800">
                      <Repeat className="h-4 w-4 text-sprout-600" />
                      Recurring deposit
                    </span>
                    <span
                      onClick={() => setRecurringOn((v) => !v)}
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
                        <label className="mb-1 block text-xs font-medium text-slate-500">
                          Amount
                        </label>
                        <div className="flex items-center rounded-xl border border-slate-200 px-3">
                          <span className="text-slate-400">$</span>
                          <input
                            type="number"
                            min={1}
                            value={recurring.amount}
                            onChange={(e) =>
                              setRecurring((r) => ({
                                ...r,
                                amount: Math.max(1, Number(e.target.value) || 0),
                              }))
                            }
                            className="w-full bg-transparent py-2.5 pl-1 font-semibold outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500">
                          Frequency
                        </label>
                        <select
                          value={recurring.frequency}
                          onChange={(e) =>
                            setRecurring((r) => ({
                              ...r,
                              frequency: e.target.value as Recurring['frequency'],
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 font-semibold outline-none"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <NavButtons onBack={() => setStep(2)} onNext={() => setStep(4)} nextLabel="Review" />
              </StepCard>
            )}

            {step === 4 && (
              <StepCard
                title="You’re all set!"
                subtitle="We’ll build your account with a bit of sample history so you can explore right away."
              >
                <Summary
                  name={name.trim() || 'there'}
                  portfolioId={portfolioId}
                  multiplier={multiplier}
                  recurring={recurringOn ? recurring : null}
                />
                <div className="mt-5 flex gap-3">
                  <Button variant="secondary" onClick={() => setStep(3)}>
                    Back
                  </Button>
                  <Button full onClick={finish}>
                    <Sparkles className="h-4 w-4" />
                    Open my account
                  </Button>
                </div>
              </StepCard>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Hero({ onStart }: { onStart: () => void }) {
  return (
    <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-2">
      <div className="animate-fade-up">
        <div className="inline-flex items-center gap-2 rounded-full border border-sprout-200 bg-white/70 px-3 py-1 text-xs font-semibold text-sprout-700">
          <Sparkles className="h-3.5 w-3.5" /> Investing on autopilot
        </div>
        <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl">
          Turn your spare change into a{' '}
          <span className="text-sprout-600">growing portfolio.</span>
        </h1>
        <p className="mt-5 max-w-md text-lg text-slate-600">
          Sprout rounds up every purchase and automatically invests the change into a
          diversified basket of low-cost index funds. Small change, serious growth.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button size="lg" onClick={onStart}>
            Get started <ArrowRight className="h-4 w-4" />
          </Button>
          <span className="text-sm text-slate-500">No minimums · Cancel anytime</span>
        </div>
        <div className="mt-10 grid max-w-md grid-cols-3 gap-4">
          {[
            { icon: Coins, label: 'Auto round-ups' },
            { icon: PiggyBank, label: 'Index funds' },
            { icon: TrendingUp, label: 'Long-term growth' },
          ].map((f) => (
            <div key={f.label} className="flex flex-col items-start gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sprout-100 text-sprout-700">
                <f.icon className="h-4.5 w-4.5" />
              </span>
              <span className="text-sm font-medium text-slate-600">{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative animate-fade-up [animation-delay:120ms]">
        <PhoneMock />
      </div>
    </div>
  );
}

function PhoneMock() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <Card className="overflow-hidden p-0 shadow-lift">
        <div className="bg-gradient-to-br from-sprout-600 to-sprout-800 p-6 text-white">
          <div className="text-sm text-sprout-100">Total balance</div>
          <div className="mt-1 text-4xl font-extrabold tabular">$4,286.19</div>
          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold">
            <TrendingUp className="h-3.5 w-3.5" /> +$612.40 all time ({formatPct(0.166)})
          </div>
        </div>
        <div className="space-y-3 p-5">
          {[
            { m: 'Blue Bottle Coffee', a: '-$4.30', r: '+$1.40' },
            { m: 'Whole Foods Market', a: '-$62.18', r: '+$1.64' },
            { m: 'Uber', a: '-$18.75', r: '+$2.50' },
          ].map((t) => (
            <div key={t.m} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="h-9 w-9 rounded-lg bg-slate-100" />
                <div>
                  <div className="text-sm font-semibold text-slate-800">{t.m}</div>
                  <div className="text-xs text-slate-400">{t.a}</div>
                </div>
              </div>
              <span className="rounded-full bg-sprout-100 px-2 py-0.5 text-xs font-bold text-sprout-700">
                {t.r}
              </span>
            </div>
          ))}
          <div className="rounded-xl bg-slate-50 p-3 text-center text-xs font-medium text-slate-500">
            Round-ups this week: <span className="font-bold text-sprout-700">$5.54</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function StepCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="mt-6 animate-fade-up p-6">
      <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h2>
      {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </Card>
  );
}

function NavButtons({
  onBack,
  onNext,
  nextLabel = 'Continue',
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
}) {
  return (
    <div className="mt-6 flex gap-3">
      {onBack && (
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
      )}
      <Button full onClick={onNext}>
        {nextLabel} <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i < step ? 'w-8 bg-sprout-600' : 'w-4 bg-slate-200'
          }`}
        />
      ))}
    </div>
  );
}

function Summary({
  name,
  portfolioId,
  multiplier,
  recurring,
}: {
  name: string;
  portfolioId: PortfolioId;
  multiplier: RoundUpMultiplier;
  recurring: Recurring | null;
}) {
  const p = PORTFOLIO_LIST.find((x) => x.id === portfolioId)!;
  const rows = [
    { label: 'Name', value: name },
    { label: 'Portfolio', value: `${p.name} (${(p.expectedReturn * 100).toFixed(1)}% est.)` },
    { label: 'Round-ups', value: `${multiplier}× multiplier` },
    {
      label: 'Recurring',
      value: recurring ? `$${recurring.amount} ${recurring.frequency}` : 'Off',
    },
  ];
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-200 divide-y divide-slate-100">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-slate-500">{r.label}</span>
            <span className="text-sm font-semibold text-slate-900">{r.value}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {p.allocations.map((a) => (
          <span
            key={a.fundId}
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: FUNDS[a.fundId].color }}
            />
            {FUNDS[a.fundId].ticker} {(a.weight * 100).toFixed(0)}%
          </span>
        ))}
      </div>
    </div>
  );
}
