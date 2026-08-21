import { type ReactNode } from 'react';

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-ink-100 bg-surface shadow-card',
        className
      )}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'positive' | 'negative' | 'brand';
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: 'bg-ink-100 text-ink-500',
    positive: 'bg-brand-500/15 text-brand-300',
    negative: 'bg-rose-500/15 text-rose-300',
    brand: 'bg-brand-600 text-white',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

type ButtonProps = {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...rest
}: ButtonProps) {
  const variants: Record<string, string> = {
    primary:
      'bg-brand-500 text-ink-950 hover:bg-brand-400 active:bg-brand-500 shadow-soft',
    secondary:
      'bg-surface-raised text-ink-800 border border-ink-200 hover:bg-ink-200 active:bg-ink-200',
    ghost: 'text-ink-500 hover:bg-ink-100 hover:text-ink-800',
    danger: 'bg-rose-600 text-white hover:bg-rose-500',
  };
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
  };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-ink-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
