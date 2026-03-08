import { useState } from 'react';
import { type Category, type Expense } from '@/api/expenses.api';
import { request } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, FileText, Sheet, Loader2 } from 'lucide-react';

const CATEGORIES: Category[] = [
  'DINING', 'SHOPPING', 'TRANSPORT', 'ENTERTAINMENT',
  'UTILITIES', 'HEALTH', 'EDUCATION', 'OTHER',
];

const CATEGORY_EMOJI: Record<Category, string> = {
  DINING: '🍽️', SHOPPING: '🛍️', TRANSPORT: '🚗',
  ENTERTAINMENT: '🎮', UTILITIES: '⚡', HEALTH: '💊',
  EDUCATION: '📚', OTHER: '📦',
};

// ─── PDF generation (print window) ───────────────────────────────────────────

function buildPdfHtml(
  expenses: Expense[],
  filters: { from?: string; to?: string; category?: Category },
): string {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});

  const dateRange = filters.from || filters.to
    ? `${filters.from ?? '—'} to ${filters.to ?? '—'}`
    : 'All time';

  const rows = expenses
    .map(
      (e) => `
    <tr>
      <td>${e.date}</td>
      <td>${e.title}</td>
      <td class="cat">${e.category}</td>
      <td class="amount">₹${e.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      <td class="notes">${e.notes ?? ''}</td>
    </tr>`,
    )
    .join('');

  const catRows = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([cat, amt]) => `
    <tr>
      <td>${cat}</td>
      <td class="amount">₹${amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
    </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Expense Report — ExpenseAI</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a2e; background: #fff; padding: 32px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; border-bottom: 2px solid #7c5cfc; padding-bottom: 16px; }
  .brand { font-size: 22px; font-weight: 800; color: #7c5cfc; letter-spacing: -0.5px; }
  .brand span { color: #00d4ff; }
  .meta { text-align: right; font-size: 11px; color: #666; }
  .meta strong { display: block; font-size: 13px; color: #1a1a2e; margin-bottom: 2px; }
  h2 { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #7c5cfc; margin-bottom: 10px; margin-top: 24px; }
  .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 8px; }
  .stat { background: #f4f2ff; border: 1px solid #e0d9ff; border-radius: 8px; padding: 12px 16px; }
  .stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin-bottom: 4px; }
  .stat-value { font-size: 18px; font-weight: 800; color: #7c5cfc; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { background: #f4f2ff; padding: 8px 12px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.07em; color: #666; border-bottom: 1px solid #e0d9ff; }
  td { padding: 8px 12px; border-bottom: 1px solid #f0eeff; vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  .amount { text-align: right; font-weight: 700; color: #1a1a2e; }
  .cat { font-size: 11px; color: #7c5cfc; font-weight: 600; }
  .notes { font-size: 11px; color: #999; }
  .footer { margin-top: 32px; text-align: center; font-size: 10px; color: #bbb; }
  @media print { body { padding: 16px; } }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="brand">Expense<span>AI</span></div>
    <div style="font-size:11px;color:#888;margin-top:4px;">Expense Report</div>
  </div>
  <div class="meta">
    <strong>${dateRange}</strong>
    Generated on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
    ${filters.category ? `<br/>Category: ${filters.category}` : ''}
  </div>
</div>

<h2>Summary</h2>
<div class="summary">
  <div class="stat"><div class="stat-label">Total Spent</div><div class="stat-value">₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div></div>
  <div class="stat"><div class="stat-label">Transactions</div><div class="stat-value">${expenses.length}</div></div>
  <div class="stat"><div class="stat-label">Avg / txn</div><div class="stat-value">₹${expenses.length ? Math.round(total / expenses.length).toLocaleString('en-IN') : 0}</div></div>
</div>

<h2>By Category</h2>
<table>
  <thead><tr><th>Category</th><th style="text-align:right">Total</th></tr></thead>
  <tbody>${catRows}</tbody>
</table>

<h2>All Transactions (${expenses.length})</h2>
<table>
  <thead><tr><th>Date</th><th>Title</th><th>Category</th><th style="text-align:right">Amount</th><th>Notes</th></tr></thead>
  <tbody>${rows}</tbody>
</table>

<div class="footer">Generated by ExpenseAI · ${new Date().toISOString()}</div>
</body>
</html>`;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  /** Pre-fill filters from the current page state */
  defaultFrom?: string;
  defaultTo?: string;
  defaultCategory?: Category;
}

export function ExportDialog({ open, onClose, defaultFrom, defaultTo, defaultCategory }: Props) {
  const [from, setFrom] = useState(defaultFrom ?? '');
  const [to, setTo] = useState(defaultTo ?? '');
  const [category, setCategory] = useState<Category | 'ALL'>('ALL');
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync defaults when dialog opens
  const handleOpenChange = (o: boolean) => {
    if (o) {
      setFrom(defaultFrom ?? '');
      setTo(defaultTo ?? '');
      setCategory(defaultCategory ?? 'ALL');
      setError('');
    } else {
      onClose();
    }
  };

  const filters = {
    from: from || undefined,
    to: to || undefined,
    category: category !== 'ALL' ? category : undefined,
  };

  async function handleExport() {
    setError('');
    setLoading(true);
    try {
      // Fetch all matching expenses as JSON (handles auth + refresh automatically)
      const params = new URLSearchParams({ limit: '2000' });
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      if (category !== 'ALL') params.set('category', category);

      const json = await request<Expense[]>(`/expenses?${params.toString()}`);
      if (!json.success || !json.data) {
        setError('Failed to fetch expenses. Please try again.');
        return;
      }
      const expenses = json.data;

      if (format === 'csv') {
        // Build CSV string in the browser — most reliable cross-browser approach
        const escapeCell = (v: string) => `"${v.replace(/"/g, '""')}"`;
        const headers = ['Date', 'Title', 'Category', 'Amount (INR)', 'Notes'];
        const rows = expenses.map((e) =>
          [
            e.date,
            escapeCell(e.title),
            e.category,
            e.amount.toFixed(2),
            escapeCell(e.notes ?? ''),
          ].join(','),
        );
        // UTF-8 BOM prefix so Excel opens with correct encoding
        const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expenses${from ? `-${from}` : ''}${to ? `-${to}` : ''}.csv`;
        // Must be in DOM for Firefox
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // Delay revoke so browser has time to start the download
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        onClose();
      } else {
        // PDF via hidden iframe — avoids popup blockers entirely
        const html = buildPdfHtml(expenses, { ...filters });
        const iframe = document.createElement('iframe');
        iframe.style.cssText =
          'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;border:none;';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentDocument ?? iframe.contentWindow?.document;
        if (!iframeDoc) { setError('Could not create print frame.'); return; }
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();

        // Wait for iframe to finish rendering, then print
        setTimeout(() => {
          iframe.contentWindow?.print();
          // Clean up iframe after print dialog closes (1 min safety window)
          setTimeout(() => {
            if (document.body.contains(iframe)) document.body.removeChild(iframe);
          }, 60_000);
        }, 500);
        onClose();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className='max-w-md border-[rgba(124,92,252,0.2)]'
        style={{ background: '#0d0d1a' }}
      >
        <DialogHeader>
          <DialogTitle className='font-display text-lg font-bold text-[#f0efff] flex items-center gap-2'>
            <Download className='w-4 h-4 text-[#7c5cfc]' />
            Export Expenses
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4 mt-2'>
          {/* Format selector */}
          <div className='grid grid-cols-2 gap-2'>
            {(['csv', 'pdf'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className='flex flex-col items-center gap-2 p-4 rounded-xl border transition-all'
                style={{
                  border: format === f
                    ? '1px solid rgba(124,92,252,0.5)'
                    : '1px solid rgba(124,92,252,0.12)',
                  background: format === f ? 'rgba(124,92,252,0.1)' : 'rgba(13,13,26,0.5)',
                }}
              >
                {f === 'csv'
                  ? <Sheet className='w-5 h-5' style={{ color: format === f ? '#7c5cfc' : '#4a4870' }} />
                  : <FileText className='w-5 h-5' style={{ color: format === f ? '#7c5cfc' : '#4a4870' }} />
                }
                <span className='font-mono text-[11px] uppercase tracking-wider' style={{ color: format === f ? '#f0efff' : '#4a4870' }}>
                  {f === 'csv' ? 'CSV / Excel' : 'PDF Report'}
                </span>
              </button>
            ))}
          </div>

          {/* Date range */}
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label className='font-sans text-xs text-[#8b89b0]'>From</Label>
              <Input
                type='date'
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className='bg-[rgba(124,92,252,0.06)] border-[rgba(124,92,252,0.15)] text-[#f0efff] focus-visible:ring-[#7c5cfc] text-sm'
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div className='space-y-1.5'>
              <Label className='font-sans text-xs text-[#8b89b0]'>To</Label>
              <Input
                type='date'
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className='bg-[rgba(124,92,252,0.06)] border-[rgba(124,92,252,0.15)] text-[#f0efff] focus-visible:ring-[#7c5cfc] text-sm'
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          {/* Category */}
          <div className='space-y-1.5'>
            <Label className='font-sans text-xs text-[#8b89b0]'>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category | 'ALL')}>
              <SelectTrigger className='bg-[rgba(124,92,252,0.06)] border-[rgba(124,92,252,0.15)] text-[#f0efff] focus:ring-[#7c5cfc]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ background: '#0d0d1a', border: '1px solid rgba(124,92,252,0.2)' }}>
                <SelectItem value='ALL' className='text-[#f0efff] focus:bg-[rgba(124,92,252,0.1)]'>
                  🔍 All Categories
                </SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c} className='text-[#f0efff] focus:bg-[rgba(124,92,252,0.1)]'>
                    {CATEGORY_EMOJI[c]} {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Hint */}
          <p className='font-mono text-[10px] text-[#4a4870]'>
            {format === 'csv'
              ? 'Downloads a CSV file compatible with Excel and Google Sheets.'
              : 'Opens your browser\'s print dialog — choose "Save as PDF" as the destination.'}
          </p>

          {error && (
            <p className='font-sans text-sm text-[#ff6b6b] bg-red-950/20 border border-red-900/30 rounded-xl px-3 py-2'>
              {error}
            </p>
          )}

          {/* Actions */}
          <div className='flex gap-3 pt-1'>
            <Button
              variant='outline'
              onClick={onClose}
              className='flex-1 border-[rgba(124,92,252,0.2)] text-[#8b89b0] hover:bg-[rgba(124,92,252,0.08)]'
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={loading}
              className='flex-1 gap-2 font-semibold'
              style={{
                background: 'linear-gradient(135deg, #7c5cfc, #00d4ff)',
                border: 'none',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? <Loader2 className='w-4 h-4 animate-spin' /> : <Download className='w-4 h-4' />}
              {loading ? 'Preparing…' : format === 'csv' ? 'Download CSV' : 'Generate PDF'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
