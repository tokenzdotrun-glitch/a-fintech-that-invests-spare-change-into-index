import React from 'react';

type Div = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className = '', children, ...rest }: Div) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-card ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  full?: boolean;
};

export function Button({
  variant = 'primary',
  size = 'md',
  full = false,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-sprout-500/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]';
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  };
  const variants = {
    primary:
      'bg-sprout-600 text-white shadow-sm hover:bg-sprout-700 hover:shadow-lift',
    secondary:
      'bg-white text-slate-800 border border-slate-200 hover:border-slate-300 hover:bg-slate-50',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100',
  };
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${full ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  className = '',
  tone = 'neutral',
}: {
  children: React.ReactNode;
  className?: string;
  tone?: 'neutral' | 'green' | 'amber' | 'blue' | 'rose';
}) {
  const tones = {
    neutral: 'bg-slate-100 text-slate-600',
    green: 'bg-sprout-100 text-sprout-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-cyan-100 text-cyan-700',
    rose: 'bg-rose-100 text-rose-700',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md animate-pop-in rounded-t-3xl bg-white p-6 shadow-lift sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h3 className="mb-4 text-lg font-bold text-slate-900">{title}</h3>}
        {children}
      </div>
    </div>
  );
}
