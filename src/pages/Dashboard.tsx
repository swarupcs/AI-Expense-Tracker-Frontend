import { useExpenseStats, useExpenses } from '@/services/expenses.service';
import { useAuthStore } from '@/store/auth.store';
import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  TrendingDown,
  DollarSign,
  BarChart2,
  Activity,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CATEGORY_COLORS: Record<string, string> = {
  DINING: '#ff2d78',
  SHOPPING: '#9d7fff',
  TRANSPORT: '#00d4ff',
  ENTERTAINMENT: '#ffb830',
  UTILITIES: '#00ff87',
  HEALTH: '#ff6b9d',
  EDUCATION: '#5b8fff',
  OTHER: '#4a4870',
};

const CATEGORY_EMOJI: Record<string, string> = {
  DINING: '🍽️',
  SHOPPING: '🛍️',
  TRANSPORT: '🚗',
  ENTERTAINMENT: '🎮',
  UTILITIES: '⚡',
  HEALTH: '💊',
  EDUCATION: '📚',
  OTHER: '📦',
};

const PIE_COLORS = [
  '#7c5cfc',
  '#00d4ff',
  '#00ff87',
  '#ffb830',
  '#ff2d78',
  '#9d7fff',
  '#5b8fff',
  '#4a4870',
];

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  accent,
  isLoading,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  sub: React.ReactNode;
  accent: string;
  isLoading?: boolean;
}) {
  return (
    <Card
      className='relative overflow-hidden border-[rgba(124,92,252,0.12)] hover:border-[rgba(124,92,252,0.3)] transition-all duration-200 hover:shadow-[0_4px_30px_rgba(124,92,252,0.08)]'
      style={{ background: 'rgba(13,13,26,0.7)', backdropFilter: 'blur(20px)' }}
    >
      <div
        className='absolute top-[-30px] right-[-30px] w-[100px] h-[100px] rounded-full pointer-events-none'
        style={{
          background: `radial-gradient(circle, ${accent}20, transparent 70%)`,
        }}
      />
      <CardContent className='p-4 sm:p-5'>
        <div className='flex justify-between items-start mb-3'>
          <div
            className='w-9 h-9 rounded-xl flex items-center justify-center'
            style={{
              background: `${accent}15`,
              border: `1px solid ${accent}30`,
            }}
          >
            <Icon style={{ width: '16px', height: '16px', color: accent }} />
          </div>
          <span className='font-mono text-[9px] text-[#4a4870] uppercase tracking-wider'>
            {label}
          </span>
        </div>

        {isLoading ? (
          <div className='h-7 rounded-lg bg-[rgba(124,92,252,0.08)] mb-2 shimmer' />
        ) : (
          <div className='font-display text-xl sm:text-2xl font-extrabold text-[#f0efff] tracking-tight mb-1.5 leading-none'>
            {value}
          </div>
        )}
        <div className='font-mono text-[10px] text-[#4a4870] flex items-center gap-1.5 flex-wrap'>
          {sub}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);

  const { currentMonthFrom, currentMonthTo } = useMemo(() => {
    const now = new Date();
    return {
      currentMonthFrom: new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split('T')[0],
      currentMonthTo: new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split('T')[0],
    };
  }, []);

  const { data: statsData, isLoading: statsLoading } = useExpenseStats(
    currentMonthFrom,
    currentMonthTo,
  );
  const { data: expData, isLoading: expLoading } = useExpenses({
    from: currentMonthFrom,
    to: currentMonthTo,
  });

  const isLoading = statsLoading || expLoading;
  const expenses = expData?.expenses ?? [];
  const stats = statsData;

  const barData = expenses
    .slice(0, 14)
    .map((e) => ({ date: e.date.slice(5), amount: e.amount }));
  const pieData = (stats?.byCategory ?? []).map((c, i) => ({
    name: c.category,
    value: Math.round(c.amount),
    color: PIE_COLORS[i % PIE_COLORS.length],
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
    cursor: { fill: 'rgba(124,92,252,0.05)' },
  };

  return (
    /* 
      KEY FIX: Use a plain div with overflow-y-auto instead of ScrollArea.
      On mobile, ScrollArea from Radix can fail to scroll properly when nested
      inside a flex container that has overflow-hidden parents.
      We rely on the natural block flow + overflow-y-auto here.
    */
    <div
      className='flex flex-col h-full'
      style={{ background: '#080810', overflow: 'hidden' }}
    >
      {/* Sticky Header */}
      <div
        className='shrink-0 px-4 sm:px-8 py-4 sm:py-5'
        style={{
          borderBottom: '1px solid rgba(124,92,252,0.1)',
          background: 'rgba(8,8,16,0.95)',
          backdropFilter: 'blur(20px)',
          zIndex: 10,
        }}
      >
        <div className='flex items-center justify-between'>
          <div>
            <div className='flex items-center gap-2 mb-1'>
              <Sparkles className='w-3.5 h-3.5 text-[#7c5cfc]' />
              <span className='font-mono text-[9px] text-[#4a4870] uppercase tracking-[0.15em]'>
                {new Date().toLocaleDateString('en-IN', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <h1 className='font-display text-xl sm:text-2xl font-extrabold text-[#f0efff] tracking-tight'>
              {user ? `Hey, ${user.name.split(' ')[0]} 👋` : 'Dashboard'}
            </h1>
          </div>
          <div
            className='flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl'
            style={{
              background: 'rgba(0,255,135,0.07)',
              border: '1px solid rgba(0,255,135,0.2)',
            }}
          >
            <div
              className='w-1.5 h-1.5 rounded-full pulse-dot'
              style={{ background: '#00ff87', boxShadow: '0 0 6px #00ff87' }}
            />
            <span className='font-mono text-[9px] sm:text-[10px] text-[#00ff87]'>
              Live
            </span>
          </div>
        </div>
      </div>

      {/* Scrollable Content — native overflow-y-auto for reliable mobile scroll */}
      <div
        className='flex-1 min-h-0'
        style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className='p-4 sm:p-6 space-y-4 pb-6'>
          {/* ── Stat Cards: 1-col on mobile, 3-col on sm+ ── */}
          <div className='grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3'>
            <StatCard
              label='Total Spent'
              value={`₹${(stats?.total ?? 0).toLocaleString('en-IN')}`}
              icon={DollarSign}
              sub={
                <>
                  <TrendingDown className='w-3 h-3 text-[#00ff87]' /> This month
                </>
              }
              accent='#7c5cfc'
              isLoading={isLoading}
            />
            <StatCard
              label='Avg Transaction'
              value={`₹${Math.round(stats?.average ?? 0).toLocaleString('en-IN')}`}
              icon={BarChart2}
              sub={`${stats?.count ?? 0} transactions`}
              accent='#00d4ff'
              isLoading={isLoading}
            />
            <StatCard
              label='Top Category'
              value={stats?.byCategory[0]?.category ?? 'None'}
              icon={Activity}
              sub={`₹${(stats?.byCategory[0]?.amount ?? 0).toLocaleString('en-IN')} spent`}
              accent='#ff2d78'
              isLoading={isLoading}
            />
          </div>

          {/* ── Charts ── */}
          {!isLoading && expenses.length > 0 && (
            <div className='grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-4'>
              {/* Bar Chart */}
              <Card
                className='border-[rgba(124,92,252,0.12)]'
                style={{
                  background: 'rgba(13,13,26,0.7)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <CardHeader className='pb-2 px-4 pt-4'>
                  <CardTitle className='flex items-center gap-2.5 text-[#f0efff] font-display text-sm font-semibold'>
                    <div
                      className='w-0.5 h-4 rounded-sm'
                      style={{
                        background: 'linear-gradient(180deg, #7c5cfc, #00d4ff)',
                      }}
                    />
                    Recent Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent className='px-2 pb-4'>
                  <ResponsiveContainer width='100%' height={160}>
                    <BarChart
                      data={barData}
                      margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                      barCategoryGap='30%'
                    >
                      <CartesianGrid
                        strokeDasharray='3 3'
                        stroke='rgba(124,92,252,0.08)'
                        vertical={false}
                      />
                      <XAxis
                        dataKey='date'
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
                      <Bar
                        dataKey='amount'
                        radius={[6, 6, 0, 0]}
                        maxBarSize={36}
                        fill='#7c5cfc'
                      >
                        {barData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={`rgba(124,92,252,${0.5 + (i / barData.length) * 0.5})`}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Pie Chart */}
              {pieData.length > 0 && (
                <Card
                  className='border-[rgba(124,92,252,0.12)]'
                  style={{
                    background: 'rgba(13,13,26,0.7)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <CardHeader className='pb-2 px-4 pt-4'>
                    <CardTitle className='flex items-center gap-2.5 text-[#f0efff] font-display text-sm font-semibold'>
                      <div
                        className='w-0.5 h-4 rounded-sm'
                        style={{
                          background:
                            'linear-gradient(180deg, #ff2d78, #ffb830)',
                        }}
                      />
                      By Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='px-2 pb-4'>
                    <ResponsiveContainer width='100%' height={140}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx='50%'
                          cy='50%'
                          innerRadius={40}
                          outerRadius={62}
                          dataKey='value'
                          paddingAngle={2}
                        >
                          {pieData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle.contentStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Legend */}
                    <div className='space-y-1.5 mt-2 px-2'>
                      {pieData.slice(0, 4).map((d) => (
                        <div
                          key={d.name}
                          className='flex items-center justify-between'
                        >
                          <div className='flex items-center gap-2'>
                            <div
                              className='w-2 h-2 rounded-sm shrink-0'
                              style={{
                                background: d.color,
                                boxShadow: `0 0 6px ${d.color}60`,
                              }}
                            />
                            <span className='font-mono text-[10px] text-[#8b89b0]'>
                              {d.name}
                            </span>
                          </div>
                          <span
                            className='font-mono text-[10px]'
                            style={{ color: d.color }}
                          >
                            ₹{d.value.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* ── Recent Transactions ── */}
          {expenses.length > 0 && (
            <Card
              className='border-[rgba(124,92,252,0.12)]'
              style={{
                background: 'rgba(13,13,26,0.7)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <CardHeader className='pb-2 px-4 pt-4'>
                <CardTitle className='flex items-center gap-2.5 text-[#f0efff] font-display text-sm font-semibold'>
                  <div
                    className='w-0.5 h-4 rounded-sm'
                    style={{
                      background: 'linear-gradient(180deg, #00d4ff, #00ff87)',
                    }}
                  />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent className='px-2 pb-3 space-y-0.5'>
                {expenses.slice(0, 5).map((exp) => (
                  <div
                    key={exp.id}
                    className='flex items-center justify-between px-2 py-2.5 rounded-xl hover:bg-[rgba(124,92,252,0.06)] transition-colors cursor-default'
                  >
                    <div className='flex items-center gap-2.5 min-w-0 flex-1'>
                      <div
                        className='w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0'
                        style={{
                          background: `${CATEGORY_COLORS[exp.category] ?? '#4a4870'}15`,
                          border: `1px solid ${CATEGORY_COLORS[exp.category] ?? '#4a4870'}30`,
                        }}
                      >
                        {CATEGORY_EMOJI[exp.category] ?? '📦'}
                      </div>
                      <div className='min-w-0'>
                        <div className='font-sans text-sm font-medium text-[#f0efff] truncate max-w-[140px] sm:max-w-[260px]'>
                          {exp.title}
                        </div>
                        <div className='font-mono text-[9px] text-[#4a4870] flex items-center gap-1.5'>
                          <span
                            className='px-1.5 py-px rounded text-[8px]'
                            style={{
                              background: `${CATEGORY_COLORS[exp.category] ?? '#4a4870'}18`,
                              color: CATEGORY_COLORS[exp.category] ?? '#4a4870',
                            }}
                          >
                            {exp.category}
                          </span>
                          <span>{exp.date}</span>
                        </div>
                      </div>
                    </div>
                    <div
                      className='font-display text-sm font-bold shrink-0 ml-2'
                      style={{
                        color: CATEGORY_COLORS[exp.category] ?? '#9d7fff',
                      }}
                    >
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* ── Loading skeletons ── */}
          {isLoading && (
            <div className='space-y-3'>
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className='h-32 rounded-2xl shimmer'
                  style={{ background: 'rgba(124,92,252,0.05)' }}
                />
              ))}
            </div>
          )}

          {/* ── Empty state ── */}
          {!isLoading && expenses.length === 0 && (
            <div className='flex flex-col items-center justify-center py-20 text-center'>
              <div className='text-5xl mb-4'>✨</div>
              <div className='font-display text-xl font-bold text-[#f0efff] mb-2'>
                No expenses yet
              </div>
              <p className='text-[#4a4870] text-sm'>
                Head to AI Chat to add your first expense!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
