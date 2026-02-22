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

function RenderedChart({ chart }: { chart: NonNullable<ChartShape> }) {
  const tooltipStyle = {
    contentStyle: {
      background: '#0d0d1a',
      border: '1px solid rgba(124,92,252,0.2)',
      borderRadius: '10px',
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '12px',
      color: '#f0efff',
    },
    cursor: { fill: 'rgba(124,92,252,0.05)' },
  };

  if (chart.kind === 'bar') {
    const max = Math.max(...chart.data.map((d) => d.amount));
    return (
      <div style={{ marginTop: '16px' }}>
        <div
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '10px',
            color: '#4a4870',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: '12px',
          }}
        >
          Spending Chart
        </div>
        <ResponsiveContainer width='100%' height={180}>
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
                fontSize: 10,
                fill: '#4a4870',
                fontFamily: '"JetBrains Mono", monospace',
              }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{
                fontSize: 10,
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
      <div style={{ marginTop: '16px' }}>
        <div
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '10px',
            color: '#4a4870',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: '12px',
          }}
        >
          Category Breakdown
        </div>
        <ResponsiveContainer width='100%' height={180}>
          <PieChart>
            <Pie
              data={chart.data}
              cx='50%'
              cy='50%'
              innerRadius={45}
              outerRadius={75}
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
      <div style={{ marginTop: '16px' }}>
        <div
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '10px',
            color: '#4a4870',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: '12px',
          }}
        >
          Monthly Trend
        </div>
        <ResponsiveContainer width='100%' height={180}>
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
              tick={{ fontSize: 10, fill: '#4a4870' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#4a4870' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip {...tooltipStyle} />
            <Line
              type='monotone'
              dataKey='amount'
              stroke='#7c5cfc'
              strokeWidth={2.5}
              dot={{ fill: '#7c5cfc', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#9d7fff' }}
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
      style={{
        borderRadius: '12px',
        border: '1px solid rgba(255,184,48,0.2)',
        background: 'rgba(255,184,48,0.04)',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 14px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <Wrench
          style={{
            width: '13px',
            height: '13px',
            color: '#ffb830',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '10px',
            color: '#ffb830',
            background: 'rgba(255,184,48,0.1)',
            border: '1px solid rgba(255,184,48,0.2)',
            padding: '1px 7px',
            borderRadius: '4px',
          }}
        >
          tool
        </span>
        <span
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '12px',
            color: '#ffb830',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </span>
        {open ? (
          <ChevronDown
            style={{ width: '12px', height: '12px', color: '#4a4870' }}
          />
        ) : (
          <ChevronRight
            style={{ width: '12px', height: '12px', color: '#4a4870' }}
          />
        )}
      </button>
      {open && args && (
        <div
          style={{
            borderTop: '1px solid rgba(255,184,48,0.1)',
            maxHeight: '180px',
            overflowY: 'auto',
          }}
        >
          <pre
            style={{
              padding: '10px 14px',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '11px',
              color: 'rgba(255,184,48,0.6)',
              margin: 0,
              lineHeight: 1.6,
            }}
          >
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div
        style={{
          borderRadius: '12px',
          border: '1px solid rgba(0,255,135,0.15)',
          background: 'rgba(0,255,135,0.04)',
          overflow: 'hidden',
        }}
      >
        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#00ff87',
              boxShadow: '0 0 5px #00ff87',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '10px',
              color: '#00ff87',
              background: 'rgba(0,255,135,0.1)',
              border: '1px solid rgba(0,255,135,0.2)',
              padding: '1px 7px',
              borderRadius: '4px',
            }}
          >
            result
          </span>
          <span
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '12px',
              color: '#00ff87',
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {name}
          </span>
          {open ? (
            <ChevronDown
              style={{ width: '12px', height: '12px', color: '#4a4870' }}
            />
          ) : (
            <ChevronRight
              style={{ width: '12px', height: '12px', color: '#4a4870' }}
            />
          )}
        </button>
        {open && (
          <div
            style={{
              borderTop: '1px solid rgba(0,255,135,0.1)',
              maxHeight: '180px',
              overflowY: 'auto',
            }}
          >
            <pre
              style={{
                padding: '10px 14px',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '11px',
                color: 'rgba(0,255,135,0.55)',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
      {chart && (
        <div
          style={{
            background: 'rgba(13,13,26,0.8)',
            border: '1px solid rgba(124,92,252,0.12)',
            borderRadius: '14px',
            padding: '16px 18px',
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
        <strong key={i} style={{ fontWeight: 600, color: '#f0efff' }}>
          {part.slice(2, -2)}
        </strong>
      );
    if (part.startsWith('`') && part.endsWith('`'))
      return (
        <code
          key={i}
          style={{
            padding: '2px 7px',
            borderRadius: '5px',
            background: 'rgba(124,92,252,0.12)',
            color: '#9d7fff',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '12px',
          }}
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
    <div
      style={{
        color: '#d4d2f0',
        fontSize: '15px',
        lineHeight: 1.75,
        fontFamily: '"DM Sans", sans-serif',
      }}
    >
      {lines.map((line, i) => {
        if (line.startsWith('### '))
          return (
            <h3
              key={i}
              style={{
                fontFamily: '"Syne", sans-serif',
                fontWeight: 700,
                fontSize: '15px',
                color: '#f0efff',
                margin: '16px 0 4px',
              }}
            >
              {line.slice(4)}
            </h3>
          );
        if (line.startsWith('## '))
          return (
            <h2
              key={i}
              style={{
                fontFamily: '"Syne", sans-serif',
                fontWeight: 800,
                fontSize: '17px',
                color: '#f0efff',
                margin: '20px 0 6px',
              }}
            >
              {line.slice(3)}
            </h2>
          );
        if (line.startsWith('- ') || line.startsWith('• '))
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
                margin: '4px 0',
              }}
            >
              <span
                style={{
                  color: '#7c5cfc',
                  marginTop: '8px',
                  fontSize: '6px',
                  flexShrink: 0,
                }}
              >
                ◆
              </span>
              <span>{renderInline(line.slice(2))}</span>
            </div>
          );
        if (line.trim() === '')
          return <div key={i} style={{ height: '6px' }} />;
        return (
          <p key={i} style={{ margin: '2px 0' }}>
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          padding: '16px 24px',
          alignItems: 'flex-end',
        }}
      >
        <div style={{ maxWidth: '72%' }}>
          <div
            style={{
              background:
                'linear-gradient(135deg, rgba(124,92,252,0.25), rgba(0,212,255,0.15))',
              border: '1px solid rgba(124,92,252,0.3)',
              borderRadius: '16px 16px 4px 16px',
              padding: '12px 18px',
              boxShadow: '0 4px 20px rgba(124,92,252,0.1)',
            }}
          >
            <p
              style={{
                color: '#f0efff',
                fontSize: '15px',
                lineHeight: 1.65,
                fontFamily: '"DM Sans", sans-serif',
                margin: 0,
              }}
            >
              {message.payload.text}
            </p>
          </div>
        </div>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'rgba(124,92,252,0.12)',
            border: '1px solid rgba(124,92,252,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <User style={{ width: '14px', height: '14px', color: '#8b89b0' }} />
        </div>
      </div>
    );
  }

  if (message.type === 'toolCall:start') {
    return (
      <div style={{ display: 'flex', gap: '12px', padding: '10px 24px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'rgba(255,184,48,0.1)',
            border: '1px solid rgba(255,184,48,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Wrench style={{ width: '13px', height: '13px', color: '#ffb830' }} />
        </div>
        <div style={{ flex: 1, paddingTop: '4px' }}>
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
      <div style={{ display: 'flex', gap: '12px', padding: '10px 24px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'rgba(0,255,135,0.08)',
            border: '1px solid rgba(0,255,135,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#00ff87',
              boxShadow: '0 0 6px #00ff87',
            }}
          />
        </div>
        <div style={{ flex: 1, paddingTop: '4px' }}>
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
      <div style={{ display: 'flex', gap: '12px', padding: '16px 24px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'rgba(255,59,92,0.1)',
            border: '1px solid rgba(255,59,92,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <AlertTriangle
            style={{ width: '13px', height: '13px', color: '#ff3b5c' }}
          />
        </div>
        <div style={{ flex: 1, paddingTop: '4px' }}>
          <div
            style={{
              background: 'rgba(255,59,92,0.07)',
              border: '1px solid rgba(255,59,92,0.2)',
              borderRadius: '14px',
              padding: '12px 16px',
            }}
          >
            <p
              style={{
                color: '#ff3b5c',
                fontSize: '14px',
                lineHeight: 1.6,
                fontFamily: '"DM Sans", sans-serif',
                margin: 0,
              }}
            >
              {message.payload.text}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (message.type === 'ai') {
    return (
      <div style={{ display: 'flex', gap: '12px', padding: '20px 24px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background:
              'linear-gradient(135deg, rgba(124,92,252,0.3), rgba(0,212,255,0.2))',
            border: '1px solid rgba(124,92,252,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Cpu style={{ width: '14px', height: '14px', color: '#9d7fff' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0, paddingTop: '4px' }}>
          <AiTextContent text={message.payload.text} />
        </div>
      </div>
    );
  }

  return null;
}
