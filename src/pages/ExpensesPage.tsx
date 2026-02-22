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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
  DINING: 'border-pink-900/40 bg-pink-950/40 text-pink-400',
  SHOPPING: 'border-purple-900/40 bg-purple-950/40 text-purple-400',
  TRANSPORT: 'border-cyan-900/40 bg-cyan-950/40 text-cyan-400',
  ENTERTAINMENT: 'border-amber-900/40 bg-amber-950/40 text-amber-400',
  UTILITIES: 'border-green-900/40 bg-green-950/40 text-green-400',
  HEALTH: 'border-rose-900/40 bg-rose-950/40 text-rose-400',
  EDUCATION: 'border-blue-900/40 bg-blue-950/40 text-blue-400',
  OTHER: 'border-zinc-800 bg-zinc-900 text-zinc-400',
};
const EMPTY_FORM = {
  title: '',
  category: 'OTHER' as Category,
  amount: '',
  date: new Date().toISOString().split('T')[0],
  notes: '',
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

  const { data, isLoading } = useExpenses(filters);
  const { mutateAsync: createExpense, isPending: isCreating } =
    useCreateExpense();
  const { mutateAsync: updateExpense, isPending: isUpdating } =
    useUpdateExpense();
  const { mutateAsync: deleteExpense } = useDeleteExpense();

  const expenses = data?.expenses ?? [];
  const isSaving = isCreating || isUpdating;

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
    } catch (err: any) {
      setFormError(err.message ?? 'Something went wrong');
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
  const handleDelete = async (id: number) => {
    await deleteExpense(id);
  };
  const handleExport = () => {
    const rows = expenses.map((e) =>
      [e.title, e.category, e.amount, e.date].join(','),
    );
    const csv = ['Title,Category,Amount,Date', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <TooltipProvider>
      <div className='flex flex-col h-full bg-[--background]'>
        {/* Header */}
        <div className='shrink-0 border-b border-[#1c1c22] bg-[#0a0a0c] px-8 py-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='font-display text-2xl font-bold text-[--foreground]'>
                Expenses
              </h1>
              <p className='text-sm text-[--foreground-secondary] mt-0.5 font-mono'>
                {isLoading
                  ? 'Loading…'
                  : `${expenses.length} transactions · Rs.${totalAmount.toLocaleString('en-IN')}`}
              </p>
            </div>
            <div className='flex gap-2'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleExport}
                    className='gap-2 bg-[#111114] border-[#1c1c22] text-[--foreground-secondary] hover:text-[--foreground] hover:bg-[#161619]'
                  >
                    <Download className='h-4 w-4' /> Export
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export as CSV</TooltipContent>
              </Tooltip>
              <Button
                size='sm'
                onClick={() => {
                  setEditingId(null);
                  setFormData(EMPTY_FORM);
                  setShowForm((v) => !v);
                }}
                className='gap-2 bg-[--primary] text-[--primary-foreground] hover:bg-[--primary]/90'
              >
                <Plus className='h-4 w-4' /> Add Expense
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className='flex-1'>
          <div className='px-8 py-6 space-y-6'>
            {/* Add / Edit form */}
            {showForm && (
              <Card className='bg-[#0f0f12] border-[#1c1c22]'>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm font-mono text-[--foreground-secondary] uppercase tracking-widest font-normal'>
                    {editingId ? 'Edit Expense' : 'New Expense'}
                  </CardTitle>
                </CardHeader>
                <Separator className='bg-[#1c1c22]' />
                <CardContent className='pt-5'>
                  {formError && (
                    <p className='text-red-400 text-xs mb-4 bg-red-950/20 border border-red-900/30 rounded-lg px-3 py-2'>
                      {formError}
                    </p>
                  )}
                  <form
                    onSubmit={handleSubmit}
                    className='grid grid-cols-1 md:grid-cols-2 gap-4'
                  >
                    <div className='space-y-2'>
                      <Label className='text-[10px] font-mono text-[--foreground-secondary] uppercase tracking-widest'>
                        Title
                      </Label>
                      <Input
                        placeholder='e.g., Coffee'
                        value={formData.title}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, title: e.target.value }))
                        }
                        className='bg-[#111114] border-[#1c1c22] text-[--foreground] placeholder:text-[--foreground-secondary]/50 focus-visible:ring-[--primary]/30'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-[10px] font-mono text-[--foreground-secondary] uppercase tracking-widest'>
                        Amount (Rs.)
                      </Label>
                      <Input
                        type='number'
                        step='0.01'
                        placeholder='0.00'
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, amount: e.target.value }))
                        }
                        className='bg-[#111114] border-[#1c1c22] text-[--foreground] placeholder:text-[--foreground-secondary]/50 focus-visible:ring-[--primary]/30'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-[10px] font-mono text-[--foreground-secondary] uppercase tracking-widest'>
                        Category
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(v) =>
                          setFormData((p) => ({
                            ...p,
                            category: v as Category,
                          }))
                        }
                      >
                        <SelectTrigger className='bg-[#111114] border-[#1c1c22] text-[--foreground] focus:ring-[--primary]/30'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className='bg-[#111114] border-[#1c1c22]'>
                          {CATEGORIES.map((c) => (
                            <SelectItem
                              key={c}
                              value={c}
                              className='text-[--foreground] focus:bg-[#1a1a1f] focus:text-[--foreground]'
                            >
                              {CATEGORY_LABEL[c]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-[10px] font-mono text-[--foreground-secondary] uppercase tracking-widest'>
                        Date
                      </Label>
                      <Input
                        type='date'
                        value={formData.date}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, date: e.target.value }))
                        }
                        className='bg-[#111114] border-[#1c1c22] text-[--foreground] focus-visible:ring-[--primary]/30'
                      />
                    </div>
                    <div className='md:col-span-2 space-y-2'>
                      <Label className='text-[10px] font-mono text-[--foreground-secondary] uppercase tracking-widest'>
                        Notes (optional)
                      </Label>
                      <Input
                        placeholder='Any extra context…'
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, notes: e.target.value }))
                        }
                        className='bg-[#111114] border-[#1c1c22] text-[--foreground] placeholder:text-[--foreground-secondary]/50 focus-visible:ring-[--primary]/30'
                      />
                    </div>
                    <div className='md:col-span-2 flex gap-2 pt-2'>
                      <Button
                        type='submit'
                        disabled={isSaving}
                        className='gap-2 bg-[--primary] text-[--primary-foreground] hover:bg-[--primary]/90 disabled:opacity-50'
                      >
                        {isSaving ? (
                          <Loader2 className='h-4 w-4 animate-spin' />
                        ) : (
                          <Save className='h-4 w-4' />
                        )}
                        {editingId ? 'Update' : 'Add'} Expense
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        onClick={() => {
                          setShowForm(false);
                          setEditingId(null);
                        }}
                        className='gap-2 border-[#1c1c22] bg-transparent text-[--foreground-secondary] hover:text-[--foreground] hover:bg-[#161619]'
                      >
                        <X className='h-4 w-4' /> Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Filters */}
            <div className='space-y-3'>
              <div className='flex gap-2 flex-wrap'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleCategorySelect(null)}
                  className={[
                    'text-xs font-mono h-8 rounded-lg transition-all',
                    selectedCategory === null
                      ? 'bg-[--primary] text-[--primary-foreground] border-[--primary] hover:bg-[--primary]/90'
                      : 'bg-[#111114] border-[#1c1c22] text-[--foreground-secondary] hover:text-[--foreground] hover:bg-[#161619]',
                  ].join(' ')}
                >
                  All
                </Button>
                {CATEGORIES.map((cat) => (
                  <Button
                    key={cat}
                    variant='outline'
                    size='sm'
                    onClick={() => handleCategorySelect(cat)}
                    className={[
                      'text-xs font-mono h-8 rounded-lg transition-all',
                      selectedCategory === cat
                        ? 'bg-[--primary] text-[--primary-foreground] border-[--primary] hover:bg-[--primary]/90'
                        : 'bg-[#111114] border-[#1c1c22] text-[--foreground-secondary] hover:text-[--foreground] hover:bg-[#161619]',
                    ].join(' ')}
                  >
                    {CATEGORY_LABEL[cat]}
                  </Button>
                ))}
              </div>
              <div className='relative'>
                <Search className='h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[--foreground-secondary]' />
                <Input
                  placeholder='Search expenses…'
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className='pl-10 bg-[#111114] border-[#1c1c22] text-[--foreground] placeholder:text-[--foreground-secondary]/50 focus-visible:ring-[--primary]/30'
                />
              </div>
            </div>

            {/* Table */}
            <Card className='bg-[#0f0f12] border-[#1c1c22] overflow-hidden'>
              <Table>
                <TableHeader>
                  <TableRow className='border-[#1c1c22] hover:bg-transparent'>
                    {['Title', 'Category', 'Amount', 'Date', 'Actions'].map(
                      (h) => (
                        <TableHead
                          key={h}
                          className='text-[10px] font-mono text-[--foreground-secondary] uppercase tracking-widest'
                        >
                          {h}
                        </TableHead>
                      ),
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow className='border-[#1c1c22]'>
                      <TableCell
                        colSpan={5}
                        className='text-center py-10 text-sm text-[--foreground-secondary]'
                      >
                        Loading…
                      </TableCell>
                    </TableRow>
                  ) : expenses.length === 0 ? (
                    <TableRow className='border-[#1c1c22]'>
                      <TableCell
                        colSpan={5}
                        className='text-center py-10 text-sm text-[--foreground-secondary]'
                      >
                        No expenses found
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenses.map((exp) => (
                      <TableRow
                        key={exp.id}
                        className='border-[#1c1c22] hover:bg-[#111114] transition-colors'
                      >
                        <TableCell className='text-sm text-[--foreground] font-medium'>
                          {exp.title}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant='outline'
                            className={`text-xs font-mono ${CATEGORY_COLORS[exp.category] ?? CATEGORY_COLORS.OTHER}`}
                          >
                            {CATEGORY_LABEL[exp.category]}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-sm font-mono text-[--primary]'>
                          Rs.{exp.amount.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell className='text-sm font-mono text-[--foreground-secondary]'>
                          {new Date(exp.date).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </TableCell>
                        <TableCell>
                          <div className='flex gap-1'>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='h-7 w-7 text-blue-500 hover:text-blue-400 hover:bg-blue-950/20'
                                  onClick={() => handleEdit(exp)}
                                >
                                  <Edit2 className='h-3.5 w-3.5' />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>

                            <AlertDialog>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant='ghost'
                                      size='icon'
                                      className='h-7 w-7 text-red-500 hover:text-red-400 hover:bg-red-950/20'
                                    >
                                      <Trash2 className='h-3.5 w-3.5' />
                                    </Button>
                                  </AlertDialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Delete</TooltipContent>
                              </Tooltip>
                              <AlertDialogContent className='bg-[#111114] border-[#1c1c22]'>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className='text-[--foreground]'>
                                    Delete expense?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className='text-[--foreground-secondary]'>
                                    <span className='font-medium text-[--foreground]'>
                                      {exp.title}
                                    </span>{' '}
                                    (Rs.{exp.amount.toLocaleString('en-IN')})
                                    will be permanently deleted.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className='bg-[#1a1a1f] border-[#1c1c22] text-[--foreground-secondary] hover:bg-[#222226] hover:text-[--foreground]'>
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(exp.id)}
                                    className='bg-red-600 text-white hover:bg-red-700'
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}
