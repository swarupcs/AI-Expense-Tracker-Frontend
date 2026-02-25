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
  SlidersHorizontal,
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

const CATEGORY_EMOJI: Record<Category, string> = {
  DINING: '🍽️',
  SHOPPING: '🛍️',
  TRANSPORT: '🚗',
  ENTERTAINMENT: '🎮',
  UTILITIES: '⚡',
  HEALTH: '💊',
  EDUCATION: '📚',
  OTHER: '📦',
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

// ─── Expense Form ─────────────────────────────────────────────────────────────
function ExpenseForm({
  editingId,
  formData,
  setFormData,
  isSaving,
  formError,
  onSubmit,
  onCancel,
}: {
  editingId: number | null;
  formData: typeof EMPTY_FORM;
  setFormData: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
  isSaving: boolean;
  formError: string;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className='space-y-4'>
      {formError && (
        <div
          className='p-3 rounded-xl text-[#ff3b5c] text-sm'
          style={{
            background: 'rgba(255,59,92,0.08)',
            border: '1px solid rgba(255,59,92,0.2)',
          }}
        >
          {formError}
        </div>
      )}

      {/* Title */}
      <div className='space-y-1.5'>
        <Label className='font-mono text-[10px] text-[#8b89b0] uppercase tracking-widest'>
          Title
        </Label>
        <Input
          value={formData.title}
          onChange={(e) =>
            setFormData((p) => ({ ...p, title: e.target.value }))
          }
          placeholder='e.g., Coffee'
          className='bg-[rgba(13,13,26,0.8)] border-[rgba(124,92,252,0.15)] text-[#f0efff] focus-visible:ring-[#7c5cfc]/30 focus-visible:border-[rgba(124,92,252,0.5)] h-11'
        />
      </div>

      {/* Amount */}
      <div className='space-y-1.5'>
        <Label className='font-mono text-[10px] text-[#8b89b0] uppercase tracking-widest'>
          Amount (₹)
        </Label>
        <Input
          type='number'
          step='0.01'
          inputMode='decimal'
          value={formData.amount}
          onChange={(e) =>
            setFormData((p) => ({ ...p, amount: e.target.value }))
          }
          placeholder='0.00'
          className='bg-[rgba(13,13,26,0.8)] border-[rgba(124,92,252,0.15)] text-[#f0efff] focus-visible:ring-[#7c5cfc]/30 focus-visible:border-[rgba(124,92,252,0.5)] h-11'
        />
      </div>

      {/* Category + Date side by side */}
      <div className='grid grid-cols-2 gap-3'>
        <div className='space-y-1.5'>
          <Label className='font-mono text-[10px] text-[#8b89b0] uppercase tracking-widest'>
            Category
          </Label>
          <Select
            value={formData.category}
            onValueChange={(v) =>
              setFormData((p) => ({ ...p, category: v as Category }))
            }
          >
            <SelectTrigger className='bg-[rgba(13,13,26,0.8)] border-[rgba(124,92,252,0.15)] text-[#f0efff] focus:ring-[#7c5cfc]/30 h-11'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='bg-[#0d0d1a] border-[rgba(124,92,252,0.2)]'>
              {CATEGORIES.map((c) => (
                <SelectItem
                  key={c}
                  value={c}
                  className='text-[#f0efff] focus:bg-[rgba(124,92,252,0.1)]'
                >
                  {CATEGORY_LABEL[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-1.5'>
          <Label className='font-mono text-[10px] text-[#8b89b0] uppercase tracking-widest'>
            Date
          </Label>
          <Input
            type='date'
            value={formData.date}
            onChange={(e) =>
              setFormData((p) => ({ ...p, date: e.target.value }))
            }
            className='bg-[rgba(13,13,26,0.8)] border-[rgba(124,92,252,0.15)] text-[#f0efff] focus-visible:ring-[#7c5cfc]/30 [color-scheme:dark] h-11'
          />
        </div>
      </div>

      {/* Notes */}
      <div className='space-y-1.5'>
        <Label className='font-mono text-[10px] text-[#8b89b0] uppercase tracking-widest'>
          Notes <span className='normal-case text-[#4a4870]'>(optional)</span>
        </Label>
        <Input
          value={formData.notes}
          onChange={(e) =>
            setFormData((p) => ({ ...p, notes: e.target.value }))
          }
          placeholder='Any extra context…'
          className='bg-[rgba(13,13,26,0.8)] border-[rgba(124,92,252,0.15)] text-[#f0efff] focus-visible:ring-[#7c5cfc]/30 focus-visible:border-[rgba(124,92,252,0.5)] h-11'
        />
      </div>

      {/* Actions */}
      <div className='flex gap-2.5 pt-1'>
        <Button
          type='submit'
          disabled={isSaving}
          className='flex-1 h-11 gap-2 font-display font-bold text-white'
          style={{
            background: 'linear-gradient(135deg, #7c5cfc, #00d4ff)',
            boxShadow: '0 0 20px rgba(124,92,252,0.25)',
          }}
        >
          {isSaving ? (
            <Loader2 className='w-4 h-4 animate-spin' />
          ) : (
            <Save className='w-4 h-4' />
          )}
          {editingId ? 'Update' : 'Add'} Expense
        </Button>
        <Button
          type='button'
          variant='outline'
          onClick={onCancel}
          className='h-11 gap-2 border-[rgba(124,92,252,0.18)] text-[#8b89b0] hover:text-[#f0efff]'
        >
          <X className='w-4 h-4' />
        </Button>
      </div>
    </form>
  );
}

// ─── Mobile Expense Card ──────────────────────────────────────────────────────
function MobileExpenseCard({
  exp,
  onEdit,
  onDelete,
}: {
  exp: Expense;
  onEdit: (exp: Expense) => void;
  onDelete: (exp: Expense) => void;
}) {
  const color = CATEGORY_COLORS[exp.category] ?? '#4a4870';
  return (
    <Card
      className='border-[rgba(124,92,252,0.08)] active:border-[rgba(124,92,252,0.2)] transition-all'
      style={{ background: 'rgba(13,13,26,0.7)' }}
    >
      <CardContent className='p-3.5'>
        <div className='flex items-center gap-3'>
          {/* Emoji icon */}
          <div
            className='w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0'
            style={{
              background: `${color}15`,
              border: `1px solid ${color}25`,
            }}
          >
            {CATEGORY_EMOJI[exp.category] ?? '📦'}
          </div>

          {/* Details */}
          <div className='flex-1 min-w-0'>
            <p className='font-sans text-sm font-semibold text-[#f0efff] truncate'>
              {exp.title}
            </p>
            <div className='flex items-center gap-1.5 mt-0.5 flex-wrap'>
              <span
                className='font-mono text-[9px] px-1.5 py-0.5 rounded-md'
                style={{ background: `${color}15`, color }}
              >
                {CATEGORY_LABEL[exp.category]}
              </span>
              <span className='font-mono text-[9px] text-[#4a4870]'>
                {exp.date}
              </span>
              {exp.notes && (
                <span className='font-mono text-[9px] text-[#4a4870] truncate max-w-[100px]'>
                  · {exp.notes}
                </span>
              )}
            </div>
          </div>

          {/* Amount + actions */}
          <div className='flex flex-col items-end gap-2 shrink-0'>
            <span
              className='font-display text-base font-bold'
              style={{ color }}
            >
              ₹{exp.amount.toLocaleString('en-IN')}
            </span>
            <div className='flex gap-1.5'>
              <button
                onClick={() => onEdit(exp)}
                className='w-8 h-8 rounded-lg flex items-center justify-center'
                style={{
                  background: 'rgba(91,143,255,0.1)',
                  border: '1px solid rgba(91,143,255,0.2)',
                  color: '#5b8fff',
                }}
              >
                <Edit2 className='w-3.5 h-3.5' />
              </button>
              <button
                onClick={() => onDelete(exp)}
                className='w-8 h-8 rounded-lg flex items-center justify-center'
                style={{
                  background: 'rgba(255,59,92,0.08)',
                  border: '1px solid rgba(255,59,92,0.2)',
                  color: '#ff3b5c',
                }}
              >
                <Trash2 className='w-3.5 h-3.5' />
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ExpensesPage() {
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [showForm, setShowForm] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
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
    setShowFilterSheet(false);
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setFilters((p) => ({ ...p, search: q || undefined }));
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setFormError('');
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
      resetForm();
    } catch (err: unknown) {
      setFormError(
        (err as { message?: string }).message ?? 'Something went wrong',
      );
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
      className='flex flex-col h-full'
      style={{ background: '#080810', overflow: 'hidden' }}
    >
      {/* ── Sticky Header ── */}
      <div
        className='shrink-0 px-4 sm:px-6 py-3.5 sm:py-4'
        style={{
          borderBottom: '1px solid rgba(124,92,252,0.1)',
          background: 'rgba(8,8,16,0.97)',
          backdropFilter: 'blur(20px)',
          zIndex: 10,
        }}
      >
        <div className='flex items-center justify-between gap-3'>
          <div className='min-w-0'>
            <h1 className='font-display text-xl sm:text-2xl font-extrabold text-[#f0efff] tracking-tight'>
              Expenses
            </h1>
            <p className='font-mono text-[10px] text-[#4a4870]'>
              {isLoading
                ? 'Loading…'
                : `${expenses.length} transactions · ₹${totalAmount.toLocaleString('en-IN')}`}
            </p>
          </div>

          <div className='flex items-center gap-2 shrink-0'>
            {/* Export — desktop only */}
            <Button
              variant='outline'
              size='sm'
              onClick={handleExport}
              className='hidden sm:flex gap-1.5 border-[rgba(124,92,252,0.18)] text-[#8b89b0] hover:text-[#f0efff] hover:border-[rgba(124,92,252,0.35)]'
            >
              <Download className='w-3.5 h-3.5' /> Export
            </Button>

            {/* Filter button — mobile only */}
            <Button
              variant='outline'
              size='icon'
              onClick={() => setShowFilterSheet(true)}
              className='sm:hidden h-9 w-9 border-[rgba(124,92,252,0.18)] text-[#8b89b0] relative'
            >
              <SlidersHorizontal className='w-4 h-4' />
              {selectedCategory && (
                <span
                  className='absolute -top-1 -right-1 w-2 h-2 rounded-full'
                  style={{ background: '#7c5cfc' }}
                />
              )}
            </Button>

            {/* Add button */}
            <Button
              onClick={() => {
                setEditingId(null);
                setFormData(EMPTY_FORM);
                setShowForm(true);
              }}
              size='sm'
              className='h-9 gap-1.5 font-display font-bold text-white'
              style={{
                background: 'linear-gradient(135deg, #7c5cfc, #00d4ff)',
                boxShadow: '0 0 16px rgba(124,92,252,0.3)',
              }}
            >
              <Plus className='w-4 h-4' />
              <span className='hidden sm:inline'>Add Expense</span>
              <span className='sm:hidden'>Add</span>
            </Button>
          </div>
        </div>

        {/* Search bar — always visible in header */}
        <div className='relative mt-3'>
          <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4a4870]' />
          <Input
            placeholder='Search expenses…'
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className='pl-10 h-10 bg-[rgba(13,13,26,0.8)] border-[rgba(124,92,252,0.15)] text-[#f0efff] placeholder:text-[#4a4870] focus-visible:ring-[#7c5cfc]/30 focus-visible:border-[rgba(124,92,252,0.4)]'
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-[#4a4870] hover:text-[#8b89b0]'
            >
              <X className='w-3.5 h-3.5' />
            </button>
          )}
        </div>

        {/* Category pills — desktop only (mobile uses filter sheet) */}
        <div className='hidden sm:flex gap-2 mt-3 overflow-x-auto pb-0.5 scrollbar-hide flex-wrap'>
          {[null, ...CATEGORIES].map((cat) => {
            const isActive = selectedCategory === cat;
            const color = cat ? CATEGORY_COLORS[cat] : '#7c5cfc';
            return (
              <button
                key={cat ?? 'all'}
                onClick={() => handleCategorySelect(cat)}
                className='shrink-0 px-3 py-1.5 rounded-full font-mono text-[10px] transition-all whitespace-nowrap'
                style={{
                  border: `1px solid ${isActive ? color + '60' : 'rgba(124,92,252,0.12)'}`,
                  background: isActive ? `${color}15` : 'transparent',
                  color: isActive ? color : '#8b89b0',
                  boxShadow: isActive ? `0 0 12px ${color}20` : 'none',
                }}
              >
                {cat ? CATEGORY_LABEL[cat] : 'All'}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Native-scroll content area ── */}
      <div
        className='flex-1 min-h-0'
        style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className='p-4 sm:p-5 space-y-3 pb-6'>
          {/* Active category badge on mobile */}
          {selectedCategory && (
            <div className='flex items-center gap-2 sm:hidden'>
              <span className='font-mono text-[10px] text-[#4a4870]'>
                Filtered by:
              </span>
              <button
                onClick={() => handleCategorySelect(null)}
                className='flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px]'
                style={{
                  background: `${CATEGORY_COLORS[selectedCategory]}15`,
                  border: `1px solid ${CATEGORY_COLORS[selectedCategory]}40`,
                  color: CATEGORY_COLORS[selectedCategory],
                }}
              >
                {CATEGORY_LABEL[selectedCategory]}
                <X className='w-3 h-3' />
              </button>
            </div>
          )}

          {/* ── Loading skeletons ── */}
          {isLoading && (
            <div className='space-y-2.5'>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className='h-20 rounded-2xl shimmer'
                  style={{ background: 'rgba(124,92,252,0.05)' }}
                />
              ))}
            </div>
          )}

          {/* ── Empty state ── */}
          {!isLoading && expenses.length === 0 && (
            <div className='flex flex-col items-center justify-center py-20 text-center'>
              <div className='text-5xl mb-4'>📭</div>
              <p className='font-display text-base font-bold text-[#f0efff] mb-1'>
                No expenses found
              </p>
              <p className='text-[#4a4870] text-sm'>
                {searchQuery || selectedCategory
                  ? 'Try adjusting your filters'
                  : 'Tap "Add" to record your first expense'}
              </p>
            </div>
          )}

          {/* ── Mobile card list ── */}
          {!isLoading && expenses.length > 0 && (
            <>
              {/* Mobile cards */}
              <div className='sm:hidden space-y-2.5'>
                {expenses.map((exp) => (
                  <MobileExpenseCard
                    key={exp.id}
                    exp={exp}
                    onEdit={handleEdit}
                    onDelete={setDeleteConfirm}
                  />
                ))}
              </div>

              {/* Desktop table */}
              <div
                className='hidden sm:block rounded-2xl overflow-hidden'
                style={{
                  background: 'rgba(13,13,26,0.7)',
                  border: '1px solid rgba(124,92,252,0.12)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <table className='w-full border-collapse'>
                  <thead>
                    <tr
                      style={{ borderBottom: '1px solid rgba(124,92,252,0.1)' }}
                    >
                      {['Title', 'Category', 'Amount', 'Date', 'Actions'].map(
                        (h) => (
                          <th
                            key={h}
                            className='px-5 py-3.5 font-mono text-[10px] text-[#4a4870] uppercase tracking-widest font-medium text-left'
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((exp) => {
                      const color = CATEGORY_COLORS[exp.category] ?? '#4a4870';
                      return (
                        <tr
                          key={exp.id}
                          className='hover:bg-[rgba(124,92,252,0.04)] transition-colors'
                          style={{
                            borderBottom: '1px solid rgba(124,92,252,0.06)',
                          }}
                        >
                          <td className='px-5 py-3.5 font-sans text-sm font-medium text-[#f0efff]'>
                            {exp.title}
                          </td>
                          <td className='px-5 py-3.5'>
                            <span
                              className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px]'
                              style={{
                                border: `1px solid ${color}30`,
                                background: `${color}0f`,
                                color,
                              }}
                            >
                              <span
                                className='w-1.5 h-1.5 rounded-full'
                                style={{
                                  background: color,
                                  boxShadow: `0 0 5px ${color}`,
                                }}
                              />
                              {CATEGORY_LABEL[exp.category]}
                            </span>
                          </td>
                          <td
                            className='px-5 py-3.5 font-display text-sm font-bold'
                            style={{ color }}
                          >
                            ₹{exp.amount.toLocaleString('en-IN')}
                          </td>
                          <td className='px-5 py-3.5 font-mono text-[11px] text-[#4a4870]'>
                            {new Date(exp.date).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td className='px-5 py-3.5'>
                            <div className='flex gap-1.5'>
                              <button
                                onClick={() => handleEdit(exp)}
                                className='w-[30px] h-[30px] rounded-lg flex items-center justify-center transition-all hover:bg-[rgba(91,143,255,0.15)]'
                                style={{
                                  background: 'rgba(91,143,255,0.08)',
                                  border: '1px solid rgba(91,143,255,0.2)',
                                  color: '#5b8fff',
                                }}
                              >
                                <Edit2 className='w-3 h-3' />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(exp)}
                                className='w-[30px] h-[30px] rounded-lg flex items-center justify-center transition-all hover:bg-[rgba(255,59,92,0.15)]'
                                style={{
                                  background: 'rgba(255,59,92,0.08)',
                                  border: '1px solid rgba(255,59,92,0.2)',
                                  color: '#ff3b5c',
                                }}
                              >
                                <Trash2 className='w-3 h-3' />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Export — mobile bottom */}
              <div className='sm:hidden pt-1'>
                <Button
                  variant='outline'
                  onClick={handleExport}
                  className='w-full h-11 gap-2 border-[rgba(124,92,252,0.18)] text-[#8b89b0] hover:text-[#f0efff]'
                >
                  <Download className='w-4 h-4' /> Export CSV
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Add/Edit form sheet (mobile) ── */}
      <Sheet
        open={showForm}
        onOpenChange={(open) => {
          if (!open) resetForm();
        }}
      >
        <SheetContent
          side='bottom'
          className='rounded-t-3xl'
          style={{
            background: '#0d0d1a',
            border: '1px solid rgba(124,92,252,0.2)',
            maxHeight: '92dvh',
            overflowY: 'auto',
            paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
          }}
        >
          <SheetHeader className='mb-5'>
            <SheetTitle className='font-display text-[#f0efff]'>
              {editingId ? 'Edit Expense' : 'New Expense'}
            </SheetTitle>
          </SheetHeader>
          <ExpenseForm
            editingId={editingId}
            formData={formData}
            setFormData={setFormData}
            isSaving={isSaving}
            formError={formError}
            onSubmit={handleSubmit}
            onCancel={resetForm}
          />
        </SheetContent>
      </Sheet>

      {/* ── Desktop inline form ── */}
      {showForm && (
        <div
          className='hidden sm:block fixed inset-x-0 bottom-0 z-30 px-6 pb-6'
          style={{ pointerEvents: 'none' }}
        >
          <div
            className='max-w-2xl mx-auto rounded-2xl p-6'
            style={{
              background: 'rgba(13,13,26,0.97)',
              border: '1px solid rgba(124,92,252,0.25)',
              backdropFilter: 'blur(30px)',
              boxShadow: '0 -8px 40px rgba(124,92,252,0.12)',
              pointerEvents: 'all',
            }}
          >
            <div className='flex items-center gap-2.5 mb-5'>
              <div
                className='w-0.5 h-5 rounded-sm'
                style={{
                  background: 'linear-gradient(180deg, #7c5cfc, #00d4ff)',
                }}
              />
              <span className='font-display text-base font-bold text-[#f0efff]'>
                {editingId ? 'Edit Expense' : 'New Expense'}
              </span>
            </div>
            <ExpenseForm
              editingId={editingId}
              formData={formData}
              setFormData={setFormData}
              isSaving={isSaving}
              formError={formError}
              onSubmit={handleSubmit}
              onCancel={resetForm}
            />
          </div>
        </div>
      )}

      {/* ── Mobile filter sheet ── */}
      <Sheet open={showFilterSheet} onOpenChange={setShowFilterSheet}>
        <SheetContent
          side='bottom'
          className='rounded-t-3xl'
          style={{
            background: '#0d0d1a',
            border: '1px solid rgba(124,92,252,0.2)',
            paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
          }}
        >
          <SheetHeader className='mb-5'>
            <SheetTitle className='font-display text-[#f0efff]'>
              Filter by Category
            </SheetTitle>
          </SheetHeader>
          <div className='grid grid-cols-2 gap-2.5'>
            {[null, ...CATEGORIES].map((cat) => {
              const isActive = selectedCategory === cat;
              const color = cat ? CATEGORY_COLORS[cat] : '#7c5cfc';
              return (
                <button
                  key={cat ?? 'all'}
                  onClick={() => handleCategorySelect(cat)}
                  className='flex items-center gap-2.5 px-3.5 py-3 rounded-xl font-sans text-sm font-medium text-left transition-all'
                  style={{
                    border: `1px solid ${isActive ? color + '50' : 'rgba(124,92,252,0.12)'}`,
                    background: isActive ? `${color}15` : 'rgba(13,13,26,0.8)',
                    color: isActive ? color : '#8b89b0',
                  }}
                >
                  <span className='text-base'>
                    {cat ? CATEGORY_EMOJI[cat] : '🔍'}
                  </span>
                  <span>{cat ? CATEGORY_LABEL[cat] : 'All'}</span>
                  {isActive && (
                    <span
                      className='ml-auto w-1.5 h-1.5 rounded-full'
                      style={{ background: color }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Delete confirm dialog ── */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirm(null);
        }}
      >
        <AlertDialogContent
          className='border-[rgba(255,59,92,0.3)] max-w-[90vw] sm:max-w-md'
          style={{
            background: '#0d0d1a',
            boxShadow: '0 0 60px rgba(255,59,92,0.1)',
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className='font-display text-[#f0efff]'>
              Delete expense?
            </AlertDialogTitle>
            <AlertDialogDescription className='text-[#8b89b0]'>
              <span className='text-[#f0efff] font-medium'>
                {deleteConfirm?.title}
              </span>{' '}
              (₹{deleteConfirm?.amount.toLocaleString('en-IN')}) will be
              permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className='border-[rgba(255,255,255,0.1)] text-[#8b89b0]'
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteConfirm) {
                  await deleteExpense(deleteConfirm.id);
                  setDeleteConfirm(null);
                }
              }}
              className='border-[rgba(255,59,92,0.3)] text-[#ff3b5c] font-display font-semibold'
              style={{ background: 'rgba(255,59,92,0.15)' }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
