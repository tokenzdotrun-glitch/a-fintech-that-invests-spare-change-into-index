import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { format } from 'date-fns';
import type { SeriesPoint } from '../lib/engine';
import { formatCompactCurrency, formatCurrency } from '../lib/format';

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0].payload as SeriesPoint;
  return (
    <div className="rounded-xl border border-ink-100 bg-white/95 px-3.5 py-2.5 shadow-card backdrop-blur">
      <div className="mb-1 text-xs font-medium text-ink-400">
        {format(new Date(point.date), 'MMM d, yyyy')}
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="h-2 w-2 rounded-full bg-brand-500" />
        <span className="text-ink-500">Value</span>
        <span className="ml-auto font-bold tabular text-ink-900">
          {formatCurrency(point.value)}
        </span>
      </div>
      <div className="mt-0.5 flex items-center gap-2 text-sm">
        <span className="h-2 w-2 rounded-full bg-ink-300" />
        <span className="text-ink-500">Invested</span>
        <span className="ml-auto font-semibold tabular text-ink-600">
          {formatCurrency(point.invested)}
        </span>
      </div>
    </div>
  );
}

export function PerformanceChart({
  data,
  height = 280,
  showInvested = true,
}: {
  data: SeriesPoint[];
  height?: number;
  showInvested?: boolean;
}) {
  const values = data.flatMap((d) => [d.value, showInvested ? d.invested : d.value]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.12 || max * 0.1 || 1;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="valueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#eceef2" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => format(new Date(v), 'MMM d')}
          tick={{ fill: '#808ea6', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          minTickGap={40}
        />
        <YAxis
          domain={[min - pad, max + pad]}
          tickFormatter={(v) => formatCompactCurrency(v)}
          tick={{ fill: '#808ea6', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <Tooltip content={<ChartTooltip />} />
        {showInvested && (
          <Line
            type="monotone"
            dataKey="invested"
            stroke="#adb6c7"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
            isAnimationActive={false}
          />
        )}
        <Area
          type="monotone"
          dataKey="value"
          stroke="#10b981"
          strokeWidth={2.5}
          fill="url(#valueFill)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
