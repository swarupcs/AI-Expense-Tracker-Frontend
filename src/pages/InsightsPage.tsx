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
      fontSize: '12px',
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
      label: 'Avg Transaction',
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
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        background: '#080810',
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: '1px solid rgba(124,92,252,0.1)',
          background: 'rgba(8,8,16,0.95)',
          padding: '24px 32px',
          flexShrink: 0,
          backdropFilter: 'blur(20px)',
        }}
      >
        <h1
          style={{
            fontFamily: '"Syne", sans-serif',
            fontSize: '26px',
            fontWeight: 800,
            color: '#f0efff',
            letterSpacing: '-0.5px',
            margin: 0,
            marginBottom: '4px',
          }}
        >
          Insights
        </h1>
        <p
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '11px',
            color: '#4a4870',
            margin: 0,
          }}
        >
          AI-powered spending analysis · Last 6 months
        </p>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '28px 32px',
        }}
      >
        {/* Summary cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '14px',
            marginBottom: '24px',
          }}
        >
          {summaryCards.map((card) => (
            <div
              key={card.label}
              style={{
                background: 'rgba(13,13,26,0.7)',
                border: `1px solid ${card.color}20`,
                borderRadius: '14px',
                padding: '20px',
                backdropFilter: 'blur(20px)',
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  `${card.color}40`;
                (e.currentTarget as HTMLElement).style.boxShadow =
                  `0 0 25px ${card.glow}`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  `${card.color}20`;
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${card.glow}, transparent 70%)`,
                  pointerEvents: 'none',
                }}
              />
              <p
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '10px',
                  color: '#4a4870',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  margin: '0 0 10px',
                }}
              >
                {card.label}
              </p>
              {isLoading ? (
                <div
                  style={{
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(124,92,252,0.08)',
                    marginBottom: '8px',
                  }}
                  className='shimmer'
                />
              ) : (
                <p
                  style={{
                    fontFamily: '"Syne", sans-serif',
                    fontSize: '24px',
                    fontWeight: 800,
                    color: card.color,
                    letterSpacing: '-0.5px',
                    margin: '0 0 6px',
                    textShadow: `0 0 20px ${card.glow}`,
                  }}
                >
                  {card.value}
                </p>
              )}
              <p
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '10px',
                  color: '#4a4870',
                  margin: 0,
                }}
              >
                {card.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          {/* Line chart */}
          <div
            style={{
              background: 'rgba(13,13,26,0.7)',
              border: '1px solid rgba(124,92,252,0.12)',
              borderRadius: '16px',
              padding: '24px',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  width: '3px',
                  height: '18px',
                  borderRadius: '2px',
                  background: 'linear-gradient(180deg, #7c5cfc, #00d4ff)',
                }}
              />
              <span
                style={{
                  fontFamily: '"Syne", sans-serif',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#f0efff',
                }}
              >
                Monthly Trend
              </span>
            </div>
            {isLoading ? (
              <div
                style={{
                  height: '220px',
                  borderRadius: '10px',
                  background: 'rgba(124,92,252,0.05)',
                }}
                className='shimmer'
              />
            ) : (
              <ResponsiveContainer width='100%' height={220}>
                <LineChart
                  data={trendData}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id='lineGrad' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='0%' stopColor='#7c5cfc' stopOpacity={0.3} />
                      <stop offset='100%' stopColor='#7c5cfc' stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke='rgba(124,92,252,0.08)'
                  />
                  <XAxis
                    dataKey='month'
                    tick={{
                      fontSize: 11,
                      fill: '#4a4870',
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{
                      fontSize: 11,
                      fill: '#4a4870',
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip {...tooltipStyle} />
                  <Line
                    type='monotone'
                    dataKey='amount'
                    stroke='#7c5cfc'
                    strokeWidth={2.5}
                    dot={{
                      fill: '#7c5cfc',
                      r: 4,
                      strokeWidth: 2,
                      stroke: '#080810',
                    }}
                    activeDot={{ r: 6, fill: '#9d7fff', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie chart */}
          <div
            style={{
              background: 'rgba(13,13,26,0.7)',
              border: '1px solid rgba(124,92,252,0.12)',
              borderRadius: '16px',
              padding: '24px',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  width: '3px',
                  height: '18px',
                  borderRadius: '2px',
                  background: 'linear-gradient(180deg, #ff2d78, #ffb830)',
                }}
              />
              <span
                style={{
                  fontFamily: '"Syne", sans-serif',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#f0efff',
                }}
              >
                By Category
              </span>
            </div>
            {isLoading ? (
              <div
                style={{
                  height: '220px',
                  borderRadius: '10px',
                  background: 'rgba(124,92,252,0.05)',
                }}
                className='shimmer'
              />
            ) : pieData.length > 0 ? (
              <ResponsiveContainer width='100%' height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx='50%'
                    cy='50%'
                    innerRadius={60}
                    outerRadius={90}
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
            ) : (
              <div
                style={{
                  height: '220px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4a4870',
                  fontSize: '14px',
                  fontFamily: '"DM Sans", sans-serif',
                }}
              >
                No data yet
              </div>
            )}
          </div>
        </div>

        {/* Category breakdown */}
        {stats && stats.byCategory.length > 0 && (
          <div
            style={{
              background: 'rgba(13,13,26,0.7)',
              border: '1px solid rgba(124,92,252,0.12)',
              borderRadius: '16px',
              padding: '24px',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  width: '3px',
                  height: '18px',
                  borderRadius: '2px',
                  background: 'linear-gradient(180deg, #00ff87, #00d4ff)',
                }}
              />
              <span
                style={{
                  fontFamily: '"Syne", sans-serif',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#f0efff',
                }}
              >
                Category Breakdown
              </span>
            </div>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {stats.byCategory.map((cat, i) => {
                const pct =
                  stats.total > 0 ? (cat.amount / stats.total) * 100 : 0;
                const color = COLORS[i % COLORS.length];
                return (
                  <div key={cat.category}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        <div
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '2px',
                            background: color,
                            boxShadow: `0 0 8px ${color}70`,
                          }}
                        />
                        <span
                          style={{
                            fontFamily: '"DM Sans", sans-serif',
                            fontSize: '14px',
                            color: '#d4d2f0',
                          }}
                        >
                          {cat.category}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: '11px',
                            color: '#4a4870',
                          }}
                        >
                          {Math.round(pct)}%
                        </span>
                        <span
                          style={{
                            fontFamily: '"Syne", sans-serif',
                            fontSize: '14px',
                            fontWeight: 700,
                            color,
                          }}
                        >
                          ₹{Math.round(cat.amount).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        height: '4px',
                        borderRadius: '2px',
                        background: 'rgba(124,92,252,0.08)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          borderRadius: '2px',
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${color}, ${color}90)`,
                          boxShadow: `0 0 8px ${color}50`,
                          transition: 'width 0.8s ease-out',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
