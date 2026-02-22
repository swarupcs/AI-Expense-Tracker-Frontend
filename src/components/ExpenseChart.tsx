import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  type TooltipProps,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ChartDataItem {
  amount: number;
  [key: string]: string | number;
}

interface ExpenseChartProps {
  chartData: ChartDataItem[];
  labelKey: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  DINING: '#ec4899',
  SHOPPING: '#a855f7',
  TRANSPORT: '#06b6d4',
  ENTERTAINMENT: '#f59e0b',
  UTILITIES: '#22c55e',
  HEALTH: '#f43f5e',
  EDUCATION: '#3b82f6',
  OTHER: '#6b7280',
};

const DEFAULT_BAR_COLOR = '#d4ff4f';

function CustomTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  return (
    <Card className='border-[#1c1c22] bg-[#111114] shadow-xl p-0'>
      <CardContent className='px-4 py-3'>
        <p className='text-[10px] font-mono text-[--foreground-secondary] uppercase tracking-widest mb-1'>
          {label}
        </p>
        <p className='text-base font-bold text-[--foreground]'>
          Rs.{Number(payload[0].value).toLocaleString('en-IN')}
        </p>
      </CardContent>
    </Card>
  );
}

export function ExpenseChart({ chartData, labelKey }: ExpenseChartProps) {
  if (!chartData || chartData.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center h-40 gap-2'>
        <p className='text-sm text-[--foreground-secondary]'>
          No data available
        </p>
        <Badge
          variant='outline'
          className='border-[#1c1c22] text-[--foreground-secondary] font-mono text-[10px]'
        >
          Add expenses to see charts
        </Badge>
      </div>
    );
  }

  const isCategoryChart = labelKey === 'category';
  const maxAmount = Math.max(...chartData.map((d) => d.amount));

  return (
    <div className='space-y-3'>
      <ResponsiveContainer width='100%' height={220}>
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
          barCategoryGap='28%'
        >
          <CartesianGrid
            strokeDasharray='3 3'
            stroke='#1c1c22'
            vertical={false}
          />
          <XAxis
            dataKey={labelKey}
            stroke='#3a3a46'
            tick={{ fontSize: 11, fill: '#5c5c6e', fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke='#3a3a46'
            tick={{ fontSize: 11, fill: '#5c5c6e', fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) =>
              v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
            }
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
          <Bar dataKey='amount' radius={[6, 6, 0, 0]} maxBarSize={48}>
            {chartData.map((entry, index) => {
              const label = String(entry[labelKey]);
              const color = isCategoryChart
                ? (CATEGORY_COLORS[label] ?? DEFAULT_BAR_COLOR)
                : DEFAULT_BAR_COLOR;
              const opacity =
                entry.amount === maxAmount
                  ? 1
                  : 0.5 + (entry.amount / maxAmount) * 0.4;
              return (
                <Cell key={`cell-${index}`} fill={color} opacity={opacity} />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend for category charts */}
      {isCategoryChart && chartData.length > 0 && (
        <>
          <Separator className='bg-[#1c1c22]' />
          <div className='flex flex-wrap gap-2 pt-1'>
            {chartData.map((entry) => {
              const label = String(entry[labelKey]);
              const color = CATEGORY_COLORS[label] ?? DEFAULT_BAR_COLOR;
              return (
                <Badge
                  key={label}
                  variant='outline'
                  className='border-[#1c1c22] bg-[#111114] text-[--foreground-secondary] font-mono text-[10px] gap-1.5'
                >
                  <span
                    className='w-1.5 h-1.5 rounded-full shrink-0'
                    style={{ backgroundColor: color }}
                  />
                  {label}
                </Badge>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
