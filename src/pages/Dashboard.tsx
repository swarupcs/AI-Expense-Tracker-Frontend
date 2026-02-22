import { useExpenseStats, useExpenses } from '@/services/expenses.service';
import { useAuthStore } from '@/store/auth.store';
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

const now = new Date();
const CURRENT_MONTH_FROM = new Date(now.getFullYear(), now.getMonth(), 1)
  .toISOString()
  .split('T')[0];
const CURRENT_MONTH_TO = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  .toISOString()
  .split('T')[0];

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
  delay,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  sub: React.ReactNode;
  accent: string;
  isLoading?: boolean;
  delay?: string;
}) {
  return (
    <div
      className='fade-in-up'
      style={{
        animationDelay: delay,
        opacity: 0,
        padding: '24px',
        background: 'rgba(13,13,26,0.7)',
        border: '1px solid rgba(124,92,252,0.12)',
        borderRadius: '16px',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor =
          'rgba(124,92,252,0.3)';
        (e.currentTarget as HTMLElement).style.boxShadow =
          '0 4px 30px rgba(124,92,252,0.08)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor =
          'rgba(124,92,252,0.12)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {/* Gradient background blob */}
      <div
        style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accent}20, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: `${accent}15`,
            border: `1px solid ${accent}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon style={{ width: '18px', height: '18px', color: accent }} />
        </div>
        <span
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '10px',
            color: '#4a4870',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          {label}
        </span>
      </div>

      {isLoading ? (
        <div
          style={{
            height: '36px',
            borderRadius: '8px',
            background: 'rgba(124,92,252,0.08)',
            marginBottom: '8px',
          }}
          className='shimmer'
        />
      ) : (
        <div
          style={{
            fontFamily: '"Syne", sans-serif',
            fontSize: '30px',
            fontWeight: 800,
            color: '#f0efff',
            letterSpacing: '-1px',
            lineHeight: 1,
            marginBottom: '8px',
          }}
        >
          {value}
        </div>
      )}

      <div
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '11px',
          color: '#4a4870',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        {sub}
      </div>
    </div>
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

  const barData = expenses
    .slice(0, 14)
    .map((e) => ({ date: e.date.slice(5), amount: e.amount }));
  const pieData = (stats?.byCategory ?? []).map((c, i) => ({
    name: c.category,
    value: Math.round(c.amount),
    color: PIE_COLORS[i % PIE_COLORS.length],
  }));

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
          background: 'rgba(8,8,16,0.9)',
          padding: '28px 36px',
          flexShrink: 0,
          backdropFilter: 'blur(20px)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '4px',
              }}
            >
              <Sparkles
                style={{ width: '16px', height: '16px', color: '#7c5cfc' }}
              />
              <span
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '10px',
                  color: '#4a4870',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                }}
              >
                {new Date().toLocaleDateString('en-IN', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <h1
              style={{
                fontFamily: '"Syne", sans-serif',
                fontSize: '28px',
                fontWeight: 800,
                color: '#f0efff',
                letterSpacing: '-0.5px',
                margin: 0,
              }}
            >
              {user ? `Hey, ${user.name.split(' ')[0]} 👋` : 'Dashboard'}
            </h1>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              background: 'rgba(0,255,135,0.07)',
              border: '1px solid rgba(0,255,135,0.2)',
              borderRadius: '20px',
            }}
          >
            <div
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#00ff87',
                boxShadow: '0 0 6px #00ff87',
              }}
              className='pulse-dot'
            />
            <span
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '11px',
                color: '#00ff87',
              }}
            >
              Live
            </span>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '28px 36px',
        }}
      >
        {/* Stat cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          <StatCard
            label='Total Spent'
            value={`₹${(stats?.total ?? 0).toLocaleString('en-IN')}`}
            icon={DollarSign}
            sub={
              <>
                <TrendingDown
                  style={{ width: '12px', height: '12px', color: '#00ff87' }}
                />{' '}
                This month
              </>
            }
            accent='#7c5cfc'
            isLoading={isLoading}
            delay='0s'
          />
          <StatCard
            label='Avg Transaction'
            value={`₹${Math.round(stats?.average ?? 0).toLocaleString('en-IN')}`}
            icon={BarChart2}
            sub={`${stats?.count ?? 0} transactions`}
            accent='#00d4ff'
            isLoading={isLoading}
            delay='0.1s'
          />
          <StatCard
            label='Top Category'
            value={stats?.byCategory[0]?.category ?? 'None'}
            icon={Activity}
            sub={`₹${(stats?.byCategory[0]?.amount ?? 0).toLocaleString('en-IN')} spent`}
            accent='#ff2d78'
            isLoading={isLoading}
            delay='0.2s'
          />
        </div>

        {/* Charts row */}
        {!isLoading && expenses.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 340px',
              gap: '16px',
              marginBottom: '28px',
            }}
          >
            {/* Bar chart */}
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
                    fontWeight: 600,
                    color: '#f0efff',
                  }}
                >
                  Recent Expenses
                </span>
              </div>
              <ResponsiveContainer width='100%' height={200}>
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
                  <Tooltip
                    contentStyle={{
                      background: '#0d0d1a',
                      border: '1px solid rgba(124,92,252,0.2)',
                      borderRadius: '10px',
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '12px',
                      color: '#f0efff',
                    }}
                    cursor={{ fill: 'rgba(124,92,252,0.05)' }}
                  />
                  <Bar
                    dataKey='amount'
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
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
            </div>

            {/* Pie chart */}
            {pieData.length > 0 && (
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
                    marginBottom: '8px',
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
                      fontWeight: 600,
                      color: '#f0efff',
                    }}
                  >
                    By Category
                  </span>
                </div>
                <ResponsiveContainer width='100%' height={180}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx='50%'
                      cy='50%'
                      innerRadius={50}
                      outerRadius={80}
                      dataKey='value'
                      paddingAngle={2}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#0d0d1a',
                        border: '1px solid rgba(124,92,252,0.2)',
                        borderRadius: '10px',
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: '12px',
                        color: '#f0efff',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    marginTop: '8px',
                  }}
                >
                  {pieData.slice(0, 4).map((d) => (
                    <div
                      key={d.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <div
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '2px',
                            background: d.color,
                            boxShadow: `0 0 6px ${d.color}60`,
                          }}
                        />
                        <span
                          style={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: '10px',
                            color: '#8b89b0',
                          }}
                        >
                          {d.name}
                        </span>
                      </div>
                      <span
                        style={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: '10px',
                          color: d.color,
                        }}
                      >
                        ₹{d.value.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent transactions */}
        {expenses.length > 0 && (
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
                  background: 'linear-gradient(180deg, #00d4ff, #00ff87)',
                }}
              />
              <span
                style={{
                  fontFamily: '"Syne", sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#f0efff',
                }}
              >
                Recent Transactions
              </span>
            </div>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
            >
              {expenses.slice(0, 5).map((exp) => (
                <div
                  key={exp.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    transition: 'background 0.15s',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      'rgba(124,92,252,0.06)')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      'transparent')
                  }
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: `${CATEGORY_COLORS[exp.category] ?? '#4a4870'}15`,
                        border: `1px solid ${CATEGORY_COLORS[exp.category] ?? '#4a4870'}30`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                      }}
                    >
                      {exp.category === 'DINING'
                        ? '🍽️'
                        : exp.category === 'SHOPPING'
                          ? '🛍️'
                          : exp.category === 'TRANSPORT'
                            ? '🚗'
                            : exp.category === 'ENTERTAINMENT'
                              ? '🎮'
                              : exp.category === 'UTILITIES'
                                ? '⚡'
                                : exp.category === 'HEALTH'
                                  ? '💊'
                                  : exp.category === 'EDUCATION'
                                    ? '📚'
                                    : '📦'}
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: '"DM Sans", sans-serif',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#f0efff',
                        }}
                      >
                        {exp.title}
                      </div>
                      <div
                        style={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: '10px',
                          color: '#4a4870',
                          marginTop: '2px',
                        }}
                      >
                        {exp.date}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: '"Syne", sans-serif',
                      fontSize: '16px',
                      fontWeight: 700,
                      color: CATEGORY_COLORS[exp.category] ?? '#9d7fff',
                    }}
                  >
                    ₹{exp.amount.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && expenses.length === 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 0',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div>
            <div
              style={{
                fontFamily: '"Syne", sans-serif',
                fontSize: '20px',
                fontWeight: 700,
                color: '#f0efff',
                marginBottom: '8px',
              }}
            >
              No expenses yet
            </div>
            <p style={{ color: '#4a4870', fontSize: '14px' }}>
              Head to AI Chat to add your first expense!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
