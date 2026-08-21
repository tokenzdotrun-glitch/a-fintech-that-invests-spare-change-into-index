import {
  Coffee,
  ShoppingBag,
  ShoppingCart,
  Bus,
  UtensilsCrossed,
  Clapperboard,
  Fuel,
  ReceiptText,
  type LucideIcon,
} from 'lucide-react';
import type { TxCategory } from '../lib/types';

export const CATEGORY_ICON: Record<TxCategory, LucideIcon> = {
  Coffee,
  Groceries: ShoppingCart,
  Dining: UtensilsCrossed,
  Transport: Bus,
  Shopping: ShoppingBag,
  Entertainment: Clapperboard,
  Fuel,
  Bills: ReceiptText,
};

export const CATEGORY_COLOR: Record<TxCategory, string> = {
  Coffee: '#b45309',
  Groceries: '#12934f',
  Dining: '#ea580c',
  Transport: '#0e7490',
  Shopping: '#7c3aed',
  Entertainment: '#db2777',
  Fuel: '#475569',
  Bills: '#64748b',
};

export function Logo({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#12934f" />
      <path
        d="M16 25c0-5 0-8-3.5-10.5C10 12.7 8 12.5 7 12.5c0 3.5 1 6 3 7.5 1.8 1.4 4 1.8 6 2Z"
        fill="#7fe3aa"
      />
      <path
        d="M16 25c0-6 1.5-9.5 5-12 2.5-1.8 3.8-1.8 4-1.8.2 3.8-1 7-3.2 9-1.9 1.7-3.8 2.4-5.8 2.8Z"
        fill="#43cd7f"
      />
      <rect x="14.7" y="19" width="2.6" height="8" rx="1.3" fill="#042a1b" />
    </svg>
  );
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Logo />
      <span className="text-xl font-extrabold tracking-tight text-slate-900">Sprout</span>
    </div>
  );
}
