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
  Coffee: { icon: Coffee, fg: 'text-amber-700', bg: 'bg-amber-100' },
  Groceries: { icon: ShoppingBasket, fg: 'text-emerald-700', bg: 'bg-emerald-100' },
  Dining: { icon: Utensils, fg: 'text-rose-700', bg: 'bg-rose-100' },
  Transport: { icon: Car, fg: 'text-sky-700', bg: 'bg-sky-100' },
  Gas: { icon: Fuel, fg: 'text-orange-700', bg: 'bg-orange-100' },
  Shopping: { icon: ShoppingBag, fg: 'text-violet-700', bg: 'bg-violet-100' },
  Health: { icon: Pill, fg: 'text-teal-700', bg: 'bg-teal-100' },
  Subscriptions: { icon: Repeat, fg: 'text-indigo-700', bg: 'bg-indigo-100' },
  Home: { icon: Home, fg: 'text-lime-700', bg: 'bg-lime-100' },
  Travel: { icon: Plane, fg: 'text-cyan-700', bg: 'bg-cyan-100' },
};

export const CATEGORIES = Object.keys(STYLES);

export function categoryStyle(category: string): CategoryStyle {
  return (
    STYLES[category] ?? {
      icon: CircleDollarSign,
      fg: 'text-ink-600',
      bg: 'bg-ink-100',
    }
  );
}
