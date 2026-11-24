import { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ETA_ACCURACY_SERIES, PEAK_HEATMAP, WEEKLY_HISTORY } from '../../data/seed';
import { formatINR, useSalonStore } from '../../store/useSalonStore';

const HEAT_HOURS = ['10a', '12p', '2p', '4p', '6p', '8p'];

export function AnalyticsSuite({ todayRevenue, todayExpenses }: { todayRevenue: number; todayExpenses: number }) {
  const sales = useSalonStore((s) => s.sales);
  const [hoveredCell, setHoveredCell] = useState<{ day: string; hour: string; pct: number } | null>(null);

  const revenueHistory = [
    ...WEEKLY_HISTORY,
    { day: 'Today', revenue: todayRevenue, expenses: todayExpenses },
  ];

  const serviceTotals: Record<string, number> = {
    'Skin Fade Haircut': 5250,
    'Hair Color': 4250,
    'Complete Grooming': 3250,
    'Beard Sculpt': 2100,
  };
  for (const sale of sales) {
    if (sale.serviceSummary.includes('Fade')) serviceTotals['Skin Fade Haircut'] += sale.serviceAmount;
    else if (sale.serviceSummary.includes('Color')) serviceTotals['Hair Color'] += sale.serviceAmount;
    else if (sale.serviceSummary.includes('Complete')) serviceTotals['Complete Grooming'] += sale.serviceAmount;
    else serviceTotals['Beard Sculpt'] += sale.serviceAmount;
  }
  const serviceChartData = Object.entries(serviceTotals)
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-16 pt-2">
      {/* Row 1: Revenue vs Expenses + Peak-Hour Heatmap (Open-Air Hairline Sections) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[var(--sd-line)] pb-4">
            <div>
              <h3 className="text-[16px] font-semibold">Revenue vs. operating expenses (7 days)</h3>
              <p className="text-[13px] text-[var(--sd-muted)] mt-0.5">
                Botanical green: gross sales / Muted dashed: operating cost
              </p>
            </div>
            <span className="text-[13px] text-[var(--sd-brand)] font-semibold tabular">
              Today net: {formatINR(todayRevenue - todayExpenses)}
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueHistory} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="sdRevFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1F4D3A" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1F4D3A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E2DACD" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#665E56' }} axisLine={false} tickLine={false} dy={8} />
                <YAxis
                  tickFormatter={(v: number) => `₹${Math.round(v / 1000)}k`}
                  tick={{ fontSize: 12, fill: '#665E56' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#1A1714',
                    borderRadius: '2px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number, name: string) => [
                    formatINR(value),
                    name === 'revenue' ? 'Gross revenue' : 'Expenses',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1F4D3A"
                  strokeWidth={2.4}
                  fill="url(#sdRevFill)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#665E56"
                  strokeWidth={1.8}
                  strokeDasharray="4 4"
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--sd-line)] pb-4">
            <div>
              <h3 className="text-[16px] font-semibold">Peak-hour chair occupancy</h3>
              <p className="text-[13px] text-[var(--sd-muted)] mt-0.5">Hover any hour block to inspect load</p>
            </div>
            <span className="text-[13px] font-mono-code tabular text-[var(--sd-ink)]">
              {hoveredCell ? `${hoveredCell.day} ${hoveredCell.hour}: ${hoveredCell.pct}%` : 'Sat 6p: 98%'}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-[12px] text-[var(--sd-muted)] items-center pt-2">
            <div />
            {HEAT_HOURS.map((hr) => (
              <div key={hr} className="text-center font-mono-code">
                {hr}
              </div>
            ))}
            {PEAK_HEATMAP.map((row) => (
              <div key={row.day} className="contents">
                <div className="font-medium text-[var(--sd-ink)]">{row.day}</div>
                {row.slots.map((pct, idx) => {
                  const opacity = Math.max(0.12, pct / 100);
                  return (
                    <button
                      key={`${row.day}-${idx}`}
                      type="button"
                      onMouseEnter={() => setHoveredCell({ day: row.day, hour: HEAT_HOURS[idx], pct })}
                      onFocus={() => setHoveredCell({ day: row.day, hour: HEAT_HOURS[idx], pct })}
                      className="h-8 cursor-pointer border border-transparent hover:border-[var(--sd-ink)]"
                      style={{ backgroundColor: `rgba(31, 77, 58, ${opacity})` }}
                      aria-label={`${row.day} ${HEAT_HOURS[idx]}: ${pct}% chair occupancy`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Service Mix + ETA Accuracy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        <div className="lg:col-span-6 space-y-6">
          <div className="border-b border-[var(--sd-line)] pb-4">
            <h3 className="text-[16px] font-semibold">Service mix revenue breakdown</h3>
            <p className="text-[13px] text-[var(--sd-muted)] mt-0.5">
              Cumulative gross revenue across core service categories
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceChartData} layout="vertical" margin={{ top: 4, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid stroke="#E2DACD" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={(v: number) => `₹${Math.round(v / 1000)}k`}
                  tick={{ fontSize: 12, fill: '#665E56' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={130}
                  tick={{ fontSize: 13, fill: '#1A1714' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#1A1714',
                    borderRadius: '2px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [formatINR(value), 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#1F4D3A" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--sd-line)] pb-4">
            <div>
              <h3 className="text-[16px] font-semibold">ETA accuracy (predicted vs. actual wait)</h3>
              <p className="text-[13px] text-[var(--sd-muted)] mt-0.5">Minutes waited across recent checked-in passes</p>
            </div>
            <span className="text-[13px] font-semibold text-[var(--sd-brand)] tabular">Avg drift: 1.4 min</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ETA_ACCURACY_SERIES} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="#E2DACD" vertical={false} />
                <XAxis dataKey="ticket" tick={{ fontSize: 12, fill: '#665E56' }} axisLine={false} tickLine={false} dy={8} />
                <YAxis
                  unit="m"
                  tick={{ fontSize: 12, fill: '#665E56' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#1A1714',
                    borderRadius: '2px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number, name: string) => [
                    `${value} min`,
                    name === 'predicted' ? 'Predicted ETA' : 'Actual wait',
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#665E56"
                  strokeWidth={1.8}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#C83E2B"
                  strokeWidth={2.4}
                  dot={{ r: 3.5, fill: '#F4EFE6', stroke: '#C83E2B', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
