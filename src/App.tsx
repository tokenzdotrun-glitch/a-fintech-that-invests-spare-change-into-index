import { useState } from 'react';
import {
  Home,
  LayoutGrid,
  PieChart,
  Settings as SettingsIcon,
  Sprout as SproutIcon,
  TrendingUp,
} from 'lucide-react';
import { Logo } from './components/icons';
import { formatCurrency } from './lib/finance';
import { useDerivedPortfolio } from './state/derived';
import { useStore } from './state/store';
import Onboarding from './screens/Onboarding';
import Dashboard from './screens/Dashboard';
import Activity from './screens/Activity';
import Portfolio from './screens/Portfolio';
import Grow from './screens/Grow';
import Settings from './screens/Settings';

type Tab = 'home' | 'activity' | 'portfolio' | 'grow' | 'settings';

const NAV: { key: Tab; label: string; icon: typeof Home }[] = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'activity', label: 'Activity', icon: LayoutGrid },
  { key: 'portfolio', label: 'Portfolio', icon: PieChart },
  { key: 'grow', label: 'Grow', icon: TrendingUp },
  { key: 'settings', label: 'Settings', icon: SettingsIcon },
];

export default function App() {
  const { state } = useStore();
  const [tab, setTab] = useState<Tab>('home');

  if (!state.onboarded) return <Onboarding />;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-7xl">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 lg:flex">
          <div className="flex items-center gap-2 px-2">
            <Logo />
            <span className="text-xl font-extrabold tracking-tight text-slate-900">Sprout</span>
          </div>
          <BalanceChip />
          <nav className="mt-2 space-y-1">
            {NAV.map((n) => (
              <NavItem
                key={n.key}
                active={tab === n.key}
                icon={<n.icon className="h-5 w-5" />}
                label={n.label}
                onClick={() => setTab(n.key)}
              />
            ))}
          </nav>
          <div className="mt-auto rounded-2xl bg-sprout-50 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-sprout-800">
              <SproutIcon className="h-4 w-4" /> Keep it growing
            </div>
            <p className="mt-1 text-xs text-sprout-700/80">
              Every purchase plants a little more. Small change adds up.
            </p>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-h-screen w-full flex-col">
          {/* Mobile top bar */}
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-5 py-3 backdrop-blur lg:hidden">
            <div className="flex items-center gap-2">
              <Logo className="h-8 w-8" />
              <span className="text-lg font-extrabold tracking-tight text-slate-900">Sprout</span>
            </div>
            <MobileBalance />
          </header>

          <main className="flex-1 px-5 py-6 pb-28 sm:px-8 lg:pb-10">
            <div key={tab} className="animate-fade-up">
              {tab === 'home' && <Dashboard onNavigate={(t) => setTab(t as Tab)} />}
              {tab === 'activity' && <Activity />}
              {tab === 'portfolio' && <Portfolio />}
              {tab === 'grow' && <Grow />}
              {tab === 'settings' && <Settings />}
            </div>
          </main>
        </div>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/90 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {NAV.map((n) => {
            const active = tab === n.key;
            return (
              <button
                key={n.key}
                onClick={() => setTab(n.key)}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition ${
                  active ? 'text-sprout-700' : 'text-slate-400'
                }`}
              >
                <n.icon className={`h-5 w-5 ${active ? 'scale-110' : ''} transition-transform`} />
                {n.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function NavItem({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
        active
          ? 'bg-sprout-600 text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function BalanceChip() {
  const d = useDerivedPortfolio();
  const positive = d.value.gain >= 0;
  return (
    <div className="my-6 rounded-2xl bg-gradient-to-br from-sprout-600 to-sprout-800 p-4 text-white">
      <div className="text-xs text-sprout-100">Total balance</div>
      <div className="mt-0.5 text-2xl font-extrabold tabular">
        {formatCurrency(d.value.currentValue)}
      </div>
      <div className="mt-1 text-xs font-semibold text-sprout-100">
        {positive ? '▲' : '▼'} {formatCurrency(d.value.gain, { sign: true })} all time
      </div>
    </div>
  );
}

function MobileBalance() {
  const d = useDerivedPortfolio();
  return (
    <div className="text-right">
      <div className="text-[11px] text-slate-400">Balance</div>
      <div className="text-base font-extrabold text-slate-900 tabular">
        {formatCurrency(d.value.currentValue)}
      </div>
    </div>
  );
}
