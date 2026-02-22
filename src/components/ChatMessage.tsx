import { useState } from 'react';
import {
  User,
  Zap,
  AlertTriangle,
  Wrench,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
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
  LineChart,
  Line,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import type { StreamMessage } from '@/types/StreamMessage.types';

interface ChatMessageProps {
  message: StreamMessage;
}

// ─── Category colors ──────────────────────────────────────────────────────────
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
const CHART_PALETTE = [
  '#d4ff4f',
  '#a855f7',
  '#06b6d4',
  '#f59e0b',
  '#22c55e',
  '#f43f5e',
  '#3b82f6',
  '#6b7280',
];

// ─── Chart detection from tool result ────────────────────────────────────────
type ChartShape =
  | { kind: 'bar'; data: { label: string; amount: number; color?: string }[] }
  | { kind: 'pie'; data: { name: string; value: number; color: string }[] }
  | { kind: 'line'; data: { month: string; amount: number }[] }
  | null;

function detectChart(result: Record<string, unknown>): ChartShape {
  // --- byCategory array (stats result) → Bar + Pie
  if (Array.isArray(result.byCategory) && result.byCategory.length > 0) {
    const cats = result.byCategory as Array<{
      category: string;
      amount: number;
      count?: number;
    }>;
    return {
      kind: 'bar',
      data: cats.map((c) => ({
        label: c.category,
        amount: Math.round(c.amount),
        color: CATEGORY_COLORS[c.category] ?? '#d4ff4f',
      })),
    };
  }

  // --- expenses array → bar chart by date or category
  if (Array.isArray(result.expenses) && result.expenses.length > 0) {
    const exps = result.expenses as Array<{
      date: string;
      amount: number;
      category?: string;
    }>;

    // Group by month for line chart if spanning > 1 month
    const monthSet = new Set(exps.map((e) => e.date.slice(0, 7)));
    if (monthSet.size > 1) {
      const monthMap: Record<string, number> = {};
      for (const e of exps) {
        const key = e.date.slice(0, 7);
        monthMap[key] = (monthMap[key] ?? 0) + e.amount;
      }
      const lineData = Object.entries(monthMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, amount]) => ({
          month: new Date(month + '-01').toLocaleString('en', {
            month: 'short',
          }),
          amount: Math.round(amount),
        }));
      return { kind: 'line', data: lineData };
    }

    // Single month → bar chart by date
    const dateMap: Record<string, number> = {};
    for (const e of exps) {
      const key = e.date.slice(5); // MM-DD
      dateMap[key] = (dateMap[key] ?? 0) + e.amount;
    }
    return {
      kind: 'bar',
      data: Object.entries(dateMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([label, amount]) => ({ label, amount, color: '#d4ff4f' })),
    };
  }

  // --- data array with amount/total + label/category/month
  if (Array.isArray(result.data) && result.data.length > 0) {
    const rows = result.data as Array<Record<string, unknown>>;
    const labelKey = ['label', 'category', 'month', 'date', 'name'].find(
      (k) => k in rows[0],
    );
    const valueKey = ['amount', 'total', 'value', 'count'].find(
      (k) => k in rows[0],
    );
    if (labelKey && valueKey) {
      return {
        kind: 'bar',
        data: rows.map((r, i) => ({
          label: String(r[labelKey]),
          amount: Math.round(Number(r[valueKey])),
          color:
            CATEGORY_COLORS[String(r[labelKey])] ??
            CHART_PALETTE[i % CHART_PALETTE.length],
        })),
      };
    }
  }

  return null;
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
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

// ─── Rendered chart component ─────────────────────────────────────────────────
function RenderedChart({ chart }: { chart: NonNullable<ChartShape> }) {
  if (chart.kind === 'bar') {
    const maxAmt = Math.max(...chart.data.map((d) => d.amount));
    return (
      <div className='mt-3 space-y-2'>
        <p className='text-[10px] font-mono text-[--foreground-secondary] uppercase tracking-widest'>
          Spending Chart
        </p>
        <ResponsiveContainer width='100%' height={200}>
          <BarChart
            data={chart.data}
            margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
            barCategoryGap='28%'
          >
            <CartesianGrid
              strokeDasharray='3 3'
              stroke='#1c1c22'
              vertical={false}
            />
            <XAxis
              dataKey='label'
              stroke='#3a3a46'
              tick={{ fontSize: 10, fill: '#5c5c6e', fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke='#3a3a46'
              tick={{ fontSize: 10, fill: '#5c5c6e', fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) =>
                v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
              }
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: '#ffffff05' }}
            />
            <Bar dataKey='amount' radius={[6, 6, 0, 0]} maxBarSize={48}>
              {chart.data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.color ?? '#d4ff4f'}
                  opacity={
                    entry.amount === maxAmt
                      ? 1
                      : 0.5 + (entry.amount / maxAmt) * 0.4
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className='flex flex-wrap gap-1.5 pt-1'>
          {chart.data.map((d) => (
            <Badge
              key={d.label}
              variant='outline'
              className='border-[#1c1c22] bg-[#111114] text-[--foreground-secondary] font-mono text-[10px] gap-1.5'
            >
              <span
                className='w-1.5 h-1.5 rounded-full shrink-0'
                style={{ backgroundColor: d.color ?? '#d4ff4f' }}
              />
              {d.label}
            </Badge>
          ))}
        </div>
      </div>
    );
  }

  if (chart.kind === 'pie') {
    return (
      <div className='mt-3 space-y-2'>
        <p className='text-[10px] font-mono text-[--foreground-secondary] uppercase tracking-widest'>
          Category Breakdown
        </p>
        <ResponsiveContainer width='100%' height={200}>
          <PieChart>
            <Pie
              data={chart.data}
              cx='50%'
              cy='50%'
              outerRadius={80}
              dataKey='value'
              label={({ name, value }) => `${name} Rs.${value}`}
              labelLine={{ stroke: '#2a2a32' }}
            >
              {chart.data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#111114',
                border: '1px solid #1c1c22',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              itemStyle={{ color: '#f0eee8' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chart.kind === 'line') {
    return (
      <div className='mt-3 space-y-2'>
        <p className='text-[10px] font-mono text-[--foreground-secondary] uppercase tracking-widest'>
          Monthly Trend
        </p>
        <ResponsiveContainer width='100%' height={200}>
          <LineChart
            data={chart.data}
            margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray='3 3' stroke='#1c1c22' />
            <XAxis dataKey='month' stroke='#5c5c6e' tick={{ fontSize: 10 }} />
            <YAxis stroke='#5c5c6e' tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111114',
                border: '1px solid #1c1c22',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              itemStyle={{ color: '#d4ff4f' }}
            />
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
      </div>
    );
  }

  return null;
}

// ─── Tool call block (collapsible, amber) ─────────────────────────────────────
function ToolCallBlock({
  name,
  args,
}: {
  name: string;
  args?: Record<string, unknown>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className='rounded-lg border border-[#1c1c22] bg-[#0d0d10] overflow-hidden'>
        <CollapsibleTrigger asChild>
          <Button
            variant='ghost'
            className='w-full flex items-center justify-start gap-2.5 px-3 py-2 h-auto rounded-none hover:bg-[#111114] text-left'
          >
            <Wrench className='h-3 w-3 text-amber-400 shrink-0' />
            <Badge
              variant='outline'
              className='border-amber-900/40 bg-amber-950/20 text-amber-400 font-mono text-[10px] px-1.5 py-0'
            >
              tool
            </Badge>
            <span className='text-xs font-mono text-amber-400 flex-1 truncate'>
              {name}
            </span>
            {open ? (
              <ChevronDown className='h-3 w-3 text-[--foreground-secondary] shrink-0' />
            ) : (
              <ChevronRight className='h-3 w-3 text-[--foreground-secondary] shrink-0' />
            )}
          </Button>
        </CollapsibleTrigger>
        {args && (
          <CollapsibleContent>
            <ScrollArea className='max-h-48'>
              <pre className='px-3 pb-3 pt-1 text-[11px] font-mono text-[--foreground-secondary] leading-relaxed'>
                {JSON.stringify(args, null, 2)}
              </pre>
              <ScrollBar orientation='horizontal' />
            </ScrollArea>
          </CollapsibleContent>
        )}
      </div>
    </Collapsible>
  );
}

// ─── Tool result block — auto-renders charts when detected ────────────────────
function ToolResultBlock({
  name,
  result,
}: {
  name: string;
  result: Record<string, unknown>;
}) {
  const [open, setOpen] = useState(false);
  const chart = detectChart(result);

  return (
    <div className='space-y-2'>
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className='rounded-lg border border-green-900/30 bg-green-950/10 overflow-hidden'>
          <CollapsibleTrigger asChild>
            <Button
              variant='ghost'
              className='w-full flex items-center justify-start gap-2.5 px-3 py-2 h-auto rounded-none hover:bg-green-950/20 text-left'
            >
              <span className='w-1.5 h-1.5 rounded-full bg-green-400 shrink-0' />
              <Badge
                variant='outline'
                className='border-green-900/40 bg-green-950/20 text-green-400 font-mono text-[10px] px-1.5 py-0'
              >
                result
              </Badge>
              <span className='text-xs font-mono text-green-400 flex-1 truncate'>
                {name}
              </span>
              {open ? (
                <ChevronDown className='h-3 w-3 text-green-400/50 shrink-0' />
              ) : (
                <ChevronRight className='h-3 w-3 text-green-400/50 shrink-0' />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ScrollArea className='max-h-48'>
              <pre className='px-3 pb-3 pt-1 text-[11px] font-mono text-green-400/70 leading-relaxed'>
                {JSON.stringify(result, null, 2)}
              </pre>
              <ScrollBar orientation='horizontal' />
            </ScrollArea>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Auto-render chart if data is chart-compatible */}
      {chart && (
        <div className='rounded-lg border border-[#1c1c22] bg-[#0d0d10] px-4 pb-4 pt-2'>
          <RenderedChart chart={chart} />
        </div>
      )}
    </div>
  );
}

// ─── Inline markdown renderer ─────────────────────────────────────────────────
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className='font-semibold text-[--foreground]'>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className='px-1.5 py-0.5 rounded bg-[#1a1a1f] text-[--primary] text-[11px] font-mono'
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

// ─── AI text content with light markdown ─────────────────────────────────────
function AiTextContent({ text }: { text: string }) {
  const lines = text.split('\n');

  return (
    <div className='text-sm text-[--foreground] leading-relaxed space-y-1.5'>
      {lines.map((line, i) => {
        if (line.startsWith('### ')) {
          return (
            <h3
              key={i}
              className='font-semibold text-[--foreground] text-sm mt-3 mb-0.5'
            >
              {line.slice(4)}
            </h3>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h2
              key={i}
              className='font-bold text-[--foreground] text-base mt-4 mb-1'
            >
              {line.slice(3)}
            </h2>
          );
        }
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return (
            <div key={i} className='flex gap-2 items-start'>
              <span className='text-[--primary] mt-[5px] text-[8px] shrink-0'>
                ◆
              </span>
              <span>{renderInline(line.slice(2))}</span>
            </div>
          );
        }
        if (line.trim() === '') return <div key={i} className='h-1' />;
        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function ChatMessage({ message }: ChatMessageProps) {
  if (message.type === 'user') {
    return (
      <div className='flex gap-4 py-5 px-6 justify-end'>
        <div className='max-w-[75%]'>
          <div className='bg-[--primary] rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm'>
            <p className='text-sm text-[--primary-foreground] leading-relaxed'>
              {message.payload.text}
            </p>
          </div>
        </div>
        <div className='shrink-0 w-7 h-7 rounded-lg bg-[#1c1c22] border border-[#2a2a32] flex items-center justify-center mt-0.5'>
          <User className='h-3.5 w-3.5 text-[--foreground-secondary]' />
        </div>
      </div>
    );
  }

  if (message.type === 'toolCall:start') {
    return (
      <div className='flex gap-4 py-3 px-6'>
        <div className='shrink-0 w-7 h-7 rounded-lg bg-amber-950/20 border border-amber-900/20 flex items-center justify-center mt-0.5'>
          <Wrench className='h-3.5 w-3.5 text-amber-400' />
        </div>
        <div className='flex-1 pt-0.5'>
          <ToolCallBlock
            name={message.payload.name}
            args={message.payload.args}
          />
        </div>
      </div>
    );
  }

  if (message.type === 'tool') {
    return (
      <div className='flex gap-4 py-3 px-6'>
        <div className='shrink-0 w-7 h-7 rounded-lg bg-green-950/20 border border-green-900/20 flex items-center justify-center mt-0.5'>
          <Zap className='h-3.5 w-3.5 text-green-400' />
        </div>
        <div className='flex-1 pt-0.5'>
          <ToolResultBlock
            name={message.payload.name}
            result={message.payload.result}
          />
        </div>
      </div>
    );
  }

  if (message.type === 'error') {
    return (
      <div className='flex gap-4 py-5 px-6'>
        <div className='shrink-0 w-7 h-7 rounded-lg bg-red-950/30 border border-red-900/30 flex items-center justify-center mt-0.5'>
          <AlertTriangle className='h-3.5 w-3.5 text-red-400' />
        </div>
        <div className='flex-1 pt-1'>
          <div className='bg-red-950/20 border border-red-900/20 rounded-xl px-4 py-3'>
            <p className='text-sm text-red-400 leading-relaxed'>
              {message.payload.text}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (message.type === 'ai') {
    return (
      <div className='flex gap-4 py-5 px-6'>
        <div className='shrink-0 w-7 h-7 rounded-lg bg-[--primary] flex items-center justify-center mt-0.5'>
          <span className='text-[10px] font-mono font-bold text-[--primary-foreground]'>
            AI
          </span>
        </div>
        <div className='flex-1 pt-0.5 min-w-0'>
          <AiTextContent text={message.payload.text} />
        </div>
      </div>
    );
  }

  return null;
}
