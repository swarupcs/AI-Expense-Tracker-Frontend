import { useExpenses, useExpenseStats } from '@/services/expenses.service';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = [
  '#7c5cfc',
  '#00d4ff',
  '#00ff87',
  '#ffb830',
  '#ff2d78',
  '#9d7fff',
  '#5b8fff',
  '#4a4870',
];

export default function InsightsPage() {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    .toISOString()
    .split('T')[0];
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split('T')[0];

  const { data: statsData, isLoading: statsLoading } = useExpenseStats(
    sixMonthsAgo,
    monthEnd,
  );
  const { data: expData, isLoading: expLoading } = useExpenses({
    from: sixMonthsAgo,
    to: monthEnd,
  });

  const isLoading = statsLoading || expLoading;
  const stats = statsData;
  const expenses = expData?.expenses ?? [];

  const monthlyMap: Record<string, number> = {};
  for (const exp of expenses) {
    const key = exp.date.slice(0, 7);
    monthlyMap[key] = (monthlyMap[key] ?? 0) + exp.amount;
  }
  const trendData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({
      month: new Date(month + '-01').toLocaleString('en', { month: 'short' }),
      amount: Math.round(amount),
    }));

  const pieData = (stats?.byCategory ?? []).map((c, i) => ({
    name: c.category,
    value: Math.round(c.amount),
    color: COLORS[i % COLORS.length],
  }));

  const tooltipStyle = {
    contentStyle: {
      background: '#0d0d1a',
      border: '1px solid rgba(124,92,252,0.2)',
      borderRadius: '10px',
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '11px',
      color: '#f0efff',
    },
  };

  const summaryCards = [
    {
      label: 'Total Spent',
      value: `₹${Math.round(stats?.total ?? 0).toLocaleString('en-IN')}`,
      sub: '6 months',
      color: '#7c5cfc',
      glow: 'rgba(124,92,252,0.3)',
    },
    {
      label: 'Transactions',
      value: String(stats?.count ?? '—'),
      sub: 'Total count',
      color: '#00d4ff',
      glow: 'rgba(0,212,255,0.25)',
    },
    {
      label: 'Avg / Expense',
      value: `₹${Math.round(stats?.average ?? 0).toLocaleString('en-IN')}`,
      sub: 'Per expense',
      color: '#00ff87',
      glow: 'rgba(0,255,135,0.25)',
    },
    {
      label: 'Top Category',
      value: stats?.byCategory[0]?.category ?? '—',
      sub: `₹${Math.round(stats?.byCategory[0]?.amount ?? 0).toLocaleString('en-IN')}`,
      color: '#ffb830',
      glow: 'rgba(255,184,48,0.25)',
    },
  ];

  return (
    <div
      className='flex flex-col h-full'
      style={{ background: '#080810', overflow: 'hidden' }}
    >
      {/* ── Sticky header ── */}
      <div
        className='shrink-0 px-4 sm:px-8 py-4 sm:py-5'
        style={{
          borderBottom: '1px solid rgba(124,92,252,0.1)',
          background: 'rgba(8,8,16,0.97)',
          backdropFilter: 'blur(20px)',
          zIndex: 10,
        }}
      >
        <h1 className='font-display text-xl sm:text-2xl font-extrabold text-[#f0efff] tracking-tight'>
          Insights
        </h1>
        <p className='font-mono text-[10px] text-[#4a4870]'>
          AI-powered spending analysis · Last 6 months
        </p>
      </div>

      {/* ── Native scroll content ── */}
      <div
        className='flex-1 min-h-0'
        style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className='p-4 sm:p-6 space-y-4 pb-6'>
          {/* ── Summary cards: 2×2 on mobile, 4-col on sm+ ── */}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
            {summaryCards.map((card) => (
              <Card
                key={card.label}
                className='relative overflow-hidden border-transparent transition-all'
                style={{
                  background: 'rgba(13,13,26,0.7)',
                  border: `1px solid ${card.color}20`,
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div
                  className='absolute top-[-20px] right-[-20px] w-20 h-20 rounded-full pointer-events-none'
                  style={{
                    background: `radial-gradient(circle, ${card.glow}, transparent 70%)`,
                  }}
                />
                <CardContent className='p-3 sm:p-4'>
                  <p className='font-mono text-[9px] text-[#4a4870] uppercase tracking-wider mb-2'>
                    {card.label}
                  </p>
                  {isLoading ? (
                    <div className='h-7 rounded-lg bg-[rgba(124,92,252,0.08)] shimmer mb-1.5' />
                  ) : (
                    <p
                      className='font-display text-lg sm:text-xl font-extrabold tracking-tight mb-1 truncate'
                      style={{
                        color: card.color,
                        textShadow: `0 0 20px ${card.glow}`,
                      }}
                    >
                      {card.value}
                    </p>
                  )}
                  <p className='font-mono text-[9px] text-[#4a4870]'>
                    {card.sub}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ── Charts: stacked on mobile, side-by-side on md+ ── */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Line chart */}
            <Card
              className='border-[rgba(124,92,252,0.12)]'
              style={{
                background: 'rgba(13,13,26,0.7)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <CardHeader className='pb-2 px-4 pt-4'>
                <CardTitle className='flex items-center gap-2.5 text-[#f0efff] font-display text-sm font-bold'>
                  <div
                    className='w-0.5 h-4 rounded-sm'
                    style={{
                      background: 'linear-gradient(180deg, #7c5cfc, #00d4ff)',
                    }}
                  />
                  Monthly Trend
                </CardTitle>
              </CardHeader>
              <CardContent className='px-2 pb-4'>
                {isLoading ? (
                  <div
                    className='h-48 rounded-xl shimmer'
                    style={{ background: 'rgba(124,92,252,0.05)' }}
                  />
                ) : trendData.length === 0 ? (
                  <div className='h-48 flex items-center justify-center text-[#4a4870] text-sm'>
                    No data yet
                  </div>
                ) : (
                  <ResponsiveContainer width='100%' height={190}>
                    <LineChart
                      data={trendData}
                      margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray='3 3'
                        stroke='rgba(124,92,252,0.08)'
                      />
                      <XAxis
                        dataKey='month'
                        tick={{
                          fontSize: 9,
                          fill: '#4a4870',
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{
                          fontSize: 9,
                          fill: '#4a4870',
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) =>
                          v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
                        }
                      />
                      <Tooltip {...tooltipStyle} />
                      <Line
                        type='monotone'
                        dataKey='amount'
                        stroke='#7c5cfc'
                        strokeWidth={2.5}
                        dot={{
                          fill: '#7c5cfc',
                          r: 3,
                          strokeWidth: 2,
                          stroke: '#080810',
                        }}
                        activeDot={{ r: 5, fill: '#9d7fff', strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Pie chart */}
            <Card
              className='border-[rgba(124,92,252,0.12)]'
              style={{
                background: 'rgba(13,13,26,0.7)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <CardHeader className='pb-2 px-4 pt-4'>
                <CardTitle className='flex items-center gap-2.5 text-[#f0efff] font-display text-sm font-bold'>
                  <div
                    className='w-0.5 h-4 rounded-sm'
                    style={{
                      background: 'linear-gradient(180deg, #ff2d78, #ffb830)',
                    }}
                  />
                  By Category
                </CardTitle>
              </CardHeader>
              <CardContent className='px-2 pb-4'>
                {isLoading ? (
                  <div
                    className='h-48 rounded-xl shimmer'
                    style={{ background: 'rgba(124,92,252,0.05)' }}
                  />
                ) : pieData.length === 0 ? (
                  <div className='h-48 flex items-center justify-center text-[#4a4870] text-sm'>
                    No data yet
                  </div>
                ) : (
                  <ResponsiveContainer width='100%' height={190}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx='50%'
                        cy='50%'
                        innerRadius={50}
                        outerRadius={75}
                        dataKey='value'
                        paddingAngle={2}
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip {...tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Category breakdown ── */}
          {stats && stats.byCategory.length > 0 && (
            <Card
              className='border-[rgba(124,92,252,0.12)]'
              style={{
                background: 'rgba(13,13,26,0.7)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <CardHeader className='pb-2 px-4 pt-4'>
                <CardTitle className='flex items-center gap-2.5 text-[#f0efff] font-display text-sm font-bold'>
                  <div
                    className='w-0.5 h-4 rounded-sm'
                    style={{
                      background: 'linear-gradient(180deg, #00ff87, #00d4ff)',
                    }}
                  />
                  Category Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className='px-4 pb-5 space-y-4'>
                {stats.byCategory.map((cat, i) => {
                  const pct =
                    stats.total > 0 ? (cat.amount / stats.total) * 100 : 0;
                  const color = COLORS[i % COLORS.length];
                  return (
                    <div key={cat.category}>
                      <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center gap-2'>
                          <div
                            className='w-2 h-2 rounded-sm shrink-0'
                            style={{
                              background: color,
                              boxShadow: `0 0 8px ${color}70`,
                            }}
                          />
                          <span className='font-sans text-sm text-[#d4d2f0]'>
                            {cat.category}
                          </span>
                        </div>
                        <div className='flex items-center gap-3'>
                          <span className='font-mono text-[10px] text-[#4a4870]'>
                            {Math.round(pct)}%
                          </span>
                          <span
                            className='font-display text-sm font-bold'
                            style={{ color }}
                          >
                            ₹{Math.round(cat.amount).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                      <div
                        className='h-1.5 rounded-full overflow-hidden'
                        style={{ background: 'rgba(124,92,252,0.08)' }}
                      >
                        <div
                          className='h-full rounded-full transition-all duration-700'
                          style={{
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, ${color}, ${color}90)`,
                            boxShadow: `0 0 8px ${color}50`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Empty state */}
          {!isLoading && expenses.length === 0 && (
            <div className='flex flex-col items-center justify-center py-20 text-center'>
              <div className='text-5xl mb-4'>📊</div>
              <p className='font-display text-base font-bold text-[#f0efff] mb-1'>
                No data yet
              </p>
              <p className='text-[#4a4870] text-sm'>
                Add some expenses to see your insights
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
