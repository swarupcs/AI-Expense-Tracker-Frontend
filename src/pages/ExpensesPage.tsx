import { useState } from 'react';
import {
  Plus,
  Trash2,
  Download,
  Edit2,
  Save,
  X,
  Search,
  Loader2,
} from 'lucide-react';
import {
  useExpenses,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
} from '@/services/expenses.service';
import type {
  Category,
  Expense,
  ExpenseFilters,
  CreateExpenseInput,
} from '@/api/expenses.api';

const CATEGORIES: Category[] = [
  'DINING',
  'SHOPPING',
  'TRANSPORT',
  'ENTERTAINMENT',
  'UTILITIES',
  'HEALTH',
  'EDUCATION',
  'OTHER',
];
const CATEGORY_LABEL: Record<Category, string> = {
  DINING: 'Dining',
  SHOPPING: 'Shopping',
  TRANSPORT: 'Transport',
  ENTERTAINMENT: 'Entertainment',
  UTILITIES: 'Utilities',
  HEALTH: 'Health',
  EDUCATION: 'Education',
  OTHER: 'Other',
};
const CATEGORY_COLORS: Record<Category, string> = {
  DINING: '#ff2d78',
  SHOPPING: '#9d7fff',
  TRANSPORT: '#00d4ff',
  ENTERTAINMENT: '#ffb830',
  UTILITIES: '#00ff87',
  HEALTH: '#ff6b9d',
  EDUCATION: '#5b8fff',
  OTHER: '#4a4870',
};
const EMPTY_FORM = {
  title: '',
  category: 'OTHER' as Category,
  amount: '',
  date: new Date().toISOString().split('T')[0],
  notes: '',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  background: 'rgba(13,13,26,0.8)',
  border: '1px solid rgba(124,92,252,0.15)',
  borderRadius: '10px',
  color: '#f0efff',
  fontFamily: '"DM Sans", sans-serif',
  fontSize: '14px',
  outline: 'none',
  transition: 'all 0.2s',
};

export default function ExpensesPage() {
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Expense | null>(null);

  const { data, isLoading } = useExpenses(filters);
  const { mutateAsync: createExpense, isPending: isCreating } =
    useCreateExpense();
  const { mutateAsync: updateExpense, isPending: isUpdating } =
    useUpdateExpense();
  const { mutateAsync: deleteExpense } = useDeleteExpense();

  const expenses = data?.expenses ?? [];
  const isSaving = isCreating || isUpdating;
  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);

  const handleCategorySelect = (cat: Category | null) => {
    setSelectedCategory(cat);
    setFilters((p) => ({ ...p, category: cat ?? undefined }));
  };
  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setFilters((p) => ({ ...p, search: q || undefined }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) {
      setFormError('Title and amount are required.');
      return;
    }
    setFormError('');
    const payload: CreateExpenseInput = {
      title: formData.title,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
      notes: formData.notes || undefined,
    };
    try {
      if (editingId) {
        await updateExpense({ id: editingId, data: payload });
      } else {
        await createExpense(payload);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData(EMPTY_FORM);
    } catch (err: unknown) {
      setFormError((err as { message?: string }).message ?? 'Something went wrong');
    }
  };
  const handleEdit = (exp: Expense) => {
    setFormData({
      title: exp.title,
      category: exp.category,
      amount: exp.amount.toString(),
      date: exp.date,
      notes: exp.notes ?? '',
    });
    setEditingId(exp.id);
    setShowForm(true);
  };
  const handleExport = () => {
    const rows = expenses.map((e) =>
      [e.title, e.category, e.amount, e.date].join(','),
    );
    const csv = ['Title,Category,Amount,Date', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'expenses.csv';
    a.click();
  };

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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
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
              Expenses
            </h1>
            <p
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '11px',
                color: '#4a4870',
                margin: 0,
              }}
            >
              {isLoading
                ? 'Loading…'
                : `${expenses.length} transactions · ₹${totalAmount.toLocaleString('en-IN')}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleExport}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '10px 16px',
                background: 'rgba(124,92,252,0.07)',
                border: '1px solid rgba(124,92,252,0.18)',
                borderRadius: '10px',
                color: '#8b89b0',
                cursor: 'pointer',
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '13px',
                fontWeight: 500,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = '#f0efff';
                (e.currentTarget as HTMLElement).style.borderColor =
                  'rgba(124,92,252,0.35)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = '#8b89b0';
                (e.currentTarget as HTMLElement).style.borderColor =
                  'rgba(124,92,252,0.18)';
              }}
            >
              <Download style={{ width: '14px', height: '14px' }} /> Export
            </button>
            <button
              onClick={() => {
                setEditingId(null);
                setFormData(EMPTY_FORM);
                setShowForm((v) => !v);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '10px 18px',
                background: 'linear-gradient(135deg, #7c5cfc, #00d4ff)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                cursor: 'pointer',
                fontFamily: '"Syne", sans-serif',
                fontSize: '13px',
                fontWeight: 700,
                boxShadow: '0 0 20px rgba(124,92,252,0.3)',
                transition: 'all 0.2s',
                letterSpacing: '0.02em',
              }}
            >
              <Plus style={{ width: '15px', height: '15px' }} /> Add Expense
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '24px 32px',
        }}
      >
        {/* Form */}
        {showForm && (
          <div
            style={{
              background: 'rgba(13,13,26,0.85)',
              border: '1px solid rgba(124,92,252,0.2)',
              borderRadius: '16px',
              padding: '28px',
              marginBottom: '24px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 40px rgba(124,92,252,0.05)',
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
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#f0efff',
                }}
              >
                {editingId ? 'Edit Expense' : 'New Expense'}
              </span>
            </div>

            {formError && (
              <div
                style={{
                  padding: '12px 16px',
                  background: 'rgba(255,59,92,0.08)',
                  border: '1px solid rgba(255,59,92,0.2)',
                  borderRadius: '10px',
                  color: '#ff3b5c',
                  fontSize: '13px',
                  marginBottom: '18px',
                  fontFamily: '"DM Sans", sans-serif',
                }}
              >
                {formError}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
              }}
            >
              {/* Title */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '10px',
                    color: '#8b89b0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    marginBottom: '8px',
                  }}
                >
                  Title
                </label>
                <input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder='e.g., Coffee'
                  style={inputStyle}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(124,92,252,0.5)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(124,92,252,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(124,92,252,0.15)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              {/* Amount */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '10px',
                    color: '#8b89b0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    marginBottom: '8px',
                  }}
                >
                  Amount (₹)
                </label>
                <input
                  type='number'
                  step='0.01'
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, amount: e.target.value }))
                  }
                  placeholder='0.00'
                  style={inputStyle}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(124,92,252,0.5)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(124,92,252,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(124,92,252,0.15)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              {/* Category */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '10px',
                    color: '#8b89b0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    marginBottom: '8px',
                  }}
                >
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      category: e.target.value as Category,
                    }))
                  }
                  style={{
                    ...inputStyle,
                    cursor: 'pointer',
                    appearance: 'none' as React.CSSProperties['appearance'],
                  }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} style={{ background: '#0d0d1a' }}>
                      {CATEGORY_LABEL[c]}
                    </option>
                  ))}
                </select>
              </div>
              {/* Date */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '10px',
                    color: '#8b89b0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    marginBottom: '8px',
                  }}
                >
                  Date
                </label>
                <input
                  type='date'
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, date: e.target.value }))
                  }
                  style={{ ...inputStyle, colorScheme: 'dark' }}
                />
              </div>
              {/* Notes */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label
                  style={{
                    display: 'block',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '10px',
                    color: '#8b89b0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    marginBottom: '8px',
                  }}
                >
                  Notes (optional)
                </label>
                <input
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, notes: e.target.value }))
                  }
                  placeholder='Any extra context…'
                  style={inputStyle}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(124,92,252,0.5)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(124,92,252,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(124,92,252,0.15)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              {/* Buttons */}
              <div
                style={{
                  gridColumn: '1 / -1',
                  display: 'flex',
                  gap: '10px',
                  paddingTop: '4px',
                }}
              >
                <button
                  type='submit'
                  disabled={isSaving}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '11px 20px',
                    background: 'linear-gradient(135deg, #7c5cfc, #00d4ff)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    fontFamily: '"Syne", sans-serif',
                    fontSize: '13px',
                    fontWeight: 700,
                    opacity: isSaving ? 0.6 : 1,
                    boxShadow: '0 0 20px rgba(124,92,252,0.25)',
                    transition: 'all 0.2s',
                  }}
                >
                  {isSaving ? (
                    <Loader2
                      style={{
                        width: '14px',
                        height: '14px',
                        animation: 'spin 1s linear infinite',
                      }}
                    />
                  ) : (
                    <Save style={{ width: '14px', height: '14px' }} />
                  )}
                  {editingId ? 'Update' : 'Add'} Expense
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '11px 18px',
                    background: 'transparent',
                    border: '1px solid rgba(124,92,252,0.18)',
                    borderRadius: '10px',
                    color: '#8b89b0',
                    cursor: 'pointer',
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: '13px',
                    transition: 'all 0.2s',
                  }}
                >
                  <X style={{ width: '14px', height: '14px' }} /> Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              marginBottom: '12px',
            }}
          >
            {[null, ...CATEGORIES].map((cat) => {
              const isActive = selectedCategory === cat;
              const color = cat ? CATEGORY_COLORS[cat] : '#7c5cfc';
              return (
                <button
                  key={cat ?? 'all'}
                  onClick={() => handleCategorySelect(cat)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: `1px solid ${isActive ? color + '60' : 'rgba(124,92,252,0.12)'}`,
                    background: isActive ? `${color}15` : 'transparent',
                    color: isActive ? color : '#8b89b0',
                    cursor: 'pointer',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '11px',
                    transition: 'all 0.2s',
                    boxShadow: isActive ? `0 0 12px ${color}20` : 'none',
                  }}
                >
                  {cat ? CATEGORY_LABEL[cat] : 'All'}
                </button>
              );
            })}
          </div>
          <div style={{ position: 'relative' }}>
            <Search
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '15px',
                height: '15px',
                color: '#4a4870',
              }}
            />
            <input
              placeholder='Search expenses…'
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: '42px' }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(124,92,252,0.4)';
                e.target.style.background = 'rgba(124,92,252,0.05)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(124,92,252,0.15)';
                e.target.style.background = 'rgba(13,13,26,0.8)';
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div
          style={{
            background: 'rgba(13,13,26,0.7)',
            border: '1px solid rgba(124,92,252,0.12)',
            borderRadius: '16px',
            overflow: 'hidden',
            backdropFilter: 'blur(20px)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(124,92,252,0.1)' }}>
                {['Title', 'Category', 'Amount', 'Date', 'Actions'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '14px 20px',
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '10px',
                      color: '#4a4870',
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      fontWeight: 500,
                      textAlign: 'left',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: 'center',
                      padding: '48px',
                      color: '#4a4870',
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: '14px',
                    }}
                  >
                    Loading…
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{ textAlign: 'center', padding: '48px' }}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>
                      📭
                    </div>
                    <div
                      style={{
                        color: '#4a4870',
                        fontFamily: '"DM Sans", sans-serif',
                        fontSize: '14px',
                      }}
                    >
                      No expenses found
                    </div>
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => {
                  const color = CATEGORY_COLORS[exp.category] ?? '#4a4870';
                  return (
                    <tr
                      key={exp.id}
                      style={{
                        borderBottom: '1px solid rgba(124,92,252,0.06)',
                        transition: 'background 0.15s',
                        cursor: 'default',
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          'rgba(124,92,252,0.04)')
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          'transparent')
                      }
                    >
                      <td
                        style={{
                          padding: '14px 20px',
                          fontFamily: '"DM Sans", sans-serif',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#f0efff',
                        }}
                      >
                        {exp.title}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '3px 10px',
                            borderRadius: '20px',
                            border: `1px solid ${color}30`,
                            background: `${color}0f`,
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: '10px',
                            color,
                          }}
                        >
                          <span
                            style={{
                              width: '5px',
                              height: '5px',
                              borderRadius: '50%',
                              background: color,
                              boxShadow: `0 0 5px ${color}`,
                            }}
                          />
                          {CATEGORY_LABEL[exp.category]}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '14px 20px',
                          fontFamily: '"Syne", sans-serif',
                          fontSize: '15px',
                          fontWeight: 700,
                          color,
                        }}
                      >
                        ₹{exp.amount.toLocaleString('en-IN')}
                      </td>
                      <td
                        style={{
                          padding: '14px 20px',
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: '11px',
                          color: '#4a4870',
                        }}
                      >
                        {new Date(exp.date).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleEdit(exp)}
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '8px',
                              background: 'rgba(91,143,255,0.08)',
                              border: '1px solid rgba(91,143,255,0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: '#5b8fff',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              (
                                e.currentTarget as HTMLElement
                              ).style.background = 'rgba(91,143,255,0.15)';
                            }}
                            onMouseLeave={(e) => {
                              (
                                e.currentTarget as HTMLElement
                              ).style.background = 'rgba(91,143,255,0.08)';
                            }}
                          >
                            <Edit2 style={{ width: '12px', height: '12px' }} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(exp)}
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '8px',
                              background: 'rgba(255,59,92,0.08)',
                              border: '1px solid rgba(255,59,92,0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: '#ff3b5c',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              (
                                e.currentTarget as HTMLElement
                              ).style.background = 'rgba(255,59,92,0.15)';
                            }}
                            onMouseLeave={(e) => {
                              (
                                e.currentTarget as HTMLElement
                              ).style.background = 'rgba(255,59,92,0.08)';
                            }}
                          >
                            <Trash2 style={{ width: '12px', height: '12px' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: '#0d0d1a',
              border: '1px solid rgba(255,59,92,0.3)',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '380px',
              width: '90%',
              boxShadow: '0 0 60px rgba(255,59,92,0.1)',
            }}
          >
            <div
              style={{
                fontFamily: '"Syne", sans-serif',
                fontSize: '20px',
                fontWeight: 700,
                color: '#f0efff',
                marginBottom: '10px',
              }}
            >
              Delete expense?
            </div>
            <p
              style={{
                color: '#8b89b0',
                fontSize: '14px',
                marginBottom: '6px',
                lineHeight: 1.6,
              }}
            >
              <span style={{ color: '#f0efff', fontWeight: 500 }}>
                {deleteConfirm.title}
              </span>{' '}
              (₹{deleteConfirm.amount.toLocaleString('en-IN')}) will be
              permanently deleted.
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  color: '#8b89b0',
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteExpense(deleteConfirm.id);
                  setDeleteConfirm(null);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(255,59,92,0.15)',
                  border: '1px solid rgba(255,59,92,0.3)',
                  borderRadius: '10px',
                  color: '#ff3b5c',
                  fontFamily: '"Syne", sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
    </div>
  );
}
