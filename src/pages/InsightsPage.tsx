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
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const COLORS = [
  '#d4ff4f',
  '#a855f7',
  '#06b6d4',
  '#f59e0b',
  '#22c55e',
  '#6b7280',
  '#ec4899',
  '#3b82f6',
];

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: '#111114',
    border: '1px solid #1c1c22',
    borderRadius: '8px',
    fontSize: '12px',
  },
  labelStyle: { color: '#f0eee8' },
  itemStyle: { color: '#d4ff4f' },
};

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

  const summaryCards = [
    {
      label: 'Total Spent',
      value: `Rs.${Math.round(stats?.total ?? 0).toLocaleString('en-IN')}`,
      sub: '6 months',
    },
    {
      label: 'Transactions',
      value: String(stats?.count ?? '—'),
      sub: 'Total count',
    },
    {
      label: 'Avg Transaction',
      value: `Rs.${Math.round(stats?.average ?? 0).toLocaleString('en-IN')}`,
      sub: 'Per expense',
    },
    {
      label: 'Top Category',
      value: stats?.byCategory[0]?.category ?? '—',
      sub: `Rs.${Math.round(stats?.byCategory[0]?.amount ?? 0).toLocaleString('en-IN')}`,
    },
  ];

  return (
    <div className='flex flex-col h-full bg-[--background]'>
      {/* Header */}
      <div className='shrink-0 border-b border-[#1c1c22] bg-[#0a0a0c] px-8 py-6'>
        <h1 className='font-display text-2xl font-bold text-[--foreground]'>
          Insights
        </h1>
        <p className='text-sm text-[--foreground-secondary] mt-0.5 font-mono'>
          AI-powered spending analysis · Last 6 months
        </p>
      </div>

      <ScrollArea className='flex-1'>
        <div className='px-8 py-6 space-y-6'>
          {/* Summary stat cards */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {summaryCards.map((card) => (
              <Card key={card.label} className='bg-[#0f0f12] border-[#1c1c22]'>
                <CardContent className='p-5'>
                  <p className='text-[10px] font-mono text-[--foreground-secondary] uppercase tracking-widest'>
                    {card.label}
                  </p>
                  {isLoading ? (
                    <Skeleton className='h-8 w-28 mt-2 bg-[#1a1a1f]' />
                  ) : (
                    <p className='text-2xl font-display font-bold text-[--foreground] mt-2'>
                      {card.value}
                    </p>
                  )}
                  <p className='text-xs text-[--foreground-secondary] mt-1'>
                    {card.sub}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Line chart */}
            <Card className='bg-[#0f0f12] border-[#1c1c22]'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-mono text-[--foreground-secondary] uppercase tracking-widest font-normal'>
                  Monthly Trend
                </CardTitle>
              </CardHeader>
              <Separator className='bg-[#1c1c22]' />
              <CardContent className='pt-5'>
                {isLoading ? (
                  <Skeleton className='h-64 w-full bg-[#1a1a1f]' />
                ) : (
                  <ResponsiveContainer width='100%' height={260}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray='3 3' stroke='#1c1c22' />
                      <XAxis
                        dataKey='month'
                        stroke='#5c5c6e'
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis stroke='#5c5c6e' tick={{ fontSize: 11 }} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Line
                        type='monotone'
                        dataKey='amount'
                        stroke='#d4ff4f'
                        strokeWidth={2}
                        dot={{ fill: '#d4ff4f', r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Pie chart */}
            <Card className='bg-[#0f0f12] border-[#1c1c22]'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-mono text-[--foreground-secondary] uppercase tracking-widest font-normal'>
                  By Category
                </CardTitle>
              </CardHeader>
              <Separator className='bg-[#1c1c22]' />
              <CardContent className='pt-5'>
                {isLoading ? (
                  <Skeleton className='h-64 w-full bg-[#1a1a1f]' />
                ) : pieData.length > 0 ? (
                  <ResponsiveContainer width='100%' height={260}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx='50%'
                        cy='50%'
                        outerRadius={90}
                        dataKey='value'
                        label={({ name, value }) => `${name} Rs.${value}`}
                        labelLine={{ stroke: '#2a2a32' }}
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={TOOLTIP_STYLE.contentStyle}
                        itemStyle={{ color: '#f0eee8' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className='flex flex-col items-center justify-center h-64 gap-2'>
                    <p className='text-[--foreground-secondary] text-sm'>
                      No data yet
                    </p>
                    <Badge
                      variant='outline'
                      className='border-[#1c1c22] text-[--foreground-secondary] font-mono text-[10px]'
                    >
                      Add expenses to see breakdown
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Category breakdown with progress bars */}
          {stats && stats.byCategory.length > 0 && (
            <Card className='bg-[#0f0f12] border-[#1c1c22]'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-mono text-[--foreground-secondary] uppercase tracking-widest font-normal'>
                  Category Breakdown
                </CardTitle>
              </CardHeader>
              <Separator className='bg-[#1c1c22]' />
              <CardContent className='pt-5 space-y-4'>
                {stats.byCategory.map((cat, i) => {
                  const pct =
                    stats.total > 0 ? (cat.amount / stats.total) * 100 : 0;
                  const color = COLORS[i % COLORS.length];
                  return (
                    <div key={cat.category} className='space-y-1.5'>
                      <div className='flex justify-between items-center'>
                        <div className='flex items-center gap-2'>
                          <span
                            className='w-2 h-2 rounded-full shrink-0'
                            style={{ backgroundColor: color }}
                          />
                          <span className='text-sm text-[--foreground]'>
                            {cat.category}
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Badge
                            variant='outline'
                            className='border-[#1c1c22] bg-[#111114] text-[--foreground-secondary] font-mono text-[10px]'
                          >
                            {Math.round(pct)}%
                          </Badge>
                          <span className='text-sm font-mono text-[--foreground-secondary]'>
                            Rs.{Math.round(cat.amount).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                      {/* shadcn Progress — override the indicator color via inline style trick */}
                      <div className='w-full bg-[#1a1a1f] rounded-full h-1.5 overflow-hidden'>
                        <div
                          className='h-1.5 rounded-full transition-all duration-500'
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
