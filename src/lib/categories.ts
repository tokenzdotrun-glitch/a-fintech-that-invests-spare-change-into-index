import {
  Coffee,
  ShoppingBasket,
  Utensils,
  Car,
  Fuel,
  ShoppingBag,
  Pill,
  Repeat,
  Home,
  Plane,
  CircleDollarSign,
  type LucideIcon,
} from 'lucide-react';

export interface CategoryStyle {
  icon: LucideIcon;
  /** tailwind text color */
  fg: string;
  /** tailwind background color */
  bg: string;
}

const STYLES: Record<string, CategoryStyle> = {
  Coffee: { icon: Coffee, fg: 'text-amber-300', bg: 'bg-amber-500/15' },
  Groceries: { icon: ShoppingBasket, fg: 'text-emerald-300', bg: 'bg-emerald-500/15' },
  Dining: { icon: Utensils, fg: 'text-rose-300', bg: 'bg-rose-500/15' },
  Transport: { icon: Car, fg: 'text-sky-300', bg: 'bg-sky-500/15' },
  Gas: { icon: Fuel, fg: 'text-orange-300', bg: 'bg-orange-500/15' },
  Shopping: { icon: ShoppingBag, fg: 'text-violet-300', bg: 'bg-violet-500/15' },
  Health: { icon: Pill, fg: 'text-teal-300', bg: 'bg-teal-500/15' },
  Subscriptions: { icon: Repeat, fg: 'text-indigo-300', bg: 'bg-indigo-500/15' },
  Home: { icon: Home, fg: 'text-lime-300', bg: 'bg-lime-500/15' },
  Travel: { icon: Plane, fg: 'text-cyan-300', bg: 'bg-cyan-500/15' },
};

export const CATEGORIES = Object.keys(STYLES);

export function categoryStyle(category: string): CategoryStyle {
  return (
    STYLES[category] ?? {
      icon: CircleDollarSign,
      fg: 'text-ink-400',
      bg: 'bg-ink-100',
    }
  );
}
