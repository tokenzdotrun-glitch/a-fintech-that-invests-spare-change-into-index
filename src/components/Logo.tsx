import { cn } from './ui';

export function Logo({
  size = 32,
  showWordmark = true,
}: {
  size?: number;
  showWordmark?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="shrink-0"
      >
        <rect width="32" height="32" rx="9" fill="#10b981" />
        <path
          d="M16 7a9 9 0 100 18 9 9 0 000-18zm0 3.5a5.5 5.5 0 015.2 3.7h-3.1a2.6 2.6 0 100 3.6h3.1A5.5 5.5 0 1116 10.5z"
          fill="white"
        />
      </svg>
      <span
        className={cn(
          'overflow-hidden whitespace-nowrap text-[19px] font-bold tracking-tight text-ink-900 transition-all duration-200',
          showWordmark ? 'w-auto opacity-100' : 'w-0 opacity-0'
        )}
      >
        Acol
      </span>
    </div>
  );
}
