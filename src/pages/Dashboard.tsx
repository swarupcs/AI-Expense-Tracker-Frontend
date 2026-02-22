import { useExpenseStats, useExpenses } from '@/services/expenses.service';
import { useAuthStore } from '@/store/auth.store';
import { ExpenseChart } from '@/components/ExpenseChart';
import { TrendingDown, TrendingUp, DollarSign, BarChart2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const now = new Date();
const CURRENT_MONTH_FROM = new Date(now.getFullYear(), now.getMonth(), 1)
  .toISOString()
  .split('T')[0];
const CURRENT_MONTH_TO = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  .toISOString()
  .split('T')[0];

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  subClassName,
  isLoading,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  sub: React.ReactNode;
  subClassName?: string;
  isLoading: boolean;
}) {
  return (
    <Card className='bg-[#0f0f12] border-[#1c1c22]'>
      <CardContent className='p-5'>
        <div className='flex items-start justify-between'>
          <div className='space-y-1'>
            <p className='text-xs font-mono text-[--foreground-secondary] uppercase tracking-widest'>
              {label}
            </p>
            {isLoading ? (
              <Skeleton className='h-9 w-32 bg-[#1a1a1f]' />
            ) : (
              <p className='text-3xl font-display font-bold text-[--foreground]'>
                {value}
              </p>
            )}
          </div>
          <div className='w-9 h-9 rounded-lg bg-[#1a1a1f] flex items-center justify-center shrink-0'>
            <Icon className='w-4 h-4 text-[--primary]' />
          </div>
        </div>
        <div
          className={`text-xs mt-3 flex items-center gap-1 ${subClassName ?? 'text-[--foreground-secondary]'}`}
        >
          {isLoading ? <Skeleton className='h-3 w-24 bg-[#1a1a1f]' /> : sub}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const { data: statsData, isLoading: statsLoading } = useExpenseStats(
    CURRENT_MONTH_FROM,
    CURRENT_MONTH_TO,
  );
  const { data: expData, isLoading: expLoading } = useExpenses({
    from: CURRENT_MONTH_FROM,
    to: CURRENT_MONTH_TO,
  });

  const isLoading = statsLoading || expLoading;
  const expenses = expData?.expenses ?? [];
  const stats = statsData;

  const chartData = expenses
    .slice(0, 14)
    .map((e) => ({ date: e.date.slice(5), amount: e.amount }));
  const categoryChartData = (stats?.byCategory ?? []).map((c) => ({
    category: c.category,
    amount: c.amount,
  }));

  return (
    <div className='flex flex-col h-full overflow-hidden bg-[--background]'>
      {/* Header */}
      <div className='shrink-0 border-b border-[#1c1c22] bg-[#0a0a0c] px-8 py-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='font-display text-2xl font-bold text-[--foreground]'>
              {user ? `Welcome back, ${user.name.split(' ')[0]}` : 'Dashboard'}
            </h1>
            <p className='text-sm text-[--foreground-secondary] mt-0.5 font-mono'>
              {new Date().toLocaleDateString('en-IN', {
                month: 'long',
                year: 'numeric',
              })}{' '}
              Overview
            </p>
          </div>
          {isLoading && (
            <Badge
              variant='outline'
              className='border-[--primary]/20 bg-[--primary]/10 text-[--primary] font-mono text-[10px] gap-1.5 animate-pulse'
            >
              Loading…
            </Badge>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className='flex-1 min-h-0 overflow-y-auto'>
        <div className='px-8 py-6 space-y-6'>
          {/* Stat cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <StatCard
              label='Total Spent'
              value={`Rs.${(stats?.total ?? 0).toLocaleString('en-IN')}`}
              icon={DollarSign}
              isLoading={isLoading}
              sub={
                <span className='flex items-center gap-1 text-green-400'>
                  <TrendingDown className='w-3 h-3' /> This month
                </span>
              }
            />
            <StatCard
              label='Avg Transaction'
              value={`Rs.${Math.round(stats?.average ?? 0).toLocaleString('en-IN')}`}
              icon={BarChart2}
              isLoading={isLoading}
              sub={`${stats?.count ?? 0} transactions`}
            />
            <Card className='bg-[#0f0f12] border-[#1c1c22]'>
              <CardContent className='p-5'>
                <div className='flex items-start justify-between'>
                  <div className='space-y-1'>
                    <p className='text-xs font-mono text-[--foreground-secondary] uppercase tracking-widest'>
                      Top Category
                    </p>
                    {isLoading ? (
                      <Skeleton className='h-9 w-32 bg-[#1a1a1f]' />
                    ) : (
                      <p className='text-3xl font-display font-bold text-[--primary]'>
                        {stats?.byCategory[0]?.category ?? 'None'}
                      </p>
                    )}
                  </div>
                  <div className='w-9 h-9 rounded-lg bg-[#1a1a1f] flex items-center justify-center shrink-0'>
                    <TrendingUp className='w-4 h-4 text-[--primary]' />
                  </div>
                </div>
                <p className='text-xs text-[--primary] mt-3'>
                  {isLoading ? (
                    <Skeleton className='h-3 w-24 bg-[#1a1a1f]' />
                  ) : (
                    `Rs.${(stats?.byCategory[0]?.amount ?? 0).toLocaleString('en-IN')} spent`
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent expenses chart */}
          {expenses.length > 0 && (
            <Card className='bg-[#0f0f12] border-[#1c1c22]'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-mono text-[--foreground-secondary] uppercase tracking-widest font-normal'>
                  Recent Expenses
                </CardTitle>
              </CardHeader>
              <Separator className='bg-[#1c1c22] mb-4' />
              <CardContent>
                <ExpenseChart chartData={chartData} labelKey='date' />
              </CardContent>
            </Card>
          )}

          {/* Category chart */}
          {categoryChartData.length > 0 && (
            <Card className='bg-[#0f0f12] border-[#1c1c22]'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-mono text-[--foreground-secondary] uppercase tracking-widest font-normal'>
                  By Category
                </CardTitle>
              </CardHeader>
              <Separator className='bg-[#1c1c22] mb-4' />
              <CardContent>
                <ExpenseChart
                  chartData={categoryChartData}
                  labelKey='category'
                />
              </CardContent>
            </Card>
          )}

          {/* Empty state */}
          {!isLoading && expenses.length === 0 && (
            <div className='flex flex-col items-center justify-center py-16 text-center'>
              <p className='text-[--foreground-secondary] text-sm'>
                No expenses this month.
              </p>
              <p className='text-[--foreground-secondary] text-xs mt-1'>
                Head to the AI Chat to add your first expense!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
