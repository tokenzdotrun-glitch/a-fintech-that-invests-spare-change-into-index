import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  Compass,
  Receipt,
  PieChart,
  Sprout,
  Settings as SettingsIcon,
  Plus,
  Wallet,
} from 'lucide-react';
import { StoreProvider, useStore } from './lib/store';
import { Logo } from './components/Logo';
import { Button, cn } from './components/ui';
import { SimulatePurchaseModal } from './components/SimulatePurchaseModal';
import { Dashboard } from './views/Dashboard';
import { Explore } from './views/Explore';
import { Transactions } from './views/Transactions';
import { Portfolio } from './views/Portfolio';
import { Grow } from './views/Grow';
import { Settings } from './views/Settings';
import { formatCurrency } from './lib/format';

export type View =
  | 'dashboard'
  | 'explore'
  | 'transactions'
  | 'portfolio'
  | 'grow'
  | 'settings';

const NAV: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'portfolio', label: 'Portfolio', icon: PieChart },
  { id: 'grow', label: 'Grow', icon: Sprout },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

const TITLES: Record<View, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: "Here's how your spare change is doing." },
  explore: { title: 'Explore', subtitle: 'Discover new funds to invest in.' },
  transactions: { title: 'Transactions', subtitle: 'Every purchase, rounded up.' },
  portfolio: { title: 'Portfolio', subtitle: 'Your diversified index-fund mix.' },
  grow: { title: 'Grow', subtitle: 'See where your round-ups could take you.' },
  settings: { title: 'Settings', subtitle: 'Tune how you round up and invest.' },
};

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function Shell() {
  const { state, walletBalance } = useStore();
  const [view, setView] = useState<View>('dashboard');
  const [modalOpen, setModalOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const firstName = state.name.trim().split(' ')[0];

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar — collapsed to icons, expands while hovered */}
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden flex-col overflow-hidden border-r border-ink-100 bg-surface px-3 py-5 transition-[width] duration-300 ease-out lg:flex',
          expanded ? 'w-64 shadow-rail' : 'w-20'
        )}
      >
        <div className={cn('px-1 transition-all', expanded ? '' : 'flex justify-center')}>
          <Logo showWordmark={expanded} />
        </div>

        <nav className="mt-8 flex-1 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                title={!expanded ? item.label : undefined}
                className={cn(
                  'flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                  expanded ? 'justify-start' : 'justify-center',
                  active
                    ? 'bg-brand-500/15 text-brand-300'
                    : 'text-ink-500 hover:bg-ink-100 hover:text-ink-800'
                )}
              >
                <Icon size={19} className="shrink-0" />
                <span
                  className={cn(
                    'overflow-hidden whitespace-nowrap transition-all duration-200',
                    expanded ? 'ml-3 w-auto opacity-100' : 'w-0 opacity-0'
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {expanded ? (
          <div className="rounded-2xl border border-ink-100 bg-surface-raised p-4">
            <div className="flex items-center gap-2 text-brand-300">
              <Wallet size={15} />
              <span className="text-xs font-semibold">Ready to invest</span>
            </div>
            <p className="mt-1 text-2xl font-extrabold tabular text-ink-900">
              {formatCurrency(walletBalance)}
            </p>
            <Button
              size="sm"
              onClick={() => setModalOpen(true)}
              className="mt-3 w-full"
            >
              <Plus size={15} /> Simulate purchase
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setModalOpen(true)}
            title="Simulate purchase"
            className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 text-ink-950 shadow-soft transition-colors hover:bg-brand-400"
          >
            <Plus size={20} />
          </button>
        )}
      </aside>

      {/* Main column */}
      <div className="lg:pl-20">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-ink-100 bg-ink-50/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div className="lg:hidden">
              <Logo size={28} />
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-medium text-ink-400">
                {greeting()}{firstName ? `, ${firstName}` : ''}
              </p>
              <h1 className="text-xl font-extrabold tracking-tight text-ink-900">
                {TITLES[view].title}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-ink-200 bg-surface px-3 py-1.5 sm:flex">
                <Wallet size={14} className="text-brand-400" />
                <span className="text-sm font-bold tabular text-ink-800">
                  {formatCurrency(walletBalance)}
                </span>
              </div>
              <Button onClick={() => setModalOpen(true)} className="hidden sm:inline-flex">
                <Plus size={16} /> Simulate purchase
              </Button>
              <Button
                onClick={() => setModalOpen(true)}
                className="sm:hidden"
                size="sm"
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {view === 'dashboard' && <Dashboard onNavigate={setView} />}
              {view === 'explore' && <Explore />}
              {view === 'transactions' && (
                <Transactions onSimulate={() => setModalOpen(true)} />
              )}
              {view === 'portfolio' && <Portfolio />}
              {view === 'grow' && <Grow />}
              {view === 'settings' && <Settings />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-100 bg-surface/95 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-around px-1 py-1.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={cn(
                  'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-0.5 py-2 text-[10px] font-semibold transition',
                  active ? 'text-brand-400' : 'text-ink-400'
                )}
              >
                <Icon size={20} className="shrink-0" />
                <span className="w-full truncate text-center">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <SimulatePurchaseModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
