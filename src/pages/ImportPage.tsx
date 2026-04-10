import { useState, useRef } from 'react';
import {
  useParseReceipt,
  useParseBulkText,
  useImportCsv,
  useConfirmCsvImport,
} from '@/services/import.service';
import { useCreateExpense } from '@/services/expenses.service';
import type { ParsedExpenseEntry } from '@/api/import.api';
import type { Category } from '@/api/expenses.api';
import { useFmt } from '@/hooks/useCurrency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Camera,
  FileText,
  Type,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Save,
  Eye,
} from 'lucide-react';

type Tab = 'receipt' | 'bulk' | 'csv';

function TabPill({
  id,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  id: Tab;
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className='flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-wider whitespace-nowrap shrink-0 transition-all'
      style={{
        background: active ? 'rgba(124,92,252,0.2)' : 'transparent',
        border: `1px solid ${active ? 'rgba(124,92,252,0.5)' : 'rgba(124,92,252,0.12)'}`,
        color: active ? '#9d7fff' : '#4a4870',
      }}
    >
      <Icon className='w-3 h-3' /> {label}
    </button>
  );
}

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

// ─── Receipt Tab ──────────────────────────────────────────────────────────────
function ReceiptTab() {
  const fmt = useFmt();
  const fileRef = useRef<HTMLInputElement>(null);
  const { mutate: parse, isPending, data: result, reset } = useParseReceipt();
  const { mutate: createExpense, isPending: saving } = useCreateExpense();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (file: File) => {
    setError('');
    setSaved(false);
    reset();
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string).split(',')[1];
      if (!base64) {
        setError('Failed to read file');
        return;
      }
      parse({ image: base64, mediaType: file.type, save: false });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSave = () => {
    if (!result?.parsed) return;
    const { title, amount, category, date, currency, notes, merchant } =
      result.parsed;
    createExpense(
      {
        title,
        amount,
        currency,
        category,
        date,
        notes: notes ?? (merchant ? `From ${merchant}` : undefined),
      },
      {
        onSuccess: () => setSaved(true),
      },
    );
  };

  return (
    <div className='space-y-4'>
      {/* Drop zone */}
      <div
        onClick={() => fileRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className='flex flex-col items-center justify-center gap-3 p-10 rounded-2xl cursor-pointer transition-all'
        style={{
          border: '2px dashed rgba(124,92,252,0.25)',
          background: 'rgba(124,92,252,0.04)',
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.borderColor = 'rgba(124,92,252,0.5)')
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.borderColor = 'rgba(124,92,252,0.25)')
        }
      >
        {isPending ? (
          <>
            <Loader2 className='w-8 h-8 text-[#7c5cfc] animate-spin' />
            <p className='font-sans text-sm text-[#8b89b0]'>
              Analyzing receipt with AI…
            </p>
          </>
        ) : (
          <>
            <Camera className='w-10 h-10 text-[#7c5cfc]' />
            <div className='text-center'>
              <p className='font-display text-base font-bold text-[#f0efff]'>
                Upload Receipt Image
              </p>
              <p className='font-sans text-sm text-[#4a4870] mt-1'>
                Drag & drop or click to browse · JPEG, PNG, WebP
              </p>
            </div>
          </>
        )}
      </div>
      <input
        ref={fileRef}
        type='file'
        accept='image/jpeg,image/png,image/webp'
        className='hidden'
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      {error && (
        <div
          className='flex items-center gap-2 p-3 rounded-xl'
          style={{
            background: 'rgba(255,59,92,0.08)',
            border: '1px solid rgba(255,59,92,0.2)',
          }}
        >
          <AlertCircle className='w-4 h-4 text-[#ff3b5c] shrink-0' />
          <p className='font-sans text-sm text-[#ff6b6b]'>{error}</p>
        </div>
      )}

      {/* Parsed result */}
      {result?.parsed && (
        <Card
          style={{
            background: 'rgba(13,13,26,0.8)',
            border: '1px solid rgba(0,212,255,0.2)',
          }}
        >
          <CardHeader className='pb-2 px-4 pt-4'>
            <CardTitle className='text-sm font-display text-[#f0efff] flex items-center gap-2'>
              <Eye className='w-4 h-4 text-[#00d4ff]' /> Parsed Receipt
              <Badge
                className='ml-auto font-mono text-[9px]'
                style={{
                  background:
                    result.parsed.confidence === 'HIGH'
                      ? 'rgba(0,255,135,0.15)'
                      : result.parsed.confidence === 'MEDIUM'
                        ? 'rgba(255,184,48,0.15)'
                        : 'rgba(255,59,92,0.15)',
                  color:
                    result.parsed.confidence === 'HIGH'
                      ? '#00ff87'
                      : result.parsed.confidence === 'MEDIUM'
                        ? '#ffb830'
                        : '#ff3b5c',
                }}
              >
                {result.parsed.confidence} confidence
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className='px-4 pb-4 space-y-2'>
            {[
              { label: 'Title', value: result.parsed.title },
              {
                label: 'Amount',
                value: `${result.parsed.currency} ${result.parsed.amount}`,
              },
              { label: 'Category', value: result.parsed.category },
              { label: 'Date', value: result.parsed.date },
              ...(result.parsed.merchant
                ? [{ label: 'Merchant', value: result.parsed.merchant }]
                : []),
              ...(result.parsed.notes
                ? [{ label: 'Notes', value: result.parsed.notes }]
                : []),
            ].map((row) => (
              <div
                key={row.label}
                className='flex items-center justify-between py-1.5 border-b border-[rgba(124,92,252,0.06)]'
              >
                <span className='font-mono text-[10px] text-[#4a4870] uppercase'>
                  {row.label}
                </span>
                <span className='font-sans text-sm text-[#f0efff]'>
                  {row.value}
                </span>
              </div>
            ))}
            <div className='pt-2'>
              {saved ? (
                <div className='flex items-center gap-2 text-[#00ff87]'>
                  <CheckCircle2 className='w-4 h-4' />
                  <span className='font-sans text-sm font-semibold'>
                    Expense saved!
                  </span>
                </div>
              ) : (
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className='w-full h-10 gap-2 text-white font-display font-bold'
                  style={{
                    background: 'linear-gradient(135deg, #7c5cfc, #00d4ff)',
                  }}
                >
                  {saving ? (
                    <Loader2 className='w-4 h-4 animate-spin' />
                  ) : (
                    <Save className='w-4 h-4' />
                  )}
                  Save as Expense
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Bulk Text Tab ────────────────────────────────────────────────────────────
function BulkTextTab() {
  const fmt = useFmt();
  const [text, setText] = useState('');
  const { mutate: parse, isPending, data: result, reset } = useParseBulkText();
  const { mutate: createExpense } = useCreateExpense();
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

  const handleParse = () => {
    reset();
    setSavedIds(new Set());
    parse({ text, save: false });
  };

  const handleSaveOne = (exp: ParsedExpenseEntry, index: number) => {
    createExpense(
      {
        title: exp.title,
        amount: exp.amount,
        category: exp.category,
        date: exp.date ?? new Date().toISOString().split('T')[0],
        notes: exp.notes ?? undefined,
      },
      {
        onSuccess: () => setSavedIds((p) => new Set([...p, index])),
      },
    );
  };

  const handleSaveAll = () => {
    result?.expenses.forEach((exp, i) => {
      if (!savedIds.has(i)) handleSaveOne(exp, i);
    });
  };

  return (
    <div className='space-y-4'>
      <Card
        style={{
          background: 'rgba(13,13,26,0.8)',
          border: '1px solid rgba(124,92,252,0.12)',
        }}
      >
        <CardContent className='p-4 space-y-3'>
          <div className='space-y-1.5'>
            <Label className='font-mono text-[10px] text-[#4a4870] uppercase tracking-widest'>
              Describe multiple expenses
            </Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder='e.g. "spent 200 on coffee, 500 on uber to office, 1200 at Big Bazaar for groceries, 150 on medicines"'
              rows={4}
              className='bg-[rgba(124,92,252,0.06)] border-[rgba(124,92,252,0.15)] text-[#f0efff] placeholder:text-[#4a4870] focus-visible:ring-[#7c5cfc] resize-none'
            />
          </div>
          <Button
            onClick={handleParse}
            disabled={isPending || !text.trim()}
            className='w-full h-10 gap-2 text-white font-display font-bold'
            style={{ background: 'linear-gradient(135deg, #7c5cfc, #00d4ff)' }}
          >
            {isPending ? (
              <>
                <Loader2 className='w-4 h-4 animate-spin' /> Parsing…
              </>
            ) : (
              <>
                <Type className='w-4 h-4' /> Parse Expenses
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <p className='font-mono text-[10px] text-[#4a4870] uppercase tracking-widest'>
              {result.expenses.length} expenses · {fmt(result.totalAmount)}{' '}
              total
            </p>
            {result.expenses.length > 0 && (
              <Button
                size='sm'
                onClick={handleSaveAll}
                className='h-8 gap-1.5 text-white font-semibold text-xs'
                style={{
                  background: 'linear-gradient(135deg, #7c5cfc, #00d4ff)',
                }}
              >
                <Save className='w-3.5 h-3.5' /> Save All
              </Button>
            )}
          </div>

          {result.expenses.map((exp, i) => {
            const color = CATEGORY_COLORS[exp.category] ?? '#9d7fff';
            const isSaved = savedIds.has(i);
            return (
              <Card
                key={i}
                style={{
                  background: 'rgba(13,13,26,0.8)',
                  border: `1px solid ${isSaved ? 'rgba(0,255,135,0.2)' : 'rgba(124,92,252,0.1)'}`,
                }}
              >
                <CardContent className='p-3 flex items-center justify-between gap-3'>
                  <div className='min-w-0 flex-1'>
                    <p className='font-sans text-sm font-semibold text-[#f0efff] truncate'>
                      {exp.title}
                    </p>
                    <div className='flex items-center gap-2 mt-0.5'>
                      <span
                        className='font-mono text-[9px] px-1.5 py-0.5 rounded'
                        style={{ background: `${color}15`, color }}
                      >
                        {exp.category}
                      </span>
                      {exp.date && (
                        <span className='font-mono text-[9px] text-[#4a4870]'>
                          {exp.date}
                        </span>
                      )}
                    </div>
                  </div>
                  <p
                    className='font-display text-base font-bold shrink-0'
                    style={{ color }}
                  >
                    {fmt(exp.amount)}
                  </p>
                  {isSaved ? (
                    <CheckCircle2 className='w-5 h-5 text-[#00ff87] shrink-0' />
                  ) : (
                    <button
                      onClick={() => handleSaveOne(exp, i)}
                      className='w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors'
                      style={{
                        background: 'rgba(0,212,255,0.1)',
                        border: '1px solid rgba(0,212,255,0.2)',
                        color: '#00d4ff',
                      }}
                    >
                      <Save className='w-3.5 h-3.5' />
                    </button>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {result.unparsed.length > 0 && (
            <Card
              style={{
                background: 'rgba(255,184,48,0.05)',
                border: '1px solid rgba(255,184,48,0.2)',
              }}
            >
              <CardContent className='p-3'>
                <p className='font-mono text-[10px] text-[#ffb830] mb-2 uppercase tracking-widest'>
                  Could not parse
                </p>
                {result.unparsed.map((u, i) => (
                  <p key={i} className='font-sans text-xs text-[#8b89b0]'>
                    {u}
                  </p>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ─── CSV Import Tab ───────────────────────────────────────────────────────────
function CsvTab() {
  const fmt = useFmt();
  const fileRef = useRef<HTMLInputElement>(null);
  const {
    mutate: importCsv,
    isPending: parsing,
    data: preview,
    reset,
  } = useImportCsv();
  const {
    mutate: confirm,
    isPending: confirming,
    isSuccess: confirmed,
  } = useConfirmCsvImport();
  const [error, setError] = useState('');

  const handleFile = (file: File) => {
    setError('');
    reset();
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      if (!csv) {
        setError('Failed to read file');
        return;
      }
      importCsv({ csv, dryRun: true, save: false });
    };
    reader.readAsText(file);
  };

  const handleConfirm = () => {
    if (!preview) return;
    confirm(
      preview.preview.map((r) => ({
        title: r.title,
        amount: r.amount,
        category: r.category as Category,
        date: r.date,
      })),
    );
  };

  return (
    <div className='space-y-4'>
      {/* Upload zone */}
      <div
        onClick={() => fileRef.current?.click()}
        className='flex flex-col items-center justify-center gap-3 p-10 rounded-2xl cursor-pointer transition-all'
        style={{
          border: '2px dashed rgba(124,92,252,0.25)',
          background: 'rgba(124,92,252,0.04)',
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.borderColor = 'rgba(124,92,252,0.5)')
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.borderColor = 'rgba(124,92,252,0.25)')
        }
      >
        {parsing ? (
          <>
            <Loader2 className='w-8 h-8 text-[#7c5cfc] animate-spin' />
            <p className='font-sans text-sm text-[#8b89b0]'>
              AI is categorizing your transactions…
            </p>
          </>
        ) : (
          <>
            <Upload className='w-10 h-10 text-[#7c5cfc]' />
            <div className='text-center'>
              <p className='font-display text-base font-bold text-[#f0efff]'>
                Upload Bank Statement CSV
              </p>
              <p className='font-sans text-sm text-[#4a4870] mt-1'>
                CSV with Date, Description, and Amount columns
              </p>
            </div>
          </>
        )}
      </div>
      <input
        ref={fileRef}
        type='file'
        accept='.csv,text/csv'
        className='hidden'
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      {error && (
        <div
          className='flex items-center gap-2 p-3 rounded-xl'
          style={{
            background: 'rgba(255,59,92,0.08)',
            border: '1px solid rgba(255,59,92,0.2)',
          }}
        >
          <AlertCircle className='w-4 h-4 text-[#ff3b5c] shrink-0' />
          <p className='font-sans text-sm text-[#ff6b6b]'>{error}</p>
        </div>
      )}

      {preview && (
        <div className='space-y-3'>
          {/* Summary */}
          <Card
            style={{
              background: 'rgba(13,13,26,0.8)',
              border: '1px solid rgba(124,92,252,0.15)',
            }}
          >
            <CardContent className='p-4'>
              <p className='font-sans text-sm font-semibold text-[#f0efff] mb-2'>
                {preview.message}
              </p>
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <p className='font-mono text-[9px] text-[#4a4870]'>
                    Transactions
                  </p>
                  <p className='font-display text-xl font-black text-[#f0efff]'>
                    {preview.totalRows}
                  </p>
                </div>
                <div>
                  <p className='font-mono text-[9px] text-[#4a4870]'>
                    Total Amount
                  </p>
                  <p className='font-display text-xl font-black text-[#7c5cfc]'>
                    {fmt(preview.totalAmount)}
                  </p>
                </div>
              </div>
              {preview.errors.length > 0 && (
                <div
                  className='mt-3 p-2 rounded-lg'
                  style={{
                    background: 'rgba(255,59,92,0.08)',
                    border: '1px solid rgba(255,59,92,0.2)',
                  }}
                >
                  <p className='font-mono text-[9px] text-[#ff3b5c] mb-1 uppercase'>
                    Parse Errors
                  </p>
                  {preview.errors.slice(0, 3).map((e, i) => (
                    <p key={i} className='font-mono text-[10px] text-[#8b89b0]'>
                      {e}
                    </p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview rows */}
          {preview.preview.length > 0 && (
            <Card
              style={{
                background: 'rgba(13,13,26,0.8)',
                border: '1px solid rgba(124,92,252,0.12)',
              }}
            >
              <CardHeader className='pb-2 px-4 pt-4'>
                <CardTitle className='text-sm font-display text-[#f0efff]'>
                  Preview (first 10 rows)
                </CardTitle>
              </CardHeader>
              <CardContent className='px-2 pb-2'>
                <div className='overflow-x-auto'>
                  <table className='w-full border-collapse text-xs'>
                    <thead>
                      <tr
                        style={{
                          borderBottom: '1px solid rgba(124,92,252,0.1)',
                        }}
                      >
                        {['Date', 'Title', 'Category', 'Amount'].map((h) => (
                          <th
                            key={h}
                            className='px-3 py-2 text-left font-mono text-[9px] text-[#4a4870] uppercase tracking-widest'
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.preview.map((row, i) => {
                        const color =
                          CATEGORY_COLORS[row.category] ?? '#9d7fff';
                        return (
                          <tr
                            key={i}
                            style={{
                              borderBottom: '1px solid rgba(124,92,252,0.05)',
                            }}
                          >
                            <td className='px-3 py-2 font-mono text-[10px] text-[#4a4870]'>
                              {row.date}
                            </td>
                            <td className='px-3 py-2 font-sans text-[11px] text-[#f0efff] max-w-[150px] truncate'>
                              {row.title}
                            </td>
                            <td className='px-3 py-2'>
                              <span
                                className='font-mono text-[9px] px-1.5 py-0.5 rounded'
                                style={{ background: `${color}15`, color }}
                              >
                                {row.category}
                              </span>
                            </td>
                            <td
                              className='px-3 py-2 font-mono text-[11px] font-bold'
                              style={{ color }}
                            >
                              {fmt(row.amount)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Confirm button */}
          {confirmed ? (
            <div
              className='flex items-center gap-2 p-4 rounded-xl'
              style={{
                background: 'rgba(0,255,135,0.08)',
                border: '1px solid rgba(0,255,135,0.2)',
              }}
            >
              <CheckCircle2 className='w-5 h-5 text-[#00ff87]' />
              <p className='font-sans text-sm font-semibold text-[#00ff87]'>
                Import complete!
              </p>
            </div>
          ) : (
            <Button
              onClick={handleConfirm}
              disabled={confirming || preview.totalRows === 0}
              className='w-full h-11 gap-2 text-white font-display font-bold'
              style={{
                background: 'linear-gradient(135deg, #7c5cfc, #00d4ff)',
              }}
            >
              {confirming ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <FileText className='w-4 h-4' />
              )}
              {confirming
                ? 'Importing…'
                : `Import ${preview.totalRows} Transactions`}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ImportPage() {
  const [activeTab, setActiveTab] = useState<Tab>('receipt');

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'receipt', label: 'Receipt', icon: Camera },
    { id: 'bulk', label: 'Bulk Text', icon: Type },
    { id: 'csv', label: 'CSV Import', icon: FileText },
  ];

  return (
    <div
      className='flex flex-col h-full'
      style={{ background: '#080810', overflow: 'hidden' }}
    >
      <div
        className='shrink-0'
        style={{
          borderBottom: '1px solid rgba(124,92,252,0.1)',
          background: 'rgba(8,8,16,0.97)',
          backdropFilter: 'blur(20px)',
          zIndex: 10,
        }}
      >
        <div className='px-4 sm:px-8 py-4'>
          <h1 className='font-display text-xl sm:text-2xl font-extrabold text-[#f0efff] tracking-tight'>
            Import
          </h1>
          <p className='font-mono text-[10px] text-[#4a4870]'>
            AI-powered expense import tools
          </p>
        </div>
        <div className='flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide'>
          {tabs.map((t) => (
            <TabPill
              key={t.id}
              id={t.id}
              label={t.label}
              icon={t.icon}
              active={activeTab === t.id}
              onClick={() => setActiveTab(t.id)}
            />
          ))}
        </div>
      </div>

      <div
        className='flex-1 min-h-0'
        style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className='p-4 sm:p-6 pb-8 max-w-2xl mx-auto'>
          {activeTab === 'receipt' && <ReceiptTab />}
          {activeTab === 'bulk' && <BulkTextTab />}
          {activeTab === 'csv' && <CsvTab />}
        </div>
      </div>
    </div>
  );
}
