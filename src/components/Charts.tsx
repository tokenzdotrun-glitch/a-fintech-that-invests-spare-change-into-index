import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { HistoryPoint, ProjectionPoint } from '../lib/finance';
import { formatCompact, formatCurrency } from '../lib/finance';
import type { Holding } from '../state/derived';

const AXIS = { fontSize: 11, fill: '#94a3b8' };

function ValueTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as HistoryPoint;
  const gain = p.value - p.principal;
  return (
    <div className="rounded-xl border border-slate-100 bg-white/95 px-3 py-2 shadow-lift backdrop-blur">
      <div className="text-xs font-medium text-slate-400">
        {new Date(p.t).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </div>
      <div className="mt-0.5 text-base font-bold text-slate-900 tabular">
        {formatCurrency(p.value)}
      </div>
      <div className="text-xs text-slate-500 tabular">
        Invested {formatCurrency(p.principal)} ·{' '}
        <span className={gain >= 0 ? 'text-sprout-600' : 'text-rose-600'}>
          {gain >= 0 ? '+' : '\u2212'}
          {formatCurrency(Math.abs(gain))}
        </span>
      </div>
    </div>
  );
}

export function ValueChart({
  data,
  height = 240,
  showAxes = true,
  light = false,
}: {
  data: HistoryPoint[];
  height?: number;
  showAxes?: boolean;
  light?: boolean;
}) {
  const positive = data.length > 1 ? data[data.length - 1].value >= data[0].value : true;
  const stroke = light ? '#ffffff' : positive ? '#12934f' : '#e11d48';
  const fill = light ? '#ffffff' : positive ? '#12934f' : '#e11d48';
  const gradId = light ? 'valueFillLight' : 'valueFill';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fill} stopOpacity={light ? 0.35 : 0.28} />
            <stop offset="100%" stopColor={fill} stopOpacity={0} />
          </linearGradient>
        </defs>
        {showAxes && <CartesianGrid vertical={false} stroke="#f1f5f9" />}
        <XAxis
          dataKey="t"
          hide={!showAxes}
          tickLine={false}
          axisLine={false}
          tick={AXIS}
          minTickGap={48}
          tickFormatter={(t) =>
            new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          }
        />
        <YAxis
          hide={!showAxes}
          tickLine={false}
          axisLine={false}
          tick={AXIS}
          width={52}
          tickFormatter={(v) => formatCompact(v)}
          domain={['dataMin', 'dataMax']}
        />
        <Tooltip content={<ValueTooltip />} cursor={{ stroke: light ? '#ffffff88' : '#cbd5e1' }} />
        <Area
          type="monotone"
          dataKey="value"
          stroke={stroke}
          strokeWidth={2.5}
          fill={`url(#${gradId})`}
          animationDuration={700}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function AllocationDonut({
  holdings,
  size = 200,
}: {
  holdings: Holding[];
  size?: number;
}) {
  const data = holdings.map((h) => ({
    name: h.fund.ticker,
    value: Math.max(0.0001, h.weight),
    color: h.fund.color,
  }));
  return (
    <ResponsiveContainer width="100%" height={size}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="62%"
          outerRadius="100%"
          paddingAngle={2}
          stroke="none"
          startAngle={90}
          endAngle={-270}
        >
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v: number, n) => [`${(v * 100).toFixed(0)}%`, n]}
          contentStyle={{ borderRadius: 12, border: 'none' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

function ProjTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as ProjectionPoint;
  return (
    <div className="rounded-xl border border-slate-100 bg-white/95 px-3 py-2 shadow-lift">
      <div className="text-xs font-medium text-slate-400">
        Year {p.year} ({new Date().getFullYear() + p.year})
      </div>
      <div className="mt-1 space-y-0.5 text-xs tabular">
        <div className="flex justify-between gap-6">
          <span className="text-slate-500">Projected</span>
          <span className="font-bold text-sprout-700">{formatCurrency(p.expected, { cents: false })}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-slate-500">You put in</span>
          <span className="font-semibold text-slate-700">{formatCurrency(p.invested, { cents: false })}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-slate-400">Range</span>
          <span className="text-slate-500">
            {formatCompact(p.low)} – {formatCompact(p.high)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ProjectionChart({
  data,
  height = 260,
}: {
  data: ProjectionPoint[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#43cd7f" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#43cd7f" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#f1f5f9" />
        <XAxis
          dataKey="year"
          tickLine={false}
          axisLine={false}
          tick={AXIS}
          tickFormatter={(y) => (y === 0 ? 'Now' : `${y}y`)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={AXIS}
          width={52}
          tickFormatter={(v) => formatCompact(v)}
        />
        <Tooltip content={<ProjTooltip />} />
        <Area
          type="monotone"
          dataKey="high"
          stroke="none"
          fill="url(#bandFill)"
          animationDuration={600}
        />
        <Area
          type="monotone"
          dataKey="low"
          stroke="none"
          fill="#ffffff"
          animationDuration={600}
        />
        <Area
          type="monotone"
          dataKey="expected"
          stroke="#12934f"
          strokeWidth={2.5}
          fill="none"
          animationDuration={700}
        />
        <Area
          type="monotone"
          dataKey="invested"
          stroke="#94a3b8"
          strokeWidth={2}
          strokeDasharray="5 4"
          fill="none"
          animationDuration={700}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
