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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
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
    <form onSubmit={onSubmit} className='space-y-4 px-1'>
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

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label className='font-mono text-[10px] text-[#8b89b0] uppercase tracking-widest'>
            Title
          </Label>
          <Input
            value={formData.title}
            onChange={(e) =>
              setFormData((p) => ({ ...p, title: e.target.value }))
            }
            placeholder='e.g., Coffee'
            className='bg-[rgba(13,13,26,0.8)] border-[rgba(124,92,252,0.15)] text-[#f0efff] focus-visible:ring-[#7c5cfc]/30 focus-visible:border-[rgba(124,92,252,0.5)]'
          />
        </div>
        <div className='space-y-2'>
          <Label className='font-mono text-[10px] text-[#8b89b0] uppercase tracking-widest'>
            Amount (₹)
          </Label>
          <Input
            type='number'
            step='0.01'
            value={formData.amount}
            onChange={(e) =>
              setFormData((p) => ({ ...p, amount: e.target.value }))
            }
            placeholder='0.00'
            className='bg-[rgba(13,13,26,0.8)] border-[rgba(124,92,252,0.15)] text-[#f0efff] focus-visible:ring-[#7c5cfc]/30 focus-visible:border-[rgba(124,92,252,0.5)]'
          />
        </div>
        <div className='space-y-2'>
          <Label className='font-mono text-[10px] text-[#8b89b0] uppercase tracking-widest'>
            Category
          </Label>
          <Select
            value={formData.category}
            onValueChange={(v) =>
              setFormData((p) => ({ ...p, category: v as Category }))
            }
          >
            <SelectTrigger className='bg-[rgba(13,13,26,0.8)] border-[rgba(124,92,252,0.15)] text-[#f0efff] focus:ring-[#7c5cfc]/30'>
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
        <div className='space-y-2'>
          <Label className='font-mono text-[10px] text-[#8b89b0] uppercase tracking-widest'>
            Date
          </Label>
          <Input
            type='date'
            value={formData.date}
            onChange={(e) =>
              setFormData((p) => ({ ...p, date: e.target.value }))
            }
            className='bg-[rgba(13,13,26,0.8)] border-[rgba(124,92,252,0.15)] text-[#f0efff] focus-visible:ring-[#7c5cfc]/30 [color-scheme:dark]'
          />
        </div>
      </div>

      <div className='space-y-2'>
        <Label className='font-mono text-[10px] text-[#8b89b0] uppercase tracking-widest'>
          Notes (optional)
        </Label>
        <Input
          value={formData.notes}
          onChange={(e) =>
            setFormData((p) => ({ ...p, notes: e.target.value }))
          }
          placeholder='Any extra context…'
          className='bg-[rgba(13,13,26,0.8)] border-[rgba(124,92,252,0.15)] text-[#f0efff] focus-visible:ring-[#7c5cfc]/30 focus-visible:border-[rgba(124,92,252,0.5)]'
        />
      </div>

      <div className='flex gap-2.5 pt-1'>
        <Button
          type='submit'
          disabled={isSaving}
          className='flex-1 gap-2 font-display font-bold'
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
          className='gap-2 border-[rgba(124,92,252,0.18)] text-[#8b89b0] hover:text-[#f0efff]'
        >
          <X className='w-4 h-4' /> Cancel
        </Button>
      </div>
    </form>
  );
}

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
      className='flex flex-col h-full overflow-hidden'
      style={{ background: '#080810' }}
    >
      {/* Header */}
      <div
        className='shrink-0 px-4 sm:px-8 py-3.5 sm:py-5'
        style={{
          borderBottom: '1px solid rgba(124,92,252,0.1)',
          background: 'rgba(8,8,16,0.95)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className='flex items-center justify-between gap-3'>
          <div className='min-w-0'>
            <h1 className='font-display text-xl sm:text-2xl font-extrabold text-[#f0efff] tracking-tight truncate'>
              Expenses
            </h1>
            <p className='font-mono text-[10px] sm:text-[11px] text-[#4a4870]'>
              {isLoading
                ? 'Loading…'
                : `${expenses.length} transactions · ₹${totalAmount.toLocaleString('en-IN')}`}
            </p>
          </div>
          <div className='flex items-center gap-2 shrink-0'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleExport}
              className='gap-1.5 border-[rgba(124,92,252,0.18)] text-[#8b89b0] hover:text-[#f0efff] hover:border-[rgba(124,92,252,0.35)] hidden sm:flex'
            >
              <Download className='w-3.5 h-3.5' /> Export
            </Button>
            <Button
              onClick={() => {
                setEditingId(null);
                setFormData(EMPTY_FORM);
                setShowForm((v) => !v);
              }}
              size='sm'
              className='gap-1.5 font-display font-bold text-white'
              style={{
                background: 'linear-gradient(135deg, #7c5cfc, #00d4ff)',
                boxShadow: '0 0 20px rgba(124,92,252,0.3)',
              }}
            >
              <Plus className='w-4 h-4' />
              <span className='hidden sm:inline'>Add Expense</span>
              <span className='sm:hidden'>Add</span>
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className='flex-1'>
        <div className='p-4 sm:p-6 space-y-4'>
          {/* Inline form for desktop */}
          {showForm && (
            <div
              className='hidden sm:block rounded-2xl p-6'
              style={{
                background: 'rgba(13,13,26,0.85)',
                border: '1px solid rgba(124,92,252,0.2)',
                backdropFilter: 'blur(20px)',
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
          )}

          {/* Mobile: Sheet - always mounted, controlled via open prop for smooth animation */}
          <Sheet
            open={showForm}
            onOpenChange={(open) => {
              if (!open) resetForm();
            }}
          >
            <SheetContent
              side='bottom'
              className='sm:hidden rounded-t-3xl'
              style={{
                background: '#0d0d1a',
                border: '1px solid rgba(124,92,252,0.2)',
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

          {/* Filters */}
          <div className='space-y-3'>
            {/* Category pills - horizontal scroll on mobile */}
            <div className='flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap'>
              {[null, ...CATEGORIES].map((cat) => {
                const isActive = selectedCategory === cat;
                const color = cat ? CATEGORY_COLORS[cat] : '#7c5cfc';
                return (
                  <button
                    key={cat ?? 'all'}
                    onClick={() => handleCategorySelect(cat)}
                    className='shrink-0 px-3 py-1 sm:py-1.5 rounded-full font-mono text-[10px] sm:text-[11px] transition-all whitespace-nowrap'
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

            {/* Search */}
            <div className='relative'>
              <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4a4870]' />
              <Input
                placeholder='Search expenses…'
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className='pl-10 bg-[rgba(13,13,26,0.8)] border-[rgba(124,92,252,0.15)] text-[#f0efff] placeholder:text-[#4a4870] focus-visible:ring-[#7c5cfc]/30 focus-visible:border-[rgba(124,92,252,0.4)] focus-visible:bg-[rgba(124,92,252,0.05)]'
              />
            </div>
          </div>

          {/* Mobile card list */}
          <div className='sm:hidden space-y-2'>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className='h-16 rounded-2xl shimmer'
                  style={{ background: 'rgba(124,92,252,0.05)' }}
                />
              ))
            ) : expenses.length === 0 ? (
              <div className='flex flex-col items-center py-16 text-center'>
                <div className='text-4xl mb-3'>📭</div>
                <p className='text-[#4a4870] text-sm'>No expenses found</p>
              </div>
            ) : (
              expenses.map((exp) => {
                const color = CATEGORY_COLORS[exp.category] ?? '#4a4870';
                return (
                  <Card
                    key={exp.id}
                    className='border-[rgba(124,92,252,0.08)] hover:border-[rgba(124,92,252,0.2)] transition-all'
                    style={{ background: 'rgba(13,13,26,0.7)' }}
                  >
                    <CardContent className='p-3.5'>
                      <div className='flex items-center justify-between gap-3'>
                        <div className='flex items-center gap-3 min-w-0'>
                          <div className='flex flex-col min-w-0'>
                            <span className='font-sans text-sm font-medium text-[#f0efff] truncate'>
                              {exp.title}
                            </span>
                            <div className='flex items-center gap-2 mt-0.5'>
                              <Badge
                                className='text-[9px] font-mono px-1.5 py-0 h-4 border-0'
                                style={{ background: `${color}15`, color }}
                              >
                                {CATEGORY_LABEL[exp.category]}
                              </Badge>
                              <span className='font-mono text-[9px] text-[#4a4870]'>
                                {exp.date}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className='flex items-center gap-2 shrink-0'>
                          <span
                            className='font-display text-base font-bold'
                            style={{ color }}
                          >
                            ₹{exp.amount.toLocaleString('en-IN')}
                          </span>
                          <div className='flex gap-1'>
                            <button
                              onClick={() => handleEdit(exp)}
                              className='w-9 h-9 rounded-lg flex items-center justify-center transition-all'
                              style={{
                                background: 'rgba(91,143,255,0.1)',
                                color: '#5b8fff',
                                border: '1px solid rgba(91,143,255,0.2)',
                              }}
                            >
                              <Edit2 className='w-3.5 h-3.5' />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(exp)}
                              className='w-9 h-9 rounded-lg flex items-center justify-center transition-all'
                              style={{
                                background: 'rgba(255,59,92,0.08)',
                                color: '#ff3b5c',
                                border: '1px solid rgba(255,59,92,0.2)',
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
              })
            )}
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
                <tr style={{ borderBottom: '1px solid rgba(124,92,252,0.1)' }}>
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
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className='text-center py-12 text-[#4a4870] text-sm'
                    >
                      Loading…
                    </td>
                  </tr>
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className='text-center py-12'>
                      <div className='text-3xl mb-3'>📭</div>
                      <p className='text-[#4a4870] text-sm'>
                        No expenses found
                      </p>
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => {
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
                        >{`₹${exp.amount.toLocaleString('en-IN')}`}</td>
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
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Export button for mobile */}
          <div className='sm:hidden'>
            <Button
              variant='outline'
              onClick={handleExport}
              className='w-full gap-2 border-[rgba(124,92,252,0.18)] text-[#8b89b0] hover:text-[#f0efff]'
            >
              <Download className='w-4 h-4' /> Export CSV
            </Button>
          </div>
        </div>
      </ScrollArea>

      {/* Delete confirm */}
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
