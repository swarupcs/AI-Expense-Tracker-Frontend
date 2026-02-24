import { useState } from 'react';
import {
  User,
  Cpu,
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
import type { StreamMessage } from '@/types/StreamMessage.types';

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
const PALETTE = [
  '#7c5cfc',
  '#00d4ff',
  '#00ff87',
  '#ffb830',
  '#ff2d78',
  '#9d7fff',
  '#5b8fff',
  '#4a4870',
];

type ChartShape =
  | { kind: 'bar'; data: { label: string; amount: number; color?: string }[] }
  | { kind: 'pie'; data: { name: string; value: number; color: string }[] }
  | { kind: 'line'; data: { month: string; amount: number }[] }
  | null;

function detectChart(result: Record<string, unknown>): ChartShape {
  if (Array.isArray(result.byCategory) && result.byCategory.length > 0) {
    const cats = result.byCategory as Array<{
      category: string;
      amount: number;
    }>;
    return {
      kind: 'bar',
      data: cats.map((c) => ({
        label: c.category,
        amount: Math.round(c.amount),
        color: CATEGORY_COLORS[c.category] ?? '#7c5cfc',
      })),
    };
  }
  if (Array.isArray(result.expenses) && result.expenses.length > 0) {
    const exps = result.expenses as Array<{ date: string; amount: number }>;
    const monthSet = new Set(exps.map((e) => e.date.slice(0, 7)));
    if (monthSet.size > 1) {
      const monthMap: Record<string, number> = {};
      for (const e of exps) {
        const k = e.date.slice(0, 7);
        monthMap[k] = (monthMap[k] ?? 0) + e.amount;
      }
      return {
        kind: 'line',
        data: Object.entries(monthMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([m, a]) => ({
            month: new Date(m + '-01').toLocaleString('en', { month: 'short' }),
            amount: Math.round(a),
          })),
      };
    }
    const dateMap: Record<string, number> = {};
    for (const e of exps) {
      const k = e.date.slice(5);
      dateMap[k] = (dateMap[k] ?? 0) + e.amount;
    }
    return {
      kind: 'bar',
      data: Object.entries(dateMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([l, a]) => ({ label: l, amount: a, color: '#7c5cfc' })),
    };
  }
  if (Array.isArray(result.data) && result.data.length > 0) {
    const rows = result.data as Array<Record<string, unknown>>;
    const lk = ['label', 'category', 'month', 'date', 'name'].find(
      (k) => k in rows[0],
    );
    const vk = ['amount', 'total', 'value', 'count'].find((k) => k in rows[0]);
    if (lk && vk)
      return {
        kind: 'bar',
        data: rows.map((r, i) => ({
          label: String(r[lk]),
          amount: Math.round(Number(r[vk])),
          color: CATEGORY_COLORS[String(r[lk])] ?? PALETTE[i % PALETTE.length],
        })),
      };
  }
  return null;
}

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

function RenderedChart({ chart }: { chart: NonNullable<ChartShape> }) {
  if (chart.kind === 'bar') {
    const max = Math.max(...chart.data.map((d) => d.amount));
    return (
      <div className='mt-3 sm:mt-4'>
        <p className='font-mono text-[9px] sm:text-[10px] text-[#4a4870] uppercase tracking-widest mb-2 sm:mb-3'>
          Spending Chart
        </p>
        <ResponsiveContainer width='100%' height={160}>
          <BarChart
            data={chart.data}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            barCategoryGap='28%'
          >
            <CartesianGrid
              strokeDasharray='3 3'
              stroke='rgba(124,92,252,0.08)'
              vertical={false}
            />
            <XAxis
              dataKey='label'
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
            <Bar dataKey='amount' radius={[6, 6, 0, 0]} maxBarSize={40}>
              {chart.data.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.color ?? '#7c5cfc'}
                  opacity={d.amount === max ? 1 : 0.5 + (d.amount / max) * 0.4}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
  if (chart.kind === 'pie') {
    return (
      <div className='mt-3 sm:mt-4'>
        <p className='font-mono text-[9px] sm:text-[10px] text-[#4a4870] uppercase tracking-widest mb-2 sm:mb-3'>
          Category Breakdown
        </p>
        <ResponsiveContainer width='100%' height={160}>
          <PieChart>
            <Pie
              data={chart.data}
              cx='50%'
              cy='50%'
              innerRadius={40}
              outerRadius={65}
              dataKey='value'
              paddingAngle={2}
            >
              {chart.data.map((e, i) => (
                <Cell key={i} fill={e.color} />
              ))}
            </Pie>
            <Tooltip {...tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }
  if (chart.kind === 'line') {
    return (
      <div className='mt-3 sm:mt-4'>
        <p className='font-mono text-[9px] sm:text-[10px] text-[#4a4870] uppercase tracking-widest mb-2 sm:mb-3'>
          Monthly Trend
        </p>
        <ResponsiveContainer width='100%' height={160}>
          <LineChart
            data={chart.data}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray='3 3'
              stroke='rgba(124,92,252,0.08)'
            />
            <XAxis
              dataKey='month'
              tick={{ fontSize: 9, fill: '#4a4870' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fill: '#4a4870' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip {...tooltipStyle} />
            <Line
              type='monotone'
              dataKey='amount'
              stroke='#7c5cfc'
              strokeWidth={2.5}
              dot={{ fill: '#7c5cfc', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#9d7fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
  return null;
}

function ToolCallBlock({
  name,
  args,
}: {
  name: string;
  args?: Record<string, unknown>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className='rounded-xl overflow-hidden'
      style={{
        border: '1px solid rgba(255,184,48,0.2)',
        background: 'rgba(255,184,48,0.04)',
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className='w-full flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-2.5 bg-transparent border-none cursor-pointer text-left'
      >
        <Wrench className='w-3 h-3 text-[#ffb830] shrink-0' />
        <span className='font-mono text-[9px] sm:text-[10px] text-[#ffb830] bg-[rgba(255,184,48,0.1)] border border-[rgba(255,184,48,0.2)] px-1.5 py-0.5 rounded'>
          tool
        </span>
        <span className='font-mono text-[11px] sm:text-[12px] text-[#ffb830] flex-1 overflow-hidden text-ellipsis whitespace-nowrap'>
          {name}
        </span>
        {open ? (
          <ChevronDown className='w-3 h-3 text-[#4a4870]' />
        ) : (
          <ChevronRight className='w-3 h-3 text-[#4a4870]' />
        )}
      </button>
      {open && args && (
        <div className='border-t border-[rgba(255,184,48,0.1)] max-h-[160px] overflow-y-auto'>
          <pre className='p-3 font-mono text-[10px] sm:text-[11px] text-[rgba(255,184,48,0.6)] m-0 leading-relaxed overflow-x-auto'>
            {JSON.stringify(args, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

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
    <div className='flex flex-col gap-2 sm:gap-2.5'>
      <div
        className='rounded-xl overflow-hidden'
        style={{
          border: '1px solid rgba(0,255,135,0.15)',
          background: 'rgba(0,255,135,0.04)',
        }}
      >
        <button
          onClick={() => setOpen((v) => !v)}
          className='w-full flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-2.5 bg-transparent border-none cursor-pointer text-left'
        >
          <div
            className='w-1.5 h-1.5 rounded-full shrink-0'
            style={{ background: '#00ff87', boxShadow: '0 0 5px #00ff87' }}
          />
          <span className='font-mono text-[9px] sm:text-[10px] text-[#00ff87] bg-[rgba(0,255,135,0.1)] border border-[rgba(0,255,135,0.2)] px-1.5 py-0.5 rounded'>
            result
          </span>
          <span className='font-mono text-[11px] sm:text-[12px] text-[#00ff87] flex-1 overflow-hidden text-ellipsis whitespace-nowrap'>
            {name}
          </span>
          {open ? (
            <ChevronDown className='w-3 h-3 text-[#4a4870]' />
          ) : (
            <ChevronRight className='w-3 h-3 text-[#4a4870]' />
          )}
        </button>
        {open && (
          <div className='border-t border-[rgba(0,255,135,0.1)] max-h-[160px] overflow-y-auto'>
            <pre className='p-3 font-mono text-[10px] sm:text-[11px] text-[rgba(0,255,135,0.55)] m-0 leading-relaxed overflow-x-auto'>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
      {chart && (
        <div
          className='rounded-2xl p-3 sm:p-4'
          style={{
            background: 'rgba(13,13,26,0.8)',
            border: '1px solid rgba(124,92,252,0.12)',
          }}
        >
          <RenderedChart chart={chart} />
        </div>
      )}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return (
        <strong key={i} className='font-semibold text-[#f0efff]'>
          {part.slice(2, -2)}
        </strong>
      );
    if (part.startsWith('`') && part.endsWith('`'))
      return (
        <code
          key={i}
          className='px-1.5 py-0.5 rounded bg-[rgba(124,92,252,0.12)] text-[#9d7fff] font-mono text-[11px]'
        >
          {part.slice(1, -1)}
        </code>
      );
    return part;
  });
}

function AiTextContent({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className='text-[#d4d2f0] text-sm sm:text-[15px] leading-[1.75] font-sans'>
      {lines.map((line, i) => {
        if (line.startsWith('### '))
          return (
            <h3
              key={i}
              className='font-display font-bold text-sm sm:text-[15px] text-[#f0efff] mt-4 mb-1'
            >
              {line.slice(4)}
            </h3>
          );
        if (line.startsWith('## '))
          return (
            <h2
              key={i}
              className='font-display font-extrabold text-base sm:text-[17px] text-[#f0efff] mt-5 mb-1.5'
            >
              {line.slice(3)}
            </h2>
          );
        if (line.startsWith('- ') || line.startsWith('• '))
          return (
            <div key={i} className='flex gap-2.5 items-start my-1'>
              <span className='text-[#7c5cfc] mt-2 text-[6px] shrink-0'>◆</span>
              <span>{renderInline(line.slice(2))}</span>
            </div>
          );
        if (line.trim() === '') return <div key={i} className='h-1.5' />;
        return (
          <p key={i} className='my-0.5'>
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
}

export function ChatMessage({ message }: { message: StreamMessage }) {
  if (message.type === 'user') {
    return (
      <div className='flex justify-end gap-2.5 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 items-end'>
        <div className='max-w-[80%] sm:max-w-[72%]'>
          <div
            className='rounded-[16px_16px_4px_16px] px-3.5 sm:px-4 py-2.5 sm:py-3'
            style={{
              background:
                'linear-gradient(135deg, rgba(124,92,252,0.25), rgba(0,212,255,0.15))',
              border: '1px solid rgba(124,92,252,0.3)',
              boxShadow: '0 4px 20px rgba(124,92,252,0.1)',
            }}
          >
            <p className='text-[#f0efff] text-sm sm:text-[15px] leading-[1.65] font-sans m-0'>
              {message.payload.text}
            </p>
          </div>
        </div>
        <div
          className='w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0'
          style={{
            background: 'rgba(124,92,252,0.12)',
            border: '1px solid rgba(124,92,252,0.2)',
          }}
        >
          <User className='w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8b89b0]' />
        </div>
      </div>
    );
  }

  if (message.type === 'toolCall:start') {
    return (
      <div className='flex gap-2.5 sm:gap-3 px-3 sm:px-6 py-2'>
        <div
          className='w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0'
          style={{
            background: 'rgba(255,184,48,0.1)',
            border: '1px solid rgba(255,184,48,0.2)',
          }}
        >
          <Wrench className='w-3 h-3 text-[#ffb830]' />
        </div>
        <div className='flex-1 pt-1'>
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
      <div className='flex gap-2.5 sm:gap-3 px-3 sm:px-6 py-2'>
        <div
          className='w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0'
          style={{
            background: 'rgba(0,255,135,0.08)',
            border: '1px solid rgba(0,255,135,0.15)',
          }}
        >
          <div
            className='w-2 h-2 rounded-full'
            style={{ background: '#00ff87', boxShadow: '0 0 6px #00ff87' }}
          />
        </div>
        <div className='flex-1 pt-1'>
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
      <div className='flex gap-2.5 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4'>
        <div
          className='w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0'
          style={{
            background: 'rgba(255,59,92,0.1)',
            border: '1px solid rgba(255,59,92,0.2)',
          }}
        >
          <AlertTriangle className='w-3 h-3 text-[#ff3b5c]' />
        </div>
        <div className='flex-1 pt-1'>
          <div
            className='rounded-2xl p-3 sm:p-4'
            style={{
              background: 'rgba(255,59,92,0.07)',
              border: '1px solid rgba(255,59,92,0.2)',
            }}
          >
            <p className='text-[#ff3b5c] text-sm leading-relaxed font-sans m-0'>
              {message.payload.text}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (message.type === 'ai') {
    return (
      <div className='flex gap-2.5 sm:gap-3 px-3 sm:px-6 py-4 sm:py-5'>
        <div
          className='w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0'
          style={{
            background:
              'linear-gradient(135deg, rgba(124,92,252,0.3), rgba(0,212,255,0.2))',
            border: '1px solid rgba(124,92,252,0.3)',
          }}
        >
          <Cpu className='w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#9d7fff]' />
        </div>
        <div className='flex-1 min-w-0 pt-1'>
          <AiTextContent text={message.payload.text} />
        </div>
      </div>
    );
  }

  return null;
}
