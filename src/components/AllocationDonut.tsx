import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import type { FundHolding } from '../lib/engine';
import { formatCurrency, formatPercent } from '../lib/format';

export function AllocationDonut({
  holdings,
  total,
}: {
  holdings: FundHolding[];
  total: number;
}) {
  const data = holdings.map((h) => ({
    name: h.fund.ticker,
    value: h.value,
    color: h.fund.color,
  }));

  if (total <= 0 || data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-ink-400">
        Invest your first round-up to build a portfolio.
      </div>
    );
  }

  return (
    <div>
      <div className="relative mx-auto h-44 w-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={2}
              stroke="none"
              startAngle={90}
              endAngle={-270}
              isAnimationActive={false}
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] font-medium text-ink-400">Total</span>
          <span className="text-lg font-extrabold tabular text-ink-900">
            {formatCurrency(total, { cents: false })}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {holdings.map((h) => (
          <div key={h.fund.id} className="flex items-center gap-2.5 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: h.fund.color }}
            />
            <span className="font-semibold text-ink-800">{h.fund.ticker}</span>
            <span className="truncate text-xs text-ink-400">{h.fund.name}</span>
            <span className="ml-auto shrink-0 font-semibold tabular text-ink-700">
              {formatPercent(h.weight)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
