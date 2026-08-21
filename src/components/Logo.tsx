export function Logo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <rect width="32" height="32" rx="9" fill="#10b981" />
        <path
          d="M16 7a9 9 0 100 18 9 9 0 000-18zm0 3.5a5.5 5.5 0 015.2 3.7h-3.1a2.6 2.6 0 100 3.6h3.1A5.5 5.5 0 1116 10.5z"
          fill="white"
        />
      </svg>
      <span className="text-[19px] font-extrabold tracking-tight text-ink-900">
        Acol
      </span>
    </div>
  );
}
